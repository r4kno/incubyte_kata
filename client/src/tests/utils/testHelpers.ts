import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Custom render function with router context
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return React.createElement(BrowserRouter, null, children);
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Router-specific render function
export const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Helper functions for common test scenarios
export const waitForLoadingToFinish = async () => {
  // Wait for loading text to disappear
  await new Promise(resolve => setTimeout(resolve, 100));
};

export const fillForm = async (
  fields: Record<string, string>,
  getByPlaceholderText: (text: string) => HTMLElement
) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  
  for (const [placeholder, value] of Object.entries(fields)) {
    const field = getByPlaceholderText(placeholder);
    await user.clear(field);
    await user.type(field, value);
  }
};

export const clickButton = async (buttonText: string, getByText: (text: string) => HTMLElement) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();
  const button = getByText(buttonText);
  await user.click(button);
};

// Mock API response helpers
export const createMockResponse = (data: any, success = true) => ({
  data: {
    success,
    ...data
  }
});

export const createMockError = (message: string, status = 400) => ({
  response: {
    data: { message },
    status
  },
  isAxiosError: true
});