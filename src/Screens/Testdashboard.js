import { useState } from 'react';
import { users } from './Login';

const students = users.filter((user) => user.category === 'student');
const subjects = [...new Set(students.map((student) => student.subject))];

function formatAnswer(question, answer) {
  if (answer === undefined || answer === null || answer === '') return 'No answer';
  if (question.type === 'text') return answer;
  if (question.type === 'radio') return question.options[Number(answer)] || 'No answer';
  return answer.length ? answer.map((optionIndex) => question.options[Number(optionIndex)]).join(', ') : 'No answer';
}

function answerIsCorrect(question, answer) {
  if (question.type === 'text') return answer?.trim().toLowerCase() === question.correctText.toLowerCase();
  if (question.type === 'radio') return Number(answer) === question.correct;
  return JSON.stringify((answer || []).map(Number).sort()) === JSON.stringify([...question.correct].sort());
}

function Testdashboard({ name, category, tests, results, onStartTest, onPublishTest, onUpdateTest, onDeleteTest, onLogout }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [material, setMaterial] = useState('');
  const [builderQuestions, setBuilderQuestions] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [assignmentMode, setAssignmentMode] = useState('student');
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [review, setReview] = useState(null);
  const [teacherPanel, setTeacherPanel] = useState(null);
  const [testPreview, setTestPreview] = useState(null);
  const [editingTestId, setEditingTestId] = useState(null);
  const myResults = results.filter((result) => result.student === name);
  const studentTests = tests.filter((test) => {
    if (test.assignmentMode === 'subject') return !test.assignedSubjects?.length || test.assignedSubjects.includes(students.find((student) => student.name === name)?.subject);
    return !test.assignedStudents?.length || test.assignedStudents.includes(name);
  });
  const visibleTests = category === 'teacher' ? tests.filter((test) => test.teacher === name || test.id === 'starter-test') : studentTests;
  const authoredTestIds = new Set(tests.filter((test) => test.teacher === name).map((test) => test.id));
  const studentAttempts = category === 'teacher' ? results.filter((result) => authoredTestIds.has(result.testId)) : [];
  const averageScore = myResults.length ? Math.round((myResults.reduce((total, result) => total + (result.score / result.total) * 100, 0)) / myResults.length) : 0;

  function addQuestion(type) {
    setBuilderQuestions((previous) => [...previous, {
      id: `builder-${Date.now()}-${previous.length}`,
      type,
      prompt: '',
      options: type === 'text' ? [] : ['', '', '', ''],
      correct: type === 'radio' ? 0 : type === 'checkbox' ? [] : undefined,
      correctText: '',
    }]);
  }

  function startEditing(test) {
    setTitle(test.title);
    setSubject(test.subject);
    setMaterial(test.material);
    setBuilderQuestions(test.questions.map((question) => ({ ...question, options: question.options ? [...question.options] : [] })));
    setAssignedStudents(test.assignedStudents || []);
    setAssignmentMode(test.assignmentMode || 'student');
    setAssignedSubjects(test.assignedSubjects || []);
    setEditingTestId(test.id);
    setPublishError('');
    setTeacherPanel('write');
  }

  function updateQuestion(questionId, changes) {
    setBuilderQuestions((previous) => previous.map((question) => question.id === questionId ? { ...question, ...changes } : question));
  }

  function updateOption(question, optionIndex, value) {
    const options = question.options.map((option, index) => index === optionIndex ? value : option);
    updateQuestion(question.id, { options });
  }

  function toggleCorrectOption(question, optionIndex) {
    const selected = question.correct || [];
    updateQuestion(question.id, { correct: selected.includes(optionIndex) ? selected.filter((item) => item !== optionIndex) : [...selected, optionIndex] });
  }

  function publish(event) {
    event.preventDefault();
    const questions = builderQuestions.filter((question) => question.prompt.trim() && (question.type === 'text' ? question.correctText.trim() : question.options.every((option) => option.trim())));
    if (!title.trim() || questions.length === 0 || questions.length !== builderQuestions.length) {
      setPublishError('Add a title and complete every question before uploading.');
      return false;
    }
    const savedTest = { title: title.trim(), subject: subject.trim() || 'General', material: material.trim() || 'No additional material.', questions, assignmentMode, assignedStudents: assignmentMode === 'student' ? assignedStudents : [], assignedSubjects: assignmentMode === 'subject' ? assignedSubjects : [] };
    if (editingTestId) {
      onUpdateTest({ ...savedTest, id: editingTestId, teacher: name });
    } else {
      onPublishTest(savedTest);
    }
    setTitle('');
    setSubject('');
    setMaterial('');
    setBuilderQuestions([]);
    setAssignedStudents([]);
    setAssignmentMode('student');
    setAssignedSubjects([]);
    setStudentPickerOpen(false);
    setEditingTestId(null);
    setPublishError('');
    return true;
  }

  function removeTest(test) {
    if (window.confirm(`Remove "${test.title}"? Student attempts for this test will also be removed.`)) {
      onDeleteTest(test.id);
    }
  }

  return (
    <main className={`dashboard-page ${category === 'student' ? 'student-dashboard-page' : ''}`}>
      <section className={`dashboard-content dashboard-wide ${category === 'student' ? 'student-dashboard' : ''}`}>
        <div className="dashboard-topbar"><div><p className="eyebrow">{category} dashboard</p><h1>Hello, {name}</h1></div><button className="logout-button" type="button" onClick={onLogout}>Log out</button></div>
        {category === 'student' ? (
          <div className="student-scroll-area">
            <div className="student-intro"><div><p className="subtitle">Your learning hub</p><h2 className="student-heading">Ready for your next challenge?</h2></div><span className="student-badge">Student</span></div>
            <div className="student-stats"><div><strong>{visibleTests.length}</strong><span>Available tests</span></div><div><strong>{myResults.length}</strong><span>Completed</span></div><div><strong>{averageScore}%</strong><span>Average score</span></div></div>
            <section className="student-section"><div className="section-heading"><div><p className="eyebrow">Keep learning</p><h2>Available tests</h2></div><span>{visibleTests.length} total</span></div><div className="test-list">
              {visibleTests.length === 0 ? <p className="empty-state">No tests are available right now.</p> : visibleTests.map((test) => {
                const result = myResults.find((item) => item.testId === test.id);
                return <article className="test-row" key={test.id}><div><h3>{test.title}</h3><p>{test.subject} · {test.questions.length} questions · 10 minutes</p></div>{result ? <button className="result-mark" type="button" onClick={() => setReview({ test, result })}>{result.score}/{result.total} · Review attempt</button> : <button type="button" onClick={() => onStartTest(test)}>Start test</button>}</article>;
              })}
            </div></section>
            <section className="student-section"><div className="section-heading"><div><p className="eyebrow">Your progress</p><h2>My activity</h2></div><span>{myResults.length} attempts</span></div>
              {myResults.length === 0 ? <p className="empty-state">Complete a test to see your marks and activity here.</p> : <div className="activity-list">{myResults.map((result) => <button className="activity-row" type="button" key={result.testId} onClick={() => { const test = tests.find((item) => item.id === result.testId); if (test) setReview({ test, result }); }}><span><strong>{result.testTitle}</strong><small>{result.completedAt}</small></span><strong className="result-mark">{result.score}/{result.total}</strong></button>)}</div>}
            </section>
          </div>
        ) : (
          <>
            <p className="subtitle">Manage your tests and monitor student progress from one place.</p>
            <div className="teacher-actions">
              <button type="button" onClick={() => { setTitle(''); setSubject(''); setMaterial(''); setBuilderQuestions([]); setAssignedStudents([]); setAssignedSubjects([]); setAssignmentMode('student'); setEditingTestId(null); setPublishError(''); setTeacherPanel('write'); }}><span className="action-number">01</span><span><strong>Write a test</strong><small>Create and upload a new assessment</small></span><span className="action-arrow">→</span></button>
              <button type="button" onClick={() => setTeacherPanel('tests')}><span className="action-number">02</span><span><strong>Tests</strong><small>View all published tests</small></span><span className="action-arrow">→</span></button>
              <button type="button" onClick={() => setTeacherPanel('attempts')}><span className="action-number">03</span><span><strong>Student attempts</strong><small>Review every submitted attempt</small></span><span className="action-arrow">→</span></button>
            </div>
          </>
        )}
        {teacherPanel && (
          <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setTeacherPanel(null); }}>
            <section className="teacher-modal" role="dialog" aria-modal="true" aria-labelledby="teacher-panel-title">
              <div className="review-heading"><div><p className="eyebrow">Teacher workspace</p><h2 id="teacher-panel-title">{teacherPanel === 'write' ? (editingTestId ? 'Edit test' : 'Write a test') : teacherPanel === 'tests' ? 'All tests' : 'Student attempts'}</h2></div><button className="modal-close" type="button" aria-label="Close teacher workspace" onClick={() => setTeacherPanel(null)}>×</button></div>
              {teacherPanel === 'write' && <form className="author-form" onSubmit={(event) => { event.preventDefault(); if (publish(event)) setTeacherPanel(null); }}>
                <label htmlFor="test-title">Test title</label><input id="test-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Midterm assessment" />
                <label htmlFor="test-subject">Subject</label><select id="test-subject" value={subject} onChange={(event) => setSubject(event.target.value)} required><option value="">Select subject</option>{subjects.map((item) => <option value={item} key={item}>{item}</option>)}</select>
                <label htmlFor="test-material">Helping material</label><textarea id="test-material" value={material} onChange={(event) => setMaterial(event.target.value)} placeholder="Notes students should review" />
                <label htmlFor="student-picker-button">Assign students</label>
                <div className="student-picker">
                  <button id="student-picker-button" className="student-picker-toggle" type="button" onClick={() => setStudentPickerOpen((open) => !open)}>{assignmentMode === 'subject' ? (assignedSubjects.length === 0 ? 'All subjects' : `${assignedSubjects.length} subject${assignedSubjects.length === 1 ? '' : 's'} selected`) : (assignedStudents.length === 0 ? 'All students' : `${assignedStudents.length} student${assignedStudents.length === 1 ? '' : 's'} selected`)} <span>⌄</span></button>
                  {studentPickerOpen && <div className="student-picker-menu">
                    <div className="assignment-modes"><label><input type="radio" name="assignment-mode" checked={assignmentMode === 'subject'} onChange={() => setAssignmentMode('subject')} /> Subject wise</label><label><input type="radio" name="assignment-mode" checked={assignmentMode === 'student'} onChange={() => setAssignmentMode('student')} /> Student wise</label></div>
                    {assignmentMode === 'subject' ? <><label className="student-option all-option"><input type="checkbox" checked={assignedSubjects.length === 0} onChange={() => setAssignedSubjects([])} /><span><strong>All subjects</strong><small>Students from every subject</small></span></label>{subjects.map((subject) => <label className="student-option" key={subject}><input type="checkbox" checked={assignedSubjects.includes(subject)} onChange={() => setAssignedSubjects((selected) => selected.includes(subject) ? selected.filter((item) => item !== subject) : [...selected, subject])} /><span><strong>{subject}</strong><small>{students.filter((student) => student.subject === subject).map((student) => student.name).join(', ')}</small></span></label>)}</> : <><label className="student-option all-option"><input type="checkbox" checked={assignedStudents.length === 0} onChange={() => setAssignedStudents([])} /><span><strong>All students</strong><small>Everyone can take this test</small></span></label>{students.map((student) => <label className="student-option" key={student.email}><input type="checkbox" checked={assignedStudents.includes(student.name)} onChange={() => setAssignedStudents((selected) => selected.includes(student.name) ? selected.filter((studentName) => studentName !== student.name) : [...selected, student.name])} /><span><strong>{student.name}</strong><small>{student.subject}</small></span></label>)}</>}
                  </div>}
                </div>
                <div className="question-builder-header"><label>Questions</label><span>{builderQuestions.length} added</span></div>
                <div className="question-tools">
                  <button type="button" onClick={() => addQuestion('radio')}><span>◉</span> Radio button</button>
                  <button type="button" onClick={() => addQuestion('checkbox')}><span>☑</span> Check box</button>
                  <button type="button" onClick={() => addQuestion('text')}><span>T</span> Text input</button>
                </div>
                {builderQuestions.length === 0 && <p className="builder-empty">Choose a question type to start building your test.</p>}
                <div className="builder-questions">{builderQuestions.map((question, index) => <article className="builder-question" key={question.id}>
                  <div className="builder-question-top"><strong>Question {index + 1}</strong><button type="button" className="remove-question" onClick={() => setBuilderQuestions((previous) => previous.filter((item) => item.id !== question.id))}>Remove</button></div>
                  <label htmlFor={`${question.id}-prompt`}>Question text</label>
                  <input id={`${question.id}-prompt`} value={question.prompt} onChange={(event) => updateQuestion(question.id, { prompt: event.target.value })} placeholder="Write the question" />
                  {question.type !== 'text' ? <>
                    <div className="builder-answer-heading"><p className="builder-label">Answer options</p><span>Correct answer: <strong>{question.type === 'radio' ? (question.options[question.correct] || 'Select one') : (question.correct.length ? question.correct.map((optionIndex) => question.options[optionIndex] || `Option ${optionIndex + 1}`).join(', ') : 'Select one or more')}</strong></span></div>
                    <div className="builder-options">{question.options.map((option, optionIndex) => <div className="builder-option" key={`${question.id}-${optionIndex}`}><input aria-label={`Option ${optionIndex + 1}`} value={option} onChange={(event) => updateOption(question, optionIndex, event.target.value)} placeholder={`Option ${optionIndex + 1}`} />{question.type === 'radio' ? <input aria-label={`Correct option ${optionIndex + 1}`} type="radio" name={`${question.id}-correct`} checked={question.correct === optionIndex} onChange={() => updateQuestion(question.id, { correct: optionIndex })} /> : <input aria-label={`Correct option ${optionIndex + 1}`} type="checkbox" checked={question.correct.includes(optionIndex)} onChange={() => toggleCorrectOption(question, optionIndex)} />}</div>)}</div>
                  </> : <><label htmlFor={`${question.id}-answer`}>Correct answer</label><input id={`${question.id}-answer`} value={question.correctText} onChange={(event) => updateQuestion(question.id, { correctText: event.target.value })} placeholder="Expected answer" /></>}
                </article>)}</div>
                {publishError && <p className="error-message">{publishError}</p>}
                <button type="submit" disabled={builderQuestions.length === 0}>Upload test</button>
              </form>}
              {teacherPanel === 'tests' && <div className="test-list">{visibleTests.map((test) => <article className="test-row" key={test.id}><div><h3>{test.title}</h3><p>{test.subject} · {test.questions.length} questions · By {test.teacher}</p></div><span className="test-row-actions">{test.teacher === name && <><button className="edit-test-button" type="button" onClick={() => { setTeacherPanel(null); startEditing(test); }}>Edit</button><button className="remove-test-button" type="button" onClick={() => removeTest(test)}>Remove</button></>}<button className="view-test-button" type="button" onClick={() => { setTeacherPanel(null); setTestPreview(test); }}>View test</button></span></article>)}</div>}
              {teacherPanel === 'attempts' && (studentAttempts.length === 0 ? <p className="empty-state">No student attempts yet.</p> : <div className="test-list">{studentAttempts.map((result) => { const test = tests.find((item) => item.id === result.testId); return <button className="attempt-row" type="button" key={`${result.testId}-${result.student}`} onClick={() => { setTeacherPanel(null); if (test) setReview({ test, result }); }}><span className="attempt-student"><strong title={result.student}>{result.student}</strong><small>{result.testTitle} · {result.completedAt}</small><span className="attempt-tooltip" role="tooltip">{result.student}</span></span><strong className="result-mark">{result.score}/{result.total}</strong></button>; })}</div>)}
            </section>
          </div>
        )}
        {testPreview && (
          <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setTestPreview(null); }}>
            <section className="teacher-modal" role="dialog" aria-modal="true" aria-labelledby="test-preview-title">
              <div className="review-heading"><div><p className="eyebrow">Test preview · View only</p><h2 id="test-preview-title">{testPreview.title}</h2><p className="review-student">{testPreview.subject} · By <strong>{testPreview.teacher}</strong></p></div><button className="modal-close" type="button" aria-label="Close test preview" onClick={() => setTestPreview(null)}>×</button></div>
              <p className="material"><strong>Helping material:</strong> {testPreview.material}</p>
              {testPreview.questions.map((question, index) => <article className="preview-question" key={question.id}><div className="review-status"><strong>Question {index + 1}</strong><span>{question.type}</span></div><h3>{question.prompt}</h3>{question.options && <ul>{question.options.map((option, optionIndex) => <li key={option}>{option}{(question.type === 'radio' ? question.correct === optionIndex : question.correct.includes(optionIndex)) && <strong className="correct-option"> · Correct</strong>}</li>)}</ul>}{question.type === 'text' && <p>Expected answer: <strong>{question.correctText}</strong></p>}</article>)}
              <button type="button" onClick={() => setTestPreview(null)}>Close preview</button>
            </section>
          </div>
        )}
        {review && (
          <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setReview(null); }}>
            <section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
              <div className="review-heading"><div><p className="eyebrow">Attempt review</p><h2 id="review-title">{review.test.title}</h2><p className="review-student">Student: <strong>{review.result.student}</strong></p><p className="review-score">Score: <strong>{review.result.score}/{review.result.total}</strong></p></div><button className="modal-close" type="button" aria-label="Close review" onClick={() => setReview(null)}>×</button></div>
              {review.test.questions.map((question, index) => {
                const correct = answerIsCorrect(question, review.result.answers?.[question.id]);
                return <article className={correct ? 'review-question success' : 'review-question danger'} key={question.id}><div className="review-status"><strong>{correct ? 'Correct' : 'Incorrect'}</strong><span>{question.type}</span></div><h3>{index + 1}. {question.prompt}</h3><p>Your answer: <strong>{formatAnswer(question, review.result.answers?.[question.id])}</strong></p><p>Correct answer: <strong>{formatAnswer(question, question.type === 'text' ? question.correctText : question.type === 'radio' ? question.correct : question.correct)}</strong></p></article>;
              })}
              <button type="button" onClick={() => setReview(null)}>Close review</button>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default Testdashboard;
