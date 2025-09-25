import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import Login from '../../pages/login';
import { renderWithRouter } from '../utils/testHelpers';

describe('Login - Critical Tests Only', () => {
  beforeEach(() => {
    // Clear any stored data
    document.cookie = '';
  });

  it('renders login form', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByPlaceholderText('your-email@sweetshop.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your sweet password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enter sweet shop/i })).toBeInTheDocument();
  });

  it('allows user to type in form fields', async () => {
    renderWithRouter(<Login />);
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('your-email@sweetshop.com');
    const passwordInput = screen.getByPlaceholderText('Enter your sweet password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('shows loading state when form is submitted', async () => {
    renderWithRouter(<Login />);
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText('your-email@sweetshop.com');
    const passwordInput = screen.getByPlaceholderText('Enter your sweet password');
    const submitButton = screen.getByRole('button', { name: /enter sweet shop/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should show loading text
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});