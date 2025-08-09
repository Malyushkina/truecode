export function validateImageFile(
  file: File
): { ok: true } | { ok: false; error: string } {
  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ];
  if (!file.type || !allowed.includes(file.type)) {
    return {
      ok: false,
      error: 'Неверный тип файла. Допустимы: JPG, PNG, WEBP, GIF, SVG.',
    };
  }
  if (file.size === 0) {
    return { ok: false, error: 'Файл пустой (0 байт). Выберите другой файл.' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: 'Файл слишком большой. Максимум 10 МБ.' };
  }
  return { ok: true };
}

export const IMAGE_MIN_PX = 600;
export const IMAGE_MAX_PX = 3000;

export async function validateImageDimensions(
  file: File,
  opts: { min?: number; max?: number } = {}
): Promise<
  | { ok: true; width: number; height: number }
  | { ok: false; error: string; width?: number; height?: number }
> {
  const min = opts.min ?? IMAGE_MIN_PX;
  const max = opts.max ?? IMAGE_MAX_PX;

  // SVG — вектор, размер в пикселях условный. Пропускаем проверку.
  if (file.type === 'image/svg+xml') {
    return { ok: true, width: min, height: min };
  }

  const { width, height } = await getImageSize(file);

  // Подстраховки на случай некорректных/неизвестных размеров
  if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
    return { ok: true, width: min, height: min };
  }

  const shorter = Math.min(width, height);
  const longer = Math.max(width, height);

  if (shorter < min) {
    return {
      ok: false,
      error: `Минимальный размер изображения по меньшей стороне — ${min}px. Ваш: ${width}×${height}px`,
      width,
      height,
    };
  }
  if (longer > max) {
    return {
      ok: false,
      error: `Максимальный размер изображения по большей стороне — ${max}px. Ваш: ${width}×${height}px`,
      width,
      height,
    };
  }

  return { ok: true, width, height };
}

export async function processImage(
  file: File,
  opts: { min?: number; max?: number; quality?: number } = {}
): Promise<
  | { ok: true; file: File; warning?: string; width: number; height: number }
  | { ok: false; error: string }
> {
  try {
    if (file.type === 'image/svg+xml') {
      // SVG не трогаем
      return { ok: true, file, width: IMAGE_MIN_PX, height: IMAGE_MIN_PX };
    }

    const min = opts.min ?? IMAGE_MIN_PX;
    const max = opts.max ?? IMAGE_MAX_PX;
    const quality = opts.quality ?? 0.9;

    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImage(dataUrl);
    const srcW =
      (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width;
    const srcH =
      (img as HTMLImageElement).naturalHeight ||
      (img as HTMLImageElement).height;

    if (!isFinite(srcW) || !isFinite(srcH) || srcW <= 0 || srcH <= 0) {
      return { ok: true, file, width: srcW || min, height: srcH || min };
    }

    // Сохраняем пропорции. Даунскейлим, если превышает max, не апскейлим.
    const longer = Math.max(srcW, srcH);
    const scale = longer > max ? max / longer : 1;
    const targetW = Math.round(srcW * scale);
    const targetH = Math.round(srcH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { ok: false, error: 'Не удалось подготовить изображение' };

    ctx.drawImage(img, 0, 0, srcW, srcH, 0, 0, targetW, targetH);

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob error'))),
        'image/webp',
        quality
      );
    });

    const processed = new File([blob], replaceExt(file.name, 'webp'), {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    return {
      ok: true,
      file: processed,
      width: targetW,
      height: targetH,
      warning:
        Math.min(srcW, srcH) < min
          ? `Изображение меньше рекомендуемого ${min}px по меньшей стороне.`
          : undefined,
    };
  } catch (e) {
    return { ok: false, error: 'Не удалось обработать изображение' };
  }
}

function replaceExt(name: string, newExt: string): string {
  const idx = name.lastIndexOf('.');
  if (idx === -1) return `${name}.${newExt}`;
  return `${name.slice(0, idx)}.${newExt}`;
}

async function getImageSize(
  file: File
): Promise<{ width: number; height: number }> {
  // Use FileReader to create an Image and get its dimensions
  const dataUrl = await readFileAsDataURL(file);
  const img = await loadImage(dataUrl);
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  };
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
