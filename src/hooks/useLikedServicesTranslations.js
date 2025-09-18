import { useTranslation } from 'react-i18next';
import { likedServicesTranslations } from '../translations/likedServicesTranslations';

export const useLikedServicesTranslations = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  
  return likedServicesTranslations[currentLanguage] || likedServicesTranslations.en;
};
