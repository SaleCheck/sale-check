import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('pageTitle.about');
  }, [t]);

  return (
    <div className="max-w-3xl mx-auto mt-24 px-6">
      <h1 className="text-5xl font-extrabold mb-6 text-gray-900">
        {t('about.title')}
      </h1>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {t('about.inspiration')}
      </h2>

      <p className="text-lg text-gray-700">
        <Trans
          i18nKey="about.similarProduct"
          components={{
            a: (
              <a
                href="https://goma.gg"
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        />
      </p>

      <ul className="list-disc pl-6">
        <li className="text-lg text-gray-700">
          <Trans
            i18nKey="about.builtBy"
            components={{
              a: (
                <a
                  href="https://www.linkedin.com/in/nikolaj-munster/?originalSubdomain=dk"
                  className="text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </li>

        <li className="text-lg text-gray-700">
          <Trans
            i18nKey="about.article"
            components={{
              a: (
                <a
                  href="https://www.dr.dk/nyheder/penge/jagten-paa-billige-foedevarer-har-faaet-nikolaj-til-udvikle-en-digital-tilbudsjaeger"
                  className="text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          />
        </li>
      </ul>
    </div>
  );
}
