import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FaShoppingCart, FaSearch, FaStar, FaTimes, FaPlus, FaMinus, FaCheck, FaFilter, FaArrowRight, FaEye, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import smashImg from '../assets/badminton_smash.jpg';
import playerImg from '../assets/badminton_player.jpg';
import courtImg from '../assets/badminton_court.jpg';
import fitnessImg from '../assets/badminton_fitness.jpg';
import juniorsImg from '../assets/badminton_juniors.jpg';
import actionImg from '../assets/badminton_action.jpg';
import logoImg from '../assets/logo.png';

const productsData = [
  {
    id: 1,
    name: 'Yamundra Pro Smash 9000 Racket',
    category: 'Rackets',
    price: 219.99,
    originalPrice: 259.99,
    rating: 4.9,
    reviews: 128,
    image: smashImg,
    badge: 'BEST SELLER',
    specs: {
      weight: '3U (88g)',
      balance: 'Head-Heavy',
      flex: 'Stiff',
      tension: '28-32 lbs',
      material: 'High Modulus Graphite + Nano-Carbon'
    },
    description: 'Engineered for relentless offensive players. The Pro Smash 9000 utilizes aero-dynamic frame channeling to deliver devastating smash velocities while maintaining crisp net-play control.'
  },
  {
    id: 2,
    name: 'Aero-Lightning Carbon X Racket',
    category: 'Rackets',
    price: 189.99,
    originalPrice: 210.00,
    rating: 4.8,
    reviews: 94,
    image: actionImg,
    badge: 'NEW ARRIVAL',
    specs: {
      weight: '4U (83g)',
      balance: 'Even-Balance',
      flex: 'Medium-Stiff',
      tension: '24-28 lbs',
      material: 'Ultra-Light Carbon Fiber'
    },
    description: 'Designed for rapid doubles exchanges and lightning-fast defense. Offers unmatched maneuverability and vibration dampening for prolonged tournament play.'
  },
  {
    id: 3,
    name: 'AeroGold Goose Feather Shuttles (Tube of 12)',
    category: 'Shuttles',
    price: 36.50,
    originalPrice: 42.00,
    rating: 5.0,
    reviews: 310,
    image: logoImg,
    badge: 'BWF APPROVED',
    specs: {
      speed: '77 / 78 (Medium Fast)',
      feather: 'Selected A-Grade Goose Feather',
      cork: '100% Natural Composite Portuguese Cork',
      durability: 'Championship Grade'
    },
    description: 'The official tournament shuttlecock of Yamundra Academy. Precision-tested for accurate flight trajectory, consistent rotation speed, and exceptional durability under heavy smashing.'
  },
  {
    id: 4,
    name: 'BWF Pro Grip Court Shoes',
    category: 'Footwear',
    price: 145.00,
    originalPrice: 170.00,
    rating: 4.9,
    reviews: 86,
    image: fitnessImg,
    badge: 'PRO CHOICE',
    specs: {
      sole: 'Non-Marking Natural Gum Rubber',
      cushioning: 'Power-Bounce Hex Gel',
      upper: 'Breathable Mesh + TPU Lateral Support',
      weight: '295g (Per Shoe)'
    },
    description: 'Maximized grip on synthetic indoor courts with anti-torsion carbon shank. Prevents ankle rolls during aggressive lunges and rapid directional changes.'
  },
  {
    id: 5,
    name: 'Yamundra Tournament Jersey (Red/Purple)',
    category: 'Apparel',
    price: 49.99,
    originalPrice: 65.00,
    rating: 4.7,
    reviews: 64,
    image: playerImg,
    badge: 'LIMITED EDITION',
    specs: {
      fabric: '100% Micro-Dry Polyester',
      fit: 'Athletic Ergonomic Cut',
      tech: 'Moisture-Wicking + UV Protection',
      care: 'Machine Wash Cold'
    },
    description: 'Worn by our academy champions on the national circuit. Engineered for zero restriction during overhead clears and jump smashes with rapid sweat evaporation.'
  },
  {
    id: 6,
    name: 'Pro Tour 6-Racket Thermo Bag',
    category: 'Accessories',
    price: 89.99,
    originalPrice: 110.00,
    rating: 4.8,
    reviews: 52,
    image: courtImg,
    badge: 'POPULAR',
    specs: {
      capacity: 'Up to 6 Rackets + Dedicated Shoe Compartment',
      lining: 'Thermal Foil Foil-Guard (Protects String Tension)',
      straps: 'Padded Dual Backpack Straps',
      pockets: 'Wet/Dry Separation + Accessories Zip'
    },
    description: 'Carry all your tournament gear in style. Features climate-controlled thermal lining to protect delicate string tensions from extreme temperature and humidity changes.'
  },
  {
    id: 7,
    name: 'Ultra-Tack Overgrip 3-Pack',
    category: 'Accessories',
    price: 12.99,
    originalPrice: 16.00,
    rating: 4.9,
    reviews: 420,
    image: smashImg,
    badge: 'ESSENTIAL',
    specs: {
      thickness: '0.6mm',
      feel: 'High-Tack Absorbent Polyurethane',
      length: '1100mm',
      colors: 'Neon Yellow, White, Black'
    },
    description: 'Maximum sweat absorption and tackiness for slip-free racket control in intense third-set tiebreakers. Trusted by academy coaches and players.'
  },
  {
    id: 8,
    name: 'Junior Squad Development Kit',
    category: 'Training',
    price: 115.00,
    originalPrice: 140.00,
    rating: 4.9,
    reviews: 73,
    image: juniorsImg,
    badge: 'YOUTH VALUE',
    specs: {
      contents: '1 Junior Graphite Racket (4U), 1 Tube Training Shuttles, Academy T-Shirt, Gym Sack',
      ageGroup: '8 - 14 Years',
      racketLength: '660mm (Optimized for Juniors)'
    },
    description: 'The complete starter kit for aspiring young champions entering our Junior Academy. Everything needed to start training with proper technique and confidence.'
  },
  {
    id: 9,
    name: 'Agility Ladder & Footwork Cone Set',
    category: 'Training',
    price: 45.00,
    originalPrice: 55.00,
    rating: 4.6,
    reviews: 38,
    image: fitnessImg,
    badge: 'FITNESS',
    specs: {
      ladder: '6-Meter Adjustable Rung Agility Ladder',
      cones: '20 Flexible Multi-Color Field Cones',
      bag: 'Includes Mesh Carry Bag + Workout Guide'
    },
    description: 'Badminton is 70% footwork. Use the exact drills practiced by our elite squad to boost explosive speed, split-step timing, and court recovery agility.'
  }
];

