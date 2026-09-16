import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GlobalBackground from './components/GlobalBackground';
import Hero from './components/Hero';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import AboutUs from './components/AboutUs';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import AccountPage from './components/AccountPage';
import ShopPage from './components/ShopPage';
import CheckoutPage from './components/CheckoutPage';
import TrainingTournamentsPage from './components/TrainingTournamentsPage';
import CourtBookingPage from './components/CourtBookingPage';
import { NotificationProvider } from './components/Notification';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'account' | 'shop' | 'checkout' | 'training' | 'court-booking' | 'admin'

  // Centralized cart state with localStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('yamundra_pro_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to load cart from storage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('yamundra_pro_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart to storage:', e);
    }
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prevCart, { ...product, quantity: qty }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    closeModals();
    if (userData.role === 'admin') {
      setCurrentView('admin');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home'); // Redirect to home on logout
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NotificationProvider userId={user?.id || null}>
      <>
        {currentView !== 'admin' && <GlobalBackground />}
        {currentView !== 'admin' && (
          <Navbar 
            onLoginClick={openLogin} 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={navigateTo} 
            currentView={currentView}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          />
        )}
        
        {currentView === 'home' && (
          <>
            <div id="home">
              <Hero onLoginClick={openLogin} />
            </div>
            <div id="about">
              <AboutUs />
            </div>
            <div id="services">
              <Services onNavigate={navigateTo} />
            </div>
            <div id="testimonials">
              <Testimonials />
            </div>
            <div id="contact">
              <ContactUs />
            </div>
          </>
        )}

        {currentView === 'shop' && (
          <ShopPage 
            user={user} 
            onLoginClick={openLogin} 
            onNavigate={navigateTo}
            cart={cart}
            setCart={setCart}
            addToCart={addToCart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage 
            cart={cart}
            setCart={setCart}
            user={user}
            onLoginClick={openLogin}
            onNavigate={navigateTo}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
          />
        )}

        {currentView === 'training' && (
          <TrainingTournamentsPage user={user} onLoginClick={openLogin} />
        )}

        {currentView === 'court-booking' && (
          <CourtBookingPage user={user} onLoginClick={openLogin} />
        )}

        {currentView === 'account' && (
          <AccountPage user={user} onLogout={handleLogout} setUser={setUser} />
        )}

        {currentView === 'admin' && user?.role === 'admin' && (
          <AdminDashboard user={user} onLogout={handleLogout} />
        )}
        
        {currentView !== 'admin' && <Footer />}
        
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={closeModals} 
          onSwitchToRegister={openRegister} 
          onLoginSuccess={handleLoginSuccess}
        />
        
        <RegisterModal 
          isOpen={isRegisterOpen} 
          onClose={closeModals} 
          onSwitchToLogin={openLogin} 
        />
      </>
    </NotificationProvider>
  );
}

export default App;
