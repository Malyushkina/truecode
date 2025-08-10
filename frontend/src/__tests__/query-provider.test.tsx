import { render, screen } from '@testing-library/react';
import { QueryProvider } from '@/providers/query-provider';

describe('QueryProvider', () => {
  it('рендерит дочерние элементы', () => {
    render(
      <QueryProvider>
        <div data-testid='child'>hello</div>
      </QueryProvider>
    );

    expect(screen.getByTestId('child')).toHaveTextContent('hello');
  });
});
