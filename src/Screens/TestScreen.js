import { useEffect, useState } from 'react';

function shuffled(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createAttemptQuestions(test) {
  return shuffled(test.questions).map((question) => ({
    ...question,
    options: question.options ? shuffled(question.options.map((option, originalIndex) => ({ option, originalIndex }))) : undefined,
  }));
}

function TestScreen({ test, onSubmit, onCancel }) {
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [answers, setAnswers] = useState({});
  const [attemptQuestions] = useState(() => createAttemptQuestions(test));

  useEffect(() => {
    if (secondsLeft <= 0) {
      onSubmit(test, answers, true);
      return undefined;
    }
    const timer = window.setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, test, answers, onSubmit]);

  function setAnswer(question, value) {
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
  }

  function toggleCheckbox(question, optionIndex) {
    const selected = answers[question.id] || [];
    setAnswer(question, selected.includes(optionIndex) ? selected.filter((item) => item !== optionIndex) : [...selected, optionIndex]);
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <main className="test-page">
      <section className="test-card">
        <div className="test-header"><div><p className="eyebrow">{test.subject}</p><h1>{test.title}</h1></div><strong className={secondsLeft < 60 ? 'timer urgent' : 'timer'}>{minutes}:{seconds}</strong></div>
        <p className="material"><strong>Helping material:</strong> {test.material}</p>
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(test, answers); }}>
          {attemptQuestions.map((question, questionIndex) => (
            <fieldset className="question" key={question.id}>
              <legend>{questionIndex + 1}. {question.prompt}</legend>
              {question.type === 'text' && <input aria-label={`Answer ${questionIndex + 1}`} value={answers[question.id] || ''} onChange={(event) => setAnswer(question, event.target.value)} />}
              {question.type === 'radio' && question.options.map(({ option, originalIndex }) => <label className="choice" key={`${question.id}-${originalIndex}`}><input type="radio" name={question.id} checked={answers[question.id] === originalIndex} onChange={() => setAnswer(question, originalIndex)} />{option}</label>)}
              {question.type === 'checkbox' && question.options.map(({ option, originalIndex }) => <label className="choice" key={`${question.id}-${originalIndex}`}><input type="checkbox" checked={(answers[question.id] || []).includes(originalIndex)} onChange={() => toggleCheckbox(question, originalIndex)} />{option}</label>)}
            </fieldset>
          ))}
          <div className="test-actions"><button className="secondary-button" type="button" onClick={onCancel}>Back to dashboard</button><button type="submit">Submit test</button></div>
        </form>
      </section>
    </main>
  );
}

export default TestScreen;