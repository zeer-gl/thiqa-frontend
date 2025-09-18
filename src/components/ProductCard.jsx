import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product }) => {
    console.log('product',product);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    return (
        <div className="col-lg-4 col-md-6 mb-3 mb-md-4">
            <div className="modern-ceiling-card" onClick={handleCardClick} 
            
            style={{
                cursor: 'pointer',
                backgroundImage: `url(${product?.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
                <div className="card-content">
                    <div className='d-flex justify-content-between align-items-center'>
                    <h5 className="card-title mb-3 fw-bold">{product?.name}</h5>
                    <div className='price-container fw-bold'>
                                {product?.price}
                            </div>
                            </div>
                        <div>
                            <h5 className="card-title mb-3 fw-bold">{t('pages.home.productCard.title')}</h5>
                            <div className="card-company fw-bold">
                                <div className='dotted-circle'></div>
                                {t('pages.home.productCard.company')}
                            </div>
                        </div>
                        <div>
                          
                        </div>
                   
                </div>
            </div>
        </div>
    );
};

export default ProductCard; 





