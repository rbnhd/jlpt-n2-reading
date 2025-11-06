import { initialiseStats, getStats, renderStats } from './progress-tracker.js';

// Determine the correct path based on current location
const isInPagesFolder = window.location.pathname.includes('/pages/');
const metadataPath = isInPagesFolder 
  ? '../data/metadata/content-index.json' 
  : './data/metadata/content-index.json';
let metadata = null;

async function fetchMetadata() {
  if (metadata) return metadata;
  const response = await fetch(metadataPath);
  if (!response.ok) {
    throw new Error(`Failed to load metadata: ${response.status}`);
  }
  metadata = await response.json();
  return metadata;
}

function updateCategoryCards() {
  if (!metadata) return;
  const cards = document.querySelectorAll('.category-card');
  cards.forEach((card) => {
    const category = card.dataset.category;
    const entry = metadata.categories.find((item) => item.id === category);
    if (!entry) return;
    const countNode = card.querySelector('.category-count');
    if (countNode) {
      countNode.textContent = `${entry.count}問題`;
    }
  });
}

function setupNavToggle() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.querySelector('.nav-menu');
  if (!navToggle || !navMenu) return;
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });
}

function setupScrollHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

export async function randomPractice() {
  const data = await fetchMetadata();
  const passage = data.passages[Math.floor(Math.random() * data.passages.length)];
  window.location.href = `pages/practice.html?id=${encodeURIComponent(passage.id)}`;
}

export async function practiceCategory(category) {
  const data = await fetchMetadata();
  const filtered = data.passages.filter((item) => item.category === category);
  if (filtered.length === 0) {
    alert('このカテゴリーの問題はまだありません。');
    return;
  }
  const choice = filtered[Math.floor(Math.random() * filtered.length)];
  window.location.href = `pages/practice.html?id=${encodeURIComponent(choice.id)}`;
}

function exposeGlobals() {
  window.randomPractice = randomPractice;
  window.practiceCategory = practiceCategory;
}

async function init() {
  setupNavToggle();
  setupScrollHeader();
  exposeGlobals();
  initialiseStats();
  await fetchMetadata();
  updateCategoryCards();
  renderStats(getStats());
}

init().catch((error) => {
  console.error('Failed to initialise app:', error);
});
