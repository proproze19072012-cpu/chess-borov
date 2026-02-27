// ============= ШАХМАТЫ =============
(function() {
    // Фигуры
    const PIECES = {
        wP: '♙', wN: '♘', wB: '♗', wR: '♖', wQ: '♕', wK: '♔',
        bP: '♟', bN: '♞', bB: '♝', bR: '♜', bQ: '♛', bK: '♚'
    };

    // Начальная позиция
    let board = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];

    let currentPlayer = 'white';
    let selectedRow = -1;
    let selectedCol = -1;
    let possibleMoves = [];
    let moveHistory = [];
    let capturedWhite = [];
    let capturedBlack = [];
// Таймеры
let whiteTime = 600; // в секундах (10 минут по умолчанию)
let blackTime = 600;
let timerInterval = null;
let timerActive = false;
let selectedTime = 10; // минуты

// Обновление таймеров на экране
function updateTimerDisplay() {
    let whiteMin = Math.floor(whiteTime / 60);
    let whiteSec = whiteTime % 60;
    let blackMin = Math.floor(blackTime / 60);
    let blackSec = blackTime % 60;
    
    document.getElementById('whiteTime').textContent = 
        `${whiteMin}:${whiteSec < 10 ? '0' : ''}${whiteSec}`;
    document.getElementById('blackTime').textContent = 
        `${blackMin}:${blackSec < 10 ? '0' : ''}${blackSec}`;
}

// Запуск таймера
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerActive = true;
    timerInterval = setInterval(function() {
        if (currentPlayer === 'white') {
            if (whiteTime > 0) {
                whiteTime--;
                updateTimerDisplay();
                
                // Проверка на окончание времени
                if (whiteTime <= 0) {
                    clearInterval(timerInterval);
                    alert('Время белых истекло! Победа чёрных!');
                    newGame();
                }
            }
        } else {
            if (blackTime > 0) {
                blackTime--;
                updateTimerDisplay();
                
                if (blackTime <= 0) {
                    clearInterval(timerInterval);
                    alert('Время чёрных истекло! Победа белых!');
                    newGame();
                }
            }
        }
        
        // Подсветка активного таймера
        document.querySelector('.white-timer').classList.toggle('timer-active', currentPlayer === 'white');
        document.querySelector('.black-timer').classList.toggle('timer-active', currentPlayer === 'black');
    }, 1000);
}

// Остановка таймера
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerActive = false;
}

// Сброс таймеров
function resetTimers(minutes) {
    stopTimer();
    whiteTime = minutes * 60;
    blackTime = minutes * 60;
    updateTimerDisplay();
}

// Выбор времени
document.getElementById('timeSelect').addEventListener('change', function() {
    selectedTime = parseInt(this.value);
    if (!timerActive) {
        resetTimers(selectedTime);
    }
});

