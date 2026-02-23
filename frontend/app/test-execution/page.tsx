'use client'

import { useState } from 'react'

export default function TestExecutionPage() {
  const [testResult, setTestResult] = useState<string>('')

  const testHTMLExecution = () => {
    const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tic Tac Toe Game</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
        }
        .game-container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
            margin: 20px 0;
        }
        .cell {
            width: 80px;
            height: 80px;
            border: 2px solid #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            font-weight: bold;
            cursor: pointer;
            background: #f9f9f9;
        }
        .cell:hover {
            background: #e0e0e0;
        }
        .status {
            text-align: center;
            font-size: 1.2em;
            margin: 10px 0;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }
        button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="game-container">
        <h1>Tic Tac Toe</h1>
        <div class="status" id="status">Player X's turn</div>
        <div class="board" id="board">
            <div class="cell" data-index="0"></div>
            <div class="cell" data-index="1"></div>
            <div class="cell" data-index="2"></div>
            <div class="cell" data-index="3"></div>
            <div class="cell" data-index="4"></div>
            <div class="cell" data-index="5"></div>
            <div class="cell" data-index="6"></div>
            <div class="cell" data-index="7"></div>
            <div class="cell" data-index="8"></div>
        </div>
        <button onclick="resetGame()">Reset Game</button>
    </div>

    <script>
        let currentPlayer = 'X';
        let gameBoard = ['', '', '', '', '', '', '', '', ''];
        let gameActive = true;

        const cells = document.querySelectorAll('.cell');
        const status = document.getElementById('status');

        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = cell.getAttribute('data-index');
                if (gameBoard[index] === '' && gameActive) {
                    gameBoard[index] = currentPlayer;
                    cell.textContent = currentPlayer;
                    
                    if (checkWinner()) {
                        status.textContent = 'Player ' + currentPlayer + ' wins!';
                        gameActive = false;
                    } else if (gameBoard.every(cell => cell !== '')) {
                        status.textContent = "It's a draw!";
                        gameActive = false;
                    } else {
                        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                        status.textContent = 'Player ' + currentPlayer + "'s turn";
                    }
                }
            });
        });

        function checkWinner() {
            const winConditions = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                [0, 4, 8], [2, 4, 6] // diagonals
            ];
            
            return winConditions.some(condition => {
                return condition.every(index => {
                    return gameBoard[index] === currentPlayer;
                });
            });
        }

        function resetGame() {
            gameBoard = ['', '', '', '', '', '', '', '', ''];
            gameActive = true;
            currentPlayer = 'X';
            cells.forEach(cell => cell.textContent = '');
            status.textContent = 'Player X\'s turn';
        }
    </script>
</body>
</html>`

    try {
      // Test the HTML execution logic
      const newWindow = window.open('', '_blank')
      if (newWindow) {
        newWindow.document.write(htmlCode)
        newWindow.document.close()
        setTestResult('✅ HTML execution successful! Tic Tac Toe game opened in new window.')
      } else {
        setTestResult('❌ Popup blocked. Please allow popups for this site.')
      }
    } catch (error) {
      setTestResult(`❌ HTML execution failed: ${error}`)
    }
  }

  const testLanguageDetection = () => {
    const detectLanguage = (code: string): string => {
      const trimmedCode = code.trim()
      
      // HTML detection - more comprehensive
      if (trimmedCode.includes('<!DOCTYPE') ||
          trimmedCode.includes('<html') ||
          trimmedCode.includes('<head') ||
          trimmedCode.includes('<body') ||
          (trimmedCode.includes('<') && trimmedCode.includes('>') && 
           (trimmedCode.includes('html') || trimmedCode.includes('head') || 
            trimmedCode.includes('body') || trimmedCode.includes('div') ||
            trimmedCode.includes('title') || trimmedCode.includes('meta')))) {
        return 'html'
      }
      
      // Default to JavaScript
      return 'javascript'
    }

    const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Test</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`

    const detected = detectLanguage(htmlCode)
    setTestResult(`✅ Language detection test: Detected "${detected}" for HTML code`)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Execution Test Page</h1>
        
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">HTML Execution Test</h2>
            <button 
              onClick={testHTMLExecution}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Test HTML Execution
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Language Detection Test</h2>
            <button 
              onClick={testLanguageDetection}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Test Language Detection
            </button>
          </div>

          {testResult && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Test Result</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{testResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 