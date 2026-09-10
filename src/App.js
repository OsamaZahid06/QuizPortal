import './App.css';
import { useState } from 'react';
import Login from './Screens/Login';
import Testdashboard from './Screens/Testdashboard';
import TestScreen from './Screens/TestScreen';

const starterTest = {
  id: 'starter-test',
  title: 'Classroom Basics',
  subject: 'General Knowledge',
  teacher: 'Ms. Priya Kapoor',
  material: 'Review the basic classroom concepts before starting.',
  questions: [
    { id: 'q1', type: 'radio', prompt: 'Which language is used to style a web page?', options: ['HTML', 'CSS', 'SQL'], correct: 1 },
    { id: 'q2', type: 'checkbox', prompt: 'Select the frontend technologies.', options: ['React', 'CSS', 'PostgreSQL'], correct: [0, 1] },
    { id: 'q3', type: 'text', prompt: 'Type the name of the language used by React.', correctText: 'javascript' },
  ],
};

function App() {
  const [user, setUser] = useState(null);
  const [tests, setTests] = useState([starterTest]);
  const [results, setResults] = useState([]);
  const [activeTest, setActiveTest] = useState(null);

  function handleSubmitTest(test, answers, timedOut = false) {
    const score = test.questions.reduce((total, question) => {
      const answer = answers[question.id];
      if (question.type === 'text') return total + (answer?.trim().toLowerCase() === question.correctText.toLowerCase() ? 1 : 0);
      if (question.type === 'radio') return total + (Number(answer) === question.correct ? 1 : 0);
      const selected = (answer || []).map(Number).sort();
      const correct = [...question.correct].sort();
      return total + (JSON.stringify(selected) === JSON.stringify(correct) ? 1 : 0);
    }, 0);

    setResults((previous) => [
      ...previous.filter((result) => !(result.testId === test.id && result.student === user.name)),
      { testId: test.id, testTitle: test.title, student: user.name, score, total: test.questions.length, answers, timedOut, completedAt: new Date().toLocaleString() },
    ]);
    setActiveTest(null);
  }

  function updateTest(updatedTest) {
    setTests((previous) => previous.map((test) => test.id === updatedTest.id ? updatedTest : test));
  }

  function deleteTest(testId) {
    setTests((previous) => previous.filter((test) => test.id !== testId));
    setResults((previous) => previous.filter((result) => result.testId !== testId));
  }

  if (activeTest) return <TestScreen test={activeTest} onSubmit={handleSubmitTest} onCancel={() => setActiveTest(null)} />;

  return (
    user ? (
      <Testdashboard name={user.name} category={user.category} tests={tests} results={results} onStartTest={setActiveTest} onPublishTest={(test) => setTests((previous) => [...previous, { ...test, id: `test-${Date.now()}`, teacher: user.name }])} onUpdateTest={updateTest} onDeleteTest={deleteTest} onLogout={() => { setUser(null); setActiveTest(null); }} />
    ) : (
      <Login onLogin={setUser} />
    )
  );
}

export default App;
