import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});

// Mock window methods
Object.defineProperty(window, 'alert', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
});

Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    href: '',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  },
});

// Mock document.cookie
let cookieValue = '';
Object.defineProperty(document, 'cookie', {
  get: () => cookieValue,
  set: (value: string) => {
    cookieValue = value;
  },
  configurable: true,
});

// Global test utilities
global.resetCookies = () => {
  cookieValue = '';
};

global.setCookie = (name: string, value: string) => {
  cookieValue = `${name}=${value}`;
};

// Declare global types
declare global {
  function resetCookies(): void;
  function setCookie(name: string, value: string): void;
}