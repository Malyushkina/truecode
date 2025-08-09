import { ImagePlus, ImageOff } from 'lucide-react';

interface Props {
  imageUrl?: string | null;
  isUploading?: boolean;
  disabled?: boolean;
  onUpload: (file: File) => void;
  onDelete?: () => void;
}

export default function ProductImageControls({
  imageUrl,
  isUploading,
  disabled,
  onUpload,
  onDelete,
}: Props) {
  return (
    <div className='absolute bottom-3 right-3 flex gap-2'>
      <label
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded ${
          !disabled && !isUploading
            ? 'bg-white/90 cursor-pointer hover:bg-white'
            : 'bg-white/90 cursor-not-allowed opacity-60'
        }`}
      >
        <ImagePlus size={16} /> {isUploading ? 'Загрузка…' : 'Загрузить'}
        <input
          type='file'
          accept='image/*'
          className='hidden'
          disabled={disabled || isUploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.currentTarget.value = '';
          }}
        />
      </label>

      {imageUrl && onDelete && (
        <button
          onClick={onDelete}
          disabled={disabled || isUploading}
          className='inline-flex items-center gap-2 px-3 py-2 text-sm bg-white/90 border rounded hover:bg-white text-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <ImageOff size={16} /> Удалить
        </button>
      )}
    </div>
  );
}
