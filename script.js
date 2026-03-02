/**************** FIREBASE CONFIG ****************/
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "XXXX",
    appId: "XXXX"
};

// COMMENT THESE TWO LINES IF FIREBASE IS NOT USED
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/**************** GLOBAL VARIABLES ****************/
let dailyChart;
let weeklyChart;
let weeklyData = JSON.parse(localStorage.getItem("weeklyData")) || [];

/**************** FORM HANDLER ****************/
document.getElementById("healthForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const heartRate = +heartRateInput.value;
    const steps = +stepsInput.value;
    const sleepScore = +sleepScoreInput.value;
    const weight = +weightInput.value;
    const height = +heightInput.value;
    const sysBP = +sysBPInput.value;
    const diaBP = +diaBPInput.value;

    if (sysBP < diaBP) {
        alert("Invalid BP values");
        return;
    }

    const bmi = calculateBMI(weight, height);

    output.innerText = healthStatus(heartRate, sleepScore, sysBP, diaBP, bmi, steps);
    aiInsight.innerText = generateAIInsight(heartRate, sleepScore, bmi, steps);

    generateDailyChart(heartRate, sleepScore, steps);
    generateDietPlan(bmi);
    generateWorkoutPlan(bmi, steps, sleepScore);

    saveWeeklyData(heartRate, sleepScore, steps);
    generateWeeklyChart();

    // FIREBASE SAVE
    db.collection("healthRecords").add({
        heartRate, sleepScore, steps, bmi, sysBP, diaBP,
        timestamp: new Date()
    });
});

/**************** FUNCTIONS ****************/
function calculateBMI(w, h) {
    h = h / 100;
    return (w / (h * h)).toFixed(1);
}

function healthStatus(hr, sleep, sys, dia, bmi, steps) {
    if (hr > 100 || sys > 140 || dia > 90)
        return "⚠ High health risk detected.";
    if (sleep < 60)
        return "⚠ Poor sleep quality.";
    if (bmi >= 30)
        return "⚠ Obesity detected.";
    if (steps < 5000)
        return "⚠ Low physical activity.";
    return "✅ Health parameters are normal.";
}

function generateAIInsight(hr, sleep, bmi, steps) {
    if (sleep < 60) return "AI Insight: Sleep deprivation may impact immunity.";
    if (hr > 100) return "AI Insight: Elevated heart rate detected.";
    if (bmi >= 30) return "AI Insight: High BMI indicates long-term risk.";
    if (steps < 5000) return "AI Insight: Increase daily activity gradually.";
    return "AI Insight: Health indicators are stable.";
}

function generateDailyChart(hr, sleep, steps) {
    if (dailyChart) dailyChart.destroy();

    dailyChart = new Chart(healthChart, {
        type: "bar",
        data: {
            labels: ["Heart Rate", "Sleep Score", "Steps"],
            datasets: [{
                data: [hr, sleep, steps],
                backgroundColor: ["red", "blue", "green"]
            }]
        }
    });
}

function saveWeeklyData(hr, sleep, steps) {
    weeklyData.push({
        date: new Date().toLocaleDateString(),
        heartRate: hr,
        sleepScore: sleep,
        steps: steps
    });

    if (weeklyData.length > 7) weeklyData.shift();
    localStorage.setItem("weeklyData", JSON.stringify(weeklyData));
}

function generateWeeklyChart() {
    if (weeklyChart) weeklyChart.destroy();

    weeklyChart = new Chart(weeklyChartCanvas, {
        type: "line",
        data: {
            labels: weeklyData.map(d => d.date),
            datasets: [
                { label: "Heart Rate", data: weeklyData.map(d => d.heartRate), borderColor: "red" },
                { label: "Sleep", data: weeklyData.map(d => d.sleepScore), borderColor: "blue" },
                { label: "Steps", data: weeklyData.map(d => d.steps), borderColor: "green" }
            ]
        }
    });
}

function generateDietPlan(bmi) {
    dietPlan.innerText =
        bmi >= 30 ? "Low-carb, high-fiber diet." :
        bmi >= 25 ? "Balanced calorie-controlled diet." :
        "Maintain balanced nutrition.";
}

function generateWorkoutPlan(bmi, steps, sleep) {
    workoutPlan.innerText =
        sleep < 60 ? "Yoga and light stretching." :
        bmi >= 30 ? "Low-impact cardio (walking)." :
        steps < 5000 ? "Brisk walking 30 minutes." :
        "Strength + cardio training.";
}