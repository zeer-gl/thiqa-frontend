import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ 
    title, 
    subtitle, 
    showCreateButton = true, 
    showSearch = true,
    createButtonText,
    searchPlaceholder,
    onCreateClick,
    onSearchChange,
    createType = "service",
    searchValue = "",
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleCreateClick = () => {
        if (onCreateClick) {
          onCreateClick();
          return;
        }
    
        // Navigate according to condition
        if (createType === "service") {
          navigate('/service-request');
        } else if (createType === "quote") {
          navigate('/request-quote/create');
        }
      };

    return (
        <div className={`header-section ${!showSearch ? 'no-search' : ''}`}>
            <div className="container">
                <div className="row">
                    {/* Right Section - Page Title */}
                    <div className="col-md-4">
                        <div className="page-title">
                            <h1 className="main-title ar-heading-bold navy">{title}</h1>
                            {subtitle && <p className="subtitle">{subtitle}</p>}
                        </div>
                    </div>

                    {/* Middle Section - Create Request Input */}
                    {showCreateButton && (
                        <div className="col-md-4 px-0">
                            <div className="create-request-section">
                                <button className="create-request-btn" onClick={handleCreateClick}>
                                    <div className="custom-icon">
                                        <div className="document-lines">
                                            <div className="line line-1"></div>
                                            <div className="line line-2"></div>
                                            <div className="line line-3"></div>
                                        </div>
                                        <div className="plus-sign">+</div>
                                    </div>
                                    <span>{createButtonText || t("order-request.create-new-quote-request")}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Left Section - Search Bar */}
                    {showSearch && (
                        <div className="col-md-4">
                            <div className="search-section">
                                <div className="search-bar">
                                    <i className="fas fa-search"></i>
                                    <input 
                                        type="text" 
                                        value={searchValue}
                                        placeholder={searchPlaceholder || t("order-request.search")}
                                        onChange={onSearchChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageHeader; 