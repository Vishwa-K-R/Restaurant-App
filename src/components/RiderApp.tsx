import { useState, useRef, useEffect } from 'react';
import { useDineFlow } from '../useDineFlowStore';
import { translations } from '../data';
import { sound } from './SoundUtility';
import { MapPin, Navigation, MessageSquare, Check, X, Send, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RiderApp() {
  const {
    language,
    orders,
    updateOrderStatus,
    updateRiderProgress,
    addRiderMessage
  } = useDineFlow();

  const t = translations[language];

  // Rider chat helper
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filter deliveries that are assigned to delivery or ready to deliver
  const deliveryJobs = orders.filter(
    o => o.orderType === 'Delivery' && o.status !== 'Delivered' && o.status !== 'Cancelled'
  );

  const [activeJobId, setActiveJobId] = useState<string | null>(deliveryJobs[0]?.id || 'DF-101');
  const activeJob = orders.find(o => o.id === activeJobId);

  // Preloaded responses a rider can send with one tap!
  const quickTexts = language === 'en'
    ? ["I'm at the store, they are packing it now! 🎒", "Heading out now, traffic is moderate. 🛵", "Almost at your location, please stay reachable. 📞", "I have arrived at your doorstep! Enjoy."]
    : ["நான் கடைக்கு வந்துவிட்டேன், உணவை பேக் செய்கிறார்கள். 🎒", "விநியோகிக்கக் கிளம்பிவிட்டேன், லேசான போக்குவரத்து நெரிசல். 🛵", "உங்கள் முகவரிக்கு அருகில் வந்துவிட்டேன் அண்ணா. 📞", "நான் உங்கள் வீட்டிற்கு வெளியே நிற்கிறேன்!"];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeJob?.riderChat]);

  const handleAcceptJob = (jobId: string) => {
    sound.playSuccessDing();
    updateRiderProgress(jobId, 15, 'Assigned');
    // Send auto msg
    addRiderMessage(jobId, "Vanakam, I have accepted your delivery contract! Heading into the kitchen now.", 'rider');
  };

  const handleMarkPickedUp = (jobId: string) => {
    sound.playSuccessDing();
    updateOrderStatus(jobId, 'Ready');
    updateRiderProgress(jobId, 45, 'EnRoute');
    addRiderMessage(jobId, "Hot and fresh packages secured in my thermal box! Dispatched and rushing to you now. 🛵⚡", 'rider');
  };

  const handleMarkDelivered = (jobId: string) => {
    sound.playSuccessDing();
    updateOrderStatus(jobId, 'Delivered');
    updateRiderProgress(jobId, 100, 'Delivered');
    addRiderMessage(jobId, "Safely delivered! Hope you love our Chennai fresh flavors. Please rate us 5 stars on DineFlow!", 'rider');
  };

  const handleSendMessageRider = () => {
    if (!chatInput.trim() || !activeJob) return;
    addRiderMessage(activeJob.id, chatInput, 'rider');
    setChatInput('');
  };

  const handleQuickSend = (text: string) => {
    if (!activeJob) return;
    addRiderMessage(activeJob.id, text, 'rider');
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-900 text-slate-100 rounded-[40px] border-8 border-slate-950 shadow-2xl overflow-hidden relative" style={{ height: '780px' }}>
      
      {/* Phone Notch/Status Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 py-1.5 px-6 flex justify-between items-center z-20">
        <span className="font-mono font-medium">08:16</span>
        <div className="w-16 h-4 bg-slate-950 rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-sky-500 rounded-full mr-1.5 animate-pulse"></div>
          <span className="text-[9px] font-mono tracking-wider font-semibold text-sky-500">RIDER APP</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] bg-slate-800 px-1 text-slate-300 font-semibold rounded">5G</span>
          <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex">
            <div className="w-full bg-slate-300 rounded-xs"></div>
          </div>
        </div>
      </div>

      {/* Main Internal Layout */}
      <div className="flex flex-col h-[740px] bg-slate-950 overflow-y-auto relative pb-16 custom-scrollbar">
        
        {/* Header banner */}
        <header className="p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-sm font-black text-sky-400 tracking-wider">
              {t.deliveryPartnerDashboard}
            </h1>
            <p className="text-[9px] text-slate-400 font-mono">DineFlow Logistics Network</p>
          </div>
          <span className="text-[9px] bg-sky-500/10 text-sky-400 font-bold px-2 py-0.5 rounded-full border border-sky-500/20">
            Active: Selvam
          </span>
        </header>

        {/* JOBS LIST PANEL */}
        <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
          
          <div>
            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mb-1.5">Assigned Dispatch Contracts</p>
            {deliveryJobs.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl text-center">
                <p className="text-xs text-slate-500">No pending delivery jobs for Velachery/Adyar zone.</p>
              </div>
            ) : (
              <div className="flex space-x-2 overflow-x-auto pb-1 custom-scrollbar">
                {deliveryJobs.map((job) => {
                  const isSelected = activeJobId === job.id;
                  return (
                    <button
                      key={job.id}
                      onClick={() => { setActiveJobId(job.id); sound.playClick(); }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex flex-col space-y-1 transition shrink-0 border ${
                        isSelected 
                          ? 'bg-sky-500 text-slate-950 border-sky-450 font-black' 
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>Order {job.id}</span>
                      <span className={`text-[8px] font-mono leading-none ${isSelected ? 'text-slate-900/80' : 'text-slate-500'}`}>
                        {job.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVE JOB INTERACTION CARD */}
          {activeJob ? (
            <div className="space-y-3.5 flex-1 flex flex-col min-h-0">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-tight">{t.jobDetails}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Customer: {activeJob.customerName}</p>
                  </div>
                  <span className="text-[10px] bg-slate-950 text-amber-400 font-mono font-bold px-2 py-0.5 rounded-full">
                    ₹{activeJob.totalAmount}
                  </span>
                </div>

                <div className="p-2 bg-slate-950 rounded-xl space-y-1 text-[9px] font-mono text-slate-400">
                  <p className="text-slate-200 font-semibold uppercase">Items Package:</p>
                  {activeJob.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.quantity}x {it.foodItem.name}</span>
                      <span className="text-slate-500">🌶️ {it.spicySelection}</span>
                    </div>
                  ))}
                  {activeJob.deliveryAddress && (
                    <div className="text-slate-500 border-t border-slate-800 pt-1.5 mt-1">
                      <p className="text-slate-300 font-semibold uppercase text-[8px]">Delivery destination Address:</p>
                      <p className="truncate text-[8px] mt-0.5">{activeJob.deliveryAddress}</p>
                    </div>
                  )}
                </div>

                {/* SLIDER ACTION CONSOLE FOR RIDERS */}
                <div className="pt-2">
                  {!activeJob.riderState && (
                    <button
                      onClick={() => handleAcceptJob(activeJob.id)}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-2 text-xs rounded-xl uppercase tracking-wider transition active:scale-95"
                    >
                      {t.acceptDelivery}
                    </button>
                  )}
                  {activeJob.riderState === 'Assigned' && activeJob.status === 'Preparing' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 text-center rounded-xl space-y-1">
                      <span className="text-[8px] animate-pulse text-yellow-400 block font-bold uppercase">WAITING IN COOKING PROCESS...</span>
                      <p className="text-[9px] text-slate-400">Chef is cooking. Standby at store counter.</p>
                      <button
                        onClick={() => handleMarkPickedUp(activeJob.id)}
                        className="w-full mt-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold p-1.5 text-[10px] rounded-lg uppercase transition"
                      >
                        Force Pickup Pack (Cook Done)
                      </button>
                    </div>
                  )}
                  {activeJob.riderState === 'Assigned' && activeJob.status === 'Ready' && (
                    <button
                      onClick={() => handleMarkPickedUp(activeJob.id)}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold p-2 text-xs rounded-xl uppercase tracking-wider transition active:scale-95"
                    >
                      🎒 {t.markPickedUp}
                    </button>
                  )}
                  {activeJob.riderState === 'EnRoute' && (
                    <button
                      onClick={() => handleMarkDelivered(activeJob.id)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse text-slate-950 font-bold p-2.5 text-xs rounded-xl uppercase tracking-wider transition active:scale-95"
                    >
                      🏁 {t.markDelivered}
                    </button>
                  )}
                  {activeJob.riderState === 'Delivered' && (
                    <div className="bg-slate-950 border border-emerald-500/20 text-emerald-400 p-2 text-center rounded-xl font-bold uppercase text-[9px]">
                      Job successfully Completed! 🏍️
                    </div>
                  )}
                </div>
              </div>

              {/* CHAT MESSENGER LOGS SIMULATOR */}
              {activeJob.riderState && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col flex-1 min-h-0 space-y-2">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Chat with Customer</p>
                  
                  {/* Messages */}
                  <div className="bg-slate-950/80 rounded-xl p-2.5 space-y-1.5 h-24 overflow-y-auto text-[10px] min-h-0 flex-1">
                    {activeJob.riderChat?.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'rider' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-1.5 px-2.5 rounded-xl max-w-xs ${msg.sender === 'rider' ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                          <p className="text-[9px] leading-tight">{msg.text}</p>
                          <span className="text-[6px] text-slate-400/80 float-right mt-0.5">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef}></div>
                  </div>

                  {/* QUICK SEND SHINGLES */}
                  <div className="flex flex-wrap gap-1">
                    {quickTexts.slice(0, 3).map((txt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickSend(txt)}
                        className="bg-slate-950/60 hover:bg-slate-950 text-[8px] text-sky-400 p-1 rounded-sm border border-slate-800 text-left line-clamp-1 truncate max-w-[150px]"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>

                  {/* Input write row */}
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessageRider()}
                      placeholder="Type reply to Anand..."
                      className="flex-1 bg-slate-950 text-[10px] rounded-lg border border-slate-800 px-2 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleSendMessageRider}
                      className="p-1 px-2.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-slate-950 rounded-lg flex items-center justify-center transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-2xl mb-1">🛵</span>
              <p className="text-xs text-slate-500">Waiting for kitchen approval on new orders.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
