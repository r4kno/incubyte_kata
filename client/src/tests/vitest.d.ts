/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {
      toBeInTheDocument(): T;
      toBeVisible(): T;
      toBeDisabled(): T;
      toBeEnabled(): T;
      toBeEmptyDOMElement(): T;
      toBeInvalid(): T;
      toBeRequired(): T;
      toBeValid(): T;
      toBeChecked(): T;
      toBePartiallyChecked(): T;
      toHaveAccessibleDescription(expectedDescription?: string | RegExp): T;
      toHaveAccessibleName(expectedName?: string | RegExp): T;
      toHaveAttribute(attr: string, value?: any): T;
      toHaveClass(...classNames: string[]): T;
      toHaveFocus(): T;
      toHaveFormValues(expectedValues: Record<string, any>): T;
      toHaveStyle(css: string | Record<string, any>): T;
      toHaveTextContent(text: string | RegExp): T;
      toHaveValue(value: string | string[] | number): T;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): T;
      toBeChecked(): T;
      toBePartiallyChecked(): T;
      toHaveErrorMessage(text?: string | RegExp): T;
    }
  }

  function resetCookies(): void;
  function setCookie(name: string, value: string): void;
}