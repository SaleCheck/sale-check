import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const markupComponents = { br: <br />, strong: <strong /> };

export default function HowItWorks() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('pageTitle.howItWorks');
  }, [t]);

  return (
    <div className="max-w-3xl mx-auto mt-24 mb-36 px-6">
      <h1 className="text-5xl font-extrabold mb-6 text-gray-900">
        {t('howItWorks.title')}
      </h1>

      <div className="text-lg text-gray-700 space-y-10">
        <p className="ml-4">{t('howItWorks.intro')}</p>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('howItWorks.step1.title')}
          </h2>
          <p className="mt-3 ml-4">
            <Trans
              i18nKey="howItWorks.step1.body"
              components={markupComponents}
            />
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('howItWorks.step2.title')}
          </h2>
          <p className="mt-3 ml-4">
            <Trans
              i18nKey="howItWorks.step2.body"
              components={markupComponents}
            />
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('howItWorks.step3.title')}
          </h2>
          <p className="mt-3 ml-4 mb-4">
            <Trans
              i18nKey="howItWorks.step3.body"
              components={markupComponents}
            />
          </p>

          <div className="my-6 ml-2">
            <iframe
              className="w-full aspect-video rounded-lg"
              src="https://www.youtube.com/embed/GCSym4Bktgg"
              title={t('howItWorks.step3.videoTitle')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('howItWorks.step4.title')}
          </h2>
          <p className="mt-3 ml-4">
            <Trans
              i18nKey="howItWorks.step4.body"
              components={markupComponents}
            />
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('howItWorks.step5.title')}
          </h2>
          <p className="mt-3 ml-4">
            <Trans
              i18nKey="howItWorks.step5.body"
              components={markupComponents}
            />
          </p>
        </div>
      </div>
    </div>
  );
}
