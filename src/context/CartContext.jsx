import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Load cart data from localStorage on component mount
  useEffect(() => {
    const loadCartData = () => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          const cartArray = Array.isArray(parsedCart) ? parsedCart : [];
          setCartItems(cartArray);
          setCartCount(cartArray.length);
        }
      } catch (error) {
        console.error('Error loading cart data:', error);
        setCartItems([]);
        setCartCount(0);
      }
    };
    
    loadCartData();
  }, []);

  // Listen for localStorage changes to update cart state
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        try {
          const cartData = localStorage.getItem('cart');
          if (cartData) {
            const parsedCart = JSON.parse(cartData);
            const cartArray = Array.isArray(parsedCart) ? parsedCart : [];
            setCartItems(cartArray);
            setCartCount(cartArray.length);
          } else {
            setCartItems([]);
            setCartCount(0);
          }
        } catch (error) {
          console.error('Error updating cart from storage change:', error);
          setCartItems([]);
          setCartCount(0);
        }
      }
    };

    // Listen for custom cart events (for same-tab updates)
    const handleCartUpdate = () => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          const cartArray = Array.isArray(parsedCart) ? parsedCart : [];
          setCartItems(cartArray);
          setCartCount(cartArray.length);
        } else {
          setCartItems([]);
          setCartCount(0);
        }
      } catch (error) {
        console.error('Error updating cart from custom event:', error);
        setCartItems([]);
        setCartCount(0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Function to add item to cart
  const addToCart = (product, quantity = 1) => {
    try {
      const existingCart = [...cartItems];
      const existingItemIndex = existingCart.findIndex(item => item._id === product._id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        existingCart[existingItemIndex].quantity = quantity;
      } else {
        // Add new item to cart
        existingCart.push({ ...product, quantity });
      }
      
      setCartItems(existingCart);
      setCartCount(existingCart.length);
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Function to remove item from cart
  const removeFromCart = (productId) => {
    try {
      const updatedCart = cartItems.filter(item => item._id !== productId);
      setCartItems(updatedCart);
      setCartCount(updatedCart.length);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Function to update item quantity
  const updateQuantity = (productId, quantity) => {
    try {
      const updatedCart = cartItems.map(item => {
        if (item._id === productId) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      });
      
      setCartItems(updatedCart);
      setCartCount(updatedCart.length);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Function to clear cart
  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    localStorage.removeItem('cart');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  // Function to get total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Function to get total items count (including quantities)
  const getTotalItemsCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
