import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import Register from '../../pages/register';
import { renderWithRouter } from '../utils/testHelpers';

describe('Register - Critical Tests Only', () => {
  beforeEach(() => {
    document.cookie = '';
  });

  it('renders registration form with all required fields', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByPlaceholderText('Enter your sweet name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your-email@sweetshop.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a strong password (min 6 chars)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join the sweet family/i })).toBeInTheDocument();
  });

  it('validates password match before submission', async () => {
    renderWithRouter(<Register />);
    const user = userEvent.setup();
    
    const alertSpy = vi.fn();
    window.alert = alertSpy;

    await user.type(screen.getByPlaceholderText('Enter your sweet name'), 'Test User');
    await user.type(screen.getByPlaceholderText('your-email@sweetshop.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Create a strong password (min 6 chars)'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm your password'), 'different123');
    await user.click(screen.getByRole('button', { name: /join the sweet family/i }));

    expect(alertSpy).toHaveBeenCalledWith('Passwords do not match! Please try again.');
  });

  it('validates password minimum length', async () => {
    renderWithRouter(<Register />);
    const user = userEvent.setup();
    
    const alertSpy = vi.fn();
    window.alert = alertSpy;

    await user.type(screen.getByPlaceholderText('Enter your sweet name'), 'Test User');
    await user.type(screen.getByPlaceholderText('your-email@sweetshop.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Create a strong password (min 6 chars)'), '123'); // Too short
    await user.type(screen.getByPlaceholderText('Confirm your password'), '123');
    await user.click(screen.getByRole('button', { name: /join the sweet family/i }));

    expect(alertSpy).toHaveBeenCalledWith('Password must be at least 6 characters long!');
  });
});