import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { RandomForestClassifier } from 'ml-random-forest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Label encoding map
const LABEL_MAP = { Low: 0, Moderate: 1, High: 2 };
const LABEL_DECODE = { 0: 'Low', 1: 'Moderate', 2: 'High' };

const FEATURE_COLS = [
  'Study_Hours_Per_Day',
  'Extracurricular_Hours_Per_Day',
  'Sleep_Hours_Per_Day',
  'Social_Hours_Per_Day',
  'Physical_Activity_Hours_Per_Day',
];

let classifier = null;
let modelReady = false;

// ──────────────────────────────────────────────
// Train the model once when the server boots
// ──────────────────────────────────────────────
function loadAndTrain() {
  return new Promise((resolve, reject) => {
    const rows = [];
    const csvPath = path.join(__dirname, '..', 'data', 'stress_training_data.csv');

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Skip rows with empty or invalid data
        const valid = FEATURE_COLS.every(
          (col) => row[col] !== undefined && row[col] !== ''
        );
        if (valid && row.Stress_Level && LABEL_MAP[row.Stress_Level] !== undefined) {
          rows.push(row);
        }
      })
      .on('end', () => {
        if (rows.length === 0) {
          return reject(new Error('No valid rows found in CSV'));
        }

        const X = rows.map((r) =>
          FEATURE_COLS.map((col) => parseFloat(r[col]))
        );
        const Y = rows.map((r) => LABEL_MAP[r.Stress_Level]);

        console.log(`📊 Training stress model on ${rows.length} samples…`);

        classifier = new RandomForestClassifier({
          nEstimators: 50,
          maxDepth: 10,
          seed: 42,
        });
        classifier.train(X, Y);
        modelReady = true;

        console.log('✅ Stress ML model trained successfully');
        resolve();
      })
      .on('error', reject);
  });
}

// Start training immediately on import
const trainingPromise = loadAndTrain().catch((err) => {
  console.error('❌ ML model training failed:', err.message);
});

// ──────────────────────────────────────────────
// Generate actionable suggestions
// ──────────────────────────────────────────────
function buildSuggestions(input, level) {
  const [study, extra, sleep, social, physical] = input;
  const tips = [];

  if (level === 'High') {
    if (study > 8)
      tips.push('Your study hours are very high. Try capping study time at 7-8 hrs and take short breaks every 45 min.');
    if (sleep < 6)
      tips.push('You are sleep-deprived. Aim for at least 7 hours of sleep to improve focus and reduce stress.');
    if (physical < 1)
      tips.push('Almost no physical activity detected. Even a 20-minute walk can reduce cortisol levels significantly.');
    if (social < 1)
      tips.push('Very low social interaction. Connect with friends or family for at least 30 min — social support buffers stress.');
    if (study > 7 && sleep < 7)
      tips.push('Your study-to-sleep ratio is concerning. Swap 1 hour of late-night studying for sleep.');
  } else if (level === 'Moderate') {
    if (sleep < 7)
      tips.push('Slightly low sleep. Try to get 7-8 hours for better cognitive performance.');
    if (physical < 2)
      tips.push('Add 30 more minutes of exercise — yoga or jogging can drop stress from moderate to low.');
    if (extra > 4)
      tips.push('Extracurricular load is high. Consider prioritizing the top 2 activities that matter most.');
    if (study > 7)
      tips.push('Study hours are above average. Use the Pomodoro technique (25 min study / 5 min break) to stay efficient.');
  } else {
    tips.push('Great balance! Keep maintaining your current routine.');
    if (physical >= 3)
      tips.push('Excellent physical activity — this is a major factor keeping your stress low.');
    if (sleep >= 7)
      tips.push('Your sleep schedule is healthy. Consistency is key — keep your bedtime steady.');
  }

  return tips.length > 0 ? tips.join(' ') : 'Maintain your current lifestyle balance.';
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────
export async function predictStress(studentInputsArray) {
  // Wait for model if it hasn't finished training yet
  await trainingPromise;

  if (!modelReady || !classifier) {
    throw new Error('ML model is not ready yet. Please try again shortly.');
  }

  const prediction = classifier.predict([studentInputsArray]);
  const label = LABEL_DECODE[prediction[0]];
  const suggestions = buildSuggestions(studentInputsArray, label);

  return { predictedStressLevel: label, suggestions };
}
