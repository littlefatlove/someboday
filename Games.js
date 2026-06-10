function TicTacToe({ onBack, onGameEnd }) {
    const [board, setBoard] = React.useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = React.useState(true);
    const [winner, setWinner] = React.useState(null);

    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6],
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleClick = (i) => {
        if (winner || board[i]) return;
        const newBoard = [...board];
        newBoard[i] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);
        const win = calculateWinner(newBoard);
        setWinner(win);
        if (win || newBoard.every(Boolean)) {
            if (onGameEnd) onGameEnd();
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
        setWinner(null);
    };

    const isDraw = !winner && board.every(Boolean);

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in w-full">
            <div className="flex items-center w-full max-w-md mb-8 justify-center relative">
                <button onClick={onBack} className="absolute left-0 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <div className="icon-arrow-left text-xl"></div>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">井字遊戲</h2>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="mb-6 text-center">
                    {winner ? (
                        <div className="text-2xl font-bold text-[var(--primary-color)] animate-bounce">
                            🎉 玩家 {winner} 獲勝！
                        </div>
                    ) : isDraw ? (
                        <div className="text-2xl font-bold text-gray-500">
                            🤝 平局！
                        </div>
                    ) : (
                        <div className="text-xl font-medium text-gray-600">
                            輪到: <span className="font-bold text-[var(--primary-color)]">{xIsNext ? 'X' : 'O'}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                    {board.map((square, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className={`w-20 h-20 rounded-xl text-4xl font-bold flex items-center justify-center transition-all ${
                                square 
                                ? square === 'X' ? 'bg-blue-50 text-blue-500' : 'bg-rose-50 text-rose-500'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                            }`}
                        >
                            {square}
                        </button>
                    ))}
                </div>

                <button
                    onClick={resetGame}
                    className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
                >
                    重新開始
                </button>
            </div>
        </div>
    );
}

