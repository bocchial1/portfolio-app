import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import './index.css'

class StockfishClient {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.ws = null;
    this.messageQueue = [];
    this.isConnected = false;
  }

  connect() {
    const wsUrl = window.location.protocol === 'https:' 
      ? `wss://${window.location.host}/ws/chess/${this.sessionId}`
      : `ws://${window.location.host}/ws/chess/${this.sessionId}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        this.sendCommand(msg);
      }
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      this.isConnected = false;
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      console.log('Received WebSocket message:', event.data);
    };
  }

  sendCommand(command) {
    if (!this.isConnected) {
      this.messageQueue.push(command);
      return;
    }
    
    this.ws.send(JSON.stringify({ command }));
  }

  async analyzePosition(fen, depth = 20, movetime = 1000) {
    const response = await fetch('/api/chess/engine/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fen,
        depth,
        movetime,
        session_id: this.sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to analyze position');
    }
    
    return await response.json();
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortfolioHome />} />
        <Route path="/home" element={<PortfolioHome />} />
        <Route path="/chess" element={<ChessProject />} />
        <Route path="/chess-project" element={<ChessProject />} />
      </Routes>
    </Router>
  )
}

function PortfolioHome() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <button className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Alex's Portfolio
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
                Welcome to My Portfolio
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Software Engineer specializing in full-stack development, with a focus on creating scalable and efficient solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Featured Projects
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chess Project Card */}
              <div 
                className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate('/chess')}
              >
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  Chess Application (AI Opponent)
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  An intelligent chess engine that analyzes positions and provides optimal moves in real-time.
                </p>
              </div>

              {/* Other Project Cards */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  AIOps Agent
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI-powered operations agent for proactive system monitoring and failure prediction.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ChessProject() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [playerColor, setPlayerColor] = useState('white');
  const [gameStarted, setGameStarted] = useState(false);
  const [stockfish] = useState(() => new StockfishClient('default'));

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    stockfish.connect();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const convertPositionToFEN = (position) => {
    if (!position || position === 'start') {
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    
    let fen = '';
    for (let rank = 8; rank >= 1; rank--) {
      let emptyCount = 0;
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + rank;
        const piece = position[square];
        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += piece;
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      if (rank > 1) {
        fen += '/';
      }
    }
    fen += ' w KQkq - 0 1';
    return fen;
  };

  const addMoveToLog = (move, isAI = false) => {
    const moveLog = document.getElementById('moveLog');
    if (!moveLog) return;

    const moveEntry = document.createElement('div');
    moveEntry.className = `flex justify-between items-center py-2 px-3 rounded mb-2 ${
      isAI ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'
    }`;
    
    const moveText = isAI ? `AI: ${move.san || move}` : `User: ${move.san || move}`;
    
    moveEntry.innerHTML = `
      <span class="text-sm font-medium text-gray-800 dark:text-white">${moveText}</span>
      <span class="text-xs text-gray-500 dark:text-gray-400">${new Date().toLocaleTimeString()}</span>
    `;
    
    if (moveLog.children.length === 1 && moveLog.children[0].textContent.includes('No moves yet')) {
      moveLog.innerHTML = '';
    }
    
    moveLog.appendChild(moveEntry);
    moveLog.scrollTop = moveLog.scrollHeight;
  };

  const clearMoveLog = () => {
    const moveLog = document.getElementById('moveLog');
    if (moveLog) {
      moveLog.innerHTML = `
        <div class="text-gray-500 dark:text-gray-400 text-sm">
          No moves yet. Start playing to see the move history.
        </div>
      `;
    }
  };

  const initializeChessboard = () => {
    if (typeof window.$ !== 'undefined' && typeof window.Chessboard !== 'undefined') {
      try {
        const board = window.Chessboard('chessboard', {
          draggable: true,
          dropOffBoard: 'trash',
          sparePieces: false,
          position: 'start',
          orientation: playerColor,
          pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
          onDrop: async (source, target, piece, newPos, oldPos, orientation) => {
            // Validation checks
            if (!gameStarted) {
              return false;
            }
            
            const fen = convertPositionToFEN(newPos);
            const currentTurn = fen.includes(' w ') ? 'white' : 'black';
            
            if (currentTurn !== playerColor) {
              return false;
            }

            // Log player move
            const move = {
              from: source,
              to: target,
              piece: piece,
              san: `${piece}${source}${target}`
            };
            addMoveToLog(move, false);

            // Get and make AI move
            try {
              const analysis = await stockfish.analyzePosition(fen);
              if (analysis.bestMove) {
                // Make AI move using the correct format
                const aiMove = {
                  from: analysis.bestMove.slice(0, 2),
                  to: analysis.bestMove.slice(2, 4),
                  promotion: analysis.bestMove.length > 4 ? analysis.bestMove[4] : undefined
                };
                
                // Update board with AI's move
                const newPosition = { ...newPos };
                const piece = newPosition[aiMove.from];
                delete newPosition[aiMove.from];
                newPosition[aiMove.to] = piece;
                board.position(newPosition, false);

                // Log AI move
                addMoveToLog({
                  ...aiMove,
                  san: analysis.bestMove,
                  eval: analysis.evaluation
                }, true);

                // Update status
                const statusDiv = document.getElementById('chessStatus');
                if (statusDiv) {
                  statusDiv.innerHTML = `
                    <div class="text-green-600 dark:text-green-400 font-semibold">
                      AI Move: ${analysis.bestMove} (Evaluation: ${analysis.evaluation})
                    </div>
                  `;
                }
              }
            } catch (error) {
              console.error('Error getting AI move:', error);
              const statusDiv = document.getElementById('chessStatus');
              if (statusDiv) {
                statusDiv.innerHTML = `
                  <div class="text-red-600 dark:text-red-400 font-semibold">
                    Error: ${error.message}
                  </div>
                `;
              }
              return false;
            }
            
            return true;
          }
        });

        const startBtn = document.getElementById('startBtn');
        const clearBtn = document.getElementById('clearBtn');
        const randomBtn = document.getElementById('randomBtn');
        const whiteBtn = document.getElementById('whiteBtn');
        const blackBtn = document.getElementById('blackBtn');

        if (startBtn) {
          startBtn.onclick = () => {
            board.start();
            clearMoveLog();
            addMoveToLog('Game started', false);
            setGameStarted(true);
          };
        }
        if (clearBtn) {
          clearBtn.onclick = () => {
            board.clear();
            clearMoveLog();
            setGameStarted(false);
          };
        }
        if (randomBtn) {
          randomBtn.onclick = () => {
            const positions = [
              'start',
              'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
              'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
              '8/8/8/8/8/8/8/8 w - - 0 1'
            ];
            const randomPosition = positions[Math.floor(Math.random() * positions.length)];
            board.position(randomPosition);
          };
        }
        if (whiteBtn) {
          whiteBtn.onclick = () => {
            setPlayerColor('white');
            board.orientation('white');
          };
        }
        if (blackBtn) {
          blackBtn.onclick = () => {
            setPlayerColor('black');
            board.orientation('black');
          };
        }
      } catch (error) {
        console.error('Error initializing chessboard:', error);
      }
    } else {
      setTimeout(initializeChessboard, 100);
    }
  };

  useEffect(() => {
    initializeChessboard();
  }, [playerColor]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <button 
                onClick={() => navigate('/')}
                className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Alex's Portfolio
              </button>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  ← Back to Portfolio
                </button>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6">
              Chess Application (AI Opponent)
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              A machine learning-powered chess engine that serves as an intelligent AI opponent, 
              analyzing complex game states to predict and execute optimal moves in real-time.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                Project Overview
              </h2>
              <div className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                <p>
                  This project is a web-based chess application, bringing a C++ chess engine I developed during my university studies to life with a modern JavaScript interface.
                </p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
              <div className="flex flex-col items-center max-w-4xl mx-auto">
                <div className="w-full max-w-[600px]">
                  <div id="chessboard" style={{ width: '100%', maxWidth: '600px' }} className="bg-white dark:bg-gray-700 rounded-lg shadow-lg">
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      Loading chess board...
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-4 flex-wrap justify-center">
                    <button 
                      id="whiteBtn" 
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        playerColor === 'white'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Play as White
                    </button>
                    <button 
                      id="blackBtn" 
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        playerColor === 'black'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Play as Black
                    </button>
                  </div>
                  <div className="mt-4 flex gap-4 justify-center">
                    <button 
                      id="startBtn" 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Position
                    </button>
                    <button 
                      id="clearBtn" 
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Clear Board
                    </button>
                    <button 
                      id="randomBtn" 
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Random Position
                    </button>
                  </div>
                  <div id="chessStatus" className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    {gameStarted 
                      ? `Your turn (playing as ${playerColor})` 
                      : 'Click Start Position to begin'}
                  </div>
                </div>

                <div className="w-full max-w-[600px] mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Move Log</h3>
                  <div id="moveLog" className="bg-white dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      No moves yet. Start playing to see the move history.
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    <button 
                      id="clearLogBtn" 
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                      onClick={clearMoveLog}
                    >
                      Clear Log
                    </button>
                    <button 
                      id="exportLogBtn" 
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Export Log
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;