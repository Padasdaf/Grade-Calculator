// Generate 10 quizzes dynamically
const quizzesContainer = document.getElementById('quizzes-container');
const droppedQuizIndicator = document.getElementById('dropped-quiz');
const finalWeightText = document.getElementById('final-weight');

for (let i = 1; i <= 10; i++) {
    const quizDiv = document.createElement('div');
    quizDiv.classList.add('quiz-container');
    quizDiv.innerHTML = `
        <label for="quiz${i}">Quiz ${i}: <span id="quiz${i}-score">0</span>%</label><br>
        <input type="range" id="quiz${i}" min="0" max="100" value="0">
        <input type="checkbox" id="quiz${i}-exempt"> Exempt
    `;
    quizzesContainer.appendChild(quizDiv);
}

// Select elements
const participationSlider = document.getElementById('participation');
const midtermSlider = document.getElementById('midterm');
const finalSlider = document.getElementById('final');
const midtermExemptCheckbox = document.getElementById('midterm-exempt');
const quizSliders = [];
const quizExemptCheckboxes = [];

for (let i = 1; i <= 10; i++) {
    quizSliders.push(document.getElementById(`quiz${i}`));
    quizExemptCheckboxes.push(document.getElementById(`quiz${i}-exempt`));
}

const participationScore = document.getElementById('participation-score');
const midtermScore = document.getElementById('midterm-score');
const finalScore = document.getElementById('final-score');
const totalGrade = document.getElementById('total-grade');
const targetGrade = document.getElementById('target-grade');
const requiredMarksOutput = document.getElementById('required-marks');

// Event listeners for sliders and checkboxes
participationSlider.addEventListener('input', calculateGrade);
midtermSlider.addEventListener('input', calculateGrade);
finalSlider.addEventListener('input', calculateGrade);
midtermExemptCheckbox.addEventListener('change', calculateGrade);
quizSliders.forEach((slider, index) => {
    slider.addEventListener('input', () => updateQuizScore(index));
});
quizExemptCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', calculateGrade);
});

// Function to update the displayed quiz score
function updateQuizScore(index) {
    const quizScoreElement = document.getElementById(`quiz${index + 1}-score`);
    quizScoreElement.textContent = quizSliders[index].value;
    calculateGrade(); // Recalculate the total grade whenever a quiz is updated
}

// Function to calculate the total grade
function calculateGrade() {
    // Get participation value
    const participationValue = parseInt(participationSlider.value);
    participationScore.textContent = participationValue;

    // Determine participation bonus
    let bonus = 0;
    if (participationValue >= 80) {
        bonus = 2;
    } else if (participationValue >= 60) {
        bonus = 1;
    }

    // Get quiz values and check for exemptions
    const quizValues = quizSliders.map((slider, index) => {
        return quizExemptCheckboxes[index].checked ? null : parseInt(slider.value);
    });

    // Filter out exempt quizzes
    const nonExemptQuizzes = quizValues.filter(value => value !== null);

    // If more than 1 non-exempt quiz, drop the lowest score
    let droppedQuizIndex = null;
    if (nonExemptQuizzes.length > 1) {
        const sortedQuizzes = [...nonExemptQuizzes].sort((a, b) => b - a); // Sort quizzes in descending order
        droppedQuizIndex = quizValues.indexOf(sortedQuizzes[sortedQuizzes.length - 1]);
        nonExemptQuizzes.pop(); // Drop the lowest quiz
    }

    // Show which quiz is dropped
    if (droppedQuizIndex !== null) {
        droppedQuizIndicator.textContent = `Dropped quiz: Quiz ${droppedQuizIndex + 1}`;
    } else {
        droppedQuizIndicator.textContent = '';
    }

    // Calculate new quiz weight based on the number of non-exempt quizzes
    const quizWeight = 0.20 / (nonExemptQuizzes.length);

    // Calculate the average of non-exempt quizzes
    const quizAverage = nonExemptQuizzes.reduce((acc, val) => acc + val, 0) * quizWeight;

    // Get midterm and final values
    const midtermValue = parseInt(midtermSlider.value);
    const finalValue = parseInt(finalSlider.value);

    // Check if midterm is exempt
    let midtermWeight = 0.30;
    let finalWeight = 0.50;

    if (midtermExemptCheckbox.checked) {
        midtermWeight = 0; // No weight for midterm if exempt
        finalWeight = 0.80; // Final gets reweighted to 80%
        finalWeightText.textContent = "80"; // Update final exam weight description
    } else {
        finalWeightText.textContent = "50"; // Restore original weight if midterm is not exempt
    }

    // Update displayed scores
    midtermScore.textContent = midtermValue;
    finalScore.textContent = finalValue;

    // Calculate total grade based on weights and bonus
    const total = (quizAverage) + (midtermValue * midtermWeight) + (finalValue * finalWeight) + bonus;

    // Display total grade
    totalGrade.textContent = total.toFixed(2);
}

// Function to calculate required marks to reach the target grade
function calculateRequiredMarks() {
    const currentTotal = parseFloat(totalGrade.textContent);
    const target = parseFloat(targetGrade.value);

    if (isNaN(target)) {
        requiredMarksOutput.textContent = 'Please enter a valid target grade.';
        return;
    }

    // Check if the midterm is exempt and adjust remaining weight
    const remainingWeight = midtermExemptCheckbox.checked ? 0.80 : 0.50;

    const requiredFinalExam = (target - currentTotal) / remainingWeight;

    if (requiredFinalExam <= 100 && requiredFinalExam >= 0) {
        requiredMarksOutput.textContent = `You need to score ${requiredFinalExam.toFixed(2)}% on the final exam to achieve your target of ${target}%.`;
    } else if (requiredFinalExam > 100) {
        requiredMarksOutput.textContent = `You need more than 100% on the final exam to reach your target.`;
    } else {
        requiredMarksOutput.textContent = `You have already exceeded your target grade.`;
    }
}
