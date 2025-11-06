import { initialiseStats, renderStats } from './progress-tracker.js';
import { prepareQuizUI, persistQuizResult } from './quiz-handler.js';

const metadataPath = '../data/metadata/content-index.json';
const passageBasePath = '../';

const passageContainer = document.getElementById('passageContent');
const questionsContainer = document.getElementById('questionsContent');
const vocabContainer = document.getElementById('vocabList');
const vocabHelper = document.getElementById('vocabularyHelper');
const questionActions = document.getElementById('questionActions');
const submitBtn = document.getElementById('submitBtn');
const explanationBtn = document.getElementById('explanationBtn');
const nextBtn = document.getElementById('nextBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreValue = document.getElementById('scoreValue');
const scorePercentage = document.getElementById('scorePercentage');
const passageTitleNode = document.getElementById('passageTitle');
const passageCategoryNode = document.getElementById('passageCategory');
const passageDifficultyNode = document.getElementById('passageDifficulty');
const passageTimeNode = document.getElementById('passageTime');
const timerDisplay = document.getElementById('timerDisplay');

let metadata = null;
let currentPassage = null;
let quizHandle = null;
let timerInterval = null;
let timerSeconds = 0;

function formatDifficulty(level) {
  const map = {
    1: '★☆☆☆ (やさしい)',
    2: '★★☆☆ (やや易)',
    3: '★★★☆ (ふつう)',
    4: '★★★★ (やや難)',
    5: '★★★★★ (難しい)'
  };
  return map[level] || 'N/A';
}

async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

async function loadMetadata() {
  if (metadata) return metadata;
  metadata = await fetchJSON(metadataPath);
  return metadata;
}

async function loadPassage(passageId) {
  const meta = await loadMetadata();
  const entry = meta.passages.find((p) => p.id === passageId);
  if (!entry) {
    throw new Error(`Passage ${passageId} not found in metadata.`);
  }
  const data = await fetchJSON(passageBasePath + entry.filePath);
  return { data, entry };
}

function resetTimer() {
  clearInterval(timerInterval);
  timerSeconds = 0;
  timerDisplay.textContent = '00:00';
}

function startTimer() {
  resetTimer();
  timerInterval = setInterval(() => {
    timerSeconds += 1;
    const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const seconds = (timerSeconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function showVocabularyHelper() {
  if (vocabHelper) {
    vocabHelper.classList.remove('collapsed');
  }
}

function closeVocabularyHelper() {
  if (vocabHelper) {
    vocabHelper.classList.add('collapsed');
  }
}

function toggleVocabularyHelper() {
  if (vocabHelper) {
    vocabHelper.classList.toggle('collapsed');
  }
}

function updatePassageMeta(entry) {
  if (passageTitleNode) passageTitleNode.textContent = entry.title;
  if (passageCategoryNode) passageCategoryNode.textContent = entry.category ? `カテゴリ: ${entry.category}` : '';
  if (passageDifficultyNode) passageDifficultyNode.textContent = `難易度: ${formatDifficulty(entry.difficulty)}`;
  if (passageTimeNode) passageTimeNode.textContent = `目安: 約${entry.estimatedTime}分`;
}

function updateScoreDisplay(results) {
  if (!scoreDisplay || !scoreValue) return;
  scoreValue.textContent = `${results.correctCount}/${results.totalQuestions}`;
  const percentage = Math.round((results.correctCount / results.totalQuestions) * 100);
  scorePercentage.textContent = `正答率: ${percentage}%`;
  scoreDisplay.style.display = 'block';
}

function toggleActionButtons({ submitted }) {
  if (!questionActions) return;
  questionActions.style.display = 'flex';
  submitBtn.disabled = submitted;
  explanationBtn.style.display = submitted ? 'inline-block' : 'none';
  nextBtn.style.display = submitted ? 'inline-block' : 'none';
}

async function displayPassage(passageId) {
  try {
    const { data, entry } = await loadPassage(passageId);
    currentPassage = { data, entry };
    updatePassageMeta(entry);
    // Vocabulary helper now starts collapsed - user clicks button to open

    quizHandle = prepareQuizUI({
      passage: data,
      passageNode: passageContainer,
      questionsNode: questionsContainer,
      vocabNode: vocabContainer,
      onComplete: updateScoreDisplay
    });

    questionsContainer.style.display = 'block';
    passageContainer.style.display = 'block';
    scoreDisplay.style.display = 'none';
    toggleActionButtons({ submitted: false });
    startTimer();
  } catch (error) {
    console.error(error);
    alert('問題の読み込みに失敗しました。ブラウザのコンソールを確認してください。');
  }
}

function handleSubmit() {
  if (!quizHandle || !currentPassage) return;
  const results = quizHandle.submit();
  toggleActionButtons({ submitted: true });

  const minutes = Math.max(1, Math.round(timerSeconds / 60));
  const progress = persistQuizResult({
    passageId: currentPassage.entry.id,
    results,
    timeSpentMinutes: minutes
  });

  renderStats({
    completedCount: progress.sessions.length,
    accuracy: Math.round((progress.totalCorrect / Math.max(progress.totalQuestions, 1)) * 100),
    totalTimeMinutes: Math.round(progress.totalTimeMinutes),
    streakDays: progress.streakDays
  });

  clearInterval(timerInterval);
}

function handleShowExplanations() {
  if (!quizHandle) return;
  quizHandle.showExplanations();
}

async function handleNextPassage() {
  if (!metadata || !currentPassage) {
    return loadRandomPassage();
  }
  const list = metadata.passages;
  const index = list.findIndex((item) => item.id === currentPassage.entry.id);
  const nextIndex = (index + 1) % list.length;
  await displayPassage(list[nextIndex].id);
}

export async function loadRandomPassage() {
  const meta = await loadMetadata();
  const random = meta.passages[Math.floor(Math.random() * meta.passages.length)];
  await displayPassage(random.id);
}

export async function selectPassage() {
  const meta = await loadMetadata();
  const message = meta.passages
    .map((item) => `${item.id}: ${item.title}`)
    .join('\n');
  const userInput = prompt(`読みたい問題のIDを入力してください:\n${message}`);
  if (!userInput) return;
  const trimmed = userInput.trim();
  const exists = meta.passages.some((item) => item.id === trimmed);
  if (!exists) {
    alert('入力したIDの問題は見つかりませんでした。');
    return;
  }
  await displayPassage(trimmed);
}

export function toggleFurigana() {
  document.body.classList.toggle('show-furigana');
}

export function adjustFontSize(direction) {
  if (!passageContainer) return;
  const current = parseFloat(getComputedStyle(passageContainer).fontSize);
  const delta = direction === 'increase' ? 2 : -2;
  const next = Math.min(Math.max(14, current + delta), 28);
  passageContainer.style.fontSize = `${next}px`;
}

export function nextPassage() {
  handleNextPassage();
}

export function submitAnswers() {
  handleSubmit();
}

export function showExplanations() {
  handleShowExplanations();
}

function handleQueryParamLoad() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    return displayPassage(id);
  }
  return null;
}

function setupButtons() {
  if (submitBtn) submitBtn.addEventListener('click', handleSubmit);
  if (explanationBtn) explanationBtn.addEventListener('click', handleShowExplanations);
  if (nextBtn) nextBtn.addEventListener('click', handleNextPassage);
}

async function init() {
  initialiseStats();
  setupButtons();
  await loadMetadata();
  await handleQueryParamLoad();
}

init();

window.loadRandomPassage = loadRandomPassage;
window.selectPassage = selectPassage;
window.toggleFurigana = toggleFurigana;
window.adjustFontSize = adjustFontSize;
window.submitAnswers = submitAnswers;
window.showExplanations = showExplanations;
window.nextPassage = nextPassage;
window.toggleVocabularyHelper = toggleVocabularyHelper;
window.closeVocabularyHelper = closeVocabularyHelper;
