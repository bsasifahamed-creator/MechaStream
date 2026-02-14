// Local fallback code templates when AI services are unavailable
export interface LocalTemplate {
  html: string;
  explanation: string;
}

export const LOCAL_TEMPLATES: Record<string, LocalTemplate> = {
  chatbot: {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Chatbot</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-8">Simple Chatbot</h1>

        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <div id="chat-messages" class="h-96 overflow-y-auto mb-4 p-4 border rounded bg-gray-50">
                <div class="message bot-message mb-4">
                    <div class="bg-blue-100 text-blue-800 p-3 rounded-lg">
                        Hello! I'm your simple chatbot. How can I help you today?
                    </div>
                </div>
            </div>

            <div class="flex gap-2">
                <input type="text" id="user-input"
                       class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="Type your message...">
                <button onclick="sendMessage()"
                        class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Send
                </button>
            </div>
        </div>
    </div>

    <script>
        // Simple chatbot responses (in-memory data)
        const RESPONSES = {
            greetings: ['Hello!', 'Hi there!', 'Hey!', 'Greetings!', 'Good day!'],
            how_are_you: ['I\'m doing well, thank you!', 'I\'m great!', 'Feeling good!', 'All systems operational!'],
            goodbye: ['Goodbye!', 'See you later!', 'Farewell!', 'Take care!', 'Bye!'],
            thanks: ['You\'re welcome!', 'My pleasure!', 'Happy to help!', 'Anytime!'],
            default: ['That\'s interesting!', 'Tell me more!', 'I see!', 'How can I help?', 'What else?']
        };

        function getBotResponse(message) {
            const msg = message.toLowerCase();

            if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('greetings')) {
                return RESPONSES.greetings[Math.floor(Math.random() * RESPONSES.greetings.length)];
            } else if (msg.includes('how are you') || msg.includes('how do you do') || msg.includes('how\'s it going')) {
                return RESPONSES.how_are_you[Math.floor(Math.random() * RESPONSES.how_are_you.length)];
            } else if (msg.includes('bye') || msg.includes('goodbye') || msg.includes('see you') || msg.includes('farewell')) {
                return RESPONSES.goodbye[Math.floor(Math.random() * RESPONSES.goodbye.length)];
            } else if (msg.includes('thank') || msg.includes('thanks')) {
                return RESPONSES.thanks[Math.floor(Math.random() * RESPONSES.thanks.length)];
            } else {
                return RESPONSES.default[Math.floor(Math.random() * RESPONSES.default.length)];
            }
        }

        function sendMessage() {
            const input = document.getElementById('user-input');
            const message = input.value.trim();
            if (!message) return;

            // Add user message
            addMessage(message, 'user');
            input.value = '';

            // Get bot response
            const botResponse = getBotResponse(message);
            setTimeout(() => addMessage(botResponse, 'bot'), 500); // Small delay for realism
        }

        function addMessage(text, sender) {
            const messages = document.getElementById('chat-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message mb-4';

            if (sender === 'user') {
                messageDiv.innerHTML = \`<div class="bg-blue-500 text-white p-3 rounded-lg ml-auto max-w-xs">\${text}</div>\`;
            } else {
                messageDiv.innerHTML = \`<div class="bg-gray-200 text-gray-800 p-3 rounded-lg mr-auto max-w-xs">\${text}</div>\`;
            }

            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        }

        // Enter key support
        document.getElementById('user-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    </script>
</body>
</html>`,
    explanation: 'Generated a pure HTML/JavaScript chatbot that runs entirely in the browser with no backend dependencies.'
  },

  calculator: {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com">
    <title>Simple Calculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .calculator {
            max-width: 300px;
            margin: 0 auto;
        }
        .display {
            background-color: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 10px;
            text-align: right;
            font-size: 24px;
            font-family: monospace;
        }
        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
        }
        .btn {
            padding: 15px;
            font-size: 18px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .btn:hover {
            opacity: 0.8;
        }
        .number {
            background-color: #007bff;
            color: white;
        }
        .operator {
            background-color: #28a745;
            color: white;
        }
        .equals {
            background-color: #dc3545;
            color: white;
            grid-column: span 2;
        }
        .clear {
            background-color: #6c757d;
            color: white;
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="calculator bg-white p-6 rounded-lg shadow-lg">
        <div id="display" class="display">0</div>
        <div class="buttons">
            <button class="btn clear" onclick="clearDisplay()">C</button>
            <button class="btn operator" onclick="appendToDisplay('/')">/</button>
            <button class="btn operator" onclick="appendToDisplay('*')">*</button>
            <button class="btn operator" onclick="appendToDisplay('-')">-</button>

            <button class="btn number" onclick="appendToDisplay('7')">7</button>
            <button class="btn number" onclick="appendToDisplay('8')">8</button>
            <button class="btn number" onclick="appendToDisplay('9')">9</button>
            <button class="btn operator" onclick="appendToDisplay('+')">+</button>

            <button class="btn number" onclick="appendToDisplay('4')">4</button>
            <button class="btn number" onclick="appendToDisplay('5')">5</button>
            <button class="btn number" onclick="appendToDisplay('6')">6</button>
            <button class="btn equals" onclick="calculate()">=</button>

            <button class="btn number" onclick="appendToDisplay('1')">1</button>
            <button class="btn number" onclick="appendToDisplay('2')">2</button>
            <button class="btn number" onclick="appendToDisplay('3')">3</button>

            <button class="btn number" onclick="appendToDisplay('0')" style="grid-column: span 2;">0</button>
            <button class="btn number" onclick="appendToDisplay('.')">.</button>
        </div>
    </div>

    <script>
        let display = document.getElementById('display');
        let currentInput = '0';

        function updateDisplay() {
            display.textContent = currentInput;
        }

        function appendToDisplay(value) {
            if (currentInput === '0' || currentInput === 'Error') {
                currentInput = value;
            } else {
                currentInput += value;
            }
            updateDisplay();
        }

        function clearDisplay() {
            currentInput = '0';
            updateDisplay();
        }

        // Safe calculator function without eval
        function calculate() {
            try {
                const result = safeEvaluate(currentInput);
                currentInput = result.toString();
                updateDisplay();
            } catch (error) {
                currentInput = 'Error';
                updateDisplay();
            }
        }

        function safeEvaluate(expression) {
            // Remove any dangerous characters
            const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

            // Simple recursive descent parser for basic arithmetic
            return evaluateExpression(sanitized);
        }

        function evaluateExpression(expr) {
            expr = expr.replace(/\s/g, ''); // Remove spaces

            // Handle parentheses
            const parenIndex = expr.lastIndexOf('(');
            if (parenIndex !== -1) {
                const closeIndex = findClosingParen(expr, parenIndex);
                if (closeIndex !== -1) {
                    const innerResult = evaluateExpression(expr.substring(parenIndex + 1, closeIndex));
                    const newExpr = expr.substring(0, parenIndex) + innerResult + expr.substring(closeIndex + 1);
                    return evaluateExpression(newExpr);
                }
            }

            // Handle addition and subtraction
            const addSubMatch = expr.match(/(.+?)([+\-])(.+)/);
            if (addSubMatch) {
                const left = evaluateExpression(addSubMatch[1]);
                const op = addSubMatch[2];
                const right = evaluateExpression(addSubMatch[3]);

                if (op === '+') return left + right;
                if (op === '-') return left - right;
            }

            // Handle multiplication and division
            const mulDivMatch = expr.match(/(.+?)([*/])(.+)/);
            if (mulDivMatch) {
                const left = evaluateExpression(mulDivMatch[1]);
                const op = mulDivMatch[2];
                const right = evaluateExpression(mulDivMatch[3]);

                if (op === '*') return left * right;
                if (op === '/' && right !== 0) return left / right;
                throw new Error('Division by zero');
            }

            // Handle numbers
            const num = parseFloat(expr);
            if (!isNaN(num)) return num;

            throw new Error('Invalid expression');
        }

        function findClosingParen(str, openIndex) {
            let count = 1;
            for (let i = openIndex + 1; i < str.length; i++) {
                if (str[i] === '(') count++;
                if (str[i] === ')') count--;
                if (count === 0) return i;
            }
            return -1;
        }
    </script>
</body>
</html>`,
    explanation: 'Generated a simple calculator with basic arithmetic operations using HTML, CSS, and JavaScript.'
  },

  'blog page': {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Blog</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
        <div class="max-w-4xl mx-auto px-4 py-6">
            <h1 class="text-3xl font-bold text-gray-900">My Blog</h1>
            <p class="text-gray-600 mt-2">Thoughts, ideas, and stories</p>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 py-8">
        <!-- Blog Post 1 -->
        <article class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome to My Blog</h2>
            <div class="text-gray-600 mb-4">
                <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Technology</span>
                <span class="ml-4 text-sm">January 15, 2024</span>
            </div>
            <p class="text-gray-700 mb-4">
                Welcome to my personal blog! This is where I'll share my thoughts, experiences, and insights about technology, programming, and life in general.
            </p>
            <p class="text-gray-700 mb-4">
                I'm passionate about creating useful software and helping others learn new skills. Through this blog, I hope to share knowledge and connect with like-minded individuals.
            </p>
            <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Read more →</a>
        </article>

        <!-- Blog Post 2 -->
        <article class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Getting Started with Web Development</h2>
            <div class="text-gray-600 mb-4">
                <span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Tutorial</span>
                <span class="ml-4 text-sm">January 10, 2024</span>
            </div>
            <p class="text-gray-700 mb-4">
                Web development is an exciting field that combines creativity with technical skills. Whether you're just starting out or looking to expand your knowledge, there are many resources available to help you learn.
            </p>
            <p class="text-gray-700 mb-4">
                The three main technologies you'll need to learn are HTML, CSS, and JavaScript. HTML provides the structure, CSS handles the styling, and JavaScript adds interactivity.
            </p>
            <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Read more →</a>
        </article>

        <!-- Blog Post 3 -->
        <article class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">The Future of AI in Development</h2>
            <div class="text-gray-600 mb-4">
                <span class="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">AI</span>
                <span class="ml-4 text-sm">January 5, 2024</span>
            </div>
            <p class="text-gray-700 mb-4">
                Artificial Intelligence is revolutionizing the way we approach software development. From code generation to debugging, AI tools are becoming increasingly sophisticated and helpful.
            </p>
            <p class="text-gray-700 mb-4">
                While AI can't replace human creativity and problem-solving skills, it can significantly speed up development workflows and help catch errors early in the process.
            </p>
            <a href="#" class="text-blue-600 hover:text-blue-800 font-medium">Read more →</a>
        </article>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-12">
        <div class="max-w-4xl mx-auto px-4 py-6">
            <p class="text-center text-gray-600">© 2024 My Blog. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`,
    explanation: 'Generated a simple blog page with multiple posts, categories, and responsive design using HTML and Tailwind CSS.'
  },

  'snake game': {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        #gameCanvas {
            border: 2px solid #333;
            background-color: #f0f0f0;
        }
        .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .score {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .controls {
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="game-container">
        <h1 class="text-3xl font-bold text-center mb-4">Snake Game</h1>

        <div class="score">
            Score: <span id="score">0</span>
        </div>

        <canvas id="gameCanvas" width="400" height="400"></canvas>

        <div class="controls">
            <p>Use arrow keys or WASD to control the snake</p>
            <p>Press Space to pause/resume</p>
            <button id="restartBtn" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Restart Game
            </button>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const restartBtn = document.getElementById('restartBtn');

        // Game variables
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;

        let snake = [
            {x: 10, y: 10}
        ];
        let food = {};
        let dx = 0;
        let dy = 0;
        let score = 0;
        let gameRunning = true;
        let gamePaused = false;

        // Generate random food position
        function randomTile() {
            return Math.floor(Math.random() * tileCount);
        }

        // Generate food
        function generateFood() {
            food = {
                x: randomTile(),
                y: randomTile()
            };

            // Make sure food doesn't spawn on snake
            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    generateFood();
                    return;
                }
            }
        }

        // Draw game
        function drawGame() {
            // Clear canvas
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw snake
            ctx.fillStyle = '#4CAF50';
            for (let segment of snake) {
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            }

            // Draw food
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        }

        // Move snake
        function moveSnake() {
            if (!gameRunning || gamePaused) return;

            const head = {x: snake[0].x + dx, y: snake[0].y + dy};

            // Check wall collision
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                gameRunning = false;
                alert('Game Over! You hit the wall. Score: ' + score);
                return;
            }

            // Check self collision
            for (let segment of snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    gameRunning = false;
                    alert('Game Over! You hit yourself. Score: ' + score);
                    return;
                }
            }

            snake.unshift(head);

            // Check food collision
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                generateFood();
            } else {
                snake.pop();
            }
        }

        // Game loop
        function gameLoop() {
            moveSnake();
            drawGame();
        }

        // Handle keyboard input
        document.addEventListener('keydown', (e) => {
            if (!gameRunning) return;

            // Prevent default behavior for arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (e.key === ' ') {
                gamePaused = !gamePaused;
                return;
            }

            if (gamePaused) return;

            const key = e.key.toLowerCase();

            // Prevent reverse direction
            if (key === 'arrowleft' || key === 'a') {
                if (dx !== 1) {
                    dx = -1;
                    dy = 0;
                }
            } else if (key === 'arrowup' || key === 'w') {
                if (dy !== 1) {
                    dx = 0;
                    dy = -1;
                }
            } else if (key === 'arrowright' || key === 'd') {
                if (dx !== -1) {
                    dx = 1;
                    dy = 0;
                }
            } else if (key === 'arrowdown' || key === 's') {
                if (dy !== -1) {
                    dx = 0;
                    dy = 1;
                }
            }
        });

        // Restart game
        function restartGame() {
            snake = [{x: 10, y: 10}];
            dx = 0;
            dy = 0;
            score = 0;
            scoreElement.textContent = score;
            gameRunning = true;
            gamePaused = false;
            generateFood();
        }

        restartBtn.addEventListener('click', restartGame);

        // Initialize game
        generateFood();
        setInterval(gameLoop, 150);
    </script>
