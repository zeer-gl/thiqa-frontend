import React from 'react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    hideNavigation = false,
    showArrows = false,
    className = ""
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 7;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 4) {
                pages.push('...');
            }
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }
            if (currentPage < totalPages - 3) {
                pages.push('...');
            }
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`pagination-container ${className}`}>
            <div className="pagination">
                {/* Previous Button */}
                {(!hideNavigation || showArrows) && (
                    <button
                        className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label={t('pagination.previous')}
                    >
                        <i className={`fas fa-chevron-${isRTL ? 'right' : 'left'}`}></i>
                        {!showArrows && <span className="btn-text">{t('pagination.previous')}</span>}
                    </button>
                )}

                {/* Page Numbers - Only show if not using arrow-only mode */}
                {!showArrows && (
                    <div className="page-numbers">
                        {pageNumbers.map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span className="page-ellipsis">...</span>
                                ) : (
                                    <button
                                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => onPageChange(page)}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Next Button */}
                {(!hideNavigation || showArrows) && (
                    <button
                        className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label={t('pagination.next')}
                    >
                        {!showArrows && <span className="btn-text">{t('pagination.next')}</span>}
                        <i className={`fas fa-chevron-${isRTL ? 'left' : 'right'}`}></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Pagination;