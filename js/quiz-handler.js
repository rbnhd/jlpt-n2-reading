import { recordResult } from './progress-tracker.js';

export function renderPassage(passage, target) {
  if (!target) return;
  target.innerText = passage.passage;
}

export function renderVocabulary(passage, target) {
  if (!target) return;
  if (!passage.vocabulary || passage.vocabulary.length === 0) {
    target.innerHTML = '<p>この問題の単語ヘルプはありません。</p>';
    return;
  }

  target.innerHTML = passage.vocabulary
    .map((item) => `
      <div class="vocab-item">
        <strong>${item.kanji || item.kana}</strong>
        <div>${item.reading ? `【${item.reading}】` : ''} ${item.meaning || ''}</div>
      </div>
    `)
    .join('');
}

export function renderQuestions(passage, container) {
  if (!container) return;
  container.innerHTML = '';

  passage.questions.forEach((question) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'question-item';
    wrapper.dataset.questionId = question.id;

    const questionText = document.createElement('p');
    questionText.className = 'question-text';
    questionText.textContent = question.questionText;
    wrapper.appendChild(questionText);

    question.choices.forEach((choice) => {
      const label = document.createElement('label');
      label.className = 'answer-choice';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = question.id;
      input.value = choice.id;

      const text = document.createElement('span');
      text.textContent = choice.text;

      label.appendChild(input);
      label.appendChild(text);
      wrapper.appendChild(label);
    });

    const explanation = document.createElement('div');
    explanation.className = 'explanation-box hidden';
    explanation.textContent = question.explanation || '';
    wrapper.appendChild(explanation);

    container.appendChild(wrapper);
  });
}

export function evaluateQuiz(passage, container) {
  const results = [];
  let correctCount = 0;

  passage.questions.forEach((question) => {
    const questionNode = container.querySelector(`[data-question-id="${question.id}"]`);
    const selected = container.querySelector(`input[name="${question.id}"]:checked`);
    const selectedValue = selected ? selected.value : null;
    const isCorrect = selectedValue === question.correctAnswer;

    if (selected) {
      selected.parentElement.classList.add('selected');
    }

    results.push({
      questionId: question.id,
      selected: selectedValue,
      correctAnswer: question.correctAnswer,
      isCorrect
    });

    if (isCorrect) {
      correctCount += 1;
    }

    // highlight correct/incorrect choices
    if (questionNode) {
      const choiceLabels = questionNode.querySelectorAll('.answer-choice');
      choiceLabels.forEach((label) => {
        const input = label.querySelector('input');
        if (!input) return;
        if (input.value === question.correctAnswer) {
          label.classList.add('correct');
        } else if (input.checked && input.value !== question.correctAnswer) {
          label.classList.add('incorrect');
        }
        input.disabled = true;
      });
    }
  });

  return {
    correctCount,
    totalQuestions: passage.questions.length,
    breakdown: results
  };
}

export function revealExplanations(container) {
  const boxes = container.querySelectorAll('.explanation-box');
  boxes.forEach((box) => box.classList.remove('hidden'));
}

export function prepareQuizUI({
  passage,
  passageNode,
  questionsNode,
  vocabNode,
  onComplete
}) {
  renderPassage(passage, passageNode);
  renderQuestions(passage, questionsNode);
  renderVocabulary(passage, vocabNode);

  return {
    submit: () => {
      const results = evaluateQuiz(passage, questionsNode);
      if (typeof onComplete === 'function') {
        onComplete(results);
      }
      return results;
    },
    showExplanations: () => revealExplanations(questionsNode)
  };
}

export function persistQuizResult({ passageId, results, timeSpentMinutes }) {
  return recordResult({
    passageId,
    totalQuestions: results.totalQuestions,
    correctAnswers: results.correctCount,
    timeSpentMinutes
  });
}
