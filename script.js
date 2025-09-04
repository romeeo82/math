const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const checkBtn = document.getElementById('checkBtn');
const historyEl = document.getElementById('history');
const feedbackEl = document.getElementById('feedback');
const operationRadios = document.querySelectorAll('input[name="operation"]');

let currentOperation = 'add';
let currentQuestion = {};

operationRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        currentOperation = document.querySelector('input[name="operation"]:checked').value;
        generateQuestion();
    });
});

function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

function generateQuestion() {
    let a, b, answer;
    switch(currentOperation) {
        case 'add':
            a = getRandomInt(100);
            b = getRandomInt(100 - a);
            answer = a + b;
            currentQuestion = {a, b, op: '+', answer};
            break;
        case 'subtract':
            a = getRandomInt(100);
            b = getRandomInt(a);
            answer = a - b;
            currentQuestion = {a, b, op: '−', answer};
            break;
        case 'multiply':
            a = getRandomInt(12);
            b = getRandomInt(Math.floor(100 / (a || 1)));
            answer = a * b;
            currentQuestion = {a, b, op: '×', answer};
            break;
        case 'divide':
            b = getRandomInt(12) + 1;
            answer = getRandomInt(Math.floor(100 / b));
            a = answer * b;
            currentQuestion = {a, b, op: '÷', answer};
            break;
    }
    questionEl.textContent = `${currentQuestion.a} ${currentQuestion.op} ${currentQuestion.b}`;
    answerInput.value = '';
    answerInput.focus();
}

function showFeedback(correct) {
    feedbackEl.textContent = correct ? '✔' : '❌';
    feedbackEl.style.opacity = 1;
    feedbackEl.style.color = correct ? 'green' : 'red';
    setTimeout(() => {
        feedbackEl.style.opacity = 0;
    }, 800);
}

function addHistory(q, userAnswer) {
    const li = document.createElement('li');
    const isCorrect = userAnswer === q.answer;
    li.innerHTML = `${q.a} ${q.op} ${q.b} = ${userAnswer} <span class="${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '✔' : '❌'}</span>`;
    historyEl.prepend(li);
}

function checkAnswer() {
    if (answerInput.value === '') return;
    const userAnswer = Number(answerInput.value);
    const correct = userAnswer === currentQuestion.answer;
    showFeedback(correct);
    addHistory(currentQuestion, userAnswer);
    generateQuestion();
}

checkBtn.addEventListener('click', checkAnswer);

answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && answerInput.value !== '') {
        checkAnswer();
    }
});

// Генерация первой задачи
generateQuestion();
