import { useState } from 'react';
import { useDineFlow } from '../useDineFlowStore';
import { translations } from '../data';
import { OrderStatus } from '../types';
import { sound } from './SoundUtility';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  ChefHat, Layers, TrendingUp, Users, RefreshCw, ChevronRight, 
  MapPin, AlertTriangle, ShieldCheck, Flame, PowerOff
} from 'lucide-react';

export default function KitchenDashboard() {
  const {
    language,
    orders,
    updateOrderStatus,
    selectedBranch,
    setSelectedBranch,
    waitingTimePredict
  } = useDineFlow();

  const t = translations[language];

  // Selected order focus in admin details
  const [selectedAdminOrderId, setSelectedAdminOrderId] = useState<string | null>('DF-101');
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'inventory'>('orders');

  const selectedOrder = orders.find(o => o.id === selectedAdminOrderId);

  // Core metrics calculated live!
  const liveRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingQueue = orders.filter(o => o.status === 'Pending').length;
  const cookingQueue = orders.filter(o => o.status === 'Preparing').length;
  const countServed = orders.filter(o => o.status === 'Delivered').length;

  // Custom localized branches for Chennai
  const branches = [
    'Velachery Bypass, Chennai',
    'Khader Nawaz Khan Rd, Nungambakkam',
    'Ganga Nagar, Coimbatore'
  ];

  // Data charts mock trends structured for fine grain Recharts
  const hourlySaletrend = [
    { hour: '08:00', sales: 1200, orders: 4 },
    { hour: '10:00', sales: 3400, orders: 12 },
    { hour: '12:00', sales: 9800, orders: 34 },
    { hour: '14:00', sales: 12400, orders: 48 },
    { hour: '16:00', sales: 4200, orders: 15 },
    { hour: '18:00', sales: 15600, orders: 58 },
    { hour: '20:00', sales: 22405, orders: 82 },
  ];

  const categoryShare = [
    { name: 'Mains', value: 45, color: '#3b82f6' },
    { name: 'Breakfast', value: 25, color: '#f59e0b' },
    { name: 'Veg Delights', value: 15, color: '#10b981' },
    { name: 'Drinks & Co.', value: 10, color: '#ec4899' },
    { name: 'Desserts', value: 5, color: '#8b5cf6' },
  ];

  const handleCycleStatus = (orderId: string, current: string) => {
    sound.playClick();
    if (current === 'Pending') {
      updateOrderStatus(orderId, 'Preparing');
    } else if (current === 'Preparing') {
      updateOrderStatus(orderId, 'Ready');
    } else if (current === 'Ready') {
      updateOrderStatus(orderId, 'Delivered');
    }
  };

  const handleCancel = (orderId: string) => {
    sound.playClick();
    updateOrderStatus(orderId, 'Cancelled');
  };

  return (
    <div className="w-full h-full min-h-[680px] bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl font-sans">
      
      {/* Dashboard Top banner */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-4 justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-950 shadow">
            <ChefHat className="w-5.5 h-5.5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight uppercase text-yellow-500">
              {t.adminHeadline}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span>Branch:</span>
              <select 
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  sound.playClick();
                }}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] rounded px-1.5 py-0.5 font-semibold focus:outline-none"
              >
                {branches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { sound.playClick(); setActiveTab('orders'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'orders' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Orders ({orders.length})
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('analytics'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'analytics' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📈 {language === 'en' ? 'Live Analytics' : 'பகுப்பாய்வு'}
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('inventory'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'inventory' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📦 Inventory Ticker
          </button>
        </div>

        {/* Operational sync speed badge */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-widest">{t.realTimeSyncEnabled}</span>
            <span className="text-[10px] text-emerald-400 font-bold font-mono">● LIVE HUB SYNCD WITH CLIENTS</span>
          </div>
        </div>
      </header>

      {/* METRIC SHINGLES ROW */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-4 border-b border-slate-800/80 bg-slate-950/40">
        
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">PENDING QUEUE</p>
            <p className="text-xl font-mono font-black text-amber-500 mt-1">{pendingQueue} Orders</p>
          </div>
          <Layers className="w-8 h-8 text-slate-700 stroke-1" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">COOKS UNDER FIRE</p>
            <p className="text-xl font-mono font-black text-rose-500 mt-1 flex items-center gap-1">
              {cookingQueue} <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
            </p>
          </div>
          <ChefHat className="w-8 h-8 text-slate-700 stroke-1" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">LIVE TODAY REVENUE</p>
            <p className="text-xl font-mono font-black text-emerald-400 mt-1">₹{(liveRevenue + 42350).toFixed(2)}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-slate-700 stroke-1" />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">AVG DISPATCH HOVER</p>
            <p className="text-xl font-mono font-black text-indigo-400 mt-1">~{waitingTimePredict} Mins</p>
          </div>
          <Users className="w-8 h-8 text-slate-700 stroke-1" />
        </div>

      </section>

      {/* ADMIN TABS RENDER CONTENT */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {activeTab === 'orders' && (
          <>
            {/* LEFT COLUMN: ACTIVE SYNCHRONIZED ORDERS QUEUE */}
            <div className="w-1/2 border-r border-slate-800 flex flex-col min-h-0 bg-slate-950/20">
              <div className="p-3 bg-slate-900/40 border-b border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-300">
                  {t.orderQueue}
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                  {orders.length} items
                </span>
              </div>

              {/* Orders scrolling body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {orders.map((o) => {
                  const isSelected = selectedAdminOrderId === o.id;
                  
                  // Simple color mapping based on state
                  const statusColors = {
                    'Pending': 'border-amber-500/40 bg-amber-500/5 text-amber-300',
                    'Preparing': 'border-rose-500/40 bg-rose-500/5 text-rose-300',
                    'Ready': 'border-blue-500/40 bg-blue-500/5 text-blue-300',
                    'Delivered': 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
                    'Cancelled': 'border-slate-800 bg-slate-900/40 text-slate-500'
                  };

                  return (
                    <div 
                      key={o.id}
                      onClick={() => { setSelectedAdminOrderId(o.id); sound.playClick(); }}
                      className={`p-3 rounded-xl border border-slate-800 cursor-pointer transition relative group ${
                        isSelected ? 'bg-slate-900 border-yellow-500/60' : 'bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-slate-200 font-mono text-xs">{o.id}</span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                              {o.customerName}
                            </span>
                          </div>
                          
                          {/* Order items count */}
                          <p className="text-[10px] text-slate-400 font-mono mt-1 pr-4 line-clamp-1">
                            {o.items.map(it => `${it.quantity}x ${language==='en'? it.foodItem.name : it.foodItem.nameTa}`).join(', ')}
                          </p>
                        </div>

                        {/* Order type and amount */}
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-300 font-mono">₹{o.totalAmount}</p>
                          <span className="text-[8px] uppercase tracking-wider font-semibold text-slate-500 block mt-0.5">
                            {o.orderType === 'Table' ? `Table ${o.tableNumber}` : 'Delivery'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800/60">
                        {/* Time stamp elapsed */}
                        <span className="text-[8px] font-mono text-slate-500">
                          Plcd: {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Order status label */}
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${statusColors[o.status]}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: FOCUSED ACTIVE WORKSPACE DETAILS */}
            <div className="w-1/2 flex flex-col min-h-0 bg-slate-900/10">
              {selectedOrder ? (
                <div className="p-4 flex flex-col h-full min-h-0">
                  
                  {/* Title & Customer Profile */}
                  <div className="border-b border-slate-800 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-black text-slate-100 font-mono">{selectedOrder.id} Workspace</h3>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 rounded bg-slate-800 text-slate-300 border border-slate-700`}>
                            {selectedOrder.orderType}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Client: <span className="text-slate-200 font-bold">{selectedOrder.customerName}</span> ({selectedOrder.customerPhone})
                        </p>
                      </div>

                      {/* CYCLE ACTIONS CORNER */}
                      <div className="flex space-x-1">
                        {selectedOrder.status !== 'Delivered' && (
                          <button
                            onClick={() => handleCycleStatus(selectedOrder.id, selectedOrder.status)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold p-1 px-3 rounded text-[10px] uppercase flex items-center gap-1 shrink-0 active:scale-95 transition"
                          >
                            <span>
                              {selectedOrder.status === 'Pending' ? 'Approve Prep' : selectedOrder.status === 'Preparing' ? 'Mark Cooking Done' : 'Complete Delivery'}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        )}
                        {(selectedOrder.status === 'Pending' || selectedOrder.status === 'Preparing') && (
                          <button
                            onClick={() => handleCancel(selectedOrder.id)}
                            className="bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20 p-1 px-2.5 rounded text-[10px] font-semibold"
                          >
                            {t.cancelOrder}
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedOrder.orderType === 'Delivery' && (
                      <p className="text-[9px] text-slate-500 mt-1 truncate">
                        Loc: {selectedOrder.deliveryAddress}
                      </p>
                    )}
                  </div>

                  {/* FOCUSED ORDER ITEMS LIST */}
                  <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar min-h-0">
                    <p className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase">Culinary Specifications</p>
                    
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 bg-slate-950 text-amber-400 font-mono text-xs font-bold rounded flex items-center justify-center">
                              {it.quantity}
                            </span>
                            <span className="text-xs font-bold text-slate-200">
                              {language === 'en' ? it.foodItem.name : it.foodItem.nameTa}
                            </span>
                          </div>

                          {/* Extra options list */}
                          {it.selectedExtras.length > 0 && (
                            <div className="flex items-center space-x-1 flex-wrap pl-7">
                              {it.selectedExtras.map((ex, i) => (
                                <span key={i} className="text-[8px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-medium">
                                  + {ex}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Remarks */}
                          {it.notes && (
                            <p className="text-[9px] text-slate-500 italic pl-7 font-mono">
                              Chef Note: "{it.notes}"
                            </p>
                          )}
                        </div>

                        {/* Price specifications */}
                        <div className="text-right pl-3">
                          <p className="text-[10px] font-mono font-bold text-slate-300">
                            ₹{it.foodItem.price} <span className="text-[9px] text-slate-500 font-normal">ea</span>
                          </p>
                          <span className="text-[8px] uppercase tracking-wider px-1 text-slate-950 font-black rounded block mt-1 bg-amber-400 text-center">
                            🌶️ {it.spicySelection}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* LIVERY ASSIGNED STATE DETAILS */}
                    {selectedOrder.orderType === 'Delivery' && selectedOrder.riderState && (
                      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/20 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-300">⚡ COMPANION DISPATCH TRACKER</span>
                          <span className="font-mono bg-teal-500/10 text-teal-400 font-bold px-1.5 py-0.5 rounded">
                            {selectedOrder.riderState}
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden relative">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-1000" 
                            style={{ width: `${selectedOrder.riderProgress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>Store handoff ({selectedOrder.riderProgress < 40 ? 'Routing...' : 'Done'})</span>
                          <span>Delivery reach (~{selectedOrder.estimatedWaitTime} mins)</span>
                        </div>
                      </div>
                    )}

                    {/* HISTORICAL RATING INTEGRATED */}
                    {selectedOrder.rating && (
                      <div className="bg-amber-400/5 border border-amber-400/20 p-2.5 rounded-xl text-center space-y-1">
                        <div className="flex justify-center text-amber-400">
                          {Array.from({ length: selectedOrder.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <p className="text-[9px] text-slate-300 italic">"{selectedOrder.review || 'No written comment'}"</p>
                      </div>
                    )}
                  </div>

                  {/* PRICING FOOTER IN DETAIL */}
                  <div className="border-t border-slate-800 pt-3 text-[10px] space-y-1 bg-slate-950/40 p-3 rounded-xl mt-2 font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Total ordered item prices</span>
                      <span>₹{(selectedOrder.totalAmount * 0.95).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Live tax configurations (5% GST)</span>
                      <span>₹{(selectedOrder.totalAmount * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-200 border-t border-slate-800/60 pt-1">
                      <span>Live Client Payment Complete</span>
                      <span className="text-emerald-400 text-xs font-semibold">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-600">
                  <ChefHat className="w-12 h-12 stroke-1 mb-2 text-slate-700" />
                  <p className="text-xs">Select or queue any active order workspace to operate.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ANALYTICS TAB DESIGN RECHARTS */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            
            {/* Visual Bento Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Trend line */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col h-64">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Sales Volume Trend today</span>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 rounded">
                    Real-time
                  </span>
                </h4>
                <div className="flex-1 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlySaletrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" stroke="#475569" strokeWidth={0.5} />
                      <YAxis stroke="#475569" strokeWidth={0.5} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: 10 }} />
                      <Area type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Categorization bar chart */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col h-64">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category sales breakdown</h4>
                <div className="flex-1 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryShare} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#475569" strokeWidth={0.5} />
                      <YAxis stroke="#475569" strokeWidth={0.5} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: 10 }} />
                      <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]}>
                        {categoryShare.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Simulated Live conversion metrics */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Live conversion parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-950 rounded-lg">
                  <p className="text-xs text-slate-500 font-mono">CART ABANDON RATE</p>
                  <p className="text-lg font-black font-mono text-indigo-400 mt-1">11.4%</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg">
                  <p className="text-xs text-slate-500 font-mono">ORDER REPEAT VALUE</p>
                  <p className="text-lg font-black font-mono text-amber-500 mt-1">42.8%</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg">
                  <p className="text-xs text-slate-500 font-mono">TAMIL LANG TOGGLE ENTRANCE</p>
                  <p className="text-lg font-black font-mono text-theme text-emerald-400 mt-1">34.1k</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg">
                  <p className="text-xs text-slate-500 font-mono">AVG RIDER TRIP SPEED</p>
                  <p className="text-lg font-black font-mono text-purple-400 mt-1">14.6m/trip</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* INVENTORY TAB LIST */}
        {activeTab === 'inventory' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Live ingredients stock tracking</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-300">Pure Cow Ghee (நெய்)</p>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono px-1 rounded">Secure</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="font-bold text-slate-100">42 Liters</p>
                  <span className="text-[9px] text-slate-500">Last restock: Yesterday</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-300">Seeraga Samba Aged Rice (சீரக சம்பா)</p>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono px-1 rounded">Secure</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="font-bold text-slate-100">180 Kilograms</p>
                  <span className="text-[9px] text-slate-500">Last restock: 4 days ago</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-300">Fresh Alphonso Mango Extract</p>
                  <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono px-1 rounded">Low stock alert</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="font-bold text-amber-400">8.5 Liters</p>
                  <span className="text-[9px] text-slate-500">Restock ordered</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-red-500/30 p-3 rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-300">Fresh Tender Coconut payasam kernel</p>
                  <span className="text-[10px] bg-red-500/15 border border-red-500/30 text-red-500 font-mono px-1 rounded">Critical restock</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <p className="font-bold text-red-500 font-mono">1.2 Kilograms</p>
                  <span className="text-[9px] text-slate-500">Auto ordering now</span>
                </div>
              </div>

            </div>

            <div className="bg-amber-400/5 p-4 rounded-xl border border-amber-400/10 flex items-start space-x-3 text-slate-400 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p>
                DineFlow automation handles dynamic ingredient reduction! With every Masala Dosa approved, ghee is reduced and estimated automatically. Pre-integrated with Chennai local purveyors for automated replenishment logic.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
