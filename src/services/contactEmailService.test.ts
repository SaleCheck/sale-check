import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendContactMessage } from './contactEmailService';

const message = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'Hello there',
};

function mockFetchResponse(ok: boolean, body: unknown) {
  vi.mocked(fetch).mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

describe('contactEmailService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('sendContactMessage', () => {
    it('POSTs the message wrapped in a data object to the contact function', async () => {
      // Arrange
      mockFetchResponse(true, { status: 'Success' });

      // Act
      await sendContactMessage(message);

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'https://us-central1-salecheck-867e3.cloudfunctions.net/sendContactMessage',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: message }),
        }
      );
    });

    it('resolves when the response is ok and the status is Success', async () => {
      // Arrange
      mockFetchResponse(true, { status: 'Success' });

      // Act
      const result = sendContactMessage(message);

      // Assert
      await expect(result).resolves.toBeUndefined();
    });

    it('throws the error from the body when the response is not ok', async () => {
      // Arrange
      mockFetchResponse(false, { error: 'Missing field: email' });

      // Act
      const result = sendContactMessage(message);

      // Assert
      await expect(result).rejects.toThrow('Missing field: email');
    });

    it('throws when the response is ok but the status is not Success', async () => {
      // Arrange
      mockFetchResponse(true, { status: 'Failed', error: 'SMTP error' });

      // Act
      const result = sendContactMessage(message);

      // Assert
      await expect(result).rejects.toThrow('SMTP error');
    });

    it('throws a default error when the body has no error message', async () => {
      // Arrange
      mockFetchResponse(false, {});

      // Act
      const result = sendContactMessage(message);

      // Assert
      await expect(result).rejects.toThrow('Failed to send message');
    });

    it('rejects when the network request fails', async () => {
      // Arrange
      vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

      // Act
      const result = sendContactMessage(message);

      // Assert
      await expect(result).rejects.toThrow('Failed to fetch');
    });
  });
});
