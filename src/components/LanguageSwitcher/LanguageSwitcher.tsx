import {
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { DK, US } from 'country-flag-icons/react/3x2';
import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '../../i18n';

interface LanguageSwitcherProps {
  inline?: boolean;
}

const flags = { en: US, da: DK } satisfies Record<SupportedLanguage, typeof US>;

export default function LanguageSwitcher({
  inline = false,
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();

  const languageNames: Record<SupportedLanguage, string> = {
    en: t('language.en'),
    da: t('language.da'),
  };
  const current = (i18n.resolvedLanguage ?? 'en') as SupportedLanguage;
  const CurrentFlag = flags[current];

  return (
    <Field
      className={inline ? 'flex items-center gap-2' : 'flex flex-col gap-2'}
    >
      {/* Inline (footer) hides the label visually but keeps it for screen readers */}
      <Label
        className={inline ? 'sr-only' : 'text-sm text-gray-600 font-medium'}
      >
        {t('language.label')}
      </Label>
      <Listbox value={current} onChange={(lng) => i18n.changeLanguage(lng)}>
        <ListboxButton
          className={`flex items-center gap-2 border rounded-sm bg-white text-left ${
            inline ? 'px-2 py-1 text-sm' : 'px-3 py-2'
          }`}
        >
          <CurrentFlag aria-hidden="true" className="h-3.5 w-5 rounded-xs" />
          <span className="flex-1">{languageNames[current]}</span>
          <ChevronUpDownIcon
            aria-hidden="true"
            className="h-4 w-4 text-gray-400"
          />
        </ListboxButton>
        <ListboxOptions
          anchor={inline ? 'top end' : 'bottom start'}
          className="z-50 min-w-(--button-width) rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 [--anchor-gap:4px] focus:outline-hidden"
        >
          {supportedLanguages.map((lng) => {
            const Flag = flags[lng];
            return (
              <ListboxOption
                key={lng}
                value={lng}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-selected:font-semibold"
              >
                <Flag aria-hidden="true" className="h-3.5 w-5 rounded-xs" />
                {languageNames[lng]}
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </Listbox>
    </Field>
  );
}