const categories = ['All', 'Rackets', 'Shuttles', 'Footwear', 'Apparel', 'Accessories', 'Training'];

const ShopPage = ({ 
  user, 
  onLoginClick, 
  onNavigate,
  cart: externalCart,
  setCart: externalSetCart,
  addToCart: externalAddToCart,
  updateQuantity: externalUpdateQuantity,
  removeFromCart: externalRemoveFromCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [localCart, setLocalCart] = useState([]);
  const cart = externalCart !== undefined ? externalCart : localCart;
  const setCart = externalSetCart || setLocalCart;
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'success'
  const [notification, setNotification] = useState(null); // { text, type: 'success' | 'error' | 'warning' } | string
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [confirmedOrderRef, setConfirmedOrderRef] = useState('');

  const headerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"]
  });
  const headerY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Toast notification helper
  const showToast = (message, type = 'success') => {
    setNotification({ text: message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return productsData.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured default order
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Cart helper functions
  const addToCart = (product, qty = 1) => {
    if (externalAddToCart) {
      externalAddToCart(product, qty);
    } else {
      setCart(prevCart => {
        const existing = prevCart.find(item => item.id === product.id);
        if (existing) {
          return prevCart.map(item => 
            item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
          );
        }
        return [...prevCart, { ...product, quantity: qty }];
      });
      showToast(`${qty}x ${product.name} added to cart!`, 'success');
    }
  };

  const updateQuantity = (id, delta) => {
    if (externalUpdateQuantity) {
      externalUpdateQuantity(id, delta);
    } else {
      setCart(prevCart => {
        return prevCart.map(item => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        }).filter(Boolean);
      });
    }
  };

  const removeFromCart = (id) => {
    if (externalRemoveFromCart) {
      externalRemoveFromCart(id);
    } else {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    }
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = cartSubtotal > 100 || cartSubtotal === 0 ? 0 : 12.00;
  const totalAmount = cartSubtotal + shippingFee;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // If navigation is provided, navigate directly to dedicated Checkout Page
    if (onNavigate) {
      setIsCartOpen(false);
      onNavigate('checkout');
      return;
    }

    // Fallback for standalone mode: Check if user is logged in
    if (!user) {
      showToast('Please log in or register to place your order.', 'error');
      if (onLoginClick) {
        onLoginClick();
      }
      return;
    }

    setIsSubmittingOrder(true);
    const orderRef = `#YAM-${Math.floor(100000 + Math.random() * 900000)}`;
    setConfirmedOrderRef(orderRef);
    const today = new Date().toISOString().split('T')[0];

    try {
      // Record purchases in backend database for the logged-in user
      await Promise.all(
        cart.map(item =>
          fetch('http://localhost:5000/api/shop/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: user.username,
              product_id: item.id,
              product_name: item.name,
              quantity: item.quantity,
              price: item.price,
              purchase_date: today
            })
          })
        )
      );
    } catch (err) {
      console.error('Error saving order to backend:', err);
    } finally {
      setIsSubmittingOrder(false);
      setCheckoutStep('success');
    }
  };

  const resetCartAfterCheckout = () => {
    setCart([]);
    setCheckoutStep('cart');
    setIsCartOpen(false);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Floating Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              ...styles.toast,
              border: (typeof notification === 'object' && notification.type === 'error') 
                ? '1px solid #ff4d4f' 
                : '1px solid var(--accent)',
              backgroundColor: (typeof notification === 'object' && notification.type === 'error')
                ? 'rgba(40, 15, 15, 0.95)'
                : 'rgba(25, 25, 25, 0.95)'
            }}
          >
            {typeof notification === 'object' && notification.type === 'error' ? (
              <FaExclamationTriangle style={{ color: '#ff4d4f', fontSize: '1.2rem' }} />
            ) : (
              <FaCheck style={{ color: 'var(--accent)', fontSize: '1.2rem' }} />
            )}
            <span>{typeof notification === 'string' ? notification : notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parallax Hero Banner */}
      <div ref={headerRef} style={styles.heroSection}>
        <motion.div 
          style={{ ...styles.heroBg, backgroundImage: `url(${smashImg})`, y: headerY }} 
        />
        <div style={styles.heroOverlay} />
        <motion.div style={{ ...styles.heroContent, opacity: headerOpacity }}>
          <span style={styles.heroTagline}>ACADEMY PRO SHOP</span>
          <h1 style={styles.heroTitle}>Equipment for Champions</h1>
          <p style={styles.heroSubtitle}>
            BWF-certified rackets, competition shuttles, and ergonomic apparel tested and trusted by our elite tournament squad.
          </p>

          {/* Search Bar in Hero */}
          <div style={styles.searchContainer}>
            <FaSearch style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search rackets, shuttles, shoes, or apparel..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <FaTimes />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Main Shop Catalog Container */}
      <div style={styles.container}>
        {/* Filter Tabs & Sorting Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.categoryTabs}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  ...styles.categoryTab,
                  backgroundColor: selectedCategory === category ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedCategory === category ? '#ffffff' : 'var(--text-muted)',
                  borderColor: selectedCategory === category ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div style={styles.sortContainer}>
            <FaFilter style={{ color: 'var(--text-muted)' }} />
            <span style={styles.sortLabel}>Sort By:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              style={styles.sortSelect}
            >
              <option value="featured">Featured Champions Gear</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div style={styles.grid} layout>
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                  style={styles.productCard}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div style={styles.imageContainer}>
                    <div 
                      style={{ ...styles.productImage, backgroundImage: `url(${product.image})` }} 
                    />
                    <div style={styles.imageOverlay} />
                    <span style={styles.badge}>{product.badge}</span>
                    <button 
                      style={styles.quickViewBtn}
                      onClick={() => setQuickViewProduct(product)}
                      title="Quick View Specs"
                    >
                      <FaEye /> Quick View
                    </button>
                  </div>

                  <div style={styles.productInfo}>
                    <span style={styles.productCategory}>{product.category}</span>
                    <h3 style={styles.productName}>{product.name}</h3>
                    
                    <div style={styles.ratingRow}>
                      <div style={styles.stars}>
                        <FaStar style={{ color: 'var(--accent)' }} />
                        <span style={styles.ratingVal}>{product.rating.toFixed(1)}</span>
                      </div>
                      <span style={styles.reviewsCount}>({product.reviews} reviews)</span>
                    </div>

                    <div style={styles.priceRow}>
                      <div>
                        <span style={styles.price}>${product.price.toFixed(2)}</span>
                        {product.originalPrice > product.price && (
                          <span style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                        style={styles.addToCartBtn}
                        onClick={() => addToCart(product, 1)}
                      >
                        + Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div style={styles.noResults}>
            <div style={styles.noResultsIcon}>🏸</div>
            <h3>No Equipment Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>We couldn't find any items matching "{searchQuery}" in category "{selectedCategory}".</p>
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} 
              className="btn btn-primary" 
              style={{ marginTop: '1.5rem' }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Shopping Cart Trigger Button */}
      <motion.button
        style={styles.floatingCartBtn}
        onClick={() => setIsCartOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        title="View Shopping Cart"
      >
        <FaShoppingCart />
        {cartTotalCount > 0 && (
          <motion.span 
            key={cartTotalCount}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            style={styles.cartBadge}
          >
            {cartTotalCount}
          </motion.span>
        )}
      </motion.button>

      {/* Slide-out Shopping Cart Drawer Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div style={styles.drawerBackdrop} onClick={() => setIsCartOpen(false)}>
            <motion.div
              style={styles.cartDrawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.drawerHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FaShoppingCart style={{ color: 'var(--primary)', fontSize: '1.4rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>Your Pro Shop Bag</h3>
                  <span style={styles.cartCountTag}>{cartTotalCount} items</span>
                </div>
                <button style={styles.closeBtn} onClick={() => setIsCartOpen(false)}>
                  <FaTimes />
                </button>
              </div>

              <div style={styles.drawerDivider} />

              {checkoutStep === 'cart' ? (
                <>
                  <div style={styles.cartItemsList}>
                    {cart.length === 0 ? (
                      <div style={styles.emptyCart}>
                        <div style={{ fontSize: '3.5rem', opacity: 0.4, marginBottom: '1rem' }}>🛍️</div>
                        <h4>Your Bag is Empty</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                          Explore our BWF-approved rackets, footwear, and apparel to get tournament ready!
                        </p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <motion.div key={item.id} layout style={styles.cartItem}>
                          <div 
                            style={{ ...styles.cartItemImage, backgroundImage: `url(${item.image})` }} 
                          />
                          <div style={styles.cartItemDetails}>
                            <h5 style={styles.cartItemName}>{item.name}</h5>
                            <span style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                            
                            <div style={styles.quantityControls}>
                              <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, -1)}>
                                <FaMinus style={{ fontSize: '0.7rem' }} />
                              </button>
                              <span style={styles.qtyNumber}>{item.quantity}</span>
                              <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, 1)}>
                                <FaPlus style={{ fontSize: '0.7rem' }} />
                              </button>
                            </div>
                          </div>
                          <button 
                            style={styles.removeBtn} 
                            onClick={() => removeFromCart(item.id)}
                            title="Remove Item"
                          >
                            <FaTimes />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div style={styles.drawerFooter}>
                      <div style={styles.summaryRow}>
                        <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                        <span style={{ fontWeight: 600 }}>${cartSubtotal.toFixed(2)}</span>
                      </div>
                      <div style={styles.summaryRow}>
                        <span style={{ color: 'var(--text-muted)' }}>Insured Express Shipping</span>
                        <span style={{ fontWeight: 600 }}>
                          {shippingFee === 0 ? <span style={{ color: 'var(--accent)' }}>FREE (Orders &gt; $100)</span> : `$${shippingFee.toFixed(2)}`}
                        </span>
                      </div>
                      <div style={styles.drawerDivider} />
                      <div style={{ ...styles.summaryRow, fontSize: '1.25rem', fontWeight: 800 }}>
                        <span style={{ color: '#fff' }}>Total</span>
                        <span style={{ color: 'var(--primary)' }}>${totalAmount.toFixed(2)}</span>
                      </div>

                      {/* User Authentication Status Banner */}
                      {user ? (
                        <div style={styles.authStatusBadge}>
                          <FaCheckCircle style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <span>Ordering as <strong style={{ color: '#fff' }}>{user.username}</strong></span>
                        </div>
                      ) : (
                        <div style={styles.authWarningBadge}>
                          <FaLock style={{ color: '#ffd700', flexShrink: 0 }} />
                          <span>Log in required to complete checkout</span>
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={styles.checkoutBtn}
                        onClick={handleCheckout}
                        disabled={isSubmittingOrder}
                      >
                        {isSubmittingOrder ? (
                          'Placing Order...'
                        ) : (
                          <>Proceed to Secure Checkout <FaArrowRight /></>
                        )}
                      </motion.button>
                    </div>
                  )}
                </>
              ) : (
                /* Celebration Success Checkout Step */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={styles.successContainer}
                >
                  <div style={styles.successIcon}>🎉</div>
                  <h3 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>Order Confirmed!</h3>
                  <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '1.5rem' }}>
                    Thank you{user?.firstName ? `, ${user.firstName}` : user?.username ? `, ${user.username}` : ''}! Your order has been placed.
                  </p>
                  <div style={styles.receiptCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Order Reference:</span>
                      <strong style={{ color: '#fff' }}>{confirmedOrderRef || `#YAM-${Math.floor(100000 + Math.random() * 900000)}`}</strong>
                    </div>
                    {user?.username && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Customer Account:</span>
                        <strong style={{ color: '#fff' }}>{user.username}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Total Paid:</span>
                      <strong style={{ color: 'var(--primary)' }}>${totalAmount.toFixed(2)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Estimated Delivery:</span>
                      <strong style={{ color: '#fff' }}>2-3 Business Days</strong>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                    A confirmation email with stringing recommendations and tracking details will be sent to <strong style={{ color: '#fff' }}>{user?.email || 'your registered email'}</strong>.
                  </p>
                  <button onClick={resetCartAfterCheckout} className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                    Continue Shopping
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div style={styles.modalBackdrop} onClick={() => setQuickViewProduct(null)}>
            <motion.div
              style={styles.quickViewModal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={styles.modalCloseBtn} onClick={() => setQuickViewProduct(null)}>
                <FaTimes />
              </button>

              <div style={styles.modalGrid}>
                <div style={styles.modalImageSide}>
                  <div 
                    style={{ ...styles.modalImage, backgroundImage: `url(${quickViewProduct.image})` }} 
                  />
                  <span style={styles.modalBadge}>{quickViewProduct.badge}</span>
                </div>

                <div style={styles.modalDetailsSide}>
                  <span style={styles.productCategory}>{quickViewProduct.category}</span>
                  <h2 style={styles.modalTitle}>{quickViewProduct.name}</h2>

                  <div style={{ ...styles.ratingRow, marginBottom: '1rem' }}>
                    <div style={styles.stars}>
                      <FaStar style={{ color: 'var(--accent)' }} />
                      <span style={styles.ratingVal}>{quickViewProduct.rating.toFixed(1)}</span>
                    </div>
                    <span style={styles.reviewsCount}>({quickViewProduct.reviews} Verified Academy Reviews)</span>
                  </div>

                  <div style={{ ...styles.priceRow, justifyContent: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                    <span style={{ ...styles.price, fontSize: '1.8rem' }}>${quickViewProduct.price.toFixed(2)}</span>
                    {quickViewProduct.originalPrice > quickViewProduct.price && (
                      <span style={{ ...styles.originalPrice, fontSize: '1.2rem' }}>${quickViewProduct.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  <p style={styles.modalDescription}>{quickViewProduct.description}</p>

                  <h4 style={styles.specsHeader}>Technical Specifications</h4>
                  <div style={styles.specsGrid}>
                    {Object.entries(quickViewProduct.specs).map(([key, val]) => (
                      <div key={key} style={styles.specItem}>
                        <span style={styles.specKey}>{key.toUpperCase()}:</span>
                        <span style={styles.specVal}>{val}</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.modalActions}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{ ...styles.addToCartBtn, padding: '1rem 2.5rem', fontSize: '1.05rem', flex: 1 }}
                      onClick={() => {
                        addToCart(quickViewProduct, 1);
                        setQuickViewProduct(null);
                      }}
                    >
                      <FaShoppingCart style={{ marginRight: '0.5rem' }} /> Add to Pro Bag
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  pageWrapper: {
    paddingTop: '80px', // for fixed navbar
    minHeight: '100vh',
    backgroundColor: 'transparent',
    color: 'var(--text-main)',
    position: 'relative',
  },
  toast: {
    position: 'fixed',
    top: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(25, 25, 25, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--accent)',
    padding: '0.9rem 1.8rem',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
    zIndex: 1000,
    color: '#fff',
    fontWeight: 600,
  },
  heroSection: {
    position: 'relative',
    height: '420px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden',
    padding: '0 5%',
  },
  heroBg: {
    position: 'absolute',
    top: '-20%',
    left: 0,
    width: '100%',
    height: '150%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.35) contrast(1.1)',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(18,18,18,0.4) 0%, rgba(18,18,18,0.95) 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '850px',
    width: '100%',
  },
  heroTagline: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
    display: 'block',
  },
  heroTitle: {
    fontSize: '3.4rem',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '1rem',
    lineHeight: 1.15,
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 1.6,
    marginBottom: '2.5rem',
    maxWidth: '650px',
    margin: '0 auto 2.5rem auto',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '50px',
    padding: '0.6rem 1.5rem',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 15px 35px rgba(0,0,0,0.4)',
  },
  searchIcon: {
    color: 'var(--text-muted)',
    fontSize: '1.2rem',
    marginRight: '1rem',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1rem',
    width: '100%',
    outline: 'none',
  },
  clearSearchBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '4rem 5% 8rem 5%',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '3.5rem',
    padding: '1.2rem 1.5rem',
    backgroundColor: 'rgba(25, 25, 25, 0.6)',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  categoryTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
  },
  categoryTab: {
    padding: '0.55rem 1.3rem',
    borderRadius: '30px',
    border: '1px solid',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  sortLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  sortSelect: {
    backgroundColor: 'rgba(35, 35, 35, 0.9)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2.5rem',
  },
  productCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    backdropFilter: 'blur(14px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  imageContainer: {
    position: 'relative',
    height: '240px',
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'transform 0.5s ease',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, rgba(20,20,20,0.8) 0%, transparent 50%)',
  },
  badge: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    padding: '0.35rem 0.85rem',
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    backdropFilter: 'blur(8px)',
    borderRadius: '20px',
    color: 'var(--accent)',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '1px',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  quickViewBtn: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
  },
  productInfo: {
    padding: '1.8rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  productCategory: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: 'var(--primary)',
    fontWeight: '700',
    marginBottom: '0.4rem',
  },
  productName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.8rem',
    lineHeight: 1.4,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '1.5rem',
  },
  stars: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  ratingVal: {
    fontWeight: '700',
    fontSize: '0.95rem',
    color: '#fff',
  },
  reviewsCount: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#fff',
  },
  originalPrice: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    textDecoration: 'line-through',
    marginLeft: '0.6rem',
  },
  addToCartBtn: {
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '0.65rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(96, 131, 205, 0.4)',
    transition: 'all 0.2s ease',
  },
  noResults: {
    textAlign: 'center',
    padding: '5rem 2rem',
    backgroundColor: 'rgba(30, 30, 30, 0.3)',
    borderRadius: '24px',
    border: '1px dashed rgba(255,255,255,0.1)',
  },
  noResultsIcon: {
    fontSize: '4.5rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  floatingCartBtn: {
    position: 'fixed',
    bottom: '40px',
    right: '40px',
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 10px 30px rgba(96, 131, 205, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    cursor: 'pointer',
    zIndex: 50,
  },
  cartBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'var(--accent)',
    color: '#000',
    fontWeight: '800',
    fontSize: '0.85rem',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--bg-dark)',
  },
  drawerBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(5px)',
    zIndex: 999,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cartDrawer: {
    width: '100%',
    maxWidth: '460px',
    height: '100%',
    backgroundColor: 'rgba(22, 22, 22, 0.98)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.7)',
    padding: '2rem',
    overflowY: 'auto',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartCountTag: {
    fontSize: '0.8rem',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    color: 'var(--text-muted)',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '1.4rem',
    cursor: 'pointer',
  },
  drawerDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '1.5rem 0',
  },
  cartItemsList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '4rem 1rem',
    margin: 'auto 0',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem',
    backgroundColor: 'rgba(35, 35, 35, 0.5)',
    padding: '1rem',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.06)',
    position: 'relative',
  },
  cartItemImage: {
    width: '75px',
    height: '75px',
    borderRadius: '12px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    flexShrink: 0,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.4rem',
    paddingRight: '1.5rem',
  },
  cartItemPrice: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--accent)',
    display: 'block',
    marginBottom: '0.6rem',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: 'fit-content',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
  },
  qtyBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNumber: {
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  removeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    border: 'none',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  drawerFooter: {
    paddingTop: '1rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.8rem',
    fontSize: '1rem',
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '1.1rem',
    borderRadius: '16px',
    fontWeight: '700',
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    boxShadow: '0 10px 25px rgba(96, 131, 205, 0.5)',
  },
  loginCheckoutBtn: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 215, 0, 0.4)',
    color: '#ffd700',
    padding: '1.1rem',
    borderRadius: '16px',
    fontWeight: '700',
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.2s ease',
  },
  authStatusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: 'rgba(204, 219, 113, 0.12)',
    border: '1px solid rgba(204, 219, 113, 0.3)',
    borderRadius: '12px',
    padding: '0.6rem 0.9rem',
    marginBottom: '1rem',
    fontSize: '0.88rem',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  authWarningBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '12px',
    padding: '0.6rem 0.9rem',
    marginBottom: '1rem',
    fontSize: '0.88rem',
    color: '#ffd700',
  },
  successContainer: {
    textAlign: 'center',
    padding: '3rem 1rem',
    margin: 'auto 0',
  },
  successIcon: {
    fontSize: '5rem',
    marginBottom: '1rem',
  },
  receiptCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    padding: '1.5rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'left',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  quickViewModal: {
    backgroundColor: 'rgba(25, 25, 25, 0.98)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '24px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
    padding: '2.5rem',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: '#fff',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    cursor: 'pointer',
    zIndex: 5,
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '3rem',
  },
  modalImageSide: {
    position: 'relative',
    height: '380px',
    borderRadius: '20px',
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  modalBadge: {
    position: 'absolute',
    top: '1.2rem',
    left: '1.2rem',
    padding: '0.4rem 1rem',
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(8px)',
    borderRadius: '20px',
    color: 'var(--accent)',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '1px',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  modalDetailsSide: {
    display: 'flex',
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '0.5rem',
    lineHeight: 1.25,
  },
  modalDescription: {
    fontSize: '1.05rem',
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    marginBottom: '2rem',
  },
  specsHeader: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '0.5rem',
  },
  specsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginBottom: '2.5rem',
  },
  specItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
  },
  specKey: {
    color: 'var(--text-muted)',
    fontWeight: 600,
  },
  specVal: {
    color: '#fff',
    fontWeight: 500,
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: 'auto',
  }
};

export { productsData };
export default ShopPage;
