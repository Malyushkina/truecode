import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { validateImageFile, processImage } from '@/lib/image-validation';
import { useState } from 'react';

export function useProductImage(productUid: string) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const basic = validateImageFile(file);
      if (!basic.ok) throw new Error(basic.error);
      const processed = await processImage(file);
      const toUpload = processed.ok ? processed.file : file;
      await productsApi.uploadImage(productUid, toUpload as File);
    },
    onSuccess: async () => {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['product', productUid] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
    },
    onError: () => setError('Не удалось загрузить изображение.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => productsApi.deleteImage(productUid),
    onSuccess: async () => {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['product', productUid] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
    },
    onError: () => setError('Не удалось удалить изображение.'),
  });

  const upload = async (file: File) => uploadMutation.mutateAsync(file);
  const removeImage = async () => deleteMutation.mutateAsync();

  return {
    upload,
    removeImage,
    isUploading: uploadMutation.isPending || deleteMutation.isPending,
    error,
    resetError: () => setError(null),
  };
}
