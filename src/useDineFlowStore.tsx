import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Order, OrderStatus, Language, FoodItem } from './types';
import { foodItems } from './data';
import { sound } from './components/SoundUtility';

interface DineFlowContextType {
  language: Language;
  toggleLanguage: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  placeNewOrder: (
    customerName: string,
    customerPhone: string,
    orderType: 'Delivery' | 'Table',
    tableNumber?: string,
    deliveryAddress?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignDeliveryJob: (orderId: string) => void;
  updateRiderProgress: (orderId: string, progress: number, state?: 'Assigned' | 'AtStore' | 'EnRoute' | 'Delivered') => void;
  addRiderMessage: (orderId: string, text: string, sender: 'rider' | 'customer') => void;
  addOrderReview: (orderId: string, rating: number, review: string) => void;
  activeActorView: 'customer' | 'kitchen' | 'rider' | 'all';
  setActiveActorView: (view: 'customer' | 'kitchen' | 'rider' | 'all') => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  currentActiveOrderId: string | null;
  setCurrentActiveOrderId: (id: string | null) => void;
  aiRecommendation: { text: string; keywords?: string[] } | null;
  isGeneratingAi: boolean;
  generateAiRecommendation: (moodPrompt: string) => Promise<void>;
  waitingTimePredict: number;
}

const DineFlowContext = createContext<DineFlowContextType | undefined>(undefined);

export function DineFlowProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeActorView, setActiveActorView] = useState<'customer' | 'kitchen' | 'rider' | 'all'>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('Velachery Bypass, Chennai');
  const [currentActiveOrderId, setCurrentActiveOrderId] = useState<string | null>('DF-101'); // Auto-focus on preloaded order tracking
  const [aiRecommendation, setAiRecommendation] = useState<{ text: string; keywords?: string[] } | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Preload two mock sync orders so the app loads fully active
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'DF-101',
      customerName: 'Anand Kumar',
      customerPhone: '+91 98402 12345',
      items: [
        {
          foodItem: foodItems[1], // Ambur Chicken Biryani
          quantity: 2,
          selectedExtras: ['Boiled Egg'],
          spicySelection: 'Hot',
          notes: 'Make it extra spicy and pack salna separate.',
        },
        {
          foodItem: foodItems[6], // Alphonso Mango Lassi
          quantity: 1,
          selectedExtras: [],
          spicySelection: 'Mild',
        }
      ],
      totalAmount: 695.50, // (280*2 + 15)*1.05 + 110 + 30
      status: 'Preparing',
      orderType: 'Delivery',
      deliveryAddress: 'Block 4C, Ceebros Heights, Velachery, Chennai',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      estimatedWaitTime: 12,
      originalEstimatedWaitTime: 25,
      riderProgress: 35,
      riderState: 'Assigned',
      riderChat: [
        { sender: 'rider', text: 'Hello, I have accepted your DineFlow order! Heading to the restaurant now.', time: '12 mins ago' },
        { sender: 'customer', text: 'Thank you! Please ask them to pack the hot items separately.', time: '10 mins ago' },
        { sender: 'rider', text: 'Sure thing, brother. I am arriving at the kitchen in 2 mins.', time: 'Just now' },
      ],
    },
    {
      id: 'DF-102',
      customerName: 'Sujatha Sundar',
      customerPhone: '+91 94440 98765',
      items: [
        {
          foodItem: foodItems[0], // Ghee Podi Masala Dosa
          quantity: 1,
          selectedExtras: ['Extra Podi', 'Ghee Topping'],
          spicySelection: 'Medium',
        },
        {
          foodItem: foodItems[3], // Filter Coffee
          quantity: 1,
          selectedExtras: [],
          spicySelection: 'Mild',
        }
      ],
      totalAmount: 236.25, // (140 + 10 + 25 + 50) + 5% tax
      status: 'Pending',
      orderType: 'Table',
      tableNumber: '4',
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 mins ago
      estimatedWaitTime: 8,
      originalEstimatedWaitTime: 12,
      riderProgress: 0,
    }
  ]);

  // Audio chimes based on central state changes
  useEffect(() => {
    // Add simple listener inside dashboard simulation to trigger audible sounds for interactive demoing.
    // (This is triggered within our functions to keep syncing clean)
  }, [orders]);

  // Global background ticker to simulate delivery partner moves in real time!
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        let changed = false;
        const next = prevOrders.map(order => {
          if (order.status === 'Preparing' && order.riderState === 'Assigned') {
            // Rider moves closer to restaurant
            if (order.riderProgress < 40) {
              changed = true;
              return {
                ...order,
                riderProgress: Math.min(40, order.riderProgress + 2)
              };
            }
          } else if (order.status === 'Ready' && order.riderState === 'EnRoute') {
            // Rider delivers towards customer
            if (order.riderProgress < 100) {
              changed = true;
              const nextProgress = Math.min(100, order.riderProgress + 5);
              const nextState = nextProgress === 100 ? 'Delivered' : 'EnRoute';
              
              const isFirstArrivalMessage = order.riderProgress < 95 && nextProgress >= 95;
              const chatCopy = [...(order.riderChat || [])];
              if (isFirstArrivalMessage) {
                chatCopy.push({
                  sender: 'rider',
                  text: 'I have arrived at your building! Coming upstairs now. 🛵',
                  time: 'Just now'
                });
              }

              return {
                ...order,
                riderProgress: nextProgress,
                status: nextProgress === 100 ? 'Delivered' : order.status,
                riderState: nextProgress === 100 ? 'Delivered' : order.riderState,
                estimatedWaitTime: Math.max(0, Math.ceil((100 - nextProgress) * 0.15)),
                riderChat: chatCopy
              };
            }
          }
          return order;
        });
        return changed ? next : prevOrders;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    sound.playClick();
    setLanguage(prev => (prev === 'en' ? 'ta' : 'en'));
  };

  const addToCart = (item: CartItem) => {
    sound.playClick();
    setCart(prev => {
      // If same item, spice, and extras are already there, combine
      const existingIdx = prev.findIndex(
        i => i.foodItem.id === item.foodItem.id &&
             i.spicySelection === item.spicySelection &&
             JSON.stringify(i.selectedExtras.sort()) === JSON.stringify(item.selectedExtras.sort())
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += item.quantity;
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (index: number) => {
    sound.playClick();
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => {
      const copy = [...prev];
      copy[index].quantity = quantity;
      return copy;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeNewOrder = (
    customerName: string,
    customerPhone: string,
    orderType: 'Delivery' | 'Table',
    tableNumber?: string,
    deliveryAddress?: string
  ): Order => {
    sound.playSuccessDing();
    const newId = `DF-${Math.floor(100 + Math.random() * 900)}`;
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.foodItem.price + (item.selectedExtras.reduce((s, exName) => {
      const eObj = item.foodItem.extras?.find(e => e.name === exName);
      return s + (eObj?.price || 0);
    }, 0))) * item.quantity, 0);

    const taxAmount = parseFloat((subtotal * 0.05).toFixed(2));
    const deliveryFee = orderType === 'Delivery' ? 30 : 0;
    const finalTotal = parseFloat((subtotal + taxAmount + deliveryFee).toFixed(2));

    const avgPrep = cart.reduce((max, cur) => Math.max(max, cur.foodItem.prepTime), 0) + 5;

    const newOrder: Order = {
      id: newId,
      customerName: customerName || 'Guest User',
      customerPhone: customerPhone || '+91 90000 00000',
      items: [...cart],
      totalAmount: finalTotal,
      status: 'Pending',
      orderType,
      tableNumber,
      deliveryAddress,
      createdAt: new Date().toISOString(),
      estimatedWaitTime: avgPrep,
      originalEstimatedWaitTime: avgPrep,
      riderProgress: 0,
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setCurrentActiveOrderId(newId);

    // Alert kitchen dashboard immediately with notification sound!
    setTimeout(() => {
      sound.playKitchenAlert();
    }, 1000);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    sound.playKitchenAlert();
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          // Play status chime on upgrade
          if (status !== o.status) {
            setTimeout(() => sound.playSuccessDing(), 500);
          }

          let extraMeta: Partial<Order> = {};
          if (status === 'Preparing' && !o.riderState && o.orderType === 'Delivery') {
            // Auto trigger delivery partner lookup
            extraMeta = {
              riderState: 'Assigned',
              riderProgress: 10,
              riderChat: [
                { sender: 'rider', text: 'Vanakam! DineFlow Rider assigned. Grabbing your fresh items!', time: 'Just now' }
              ]
            };
          }
          if (status === 'Ready') {
            extraMeta = {
               riderProgress: 40,
               riderState: o.orderType === 'Delivery' ? 'EnRoute' : undefined
            };
          }

          return { ...o, status, ...extraMeta };
        }
        return o;
      })
    );
  };

  const assignDeliveryJob = (orderId: string) => {
    sound.playSuccessDing();
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            riderState: 'Assigned',
            riderProgress: 20,
            riderChat: [
              ...(o.riderChat || []),
              { sender: 'rider', text: 'Greetings, I am heading to pick up the hot fresh items!', time: 'Just now' }
            ]
          };
        }
        return o;
      })
    );
  };

  const updateRiderProgress = (orderId: string, progress: number, state?: 'Assigned' | 'AtStore' | 'EnRoute' | 'Delivered') => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const currentProgress = progress;
          const targetStatus: OrderStatus = currentProgress >= 100 ? 'Delivered' : o.status;
          
          return {
            ...o,
            riderProgress: currentProgress,
            status: targetStatus,
            riderState: state || o.riderState,
          };
        }
        return o;
      })
    );
  };

  const addRiderMessage = (orderId: string, text: string, sender: 'rider' | 'customer') => {
    sound.playClick();
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            riderChat: [
              ...(o.riderChat || []),
              { sender, text, time: 'Just now' }
            ]
          };
        }
        return o;
      })
    );
  };

  const addOrderReview = (orderId: string, rating: number, review: string) => {
    sound.playSuccessDing();
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          return { ...o, rating, review };
        }
        return o;
      })
    );
  };

  // Smart wait time prediction calculated off queue size
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const waitingTimePredict = Math.max(5, pendingCount * 6 + 4);

  // Gemini AI Recommendation handler
  const generateAiRecommendation = async (moodPrompt: string) => {
    setIsGeneratingAi(true);
    setAiRecommendation(null);
    sound.playClick();

    try {
      // First attempt a fetch from the server endpoint
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: moodPrompt, language }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendation({
          text: data.text,
          keywords: data.keywords,
        });
      } else {
        throw new Error('Server recommend failed, using local engine');
      }
    } catch (e) {
      // Fallback offline recommendation engine
      setTimeout(() => {
        const lowercasePrompt = moodPrompt.toLowerCase();
        let matchedDish: FoodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
        let textEn = '';
        let textTa = '';

        if (lowercasePrompt.includes('spicy') || lowercasePrompt.includes('biryani') || lowercasePrompt.includes('non-veg') || lowercasePrompt.includes('heavy') || lowercasePrompt.includes('masala')) {
          matchedDish = foodItems[1]; // Chicken Biryani
          textEn = `Ah, you are craving something bold and aromatic! I highly recommend the Ambur Chicken Biryani. It's cooked over seasoned fire which infuses it with perfect spice levels and mouthwatering aromatics. Pack a Mango Lassi optionally to soothe the rich heat!`;
          textTa = `நீங்கள் காரசாரமாகவும் அதிக மணத்துடனும் சாப்பிட விரும்புகிறீர்கள்! அதற்காக நான் உங்களுக்கு எங்கள் ஸ்பெஷல் "ஆம்பூர் சிக்கன் பிரியாணி"யைப் பரிந்துரைக்கிறேன். சீரக சம்பா அரிசி மற்றும் சுவையான மசாலாவுடன் விறகடுப்பில் சமைக்கப்பட்டது. காரத்தைத் தணிக்க ஒரு மாம்பழ லஸ்ஸியையும் சேர்த்துக்கொள்ளலாம்!`;
        } else if (lowercasePrompt.includes('light') || lowercasePrompt.includes('healthy') || lowercasePrompt.includes('breakfast') || lowercasePrompt.includes('soft') || lowercasePrompt.includes('morning')) {
          matchedDish = foodItems[2]; // Idli
          textEn = `Perfect Choice for a gentle and nourishing meal! Our Madurai Malligai Poo Idlis are steaming hot, cotton-soft, and serve perfectly in the morning with refreshing pure vegetarian chutneys. Zero heavy oil, 100% digestively restorative!`;
          textTa = `மென்மையான மற்றும் ஆரோக்கியமான உணவுக்காக அருமையான தேர்வு! மல்லிகைப் பூவைப் போன்ற சூடான இட்லி, மூன்று சுவையான துவையல் மற்றும் சாம்பாருடன் உங்கள் உடலுக்கு நல்ல தெம்பைத் தரும். எண்ணெய் இல்லா ஆரோக்கியம்!`;
        } else if (lowercasePrompt.includes('sweet') || lowercasePrompt.includes('dessert') || lowercasePrompt.includes('cool') || lowercasePrompt.includes('refreshing')) {
          matchedDish = foodItems[7]; // Elaneer Payasam
          textEn = `Indulge in our exquisite Saffron Elaneer Payasam. Crafted from cold tender coconut milk, fresh kernels, and handpicked saffron threads, it is a glorious chilled treat that melts away any stressful heat!`;
          textTa = `எங்களின் பிரத்யேக "குங்குமப்பூ இளநீர் பாயசம்" உங்கள் நாவிற்குத் தித்திப்பான விருந்தாக அமையும். குளிர்ந்த தேங்காய் பால், இளநீர் வழுக்கை மற்றும் குங்குமப்பூவின் நறுமணத்துடன் இது உங்கள் மனதை குளிரச்செய்யும்!`;
        } else if (lowercasePrompt.includes('coffee') || lowercasePrompt.includes('energy') || lowercasePrompt.includes('drink') || lowercasePrompt.includes('beverage')) {
          matchedDish = foodItems[3]; // Filter Coffee
          textEn = `Need a strong, frothy wake-up call? The Kumbakonam Degree Filter Coffee features the perfect combination of premium chicory-mix decoction and thick frothed milk. Frothed traditionally to energize your senses!`;
          textTa = `சுறுசுறுப்பான காலைப்பொழுதிற்கு எங்களின் கும்பகோணம் டிகிரி ஃபில்டர் காபி மிகச் சிறந்த தெரிவு. சிறந்த மாட்டுப் பாலின் கெட்டித்தனமும் காபி தூளின் நறுமணமும் சேர்ந்து உங்களைப் புத்துணர்ச்சியாக்கும்!`;
        } else {
          matchedDish = foodItems[0]; // Ghee Podi Masala Dosa
          textEn = `How about a classic crispy treat? The Ghee Podi Masala Dosa balances crispy golden textures of organic cow ghee and idli podi with soft potato masala inside. Absolute customer favorite!`;
          textTa = `எங்கள் வாடிக்கையாளர்களின் பிரியமான நெய் பொடி மசாலா தோசையை ஏன் இன்று முயற்சிக்கக்கூடாது? காரசாரமான இட்லி பொடி மற்றும் தூய நெய் வாசனையுடன் உள்ளே வைக்கப்படும் உருளைக்கிழங்கு மசாலா உங்களை மீண்டும் மீண்டும் சாப்பிடத் தூண்டும்!`;
        }

        setAiRecommendation({
          text: language === 'en' ? textEn : textTa,
          keywords: [matchedDish.name, matchedDish.category, `${matchedDish.price} INR`],
        });
      }, 1500);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <DineFlowContext.Provider
      value={{
        language,
        toggleLanguage,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        orders,
        placeNewOrder,
        updateOrderStatus,
        assignDeliveryJob,
        updateRiderProgress,
        addRiderMessage,
        addOrderReview,
        activeActorView,
        setActiveActorView,
        selectedBranch,
        setSelectedBranch,
        currentActiveOrderId,
        setCurrentActiveOrderId,
        aiRecommendation,
        isGeneratingAi,
        generateAiRecommendation,
        waitingTimePredict,
      }}
    >
      {children}
    </DineFlowContext.Provider>
  );
}

export function useDineFlow() {
  const context = useContext(DineFlowContext);
  if (!context) {
    throw new Error('useDineFlow must be used within a DineFlowProvider');
  }
  return context;
}
