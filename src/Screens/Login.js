import { useState } from 'react';

export const users = [
  { name: 'Aarav Sharma', email: 'aarav.student@example.com', password: 'student123', subject: 'Mathematics', category: 'student' },
  { name: 'Mia Johnson', email: 'mia.student@example.com', password: 'student123', subject: 'Science', category: 'student' },
  { name: 'Noah Williams', email: 'noah.student@example.com', password: 'student123', subject: 'English', category: 'student' },
  { name: 'Isha Patel', email: 'isha.student@example.com', password: 'student123', subject: 'History', category: 'student' },
  { name: 'Oliver Brown', email: 'oliver.student@example.com', password: 'student123', subject: 'Computer Science', category: 'student' },
  { name: 'Sofia Garcia', email: 'sofia.student@example.com', password: 'student123', subject: 'Art', category: 'student' },
  { name: 'Liam Davis', email: 'liam.student@example.com', password: 'student123', subject: 'Physics', category: 'student' },
  { name: 'Ava Wilson', email: 'ava.student@example.com', password: 'student123', subject: 'Biology', category: 'student' },
  { name: 'Ethan Miller', email: 'ethan.student@example.com', password: 'student123', subject: 'Geography', category: 'student' },
  { name: 'Emma Anderson', email: 'emma.student@example.com', password: 'student123', subject: 'Music', category: 'student' },
  { name: 'Ms. Priya Kapoor', email: 'priya.teacher@example.com', password: 'teacher123', subject: 'Mathematics', category: 'teacher' },
  { name: 'Mr. Daniel Smith', email: 'daniel.teacher@example.com', password: 'teacher123', subject: 'Science', category: 'teacher' },
  { name: 'Ms. Olivia Martin', email: 'olivia.teacher@example.com', password: 'teacher123', subject: 'English', category: 'teacher' },
];

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('student');
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const user = users.find(
      (candidate) =>
        candidate.email === email.trim().toLowerCase() &&
        candidate.password === password &&
        candidate.category === category,
    );

    if (!user) {
      setError('Email, password, or category is incorrect.');
      return;
    }

    setError('');
    onLogin({ name: user.name, category: user.category });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Classroom portal</p>
        <h1>Welcome back</h1>
        <p className="subtitle">Sign in to continue to your learning dashboard.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />

          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />

          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>

          {error && <p className="error-message" role="alert">{error}</p>}
          <button type="submit">Sign in</button>
        </form>

        <p className="demo-hint">Student: aarav.student@example.com / student123</p>
        <p className="demo-hint">Teacher: priya.teacher@example.com / teacher123</p>
      </section>
    </main>
  );
}

export default Login;