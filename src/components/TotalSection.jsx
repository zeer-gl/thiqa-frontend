import { useTranslation } from 'react-i18next';
import '../css/components/total-section.scss';

const TotalSection = ({ amount = 0, currency = 'kwd' }) => {
    const { t } = useTranslation();

    return (
        <div className="total-section">
            <div className="total-amount">
                <div className="total-label">
                    <span>{t("order-request.the-total")}</span>
                </div>
                <div style={{backgroundColor:'#21395D', height:'24px', width:'1px'}}></div>
                <div className="total-value">
                    <span className="currency">{amount} {t(`order-request.${currency}`)}</span>
                </div>
            </div>
        </div>
    );
};

export default TotalSection; 