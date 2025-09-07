const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const checkBtn = document.getElementById('checkBtn');
const historyEl = document.getElementById('history');
const feedbackEl = document.getElementById('feedback');
const operationRadios = document.querySelectorAll('input[name="operation"]');
const FEEDBACK_DURATION = 1000;
const translations = {
    en: {
        title: "Solve for Reward",
        grade: "Grade",
        type: "Type",
        answerPlaceholder: "Answer",
        submit: "Submit",
        wellDone: "🎉 Well done!"
    },
    ru: {
        title: "Реши за награду",
        grade: "Класс",
        type: "Тип",
        answerPlaceholder: "Ответ",
        submit: "Проверить",
        wellDone: "🎉 Молодец!"
    },
    de: {
        title: "Löse für Belohnung",
        grade: "Klasse",
        type: "Typ",
        answerPlaceholder: "Antwort",
        submit: "Überprüfen",
        wellDone: "🎉 Gut gemacht!"
    },
    uk: {
        title: "Розв’яжи за нагороду",
        grade: "Клас",
        type: "Тип",
        answerPlaceholder: "Відповідь",
        submit: "Перевірити",
        wellDone: "🎉 Молодець!"
    }
};

let currentLanguage = 'en';
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

const gradeRadios = document.querySelectorAll('input[name="grade"]');
const multiplyLabel = document.querySelector('.multiply-label');
const divideLabel = document.querySelector('.divide-label');

function updateGradeVisibility() {
    const grade = document.querySelector('input[name="grade"]:checked').value;

    if (grade === "1") {
        multiplyLabel.classList.add('hidden');
        divideLabel.classList.add('hidden');

        // if multiply or divide was selected → switch back to addition
        if (currentOperation === "multiply" || currentOperation === "divide") {
            document.querySelector('input[value="add"]').checked = true;
            currentOperation = "add";
        }
    } else {
        multiplyLabel.classList.remove('hidden');
        divideLabel.classList.remove('hidden');
    }

    generateQuestion();
}

// listen for grade change
gradeRadios.forEach(radio => {
    radio.addEventListener('change', updateGradeVisibility);
});

// run once on page load
updateGradeVisibility();

function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

function generateQuestion() {
    const grade = document.querySelector('input[name="grade"]:checked').value;

    let a, b, answer;

    if (grade === "1") {
        // Grade 1 → only addition & subtraction, numbers up to 20
        if (currentOperation === "add") {
            a = getRandomInt(20);
            b = getRandomInt(20 - a);
            answer = a + b;
            currentQuestion = { a, b, op: "+", answer };
        } else if (currentOperation === "subtract") {
            a = getRandomInt(20);
            b = getRandomInt(a);
            answer = a - b;
            currentQuestion = { a, b, op: "−", answer };
        } else {
            // if × or ÷ selected in Grade 1 → fallback to addition
            a = getRandomInt(20);
            b = getRandomInt(20 - a);
            answer = a + b;
            currentOperation = "add";
            document.querySelector('input[value="add"]').checked = true;
            currentQuestion = { a, b, op: "+", answer };
        }

    } else if (grade === "2") {
        // Grade 2 → numbers up to 100, all 4 operations
        switch (currentOperation) {
            case "add":
                a = getRandomInt(100);
                b = getRandomInt(100 - a);
                answer = a + b;
                currentQuestion = { a, b, op: "+", answer };
                break;

            case "subtract":
                a = getRandomInt(100);
                b = getRandomInt(a);
                answer = a - b;
                currentQuestion = { a, b, op: "−", answer };
                break;

            case "multiply":
                a = getRandomInt(10); // multiplier up to 10
                b = getRandomInt(10);
                answer = a * b;
                currentQuestion = { a, b, op: "×", answer };
                break;

            case "divide":
                let divisor, quotient;
                do {
                    divisor = getRandomInt(9) + 1;   // 1..10 (never 0)
                    quotient = getRandomInt(10);     // 0..10
                    a = divisor * quotient;          // dividend (can be 0)
                } while (a > 100);                   // ensure dividend ≤ 100

                b = divisor;
                answer = quotient;
                currentQuestion = { a, b, op: "÷", answer };
                break;
        }

    } else if (grade === "3") {
        // Grade 3 → addition/subtraction up to 1000
        // but the second number never exceeds 100
        // multiplication/division same as Grade 2
        switch (currentOperation) {
            case "add":
                a = getRandomInt(1000);
                b = getRandomInt(100); // second term ≤ 100
                answer = a + b;
                currentQuestion = { a, b, op: "+", answer };
                break;

            case "subtract":
                a = getRandomInt(1000);
                b = getRandomInt(Math.min(a, 100)); // second term ≤100, but not greater than a
                answer = a - b;
                currentQuestion = { a, b, op: "−", answer };
                break;

            case "multiply":
                a = getRandomInt(10);
                b = getRandomInt(10);
                answer = a * b;
                currentQuestion = { a, b, op: "×", answer };
                break;

            case "divide":
                let divisor3, quotient3;
                do {
                    divisor3 = getRandomInt(9) + 1;  // 1..10
                    quotient3 = getRandomInt(10);   // 0..10
                    a = divisor3 * quotient3;       // dividend
                } while (a > 100);                  // dividend ≤ 100

                b = divisor3;
                answer = quotient3;
                currentQuestion = { a, b, op: "÷", answer };
                break;
        }
    }

    // Render question
    questionEl.textContent = `${currentQuestion.a} ${currentQuestion.op} ${currentQuestion.b}`;
    answerInput.value = "";
    answerInput.focus();
}

function showFeedback(correct) {
    feedbackEl.textContent = correct ? '✓' : '✘';
    feedbackEl.style.opacity = 1;
    feedbackEl.style.color = correct ? 'green' : 'red';
    setTimeout(() => { feedbackEl.style.opacity = 0; }, FEEDBACK_DURATION);
}

function addHistory(q, userAnswer) {
    const li = document.createElement('li');
    const isCorrect = userAnswer === q.answer;

    if (isCorrect) {
        li.innerHTML = `${q.a} ${q.op} ${q.b} = ${userAnswer} <span class="correct">✓</span>`;
    } else {
        li.innerHTML = `${q.a} ${q.op} ${q.b} = ${userAnswer} <span class="wrong">✘</span> <span class="correct">${q.answer}</span>`;
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
    const isGif = correctStreak % 9 === 0;
    const imageUrl = await fetchRewardImage(isGif);
    const rewardsContainer = document.getElementById('rewards');

    const wrapper = document.createElement('div');
    wrapper.className = 'reward-wrapper';

    const text = document.createElement('p');
    text.textContent = translations[currentLanguage].wellDone;
    text.className = 'reward-text';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = "Reward!";

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

function setLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];
    if (!t) return;

    // Main title
    document.getElementById("main-title").textContent = t.title;

    // Sidebar titles
    document.querySelectorAll(".sidebar-title")[0].textContent = t.grade;
    document.querySelectorAll(".sidebar-title")[1].textContent = t.type;

    // Answer input placeholder
    document.getElementById("answer").placeholder = t.answerPlaceholder;

    // Submit button
    document.getElementById("checkBtn").textContent = t.submit;

    // Reward text
    document.querySelectorAll(".reward-wrapper p").forEach(p => {
        p.textContent = t.wellDone;
    });

    // Update active button
    document.querySelectorAll(".lang-switch button").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("onclick").includes(`'${lang}'`));
    });

    // Save selected language
    localStorage.setItem("lang", lang);
}

window.addEventListener("DOMContentLoaded", () => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLanguage(savedLang);
});

generateQuestion();
