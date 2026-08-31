import React, { useState } from 'react';
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
import TrainingTournamentsPage from './components/TrainingTournamentsPage';
import CourtBookingPage from './components/CourtBookingPage';
import { NotificationProvider } from './components/Notification';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'account' | 'shop' | 'training' | 'court-booking' | 'admin'

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
          <ShopPage user={user} onLoginClick={openLogin} />
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
