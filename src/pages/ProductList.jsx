import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import '../css/pages/product.scss';
import { BaseUrl } from '../assets/BaseUrl.jsx';
import ProductCard from '../components/ProductCard.jsx'

const ProductList = () => {
    const { t, i18n } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await fetch(`${BaseUrl}/customer/getAllProducts`,{
                    method:"GET",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    },
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.message || `Failed to load products (${res.status})`);
                }
                const data = await res.json();
                const list = Array.isArray(data?.products) ? data.products : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
                setProducts(list);
            } catch (e) {
                setError(e?.message || 'Unable to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, []);
      const parseCategory = (catStr) => {
        try {
          return Function('"use strict";return (' + catStr + ')')();
        } catch {
          return {};
        }
      };

    return (
        <div className="page-container">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <h1 className="fw-bold">{t('pages.products.title')}</h1>
                        <p className="lead">{t('pages.products.description')}</p>

                        <div className="row mt-4">
                            {loading && [1,2,3,4].map(s => (
                                <div key={`s-${s}`} className="col-md-3 mb-3">
                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold">{t('loading') || 'Loading...'}</h5>
                                            <p className="card-text">...</p>
                                            <button className="btn btn-primary" disabled>{t('loading') || 'Loading...'}</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!loading && error && (
                                <div className="col-12">
                                    <div className="alert alert-danger">{error}</div>
                                </div>
                            )}
                        <div className="row">
  {!loading && !error && (products.length > 0 ? (
    products.map((product) => (
      <ProductCard 
        key={product._id || product.id}
        product={{
          id: product._id,
          name: i18n.language === 'ar' ? product.name_ar : product.name_en,
          categoryName: parseCategory(product?.categoryName)?.[i18n.language] 
                      || parseCategory(product?.categoryName)?.en 
                      || "",
          price: product.price,
          measurementUnit: product?.measurementUnit,
          image: product.images?.[0],
          isSkeleton: false
        }} 
      />
     
    ))
  ) : (
    [1,2,3,4].map(item => (
      <div key={`e-${item}`} className="col-lg-4 col-md-6 col-sm-12 mb-3">
        <div className="card h-100">
          <div className="card-body">
            <h5 className="card-title fw-bold">Product {item}</h5>
            <p className="card-text">Product description here.</p>
            <button className="btn btn-primary">View Details</button>
          </div>
        </div>
      </div>
    ))
  ))}
  
</div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductList;