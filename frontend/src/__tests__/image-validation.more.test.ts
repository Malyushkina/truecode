import {
  validateImageDimensions,
  processImage,
  IMAGE_MIN_PX,
  IMAGE_MAX_PX,
} from '@/lib/image-validation';

function makeFile(name: string, type: string, size = 10): File {
  const buf = new Uint8Array(size);
  return new File([buf], name, { type });
}

describe('image-validation extra', () => {
  const origImage = global.Image;
  const origFileReader = global.FileReader;
  const origCreateElement = document.createElement.bind(document);

  afterEach(() => {
    global.Image = origImage as typeof Image;
    // @ts-expect-error restore
    global.FileReader = origFileReader;
    // restore createElement
    // @ts-expect-error restore
    document.createElement = origCreateElement;
    jest.restoreAllMocks();
  });

  function mockFileReaderSuccess(dataUrl = 'data:image/png;base64,AAAA') {
    // @ts-expect-error override
    global.FileReader = class MockFileReader {
      result: string | null = null;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      readAsDataURL() {
        this.result = dataUrl;
        setTimeout(() => this.onload && this.onload());
      }
    } as unknown as typeof FileReader;
  }

  function mockImageSize(width: number, height: number) {
    // @ts-expect-error override
    global.Image = class MockImage {
      onload: null | (() => void) = null;
      onerror: null | ((err: unknown) => void) = null;
      naturalWidth = width;
      naturalHeight = height;
      set src(_v: string) {
        setTimeout(() => this.onload && this.onload());
      }
      get src(): string {
        return '';
      }
      // fallback props used in code if natural* are empty
      width = width;
      height = height;
    } as unknown as typeof Image;
  }

  function mockCanvas(
    getContextReturns: any,
    toBlobImpl: (
      cb: (b: Blob | null) => void,
      type?: string,
      q?: number
    ) => void
  ) {
    // @ts-expect-error override
    document.createElement = ((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: (_: string) => getContextReturns,
          toBlob: (cb: (b: Blob | null) => void, type?: string, q?: number) =>
            toBlobImpl(cb, type, q),
        } as unknown as HTMLCanvasElement;
      }
      return origCreateElement(tag);
    }) as unknown as typeof document.createElement;
  }

  it('validateImageDimensions: svg проходит без измерений', async () => {
    const file = makeFile('a.svg', 'image/svg+xml');
    const res = await validateImageDimensions(file);
    expect(res.ok).toBe(true);
  });

  it('validateImageDimensions: некорректные размеры => ок (подстраховка)', async () => {
    mockFileReaderSuccess();
    mockImageSize(NaN as unknown as number, 0);
    const file = makeFile('a.png', 'image/png');
    const res = await validateImageDimensions(file, { min: 700 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.width).toBe(700);
      expect(res.height).toBe(700);
    }
  });

  it('validateImageDimensions: меньше минимума => ошибка', async () => {
    mockFileReaderSuccess();
    mockImageSize(500, 800);
    const file = makeFile('a.png', 'image/png');
    const res = await validateImageDimensions(file, { min: 600 });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('Минимальный размер изображения');
      expect(res.width).toBe(500);
      expect(res.height).toBe(800);
    }
  });

  it('validateImageDimensions: больше максимума => ошибка', async () => {
    mockFileReaderSuccess();
    mockImageSize(2000, 4001);
    const file = makeFile('a.png', 'image/png');
    const res = await validateImageDimensions(file, { max: 4000 });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('Максимальный размер изображения');
      expect(res.width).toBe(2000);
      expect(res.height).toBe(4001);
    }
  });

  it('validateImageDimensions: валидные размеры => ок', async () => {
    mockFileReaderSuccess();
    mockImageSize(1200, 1000);
    const file = makeFile('a.png', 'image/png');
    const res = await validateImageDimensions(file, { min: 600, max: 3000 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.width).toBe(1200);
      expect(res.height).toBe(1000);
    }
  });

  it('processImage: svg возвращается как есть', async () => {
    const file = makeFile('a.svg', 'image/svg+xml');
    const res = await processImage(file);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.file).toBe(file);
      expect(res.width).toBe(IMAGE_MIN_PX);
      expect(res.height).toBe(IMAGE_MIN_PX);
    }
  });

  it('processImage: нет контекста canvas => ошибка', async () => {
    mockFileReaderSuccess();
    mockImageSize(1000, 800);
    mockCanvas(null, (cb) => cb(new Blob()));
    const file = makeFile('a.jpg', 'image/jpeg');
    const res = await processImage(file);
    expect(res.ok).toBe(false);
  });

  it('processImage: ресайз и конвертация в webp, без апскейла', async () => {
    mockFileReaderSuccess();
    // изображение 5000x3000 даунскейлится до max по большей стороне
    mockImageSize(5000, 3000);
    const ctx = { drawImage: jest.fn() };
    mockCanvas(ctx, (cb, _type, _q) => cb(new Blob([new Uint8Array(10)])));
    const file = makeFile('photo.jpeg', 'image/jpeg');
    const res = await processImage(file, { max: 3000 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.file.type).toBe('image/webp');
      expect(res.file.name.endsWith('.webp')).toBe(true);
      // масштаб: longer=5000 -> scale=3000/5000=0.6 => 3000x1800
      expect(res.width).toBe(3000);
      expect(res.height).toBe(1800);
    }
  });

  it('processImage: предупреждение, если меньше min по меньшей стороне', async () => {
    mockFileReaderSuccess();
    mockImageSize(700, 500);
    const ctx = { drawImage: jest.fn() };
    mockCanvas(ctx, (cb) => cb(new Blob([new Uint8Array(5)])));
    const file = makeFile('photo.png', 'image/png');
    const res = await processImage(file, { min: 600, max: 3000 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.warning).toContain('Изображение меньше рекомендуемого');
    }
  });

  it('processImage: toBlob вернул null => ошибка обработки', async () => {
    mockFileReaderSuccess();
    mockImageSize(1200, 800);
    const ctx = { drawImage: jest.fn() };
    mockCanvas(ctx, (cb) => cb(null));
    const file = makeFile('photo.png', 'image/png');
    const res = await processImage(file);
    expect(res.ok).toBe(false);
  });
});
