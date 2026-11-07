import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSendContactMessage } from './useContact';
import { sendContactMessage } from '../services/contactEmailService';

vi.mock('../services/contactEmailService', () => ({
  sendContactMessage: vi.fn(),
}));

const message = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello there',
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useSendContactMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the message and calls onSuccess', async () => {
    // Arrange
    vi.mocked(sendContactMessage).mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useSendContactMessage({ onSuccess }), {
      wrapper,
    });

    // Act
    await act(() => result.current.mutateAsync(message));

    // Assert
    expect(vi.mocked(sendContactMessage).mock.calls[0][0]).toEqual(message);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('calls onError when sending fails', async () => {
    // Arrange
    const error = new Error('Network error');
    vi.mocked(sendContactMessage).mockRejectedValue(error);
    const onError = vi.fn();
    const { result } = renderHook(() => useSendContactMessage({ onError }), {
      wrapper,
    });

    // Act
    await act(() => result.current.mutateAsync(message).catch(() => {}));

    // Assert
    expect(onError.mock.calls[0][0]).toBe(error);
  });
});
