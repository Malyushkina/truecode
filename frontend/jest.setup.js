import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Next.js Image component (без протекания нестандартных пропсов в DOM)
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { alt, ...rest } = props || {};
    const clean = { ...rest };
    delete clean.fill;
    delete clean.priority;
    delete clean.loader;
    delete clean.quality;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt || ''} {...clean} />;
  },
}));
