/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DineFlowProvider, useDineFlow } from './useDineFlowStore';
import CustomerApp from './components/CustomerApp';
import KitchenDashboard from './components/KitchenDashboard';
import RiderApp from './components/RiderApp';
import { translations } from './data';
import { sound } from './components/SoundUtility';
import { 
  Laptop, Smartphone, Bike, Layers, Info, CheckCircle, 
  RefreshCw, Volume2, ShieldCheck, ArrowRight, HelpCircle
} from 'lucide-react';

function DineFlowWorkspace() {
  const {
    language,
    toggleLanguage,
    activeActorView,
    setActiveActorView,
    orders
  } = useDineFlow();

  const t = translations[language];

  const handleSwitchActor = (view: 'customer' | 'kitchen' | 'rider' | 'all') => {
    sound.playClick();
    setActiveActorView(view);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      
      {/* Top Banner Hub Controller */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl animate-spin" style={{ animationDuration: '2s' }}>🛵</span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5 font-sans">
                  DineFlow <span className="text-[10px] tracking-widest uppercase font-mono bg-orange-500 text-white font-black px-2 py-0.5 rounded-lg">Sync Hub</span>
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  {language === 'en' 
                    ? 'All-in-One Multi-Device simulated restaurant ordering, kitchen dispatch, and rider tracker.' 
                    : 'ஒருங்கிணைந்த உணவு ஆர்டரிங், சமையலறை கண்காணிப்பு மற்றும் டெலிவரி செயலி.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick instructions / Info panel */}
          <div className="hidden lg:flex items-center space-x-3 text-[11px] bg-slate-50 border border-slate-200 p-2.5 px-4 rounded-xl text-slate-600 max-w-lg">
            <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong className="text-slate-900">Interactive Sync Demo:</strong> Select <code className="text-orange-600 font-bold bg-slate-100 px-1 py-0.5 rounded">All Devices</code> tab below to see Customer, Kitchen, and Rider views concurrently. Adding items or modifying statuses updates other simulators instantly!
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Audio Feedback controller alert */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-mono tracking-wider font-bold text-emerald-600 uppercase">Sound Active</span>
            </div>
            
            {/* Language global switch */}
            <button 
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-orange-600 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition"
              title="Toggle Global App Language"
            >
              <span>🌐</span>
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* CORE WORKSPACE TAB CONTROLLER */}
      <div className="max-w-7xl mx-auto w-full p-4 flex flex-col flex-1 space-y-4">
        
        {/* VIEW MODE TABS */}
        <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-bold font-mono uppercase tracking-wider pl-1 mr-2">{t.switchActor}</span>
            
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSwitchActor('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeActorView === 'all' 
                    ? 'bg-orange-500 text-white font-bold shadow-xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'All Devices Unified' : 'அனைத்து சாதனங்களும் (நேரடி)'}</span>
              </button>

              <button
                onClick={() => handleSwitchActor('customer')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeActorView === 'customer' 
                    ? 'bg-orange-500 text-white font-bold shadow-xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Customer App' : 'வாடிக்கையாளர்'}</span>
              </button>

              <button
                onClick={() => handleSwitchActor('kitchen')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeActorView === 'kitchen' 
                    ? 'bg-orange-500 text-white font-bold shadow-xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Kitchen Display' : 'சமையலறை'}</span>
              </button>

              <button
                onClick={() => handleSwitchActor('rider')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                  activeActorView === 'rider' 
                    ? 'bg-orange-500 text-white font-bold shadow-xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Rider Mobile' : 'விநியோகம்'}</span>
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-500 font-semibold bg-slate-50 p-1.5 px-3 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px]">{t.realTimeSyncEnabled}</span>
          </div>
        </div>

        {/* WORKSPACE MAIN CONTAINER AREA */}
        <div className="flex-1 min-h-[720px] flex items-stretch">
          
          {/* OPTION 1: UNIFIED SIMULATOR HUB SHOWING ALL THREE COEXISTING */}
          {activeActorView === 'all' && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* LEFT CONTAINER: CUSTOMER PHONE MOCK */}
              <div className="lg:col-span-4 flex flex-col justify-start">
                <div className="flex items-center justify-between mb-2 px-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">{t.customerView}</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">iOS Simulator</span>
                </div>
                <CustomerApp />
              </div>

              {/* MIDDLE CONTAINER: KITCHEN DASHBOARD MONITOR */}
              <div className="lg:col-span-5 flex flex-col justify-start">
                <div className="flex items-center justify-between mb-2 px-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">{t.kitchenView}</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Admin Panel</span>
                </div>
                <KitchenDashboard />
              </div>

              {/* RIGHT CONTAINER: RIDER COMPANION PHONE MOCK */}
              <div className="lg:col-span-3 flex flex-col justify-start">
                <div className="flex items-center justify-between mb-2 px-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 bg-sky-500 rounded-full"></span>
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">{t.riderView}</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Android Simulator</span>
                </div>
                <RiderApp />
              </div>

            </div>
          )}

          {/* OPTION 2: MAXIMIZED INDIVIDUAL SCREENS */}
          {activeActorView === 'customer' && (
            <div className="w-full flex justify-center py-6">
              <CustomerApp />
            </div>
          )}

          {activeActorView === 'kitchen' && (
            <div className="w-full py-4 h-full">
              <KitchenDashboard />
            </div>
          )}

          {activeActorView === 'rider' && (
            <div className="w-full flex justify-center py-6">
              <RiderApp />
            </div>
          )}

        </div>

        {/* Dynamic Sync Log Monitor Banner */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-xs">
          <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold block uppercase border-b border-slate-100 pb-1.5">
            DineFlow Live Hub Synchronization Broadcast Logger
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-slate-700 font-bold">{t.activeOrdersLabel}</p>
              <div className="space-y-1 font-mono text-[10px] text-slate-600">
                {orders.map((o) => (
                  <div key={o.id} className="flex justify-between bg-slate-50 p-1 px-2 rounded border border-slate-100">
                    <span className="font-semibold text-slate-800">Order {o.id} ({o.orderType})</span>
                    <span className="text-orange-600 font-bold">{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-slate-700 font-bold">{language === 'en' ? 'Automatic Rider Stepping' : 'டெலிவரி தானியங்கி இயக்கம்'}</p>
              <p className="text-[11px] text-slate-500 leading-normal">
                {language === 'en'
                  ? 'Active delivery riders automatically step closer to the target store or customer once assigned and en route. Watch rider progress percentage and coordinates map indicators flow dynamically!'
                  : 'ஆர்டர் விநியோகிக்கப்படும் போது, வரைபடத்தில் வண்டி நகர்வது மற்றும் தூரம் குறைவது தானாகவே இயங்கி வாடிக்கையாளருக்குக் காண்பிக்கும்.'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-700 font-bold">{language === 'en' ? 'Digital Sound Chimes Engine' : 'ஒலி அலை இயற்றி'}</p>
              <p className="text-[11px] text-slate-500 leading-normal">
                {language === 'en'
                  ? 'Uses the local Web Audio API to synthesize notification chimes for active user interaction feedback, preventing the need for any static sound file downloads.'
                  : 'உள்வரும் ஆர்டர்கள் மற்றும் நிலைகளைத் தெரிவிப்பதற்கு பிரத்யேக செயற்கை ஒலி அலைகளைத் தயாரித்து உடனுக்குடன் ஒலிக்கிறது.'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Humble professional credit footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 text-center text-slate-500 text-xs">
        <p>© 2026 DineFlow Synchronized Restaurant Workspace. All rights reserved.</p>
        <p className="text-[10px] text-slate-400 mt-1 font-mono">Chennai Area Nodes Velachery Bypass Gate-A</p>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <DineFlowProvider>
      <DineFlowWorkspace />
    </DineFlowProvider>
  );
}
