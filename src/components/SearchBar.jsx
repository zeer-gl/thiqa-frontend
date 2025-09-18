import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch } from 'react-icons/fa';
import '../css/components/search-bar.scss';

const SearchBar = ({ 
    placeholder, 
    value, 
    onChange, 
    onSearch,
    className = '',
    disabled = false 
}) => {
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState(value || '');

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setSearchValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch(searchValue);
        }
    };

    const handleSearchClick = () => {
        if (onSearch) {
            onSearch(searchValue);
        }
    };

    return (
        <div className={`search-bar-container ${className}`}>
            <div className="search-bar">
                <div className="search-icon" onClick={handleSearchClick}>
                    <FaSearch />
                </div>
                <input
                    type="text"
                    className="search-input"
                    placeholder={placeholder || t('common.search', 'البحث...')}
                    value={searchValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    disabled={disabled}
                    dir="rtl"
                />
            </div>
        </div>
    );
};

export default SearchBar;

