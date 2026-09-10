import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login form', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
});
