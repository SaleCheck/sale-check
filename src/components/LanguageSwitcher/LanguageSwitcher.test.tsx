import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import LanguageSwitcher from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  afterEach(async () => {
    cleanup();
    await act(() => i18n.changeLanguage('en'));
    localStorage.clear();
  });

  it('offers English and Dansk with English selected', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(<LanguageSwitcher />);

    // Assert
    const select = screen.getByLabelText('Language');
    expect(select).toHaveValue('en');
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dansk' })).toBeInTheDocument();
  });

  it('switches to Danish and remembers the choice', async () => {
    // Arrange
    render(<LanguageSwitcher />);
    const user = userEvent.setup();

    // Act
    await user.selectOptions(screen.getByLabelText('Language'), 'da');

    // Assert
    expect(i18n.language).toBe('da');
    expect(screen.getByLabelText('Sprog')).toHaveValue('da');
    expect(document.documentElement.lang).toBe('da');
    expect(localStorage.getItem('salecheck.language')).toBe('da');
  });
});
