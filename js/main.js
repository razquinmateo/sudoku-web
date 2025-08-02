// Verifica si un número puede colocarse en una posición específica
function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }

    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = startRow; i < startRow + 3; i++) {
        for (let j = startCol; j < startCol + 3; j++) {
            if (board[i][j] === num) return false;
        }
    }

    return true;
}

// Rellena un tablero completamente con una solución válida
function fillBoard(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const num of numbers) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false; 
            }
        }
    }
    return true;
}

// Verifica si el tablero actual es válido completamente
function isBoardValid(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const num = board[row][col];
            if (num === 0) return false;

            board[row][col] = 0;
            const valid = isValid(board, row, col, num);
            board[row][col] = num;

            if (!valid) return false;
        }
    }
    return true;
}

// Mezcla aleatoriamente un array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Genera un tablero completo válido
function generateFullBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillBoard(board);
    return board;
}

// Elimina celdas del tablero según la dificultad
function removeCells(board, difficulty) {
    const hideCount = {
        easy: 30,
        medium: 45,
        hard: 55
    }[difficulty];

    const puzzle = board.map(row => row.slice());
    let removed = 0;

    while (removed < hideCount) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }

    return puzzle;
}

// Muestra un mensaje indicando que el sudoku fue resuelto automáticamente
function showSolvedMessage() {
    const messageEl = document.getElementById('game-message');
    messageEl.textContent = 'El Sudoku fue resuelto automáticamente. Iniciá una nueva partida.';
}

// Obtiene el estado actual del tablero desde el DOM
function getCurrentBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    const inputs = document.querySelectorAll('#sudoku-board input');

    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const value = parseInt(input.value);
        board[row][col] = value || 0;
    });

    return board;
}

// Muestra un mensaje de advertencia cuando se ingresa un carácter inválido
function showInputWarning(msg) {
    const warning = document.getElementById('input-warning');
    warning.textContent = msg;
    warning.style.display = 'block';

    clearTimeout(showInputWarning.timeout);
    showInputWarning.timeout = setTimeout(() => {
        warning.style.display = 'none';
        warning.textContent = '';
    }, 5000); 
}

// ===============================
// Lógica principal y eventos del DOM
// ===============================

document.addEventListener('DOMContentLoaded', () => {
    const boardEl = document.getElementById('sudoku-board');
    const newGameBtn = document.getElementById('new-game-btn');
    const difficultySelect = document.getElementById('difficulty');
    let solutionBoard;

    const showSolutionBtn = document.getElementById('show-solution-btn');
    showSolutionBtn.addEventListener('click', showSolution);

    const checkBtn = document.getElementById('check-btn');
    checkBtn.addEventListener('click', checkSolution);

    newGameBtn.addEventListener('click', generateSudoku);
    generateSudoku();

    // Genera un nuevo sudoku aleatorio con la dificultad seleccionada
    function generateSudoku() {
        const difficulty = difficultySelect.value;
        const fullBoard = generateFullBoard();
        solutionBoard = fullBoard.map(row => row.slice());
        const puzzle = removeCells(fullBoard, difficulty);
        renderBoard(puzzle);
        document.getElementById('check-btn').disabled = false;
        document.getElementById('game-message').textContent = '';
    }

    // Dibuja el tablero y asocia eventos a las celdas
    function renderBoard(puzzle) {
        boardEl.innerHTML = '';
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('input');
                cell.classList.add('cell');
                cell.maxLength = 1;
                cell.dataset.row = row;
                cell.dataset.col = col;

                const value = puzzle[row][col];

                if (value !== 0) {
                    cell.value = value;
                    cell.disabled = true;
                    cell.classList.add('fixed');
                }

                boardEl.appendChild(cell);

                // Bloquea letras y números inválidos
                cell.addEventListener('keydown', e => {
                    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                    const isValidKey = /^[1-9]$/.test(e.key) || allowedKeys.includes(e.key);

                    if (!isValidKey) {
                        e.preventDefault();
                        showInputWarning("Solo se permiten números del 1 al 9");
                    }
                });
            }
        }
    }

    // Muestra la solución completa del tablero y desactiva inputs
    function showSolution() {
        const inputs = document.querySelectorAll('#sudoku-board input');

        inputs.forEach(input => {
            if (!input.disabled) {
                const row = parseInt(input.dataset.row);
                const col = parseInt(input.dataset.col);
                const correctValue = solutionBoard[row][col];
                input.value = correctValue;
                input.classList.add('solved');
                input.disabled = true;
            }
        });

        showSolvedMessage();
        document.getElementById('check-btn').disabled = true;
    }

    // Verifica si la solución ingresada por el usuario es válida
    function checkSolution() {
        const board = getCurrentBoard();
        const inputs = document.querySelectorAll('#sudoku-board input');
        let hasErrors = false;
        let hasEmptyCells = false;

        inputs.forEach(input => input.classList.remove('error'));

        inputs.forEach(input => {
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            const value = parseInt(input.value);

            if (!input.disabled) {
                if (!value) {
                    hasEmptyCells = true;
                    return;
                }

                board[row][col] = 0;
                const valid = isValid(board, row, col, value);
                board[row][col] = value;

                if (!valid) {
                    input.classList.add('error');
                    hasErrors = true;
                }
            }
        });

        const messageEl = document.getElementById('game-message');
        const checkBtn = document.getElementById('check-btn');

        if (hasErrors) {
            messageEl.textContent = 'La solución tiene errores. Verificá filas, columnas y bloques.';
            messageEl.classList.remove('text-success');
            messageEl.classList.add('text-danger');
        } else if (!hasEmptyCells) {
            messageEl.textContent = '¡Correcto! Has resuelto el Sudoku.';
            messageEl.classList.remove('text-danger');
            messageEl.classList.add('text-success');
            checkBtn.disabled = true;
        } else {
            messageEl.textContent = '';
            messageEl.classList.remove('text-danger', 'text-success');
        }
    }
});