function RockPaperScissors({ onBack, onGameEnd }) {
    const [playerChoice, setPlayerChoice] = React.useState(null);
    const [computerChoice, setComputerChoice] = React.useState(null);
    const [result, setResult] = React.useState(null);
    const [score, setScore] = React.useState({ player: 0, computer: 0 });
    const [isAnimating, setIsAnimating] = React.useState(false);

    const choices = [
        { id: 'rock', icon: '✊', name: '石頭' },
        { id: 'paper', icon: '✋', name: '布' },
        { id: 'scissors', icon: '✌️', name: '剪刀' }
    ];

    const play = (choice) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setPlayerChoice(choice);
        setComputerChoice(null);
        setResult(null);

        // Simulate computer thinking
        setTimeout(() => {
            const random = Math.floor(Math.random() * 3);
            const compChoice = choices[random];
            setComputerChoice(compChoice);

            let res = '';
            if (choice.id === compChoice.id) {
                res = 'draw';
            } else if (
                (choice.id === 'rock' && compChoice.id === 'scissors') ||
                (choice.id === 'paper' && compChoice.id === 'rock') ||
                (choice.id === 'scissors' && compChoice.id === 'paper')
            ) {
                res = 'win';
                setScore(s => ({ ...s, player: s.player + 1 }));
            } else {
                res = 'lose';
                setScore(s => ({ ...s, computer: s.computer + 1 }));
            }
            setResult(res);
            setIsAnimating(false);
            if (onGameEnd) onGameEnd();
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in w-full">
            <div className="flex items-center w-full max-w-md mb-8 justify-center relative">
                <button onClick={onBack} className="absolute left-0 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <div className="icon-arrow-left text-xl"></div>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">猜拳遊戲</h2>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg">
                <div className="flex justify-between mb-8 px-8">
                    <div className="text-center">
                        <div className="text-xs text-gray-400 font-bold mb-1">你</div>
                        <div className="text-3xl font-bold text-[var(--primary-color)]">{score.player}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400 font-bold mb-1">電腦</div>
                        <div className="text-3xl font-bold text-gray-600">{score.computer}</div>
                    </div>
                </div>

                <div className="flex justify-center items-center space-x-8 mb-10 h-32">
                    <div className={`text-6xl transition-transform ${isAnimating ? 'animate-bounce' : ''}`}>
                        {playerChoice ? playerChoice.icon : '❔'}
                    </div>
                    <div className="text-2xl font-bold text-gray-300">VS</div>
                    <div className={`text-6xl transition-transform ${isAnimating ? 'animate-bounce' : ''}`}>
                        {computerChoice ? computerChoice.icon : '❔'}
                    </div>
                </div>

                {result && (
                    <div className={`text-center mb-8 text-2xl font-bold animate-scale-in ${
                        result === 'win' ? 'text-emerald-500' : 
                        result === 'lose' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                        {result === 'win' ? '🎉 你贏了！' : 
                         result === 'lose' ? '😢 你輸了...' : '🤝 平手！'}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                    {choices.map(c => (
                        <button
                            key={c.id}
                            onClick={() => play(c)}
                            disabled={isAnimating}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-[var(--secondary-color)] border border-gray-200 hover:border-[var(--primary-color)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{c.icon}</span>
                            <span className="text-sm font-bold text-gray-600 group-hover:text-[var(--primary-color)]">{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MemoryMatch({ onBack, onGameEnd }) {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const [cards, setCards] = React.useState([]);
    const [flipped, setFlipped] = React.useState([]);
    const [solved, setSolved] = React.useState([]);
    const [disabled, setDisabled] = React.useState(false);
    const [moves, setMoves] = React.useState(0);

    React.useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        const shuffled = [...emojis, ...emojis]
            .sort(() => Math.random() - 0.5)
            .map((emoji, index) => ({ id: index, emoji }));
        setCards(shuffled);
        setFlipped([]);
        setSolved([]);
        setMoves(0);
        setDisabled(false);
    };

    const handleClick = (id) => {
        if (disabled || flipped.includes(id) || solved.includes(id)) return;

        if (flipped.length === 0) {
            setFlipped([id]);
            return;
        }

        if (flipped.length === 1) {
            setDisabled(true);
            setFlipped([...flipped, id]);
            setMoves(m => m + 1);

            const firstCard = cards.find(c => c.id === flipped[0]);
            const secondCard = cards.find(c => c.id === id);

            if (firstCard.emoji === secondCard.emoji) {
                const newSolved = [...solved, firstCard.id, secondCard.id];
                setSolved(newSolved);
                setFlipped([]);
                setDisabled(false);
                if (newSolved.length === cards.length && onGameEnd) {
                    onGameEnd();
                }
            } else {
                setTimeout(() => {
                    setFlipped([]);
                    setDisabled(false);
                }, 1000);
            }
        }
    };

    const isWon = solved.length === cards.length && cards.length > 0;

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in w-full">
            <div className="flex items-center w-full max-w-md mb-8 justify-center relative">
                <button onClick={onBack} className="absolute left-0 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <div className="icon-arrow-left text-xl"></div>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">記憶配對</h2>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <div className="text-gray-500 font-bold">步數: {moves}</div>
                    <button onClick={resetGame} className="text-[var(--primary-color)] hover:bg-green-50 px-3 py-1 rounded-lg transition-colors font-bold text-sm">
                        重新開始
                    </button>
                </div>

                {isWon ? (
                     <div className="text-center py-10 animate-scale-in">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">恭喜獲勝！</h3>
                        <p className="text-gray-500 mb-6">你總共用了 {moves} 步</p>
                        <button 
                            onClick={resetGame}
                            className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-[var(--primary-hover)] transition-all font-bold"
                        >
                            再玩一次
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-3">
                        {cards.map(card => (
                            <button
                                key={card.id}
                                onClick={() => handleClick(card.id)}
                                className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all transform duration-300 ${
                                    flipped.includes(card.id) || solved.includes(card.id)
                                    ? 'bg-[var(--secondary-color)] rotate-0 scale-100'
                                    : 'bg-gray-200 text-transparent rotate-180 hover:bg-gray-300'
                                }`}
                                disabled={disabled || solved.includes(card.id)}
                            >
                                {(flipped.includes(card.id) || solved.includes(card.id)) ? card.emoji : '?'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function WhackAMole({ onBack, onGameEnd }) {
    const [moles, setMoles] = React.useState(Array(9).fill(false));
    const [score, setScore] = React.useState(0);
    const [timeLeft, setTimeLeft] = React.useState(30);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const timerRef = React.useRef(null);
    const moleTimerRef = React.useRef(null);

    React.useEffect(() => {
        return () => stopGame();
    }, []);

    const startGame = () => {
        if (isPlaying) return;
        setScore(0);
        setTimeLeft(30);
        setIsPlaying(true);
        setMoles(Array(9).fill(false));

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        showMole();
    };

    const stopGame = () => {
        setIsPlaying(false);
        clearInterval(timerRef.current);
        clearTimeout(moleTimerRef.current);
        setMoles(Array(9).fill(false));
        if (onGameEnd) onGameEnd();
    };

    const showMole = () => {
        if (!isPlaying && timeLeft <= 0) return;
        
        const randomTime = Math.floor(Math.random() * 800) + 400;
        const randomHole = Math.floor(Math.random() * 9);

        setMoles(prev => {
            const newMoles = Array(9).fill(false);
            newMoles[randomHole] = true;
            return newMoles;
        });

        moleTimerRef.current = setTimeout(() => {
            if (timeLeft > 0) showMole();
        }, randomTime);
    };

    const whack = (index) => {
        if (!moles[index] || !isPlaying) return;
        
        setScore(s => s + 1);
        setMoles(prev => {
            const newMoles = [...prev];
            newMoles[index] = false;
            return newMoles;
        });
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in w-full">
            <div className="flex items-center w-full max-w-md mb-8 justify-center relative">
                <button onClick={onBack} className="absolute left-0 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <div className="icon-arrow-left text-xl"></div>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">打地鼠</h2>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg text-center">
                <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl">
                    <div className="text-center">
                        <div className="text-xs text-gray-400 font-bold uppercase">分數</div>
                        <div className="text-3xl font-bold text-[var(--primary-color)]">{score}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400 font-bold uppercase">時間</div>
                        <div className={`text-3xl font-bold ${timeLeft < 10 ? 'text-red-500' : 'text-gray-700'}`}>{timeLeft}s</div>
                    </div>
                </div>

                {!isPlaying && timeLeft === 0 ? (
                    <div className="mb-6 animate-scale-in">
                        <div className="text-4xl mb-2">🏁</div>
                        <h3 className="text-xl font-bold text-gray-800">遊戲結束</h3>
                        <p className="text-gray-500 mb-4">最終得分: {score}</p>
                        <button 
                            onClick={startGame}
                            className="px-8 py-3 bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all font-bold"
                        >
                            再玩一次
                        </button>
                    </div>
                ) : !isPlaying ? (
                    <div className="mb-6">
                        <div className="text-6xl mb-4">🐹</div>
                        <button 
                            onClick={startGame}
                            className="px-8 py-3 bg-[var(--primary-color)] text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-[var(--primary-hover)] transition-all font-bold text-lg"
                        >
                            開始遊戲
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {moles.map((isMole, i) => (
                            <button
                                key={i}
                                onClick={() => whack(i)}
                                className={`aspect-square rounded-full bg-gray-200 relative overflow-hidden transition-all active:scale-95 border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 ${
                                    isMole ? 'cursor-pointer' : 'cursor-default'
                                }`}
                            >
                                {isMole && (
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
                                        🐹
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SuperRunner({ onBack, onGameEnd }) {
    const canvasRef = React.useRef(null);
    const [gameState, setGameState] = React.useState('start'); 
    const [score, setScore] = React.useState(0);
    
    // Game constants
    const CANVAS_WIDTH = 400; 
    const CANVAS_HEIGHT = 600;
    const GRAVITY = 0.5;
    const JUMP_FORCE = -12;
    const PLAYER_SIZE = 25;
    const PLATFORM_WIDTH = 70;
    const PLATFORM_HEIGHT = 15;
    const ACCEL = 0.5;
    const MAX_SPEED = 6;
    const FRICTION = 0.8;

    // Game state refs
    const stateRef = React.useRef({
        player: { x: 180, y: 500, vx: 0, vy: 0 },
        platforms: [],
        cameraY: 0,
        score: 0,
        keys: {}
    });
    const animationFrameRef = React.useRef();

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            stateRef.current.keys[e.code] = true;
        };
        const handleKeyUp = (e) => {
            stateRef.current.keys[e.code] = false;
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const initGame = () => {
        // Initial platforms
        const platforms = [];
        // Start platform
        platforms.push({ x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2, y: CANVAS_HEIGHT - 50, w: PLATFORM_WIDTH, h: PLATFORM_HEIGHT });
        
        // Generate random platforms up to screen height initially
        let y = CANVAS_HEIGHT - 150;
        while (y > 0) {
            platforms.push({
                x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
                y: y,
                w: PLATFORM_WIDTH,
                h: PLATFORM_HEIGHT
            });
            y -= 100 + Math.random() * 40;
        }

        stateRef.current = {
            player: { x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, y: CANVAS_HEIGHT - 200, vx: 0, vy: JUMP_FORCE },
            platforms: platforms,
            cameraY: 0,
            score: 0,
            keys: {} // Reset keys
        };
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        initGame();
        gameLoop();
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const state = stateRef.current;
        const { player } = state;

        // --- Update ---

        // Input
        if (state.keys['ArrowLeft']) {
            player.vx -= ACCEL;
        } else if (state.keys['ArrowRight']) {
            player.vx += ACCEL;
        } else {
            player.vx *= FRICTION;
        }

        // Clamp speed
        if (player.vx > MAX_SPEED) player.vx = MAX_SPEED;
        if (player.vx < -MAX_SPEED) player.vx = -MAX_SPEED;

        // Physics
        player.vy += GRAVITY;
        player.x += player.vx;
        player.y += player.vy;

        // Screen wrapping (Left <-> Right)
        if (player.x + PLAYER_SIZE < 0) {
            player.x = CANVAS_WIDTH;
        } else if (player.x > CANVAS_WIDTH) {
            player.x = -PLAYER_SIZE;
        }

        // Platform Collision (Only when falling)
        if (player.vy > 0) {
            state.platforms.forEach(p => {
                if (
                    player.x + PLAYER_SIZE * 0.8 > p.x &&
                    player.x + PLAYER_SIZE * 0.2 < p.x + p.w &&
                    player.y + PLAYER_SIZE > p.y &&
                    player.y + PLAYER_SIZE < p.y + p.h + 20 // increased tolerance
                ) {
                    // Bounce
                    player.vy = JUMP_FORCE;
                }
            });
        }

        // Camera scroll (Move platforms down relative to player)
        // If player goes above 1/2 screen, move everything down
        if (player.y < CANVAS_HEIGHT / 2) {
            const diff = CANVAS_HEIGHT / 2 - player.y;
            player.y = CANVAS_HEIGHT / 2;
            state.score += Math.floor(diff);
            setScore(state.score);
            
            // Move platforms
            state.platforms.forEach(p => p.y += diff);
            
            // Remove old platforms
            state.platforms = state.platforms.filter(p => p.y < CANVAS_HEIGHT + 50);

            // Add new platforms
            const highestPlatformY = Math.min(...state.platforms.map(p => p.y));
            if (highestPlatformY > 50) {
                state.platforms.push({
                    x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
                    y: highestPlatformY - (90 + Math.random() * 50),
                    w: PLATFORM_WIDTH,
                    h: PLATFORM_HEIGHT
                });
            }
        }

        // Game Over Check (Fall off screen bottom)
        if (player.y > CANVAS_HEIGHT) {
            setGameState('gameover');
            if (onGameEnd) onGameEnd();
            return;
        }

        // --- Draw ---
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Background Grid
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 2;
        const gridSize = 40;
        const offset = state.score % gridSize;
        ctx.beginPath();
        for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
        }
        for (let y = offset; y <= CANVAS_HEIGHT; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
        }
        ctx.stroke();

        // Platforms
        ctx.fillStyle = '#10b981';
        state.platforms.forEach(p => {
            ctx.beginPath();
            ctx.roundRect(p.x, p.y, p.w, p.h, 6);
            ctx.fill();
            // Platform top highlight
            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.roundRect(p.x, p.y, p.w, 4, 2);
            ctx.fill();
            ctx.fillStyle = '#10b981'; // Reset
        });

        // Player
        ctx.save();
        ctx.translate(player.x + PLAYER_SIZE/2, player.y + PLAYER_SIZE/2);
        
        // Rotate player slightly based on X velocity
        ctx.rotate((player.vx * 5) * Math.PI / 180);
        
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        // Simple body
        ctx.roundRect(-PLAYER_SIZE/2, -PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE, 8);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = 'white';
        const eyeOffset = player.vx > 0 ? 2 : player.vx < 0 ? -2 : 0;
        ctx.beginPath();
        ctx.arc(-5 + eyeOffset, -5, 4, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffset, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-5 + eyeOffset, -5, 1.5, 0, Math.PI * 2);
        ctx.arc(5 + eyeOffset, -5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Touch controls helpers
    const handleTouchStart = (direction) => {
        stateRef.current.keys[direction === 'left' ? 'ArrowLeft' : 'ArrowRight'] = true;
    };
    const handleTouchEnd = (direction) => {
        stateRef.current.keys[direction === 'left' ? 'ArrowLeft' : 'ArrowRight'] = false;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in w-full select-none">
            <div className="flex items-center w-full max-w-md mb-6 justify-center relative">
                <button onClick={onBack} className="absolute left-0 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <div className="icon-arrow-left text-xl"></div>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">超級跳跳樂</h2>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 relative">
                <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={600} 
                    className="bg-sky-50 rounded-xl w-full max-w-[400px] h-auto border border-gray-100 touch-none"
                ></canvas>
                
                {/* HUD */}
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur px-4 py-2 rounded-xl font-bold text-xl text-gray-700 shadow-sm border border-gray-100 flex items-center">
                    <span className="text-yellow-500 mr-2">⭐</span> {Math.floor(score / 10)}
                </div>

                {gameState !== 'playing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm p-4 z-10">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-scale-in max-w-xs w-full">
                            {gameState === 'gameover' && (
                                <div className="mb-4">
                                    <div className="text-5xl mb-2">😵</div>
                                    <h3 className="text-2xl font-bold text-gray-800">遊戲結束</h3>
                                    <p className="text-gray-500 font-bold text-lg mt-1">得分: {Math.floor(score / 10)}</p>
                                </div>
                            )}
                            {gameState === 'start' && (
                                <div className="mb-6">
                                    <div className="text-5xl mb-3 animate-bounce">⬆️</div>
                                    <h3 className="text-2xl font-bold text-gray-800">超級跳跳樂</h3>
                                    <p className="text-gray-500 mt-2 text-sm">
                                        控制角色左右移動，<br/>踩著綠色平台不斷往上跳！
                                    </p>
                                    <div className="flex justify-center space-x-2 mt-3 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                                        <span>💻 鍵盤左右鍵</span>
                                        <span className="text-gray-300">|</span>
                                        <span>📱 點擊螢幕兩側</span>
                                    </div>
                                </div>
                            )}
                            <button 
                                onClick={startGame}
                                className="w-full px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl shadow-lg hover:bg-[var(--primary-hover)] transition-all font-bold text-lg"
                            >
                                {gameState === 'start' ? '開始遊戲' : '再玩一次'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Mobile Controls / Info */}
            <div className="mt-6 w-full max-w-[400px] flex justify-between px-4 md:hidden">
                <button 
                    className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center active:bg-[var(--primary-color)] active:text-white transition-colors shadow-sm touch-none select-none"
                    onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
                    onMouseDown={() => handleTouchStart('left')}
                    onMouseUp={() => handleTouchEnd('left')}
                >
                    <div className="icon-arrow-left text-3xl"></div>
                </button>
                <button 
                    className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center active:bg-[var(--primary-color)] active:text-white transition-colors shadow-sm touch-none select-none"
                    onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
                    onMouseDown={() => handleTouchStart('right')}
                    onMouseUp={() => handleTouchEnd('right')}
                >
                    <div className="icon-arrow-right text-3xl"></div>
                </button>
            </div>
            
            <p className="mt-4 text-gray-400 text-sm hidden md:block">
                使用 <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">←</span> <span className="font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">→</span> 控制方向
            </p>
        </div>
    );
}

function SnakeGame({ onBack, onGameEnd }) {
    const canvasRef = React.useRef(null);
    const [gameState, setGameState] = React.useState('start');
    const [score, setScore] = React.useState(0);
    
    // Config
    const GRID_SIZE = 20;
    const CANVAS_SIZE = 400;
    const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;
    const SPEED = 100;

    const stateRef = React.useRef({
        snake: [{x: 10, y: 10}],
        velocity: {x: 0, y: 0},
        food: {x: 15, y: 15},
        score: 0,
        nextVelocity: {x: 0, y: 0}
    });
    
    const gameLoopRef = React.useRef();

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            const { velocity, nextVelocity } = stateRef.current;
            switch(e.key) {
                case 'ArrowUp':
                    if (velocity.y === 1) break;
                    stateRef.current.nextVelocity = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    if (velocity.y === -1) break;
                    stateRef.current.nextVelocity = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    if (velocity.x === 1) break;
                    stateRef.current.nextVelocity = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    if (velocity.x === -1) break;
                    stateRef.current.nextVelocity = {x: 1, y: 0};
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, []);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        stateRef.current = {
            snake: [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}],
            velocity: {x: 0, y: -1},
            nextVelocity: {x: 0, y: -1},
            food: {x: 5, y: 5},
            score: 0
        };
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(update, SPEED);
    };

    const update = () => {
        if (!canvasRef.current) return;
        const state = stateRef.current;
        const ctx = canvasRef.current.getContext('2d');
        
        // Update Velocity
        state.velocity = state.nextVelocity;

        // Move Snake
        const head = {
            x: state.snake[0].x + state.velocity.x,
            y: state.snake[0].y + state.velocity.y
        };

        // Wall Collision
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
            gameOver();
            return;
        }

        // Self Collision
        for (let i = 0; i < state.snake.length; i++) {
            if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
                gameOver();
                return;
            }
        }

        state.snake.unshift(head);

        // Food Collision
        if (head.x === state.food.x && head.y === state.food.y) {
            state.score += 10;
            setScore(state.score);
            // Spawn new food
            let newFood;
            do {
                newFood = {
                    x: Math.floor(Math.random() * TILE_COUNT),
                    y: Math.floor(Math.random() * TILE_COUNT)
                };
            } while (state.snake.some(s => s.x === newFood.x && s.y === newFood.y));
            state.food = newFood;
        } else {
            state.snake.pop();
        }

        draw(ctx, state);
    };

    const draw = (ctx, state) => {
        // Clear
        ctx.fillStyle = '#f0fdf4';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw Food
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(state.food.x * GRID_SIZE, state.food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2, 4);
        ctx.fill();

        // Draw Snake
        ctx.fillStyle = '#10b981';
        state.snake.forEach((part, i) => {
            if (i === 0) ctx.fillStyle = '#059669'; // Head color
            else ctx.fillStyle = '#10b981';
            
            ctx.beginPath();
            ctx.roundRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2, 4);
            ctx.fill();
        });
    };

    const gameOver = () => {
        clearInterval(gameLoopRef.current);
        setGameState('gameover');
        if (onGameEnd) onGameEnd();
    };

    // Controls for buttons
    const handleDir = (dx, dy) => {
        const { velocity } = stateRef.current;
        if (dx === 1 && velocity.x === -1) return;
        if (dx === -1 && velocity.x === 1) return;
        if (dy === 1 && velocity.y === -1) return;
        if (dy === -1 && velocity.y === 1) return;
        
        stateRef.current.nextVelocity = {x: dx, y: dy};
    };

    return (
        <div className="flex flex-col items-center justify-center h-full animate-fade-in w-full select-none">
            <div className="flex items-center w-full max-w-md mb-6 justify-center relative">
                <button onClick={onBack} className="absolute left-0 p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <div className="icon-arrow-left text-xl"></div>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">貪食蛇</h2>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 relative">
                <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={400} 
                    className="bg-green-50 rounded-xl w-full max-w-[400px] h-auto border border-gray-100"
                ></canvas>
                
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-3 py-1 rounded-lg font-bold text-gray-700 shadow-sm border border-gray-100">
                    得分: {score}
                </div>

                {gameState !== 'playing' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm p-4 z-10">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center animate-scale-in max-w-xs w-full">
                            {gameState === 'gameover' && (
                                <div className="mb-4">
                                    <div className="text-5xl mb-2">🐍</div>
                                    <h3 className="text-2xl font-bold text-gray-800">遊戲結束</h3>
                                    <p className="text-gray-500">最終得分: {score}</p>
                                </div>
                            )}
                            {gameState === 'start' && (
                                <div className="mb-6">
                                    <div className="text-5xl mb-2">🐍</div>
                                    <h3 className="text-2xl font-bold text-gray-800">貪食蛇</h3>
                                    <p className="text-gray-500 mt-2 text-sm">吃掉蘋果變長，<br/>小心別撞到自己或牆壁！</p>
                                </div>
                            )}
                            <button 
                                onClick={startGame}
                                className="w-full px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl shadow-lg hover:bg-[var(--primary-hover)] transition-all font-bold text-lg"
                            >
                                {gameState === 'start' ? '開始遊戲' : '再玩一次'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Controls */}
            <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
                <div></div>
                <button 
                    className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center active:bg-[var(--primary-color)] active:text-white"
                    onClick={() => handleDir(0, -1)}
                >
                    <div className="icon-arrow-up text-2xl"></div>
                </button>
                <div></div>
                <button 
                    className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center active:bg-[var(--primary-color)] active:text-white"
                    onClick={() => handleDir(-1, 0)}
                >
                    <div className="icon-arrow-left text-2xl"></div>
                </button>
                <button 
                    className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center active:bg-[var(--primary-color)] active:text-white"
                    onClick={() => handleDir(0, 1)}
                >
                    <div className="icon-arrow-down text-2xl"></div>
                </button>
                <button 
                    className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center active:bg-[var(--primary-color)] active:text-white"
                    onClick={() => handleDir(1, 0)}
                >
                    <div className="icon-arrow-right text-2xl"></div>
                </button>
            </div>
        </div>
    );
}

function Games({ updateUserPoints }) {
    const [activeGame, setActiveGame] = React.useState(null);

    const handleGameEnd = (gameName) => {
        if (updateUserPoints) {
            updateUserPoints(0.2, `遊玩 ${gameName}`);
        }
    };

    if (activeGame === 'tictactoe') return <TicTacToe onBack={() => setActiveGame(null)} onGameEnd={() => handleGameEnd('井字遊戲')} />;
    if (activeGame === 'rps') return <RockPaperScissors onBack={() => setActiveGame(null)} onGameEnd={() => handleGameEnd('猜拳遊戲')} />;
    if (activeGame === 'memory') return <MemoryMatch onBack={() => setActiveGame(null)} onGameEnd={() => handleGameEnd('記憶配對')} />;
    if (activeGame === 'whack') return <WhackAMole onBack={() => setActiveGame(null)} onGameEnd={() => handleGameEnd('打地鼠')} />;
    if (activeGame === 'runner') return <SuperRunner onBack={() => setActiveGame(null)} onGameEnd={() => handleGameEnd('超級跳跳樂')} />;
    if (activeGame === 'snake') return <SnakeGame onBack={() => setActiveGame(null)} onGameEnd={() => handleGameEnd('貪食蛇')} />;

    return (
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <div className="icon-gamepad-2 mr-3 text-[var(--primary-color)]"></div>
                        遊戲中心
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        onClick={() => setActiveGame('runner')}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform">
                            ⬆️
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">超級跳跳樂</h3>
                        <p className="text-sm text-gray-500">踩著平台不斷往上跳，小心不要掉下去！</p>
                        <div className="mt-4 flex items-center text-[var(--primary-color)] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            開始遊戲 <div className="icon-arrow-right ml-1"></div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveGame('snake')}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform">
                            🐍
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">貪食蛇</h3>
                        <p className="text-sm text-gray-500">吃得越多越長，小心別撞到自己！</p>
                        <div className="mt-4 flex items-center text-[var(--primary-color)] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            開始遊戲 <div className="icon-arrow-right ml-1"></div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveGame('tictactoe')}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform">
                            ⭕
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">井字遊戲</h3>
                        <p className="text-sm text-gray-500">經典的 3x3 策略遊戲，考驗你的智慧。</p>
                        <div className="mt-4 flex items-center text-[var(--primary-color)] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            開始遊戲 <div className="icon-arrow-right ml-1"></div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveGame('rps')}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform">
                            ✌️
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">猜拳遊戲</h3>
                        <p className="text-sm text-gray-500">剪刀、石頭、布！試試你的運氣。</p>
                        <div className="mt-4 flex items-center text-[var(--primary-color)] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            開始遊戲 <div className="icon-arrow-right ml-1"></div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveGame('memory')}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform">
                            🎴
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">記憶配對</h3>
                        <p className="text-sm text-gray-500">考驗你的記憶力，找出相同的卡片。</p>
                        <div className="mt-4 flex items-center text-[var(--primary-color)] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            開始遊戲 <div className="icon-arrow-right ml-1"></div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveGame('whack')}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4 text-4xl group-hover:scale-110 transition-transform">
                            🔨
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">打地鼠</h3>
                        <p className="text-sm text-gray-500">反應要快！看到地鼠就用力敲下去。</p>
                        <div className="mt-4 flex items-center text-[var(--primary-color)] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            開始遊戲 <div className="icon-arrow-right ml-1"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}