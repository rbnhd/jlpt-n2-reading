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
  
  // Build category stats
  const byCategory = {};
  progress.sessions.forEach(session => {
    // Extract category from passageId (e.g., "n2-reading-001" -> extract from metadata)
    // For now, we'll parse it from the session or use default
    const category = session.category || 'general';
    if (!byCategory[category]) {
      byCategory[category] = { attempts: 0, correct: 0 };
    }
    byCategory[category].attempts += session.totalQuestions;
    byCategory[category].correct += session.correctAnswers;
  });

  // Build history for recent activity
  const history = progress.sessions.map(session => ({
    passageId: session.passageId,
    timestamp: session.date,
    total: session.totalQuestions,
    correct: session.correctAnswers
  }));
  
  return {
    // For homepage stats
    completedCount,
    accuracy,
    totalTimeMinutes: Math.round(progress.totalTimeMinutes),
    streakDays: progress.streakDays,
    // For progress page
    totalAttempts: progress.totalQuestions,
    correctAnswers: progress.totalCorrect,
    currentStreak: progress.streakDays,
    byCategory,
    history
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
