import React from 'react';
import RootLayout from '@/app/layout';

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter-font' }),
}));

jest.mock('@/providers/query-provider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

function hasTestId(node: any, testId: string): boolean {
  if (!node || typeof node !== 'object') return false;
  if (node.props && node.props['data-testid'] === testId) return true;
  const children = node.props?.children;
  if (Array.isArray(children))
    return children.some((c) => hasTestId(c, testId));
  if (children) return hasTestId(children, testId);
  return false;
}

describe('App RootLayout', () => {
  it('возвращает html/body-структуру и пробрасывает детей', () => {
    const tree = RootLayout({
      children: <div data-testid='content'>Hello</div>,
    }) as React.ReactElement;

    expect(React.isValidElement(tree)).toBe(true);
    expect(tree.type).toBe('html');
    expect(tree.props.lang).toBe('ru');

    const bodyEl = tree.props.children as React.ReactElement;
    expect(bodyEl.type).toBe('body');
    expect(String(bodyEl.props.className)).toContain('inter-font');

    expect(hasTestId(bodyEl, 'content')).toBe(true);
  });
});
