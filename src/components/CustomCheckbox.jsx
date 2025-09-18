import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../css/global/global.scss';
import Tick from '/public/images/tick.svg';

const CustomCheckbox = ({ label }) => {
    const { t } = useTranslation();
    const [checked, setChecked] = useState(false);

    return (
        <label className="custom-checkbox-wrapper">
            <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
                className="hidden-checkbox"
            />
            <span className={`custom-box ${checked ? 'checked' : ''}`}>
        {checked && <span className="checkmark"><img src={Tick} alt=""/></span>}
      </span>
            <span className="checkbox-label">{label || t('common.rememberMe', 'Remember me')}</span>
        </label>
    );
};

export default CustomCheckbox;
