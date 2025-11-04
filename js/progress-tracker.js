const STORAGE_KEY = 'n2-reading-progress';

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        sessions: [],
        totalQuestions: 0,
        totalCorrect: 0,
        totalTimeMinutes: 0,
        lastStudyDate: null,
        streakDays: 0
      };
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse stored progress. Resetting.', error);
    return {
      sessions: [],
      totalQuestions: 0,
      totalCorrect: 0,
      totalTimeMinutes: 0,
      lastStudyDate: null,
      streakDays: 0
    };
  }
}

function persistProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getProgress() {
  return loadFromStorage();
}

export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export function recordResult({
  passageId,
  totalQuestions,
  correctAnswers,
  timeSpentMinutes
}) {
  const progress = loadFromStorage();
  const sessionDate = todayKey();

  progress.sessions.push({
    id: `${passageId}-${Date.now()}`,
    passageId,
    totalQuestions,
    correctAnswers,
    timeSpentMinutes,
    date: sessionDate
  });

  progress.totalQuestions += totalQuestions;
  progress.totalCorrect += correctAnswers;
  progress.totalTimeMinutes += timeSpentMinutes;

  if (!progress.lastStudyDate) {
    progress.streakDays = 1;
  } else {
    const prev = progress.lastStudyDate;
    if (prev === sessionDate) {
      // same day, keep streak
    } else {
      const prevDate = new Date(prev);
      const currentDate = new Date(sessionDate);
      const diffMs = currentDate - prevDate;
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        progress.streakDays += 1;
      } else if (diffDays > 1) {
        progress.streakDays = 1;
      }
    }
  }

  progress.lastStudyDate = sessionDate;
  persistProgress(progress);
  return progress;
}

export function getStats() {
  const progress = loadFromStorage();
  const completedCount = progress.sessions.length;
  const accuracy = progress.totalQuestions === 0
    ? 0
    : Math.round((progress.totalCorrect / progress.totalQuestions) * 100);
  return {
    completedCount,
    accuracy,
    totalTimeMinutes: Math.round(progress.totalTimeMinutes),
    streakDays: progress.streakDays
  };
}

export function renderStats({
  completedCount,
  accuracy,
  totalTimeMinutes,
  streakDays
}) {
  const completedNode = document.getElementById('completedCount');
  const accuracyNode = document.getElementById('accuracyRate');
  const timeNode = document.getElementById('totalTime');
  const streakNode = document.getElementById('streakDays');

  if (completedNode) completedNode.textContent = completedCount;
  if (accuracyNode) accuracyNode.textContent = `${accuracy}%`;
  if (timeNode) timeNode.textContent = `${totalTimeMinutes}分`;
  if (streakNode) streakNode.textContent = `${streakDays}日`;
}

export function initialiseStats() {
  const stats = getStats();
  renderStats(stats);
}
