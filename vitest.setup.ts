import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import {
  configMocks,
  mockAnimationsApi,
  mockResizeObserver,
} from 'jsdom-testing-mocks';

configMocks({ afterAll, afterEach, beforeAll, beforeEach });
mockAnimationsApi();
mockResizeObserver();
