import { ReactNode, useEffect } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = 'Подтверждение',
  description,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40' onClick={onCancel} />
      <div
        role='dialog'
        aria-modal='true'
        className='relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl'
      >
        <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
        {description && (
          <div className='mt-2 text-sm text-gray-600'>{description}</div>
        )}

        <div className='mt-6 flex flex-col sm:flex-row gap-2 sm:justify-end'>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className='w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='w-full sm:w-auto px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {isLoading && (
              <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
