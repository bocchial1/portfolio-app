"""
FastAPI Backend for Portfolio Website
This module contains the main FastAPI application with API endpoints
for serving resume data, project information, and chess functionality.
"""

import logging
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import httpx
import asyncio
import json
import websockets
import os
from websockets.exceptions import ConnectionClosed

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title="Portfolio API",
    description="API for serving portfolio data including resume, projects, and chess functionality",
    version="1.0.0"
)

# Configure CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173", "ws://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chess API configuration
CHESS_API_URL = "http://chess-mcp:8000/api/chess"

# Chess engine configuration
STOCKFISH_WS_URL = "ws://stockfish:4000"
STOCKFISH_API_TOKEN = os.getenv("STOCKFISH_API_TOKEN", "development_token")

# Websocket connection pool and management
stockfish_connections = {}
active_connections = set()

async def cleanup_connection(websocket: WebSocket, session_id: str):
    """Clean up WebSocket connection and associated resources"""
    if websocket in active_connections:
        active_connections.remove(websocket)
    
    if session_id in stockfish_connections:
        try:
            await stockfish_connections[session_id].close()
        except Exception:
            pass
        del stockfish_connections[session_id]

async def get_stockfish_connection(session_id: str) -> websockets.WebSocketClientProtocol:
    """Get or create a WebSocket connection to Stockfish"""
    try:
        if session_id not in stockfish_connections or stockfish_connections[session_id].closed:
            logger.info(f"Creating new Stockfish connection for session {session_id}")
            ws = await websockets.connect(STOCKFISH_WS_URL)
            # Authenticate with Stockfish server
            await ws.send(json.dumps({
                "type": "auth:authenticate",
                "payload": STOCKFISH_API_TOKEN
            }))
            response = await ws.recv()
            auth_response = json.loads(response)
            if auth_response["type"] != "auth:authenticated":
                logger.error(f"Authentication failed for session {session_id}")
                raise HTTPException(status_code=401, detail="Failed to authenticate with chess engine")
            stockfish_connections[session_id] = ws
            logger.info(f"Successfully authenticated with Stockfish for session {session_id}")
        return stockfish_connections[session_id]
    except Exception as e:
        logger.error(f"Error connecting to Stockfish: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Failed to connect to chess engine: {str(e)}")

async def send_uci_command(ws: websockets.WebSocketClientProtocol, command: str) -> str:
    """Send a UCI command to Stockfish and get the response"""
    try:
        logger.info(f"Sending UCI command: {command}")
        await ws.send(json.dumps({
            "type": "uci:command",
            "payload": command
        }))
        response = await ws.recv()
        response_data = json.loads(response)["payload"]
        logger.info(f"Received UCI response: {response_data}")
        return response_data
    except Exception as e:
        logger.error(f"Error sending UCI command: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to communicate with chess engine: {str(e)}")

