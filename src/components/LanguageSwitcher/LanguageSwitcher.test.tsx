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

  it('shows English with its flag by default', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(<LanguageSwitcher />);

    // Assert
    const button = screen.getByRole('button', { name: /^Language/ });
    expect(button).toHaveTextContent('English');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('lists English, Deutsch and Dansk, each with a flag', async () => {
    // Arrange
    render(<LanguageSwitcher />);
    const user = userEvent.setup();

    // Act
    await user.click(screen.getByRole('button', { name: /^Language/ }));

    // Assert
    const options = await screen.findAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'English',
      'Deutsch',
      'Dansk',
    ]);
    options.forEach((option) =>
      expect(option.querySelector('svg')).toBeInTheDocument()
    );
  });

  it('switches to Danish and remembers the choice', async () => {
    // Arrange
    render(<LanguageSwitcher />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /^Language/ }));

    // Act
    await user.click(await screen.findByRole('option', { name: 'Dansk' }));

    // Assert
    expect(i18n.language).toBe('da');
    expect(screen.getByRole('button', { name: /^Sprog/ })).toHaveTextContent(
      'Dansk'
    );
    expect(document.documentElement.lang).toBe('da');
    expect(localStorage.getItem('salecheck.language')).toBe('da');
  });

  it('switches to German', async () => {
    // Arrange
    render(<LanguageSwitcher />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /^Language/ }));

    // Act
    await user.click(await screen.findByRole('option', { name: 'Deutsch' }));

    // Assert
    expect(i18n.language).toBe('de');
    expect(screen.getByRole('button', { name: /^Sprache/ })).toHaveTextContent(
      'Deutsch'
    );
    expect(document.documentElement.lang).toBe('de');
  });

  it('hides the label visually only in the inline (footer) variant', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    render(
      <>
        <LanguageSwitcher />
        <LanguageSwitcher inline />
      </>
    );

    // Assert
    const [stackedLabel, inlineLabel] = screen.getAllByText('Language');
    expect(stackedLabel).not.toHaveClass('sr-only');
    expect(inlineLabel).toHaveClass('sr-only');
    expect(screen.getAllByRole('button', { name: /^Language/ })).toHaveLength(
      2
    );
  });
});
