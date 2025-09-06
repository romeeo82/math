const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const checkBtn = document.getElementById('checkBtn');
const historyEl = document.getElementById('history');
const feedbackEl = document.getElementById('feedback');
const operationRadios = document.querySelectorAll('input[name="operation"]');

let currentOperation = 'add';
let currentQuestion = {};
let correctStreak = 0;
const usedUrls = new Set();

// Counters
let totalCount = 0;
let correctCount = 0;
let wrongCount = 0;

const totalEl = document.getElementById('total');
const correctEl = document.getElementById('correct');
const wrongEl = document.getElementById('wrong');

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
    switch (currentOperation) {
        case 'add':
            a = getRandomInt(100);
            b = getRandomInt(100 - a);
            answer = a + b;
            currentQuestion = { a, b, op: '+', answer };
            break;
        case 'subtract':
            a = getRandomInt(100);
            b = getRandomInt(a);
            answer = a - b;
            currentQuestion = { a, b, op: '−', answer };
            break;
        case 'multiply':
            a = getRandomInt(12);
            b = getRandomInt(Math.floor(100 / (a || 1)));
            answer = a * b;
            currentQuestion = { a, b, op: '×', answer };
            break;
        case 'divide':
            b = getRandomInt(12) + 1;
            answer = getRandomInt(Math.floor(100 / b));
            a = answer * b;
            currentQuestion = { a, b, op: '÷', answer };
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
    }, 1000);
}

function addHistory(q, userAnswer) {
    const li = document.createElement('li');
    const isCorrect = userAnswer === q.answer;

    if (isCorrect) {
        li.innerHTML = `${q.a} ${q.op} ${q.b} = ${userAnswer} <span class="correct">✔</span>`;
    } else {
        li.innerHTML = `${q.a} ${q.op} ${q.b} = ${userAnswer} <span class="wrong">❌</span> <span class="correct">${q.answer}</span>`;
    }

    historyEl.prepend(li);
}

function updateCounters(correct) {
    totalCount++;
    if (correct) correctCount++;
    else wrongCount++;

    totalEl.textContent = totalCount;
    correctEl.textContent = correctCount;
    wrongEl.textContent = wrongCount;
}

// Fetch images and GIFs
async function fetchRewardImage(isGif = false) {
    const gifAPIs = [
        'https://cataas.com/cat/gif?json=true',
        'https://api.thecatapi.com/v1/images/search?mime_types=gif'
    ];

    const normalAPIs = [
        'https://randomfox.ca/floof/',
        'https://random.dog/woof.json',
        'https://cataas.com/cat?json=true',
        'https://api.thecatapi.com/v1/images/search'
    ];

    const candidateAPIs = isGif ? gifAPIs : normalAPIs;

    while (true) {
        const api = candidateAPIs[Math.floor(Math.random() * candidateAPIs.length)];
        const res = await fetch(api);
        const data = await res.json();
        let url = '';

        if (api.includes('randomfox')) url = data.image;
        else if (api.includes('random.dog')) url = data.url;
        else if (api.includes('cataas')) url = data.url.startsWith('http') ? data.url : 'https://cataas.com' + data.url;
        else if (api.includes('thecatapi')) url = data[0].url;

        if (url && !url.match(/\.(mp4|webm|avi|mov)$/i) && !usedUrls.has(url)) {
            usedUrls.add(url);
            return url;
        }
    }
}

async function showReward() {
    // every 9th correct answer, reward = GIF
    const isGif = correctStreak % 9 === 0;
    const imageUrl = await fetchRewardImage(isGif);
    const rewardsContainer = document.getElementById('rewards');

    const wrapper = document.createElement('div');
    wrapper.className = 'reward-wrapper';
    wrapper.style.marginTop = '20px';
    wrapper.style.textAlign = 'center';

    const text = document.createElement('p');
    text.textContent = "🎉 Well done!";
    text.style.fontWeight = 'bold';
    text.style.fontSize = '1.1em';
    text.style.marginBottom = '8px';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = "Reward!";
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.borderRadius = '8px';
    img.style.display = 'block';
    img.style.marginLeft = 'auto';
    img.style.marginRight = 'auto';

    wrapper.appendChild(text);
    wrapper.appendChild(img);
    rewardsContainer.prepend(wrapper);

    img.onload = () => {
        requestAnimationFrame(() => {
            wrapper.classList.add('show');
        });
    };
}

function checkAnswer() {
    if (answerInput.value === '') return;
    const userAnswer = Number(answerInput.value);
    const correct = userAnswer === currentQuestion.answer;

    showFeedback(correct);
    addHistory(currentQuestion, userAnswer);
    updateCounters(correct);

    if (correct) {
        correctStreak++;
        if (correctStreak % 3 === 0) showReward();
    }

    generateQuestion();
}

checkBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && answerInput.value !== '') checkAnswer();
});

generateQuestion();
