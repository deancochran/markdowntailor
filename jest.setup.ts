import "@testing-library/jest-dom";
import React from "react";

// Fetch API mock
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve("# Mock Content"),
    json: () => Promise.resolve({ success: true }),
  }),
);

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

// Add BroadcastChannel polyfill for MSW
if (typeof global.BroadcastChannel === "undefined") {
  class MockBroadcastChannel implements BroadcastChannel {
    private _channel: string;
    private _listeners: Record<string, EventListener[]>;
    name: string;
    onmessage: ((this: BroadcastChannel, ev: MessageEvent) => void) | null;
    onmessageerror: ((this: BroadcastChannel, ev: MessageEvent) => void) | null;

    constructor(channel: string) {
      this._channel = channel;
      this._listeners = {};
      this.name = channel;
      this.onmessage = null;
      this.onmessageerror = null;
    }

    postMessage(/* message: unknown */): void {
      // Implementation not needed for tests
    }

    addEventListener(type: string, listener: EventListener): void {
      if (!this._listeners[type]) {
        this._listeners[type] = [];
      }
      this._listeners[type].push(listener);
    }

    removeEventListener(type: string, listener: EventListener): void {
      if (!this._listeners[type]) return;
      this._listeners[type] = this._listeners[type].filter(
        (l) => l !== listener,
      );
    }

    close(): void {
      this._listeners = {};
    }

    dispatchEvent(event: Event): boolean {
      const listeners = this._listeners[event.type] || [];
      listeners.forEach((listener) => listener(event));
      return !event.defaultPrevented;
    }
  }

  global.BroadcastChannel =
    MockBroadcastChannel as unknown as typeof BroadcastChannel;
}

// Mock window methods
window.print = jest.fn();

// Mock dynamic imports
jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (callback: () => React.ComponentType) => {
    const Component = callback();
    Component.displayName = "DynamicComponent";
    return Component;
  },
}));

// Mock Next.js Link component
const MockNextLink = React.forwardRef<
  HTMLAnchorElement,
  { href: string; children: React.ReactNode }
>(({ children, href, ...rest }, ref) =>
  React.createElement("a", { href, ref, ...rest }, children),
);
MockNextLink.displayName = "MockNextLink";

jest.mock("next/link", () => MockNextLink);

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/resumes",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Set timeout for tests
jest.setTimeout(5000);

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
