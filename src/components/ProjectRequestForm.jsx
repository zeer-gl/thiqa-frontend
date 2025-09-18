import React from 'react';
import { useTranslation } from 'react-i18next';
import ProjectOfferForm from './ProjectOfferForm';

const ProjectRequestForm = ({ project, onBack, formType = 'projectRequest' }) => {
    const { t } = useTranslation();

    return (
        <ProjectOfferForm
            project={project}
            onBack={onBack}
            formType={formType}
            title={t('projectRequest.title', 'طلب مشروع جديد')}
            subtitle={t('projectRequest.subtitle', 'إنشاء طلب مشروع جديد')}
            searchPlaceholder={t('projectRequest.search', 'البحث في المشاريع...')}
            projectDurationPlaceholder={t('projectRequest.projectDuration', 'المدة المتوقعة للمشروع')}
            pricePlaceholder={t('projectRequest.budget', 'الميزانية المتوقعة')}
            uploadFilePlaceholder={t('projectRequest.uploadFile', 'تحميل ملفات المشروع')}
            notesPlaceholder={t('projectRequest.notes', 'وصف المشروع')}
            submitButtonText={t('projectRequest.submitRequest', 'إرسال الطلب')}
            termsText={t('projectRequest.termsAndPrivacy', 'شروط الاستخدام و سياسة الخصوصية')}
        />
    );
};

export default ProjectRequestForm;