// Кнопка старт
document.getElementById('startTimerBtn').addEventListener('click', function() {
    if (timerActive) {
        stopTimer();
        this.innerHTML = '<i class="fas fa-clock"></i> Старт';
    } else {
        resetTimers(selectedTime);
        startTimer();
        this.innerHTML = '<i class="fas fa-stop"></i> Стоп';
    }
});
    // Проверка внутри доски
    function isValid(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    // Цвет фигуры
    function getColor(piece) {
        return piece[0] === 'w' ? 'white' : 'black';
    }

    // Ходы пешки
    function getPawnMoves(r, c, color) {
        let moves = [];
        let dir = color === 'white' ? -1 : 1;
        let startRow = color === 'white' ? 6 : 1;
        
        // Ход вперед
        if (isValid(r + dir, c) && !board[r + dir][c]) {
            moves.push([r + dir, c]);
            
            // Два вперед с начальной
            if (r === startRow && isValid(r + 2*dir, c) && !board[r + 2*dir][c]) {
                moves.push([r + 2*dir, c]);
            }
        }
        
        // Взятие влево
        if (isValid(r + dir, c - 1) && board[r + dir][c - 1] && getColor(board[r + dir][c - 1]) !== color) {
            moves.push([r + dir, c - 1]);
        }
        
        // Взятие вправо
        if (isValid(r + dir, c + 1) && board[r + dir][c + 1] && getColor(board[r + dir][c + 1]) !== color) {
            moves.push([r + dir, c + 1]);
        }
        
        return moves;
    }

    // Ходы коня
    function getKnightMoves(r, c, color) {
        let moves = [];
        let offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        
        for (let [dr, dc] of offsets) {
            let nr = r + dr;
            let nc = c + dc;
            if (isValid(nr, nc)) {
                if (!board[nr][nc] || getColor(board[nr][nc]) !== color) {
                    moves.push([nr, nc]);
                }
            }
        }
        return moves;
    }

    // Ходы ладьи
    function getRookMoves(r, c, color) {
        let moves = [];
        let dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        
        for (let [dr, dc] of dirs) {
            let nr = r + dr;
            let nc = c + dc;
            while (isValid(nr, nc)) {
                if (!board[nr][nc]) {
                    moves.push([nr, nc]);
                } else {
                    if (getColor(board[nr][nc]) !== color) {
                        moves.push([nr, nc]);
                    }
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }
        return moves;
    }

    // Ходы слона
    function getBishopMoves(r, c, color) {
        let moves = [];
        let dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
        
        for (let [dr, dc] of dirs) {
            let nr = r + dr;
            let nc = c + dc;
            while (isValid(nr, nc)) {
                if (!board[nr][nc]) {
                    moves.push([nr, nc]);
                } else {
                    if (getColor(board[nr][nc]) !== color) {
                        moves.push([nr, nc]);
                    }
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }
        return moves;
    }

    // Ходы ферзя
    function getQueenMoves(r, c, color) {
        return [...getRookMoves(r, c, color), ...getBishopMoves(r, c, color)];
    }

    // Ходы короля
    function getKingMoves(r, c, color) {
        let moves = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                let nr = r + dr;
                let nc = c + dc;
                if (isValid(nr, nc)) {
                    if (!board[nr][nc] || getColor(board[nr][nc]) !== color) {
                        moves.push([nr, nc]);
                    }
                }
            }
        }
        return moves;
    }

    // Получить ходы для фигуры
    function getMoves(r, c) {
        let piece = board[r][c];
        if (!piece) return [];
        
        let color = getColor(piece);
        let type = piece[1];
        
        switch(type) {
            case 'P': return getPawnMoves(r, c, color);
            case 'N': return getKnightMoves(r, c, color);
            case 'B': return getBishopMoves(r, c, color);
            case 'R': return getRookMoves(r, c, color);
            case 'Q': return getQueenMoves(r, c, color);
            case 'K': return getKingMoves(r, c, color);
            default: return [];
        }
    }

    // Сделать ход
    function makeMove(fromR, fromC, toR, toC) {
        let piece = board[fromR][fromC];
        let target = board[toR][toC];
        
        // Запись в историю
        let notation = String.fromCharCode(97 + toC) + (8 - toR);
        moveHistory.push({
            from: [fromR, fromC],
            to: [toR, toC],
            notation: notation
        });
        
        // Взятие фигуры
        if (target) {
            if (getColor(target) === 'white') {
                capturedWhite.push(target);
            } else {
                capturedBlack.push(target);
            }
        }
        
        // Перемещение
        board[toR][toC] = piece;
        board[fromR][fromC] = '';
        
        // Превращение пешки
        if (piece[1] === 'P' && (toR === 0 || toR === 7)) {
            board[toR][toC] = piece[0] === 'w' ? 'wQ' : 'bQ';
        }
        
        // Смена игрока
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        
        // Сброс выделения
        selectedRow = -1;
        selectedCol = -1;
        possibleMoves = [];
        
        renderBoard();
        updateUI();
    }

    // Нарисовать доску
    function renderBoard() {
        let boardEl = document.getElementById('chessboard');
        if (!boardEl) return;
        
        boardEl.innerHTML = '';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                let square = document.createElement('div');
                square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = r;
                square.dataset.col = c;
                
                // Фигура
                let piece = board[r][c];
                if (piece) {
                    square.textContent = PIECES[piece];
                    // Добавляем классы для цвета фигур
                    if (piece[0] === 'w') {
                        square.style.color = '#ffffff';
                        square.style.textShadow = '1px 1px 2px black';
                    } else {
                        square.style.color = '#2c2c2c';
                        square.style.textShadow = '1px 1px 2px white';
                    }
                }
                
                // Подсветка выбранной клетки
                if (r === selectedRow && c === selectedCol) {
                    square.classList.add('selected');
                }
                
                // Подсветка возможных ходов
                for (let move of possibleMoves) {
                    if (move[0] === r && move[1] === c) {
                        if (board[r][c]) {
                            square.classList.add('capture-move');
                        } else {
                            square.classList.add('possible-move');
                        }
                        break;
                    }
                }
                
                // Обработчик клика
                square.onclick = function() {
                    let row = parseInt(this.dataset.row);
                    let col = parseInt(this.dataset.col);
                    
                    // Если есть выбранная фигура
                    if (selectedRow !== -1) {
                        // Проверяем, можно ли сходить
                        for (let move of possibleMoves) {
                            if (move[0] === row && move[1] === col) {
                                makeMove(selectedRow, selectedCol, row, col);
                                return;
                            }
                        }
                        
                        // Если кликнули на другую свою фигуру
                        let piece = board[row][col];
                        if (piece && getColor(piece) === currentPlayer) {
                            selectedRow = row;
                            selectedCol = col;
                            possibleMoves = getMoves(row, col);
                            renderBoard();
                        } else {
                            selectedRow = -1;
                            selectedCol = -1;
                            possibleMoves = [];
                            renderBoard();
                        }
                    } else {
                        // Выбираем фигуру
                        let piece = board[row][col];
                        if (piece && getColor(piece) === currentPlayer) {
                            selectedRow = row;
                            selectedCol = col;
                            possibleMoves = getMoves(row, col);
                        } else {
                            selectedRow = -1;
                            selectedCol = -1;
                            possibleMoves = [];
                        }
                        renderBoard();
                    }
                };
                
                boardEl.appendChild(square);
            }
        }
    }

    // Обновить интерфейс
    function updateUI() {
        // Статус
        let statusEl = document.getElementById('gameStatus');
        if (statusEl) {
            statusEl.textContent = `Ход ${currentPlayer === 'white' ? 'белых' : 'чёрных'}`;
        }
        
        // История ходов
        let historyEl = document.getElementById('movesHistory');
        if (historyEl) {
            historyEl.innerHTML = '';
            
            for (let i = 0; i < moveHistory.length; i += 2) {
                let moveDiv = document.createElement('div');
                moveDiv.className = 'move-entry';
                moveDiv.innerHTML = `
                    <span class="move-number">${Math.floor(i/2)+1}.</span>
                    <span class="move-white">${moveHistory[i] ? moveHistory[i].notation : ''}</span>
                    <span class="move-black">${moveHistory[i+1] ? moveHistory[i+1].notation : ''}</span>
                `;
                historyEl.appendChild(moveDiv);
            }
        }
        
        // Взятые фигуры
        let whiteCaptured = document.getElementById('capturedByWhite');
        if (whiteCaptured) {
            whiteCaptured.innerHTML = capturedWhite.map(p => PIECES[p]).join(' ');
        }
        
        let blackCaptured = document.getElementById('capturedByBlack');
        if (blackCaptured) {
            blackCaptured.innerHTML = capturedBlack.map(p => PIECES[p]).join(' ');
        }
    }

    // Новая игра
    function newGame() {
        board = [
            ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
            ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
            ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
        ];
        currentPlayer = 'white';
        selectedRow = -1;
        selectedCol = -1;
        possibleMoves = [];
        moveHistory = [];
        capturedWhite = [];
        capturedBlack = [];
        
        renderBoard();
        updateUI();
    }

    // Запуск
    document.addEventListener('DOMContentLoaded', function() {
        renderBoard();
        updateUI();
        
        // Кнопка "Войти"
        let loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.addEventListener('click', function() {
                window.location.href = 'log.html';
            });
        }
        
        // Кнопка "Регистрация"
        let signupBtn = document.querySelector('.btn-signup');
        if (signupBtn) {
            signupBtn.addEventListener('click', function() {
                window.location.href = 'reg.html';
            });
        }
        
        // Кнопка "Новая игра"
        let newBtn = document.getElementById('newGameBtn');
        if (newBtn) {
            newBtn.addEventListener('click', newGame);
        }
        
        // Кнопка "Отмена"
        let undoBtn = document.getElementById('undoBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', function() {
                if (moveHistory.length > 0) {
                    if (confirm('Начать новую игру?')) {
                        newGame();
                    }
                }
            });
        }
        
        // Кнопка "Ничья"
        let drawBtn = document.getElementById('drawBtn');
        if (drawBtn) {
            drawBtn.addEventListener('click', function() {
                alert('Предложение ничьей отправлено');
            });
        }
        
        // Кнопка "Сдаться"
        let resignBtn = document.getElementById('resignBtn');
        if (resignBtn) {
            resignBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите сдаться?')) {
                    alert('Игра завершена');
                    newGame();
                }
            });
        }
    });
})();