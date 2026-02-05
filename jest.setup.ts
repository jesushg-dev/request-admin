// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'util';

Object.assign(global, { TextDecoder, TextEncoder });

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Provide a lightweight global mock for auth-server so tests can safely
// import `requireUser` / `currentSession` without failing when individual
// tests override the mock.
jest.mock('@/server/auth-server', () => ({
  currentSession: jest.fn(),
  requireUser: jest.fn(),
}));

// Polyfill minimal `Request` for Node test environment when used in handlers
if (typeof (global as any).Request === 'undefined') {
  class SimpleRequest {
    url: string;
    method: string | undefined;
    private _body: any;
    constructor(url: string, init?: any) {
      this.url = url;
      this.method = init?.method;
      this._body = init?.body;
    }
    async json() {
      try {
        return JSON.parse(this._body || '{}');
      } catch (e) {
        return {};
      }
    }
    text() {
      return Promise.resolve(this._body || '');
    }
  }
  (global as any).Request = SimpleRequest;
}
