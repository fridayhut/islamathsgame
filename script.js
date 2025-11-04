// Game state
let currentNumber;
let score = 0;
let isChecked = false;
let currentDigitIndex = -1;
let remainingDigits = [];
let timeLeft = 60;
let timerInterval;
let currentGameMode = 'place-value';
let currentMathProblem = {};

// DOM elements
const numberDisplay = document.getElementById('number-display');
const thousands = document.getElementById('thousands');
const hundreds = document.getElementById('hundreds');
const tens = document.getElementById('tens');
const ones = document.getElementById('ones');
const nextButton = document.getElementById('next-button');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const mathAnswerInput = document.getElementById('math-answer');

// Add/Subtract mode elements
const startHundreds = document.getElementById('start-hundreds');
const startTens = document.getElementById('start-tens');
const startOnes = document.getElementById('start-ones');
const opHundreds = document.getElementById('op-hundreds');
const opTens = document.getElementById('op-tens');
const opOnes = document.getElementById('op-ones');
const operationSign = document.getElementById('operation-sign');
const answerHundreds = document.getElementById('answer-hundreds');
const answerTens = document.getElementById('answer-tens');
const answerOnes = document.getElementById('answer-ones');

const digitBoxes = [thousands, hundreds, tens, ones];
const placeNames = ['thousands', 'hundreds', 'tens', 'ones'];
const answerBoxes = [answerHundreds, answerTens, answerOnes];

// Initialize the game
function initGame() {
    setupEventListeners();
    generateNewNumber();
}

// Generate a random number between 1 and 9999
function generateNewNumber() {
    currentNumber = Math.floor(Math.random() * 9999) + 1;
    numberDisplay.textContent = currentNumber;
    isChecked = false;
    currentDigitIndex = -1;
    nextButton.disabled = true;
    messageDisplay.textContent = "";
    messageDisplay.className = "";
    startTimer();
    
    // Reset squishmellow
    const squishmellow = document.querySelector('.squishmellow');
    squishmellow.classList.remove('show', 'celebrate', 'happy', 'super-happy', 'excited');
    
    // Reset all boxes and enable them
    digitBoxes.forEach(box => {
        box.value = "";
        box.classList.remove("correct", "wrong");
        box.disabled = false;
        box.parentElement.style.display = "none";
    });
    
    // Initialize the random order of digits to guess
    remainingDigits = [0, 1, 2, 3];
    shuffleArray(remainingDigits);
    showNextDigit();
    startTimer();
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Reset all digit boxes
function resetDigitBoxes() {
    digitBoxes.forEach(box => {
        box.value = '';
        box.classList.remove('correct', 'wrong');
        box.parentElement.style.display = 'none';
    });
}

// Show the next digit box to guess
function showNextDigit() {
    if (remainingDigits.length > 0) {
        currentDigitIndex = remainingDigits[0];
        digitBoxes.forEach((box, index) => {
            const boxParent = box.parentElement;
            if (index === currentDigitIndex) {
                box.disabled = false;
                boxParent.style.display = "block";
                setTimeout(() => box.focus(), 100);
            } else {
                boxParent.style.display = "none";
            }
        });
        messageDisplay.textContent = "What's the " + placeNames[currentDigitIndex] + " digit?";
        messageDisplay.className = "";    } else {
        messageDisplay.textContent = "🎉 Congratulations! You've completed all place values!";
        messageDisplay.className = "success";
        nextButton.disabled = false;
        currentDigitIndex = -1;
        stopTimer();
        stopTimer();
    }
}

// Set up event listeners
function setupEventListeners() {
    digitBoxes.forEach(box => {
        // Only allow numbers
        box.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });

        // Check answer when a digit is entered
        box.addEventListener('input', (e) => {
            if (e.target.value && !isChecked) {
                checkAnswer();
            }
        });        // Handle paste event
        box.addEventListener('paste', (e) => {
            e.preventDefault();
        });
    });

    nextButton.addEventListener('click', () => {
        if (currentGameMode === 'place-value') {
            generateNewNumber();
        } else {
            displayMathProblem();
            startTimer();
            nextButton.disabled = true;
        }
    });
}

// Check the player's answer
function checkAnswer() {
    if (currentDigitIndex === -1) return;

    const numberStr = currentNumber.toString().padStart(4, "0");
    const digits = numberStr.split("");
    const currentBox = digitBoxes[currentDigitIndex];
    const userDigit = currentBox.value || "0";    if (userDigit === digits[currentDigitIndex]) {
        currentBox.classList.add("correct");
        currentBox.classList.remove("wrong");
        currentBox.disabled = true;
        score += 10;
        scoreDisplay.textContent = score;
        messageDisplay.textContent = "🎉 Correct! Great job!";
        messageDisplay.className = "success";
        
        // Animate squishmellow based on progress
        if (remainingDigits.length === 1) {
            animateSquishmellow('complete');
        } else if (score % 50 === 0) {
            animateSquishmellow('streak');
        } else {
            animateSquishmellow('correct');
        }
        
        // Move to next digit
        remainingDigits.shift();        
        celebrateCorrectAnswer(currentBox, remainingDigits.length === 0);
        setTimeout(() => {
            showNextDigit();
            isChecked = false;
        }, 1000);
    } else {
        currentBox.classList.add("wrong");
        currentBox.classList.remove("correct");
        messageDisplay.textContent = "😕 Try again! Think about the place value.";
        messageDisplay.className = "error";
        setTimeout(() => {
            currentBox.value = "";
            currentBox.classList.remove("wrong");
            currentBox.focus();
        }, 500);
    }
}