@app.websocket("/ws/chess/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time chess communication"""
    logger.info(f"New WebSocket connection request for session {session_id}")
    await websocket.accept()
    active_connections.add(websocket)
    logger.info(f"WebSocket connection accepted for session {session_id}")
    
    try:
        stockfish = await get_stockfish_connection(session_id)
        
        while True:
            try:
                data = await websocket.receive_json()
                command = data.get("command")
                logger.info(f"Received command from client: {command}")
                
                if not command:
                    logger.warning("No command provided in WebSocket message")
                    await websocket.send_json({"error": "No command provided"})
                    continue

                response = await send_uci_command(stockfish, command)
                logger.info(f"Sending response to client: {response}")
                await websocket.send_json({"response": response})
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON format received")
                await websocket.send_json({"error": "Invalid JSON format"})
            except Exception as e:
                logger.error(f"Error processing command: {str(e)}")
                await websocket.send_json({"error": f"Command processing error: {str(e)}"})
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
        await cleanup_connection(websocket, session_id)
    except ConnectionClosed:
        logger.info(f"WebSocket connection closed for session {session_id}")
        await cleanup_connection(websocket, session_id)
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket connection: {str(e)}")
        await websocket.send_json({"error": f"Unexpected error: {str(e)}"})
        await cleanup_connection(websocket, session_id)
    finally:
        logger.info(f"Cleaning up connection for session {session_id}")
        await cleanup_connection(websocket, session_id)

@app.post("/api/chess/engine/analyze")
async def analyze_position(
    fen: str,
    depth: Optional[int] = 20,
    movetime: Optional[int] = 1000,
    session_id: str = "default"
):
    """Analyze a chess position using Stockfish"""
    logger.info(f"Analyzing position: {fen} (depth={depth}, movetime={movetime})")
    try:
        stockfish = await get_stockfish_connection(session_id)
        
        # Set up the position
        await send_uci_command(stockfish, "uci")
        await send_uci_command(stockfish, "isready")
        await send_uci_command(stockfish, f"position fen {fen}")
        
        # Start analysis
        result = await send_uci_command(stockfish, f"go depth {depth} movetime {movetime}")
        
        # Parse the response
        lines = result.strip().split('\n')
        bestmove_line = next(line for line in reversed(lines) if line.startswith("bestmove"))
        info_line = next(line for line in reversed(lines) if line.startswith("info") and "score" in line)
        
        # Extract best move and score
        bestmove = bestmove_line.split()[1]
        score = int(info_line.split("score cp")[1].split()[0]) / 100.0
        
        response_data = {
            "bestMove": bestmove,
            "evaluation": score,
            "depth": depth,
            "fen": fen
        }
        logger.info(f"Analysis complete: {response_data}")
        return response_data
        
    except Exception as e:
        logger.error(f"Error analyzing position: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chess engine error: {str(e)}")

# Pydantic models for chess requests
from pydantic import BaseModel

class ChessPositionRequest(BaseModel):
    fen: Optional[str] = None
    input: Optional[str] = None
    variants: Optional[int] = 1
    depth: Optional[int] = 12
    maxThinkingTime: Optional[int] = 50
    searchmoves: Optional[str] = ""
    taskId: Optional[str] = None

class ChessMoveRequest(BaseModel):
    fen: str
    variants: Optional[int] = 1
    depth: Optional[int] = 12
    maxThinkingTime: Optional[int] = 50
    searchmoves: Optional[str] = ""

@app.get("/api/status")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    Returns a simple status message.
    """
    return {"status": "ok"}

@app.post("/api/chess/analyze")
async def analyze_chess_position(request: ChessPositionRequest):
    """
    Analyze a chess position using the chess-mcp service.
    Accepts either FEN notation or HTML/text input with moves.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Prepare the request payload
            payload = {
                "fen": request.fen or "",
                "depth": request.depth or 12,
                "variants": request.variants or 1,
                "maxTime": request.maxThinkingTime or 50
            }
            
            # Make request to chess-mcp
            response = await client.post(
                f"{CHESS_API_URL}/analyze",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Chess engine error: {response.text}"
                )
            
            return response.json()
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout - chess analysis took too long")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to chess engine: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/chess/best-move")
async def get_best_move(request: ChessMoveRequest):
    """
    Get the best move for a given chess position.
    Simplified endpoint that focuses on getting the optimal move.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "fen": request.fen,
                "depth": request.depth or 12,
                "variants": request.variants or 1,
                "maxTime": request.maxThinkingTime or 50
            }
            
            response = await client.post(
                f"{CHESS_API_URL}/best-move",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Chess engine error: {response.text}"
                )
            
            data = response.json()
            
            # Return standardized response
            return {
                "bestMove": {
                    "move": data.get("move"),
                    "san": data.get("san"),
                    "eval": data.get("evaluation"),
                    "depth": data.get("depth"),
                    "text": data.get("explanation")
                },
                "position": {
                    "fen": request.fen,
                    "turn": "white" if "w" in request.fen else "black"
                }
            }
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout - chess analysis took too long")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to chess engine: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/chess/position-info")
async def get_position_info(fen: str):
    """
    Get basic information about a chess position.
    Quick endpoint for getting position evaluation without deep analysis.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            payload = {
                "fen": fen,
                "depth": 8,  # Lower depth for faster response
                "maxTime": 20  # Shorter thinking time
            }
            
            response = await client.post(
                f"{CHESS_API_URL}/analyze",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Chess engine error: {response.text}"
                )
            
            data = response.json()
            
            return {
                "position": {
                    "fen": fen,
                    "turn": "white" if "w" in fen else "black",
                    "eval": data.get("evaluation"),
                    "depth": data.get("depth")
                },
                "suggestedMove": {
                    "move": data.get("bestMove"),
                    "san": data.get("san"),
                    "text": data.get("explanation")
                }
            }
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to chess engine: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/resume")
async def get_resume():
    """
    Endpoint to serve professional and educational experience data.
    Returns structured JSON containing work experience and education history.
    """
    return {
        "experience": [
            {
                "title": "Tech Rotation - Software Engineer",
                "company": "Domino's Pizza",
                "dates": "July 2024 – Present",
                "description": [
                    "Develop high-quality, efficient, and scalable software solutions using Java Spring within a microservices architecture.",
                    "Collaborate with cross-functional Agile teams to evaluate and meet operational and performance requirements for new features.",
                    "Deploy and manage containerized applications on Kubernetes to ensure system reliability and scalability."
                ]
            },
            {
                "title": "IT Intern - DevOps Engineer",
                "company": "Kohler Co.",
                "dates": "May 2023 – February 2024",
                "description": [
                    "Designed and built an automated dependency management system to analyze software dependencies and identify security vulnerabilities, improving code integrity.",
                    "Utilized Maven, NPM, and Node.js to build, test, and deploy software applications in an international Agile environment.",
                    "Managed Nexus repositories to store and version software artifacts, ensuring reliable access for development teams."
                ]
            }
        ],
        "education": [
            {
                "degree": "BS in Computer Science",
                "university": "Michigan State University",
                "dates": "May, 2024",
                "description": [
                    "Awarded the AP Capstone Diploma."
                ]
            }
        ]
    }

@app.get("/api/projects")
async def get_projects():
    """
    Endpoint to serve featured projects data.
    Returns a list of project objects with title, description, and technologies used.
    """
    return [
        {
            "title": "AIOps Agent",
            "description": "Designed and implemented an AIOps agent that analyzes diverse data streams to proactively predict and mitigate system failures, ensuring high availability. Deployed the system on a dedicated MCP server, configuring a full suite of tools to ensure high availability and robust performance for in-store use. At Domino's Pizza, I worked with the team to deploy the system on a dedicated MCP server, configuring a full suite of tools to ensure high availability and robust performance for in-store use.",
            "technologies": ["Python", "AI/ML", "MCP Server", "Data Analytics", "System Monitoring"]
        },
        {
            "title": "Chess Application (AI Opponent)",
            "description": "Developed and trained a machine learning model to serve as an intelligent AI opponent, analyzing complex game states to predict and execute optimal moves in real-time. Engineered the application in C++, focusing on logical accuracy and creating a simple UI for personal use and testing.",
            "technologies": ["C++", "Machine Learning", "AI", "Game Development", "UI/UX"]
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)