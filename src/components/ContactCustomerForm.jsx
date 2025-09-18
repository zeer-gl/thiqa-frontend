import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectOfferForm from './ProjectOfferForm';

const ContactCustomerForm = ({ project, onBack, formType = 'contactCustomer' }) => {
    const { t } = useTranslation();

    return (
        <ProjectOfferForm
            project={project}
            onBack={onBack}
            formType={formType}
            title={t('contactCustomer.title', 'إيداع عرض للمشروع')}
            subtitle={t('contactCustomer.subtitle', 'إيداع عرض للمشروع : بناء فيلا')}
            searchPlaceholder={t('contactCustomer.search', 'البحث....')}
            projectDurationPlaceholder={t('contactCustomer.projectDuration', 'مدة إنجاز المشروع')}
            pricePlaceholder={t('contactCustomer.price', 'د.ك السعر')}
            uploadFilePlaceholder={t('contactCustomer.uploadFile', 'تحميل ملف إنجاز المشروع')}
            notesPlaceholder={t('contactCustomer.notes', 'أضف ملاحظة')}
            submitButtonText={t('contactCustomer.submitOffer', 'إيداع العرض')}
            termsText={t('contactCustomer.termsAndPrivacy', 'شروط الاستخدام و سياسة الخصوصية')}
        />
    );
};

export default ContactCustomerForm;