// Timer functions
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    const timerContainer = document.querySelector('.timer-container');
    timeLeft = 60;
    timerDisplay.textContent = timeLeft;
    timerContainer.classList.remove('warning');
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            timerContainer.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeOut();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function timeOut() {
    stopTimer();
    messageDisplay.textContent = "Time's up! Let's try another number.";
    messageDisplay.className = "error";
    digitBoxes.forEach(box => {
        box.disabled = true;
    });
    nextButton.disabled = false;
}

// Animation functions
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    const colors = ['#ff0000', '#ff9900', '#33cc33', '#3399ff', '#9933ff', '#ff66b2'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            opacity: 1;
            transform: rotate(${Math.random() * 360}deg);
            pointer-events: none;
            transition: all 3s ease-out;
        `;
        
        confettiContainer.appendChild(confetti);
        
        // Animate confetti falling
        setTimeout(() => {
            confetti.style.top = '100vh';
            confetti.style.opacity = '0';
        }, 0);
        
        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.removeChild(confetti);
        }, 3000);
    }
}

function celebrateCorrectAnswer(box, isLastDigit) {
    // Animate the correct digit box
    box.classList.add('celebrate');
    setTimeout(() => box.classList.remove('celebrate'), 500);

    // Animate the number display
    numberDisplay.classList.add('sparkle');
    setTimeout(() => numberDisplay.classList.remove('sparkle'), 1000);

    // Rainbow effect on message
    messageDisplay.classList.add('rainbow');
    setTimeout(() => messageDisplay.classList.remove('rainbow'), 2000);

    if (isLastDigit) {
        // Special celebration for completing the number
        createConfetti();
        score += 20; // Bonus points for completing
        scoreDisplay.classList.add('bounce');
        setTimeout(() => scoreDisplay.classList.remove('bounce'), 500);
        
        // Make the completed number float
        numberDisplay.classList.add('float');
        setTimeout(() => numberDisplay.classList.remove('float'), 3000);
    }
}

function updateProgressAnimation() {
    const progress = (4 - remainingDigits.length) / 4;
    const hue = progress * 120; // 0 is red, 120 is green
    document.querySelector('.game-container').style.backgroundColor = `hsl(${hue}, 80%, 95%)`;
}

// Squishmellow animations
function animateSquishmellow(type) {
    const squishmellow = document.querySelector('.squishmellow');
    
    // First show the squishmellow if it's hidden
    if (!squishmellow.classList.contains('show')) {
        squishmellow.classList.add('show');
    }

    // Remove all animation classes first
    squishmellow.classList.remove('celebrate', 'happy', 'super-happy', 'excited');
    
    // Add new animation classes based on type
    switch(type) {
        case 'correct':
            squishmellow.classList.add('celebrate', 'happy');
            break;
        case 'complete':
            squishmellow.classList.add('super-happy');
            break;
        case 'streak':
            squishmellow.classList.add('excited');
            break;
    }

    // Reset animations after they complete
    setTimeout(() => {
        squishmellow.classList.remove('celebrate', 'happy', 'super-happy', 'excited');
    }, 2000);
}

// Add/Subtract Game Mode Functions
function generateBoundaryNumber() {
    // Numbers near hundred boundaries (100, 200, 300, etc.)
    const boundaries = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    const selectedBoundary = boundaries[Math.floor(Math.random() * boundaries.length)];
    
    // Generate a number within ±10 of the boundary
    const offset = Math.floor(Math.random() * 21) - 10; // -10 to +10
    return selectedBoundary + offset;
}

function generateMathProblem() {
    const startNumber = generateBoundaryNumber();
    const operations = [
        { value: 1, text: '+1' },
        { value: -1, text: '-1' },
        { value: 10, text: '+10' },
        { value: -10, text: '-10' },
        { value: 100, text: '+100' },
        { value: -100, text: '-100' }
    ];
    
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const answer = startNumber + operation.value;
    
    // Make sure answer is positive and reasonable
    if (answer < 0 || answer > 999) {
        return generateMathProblem(); // Regenerate if out of bounds
    }
    
    return {
        startNumber: startNumber,
        operation: operation.text,
        operationValue: operation.value,
        answer: answer
    };
}

function displayMathProblem() {
    currentMathProblem = generateMathProblem();
    
    // Display the starting number in place value columns
    const startStr = currentMathProblem.startNumber.toString().padStart(3, '0');
    startHundreds.textContent = startStr[0];
    startTens.textContent = startStr[1];
    startOnes.textContent = startStr[2];
    
    // Display the operation sign (+ or -)
    operationSign.textContent = currentMathProblem.operationValue > 0 ? '+' : '-';
    
    // Display the operation number in place value columns
    const opValue = Math.abs(currentMathProblem.operationValue);
    const opStr = opValue.toString().padStart(3, '0');
    opHundreds.textContent = opStr[0];
    opTens.textContent = opStr[1];
    opOnes.textContent = opStr[2];
    
    // Clear and enable answer inputs
    answerBoxes.forEach(box => {
        box.value = '';
        box.classList.remove('correct', 'wrong');
        box.disabled = false;
    });
    
    // Focus on first answer box
    answerHundreds.focus();
}

function checkMathAnswer() {
    // Get user's answer from the three inputs
    const userHundreds = answerHundreds.value || '0';
    const userTens = answerTens.value || '0';
    const userOnes = answerOnes.value || '0';
    const userAnswer = parseInt(userHundreds + userTens + userOnes);
    
    // Get correct answer digits
    const correctAnswerStr = currentMathProblem.answer.toString().padStart(3, '0');
    
    // Check each digit individually
    let allCorrect = true;
    
    if (userHundreds === correctAnswerStr[0]) {
        answerHundreds.classList.add('correct');
        answerHundreds.classList.remove('wrong');
    } else {
        answerHundreds.classList.add('wrong');
        answerHundreds.classList.remove('correct');
        allCorrect = false;
    }
    
    if (userTens === correctAnswerStr[1]) {
        answerTens.classList.add('correct');
        answerTens.classList.remove('wrong');
    } else {
        answerTens.classList.add('wrong');
        answerTens.classList.remove('correct');
        allCorrect = false;
    }
    
    if (userOnes === correctAnswerStr[2]) {
        answerOnes.classList.add('correct');
        answerOnes.classList.remove('wrong');
    } else {
        answerOnes.classList.add('wrong');
        answerOnes.classList.remove('correct');
        allCorrect = false;
    }
    
    if (allCorrect) {
        score += 10;
        scoreDisplay.textContent = score;
        messageDisplay.textContent = '🎉 Correct! Great job!';
        messageDisplay.className = 'success';
        
        // Animate squishmellow
        animateSquishmellow('correct');
        
        stopTimer();
        nextButton.disabled = false;
        answerBoxes.forEach(box => box.disabled = true);
    } else {
        messageDisplay.textContent = '😕 Try again! Check each place value.';
        messageDisplay.className = 'error';
        
        setTimeout(() => {
            answerBoxes.forEach(box => {
                if (box.classList.contains('wrong')) {
                    box.value = '';
                    box.classList.remove('wrong');
                }
            });
            // Focus on first wrong box
            if (answerHundreds.value === '' || answerHundreds.classList.contains('wrong')) {
                answerHundreds.focus();
            } else if (answerTens.value === '' || answerTens.classList.contains('wrong')) {
                answerTens.focus();
            } else {
                answerOnes.focus();
            }
        }, 500);
    }
}

// Game Mode Switching
function switchGameMode(mode) {
    currentGameMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide appropriate game mode
    document.getElementById('place-value-mode').classList.remove('active');
    document.getElementById('add-subtract-mode').classList.remove('active');
    
    if (mode === 'place-value') {
        document.getElementById('place-value-mode').classList.add('active');
        generateNewNumber();
    } else {
        document.getElementById('add-subtract-mode').classList.add('active');
        displayMathProblem();
        startTimer();
    }
    
    // Reset score and message
    score = 0;
    scoreDisplay.textContent = score;
    messageDisplay.textContent = '';
    nextButton.disabled = true;
}

// Start the game when the page loads
window.addEventListener('load', () => {
    initGame();
    
    // Add event listeners for game mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchGameMode(btn.dataset.mode);
        });
    });
    
    // Add event listener for math answer input
    if (mathAnswerInput) {
        mathAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkMathAnswer();
            }
        });
    }
    
    // Add event listeners for place value answer boxes
    answerBoxes.forEach((box, index) => {
        // Only allow numbers
        box.addEventListener('keypress', (e) => {
            if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
            }
        });
        
        // Auto-move to next box and check when filled
        box.addEventListener('input', (e) => {
            if (e.target.value) {
                // Move to next box
                if (index < answerBoxes.length - 1) {
                    answerBoxes[index + 1].focus();
                } else {
                    // All boxes filled, check answer
                    checkMathAnswer();
                }
            }
        });
        
        // Handle backspace to move to previous box
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                answerBoxes[index - 1].focus();
            }
        });
    });
});
