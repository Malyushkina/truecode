# Тестирование фронтенда

Этот проект использует Jest + React Testing Library для тестирования React компонентов и утилит.

## Установленные зависимости

- `jest` - фреймворк для тестирования
- `@testing-library/react` - утилиты для тестирования React компонентов
- `@testing-library/jest-dom` - дополнительные матчеры для Jest
- `@testing-library/user-event` - симуляция пользовательских действий
- `jest-environment-jsdom` - окружение для тестирования DOM

## Команды для тестирования

```bash
# Запустить все тесты
npm test

# Запустить тесты в режиме watch (автоматически перезапускает при изменениях)
npm run test:watch

# Запустить тесты с отчетом о покрытии
npm run test:coverage
```

## Структура тестов

Тесты находятся в папке `src/__tests__/` и следуют соглашению:

- `ComponentName.test.tsx` - для React компонентов
- `utils.test.ts` - для утилит и хелперов

## Примеры тестов

### Тестирование компонента

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('должен отрендерить заголовок', () => {
    render(<MyComponent title='Тест' />);
    expect(screen.getByText('Тест')).toBeInTheDocument();
  });

  it('должен вызвать onClick при клике', () => {
    const mockOnClick = jest.fn();
    render(<MyComponent onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalled();
  });
});
```

### Тестирование утилит

```tsx
import { formatPrice } from '../lib/utils';

describe('formatPrice', () => {
  it('должен форматировать цену в рубли', () => {
    expect(formatPrice(1000)).toBe('1 000 ₽');
  });
});
```

## Моки и заглушки

### Моки для Next.js

```tsx
// Мок для роутера
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      // ... другие методы
    };
  },
}));

// Мок для Image компонента
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));
```

### Моки для хуков

```tsx
jest.mock('../hooks/use-my-hook', () => ({
  useMyHook: () => ({
    data: mockData,
    loading: false,
    error: null,
  }),
}));
```

## Полезные матчеры

- `toBeInTheDocument()` - проверяет наличие элемента в DOM
- `toHaveClass('className')` - проверяет CSS классы
- `toHaveAttribute('attr', 'value')` - проверяет атрибуты
- `toBeVisible()` - проверяет видимость элемента
- `toHaveTextContent('text')` - проверяет текстовое содержимое

## Лучшие практики

1. **Тестируйте поведение, а не реализацию** - фокусируйтесь на том, что делает компонент, а не как он это делает
2. **Используйте семантические селекторы** - `getByRole`, `getByLabelText` вместо `getByTestId`
3. **Группируйте связанные тесты** - используйте `describe` блоки для логической группировки
4. **Пишите понятные названия тестов** - описывайте ожидаемое поведение
5. **Мокайте внешние зависимости** - API вызовы, роутер, хуки

## Отладка тестов

Если тест падает, используйте:

```tsx
// Вывести содержимое компонента
screen.debug();

// Вывести конкретный элемент
screen.debug(screen.getByText('Текст'));

// Проверить доступные роли
screen.getByRole('button'); // покажет все кнопки
```
