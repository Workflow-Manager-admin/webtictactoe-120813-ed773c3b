import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders bamboo tic tac toe elements', () => {
  render(<App />);
  expect(screen.getByText(/tic tac toe/i)).toBeInTheDocument();
  expect(screen.getByText(/score/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /restart/i })).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: /mode/i })).toBeInTheDocument();
  // There should be 9 cells
  expect(screen.getAllByRole('button').filter(b => b.className.includes('cell')).length).toBe(9);
});

test('allows 2-player play: X then O', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /play X in row 1 column 1/i }));
  fireEvent.click(screen.getByRole('button', { name: /play O in row 1 column 2/i }));
  expect(screen.getAllByText('X').length).toBe(1);
  expect(screen.getAllByText('O').length).toBe(1);
});

test('score updates after restart', () => {
  render(<App />);
  // Win as X: fill first row
  fireEvent.click(screen.getByRole('button', { name: /play X in row 1 column 1/i }));
  fireEvent.click(screen.getByRole('button', { name: /play O in row 2 column 1/i }));
  fireEvent.click(screen.getByRole('button', { name: /play X in row 1 column 2/i }));
  fireEvent.click(screen.getByRole('button', { name: /play O in row 2 column 2/i }));
  fireEvent.click(screen.getByRole('button', { name: /play X in row 1 column 3/i }));
  // After win, score for X should be 1
  expect(screen.getByText(/X: 1/i)).toBeInTheDocument();
  // Clicking restart resets board, not score
  fireEvent.click(screen.getByRole('button', { name: /restart/i }));
  expect(screen.getByText(/X: 1/i)).toBeInTheDocument();
});
