"""
FastAPI Backend for Portfolio Website
This module contains the main FastAPI application with API endpoints
for serving resume data and project information.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

# Initialize FastAPI application
app = FastAPI(
    title="Portfolio API",
    description="API for serving portfolio data including resume and projects",
    version="1.0.0"
)

# Configure CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://frontend:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    Returns a simple status message.
    """
    return {"status": "ok"}

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
            "title": "E-Commerce Platform",
            "description": "A full-featured online store with payment gateway integration and a custom admin dashboard.",
            "technologies": ["React", "Node.js", "PostgreSQL", "Stripe API"]
        },
        {
            "title": "Data Visualization Dashboard",
            "description": "An interactive dashboard for visualizing real-time analytics using D3.js.",
            "technologies": ["React", "D3.js", "FastAPI", "WebSocket"]
        },
        {
            "title": "Mobile Fitness App",
            "description": "A cross-platform mobile app for tracking workouts and nutrition.",
            "technologies": ["React Native", "Firebase", "GraphQL"]
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)