</body>
</html>`,
    explanation: 'Generated a fully functional Snake game with keyboard controls, scoring, collision detection, and restart functionality using HTML5 Canvas and JavaScript.'
  },

  'flappy game': {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flappy Bird Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        #gameCanvas {
            border: 2px solid #333;
            background: linear-gradient(to bottom, #87CEEB, #98FB98);
        }
        .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }
        .score {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .controls {
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="game-container">
        <h1 class="text-3xl font-bold text-center mb-4">Flappy Bird</h1>

        <div class="score">
            Score: <span id="score">0</span>
        </div>

        <canvas id="gameCanvas" width="400" height="600"></canvas>

        <div class="controls">
            <p>Click or press Space to flap</p>
            <button id="restartBtn" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Restart Game
            </button>
        </div>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const restartBtn = document.getElementById('restartBtn');

        // Game variables
        let bird = {
            x: 50,
            y: 300,
            velocity: 0,
            gravity: 0.6,
            jump: -12
        };

        let pipes = [];
        let score = 0;
        let gameRunning = false;
        let gameOver = false;

        // Pipe variables
        const pipeWidth = 80;
        const pipeGap = 150;
        const pipeSpeed = 2;

        // Start game
        function startGame() {
            bird.y = 300;
            bird.velocity = 0;
            pipes = [];
            score = 0;
            scoreElement.textContent = score;
            gameRunning = true;
            gameOver = false;
            generatePipe();
        }

        // Generate pipe
        function generatePipe() {
            const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
            pipes.push({
                x: canvas.width,
                topHeight: topHeight,
                bottomY: topHeight + pipeGap,
                passed: false
            });
        }

        // Draw bird
        function drawBird() {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(bird.x, bird.y, 15, 0, Math.PI * 2);
            ctx.fill();

            // Eye
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(bird.x + 5, bird.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw pipes
        function drawPipes() {
            ctx.fillStyle = '#228B22';
            pipes.forEach(pipe => {
                // Top pipe
                ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
                // Bottom pipe
                ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
            });
        }

        // Update game
        function updateGame() {
            if (!gameRunning) return;

            // Update bird
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;

            // Check ground collision
            if (bird.y + 15 >= canvas.height || bird.y - 15 <= 0) {
                gameOver = true;
                gameRunning = false;
            }

            // Update pipes
            pipes.forEach(pipe => {
                pipe.x -= pipeSpeed;

                // Check collision
                if (bird.x + 15 > pipe.x && bird.x - 15 < pipe.x + pipeWidth) {
                    if (bird.y - 15 < pipe.topHeight || bird.y + 15 > pipe.bottomY) {
                        gameOver = true;
                        gameRunning = false;
                    }
                }

                // Check scoring
                if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                    pipe.passed = true;
                    score++;
                    scoreElement.textContent = score;
                }
            });

            // Remove off-screen pipes
            pipes = pipes.filter(pipe => pipe.x > -pipeWidth);

            // Generate new pipes
            if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
                generatePipe();
            }
        }

        // Draw game
        function drawGame() {
            // Clear canvas
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw ground
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

            drawPipes();
            drawBird();

            // Game over text
            if (gameOver) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = '#FFF';
                ctx.font = '48px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
                ctx.font = '24px Arial';
                ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2);
                ctx.fillText('Click Restart to play again', canvas.width / 2, canvas.height / 2 + 50);
            }
        }

        // Game loop
        function gameLoop() {
            updateGame();
            drawGame();
        }

        // Handle input
        function flap() {
            if (!gameRunning && !gameOver) {
                startGame();
            } else if (gameRunning) {
                bird.velocity = bird.jump;
            }
        }

        // Event listeners
        canvas.addEventListener('click', flap);
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                flap();
            }
        });

        restartBtn.addEventListener('click', () => {
            gameOver = false;
            startGame();
        });

        // Initial draw
        drawGame();
        setInterval(gameLoop, 1000 / 60); // 60 FPS
    </script>
</body>
</html>`,
    explanation: 'Generated a Flappy Bird-style game with gravity physics, pipe obstacles, scoring, and collision detection using HTML5 Canvas and JavaScript.'
  },

  '2048 game': {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>2048 Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            background-color: #bbada0;
            padding: 10px;
            border-radius: 10px;
            width: 400px;
            height: 400px;
        }
        .cell {
            background-color: #cdc1b4;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #776e65;
        }
        .tile {
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #776e65;
            transition: all 0.1s ease;
        }
        .tile-2 { background-color: #eee4da; }
        .tile-4 { background-color: #ede0c8; }
        .tile-8 { background-color: #f2b179; color: #f9f6f2; }
        .tile-16 { background-color: #f59563; color: #f9f6f2; }
        .tile-32 { background-color: #f67c5f; color: #f9f6f2; }
        .tile-64 { background-color: #f65e3b; color: #f9f6f2; }
        .tile-128 { background-color: #edcf72; color: #f9f6f2; font-size: 20px; }
        .tile-256 { background-color: #edcc61; color: #f9f6f2; font-size: 20px; }
        .tile-512 { background-color: #edc850; color: #f9f6f2; font-size: 20px; }
        .tile-1024 { background-color: #edc53f; color: #f9f6f2; font-size: 18px; }
        .tile-2048 { background-color: #edc22e; color: #f9f6f2; font-size: 18px; }
        .score {
            font-size: 24px;
            font-weight: bold;
            color: #776e65;
        }
        .game-over {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(238, 228, 218, 0.73);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            font-size: 36px;
            font-weight: bold;
            color: #776e65;
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="game-container">
        <h1 class="text-3xl font-bold text-center mb-4">2048</h1>

        <div class="flex gap-4 items-center">
            <div class="score">
                Score: <span id="score">0</span>
            </div>
            <button id="restartBtn" class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                New Game
            </button>
        </div>

        <div class="relative">
            <div class="grid" id="grid"></div>
            <div id="gameOver" class="game-over hidden">
                <div>Game Over!</div>
                <button id="tryAgainBtn" class="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                    Try Again
                </button>
            </div>
        </div>

        <div class="text-center text-gray-600 max-w-md">
            <p><strong>HOW TO PLAY:</strong> Use your arrow keys to move the tiles. When two tiles with the same number touch, they merge into one!</p>
        </div>
    </div>

    <script>
        const gridElement = document.getElementById('grid');
        const scoreElement = document.getElementById('score');
        const restartBtn = document.getElementById('restartBtn');
        const gameOverElement = document.getElementById('gameOver');
        const tryAgainBtn = document.getElementById('tryAgainBtn');

        let grid = [];
        let score = 0;
        let gameOver = false;

        // Initialize grid
        function initGrid() {
            grid = Array(4).fill().map(() => Array(4).fill(0));
            score = 0;
            gameOver = false;
            scoreElement.textContent = score;
            gameOverElement.classList.add('hidden');
            addRandomTile();
            addRandomTile();
            renderGrid();
        }

        // Add random tile
        function addRandomTile() {
            const emptyCells = [];
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    if (grid[i][j] === 0) {
                        emptyCells.push({i, j});
                    }
                }
            }
            if (emptyCells.length > 0) {
                const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                grid[i][j] = Math.random() < 0.9 ? 2 : 4;
            }
        }

        // Render grid
        function renderGrid() {
            gridElement.innerHTML = '';
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';

                    if (grid[i][j] !== 0) {
                        const tile = document.createElement('div');
                        tile.className = \`tile tile-\${grid[i][j]}\`;
                        tile.textContent = grid[i][j];
                        cell.appendChild(tile);
                    }

                    gridElement.appendChild(cell);
                }
            }
        }

        // Move tiles
        function move(direction) {
            if (gameOver) return;

            let moved = false;
            const newGrid = JSON.parse(JSON.stringify(grid));

            if (direction === 'left') {
                for (let i = 0; i < 4; i++) {
                    const row = newGrid[i].filter(cell => cell !== 0);
                    for (let j = 0; j < row.length - 1; j++) {
                        if (row[j] === row[j + 1]) {
                            row[j] *= 2;
                            score += row[j];
                            row[j + 1] = 0;
                        }
                    }
                    const newRow = row.filter(cell => cell !== 0);
                    while (newRow.length < 4) newRow.push(0);
                    newGrid[i] = newRow;
                }
            } else if (direction === 'right') {
                for (let i = 0; i < 4; i++) {
                    const row = newGrid[i].filter(cell => cell !== 0);
                    for (let j = row.length - 1; j > 0; j--) {
                        if (row[j] === row[j - 1]) {
                            row[j] *= 2;
                            score += row[j];
                            row[j - 1] = 0;
                        }
                    }
                    const newRow = row.filter(cell => cell !== 0);
                    while (newRow.length < 4) newRow.unshift(0);
                    newGrid[i] = newRow;
                }
            } else if (direction === 'up') {
                for (let j = 0; j < 4; j++) {
                    const column = [];
                    for (let i = 0; i < 4; i++) {
                        if (newGrid[i][j] !== 0) column.push(newGrid[i][j]);
                    }
                    for (let i = 0; i < column.length - 1; i++) {
                        if (column[i] === column[i + 1]) {
                            column[i] *= 2;
                            score += column[i];
                            column[i + 1] = 0;
                        }
                    }
                    const newColumn = column.filter(cell => cell !== 0);
                    for (let i = 0; i < 4; i++) {
                        newGrid[i][j] = newColumn[i] || 0;
                    }
                }
            } else if (direction === 'down') {
                for (let j = 0; j < 4; j++) {
                    const column = [];
                    for (let i = 0; i < 4; i++) {
                        if (newGrid[i][j] !== 0) column.push(newGrid[i][j]);
                    }
                    for (let i = column.length - 1; i > 0; i--) {
                        if (column[i] === column[i - 1]) {
                            column[i] *= 2;
                            score += column[i];
                            column[i - 1] = 0;
                        }
                    }
                    const newColumn = column.filter(cell => cell !== 0);
                    for (let i = 3; i >= 0; i--) {
                        newGrid[i][j] = newColumn[3 - i] || 0;
                    }
                }
            }

            // Check if grid changed
            if (JSON.stringify(grid) !== JSON.stringify(newGrid)) {
                moved = true;
                grid = newGrid;
                addRandomTile();
            }

            scoreElement.textContent = score;
            renderGrid();

            // Check game over
            if (moved && !canMove()) {
                gameOver = true;
                gameOverElement.classList.remove('hidden');
            }
        }

        // Check if any moves are possible
        function canMove() {
            // Check for empty cells
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    if (grid[i][j] === 0) return true;
                }
            }

            // Check for possible merges
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    const current = grid[i][j];
                    if (j < 3 && current === grid[i][j + 1]) return true;
                    if (i < 3 && current === grid[i + 1][j]) return true;
                }
            }

            return false;
        }

        // Handle keyboard input
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    move('down');
                    break;
            }
        });

        // Event listeners
        restartBtn.addEventListener('click', initGrid);
        tryAgainBtn.addEventListener('click', initGrid);

        // Initialize game
        initGrid();
    </script>
</body>
</html>`,
    explanation: 'Generated a fully functional 2048 sliding tile puzzle game with scoring, tile merging, and game over detection using HTML, CSS, and JavaScript.'
  }
};

// Function to find the best matching template based on user prompt
export function findMatchingTemplate(prompt: string): LocalTemplate | null {
  const lowerPrompt = prompt.toLowerCase();

  // Direct matches
  if (lowerPrompt.includes('chatbot') || lowerPrompt.includes('chat bot')) {
    return LOCAL_TEMPLATES.chatbot;
  }

  if (lowerPrompt.includes('calculator')) {
    return LOCAL_TEMPLATES.calculator;
  }

  if (lowerPrompt.includes('blog')) {
    return LOCAL_TEMPLATES['blog page'];
  }

  if (lowerPrompt.includes('snake')) {
    return LOCAL_TEMPLATES['snake game'];
  }

  if (lowerPrompt.includes('flappy') || lowerPrompt.includes('flop') || lowerPrompt.includes('bird')) {
    return LOCAL_TEMPLATES['flappy game'];
  }

  if (lowerPrompt.includes('2048')) {
    return LOCAL_TEMPLATES['2048 game'];
  }

  // More specific game matching
  if (lowerPrompt.includes('snake game') || lowerPrompt.includes('snake')) {
    return LOCAL_TEMPLATES['snake game'];
  }

  if (lowerPrompt.includes('flappy') || lowerPrompt.includes('flappy bird') || lowerPrompt.includes('flop')) {
    return LOCAL_TEMPLATES['flappy game'];
  }

  if (lowerPrompt.includes('2048')) {
    return LOCAL_TEMPLATES['2048 game'];
  }

  // Don't match generic "game" to avoid wrong templates
  // if (lowerPrompt.includes('game')) {
  //   return LOCAL_TEMPLATES['snake game'];
  // }

  // Fuzzy matching for common requests
  if (lowerPrompt.includes('talk') || lowerPrompt.includes('conversation') || lowerPrompt.includes('message')) {
    return LOCAL_TEMPLATES.chatbot;
  }

  if (lowerPrompt.includes('calculate') || lowerPrompt.includes('math') || lowerPrompt.includes('numbers')) {
    return LOCAL_TEMPLATES.calculator;
  }

  if (lowerPrompt.includes('article') || lowerPrompt.includes('post') || lowerPrompt.includes('write')) {
    return LOCAL_TEMPLATES['blog page'];
  }

  if (lowerPrompt.includes('play') || lowerPrompt.includes('fun')) {
    return LOCAL_TEMPLATES['snake game'];
  }

  return null;
}
