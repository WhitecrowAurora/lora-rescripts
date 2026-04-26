import { useCallback } from 'react';
import type { Translations } from '../api/types';

export function useTranslation(translations: Translations, language: string) {
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = translations[key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return text;
    },
    [translations, language], // language dep ensures re-render on lang change
  );

  const isZh = language === 'zh';

  return { t, isZh };
}
