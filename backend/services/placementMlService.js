import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEATURE_COLS = [
  'branch',
  'cgpa',
  'internship_count',
  'project_count',
  'certifications_count',
  'coding_skills_score',
  'communication_skills_score',
  'soft_skills_score',
  'hackathon_participation',
];

let modelWeights = null;
let modelBias = null;
let featureMeans = null;
let featureStds = null;
let modelReady = false;
let trainingPromise = null;
const MODEL_CACHE_PATH = path.join(__dirname, '..', 'models', 'placement_model.json');

// ─── Sigmoid function ───
function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

// ─── StandardScaler: fit ───
function fitScaler(X) {
  const n = X.length;
  const m = X[0].length;
  const means = new Array(m).fill(0);
  const stds = new Array(m).fill(0);

  for (let j = 0; j < m; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += X[i][j];
    means[j] = sum / n;
  }

  for (let j = 0; j < m; j++) {
    let sumSq = 0;
    for (let i = 0; i < n; i++) sumSq += (X[i][j] - means[j]) ** 2;
    stds[j] = Math.sqrt(sumSq / n) || 1; // avoid divide by zero
  }

  return { means, stds };
}

// ─── StandardScaler: transform ───
function scaleFeatures(X, means, stds) {
  return X.map((row) =>
    row.map((val, j) => (val - means[j]) / stds[j])
  );
}

function scaleSingle(row, means, stds) {
  return row.map((val, j) => (val - means[j]) / stds[j]);
}

// ─── Logistic Regression: train via gradient descent ───
function trainLogisticRegression(X, y, learningRate = 0.01, iterations = 2000) {
  const n = X.length;
  const m = X[0].length;
  const weights = new Array(m).fill(0);
  let bias = 0;

  for (let iter = 0; iter < iterations; iter++) {
    const dw = new Array(m).fill(0);
    let db = 0;

    for (let i = 0; i < n; i++) {
      let z = bias;
      for (let j = 0; j < m; j++) z += weights[j] * X[i][j];
      const pred = sigmoid(z);
      const err = pred - y[i];

      for (let j = 0; j < m; j++) dw[j] += err * X[i][j];
      db += err;
    }

    for (let j = 0; j < m; j++) weights[j] -= (learningRate / n) * dw[j];
    bias -= (learningRate / n) * db;
  }

  return { weights, bias };
}

// ─── Load CSV and train ───
function loadAndTrain() {
  return new Promise((resolve, reject) => {
    const rows = [];
    const csvPath = path.join(__dirname, '..', 'data', 'placement_training_data.csv');
    const trainStart = Date.now();

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        const valid = FEATURE_COLS.every(
          (col) => row[col] !== undefined && row[col] !== ''
        );
        if (valid && row.placement_probability !== undefined && row.placement_probability !== '') {
          rows.push(row);
        }
      })
      .on('end', () => {
        if (rows.length === 0) {
          return reject(new Error('No valid rows found in placement CSV'));
        }

        const X = rows.map((r) =>
          FEATURE_COLS.map((col) => parseFloat(r[col]))
        );
        // Normalize target to 0-1 range for logistic regression
        const yRaw = rows.map((r) => parseFloat(r.placement_probability));
        const y = yRaw.map((v) => v / 100);

        console.log(`📊 Training placement model on ${rows.length} samples…`);

        // Fit scaler
        const { means, stds } = fitScaler(X);
        featureMeans = means;
        featureStds = stds;

        // Scale features
        const XScaled = scaleFeatures(X, means, stds);

        // Train logistic regression
        const { weights, bias } = trainLogisticRegression(XScaled, y, 0.05, 3000);
        modelWeights = weights;
        modelBias = bias;
        modelReady = true;

        // Save model
        const modelDir = path.join(__dirname, '..', 'models');
        if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, { recursive: true });

        const modelData = { weights, bias, means, stds, featureNames: FEATURE_COLS };
        try {
          fs.writeFileSync(MODEL_CACHE_PATH, JSON.stringify(modelData));
          console.log('💾 Placement model saved');
        } catch (e) {
          console.warn('⚠️ Could not save placement model cache:', e.message);
        }

        console.log(`✅ Placement model trained in ${Date.now() - trainStart} ms`);
        resolve();
      })
      .on('error', reject);
  });
}

