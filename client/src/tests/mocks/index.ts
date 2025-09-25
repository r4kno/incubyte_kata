import { vi } from 'vitest';

// Mock axios
export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  create: vi.fn(),
  isAxiosError: vi.fn(),
};

// Mock React Router
export const mockNavigate = vi.fn();

export const mockUseNavigate = () => mockNavigate;

// Reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockAxios.get.mockClear();
  mockAxios.post.mockClear();
  mockAxios.put.mockClear();
  mockAxios.delete.mockClear();
  mockAxios.isAxiosError.mockClear();
  mockNavigate.mockClear();
  
  // Reset window mocks
  vi.mocked(window.alert).mockClear();
  vi.mocked(window.confirm).mockClear();
  
  // Reset cookies
  global.resetCookies();
};

// Cookie utilities for testing
export const setTestCookies = (cookies: Record<string, string>) => {
  const cookieString = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  document.cookie = cookieString;
};

export const clearTestCookies = () => {
  global.resetCookies();
};