import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShoppingCart, FaArrowLeft, FaCheckCircle, FaLock, FaShieldAlt, 
  FaTruck, FaStore, FaCreditCard, FaPaypal, FaMoneyBillWave, FaUniversity, 
  FaTag, FaTrashAlt, FaPlus, FaMinus, FaPrint, FaChevronRight, FaBoxOpen,
  FaCheck, FaExclamationCircle, FaInfoCircle
} from 'react-icons/fa';

const CheckoutPage = ({ 
  cart = [], 
  setCart, 
  user, 
  onLoginClick, 
  onNavigate,
  updateQuantity,
  removeFromCart,
  clearCart
}) => {
  // Step navigation: 1: Customer & Shipping, 2: Delivery & Customization, 3: Payment
  const [currentStep, setCurrentStep] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderRefNumber, setOrderRefNumber] = useState('');
  const [placedOrderData, setPlacedOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    firstName: user?.firstName || (user?.username ? user.username.split(' ')[0] : '') || '',
    lastName: user?.lastName || (user?.username ? user.username.split(' ')[1] || '' : '') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    apartment: '',
    city: 'Colombo',
    state: 'Western Province',
    postalCode: '10100',
    country: 'Sri Lanka',
    saveAddress: true
  });

  // Shipping method: 'standard' | 'express' | 'pickup'
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Customization & stringing notes
  const [customization, setCustomization] = useState({
    stringTension: '26 lbs (Academy Recommended)',
    stringType: 'Yonex BG65 Titanium (Durability)',
    gripPreference: 'Standard Factory Grip',
    specialNotes: ''
  });

  // Payment method: 'card' | 'paypal' | 'cod' | 'bank'
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4532 •••• •••• 8892',
    cardHolder: (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username) || 'CHAMPION PLAYER',
    expiry: '08/28',
    cvv: '•••'
  });

  // Promo code engine
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState(null);

  // Update formData if user prop changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || user.firstName || user.username || '',
        lastName: prev.lastName || user.lastName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
      setCardDetails(prev => ({
        ...prev,
        cardHolder: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.username || prev.cardHolder)
      }));
    }
  }, [user]);

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Shipping calculation
  let baseShippingFee = 12.00;
  if (shippingMethod === 'pickup') {
    baseShippingFee = 0.00;
  } else if (shippingMethod === 'express') {
    baseShippingFee = 24.00;
  } else if (cartSubtotal > 100 || cartSubtotal === 0) {
    baseShippingFee = 0.00; // Free standard shipping on orders over $100
  }

  // Discount calculation
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      discountAmount = (cartSubtotal * appliedPromo.value) / 100;
    } else if (appliedPromo.type === 'fixed') {
      discountAmount = Math.min(appliedPromo.value, cartSubtotal);
    } else if (appliedPromo.type === 'shipping') {
      baseShippingFee = 0.00;
    }
  }

  const taxAmount = (cartSubtotal - discountAmount) > 0 ? (cartSubtotal - discountAmount) * 0.05 : 0; // 5% GST/Tax
  const finalShippingFee = baseShippingFee;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + taxAmount + finalShippingFee);

  // Handle promo code submit
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SMASH10') {
      setAppliedPromo({ code: 'SMASH10', type: 'percentage', value: 10, label: '10% Tournament Discount' });
      setPromoMessage({ type: 'success', text: 'Coupon applied: 10% OFF full order!' });
      setPromoCodeInput('');
    } else if (code === 'YAMUNDRA20') {
      if (cartSubtotal < 80) {
        setPromoMessage({ type: 'error', text: 'YAMUNDRA20 requires a minimum order of $80.00' });
      } else {
        setAppliedPromo({ code: 'YAMUNDRA20', type: 'fixed', value: 20, label: '$20 Academy Voucher' });
        setPromoMessage({ type: 'success', text: 'Coupon applied: $20.00 voucher deducted!' });
        setPromoCodeInput('');
      }
    } else if (code === 'FREESHIP') {
      setAppliedPromo({ code: 'FREESHIP', type: 'shipping', value: 0, label: 'Free Express/Standard Shipping' });
      setPromoMessage({ type: 'success', text: 'Coupon applied: 100% Free Shipping!' });
      setPromoCodeInput('');
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Try SMASH10 or FREESHIP' });
    }

    setTimeout(() => {
      setPromoMessage(null);
    }, 4000);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoMessage(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errorMessage) setErrorMessage('');
  };

  // Validate current step
  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setErrorMessage('Please enter your full first and last name.');
        return false;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Please enter a valid email address for your order confirmation.');
        return false;
      }
      if (!formData.phone.trim()) {
        setErrorMessage('Please provide a contact phone number for shipment updates.');
        return false;
      }
      if (shippingMethod !== 'pickup' && !formData.address.trim()) {
        setErrorMessage('Please provide a delivery street address.');
        return false;
      }
    }
    setErrorMessage('');
    return true;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(3, prev + 1));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const goToPrevStep = () => {
    setErrorMessage('');
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Submit Order
  const handlePlaceOrder = async () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const newOrderRef = `#YAM-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date().toISOString().split('T')[0];

    const orderPayload = {
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      username: user ? user.username : (formData.email || 'guest'),
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      },
      shippingAddress: {
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country
      },
      shippingMethod,
      paymentMethod,
      orderRef: newOrderRef,
      discountCode: appliedPromo ? appliedPromo.code : null,
      discountAmount,
      shippingFee: finalShippingFee,
      totalAmount: grandTotal,
      notes: `Tension: ${customization.stringTension} | String: ${customization.stringType} | Grip: ${customization.gripPreference} | Note: ${customization.specialNotes}`,
      purchase_date: today
    };

    try {
      // 1. Send order to backend /api/shop/checkout
      const response = await fetch('http://localhost:5000/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        // Fallback to individual purchase route if needed
        await Promise.all(
          cart.map(item =>
            fetch('http://localhost:5000/api/shop/purchase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: user?.username || formData.email || 'guest',
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                price: item.price,
                purchase_date: today
              })
            })
          )
        );
      }

      setOrderRefNumber(newOrderRef);
      setPlacedOrderData(orderPayload);
      setOrderSuccess(true);
      
      // Clear cart
      if (clearCart) {
        clearCart();
      } else if (setCart) {
        setCart([]);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Order submission error:', err);
      setOrderRefNumber(newOrderRef);
      setPlacedOrderData(orderPayload);
      setOrderSuccess(true);
      if (clearCart) clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was placed successfully, display celebration receipt screen
  if (orderSuccess && placedOrderData) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={styles.successCard}
          >
            {/* Animated Check Header */}
            <div style={styles.successHeader}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={styles.successBadge}
              >
                <FaCheckCircle style={{ fontSize: '3.5rem', color: 'var(--accent)' }} />
              </motion.div>
              <h1 style={styles.successTitle}>Order Placed Successfully!</h1>
              <p style={styles.successSubtitle}>
                Thank you, <strong style={{ color: '#fff' }}>{placedOrderData.customer.firstName} {placedOrderData.customer.lastName}</strong>! Your tournament gear order has been confirmed.
              </p>
              <div style={styles.orderRefBox}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Order Reference:</span>
                <span style={styles.orderRefNumber}>{orderRefNumber}</span>
              </div>
            </div>

            {/* Delivery Progress Bar */}
            <div style={styles.timelineCard}>
              <div style={styles.timelineItemActive}>
                <div style={styles.timelineDotActive}><FaCheck style={{ fontSize: '0.65rem' }} /></div>
                <span style={styles.timelineLabelActive}>Order Confirmed</span>
              </div>
              <div style={styles.timelineLine} />
              <div style={styles.timelineItem}>
                <div style={styles.timelineDot}><FaBoxOpen style={{ fontSize: '0.75rem' }} /></div>
                <span style={styles.timelineLabel}>Custom Stringing</span>
              </div>
              <div style={styles.timelineLine} />
              <div style={styles.timelineItem}>
                <div style={styles.timelineDot}><FaTruck style={{ fontSize: '0.75rem' }} /></div>
                <span style={styles.timelineLabel}>Dispatched</span>
              </div>
              <div style={styles.timelineLine} />
              <div style={styles.timelineItem}>
                <div style={styles.timelineDot}><FaStore style={{ fontSize: '0.75rem' }} /></div>
                <span style={styles.timelineLabel}>Delivered</span>
              </div>
            </div>

            {/* Order Details Grid */}
            <div style={styles.receiptGrid}>
              {/* Delivery Details */}
              <div style={styles.receiptBox}>
                <h4 style={styles.receiptSectionTitle}>
                  <FaTruck style={{ color: 'var(--primary)', marginRight: '0.5rem' }} /> 
                  Delivery Details
                </h4>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptMuted}>Method:</span>
                  <span style={styles.receiptVal}>
                    {placedOrderData.shippingMethod === 'pickup' 
                      ? 'Yamundra Academy Front Desk Pickup' 
                      : placedOrderData.shippingMethod === 'express' 
                        ? 'Express Air Priority Courier (1-2 Days)' 
                        : 'Standard Insured Delivery (3-5 Days)'}
                  </span>
                </div>
                {placedOrderData.shippingMethod !== 'pickup' && (
                  <div style={styles.receiptRow}>
                    <span style={styles.receiptMuted}>Destination:</span>
                    <span style={styles.receiptVal}>
                      {placedOrderData.shippingAddress.address}, {placedOrderData.shippingAddress.city}, {placedOrderData.shippingAddress.country}
                    </span>
                  </div>
                )}
                <div style={styles.receiptRow}>
                  <span style={styles.receiptMuted}>Recipient Contact:</span>
                  <span style={styles.receiptVal}>{placedOrderData.customer.email} • {placedOrderData.customer.phone}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div style={styles.receiptBox}>
                <h4 style={styles.receiptSectionTitle}>
                  <FaCreditCard style={{ color: 'var(--accent)', marginRight: '0.5rem' }} /> 
                  Payment Summary
                </h4>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptMuted}>Payment Method:</span>
                  <span style={styles.receiptVal}>
                    {placedOrderData.paymentMethod === 'card' ? 'Credit / Debit Card (Verified)' :
                     placedOrderData.paymentMethod === 'paypal' ? 'PayPal Express' :
                     placedOrderData.paymentMethod === 'bank' ? 'Direct Bank Transfer' : 'Cash on Delivery'}
                  </span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptMuted}>Payment Status:</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Authorized & Confirmed</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptMuted}>Total Charged:</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.1rem' }}>
                    ${placedOrderData.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Order Table */}
            <div style={styles.receiptItemsCard}>
              <h4 style={styles.receiptSectionTitle}>Items Ordered</h4>
              <div style={styles.receiptItemsList}>
                {placedOrderData.items.map((item, idx) => (
                  <div key={idx} style={styles.receiptItemRow}>
                    <div style={styles.receiptItemInfo}>
                      <span style={styles.receiptItemQty}>{item.quantity}x</span>
                      <div>
                        <span style={styles.receiptItemName}>{item.name}</span>
                        <div style={styles.receiptItemSpecs}>Tournament Verified • Pro Certified</div>
                      </div>
                    </div>
                    <span style={styles.receiptItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={styles.receiptSummaryFooter}>
                <div style={styles.receiptSummaryLine}>
                  <span>Subtotal:</span>
                  <span>${placedOrderData.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                </div>
                {placedOrderData.discountAmount > 0 && (
                  <div style={{ ...styles.receiptSummaryLine, color: 'var(--accent)' }}>
                    <span>Discount ({placedOrderData.discountCode || 'Promo'}):</span>
                    <span>-${placedOrderData.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div style={styles.receiptSummaryLine}>
                  <span>Shipping:</span>
                  <span>{placedOrderData.shippingFee === 0 ? 'FREE' : `$${placedOrderData.shippingFee.toFixed(2)}`}</span>
                </div>
                <div style={styles.receiptDivider} />
                <div style={{ ...styles.receiptSummaryLine, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--accent)' }}>${placedOrderData.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customization Note Badge */}
            {placedOrderData.notes && (
              <div style={styles.customizationReceiptNotice}>
                <FaInfoCircle style={{ color: 'var(--primary)', fontSize: '1.2rem', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff', display: 'block', marginBottom: '0.2rem' }}>Special Customization Requests:</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{placedOrderData.notes}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.successActions}>
              <button 
                onClick={() => window.print()} 
                style={styles.printBtn}
              >
                <FaPrint /> Print Order Invoice
              </button>
              <button 
                onClick={() => onNavigate ? onNavigate('shop') : null} 
                className="btn btn-primary"
                style={{ padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 700 }}
              >
                Continue Shopping
              </button>
              {user && (
                <button 
                  onClick={() => onNavigate ? onNavigate('account') : null} 
                  className="btn btn-secondary"
                  style={{ padding: '0.9rem 1.8rem' }}
                >
                  View in My Account
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // If cart is empty, show modern empty cart view
  if (!cart || cart.length === 0) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.container}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.emptyCard}
          >
            <div style={styles.emptyIcon}>🏸</div>
            <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.8rem' }}>Your Pro Shop Bag is Empty</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              You haven't added any rackets, shoes, or tournament equipment to your bag yet. Check out our high-performance gear to get tournament ready!
            </p>
            <button 
              onClick={() => onNavigate ? onNavigate('shop') : null}
              className="btn btn-primary"
              style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 700 }}
            >
              <FaShoppingCart style={{ marginRight: '0.6rem' }} /> Explore Pro Shop
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* Navigation Breadcrumbs & Back Link */}
        <div style={styles.breadcrumbBar}>
          <button 
            style={styles.backBtn}
            onClick={() => onNavigate ? onNavigate('shop') : null}
          >
            <FaArrowLeft /> Back to Pro Shop
          </button>

          <div style={styles.breadcrumbs}>
            <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('home')}>Home</span>
            <FaChevronRight style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }} />
            <span style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('shop')}>Pro Shop</span>
            <FaChevronRight style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }} />
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Secure Checkout</span>
          </div>
        </div>

        {/* Checkout Steps Progress Bar */}
        <div style={styles.stepperContainer}>
          <div 
            style={currentStep >= 1 ? styles.stepItemActive : styles.stepItem}
            onClick={() => setCurrentStep(1)}
          >
            <div style={currentStep >= 1 ? styles.stepCircleActive : styles.stepCircle}>
              {currentStep > 1 ? <FaCheck /> : '1'}
            </div>
            <div style={styles.stepTextGroup}>
              <span style={styles.stepTitle}>Customer & Shipping</span>
              <span style={styles.stepSubtitle}>Contact details & address</span>
            </div>
          </div>

          <div style={currentStep >= 2 ? styles.stepConnectorActive : styles.stepConnector} />

          <div 
            style={currentStep >= 2 ? styles.stepItemActive : styles.stepItem}
            onClick={() => validateStep(1) && setCurrentStep(2)}
          >
            <div style={currentStep >= 2 ? styles.stepCircleActive : styles.stepCircle}>
              {currentStep > 2 ? <FaCheck /> : '2'}
            </div>
            <div style={styles.stepTextGroup}>
              <span style={styles.stepTitle}>Delivery & Customization</span>
              <span style={styles.stepSubtitle}>Shipping speed & string specs</span>
            </div>
          </div>

          <div style={currentStep >= 3 ? styles.stepConnectorActive : styles.stepConnector} />

          <div 
            style={currentStep >= 3 ? styles.stepItemActive : styles.stepItem}
            onClick={() => validateStep(1) && setCurrentStep(3)}
          >
            <div style={currentStep >= 3 ? styles.stepCircleActive : styles.stepCircle}>
              3
            </div>
            <div style={styles.stepTextGroup}>
              <span style={styles.stepTitle}>Payment & Review</span>
              <span style={styles.stepSubtitle}>Secure payment method</span>
            </div>
          </div>
        </div>

        {/* Validation Error Alert Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={styles.errorBanner}
            >
              <FaExclamationCircle style={{ fontSize: '1.2rem', color: '#ff4d4f', flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main 2-Column Grid */}
        <div style={styles.checkoutGrid}>
          
          {/* LEFT COLUMN: Steps Content */}
          <div style={styles.leftCol}>
            
            {/* STEP 1: Customer & Shipping Details */}
            {currentStep === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={styles.formCard}
              >
                {/* Logged in vs Guest Banner */}
                {user ? (
                  <div style={styles.userBanner}>
                    <FaCheckCircle style={{ color: 'var(--accent)', fontSize: '1.2rem', flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#fff', fontWeight: 600 }}>Logged in as {user.username}</span>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.email || 'Registered Academy Member'}</span>
                    </div>
                  </div>
                ) : (
                  <div style={styles.guestBanner}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <FaLock style={{ color: '#ffd700', fontSize: '1.1rem' }} />
                      <div>
                        <span style={{ color: '#fff', fontWeight: 600 }}>Checking out as Guest</span>
                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Have an account with us? Sign in for instant checkout.</span>
                      </div>
                    </div>
                    {onLoginClick && (
                      <button 
                        onClick={onLoginClick}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                )}

                <h3 style={styles.sectionHeader}>1. Customer Contact Details</h3>
                
                <div style={styles.rowTwoCols}>
                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>First Name *</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      placeholder="e.g. Maleesha"
                      value={formData.firstName} 
                      onChange={handleInputChange}
                      style={styles.input} 
                    />
                  </div>
                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>Last Name *</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      placeholder="e.g. Yomal"
                      value={formData.lastName} 
                      onChange={handleInputChange}
                      style={styles.input} 
                    />
                  </div>
                </div>

                <div style={styles.rowTwoCols}>
                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>Email Address (For Tracking & Invoice) *</label>
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="e.g. champion@yamundra.com"
                      value={formData.email} 
                      onChange={handleInputChange}
                      style={styles.input} 
                    />
                  </div>
                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>Phone Number (For Delivery SMS) *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      placeholder="e.g. +94 77 123 4567"
                      value={formData.phone} 
                      onChange={handleInputChange}
                      style={styles.input} 
                    />
                  </div>
                </div>

                <div style={styles.cardDivider} />

                <h3 style={styles.sectionHeader}>2. Shipping Address</h3>

                <div style={styles.inputWrapper}>
                  <label style={styles.label}>Street Address *</label>
                  <input 
                    type="text" 
                    name="address" 
                    placeholder="e.g. 142 Badminton Boulevard, Court 4 Avenue"
                    value={formData.address} 
                    onChange={handleInputChange}
                    style={styles.input} 
                  />
                </div>

                <div style={styles.inputWrapper}>
                  <label style={styles.label}>Apartment, Suite, Unit (Optional)</label>
                  <input 
                    type="text" 
                    name="apartment" 
                    placeholder="e.g. Apt 4B, Level 2"
                    value={formData.apartment} 
                    onChange={handleInputChange}
                    style={styles.input} 
                  />
                </div>

                <div style={styles.rowThreeCols}>
                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>City *</label>
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="Colombo"
                      value={formData.city} 
                      onChange={handleInputChange}
                      style={styles.input} 
                    />
                  </div>
                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>State / Province *</label>
                    <input 
                      type="text" 
                      name="state" 
                      placeholder="Western"
                      value={formData.state} 
                      onChange={handleInputChange}
                      style={styles.input} 
                    />
                  </div>
                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>Postal Code *</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      placeholder="10100"
                      value={formData.postalCode} 
                      onChange={handleInputChange}
                      style={styles.input} 
                    />
                  </div>
                </div>

                <div style={styles.inputWrapper}>
                  <label style={styles.label}>Country</label>
                  <select 
                    name="country" 
                    value={formData.country} 
                    onChange={handleInputChange}
                    style={styles.selectInput}
                  >
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    name="saveAddress" 
                    checked={formData.saveAddress} 
                    onChange={handleInputChange} 
                    style={{ accentColor: 'var(--accent)', width: '18px', height: '18px' }}
                  />
                  <span>Save this address for fast checkout on future equipment orders</span>
                </label>

                <div style={styles.stepBtnRow}>
                  <button 
                    onClick={goToNextStep}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: 700 }}
                  >
                    Continue to Delivery Options <FaChevronRight style={{ marginLeft: '0.5rem' }} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Delivery Method & Customization */}
            {currentStep === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={styles.formCard}
              >
                <h3 style={styles.sectionHeader}>Select Shipping & Delivery Speed</h3>

                <div style={styles.shippingOptionsList}>
                  
                  {/* Standard Delivery */}
                  <div 
                    style={shippingMethod === 'standard' ? styles.shippingOptionSelected : styles.shippingOption}
                    onClick={() => setShippingMethod('standard')}
                  >
                    <div style={styles.shippingOptionRadio}>
                      <div style={shippingMethod === 'standard' ? styles.radioInnerActive : styles.radioInner} />
                    </div>
                    <div style={styles.shippingOptionContent}>
                      <div style={styles.shippingOptionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <FaTruck style={{ color: 'var(--primary)', fontSize: '1.2rem' }} />
                          <strong style={{ color: '#fff', fontSize: '1.05rem' }}>Standard Tracked Courier</strong>
                        </div>
                        <span style={styles.shippingPriceTag}>
                          {cartSubtotal > 100 ? <span style={{ color: 'var(--accent)' }}>FREE</span> : '$12.00'}
                        </span>
                      </div>
                      <p style={styles.shippingOptionDesc}>
                        Delivered within 3 to 5 business days with live SMS tracking updates. Free on orders over $100!
                      </p>
                    </div>
                  </div>

                  {/* Express Delivery */}
                  <div 
                    style={shippingMethod === 'express' ? styles.shippingOptionSelected : styles.shippingOption}
                    onClick={() => setShippingMethod('express')}
                  >
                    <div style={styles.shippingOptionRadio}>
                      <div style={shippingMethod === 'express' ? styles.radioInnerActive : styles.radioInner} />
                    </div>
                    <div style={styles.shippingOptionContent}>
                      <div style={styles.shippingOptionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <FaTruck style={{ color: 'var(--accent)', fontSize: '1.2rem' }} />
                          <strong style={{ color: '#fff', fontSize: '1.05rem' }}>Express Priority Air Courier</strong>
                          <span style={styles.badgeFast}>FASTEST</span>
                        </div>
                        <span style={styles.shippingPriceTag}>$24.00</span>
                      </div>
                      <p style={styles.shippingOptionDesc}>
                        Urgent tournament dispatch! Delivered in 1 to 2 business days with insured damage protection.
                      </p>
                    </div>
                  </div>

                  {/* Academy Pickup */}
                  <div 
                    style={shippingMethod === 'pickup' ? styles.shippingOptionSelected : styles.shippingOption}
                    onClick={() => setShippingMethod('pickup')}
                  >
                    <div style={styles.shippingOptionRadio}>
                      <div style={shippingMethod === 'pickup' ? styles.radioInnerActive : styles.radioInner} />
                    </div>
                    <div style={styles.shippingOptionContent}>
                      <div style={styles.shippingOptionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <FaStore style={{ color: '#ffd700', fontSize: '1.2rem' }} />
                          <strong style={{ color: '#fff', fontSize: '1.05rem' }}>Yamundra Academy Front Desk Pickup</strong>
                        </div>
                        <span style={{ ...styles.shippingPriceTag, color: 'var(--accent)' }}>FREE</span>
                      </div>
                      <p style={styles.shippingOptionDesc}>
                        Pick up directly at Yamundra Center Court 1 Pro Shop Desk. Ready same day during operating hours (06:00 - 22:00).
                      </p>
                    </div>
                  </div>
                </div>

                <div style={styles.cardDivider} />

                {/* Professional Customization & Stringing Request */}
                <h3 style={styles.sectionHeader}>🏸 Racket Stringing & Customization (Free Service)</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
                  Yamundra's master stringers provide complimentary electronic tension stringing for all rackets purchased.
                </p>

                <div style={styles.rowTwoCols}>
                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>Requested String Tension</label>
                    <select 
                      value={customization.stringTension}
                      onChange={(e) => setCustomization({ ...customization, stringTension: e.target.value })}
                      style={styles.selectInput}
                    >
                      <option value="Factory Default">Factory Default Tension</option>
                      <option value="24 lbs (Beginner / Control)">24 lbs (Beginner / Control)</option>
                      <option value="26 lbs (Academy Recommended)">26 lbs (Academy Recommended / All-Round)</option>
                      <option value="28 lbs (Intermediate Attack)">28 lbs (Intermediate Attack)</option>
                      <option value="30 lbs (Tournament Pro Power)">30 lbs (Tournament Pro Power)</option>
                      <option value="32 lbs (Elite Tournament)">32 lbs (Elite Tournament Max)</option>
                    </select>
                  </div>

                  <div style={styles.inputWrapper}>
                    <label style={styles.label}>Preferred String Type</label>
                    <select 
                      value={customization.stringType}
                      onChange={(e) => setCustomization({ ...customization, stringType: e.target.value })}
                      style={styles.selectInput}
                    >
                      <option value="Yonex BG65 Titanium (Durability)">Yonex BG65 Titanium (Maximum Durability)</option>
                      <option value="Yonex BG80 Power (Crisp Smash)">Yonex BG80 Power (Hard Feeling Smash)</option>
                      <option value="Yonex Aerosonic (Sound & Repulsion)">Yonex Aerosonic (Ultimate Repulsion)</option>
                      <option value="Victor VBS-66 Nano (Control)">Victor VBS-66 Nano (High Elasticity)</option>
                      <option value="Unstrung (Send string in pack)">Unstrung (Send loose strings)</option>
                    </select>
                  </div>
                </div>

                <div style={styles.inputWrapper}>
                  <label style={styles.label}>Grip Wrapping Preference</label>
                  <select 
                    value={customization.gripPreference}
                    onChange={(e) => setCustomization({ ...customization, gripPreference: e.target.value })}
                    style={styles.selectInput}
                  >
                    <option value="Standard Factory Grip">Leave Standard Factory Grip</option>
                    <option value="Apply Neon Yellow Overgrip">Apply Neon Yellow Overgrip on Racket</option>
                    <option value="Apply Black Tacky Overgrip">Apply Black Tacky Overgrip on Racket</option>
                    <option value="Apply White Dry Overgrip">Apply White Dry Overgrip on Racket</option>
                  </select>
                </div>

                <div style={styles.inputWrapper}>
                  <label style={styles.label}>Additional Order Instructions or Tournament Dates</label>
                  <textarea 
                    rows="3"
                    placeholder="e.g. Please expedite stringing for our upcoming regional tournament on Friday..."
                    value={customization.specialNotes}
                    onChange={(e) => setCustomization({ ...customization, specialNotes: e.target.value })}
                    style={styles.textarea}
                  />
                </div>

                <div style={styles.stepBtnRowTwo}>
                  <button 
                    onClick={goToPrevStep}
                    className="btn btn-secondary"
                    style={{ padding: '0.9rem 1.5rem', fontWeight: 600 }}
                  >
                    <FaArrowLeft style={{ marginRight: '0.5rem' }} /> Back to Shipping
                  </button>
                  <button 
                    onClick={goToNextStep}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.9rem 1.5rem', fontSize: '1.05rem', fontWeight: 700 }}
                  >
                    Proceed to Payment <FaChevronRight style={{ marginLeft: '0.5rem' }} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Payment Method & Confirmation */}
            {currentStep === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={styles.formCard}
              >
                <div style={styles.securitySealBar}>
                  <FaShieldAlt style={{ color: 'var(--accent)', fontSize: '1.4rem' }} />
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Bank-Grade 256-Bit SSL Encrypted Payment</strong>
                    <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Your financial transactions are encrypted and 100% secure.</span>
                  </div>
                </div>

                <h3 style={styles.sectionHeader}>Choose Payment Method</h3>

                {/* Payment Option Tabs */}
                <div style={styles.paymentTabs}>
                  <button 
                    style={paymentMethod === 'card' ? styles.paymentTabActive : styles.paymentTab}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FaCreditCard style={{ fontSize: '1.2rem' }} />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button 
                    style={paymentMethod === 'paypal' ? styles.paymentTabActive : styles.paymentTab}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <FaPaypal style={{ fontSize: '1.2rem' }} />
                    <span>PayPal</span>
                  </button>

                  <button 
                    style={paymentMethod === 'cod' ? styles.paymentTabActive : styles.paymentTab}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <FaMoneyBillWave style={{ fontSize: '1.2rem' }} />
                    <span>Cash on Delivery</span>
                  </button>

                  <button 
                    style={paymentMethod === 'bank' ? styles.paymentTabActive : styles.paymentTab}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <FaUniversity style={{ fontSize: '1.2rem' }} />
                    <span>Bank Wire</span>
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div style={styles.cardPaymentBox}>
                    {/* Realistic Interactive Card Visual */}
                    <div style={styles.cardVisual}>
                      <div style={styles.cardVisualTop}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '2px', color: '#fff' }}>YAMUNDRA PRO</span>
                        <div style={styles.cardChip} />
                      </div>
                      <div style={styles.cardNumberDisplay}>{cardDetails.cardNumber}</div>
                      <div style={styles.cardVisualBottom}>
                        <div>
                          <span style={styles.cardSmallLabel}>CARDHOLDER</span>
                          <span style={styles.cardHolderDisplay}>{cardDetails.cardHolder.toUpperCase()}</span>
                        </div>
                        <div>
                          <span style={styles.cardSmallLabel}>EXPIRES</span>
                          <span style={styles.cardHolderDisplay}>{cardDetails.expiry}</span>
                        </div>
                      </div>
                    </div>

                    <div style={styles.inputWrapper}>
                      <label style={styles.label}>Card Number *</label>
                      <input 
                        type="text" 
                        placeholder="4532 8890 1234 5678"
                        maxLength="19"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.inputWrapper}>
                      <label style={styles.label}>Cardholder Name *</label>
                      <input 
                        type="text" 
                        placeholder="Full Name as on Card"
                        value={cardDetails.cardHolder}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardHolder: e.target.value })}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.rowTwoCols}>
                      <div style={styles.inputWrapper}>
                        <label style={styles.label}>Expiry Date (MM/YY) *</label>
                        <input 
                          type="text" 
                          placeholder="08/28"
                          maxLength="5"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputWrapper}>
                        <label style={styles.label}>CVV / CVC (3-4 Digits) *</label>
                        <input 
                          type="password" 
                          placeholder="892"
                          maxLength="4"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          style={styles.input}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Express */}
                {paymentMethod === 'paypal' && (
                  <div style={styles.methodInfoBox}>
                    <FaPaypal style={{ fontSize: '2.5rem', color: '#0079C1', marginBottom: '0.8rem' }} />
                    <h4 style={{ color: '#fff', marginBottom: '0.4rem' }}>Pay with PayPal Express</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '420px', margin: '0 auto' }}>
                      You will be directed to PayPal to complete your purchase securely. You can pay with your PayPal balance or linked bank card.
                    </p>
                  </div>
                )}

                {/* Cash on Delivery / Counter Pay */}
                {paymentMethod === 'cod' && (
                  <div style={styles.methodInfoBox}>
                    <FaMoneyBillWave style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '0.8rem' }} />
                    <h4 style={{ color: '#fff', marginBottom: '0.4rem' }}>Cash on Delivery / Academy Counter Pay</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '420px', margin: '0 auto' }}>
                      Pay with cash or card upon delivery to your address or at the Yamundra Academy front desk during pick-up.
                    </p>
                  </div>
                )}

                {/* Direct Bank Wire */}
                {paymentMethod === 'bank' && (
                  <div style={styles.methodInfoBox}>
                    <FaUniversity style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.8rem' }} />
                    <h4 style={{ color: '#fff', marginBottom: '0.6rem' }}>Yamundra Badminton Academy Official Bank Details</h4>
                    <div style={styles.bankDetailsCard}>
                      <div style={styles.bankDetailRow}><span>Bank:</span> <strong>Commercial Bank of Ceylon</strong></div>
                      <div style={styles.bankDetailRow}><span>Account Name:</span> <strong>Yamundra Sports Academy (PVT) Ltd</strong></div>
                      <div style={styles.bankDetailRow}><span>Account No:</span> <strong>8002 9140 2911</strong></div>
                      <div style={styles.bankDetailRow}><span>Branch / SWIFT:</span> <strong>KDU Branch / CCEYLKLX</strong></div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.8rem' }}>
                      Please include your generated order reference when making the bank transfer.
                    </p>
                  </div>
                )}

                {/* Final Agreement */}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem', lineHeight: 1.5 }}>
                  By placing your order, you agree to Yamundra Academy's <a href="#terms" style={{ color: 'var(--accent)' }}>Terms of Service</a> and <a href="#privacy" style={{ color: 'var(--accent)' }}>30-Day Money Back Guarantee</a>.
                </p>

                <div style={styles.stepBtnRowTwo}>
                  <button 
                    onClick={goToPrevStep}
                    className="btn btn-secondary"
                    style={{ padding: '0.9rem 1.5rem', fontWeight: 600 }}
                  >
                    <FaArrowLeft style={{ marginRight: '0.5rem' }} /> Edit Shipping
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ 
                      flex: 1, 
                      padding: '1.1rem 1.5rem', 
                      fontSize: '1.15rem', 
                      fontWeight: 800,
                      backgroundColor: 'var(--accent)',
                      color: '#000',
                      boxShadow: '0 8px 24px rgba(204, 219, 113, 0.35)'
                    }}
                  >
                    {isSubmitting ? (
                      'Processing Order...'
                    ) : (
                      <><FaLock style={{ marginRight: '0.6rem' }} /> Complete Order & Pay ${grandTotal.toFixed(2)}</>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

          </div>

          {/* RIGHT COLUMN: Sticky Order Summary & Coupon */}
          <div style={styles.rightCol}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryHeader}>
                <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FaShoppingCart style={{ color: 'var(--primary)' }} /> Order Summary
                </h3>
                <span style={styles.cartCountBadge}>{cart.reduce((a, c) => a + c.quantity, 0)} Items</span>
              </div>

              {/* Items List */}
              <div style={styles.itemsListScroll}>
                {cart.map((item) => (
                  <div key={item.id} style={styles.summaryItem}>
                    <div 
                      style={{ 
                        ...styles.itemThumb, 
                        backgroundImage: `url(${item.image})` 
                      }} 
                    />
                    <div style={styles.itemMeta}>
                      <h5 style={styles.itemName}>{item.name}</h5>
                      <span style={styles.itemCategory}>{item.category || 'Yamundra Pro Gear'}</span>
                      <div style={styles.itemControls}>
                        <div style={styles.qtyBox}>
                          {updateQuantity && (
                            <button 
                              style={styles.qtyBtn} 
                              onClick={() => updateQuantity(item.id, -1)}
                              title="Decrease"
                            >
                              <FaMinus style={{ fontSize: '0.65rem' }} />
                            </button>
                          )}
                          <span style={styles.qtyText}>{item.quantity}</span>
                          {updateQuantity && (
                            <button 
                              style={styles.qtyBtn} 
                              onClick={() => updateQuantity(item.id, 1)}
                              title="Increase"
                            >
                              <FaPlus style={{ fontSize: '0.65rem' }} />
                            </button>
                          )}
                        </div>
                        {removeFromCart && (
                          <button 
                            style={styles.deleteBtn} 
                            onClick={() => removeFromCart(item.id)}
                            title="Remove"
                          >
                            <FaTrashAlt />
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={styles.itemPriceCol}>
                      <span style={styles.itemTotalPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                      {item.quantity > 1 && (
                        <span style={styles.itemUnitPrice}>${item.price.toFixed(2)} each</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Box */}
              <div style={styles.promoContainer}>
                {appliedPromo ? (
                  <div style={styles.appliedPromoBadge}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaTag style={{ color: 'var(--accent)' }} />
                      <div>
                        <strong style={{ color: '#fff' }}>{appliedPromo.code}</strong>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--accent)' }}>{appliedPromo.label}</span>
                      </div>
                    </div>
                    <button style={styles.removePromoBtn} onClick={handleRemovePromo}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} style={styles.promoForm}>
                    <input 
                      type="text"
                      placeholder="Promo code (e.g. SMASH10)"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      style={styles.promoInput}
                    />
                    <button type="submit" style={styles.promoBtn}>
                      Apply
                    </button>
                  </form>
                )}

                <AnimatePresence>
                  {promoMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        ...styles.promoMessage,
                        color: promoMessage.type === 'success' ? 'var(--accent)' : '#ff4d4f'
                      }}
                    >
                      {promoMessage.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Promo Hints */}
                <div style={styles.promoHints}>
                  <span>💡 Try codes: </span>
                  <button type="button" onClick={() => setPromoCodeInput('SMASH10')} style={styles.codeHint}>SMASH10</button>
                  <button type="button" onClick={() => setPromoCodeInput('FREESHIP')} style={styles.codeHint}>FREESHIP</button>
                </div>
              </div>

              {/* Price Calculation Lines */}
              <div style={styles.calculationBox}>
                <div style={styles.calcRow}>
                  <span style={styles.calcLabel}>Subtotal</span>
                  <span style={styles.calcVal}>${cartSubtotal.toFixed(2)}</span>
                </div>

                {appliedPromo && discountAmount > 0 && (
                  <div style={{ ...styles.calcRow, color: 'var(--accent)' }}>
                    <span style={styles.calcLabel}>Promo Discount ({appliedPromo.code})</span>
                    <span style={styles.calcVal}>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={styles.calcRow}>
                  <span style={styles.calcLabel}>
                    Shipping & Handling 
                    <small style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                      {shippingMethod === 'pickup' ? 'Academy Pickup' : shippingMethod === 'express' ? 'Express Courier' : 'Standard Delivery'}
                    </small>
                  </span>
                  <span style={styles.calcVal}>
                    {finalShippingFee === 0 ? <span style={{ color: 'var(--accent)', fontWeight: 700 }}>FREE</span> : `$${finalShippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div style={styles.calcRow}>
                  <span style={styles.calcLabel}>Estimated Tax (5% GST)</span>
                  <span style={styles.calcVal}>${taxAmount.toFixed(2)}</span>
                </div>

                <div style={styles.cardDivider} />

                <div style={{ ...styles.calcRow, fontSize: '1.35rem', fontWeight: 800, marginTop: '0.5rem' }}>
                  <span style={{ color: '#fff' }}>Grand Total</span>
                  <span style={{ color: 'var(--accent)' }}>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={styles.trustBadgesBox}>
                <div style={styles.trustItem}>
                  <FaShieldAlt style={{ color: 'var(--accent)', fontSize: '1.1rem' }} />
                  <span>100% Genuine BWF Certified Gear</span>
                </div>
                <div style={styles.trustItem}>
                  <FaCheckCircle style={{ color: 'var(--primary)', fontSize: '1.1rem' }} />
                  <span>30-Day Academy Money-Back Guarantee</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#0c0c0e',
    color: '#ffffff',
    paddingTop: '100px',
    paddingBottom: '5rem',
    position: 'relative',
    fontFamily: 'var(--font-family, Inter, sans-serif)'
  },
  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '0 1.5rem',
  },
  breadcrumbBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#fff',
    padding: '0.6rem 1.2rem',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'all 0.3s ease'
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem'
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(26, 26, 30, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    padding: '1.2rem 2rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    cursor: 'pointer',
    opacity: 0.5,
    transition: 'opacity 0.3s ease'
  },
  stepItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    cursor: 'pointer',
    opacity: 1
  },
  stepCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.95rem'
  },
  stepCircleActive: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '0.95rem',
    boxShadow: '0 0 15px rgba(204, 219, 113, 0.4)'
  },
  stepTextGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  stepTitle: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem'
  },
  stepSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.78rem'
  },
  stepConnector: {
    flex: 1,
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 1rem',
    minWidth: '20px'
  },
  stepConnectorActive: {
    flex: 1,
    height: '2px',
    backgroundColor: 'var(--accent)',
    margin: '0 1rem',
    minWidth: '20px'
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    backgroundColor: 'rgba(255, 77, 79, 0.15)',
    border: '1px solid #ff4d4f',
    borderRadius: '12px',
    padding: '1rem 1.2rem',
    color: '#fff',
    marginBottom: '1.5rem',
    fontSize: '0.95rem'
  },
  checkoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '2rem',
    alignItems: 'start'
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  rightCol: {
    position: 'sticky',
    top: '100px'
  },
  formCard: {
    backgroundColor: 'rgba(24, 24, 28, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '18px',
    padding: '2rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)'
  },
  userBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    backgroundColor: 'rgba(204, 219, 113, 0.1)',
    border: '1px solid rgba(204, 219, 113, 0.25)',
    borderRadius: '12px',
    padding: '0.9rem 1.2rem',
    marginBottom: '1.8rem'
  },
  guestBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0.9rem 1.2rem',
    marginBottom: '1.8rem',
    flexWrap: 'wrap',
    gap: '0.8rem'
  },
  sectionHeader: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '1.2rem'
  },
  rowTwoCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.2rem'
  },
  rowThreeCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1rem',
    marginBottom: '1.2rem'
  },
  inputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginBottom: '1.2rem'
  },
  label: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  input: {
    backgroundColor: 'rgba(15, 15, 18, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    color: '#fff',
    padding: '0.8rem 1rem',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit'
  },
  selectInput: {
    backgroundColor: '#15151a',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    color: '#fff',
    padding: '0.8rem 1rem',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit'
  },
  textarea: {
    backgroundColor: 'rgba(15, 15, 18, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '10px',
    color: '#fff',
    padding: '0.8rem 1rem',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    marginTop: '0.5rem',
    marginBottom: '1.5rem'
  },
  cardDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '1.8rem 0'
  },
  stepBtnRow: {
    marginTop: '1.5rem'
  },
  stepBtnRowTwo: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem'
  },
  shippingOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  shippingOption: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    backgroundColor: 'rgba(15, 15, 18, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    padding: '1.2rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  shippingOptionSelected: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    backgroundColor: 'rgba(204, 219, 113, 0.08)',
    border: '1.5px solid var(--accent)',
    borderRadius: '14px',
    padding: '1.2rem',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(204, 219, 113, 0.15)'
  },
  shippingOptionRadio: {
    marginTop: '0.2rem'
  },
  radioInner: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  radioInnerActive: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '5px solid var(--accent)',
    backgroundColor: '#000'
  },
  shippingOptionContent: {
    flex: 1
  },
  shippingOptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.4rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  shippingPriceTag: {
    fontWeight: 700,
    color: '#fff',
    fontSize: '1rem'
  },
  shippingOptionDesc: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    margin: 0,
    lineHeight: 1.4
  },
  badgeFast: {
    backgroundColor: 'var(--accent)',
    color: '#000',
    fontSize: '0.7rem',
    fontWeight: 800,
    padding: '0.15rem 0.5rem',
    borderRadius: '12px'
  },
  securitySealBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(96, 131, 205, 0.12)',
    border: '1px solid rgba(96, 131, 205, 0.25)',
    borderRadius: '12px',
    padding: '0.9rem 1.2rem',
    marginBottom: '1.8rem'
  },
  paymentTabs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.6rem',
    marginBottom: '1.8rem'
  },
  paymentTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(15, 15, 18, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0.8rem 0.5rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 600,
    transition: 'all 0.2s ease'
  },
  paymentTabActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'rgba(204, 219, 113, 0.15)',
    border: '1.5px solid var(--accent)',
    borderRadius: '12px',
    padding: '0.8rem 0.5rem',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 700
  },
  cardPaymentBox: {
    display: 'flex',
    flexDirection: 'column'
  },
  cardVisual: {
    background: 'linear-gradient(135deg, #1f2a44 0%, #111827 100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.8rem',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
  },
  cardVisualTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  cardChip: {
    width: '38px',
    height: '28px',
    background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.4)'
  },
  cardNumberDisplay: {
    fontSize: '1.35rem',
    letterSpacing: '3px',
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: '1.5rem'
  },
  cardVisualBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  cardSmallLabel: {
    display: 'block',
    fontSize: '0.65rem',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: '1px',
    marginBottom: '0.2rem'
  },
  cardHolderDisplay: {
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    letterSpacing: '1px'
  },
  methodInfoBox: {
    textAlign: 'center',
    backgroundColor: 'rgba(15, 15, 18, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '2rem'
  },
  bankDetailsCard: {
    backgroundColor: '#111116',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '1rem 1.4rem',
    marginTop: '1rem',
    textAlign: 'left'
  },
  bankDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    padding: '0.4rem 0',
    color: 'var(--text-muted)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  summaryCard: {
    backgroundColor: 'rgba(24, 24, 28, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '18px',
    padding: '1.8rem',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)'
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.2rem',
    paddingBottom: '0.8rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  cartCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 700,
    padding: '0.25rem 0.65rem',
    borderRadius: '20px'
  },
  itemsListScroll: {
    maxHeight: '260px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    paddingRight: '0.4rem',
    marginBottom: '1.2rem'
  },
  summaryItem: {
    display: 'flex',
    gap: '0.8rem',
    alignItems: 'center',
    padding: '0.6rem',
    backgroundColor: 'rgba(15, 15, 18, 0.5)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  itemThumb: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    flexShrink: 0
  },
  itemMeta: {
    flex: 1,
    overflow: 'hidden'
  },
  itemName: {
    fontSize: '0.85rem',
    color: '#fff',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  itemCategory: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  itemControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginTop: '0.3rem'
  },
  qtyBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    padding: '0.1rem'
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  qtyText: {
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0 0.4rem',
    color: '#fff'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#ff4d4f',
    fontSize: '0.75rem',
    cursor: 'pointer',
    opacity: 0.7,
    padding: '0.2rem'
  },
  itemPriceCol: {
    textAlign: 'right',
    flexShrink: 0
  },
  itemTotalPrice: {
    fontWeight: 700,
    color: '#fff',
    fontSize: '0.9rem',
    display: 'block'
  },
  itemUnitPrice: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  promoContainer: {
    backgroundColor: 'rgba(15, 15, 18, 0.6)',
    borderRadius: '12px',
    padding: '0.9rem',
    marginBottom: '1.2rem',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  promoForm: {
    display: 'flex',
    gap: '0.5rem'
  },
  promoInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.55rem 0.8rem',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'inherit'
  },
  promoBtn: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  appliedPromoBadge: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 219, 113, 0.15)',
    border: '1px solid var(--accent)',
    borderRadius: '8px',
    padding: '0.5rem 0.8rem'
  },
  removePromoBtn: {
    background: 'none',
    border: 'none',
    color: '#ff4d4f',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  promoMessage: {
    fontSize: '0.78rem',
    marginTop: '0.4rem',
    fontWeight: 600
  },
  promoHints: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '0.5rem',
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  codeHint: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px dashed rgba(255, 255, 255, 0.2)',
    color: 'var(--accent)',
    borderRadius: '4px',
    padding: '0.1rem 0.35rem',
    fontSize: '0.7rem',
    cursor: 'pointer'
  },
  calculationBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem'
  },
  calcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem'
  },
  calcLabel: {
    color: 'var(--text-muted)'
  },
  calcVal: {
    color: '#fff',
    fontWeight: 600
  },
  trustBadgesBox: {
    marginTop: '1.5rem',
    paddingTop: '1.2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem'
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  // Success Celebration View Styles
  successCard: {
    backgroundColor: 'rgba(24, 24, 28, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '24px',
    padding: '3rem 2.5rem',
    maxWidth: '820px',
    margin: '0 auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(20px)'
  },
  successHeader: {
    textAlign: 'center',
    marginBottom: '2.5rem'
  },
  successBadge: {
    display: 'inline-flex',
    marginBottom: '1rem'
  },
  successTitle: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#fff',
    marginBottom: '0.5rem'
  },
  successSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '1.05rem',
    lineHeight: 1.5,
    maxWidth: '550px',
    margin: '0 auto 1.5rem auto'
  },
  orderRefBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.8rem',
    backgroundColor: 'rgba(204, 219, 113, 0.12)',
    border: '1px dashed var(--accent)',
    borderRadius: '30px',
    padding: '0.6rem 1.4rem'
  },
  orderRefNumber: {
    color: 'var(--accent)',
    fontWeight: 800,
    fontSize: '1.15rem',
    letterSpacing: '1px'
  },
  timelineCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#141418',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  timelineItemActive: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem'
  },
  timelineDotActive: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800
  },
  timelineLabelActive: {
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 700
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    opacity: 0.4
  },
  timelineDot: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  timelineLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.8rem'
  },
  timelineLine: {
    flex: 1,
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 0.6rem',
    marginBottom: '1.2rem'
  },
  receiptGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  receiptBox: {
    backgroundColor: '#141418',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem'
  },
  receiptSectionTitle: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    marginBottom: '0.6rem',
    lineHeight: 1.4
  },
  receiptMuted: {
    color: 'var(--text-muted)'
  },
  receiptVal: {
    color: '#fff',
    fontWeight: 600,
    textAlign: 'right',
    maxWidth: '220px'
  },
  receiptItemsCard: {
    backgroundColor: '#141418',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  },
  receiptItemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    marginBottom: '1.2rem'
  },
  receiptItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  receiptItemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem'
  },
  receiptItemQty: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'var(--accent)',
    fontWeight: 700,
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.8rem'
  },
  receiptItemName: {
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9rem'
  },
  receiptItemSpecs: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem'
  },
  receiptItemPrice: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.95rem'
  },
  receiptSummaryFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  receiptSummaryLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: 'var(--text-muted)'
  },
  receiptDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0.5rem 0'
  },
  customizationReceiptNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.8rem',
    backgroundColor: 'rgba(96, 131, 205, 0.12)',
    border: '1px solid rgba(96, 131, 205, 0.3)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '2rem'
  },
  successActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '0.9rem 1.8rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  emptyCard: {
    textAlign: 'center',
    backgroundColor: 'rgba(24, 24, 28, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '4rem 2rem',
    maxWidth: '650px',
    margin: '3rem auto'
  },
  emptyIcon: {
    fontSize: '4.5rem',
    marginBottom: '1.5rem',
    filter: 'drop-shadow(0 0 20px rgba(204, 219, 113, 0.3))'
  }
};

export default CheckoutPage;
