import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { useDineFlow } from '../useDineFlowStore';
import { foodItems, categories, translations } from '../data';
import { FoodItem, CartItem } from '../types';
import { 
  Search, ShoppingBag, Leaf, Star, Clock, ArrowLeft, 
  Minus, Plus, Check, MapPin, MessageSquare, Send, 
  Sparkles, CheckCircle2, RotateCcw, AlertCircle, X, HelpCircle,
  Globe
} from 'lucide-react';
import { sound } from './SoundUtility';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomerApp() {
  const {
    language,
    toggleLanguage,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    orders,
    placeNewOrder,
    currentActiveOrderId,
    setCurrentActiveOrderId,
    aiRecommendation,
    isGeneratingAi,
    generateAiRecommendation,
    waitingTimePredict
  } = useDineFlow();

  const t = translations[language];

  // UI state keys
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItemForCustom, setSelectedItemForCustom] = useState<FoodItem | null>(null);
  
  // Customization selection state
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [spiceLevel, setSpiceLevel] = useState<'Mild' | 'Medium' | 'Hot'>('Medium');
  const [itemNotes, setItemNotes] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Checkout form modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutName, setCheckoutName] = useState('Vishwa');
  const [checkoutPhone, setCheckoutPhone] = useState('+91 94821 57204');
  const [orderType, setOrderType] = useState<'Delivery' | 'Table'>('Delivery');
  const [tableNumber, setTableNumber] = useState('3');
  const [deliveryAddress, setDeliveryAddress] = useState('No.14, Gandhinagar Main Road, Adyar, Chennai');

  // Chat message composition state
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI mood selection triggers
  const [aiMood, setAiMood] = useState('');
  const moodPresets = language === 'en' 
    ? ['Spicy & Rich', 'Light Heathy Breakfast', 'Hot Premium Coffee', 'Chilled Desert Treat']
    : ['காரம் & பிரியாணி', 'ஆரோக்கிய காலை உணவு', 'சூடான காபி', 'குளிர்ச்சியான இனிப்பு'];

  // Feedback/Rating state
  const [orderRated, setOrderRated] = useState(false);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Find active order
  const activeOrder = orders.find(o => o.id === currentActiveOrderId);

  // Scroll active chat automatic
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeOrder?.riderChat]);

  // Filter food items
  const filteredFood = foodItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.nameTa.includes(searchQuery) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenCustom = (food: FoodItem) => {
    setSelectedItemForCustom(food);
    setQuantity(1);
    setSelectedExtras([]);
    setSpiceLevel('Medium');
    setItemNotes('');
  };

  const toggleExtra = (extraName: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraName) 
        ? prev.filter(e => e !== extraName) 
        : [...prev, extraName]
    );
  };

  const handleAddToCart = () => {
    if (!selectedItemForCustom) return;
    
    addToCart({
      foodItem: selectedItemForCustom,
      quantity,
      selectedExtras,
      spicySelection: spiceLevel,
      notes: itemNotes
    });

    setSelectedItemForCustom(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Submit actual order
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    placeNewOrder(
      checkoutName,
      checkoutPhone,
      orderType,
      orderType === 'Table' ? tableNumber : undefined,
      orderType === 'Delivery' ? deliveryAddress : undefined
    );
    setShowCheckoutModal(false);
  };

  // Calculate cart pricing totals
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemExtraCost = item.selectedExtras.reduce((s, exName) => {
      const eObj = item.foodItem.extras?.find(e => e.name === exName);
      return s + (eObj?.price || 0);
    }, 0);
    return sum + (item.foodItem.price + itemExtraCost) * item.quantity;
  }, 0);

  const cartTaxes = parseFloat((cartSubtotal * 0.05).toFixed(2));
  const deliveryCharges = orderType === 'Delivery' ? 30 : 0;
  const cartGrandTotal = cartSubtotal + cartTaxes + deliveryCharges;

  // Submit Feedback
  const handleRatingSubmit = (orderId: string) => {
    setOrderRated(true);
    // Submit review mock action
    setTimeout(() => {
      setOrderRated(false);
      setReviewText('');
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeOrder) return;
    const { addRiderMessage } = useDineFlow(); // Direct state update
    // Call the central state chat update directly
    addRiderMessage(activeOrder.id, chatInput, 'customer');
    setChatInput('');

    // Simulated Rider reply
    setTimeout(() => {
      const responsesTa = [
        "நிச்சயமாக, நான் உங்கள் தகவலைச் சமையலறையில் தெரிவித்து விட்டேன்! 🛵",
        "நான் கடைக்கு வந்துவிட்டேன், உங்கள் சூடான பிரியாணியை பேக் செய்து கொண்டிருக்கிறார்கள்.",
        "கவலைப்படாதீர்கள், உங்கள் உணவை மிகப்பத்திரமாகச் சுடச்சுட எடுத்து வருகிறேன் அண்ணா! ⚡",
        "நான் உங்கள் தெரு முனையில் வந்துவிட்டேன், 2 நிமிடங்களில் இதோ வந்துவிடுவேன்."
      ];
      const responsesEn = [
        "Got it! Instructed the kitchen accordingly. 👍",
        "Just arrived at the DineFlow branch. They are preparing your hot order now.",
        "Don't worry, safe thermal bag is active here. Kept it warm for you! 🛵",
        "I am turning onto your main street now. Watch out for a blue pulsar!"
      ];
      const selection = language === 'ta' ? responsesTa : responsesEn;
      const randomText = selection[Math.floor(Math.random() * selection.length)];
      addRiderMessage(activeOrder.id, randomText, 'rider');
    }, 2000);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white text-slate-900 rounded-[40px] border-8 border-slate-200 shadow-xl overflow-hidden relative" style={{ height: '780px' }}>
      
      {/* Phone Notch/Status Bar */}
      <div className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 py-1.5 px-6 flex justify-between items-center z-20">
        <span className="font-mono font-medium">08:16</span>
        <div className="w-16 h-4 bg-slate-200 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
          <span className="text-[9px] font-mono tracking-wider font-semibold text-slate-700">DINEFLOW</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] bg-slate-200 px-1 text-slate-600 font-semibold rounded">5G</span>
          <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex">
            <div className="w-full bg-slate-600 rounded-xs"></div>
          </div>
        </div>
      </div>

      {/* Main Internal Layout */}
      <div className="flex flex-col h-[740px] bg-[#F8FAFC] overflow-y-auto relative custom-scrollbar pb-16">
        
        {/* Navigation & Brand Header */}
        <header className="p-4 bg-white border-b border-slate-100 sticky top-0 z-10 flex justify-between items-center shadow-xs">
          <div>
            <h1 className="text-xl font-sans font-bold tracking-tight text-slate-900 flex items-center gap-1">
              DineFlow <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full lowercase font-bold">beta</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-semibold font-mono tracking-tight">{t.appSlogan}</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-orange-600 rounded font-bold text-xs flex items-center space-x-1 border border-slate-200 transition shadow-xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Warning Notification if any active orders */}
        {activeOrder && (
          <div 
            onClick={() => setCurrentActiveOrderId(activeOrder.id)}
            className="bg-orange-50 hover:bg-orange-100/50 border-b border-orange-100 px-4 py-2 flex items-center justify-between cursor-pointer text-xs"
          >
            <div className="flex items-center space-x-2 text-orange-600 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span>{t.activeOrder}: <span className="font-mono text-slate-800">{activeOrder.id}</span> ({language === 'ta' ? activeOrder.status === 'Pending' ? t.statusPending : activeOrder.status === 'Preparing' ? t.statusPreparing : activeOrder.status === 'Ready' ? t.statusReady : t.statusDelivered : activeOrder.status})</span>
            </div>
            <span className="text-[10px] underline text-slate-500 font-bold">{t.trackOrder} →</span>
          </div>
        )}

        {/* Page Switcher or App Area */}
        {currentActiveOrderId && activeOrder ? (
          
          /* VIEW 1: Active Order live tracking */
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <button 
                onClick={() => setCurrentActiveOrderId(null)}
                className="text-orange-600 flex items-center space-x-1.5 hover:underline text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4 text-orange-500" />
                <span>{language === 'en' ? 'Back to Menu' : 'மெனுவிற்குத் திரும்பு'}</span>
              </button>
              <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2.5 py-1 rounded-full font-mono">
                {activeOrder.id}
              </span>
            </div>

            {/* LIVE STEPPER STATUS */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl relative overflow-hidden shadow-xs text-slate-800">
              <h3 className="text-xs font-bold tracking-tight uppercase text-orange-600 mb-3">{t.activeOrder} Status</h3>
              
              <div className="flex flex-col space-y-4 relative pl-5 border-l-2 border-slate-100">
                {/* Stepper Node 1: Pending */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold ${activeOrder.status === 'Pending' ? 'bg-orange-500 border-orange-600 animate-pulse' : 'bg-emerald-500 border-emerald-600'}`}>
                    {activeOrder.status !== 'Pending' && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                  </div>
                  <p className={`text-xs font-bold ${activeOrder.status === 'Pending' ? 'text-orange-600' : 'text-slate-700'}`}>
                    {t.statusPending}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {activeOrder.status === 'Pending' ? 'Cooking crew reviewing spec.' : 'Approved'}
                  </p>
                </div>

                {/* Stepper Node 2: Preparing */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold ${activeOrder.status === 'Preparing' ? 'bg-orange-500 border-orange-600 animate-pulse' : (activeOrder.status === 'Pending' ? 'bg-slate-100 border-slate-200' : 'bg-emerald-500 border-emerald-600')}`}>
                    {(activeOrder.status !== 'Preparing' && activeOrder.status !== 'Pending') && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                  </div>
                  <p className={`text-xs font-bold ${activeOrder.status === 'Preparing' ? 'text-orange-600' : 'text-slate-500'}`}>
                    {t.statusPreparing}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {activeOrder.status === 'Preparing' ? 'Fresh wok, pan & ladle active.' : 'Chef finished task'}
                  </p>
                </div>

                {/* Stepper Node 3: Ready */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold ${activeOrder.status === 'Ready' ? 'bg-orange-500 border-orange-600 animate-pulse' : (activeOrder.status === 'Delivered' ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-100 border-slate-200')}`}>
                    {activeOrder.status === 'Delivered' && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                  </div>
                  <p className={`text-xs font-bold ${activeOrder.status === 'Ready' ? 'text-orange-600' : 'text-slate-500'}`}>
                    {t.statusReady}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {activeOrder.orderType === 'Table' ? 'Ready to serve at table!' : 'Rider dispatch hand-off'}
                  </p>
                </div>

                {/* Stepper Node 4: Delivered */}
                <div className="relative">
                  <div className={`absolute -left-[27px] top-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[7px] font-bold ${activeOrder.status === 'Delivered' ? 'bg-emerald-500 border-emerald-600' : 'bg-slate-100 border-slate-200'}`}>
                    {activeOrder.status === 'Delivered' && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                  </div>
                  <p className={`text-xs font-bold ${activeOrder.status === 'Delivered' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {t.statusDelivered}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Enjoy your fresh flavor!
                  </p>
                </div>
              </div>

              {/* Countdown Ticker Box */}
              {activeOrder.status !== 'Delivered' && (
                <div className="mt-4 bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-150">
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t.waitingTime}</p>
                      <p className="text-xs font-mono font-bold text-slate-800">
                        ~{activeOrder.estimatedWaitTime} {t.mins} Remaining
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400">Progress</p>
                    <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-orange-500 h-full transition-all duration-1000" 
                        style={{ width: `${Math.round(((activeOrder.originalEstimatedWaitTime - activeOrder.estimatedWaitTime) / activeOrder.originalEstimatedWaitTime) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE TRACKING HIGH FIDELITY SVG MAP REPRESENTATION */}
            {activeOrder.orderType === 'Delivery' && (
              <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
                <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-2 font-bold">
                  🗺️ LIVE DIRECT ROUTE MAP (VELACHERY → ADYAR)
                </p>
                <div className="w-full h-36 bg-slate-50 border border-slate-150 rounded-xl relative overflow-hidden flex flex-col justify-end">
                  
                  {/* Visual SVG Map roads, grid and dots */}
                  <svg className="absolute inset-0 w-full h-full stroke-slate-200 fill-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" className="fill-slate-250 fill-slate-300/40" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    {/* Road pathways */}
                    <path d="M 20 40 L 120 40 L 220 110 L 320 110" strokeWidth="4" strokeLinecap="round" className="stroke-slate-200" />
                    <path d="M 120 40 L 120 130 L 220 110" strokeWidth="4" strokeLinecap="round" className="stroke-slate-200" />
                    {/* Active routing line in green */}
                    <path d="M 20 40 L 120 40 L 220 110" strokeWidth="2.5" strokeLinecap="round" className="stroke-emerald-500/30" />
                    {/* Destination routing line */}
                    <path d="M 220 110 L 320 110" strokeWidth="2.5" strokeLinecap="round" className="stroke-orange-500/40" />
                  </svg>

                  {/* RESTAURANT NODE */}
                  <div className="absolute left-[38px] top-[14px] flex flex-col items-center">
                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white text-xs text-white shadow">
                      🍲
                    </div>
                    <span className="text-[8px] bg-slate-800 text-white font-bold px-1 rounded-sm mt-0.5 whitespace-nowrap">
                      Kitchen (Velachery)
                    </span>
                  </div>

                  {/* CUSTOMER CUSTOM HOME NODE */}
                  <div className="absolute right-[30px] bottom-[14px] flex flex-col items-center">
                    <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center border-2 border-white text-xs text-white shadow animate-bounce">
                      🏠
                    </div>
                    <span className="text-[8px] bg-slate-800 text-white font-semibold px-1 rounded-sm mt-0.5 whitespace-nowrap">
                      Suji (Adyar Home)
                    </span>
                  </div>

                  {/* LIVE RIDER ANIMATED MARKER */}
                  {activeOrder.riderProgress > 0 && (
                    <div 
                      className="absolute p-0.5 rounded-full border border-orange-200 bg-white text-[10px] shadow-md flex items-center space-x-1 transition-all duration-1000 z-10"
                      style={{
                        // Coordinates interpolated based on percent progression
                        left: `${Math.min(280, 20 + (activeOrder.riderProgress * 2.6))}px`,
                        top: `${activeOrder.riderProgress < 45 ? 30 : Math.min(100, 30 + ((activeOrder.riderProgress - 45) * 1.1))}px`
                      }}
                    >
                      <span>🛵</span>
                      <span className="text-[7px] text-orange-600 font-bold font-mono px-1 bg-orange-50 rounded">
                        {activeOrder.riderProgress}%
                      </span>
                    </div>
                  )}

                  <div className="p-1 px-3 bg-white text-[9px] text-slate-500 flex justify-between z-10 select-none border-t border-slate-100">
                    <span>GPS active</span>
                    <span className="text-orange-600 font-bold font-mono">DineFlow Route Server</span>
                  </div>
                </div>
              </div>
            )}

            {/* LIVE DELIVERY PARTNER CHAT */}
            {activeOrder.orderType === 'Delivery' && activeOrder.riderState && (
              <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2 flex flex-col shadow-xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-1.5 justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-slate-150 rounded-full flex items-center justify-center text-[10px]">
                      🚴
                    </div>
                    <div>
                      <p className="text-[10px] leading-tight font-bold text-slate-800">Selvam D. (Rider)</p>
                      <p className="text-[8px] leading-tight text-emerald-600 font-semibold">Online & Navigating</p>
                    </div>
                  </div>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
                </div>

                {/* Messages Panel */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-2 h-24 overflow-y-auto text-[10px]">
                  {activeOrder.riderChat?.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'rider' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-1.5 px-2.5 rounded-xl max-w-xs ${msg.sender === 'rider' ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-none' : 'bg-orange-500 text-white font-semibold rounded-tr-none shadow-xs'}`}>
                        <p className="text-[9px]">{msg.text}</p>
                        <span className="text-[6px] text-slate-400 float-right mt-0.5">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef}></div>
                </div>

                {/* Input form */}
                <div className="flex space-x-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.typeMessage}
                    className="flex-1 bg-white text-[10px] rounded-lg border border-slate-200 px-2 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="p-1 px-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-lg flex items-center justify-center transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ORDER INSTANT FEEDBACK MECHANISM WHEN DELIVERED */}
            {activeOrder.status === 'Delivered' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center space-y-3 shadow-sm text-slate-800">
                <p className="text-xl">🎉🍲</p>
                <h4 className="text-xs font-bold uppercase text-orange-600 font-sans">
                  {language === 'en' ? 'Rate Your Taste Experience' : 'உணவின் ரசனை மதிப்பீடு செய்க'}
                </h4>
                <p className="text-[9px] text-slate-500">
                  How was your culinary experience on Order #{activeOrder.id}?
                </p>
                
                {/* Rating Stars selectable */}
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setReviewStars(star)}
                      className="transition transform active:scale-125 focus:outline-none"
                    >
                      <Star className={`w-6 h-6 ${star <= reviewStars ? 'text-orange-500 fill-orange-500' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={t.writeReview}
                    className="w-full bg-slate-50 text-[10px] p-2 border border-slate-200 font-sans rounded-lg placeholder-slate-400 focus:outline-none focus:border-orange-500 text-slate-800"
                  />
                  <button 
                    onClick={() => handleRatingSubmit(activeOrder.id)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-1.5 text-xs rounded-lg shadow-xs transition"
                  >
                    {language === 'en' ? 'Submit Chef Feedback' : 'கருத்தை அனுப்புக'}
                  </button>
                </div>
              </div>
            )}

          </div>

        ) : (

          /* VIEW 2: Menu browse, category filter, cart review and recommendations */
          <div className="p-4 space-y-4">
            
            {/* SEARCH AND QR CODE BOX */}
            <div className="flex space-x-1.5 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-[10px] top-[9px] w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-white text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-orange-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-[10px] top-[9px] text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  setOrderType('Table');
                  alert(language === 'en' ? 'Simulated QR Scanner Active! Connected directly to Table 3.' : 'QR ஸ்கேனர் மூலம் உங்கள் மேஜை எண் 3 வெற்றிகரமாக இணைக்கப்பட்டது!');
                }}
                className="p-2 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-orange-600 flex items-center justify-center cursor-pointer transition shadow-xs"
                title={t.tableOrderQR}
              >
                <span>🎯</span>
              </button>
            </div>

            {/* AI RECOMMENDER SYSTEM */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 shadow-xs text-slate-800">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4.5 h-4.5 text-orange-500 animate-pulse fill-orange-500/10" />
                <h3 className="text-xs font-bold text-slate-900 font-sans tracking-tight">
                  {t.aiRecs}
                </h3>
              </div>
              <p className="text-[9px] text-slate-500 leading-normal">
                {language === 'en' 
                  ? 'Type what flavour profiles you crave or select a instant button and let chef Gemini recommend.'
                  : 'உங்கள் விருப்பத்தைத் தட்டச்சு செய்து செஃப் ஜெமினியிடம் பரிந்துரை பெறுங்கள்.'}
              </p>

              {/* Presets */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {moodPresets.map((preset, index) => (
                  <button 
                    key={index} 
                    onClick={() => {
                      setAiMood(preset);
                      generateAiRecommendation(preset);
                    }}
                    className="p-1 px-2 text-[8px] bg-slate-50 hover:bg-orange-50 text-slate-600 rounded-md border border-slate-200 hover:border-orange-300 transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Free format input prompt */}
              <div className="flex space-x-1.5 mt-2">
                <input
                  type="text"
                  value={aiMood}
                  onChange={(e) => setAiMood(e.target.value)}
                  placeholder={language === 'en' ? 'Try "spicy non-veg lunch" style...' : 'உதாரணமாக "பிரேக்பாஸ்ட் காரமாக"...'}
                  className="flex-1 bg-slate-50 text-[9px] p-1.5 rounded-lg border border-slate-200 px-2 text-slate-800 focus:outline-none focus:border-orange-500 placeholder-slate-400"
                />
                <button
                  disabled={isGeneratingAi}
                  onClick={() => generateAiRecommendation(aiMood)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold p-1 px-2 rounded-lg text-[9px] flex items-center space-x-1 active:scale-95 transition disabled:opacity-40"
                >
                  <span>{isGeneratingAi ? '...' : t.recommendMe}</span>
                </button>
              </div>

              {/* Recommendation results output */}
              <AnimatePresence>
                {aiRecommendation && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 mt-2 text-[10px]"
                  >
                    <p className="text-[8px] text-orange-600 uppercase font-mono tracking-wider font-bold">{t.aiSuggest}</p>
                    <p className="text-slate-700 leading-relaxed italic font-medium">"{aiRecommendation.text}"</p>
                    {aiRecommendation.keywords && aiRecommendation.keywords.length > 0 && (
                      <div className="flex items-center space-x-1 flex-wrap mt-0.5">
                        <span className="text-[7px] text-slate-400 font-mono">Highlights:</span>
                        {aiRecommendation.keywords.map((kw, i) => (
                          <span key={i} className="text-[7px] bg-white text-orange-600 font-bold px-1.5 py-0.5 rounded border border-slate-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CATEGORIES HORIZONTAL NAVIGATION */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-1.5">{t.categoriesText}</p>
              <div className="flex space-x-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 cursor-pointer transition capitalize shrink-0 ${
                      selectedCategory === cat.id 
                        ? 'bg-orange-500 text-white font-bold shadow-xs' 
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <span>{language === 'en' ? cat.name : cat.nameTa}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CULINARY FOODS VERTICAL LIST */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">{t.bestSellers}</p>
                <p className="text-[9px] text-slate-500">Showing {filteredFood.length} delights</p>
              </div>

              {filteredFood.length > 0 ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredFood.map((food) => (
                    <div 
                      key={food.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 p-2 rounded-2xl flex space-x-2.5 transition relative overflow-hidden group shadow-xs text-slate-800"
                    >
                      <img 
                        src={food.image} 
                        alt={food.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-xs font-bold leading-tight text-slate-900 truncate pr-4">
                              {language === 'en' ? food.name : food.nameTa}
                            </h4>
                            <span className="text-[11px] font-bold text-orange-600 font-mono">
                              ₹{food.price}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 font-medium">
                            {language === 'en' ? food.description : food.descriptionTa}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-1 text-[8px] text-slate-400 font-medium">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className="flex items-center text-[9px] text-orange-500 font-bold font-mono">
                              <Star className="w-2.5 h-2.5 stroke-2 mr-0.5 fill-orange-500" />
                              {food.rating}
                            </span>
                            <span className="font-mono">🕒 {food.prepTime}m</span>
                          </div>

                          <button 
                            onClick={() => handleOpenCustom(food)}
                            className="p-1 px-2.5 bg-orange-500 text-white hover:bg-orange-600 font-bold rounded-lg uppercase tracking-tight duration-150 active:scale-90 shadow-xs"
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      {food.isBestSeller && (
                        <span className="absolute right-0 top-0 bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-bl-lg text-[6px] tracking-wider uppercase font-mono shadow-xs">
                          BEST
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
                  <AlertCircle className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 mt-2 font-medium">No matching culinary items located.</p>
                </div>
              )}
            </div>

            {/* FLOATING ACTIVE PLATE (CART SUMMARY) BUTTON */}
            {cart.length > 0 && (
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-2 relative shadow-md text-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1.5">
                    <ShoppingBag className="w-4 h-4 text-orange-500 animate-bounce" />
                    <span className="font-bold text-slate-800">
                      {t.cart} ({cart.reduce((s, i) => s + i.quantity, 0)})
                    </span>
                  </div>
                  <span className="font-mono font-bold text-orange-600">₹{cartSubtotal}</span>
                </div>

                {/* mini items check */}
                <div className="max-h-24 overflow-y-auto space-y-1 text-[9px]">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-1.5 px-2.5 rounded-lg">
                      <div className="truncate pr-2">
                        <span className="font-bold text-orange-600">{item.quantity}x</span>{' '}
                        <span className="text-slate-700 font-medium">{language === 'en' ? item.foodItem.name : item.foodItem.nameTa}</span>
                        {item.selectedExtras.length > 0 && (
                          <span className="text-slate-400 font-normal"> (+{item.selectedExtras.join(', ')})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button onClick={() => updateCartQuantity(idx, item.quantity - 1)} className="p-0.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded">
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <button onClick={() => updateCartQuantity(idx, item.quantity + 1)} className="p-0.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded">
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-1.5 items-center mt-2 pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setOrderType('Delivery');
                      setShowCheckoutModal(true);
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 font-bold text-white p-2 rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center space-x-2 transition shadow-xs"
                  >
                    <span>{t.placeOrder}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setOrderType('Table');
                      setShowCheckoutModal(true);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    title="Dine-In Table Quick Order"
                  >
                    🍽️
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TOAST NOTIFICATION ON CART ADD */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-18 left-4 right-4 bg-emerald-500 text-white text-[10px] font-bold p-3 rounded-xl flex items-center justify-between shadow-lg z-40 border border-emerald-400"
          >
            <span className="flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t.addedToCart}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUSTOMIZATION DRAWER POPUP */}
      <AnimatePresence>
        {selectedItemForCustom && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-30 flex items-end justify-center">
            <motion.div 
              initial={{ y: 250 }}
              animate={{ y: 0 }}
              exit={{ y: 250 }}
              className="bg-white w-full max-h-[500px] rounded-t-3xl border-t border-slate-200 p-4 space-y-4 overflow-y-auto shadow-xl text-slate-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? selectedItemForCustom.name : selectedItemForCustom.nameTa}
                  </h3>
                  <p className="text-[10px] text-orange-600 font-mono font-bold mt-0.5 font-bold">₹{selectedItemForCustom.price}</p>
                </div>
                <button 
                  onClick={() => setSelectedItemForCustom(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* SPICE SELECTOR */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{t.spiceLevel}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Mild', 'Medium', 'Hot'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSpiceLevel(lvl)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                        spiceLevel === lvl 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {language === 'en' ? lvl : lvl === 'Mild' ? t.mild : lvl === 'Medium' ? t.medium : t.hot}
                    </button>
                  ))}
                </div>
              </div>

              {/* EXTRAS */}
              {selectedItemForCustom.extras && selectedItemForCustom.extras.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{t.extrasText}</p>
                  <div className="space-y-1.5">
                    {selectedItemForCustom.extras.map((extra) => {
                      const isSelected = selectedExtras.includes(extra.name);
                      return (
                        <button
                          key={extra.name}
                          type="button"
                          onClick={() => toggleExtra(extra.name)}
                          className={`w-full p-2 rounded-xl text-[10px] flex justify-between items-center transition ${
                            isSelected ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50 border border-transparent'
                          }`}
                        >
                          <span className={`font-semibold ${isSelected ? 'text-orange-600' : 'text-slate-600'}`}>
                            {language === 'en' ? extra.name : extra.nameTa}
                          </span>
                          <span className="font-mono font-bold text-slate-700 font-bold">+₹{extra.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CHEF NOTES */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Instructions to Chef:</p>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="e.g. No onions, pack separately..."
                  className="w-full bg-slate-50 text-[10px] p-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* QUANTITY COUNTER */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-400 font-mono">QUANTITY</span>
                <div className="flex items-center space-x-3 bg-slate-50 p-1 px-3 rounded-xl border border-slate-250 border-slate-200">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-slate-500 hover:text-slate-700">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-slate-800">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="text-slate-500 hover:text-slate-700">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-2.5 rounded-xl uppercase text-xs tracking-wider transition shadow-xs"
              >
                {t.addBtn}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT MODAL WINDOW */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-30 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-slate-250 border-slate-200 rounded-3xl w-full p-4 space-y-4 shadow-xl text-slate-800"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] uppercase tracking-widest font-mono text-orange-600 font-bold">
                  {t.placeOrder} Setup
                </h3>
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full border border-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="space-y-3 text-[10px]">
                {/* Switch order type */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setOrderType('Delivery')}
                    className={`py-1 rounded-lg font-bold uppercase transition ${
                      orderType === 'Delivery' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-550 text-slate-500 font-semibold'
                    }`}
                  >
                    🚀 {t.delivery}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('Table')}
                    className={`py-1 rounded-lg font-bold uppercase transition ${
                      orderType === 'Table' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-550 text-slate-500 font-semibold'
                    }`}
                  >
                    🍽️ {t.dineIn}
                  </button>
                </div>

                <div>
                  <label className="text-slate-500 block mb-0.5 font-semibold">{t.customerNameText}</label>
                  <input
                    type="text"
                    required
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    className="w-full bg-white p-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-0.5 font-semibold">{t.customerPhoneText}</label>
                  <input
                    type="text"
                    required
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    className="w-full bg-white p-2 text-xs rounded-lg border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-orange-500"
                  />
                </div>

                {orderType === 'Table' ? (
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-semibold">{t.enterTableNum}</label>
                    <input
                      type="number"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full bg-white p-2 text-xs rounded-lg border border-slate-200 text-slate-800 font-mono focus:outline-none focus:border-orange-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-slate-500 block mb-0.5 font-semibold">{t.deliveryAddressText}</label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-white p-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}

                {/* PRICING REVIEW BRIEF */}
                <div className="bg-slate-50 p-2.5 rounded-xl space-y-1 font-mono text-[9px] border border-slate-200 text-slate-700">
                  <div className="flex justify-between">
                    <span>{t.subtotal}:</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.tax}:</span>
                    <span>₹{cartTaxes}</span>
                  </div>
                  {orderType === 'Delivery' && (
                    <div className="flex justify-between">
                      <span>{t.deliveryFee}:</span>
                      <span>₹{deliveryCharges}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-orange-600 font-bold text-xs mt-1 font-bold font-sans">
                    <span>{t.total}:</span>
                    <span>₹{cartGrandTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold p-2.5 text-xs rounded-xl uppercase tracking-wider shadow-sm transition"
                >
                  ⚡ Pay & Order
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAV BAR */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-13 px-6 flex justify-around items-center z-20 shadow-sm">
        <button 
          onClick={() => {
            sound.playClick();
            setCurrentActiveOrderId(null);
          }}
          className={`flex flex-col items-center justify-center ${!currentActiveOrderId ? 'text-orange-600 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'}`}
        >
          <span className="text-base">🍲</span>
          <span className="text-[8px] mt-0.5 uppercase tracking-wider">{language === 'en' ? 'Menu' : 'உணவுகள்'}</span>
        </button>
        <button 
          onClick={() => {
            sound.playClick();
            if (orders.length > 0) {
              setCurrentActiveOrderId(orders[0].id);
            } else {
              alert(language === 'en' ? 'Place an order first!' : 'தயவுசெய்து முதலில் ஆர்டர் செய்யுங்கள்!');
            }
          }}
          className={`flex flex-col items-center justify-center ${currentActiveOrderId ? 'text-orange-600 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'}`}
        >
          <span className="text-base">🛵</span>
          <span className="text-[8px] mt-0.5 uppercase tracking-wider">{language === 'en' ? 'Track' : 'பின்தொடர'}</span>
        </button>
      </nav>

    </div>
  </div>
  );
}
