import { useMutation } from '@tanstack/react-query';
import { sendContactMessage } from '../services/contactEmailService';

interface SendContactMessageOptions {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export function useSendContactMessage({
  onSuccess,
  onError,
}: SendContactMessageOptions = {}) {
  return useMutation({
    mutationFn: sendContactMessage,
    onSuccess,
    onError,
  });
}
