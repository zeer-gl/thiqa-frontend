import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/components/breadcrumb.scss';

const Breadcrumb = ({ items }) => {
    const { t } = useTranslation();

    return (
        <div className="breadcrumb-container">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            {index === 0 ? (
                                // First item (Home) - always a link
                                <Link to={item.path || "/"} className="breadcrumb-item text-decoration-none">
                                    <span className="breadcrumb-text">{t(item.label)}</span>
                                </Link>
                            ) : (
                                // Other items
                                <li className="breadcrumb-item">
                                    {item.path ? (
                                        <Link to={item.path} className="text-decoration-none">
                                            <span className="breadcrumb-text">{t(item.label)}</span>
                                        </Link>
                                    ) : (
                                        <span className="breadcrumb-text">{t(item.label)}</span>
                                    )}
                                </li>
                            )}
                            
                            {/* Separator - don't show after last item */}
                            {index < items.length - 1 && (
                                <li className="breadcrumb-separator">
                                    <span className="arrow">‹</span>
                                </li>
                            )}
                        </React.Fragment>
                    ))}
                </ol>
            </nav>
        </div>
    );
};

export default Breadcrumb; 