function tryLoadCachedModel() {
  try {
    if (!fs.existsSync(MODEL_CACHE_PATH)) return false;
    const raw = fs.readFileSync(MODEL_CACHE_PATH, 'utf-8');
    const model = JSON.parse(raw);
    modelWeights = model.weights;
    modelBias = model.bias;
    featureMeans = model.means;
    featureStds = model.stds;
    modelReady = true;
    console.log('⚡ Placement model loaded from cache');
    return true;
  } catch (e) {
    console.warn('⚠️ Placement model cache invalid, retraining:', e.message);
    return false;
  }
}

async function ensureModelReady() {
  if (modelReady && modelWeights) return;
  if (!trainingPromise) {
    trainingPromise = (async () => {
      const loaded = tryLoadCachedModel();
      if (loaded) return;
      await loadAndTrain();
    })().catch((err) => {
      modelReady = false;
      modelWeights = null;
      throw err;
    });
  }
  await trainingPromise;
}

export function warmupPlacementModel() {
  ensureModelReady().catch((err) => {
    console.error('❌ Placement ML warmup failed:', err.message);
  });
}

// ─── Predict placement probability ───
export async function predictPlacement(inputObj) {
  await ensureModelReady();
  if (!modelReady || !modelWeights) {
    throw new Error('Placement model is not ready yet. Please try again shortly.');
  }

  const features = FEATURE_COLS.map((col) => parseFloat(inputObj[col]));
  const scaled = scaleSingle(features, featureMeans, featureStds);

  let z = modelBias;
  for (let j = 0; j < scaled.length; j++) z += modelWeights[j] * scaled[j];
  const prob = sigmoid(z);
  const percentage = Math.max(0, Math.min(100, Math.round(prob * 100)));

  // Compute SHAP-like feature contributions (coefficient × scaled_value)
  const contributions = FEATURE_COLS.map((name, j) => ({
    feature: name,
    contribution: parseFloat((modelWeights[j] * scaled[j]).toFixed(4)),
    absContribution: parseFloat(Math.abs(modelWeights[j] * scaled[j]).toFixed(4)),
  }));
  contributions.sort((a, b) => b.absContribution - a.absContribution);

  // Generate improvement suggestions
  const suggestions = generateSuggestions(inputObj, contributions, percentage);

  return {
    placement_probability: percentage,
    feature_contributions: contributions,
    suggestions,
  };
}

// ─── Generate improvement suggestions ───
function generateSuggestions(input, contributions, probability) {
  const tips = [];

  if (parseFloat(input.coding_skills_score) < 0.7) {
    tips.push('Increase your coding skills score by practicing on platforms like LeetCode, HackerRank, or CodeChef.');
  }
  if (parseInt(input.hackathon_participation) === 0) {
    tips.push('Participate in hackathons to demonstrate problem-solving skills and teamwork abilities.');
  }
  if (parseFloat(input.communication_skills_score) < 0.7) {
    tips.push('Improve communication skills through public speaking, group discussions, or joining a debate club.');
  }
  if (parseInt(input.internship_count) < 2) {
    tips.push('Gain more internship experience to build industry exposure and practical skills.');
  }
  if (parseInt(input.certifications_count) < 2) {
    tips.push('Earn additional certifications in your domain to strengthen your profile.');
  }
  if (parseFloat(input.cgpa) < 7.0) {
    tips.push('Focus on improving your CGPA as it is an important screening criterion for many companies.');
  }
  if (parseInt(input.project_count) < 3) {
    tips.push('Work on more projects to showcase your practical skills and initiative.');
  }
  if (parseFloat(input.soft_skills_score) < 0.7) {
    tips.push('Develop soft skills like teamwork, leadership, and adaptability through group activities and volunteering.');
  }

  if (probability >= 80 && tips.length === 0) {
    tips.push('Excellent profile! Keep maintaining your current performance and stay updated with industry trends.');
  }

  return tips;
}
