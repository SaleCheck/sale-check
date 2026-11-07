import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../../i18n';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const languageNames = {
    en: t('language.en'),
    da: t('language.da'),
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="language" className="text-sm text-gray-600 font-medium">
        {t('language.label')}
      </label>
      <select
        id="language"
        className="border rounded-sm px-3 py-2"
        value={i18n.resolvedLanguage}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        {supportedLanguages.map((lng) => (
          <option key={lng} value={lng}>
            {languageNames[lng]}
          </option>
        ))}
      </select>
    </div>
  );
}
