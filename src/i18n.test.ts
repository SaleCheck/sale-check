import { describe, expect, it } from 'vitest';
import i18n from './i18n';
import en from './locales/en.json';
import da from './locales/da.json';
import de from './locales/de.json';

function collectValues(node: unknown, path = ''): [string, unknown][] {
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) =>
      collectValues(value, path ? `${path}.${key}` : key)
    );
  }
  return [[path, node]];
}

describe('i18n', () => {
  it.each([
    ['en', en],
    ['da', da],
    ['de', de],
  ])('has a non-empty string for every key in %s.json', (_, locale) => {
    // Arrange
    const entries = collectValues(locale);

    // Act
    const invalid = entries.filter(
      ([, value]) => typeof value !== 'string' || value.trim() === ''
    );

    // Assert
    expect(entries.length).toBeGreaterThan(0);
    expect(invalid).toEqual([]);
  });

  it.each([
    ['da', da],
    ['de', de],
  ])('has exactly the same keys in %s.json as in en.json', (_, locale) => {
    // Arrange
    const keysOf = (node: unknown) =>
      collectValues(node)
        .map(([key]) => key)
        .sort();

    // Act
    const enKeys = keysOf(en);
    const localeKeys = keysOf(locale);

    // Assert
    expect(localeKeys).toEqual(enKeys);
  });

  it('resolves nested keys with interpolation', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    const welcome = i18n.t('profile.welcome', { name: 'Jane' });

    // Assert
    expect(welcome).toBe('Welcome, Jane!');
  });

  it('uses English and sets the document language', () => {
    // Arrange
    // (no separate setup needed)

    // Act
    const { language } = i18n;

    // Assert
    expect(language).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
