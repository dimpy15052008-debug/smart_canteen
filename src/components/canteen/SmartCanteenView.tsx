import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CanteenMenuItem, CanteenOrder } from '../../types';
import {
  Utensils,
  Clock,
  Flame,
  Plus,
  Minus,
  ShoppingBag,
  QrCode,
  CheckCircle2,
  ChefHat,
  CreditCard,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Check,
  Search,
  Filter,
  Package,
  BarChart3,
  Users,
  Settings,
  DollarSign,
  Coffee,
  Trash2,
  Printer,
  Download,
  RefreshCw,
  Bell,
  Volume2,
  VolumeX,
  Store,
  X,
  ChevronRight,
  Calendar,
  ArrowUpRight,
  PieChart,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CanteenStudentModule } from './CanteenStudentModule';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentQty: number;
  unit: string;
  minThreshold: number;
  supplier: string;
  status: 'Healthy' | 'Low Stock' | 'Critical Out';
}

export const SmartCanteenView: React.FC = () => {
  const {
    canteenMenu,
    canteenOrders,
    createCanteenOrder,
    updateOrderStatus,
    currentRole,
    currentUser
  } = useApp();

  // Student-side states
  const [orderHistoryTab, setOrderHistoryTab] = useState<'active' | 'history'>('active');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>('11:15 AM (Morning Recess)');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'Card' | 'CampusWallet'>('UPI');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [activeTokenModalOrder, setActiveTokenModalOrder] = useState<any>(null);
  const [verifiedBillId, setVerifiedBillId] = useState<string | null>(null);

  // Staff mode toggle (or automatically if role === 'canteen')
  const [staffMode, setStaffMode] = useState<boolean>(currentRole === 'canteen');

  // Vendor Tabs
  const vendorTabs = [
    'Vendor Dashboard',
    'Incoming Orders',
    'Active Orders',
    'Food/Menu Management',
    'Order Pickup & QR Verification',
    'Payments & Earnings',
    'Inventory/Stock',
    'Reports & Analytics',
    'Customer/Student Orders',
    'Vendor Profile & Settings'
  ];
  const [activeVendorTab, setActiveVendorTab] = useState<string>(vendorTabs[0]);

  // Global Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Vendor Menu State (can be modified by vendor)
  // ── Shared menu key (student module reads from this) ──────────────────────
  const SHARED_MENU_KEY = 'canteen_shared_menu_v1';

  const [vendorMenuItems, setVendorMenuItems] = useState<CanteenMenuItem[]>(() => {
    try {
      const stored = localStorage.getItem(SHARED_MENU_KEY);
      if (stored) return JSON.parse(stored) as CanteenMenuItem[];
    } catch { /* ignore */ }
    // First run: persist the canteenMenu as seed data
    try {
      localStorage.setItem(SHARED_MENU_KEY, JSON.stringify(canteenMenu));
    } catch { /* ignore */ }
    return canteenMenu;
  });
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('All');

  // ── Persist vendor menu to localStorage whenever it changes ───────────────
  useEffect(() => {
    try {
      localStorage.setItem(SHARED_MENU_KEY, JSON.stringify(vendorMenuItems));
      // Notify student module
      window.dispatchEvent(new Event('canteen_menu_changed'));
    } catch { /* ignore */ }
  }, [vendorMenuItems]); // eslint-disable-line react-hooks/exhaustive-deps
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [newDishForm, setNewDishForm] = useState({
    name: '',
    category: 'Snacks & Bites' as CanteenMenuItem['category'],
    price: 60,
    prepTimeMinutes: 8,
    isVeg: true,
    calories: 320,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
    description: ''
  });

  // Vendor Inventory State
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([
    { id: 'inv-1', name: 'Fresh Paneer Blocks', category: 'Dairy', currentQty: 18, unit: 'kg', minThreshold: 10, supplier: 'Amul Dairy Campus Logistics', status: 'Healthy' },
    { id: 'inv-2', name: 'Multigrain Sandwich Bread', category: 'Bakery', currentQty: 4, unit: 'packs', minThreshold: 8, supplier: 'Bonn Campus Bakery', status: 'Low Stock' },
    { id: 'inv-3', name: 'Processed Cheese Slices', category: 'Dairy', currentQty: 24, unit: 'packs', minThreshold: 12, supplier: 'Britannia Foods', status: 'Healthy' },
    { id: 'inv-4', name: 'Aromatic Basmati Rice', category: 'Grains', currentQty: 45, unit: 'kg', minThreshold: 20, supplier: 'Fortune Campus Supply', status: 'Healthy' },
    { id: 'inv-5', name: 'South Roast Coffee Beans', category: 'Beverages', currentQty: 2, unit: 'kg', minThreshold: 5, supplier: 'Nescafe Roast Depot', status: 'Low Stock' },
    { id: 'inv-6', name: 'Full Cream Milk Cans', category: 'Dairy', currentQty: 32, unit: 'liters', minThreshold: 15, supplier: 'Mother Dairy Direct', status: 'Healthy' },
    { id: 'inv-7', name: 'Biodegradable Meal Trays', category: 'Packaging', currentQty: 140, unit: 'units', minThreshold: 100, supplier: 'EcoPack India Ltd', status: 'Healthy' },
    { id: 'inv-8', name: 'Cold-Pressed Cooking Oil', category: 'Oils', currentQty: 12, unit: 'liters', minThreshold: 8, supplier: 'Dhara Agro Depot', status: 'Healthy' },
    { id: 'inv-9', name: 'Fresh Mosambi (Sweet Lime)', category: 'Produce', currentQty: 3, unit: 'crates', minThreshold: 4, supplier: 'Campus Mandi Supplier', status: 'Low Stock' },
    { id: 'inv-10', name: 'Compostable Wooden Cutlery', category: 'Packaging', currentQty: 350, unit: 'sets', minThreshold: 150, supplier: 'GreenCampus Ware', status: 'Healthy' }
  ]);
  const [inventoryFilter, setInventoryFilter] = useState<'All' | 'Low Stock'>('All');
  const [inventorySearch, setInventorySearch] = useState('');
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [newInventoryForm, setNewInventoryForm] = useState({
    name: '',
    category: 'Dairy',
    currentQty: 10,
    unit: 'kg',
    minThreshold: 5,
    supplier: 'Campus Wholesale Supplier'
  });

  // Recent QR Pickups Log
  const [recentPickups, setRecentPickups] = useState<Array<{ tokenNumber: string; studentName: string; time: string; amount: number }>>([
    { tokenNumber: 'A-101', studentName: 'Rohan Verma', time: '10:38 AM', amount: 130 }
  ]);
  const [qrTokenSearch, setQrTokenSearch] = useState('');

  // Quick Walk-in Counter Order Modal
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInItem, setWalkInItem] = useState(canteenMenu[0]?.id || 'm1');
  const [walkInQty, setWalkInQty] = useState(1);
  const [walkInPayment, setWalkInPayment] = useState<'UPI' | 'Card' | 'CampusWallet'>('UPI');
  const [walkInStudentName, setWalkInStudentName] = useState('Counter Walk-in Student');

  // Customer Orders State
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'preparing' | 'ready' | 'completed'>('all');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<CanteenOrder | null>(null);

  // Analytics Filter
  const [analyticsRange, setAnalyticsRange] = useState<'Today' | 'Last 7 Days' | 'This Month'>('Today');

  // Vendor Profile & Settings
  const [vendorProfile, setVendorProfile] = useState({
    stallName: 'Campus Central Food Court - Stall 01',
    vendorName: 'Chef Rajesh Sharma (Senior Caterer)',
    phone: '+91 98260 11234',
    upiId: 'smartuni.canteen1@okhdfcbank',
    operatingHours: '08:00 AM - 07:30 PM',
    counterNumber: 'Counter 1 & 2',
    stallOpen: true,
    audioAlerts: true,
    autoAcceptOffPeak: true,
    maxConcurrentOrders: 25,
    inventoryPushAlerts: true
  });
  const [profileSavedFeedback, setProfileSavedFeedback] = useState(false);

  // Settlement Simulation Modal
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [settlementSuccess, setSettlementSuccess] = useState(false);

  // Categories for student side
  const categories = ['All', 'Breakfast', 'Lunch & Meals', 'Snacks & Bites', 'Healthy Bowls', 'Beverages'];

  const filteredMenu = activeCategory === 'All'
    ? canteenMenu
    : canteenMenu.filter(m => m.category === activeCategory);

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartTotalAmount = Object.entries(cart).reduce((total, [itemId, qty]) => {
    const item = canteenMenu.find(m => m.id === itemId);
    return total + (item ? item.price * qty : 0);
  }, 0);

  const addToCart = (itemId: string) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[itemId] > 1) {
        next[itemId] -= 1;
      } else {
        delete next[itemId];
      }
      return next;
    });
  };

  const handlePlaceOrder = () => {
    const items = Object.entries(cart).map(([itemId, qty]) => {
      const item = canteenMenu.find(m => m.id === itemId)!;
      return {
        itemId,
        name: item.name,
        price: item.price,
        quantity: qty,
      };
    });

    const newOrder = createCanteenOrder(items, selectedPickupTime, selectedPaymentMethod);
    setCart({});
    setIsCheckoutModalOpen(false);
    setActiveTokenModalOrder(newOrder);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1'],
      });
    } catch (e) {
      // ignore
    }
  };

  // Kitchen queue metrics
  const activeOrders = canteenOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const estimatedKitchenWaitMinutes = Math.min(25, Math.max(8, activeOrders.length * 4));

  // Vendor metrics calculations
  const completedOrdersList = canteenOrders.filter(o => o.status === 'completed');
  const totalTodayRevenue = canteenOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, ord) => sum + ord.totalAmount, 0) + 12400; // Base baseline for realistic display
  const pendingPrepCount = canteenOrders.filter(o => o.status === 'preparing').length;
  const newIncomingCount = canteenOrders.filter(o => o.status === 'new').length;
  const readyPickupCount = canteenOrders.filter(o => o.status === 'ready').length;

  // Inventory adjustment handlers
  const handleAdjustInventory = (id: string, delta: number) => {
    setInventoryList(prev =>
      prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.currentQty + delta);
          const newStatus =
            newQty === 0
              ? 'Critical Out'
              : newQty <= item.minThreshold
              ? 'Low Stock'
              : 'Healthy';
          return { ...item, currentQty: newQty, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleAutoRestock = () => {
    setInventoryList(prev =>
      prev.map(item => ({
        ...item,
        currentQty: Math.max(item.currentQty, item.minThreshold * 2),
        status: 'Healthy'
      }))
    );
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 }, colors: ['#10b981', '#3b82f6'] });
    } catch (e) {}
    showToast('Auto-restock order submitted to Campus Central Warehouse. Stock levels refreshed!');
  };

  // Walk-in order generator
  const handleCreateWalkInOrder = () => {
    const selectedItem = canteenMenu.find(m => m.id === walkInItem) || canteenMenu[0];
    if (!selectedItem) return;

    createCanteenOrder(
      [{ itemId: selectedItem.id, name: selectedItem.name, price: selectedItem.price, quantity: walkInQty }],
      'Immediate Counter Collection',
      walkInPayment
    );

    setIsWalkInModalOpen(false);
    showToast(`Walk-in order for ${walkInStudentName} generated successfully!`);
    try {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    } catch (e) {}
  };

  // QR Confirmation Delivery Handler
  const handleConfirmQrDelivery = (order: CanteenOrder) => {
    updateOrderStatus(order.id, 'completed');
    setRecentPickups(prev => [
      {
        tokenNumber: order.tokenNumber,
        studentName: order.studentName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: order.totalAmount
      },
      ...prev.slice(0, 4)
    ]);
    setActiveTokenModalOrder(null);
    try {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#f59e0b', '#3b82f6'] });
    } catch (e) {}
    showToast(`Order Token #${order.tokenNumber} verified & food handed over!`);
  };

  // CSV Statement Downloader
  const handleDownloadCsv = () => {
    const headers = ['Order ID,Token Number,Student Name,Items Count,Total (INR),Payment Method,Status,Order Time'];
    const rows = canteenOrders.map(
      o => `${o.id},${o.tokenNumber},"${o.studentName}",${o.items.length},${o.totalAmount},${o.paymentMethod},${o.status},${o.orderTime}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartUni_Canteen_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Settlement ledger exported to CSV file.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-amber-500/40 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAFF / VENDOR BOARD */}
      {staffMode ? (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Vendor Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-2 h-fit">
            <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-800 mb-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Vendor Services
              </h2>
              <span className={`w-2 h-2 rounded-full ${vendorProfile.stallOpen ? 'bg-emerald-400' : 'bg-rose-500'}`} title={vendorProfile.stallOpen ? 'Counter Live' : 'Counter Paused'} />
            </div>

            {vendorTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveVendorTab(tab)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  activeVendorTab === tab
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {tab === 'Vendor Dashboard' && <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />}
                  {tab === 'Incoming Orders' && <Bell className="w-4 h-4 text-sky-400 shrink-0" />}
                  {tab === 'Active Orders' && <ChefHat className="w-4 h-4 text-amber-400 shrink-0" />}
                  {tab === 'Food/Menu Management' && <Utensils className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {tab === 'Order Pickup & QR Verification' && <QrCode className="w-4 h-4 text-indigo-400 shrink-0" />}
                  {tab === 'Payments & Earnings' && <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {tab === 'Inventory/Stock' && <Package className="w-4 h-4 text-amber-400 shrink-0" />}
                  {tab === 'Reports & Analytics' && <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />}
                  {tab === 'Customer/Student Orders' && <Users className="w-4 h-4 text-blue-400 shrink-0" />}
                  {tab === 'Vendor Profile & Settings' && <Settings className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">{tab}</span>
                </div>

                {tab === 'Incoming Orders' && newIncomingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-sky-500 text-slate-950">
                    {newIncomingCount}
                  </span>
                )}
                {tab === 'Active Orders' && (pendingPrepCount + readyPickupCount) > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {pendingPrepCount + readyPickupCount}
                  </span>
                )}
                {tab === 'Inventory/Stock' && inventoryList.some(i => i.status !== 'Healthy') && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            ))}

            {/* Quick Status Bar */}
            <div className="pt-4 border-t border-slate-800/80 px-2 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Stall Status:</span>
                <span className={`font-bold ${vendorProfile.stallOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {vendorProfile.stallOpen ? '● Accepting' : '● Paused'}
                </span>
              </div>
              <button
                onClick={() => setIsWalkInModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                + Walk-in Quick Token
              </button>
            </div>
          </div>

          {/* Vendor Main Content Area */}
          <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl min-h-[560px]">
            
            {/* 1. VENDOR DASHBOARD */}
            {activeVendorTab === 'Vendor Dashboard' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                      Vendor Operational Overview
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live counter performance, queue velocity, and today's financial summary.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsWalkInModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Walk-in Token
                    </button>
                    <button
                      onClick={() => {
                        showToast('🔔 Chime tested: Kitchen sound alert active.');
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Test Audio Chime"
                    >
                      <Volume2 className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Today's Revenue</p>
                    <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">₹{totalTodayRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> +14.2% vs yesterday
                    </p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Total Orders Today</p>
                    <p className="text-2xl font-extrabold text-white font-mono mt-1">{canteenOrders.length + 42}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{completedOrdersList.length} collected • {activeOrders.length} in queue</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Avg. Prep Turnaround</p>
                    <p className="text-2xl font-extrabold text-sky-400 font-mono mt-1">7.8 min</p>
                    <p className="text-[10px] text-sky-300 mt-1">SLA Target: &lt; 10 min</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Customer Rating</p>
                    <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">4.9 ★</p>
                    <p className="text-[10px] text-emerald-300 mt-1">182 student ratings</p>
                  </div>
                </div>

                {/* Live Kitchen Status Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Incoming New Orders Card */}
                  <div className="bg-slate-950/60 border border-sky-500/20 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-sky-400 uppercase">Incoming Awaiting Prep</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-800 font-mono">
                          {newIncomingCount}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {canteenOrders.filter(o => o.status === 'new').slice(0, 3).map(order => (
                          <div key={order.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-amber-300 font-mono">Token #{order.tokenNumber}</p>
                              <p className="text-slate-300 text-[11px]">{order.studentName}</p>
                            </div>
                            <button
                              onClick={() => {
                                updateOrderStatus(order.id, 'preparing');
                                showToast(`Order Token #${order.tokenNumber} moved to Kitchen Prep.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px]"
                            >
                              Start Prep →
                            </button>
                          </div>
                        ))}
                        {newIncomingCount === 0 && (
                          <p className="text-xs text-slate-500 text-center py-6">No new incoming orders right now.</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveVendorTab('Incoming Orders')}
                      className="mt-3 text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 justify-center"
                    >
                      View All Incoming Orders <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ready for Pickup Card */}
                  <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-emerald-400 uppercase">Ready at Counter</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono">
                          {readyPickupCount}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {canteenOrders.filter(o => o.status === 'ready').slice(0, 3).map(order => (
                          <div key={order.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-emerald-400 font-mono">Token #{order.tokenNumber}</p>
                              <p className="text-slate-300 text-[11px]">{order.studentName}</p>
                            </div>
                            <button
                              onClick={() => {
                                setActiveVendorTab('Order Pickup & QR Verification');
                                setActiveTokenModalOrder(order);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1"
                            >
                              <QrCode className="w-3 h-3" />
                              Verify QR
                            </button>
                          </div>
                        ))}
                        {readyPickupCount === 0 && (
                          <p className="text-xs text-slate-500 text-center py-6">No orders waiting at counter.</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveVendorTab('Order Pickup & QR Verification')}
                      className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 justify-center"
                    >
                      Go to QR Pickup Terminal <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quick Inventory Health Card */}
                  <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <span className="text-xs font-bold text-amber-400 uppercase">Stock & Supplies Alert</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800 font-mono">
                          {inventoryList.filter(i => i.status !== 'Healthy').length} Needs Attention
                        </span>
                      </div>
                      <div className="space-y-2">
                        {inventoryList.filter(i => i.status !== 'Healthy').slice(0, 3).map(item => (
                          <div key={item.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-200 text-[11px]">{item.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 font-mono text-[10px] font-bold">
                              {item.currentQty} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveVendorTab('Inventory/Stock')}
                      className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 justify-center"
                    >
                      Manage Kitchen Inventory <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Top Selling Items Table */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Top Selling Menu Items Today</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Paneer Butter Masala Thali', sold: 58, revenue: 7540, badge: '🥇 Top Seller' },
                      { name: 'South Indian Masala Dosa', sold: 46, revenue: 2990, badge: '🥈 High Demand' },
                      { name: 'Iced Hazelnut Cold Coffee', sold: 39, revenue: 2145, badge: '🥉 Student Fav' }
                    ].map((fav, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono text-amber-400 font-bold">{fav.badge}</p>
                          <p className="text-xs font-bold text-white mt-0.5">{fav.name}</p>
                          <p className="text-[11px] text-slate-400">{fav.sold} units sold</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-400 font-mono">₹{fav.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. INCOMING ORDERS */}
            {activeVendorTab === 'Incoming Orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-sky-400" />
                      Incoming Pre-Orders
                    </h2>
                    <p className="text-xs text-slate-400">
                      New orders placed by students via app or web awaiting vendor acceptance.
                    </p>
                  </div>
                  {newIncomingCount > 0 && (
                    <button
                      onClick={() => {
                        canteenOrders.filter(o => o.status === 'new').forEach(o => updateOrderStatus(o.id, 'preparing'));
                        showToast(`All ${newIncomingCount} incoming orders accepted and queued for prep!`);
                        try {
                          confetti({ particleCount: 40, spread: 50 });
                        } catch (e) {}
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept All Incoming ({newIncomingCount})
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {canteenOrders.filter(o => o.status === 'new').map(order => (
                    <div key={order.id} className="bg-slate-950/80 border border-sky-500/30 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="text-sm font-bold text-amber-400 font-mono">TOKEN #{order.tokenNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono font-bold border border-sky-500/30">
                            NEW ORDER
                          </span>
                        </div>

                        <div className="mt-2 text-xs space-y-1">
                          <p className="font-semibold text-white">{order.studentName}</p>
                          <p className="text-[11px] text-slate-400">Pickup Slot: <span className="text-amber-300 font-medium">{order.pickupTime}</span></p>
                          <p className="text-[11px] text-slate-400">Payment: <span className="text-emerald-400 font-bold">{order.paymentMethod} (PAID)</span></p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1.5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-slate-300">
                              <span>{it.quantity}x {it.name}</span>
                              <span className="text-slate-400 font-mono">₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-slate-800">
                            <span>Total Bill:</span>
                            <span className="text-amber-400 font-mono">₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'preparing');
                            showToast(`Token #${order.tokenNumber} accepted. Kitchen preparation started!`);
                          }}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          Accept & Start Prep
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => showToast(`Added +5 minutes prep buffer to Token #${order.tokenNumber}. Student notified.`)}
                            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                          >
                            +5m Buffer
                          </button>
                          <button
                            onClick={() => {
                              updateOrderStatus(order.id, 'cancelled');
                              showToast(`Token #${order.tokenNumber} rejected and refunded to student wallet.`);
                            }}
                            className="py-1.5 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-[11px] font-semibold transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {newIncomingCount === 0 && (
                    <div className="col-span-full py-16 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
                      <Bell className="w-10 h-10 text-slate-700 mx-auto" />
                      <p className="text-sm text-slate-400 font-medium">No incoming orders waiting for approval.</p>
                      <p className="text-xs text-slate-500">New orders will ring with sound chime automatically.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. ACTIVE ORDERS */}
            {activeVendorTab === 'Active Orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-amber-400" />
                      Kitchen Workstation & Active Prep
                    </h2>
                    <p className="text-xs text-slate-400">
                      Monitor ongoing kitchen ticket assembly and advance to counter pickup ready state.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 bg-amber-950/60 text-amber-300 rounded-full border border-amber-800/40">
                    Active: {activeOrders.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Preparing in Kitchen */}
                  <div className="bg-slate-950/60 border border-amber-500/30 rounded-2xl p-4 flex flex-col min-h-[440px]">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-500/30">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        In Kitchen Prep ({pendingPrepCount})
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {canteenOrders.filter(o => o.status === 'preparing').map(order => (
                        <div key={order.id} className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 space-y-2.5 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-amber-400 font-mono">TOKEN #{order.tokenNumber}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{order.orderTime}</span>
                          </div>
                          <div className="text-xs">
                            <p className="font-semibold text-white">{order.studentName}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Target Pickup: {order.pickupTime}</p>
                          </div>
                          <div className="border-t border-slate-800 pt-2 space-y-1 text-xs">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-slate-300">
                                <span>{it.quantity}x {it.name}</span>
                                <span className="text-slate-400 font-mono">₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-slate-800">
                            <button
                              onClick={() => {
                                updateOrderStatus(order.id, 'ready');
                                showToast(`Token #${order.tokenNumber} is now marked READY FOR PICKUP at Counter!`);
                              }}
                              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mark Ready for Counter
                            </button>
                          </div>
                        </div>
                      ))}
                      {pendingPrepCount === 0 && (
                        <div className="text-center py-16 text-slate-500 text-xs">No orders currently cooking.</div>
                      )}
                    </div>
                  </div>

                  {/* Ready for Counter Collection */}
                  <div className="bg-slate-950/60 border border-emerald-500/30 rounded-2xl p-4 flex flex-col min-h-[440px]">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/30">
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready at Counter ({readyPickupCount})
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {canteenOrders.filter(o => o.status === 'ready').map(order => (
                        <div key={order.id} className="bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl p-3.5 space-y-2.5 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-emerald-400 font-mono">TOKEN #{order.tokenNumber}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono">Ready</span>
                          </div>
                          <div className="text-xs">
                            <p className="font-semibold text-white">{order.studentName}</p>
                            <p className="text-[11px] text-slate-400">Total: ₹{order.totalAmount} • {order.items.length} items</p>
                          </div>
                          <div className="pt-2 border-t border-slate-800 flex gap-2">
                            <button
                              onClick={() => {
                                setActiveVendorTab('Order Pickup & QR Verification');
                                setActiveTokenModalOrder(order);
                              }}
                              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              Verify QR Pickup
                            </button>
                            <button
                              onClick={() => handleConfirmQrDelivery(order)}
                              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                              title="Direct Hand Over"
                            >
                              Hand Over
                            </button>
                          </div>
                        </div>
                      ))}
                      {readyPickupCount === 0 && (
                        <div className="text-center py-16 text-slate-500 text-xs">No orders waiting at pickup counter.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. FOOD / MENU MANAGEMENT */}
            {activeVendorTab === 'Food/Menu Management' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-emerald-400" />
                      Food & Menu Management
                    </h2>
                    <p className="text-xs text-slate-400">
                      Update pricing, toggle stock availability, or publish new campus specials.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddDishModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Add New Menu Item
                  </button>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search menu dishes..."
                      value={menuSearchTerm}
                      onChange={e => setMenuSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                    {['All', 'Breakfast', 'Lunch & Meals', 'Snacks & Bites', 'Healthy Bowls', 'Beverages'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setMenuFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          menuFilterCategory === cat
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dish Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendorMenuItems
                    .filter(m => menuFilterCategory === 'All' || m.category === menuFilterCategory)
                    .filter(m => m.name.toLowerCase().includes(menuSearchTerm.toLowerCase()))
                    .map(item => (
                      <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow flex flex-col justify-between">
                        <div>
                          <div className="relative h-28 w-full overflow-hidden bg-slate-900">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full border border-white ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/80 text-white">
                                {item.category}
                              </span>
                            </div>
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-950/80 text-amber-300">
                              {item.calories} kcal
                            </span>
                          </div>

                          <div className="p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xs font-bold text-white line-clamp-1">{item.name}</h3>
                              <span className="text-sm font-extrabold text-amber-400 font-mono">₹{item.price}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> ~{item.prepTimeMinutes} mins prep
                            </p>
                          </div>
                        </div>

                        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/40">
                          <button
                            onClick={() => {
                              setVendorMenuItems(prev =>
                                prev.map(i => (i.id === item.id ? { ...i, available: !i.available } : i))
                              );
                              showToast(`${item.name} marked ${!item.available ? 'AVAILABLE' : 'OUT OF STOCK'}.`);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              item.available
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {item.available ? 'In Stock' : 'Sold Out'}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                const newPrice = prompt(`Enter new price (₹) for ${item.name}:`, item.price.toString());
                                if (newPrice && !isNaN(Number(newPrice))) {
                                  setVendorMenuItems(prev =>
                                    prev.map(i => (i.id === item.id ? { ...i, price: Number(newPrice) } : i))
                                  );
                                  showToast(`Price for ${item.name} updated to ₹${newPrice}.`);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                            >
                              Edit ₹
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove ${item.name} from menu?`)) {
                                  setVendorMenuItems(prev => prev.filter(i => i.id !== item.id));
                                  showToast(`${item.name} removed from menu catalog.`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 5. ORDER PICKUP & QR VERIFICATION */}
            {activeVendorTab === 'Order Pickup & QR Verification' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-400" />
                      Order Pickup & QR Verification Counter
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Display student order QR token for collection, or simulate scanning to confirm food hand-over.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ready Orders List & Quick Search */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ready at Counter</h3>
                      <span className="text-[11px] text-emerald-400 font-mono">{readyPickupCount} Ready</span>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Filter by token (e.g. 102) or student..."
                        value={qrTokenSearch}
                        onChange={e => setQrTokenSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                      {canteenOrders
                        .filter(o => o.status === 'ready')
                        .filter(o => o.tokenNumber.toLowerCase().includes(qrTokenSearch.toLowerCase()) || o.studentName.toLowerCase().includes(qrTokenSearch.toLowerCase()))
                        .map(order => (
                          <button
                            key={order.id}
                            onClick={() => setActiveTokenModalOrder(order)}
                            className={`w-full text-left bg-slate-900 border rounded-xl p-3 transition-all ${
                              activeTokenModalOrder?.id === order.id
                                ? 'border-amber-500 bg-amber-500/10 shadow-lg ring-1 ring-amber-500/30'
                                : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold text-amber-400 font-mono">TOKEN #{order.tokenNumber}</span>
                              <span className="text-[11px] text-slate-400">{order.studentName}</span>
                            </div>
                            <div className="text-xs text-slate-300 flex justify-between">
                              <span>{order.items.length} items</span>
                              <span className="font-mono font-bold text-emerald-400">₹{order.totalAmount} (PAID)</span>
                            </div>
                          </button>
                        ))}
                      {readyPickupCount === 0 && (
                        <p className="text-xs text-slate-500 text-center py-10">No ready orders waiting for pickup.</p>
                      )}
                    </div>
                  </div>

                  {/* QR Matrix & Verification Trigger */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[360px]">
                    {activeTokenModalOrder && activeTokenModalOrder.status === 'ready' ? (
                      <div className="space-y-4 text-center w-full max-w-sm">
                        <div className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full inline-block border border-emerald-500/20">
                          Ready for Collection • Token #{activeTokenModalOrder.tokenNumber}
                        </div>

                        <div className="w-48 h-48 bg-white p-3 rounded-2xl mx-auto shadow-2xl border border-slate-200">
                          <div className="grid grid-cols-7 gap-1 w-full h-full p-1.5 bg-slate-950 rounded-xl">
                            {Array.from({ length: 49 }).map((_, i) => (
                              <div
                                key={i}
                                className={`rounded-xs ${
                                  (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 6 || i === 42 || i === 48 || i === 16 || i === 24 || i === 32
                                    ? 'bg-amber-400'
                                    : i % 5 === 0
                                    ? 'bg-white'
                                    : 'bg-slate-900'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 space-y-1">
                          <p className="font-semibold text-white">{activeTokenModalOrder.studentName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{activeTokenModalOrder.qrCodeValue}</p>
                          <p className="text-xs text-amber-300 font-mono font-bold">Total: ₹{activeTokenModalOrder.totalAmount}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-800 space-y-2">
                          <button
                            onClick={() => handleConfirmQrDelivery(activeTokenModalOrder)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Simulate Student Scan (Confirm Delivery)
                          </button>
                          <p className="text-[10px] text-slate-500">
                            Once confirmed, order is marked completed and removed from active list.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <QrCode className="w-12 h-12 text-slate-700 mx-auto" />
                        <p className="text-sm text-slate-400 font-medium">Select a ready order on the left to verify QR</p>
                        <p className="text-xs text-slate-500">The QR matrix will appear here for student scanning.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Verified Pickups */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Recently Verified Hand-Overs</h3>
                  <div className="space-y-2">
                    {recentPickups.map((pick, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-bold text-white font-mono">Token #{pick.tokenNumber}</span>
                          <span className="text-slate-400">({pick.studentName})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-mono font-semibold">₹{pick.amount}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{pick.time}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                            Delivered
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. PAYMENTS & EARNINGS */}
            {activeVendorTab === 'Payments & Earnings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      Payments & Settlement Ledger
                    </h2>
                    <p className="text-xs text-slate-400">
                      View real-time UPI and Campus Wallet collections, fee splits, and initiate direct settlements.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadCsv}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => setIsSettlementModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Request Settlement
                    </button>
                  </div>
                </div>

                {/* Financial KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Gross Volume Today</p>
                    <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">₹{totalTodayRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-1">100% cashless campus</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Campus Commission (2.5%)</p>
                    <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">₹{(totalTodayRevenue * 0.025).toFixed(0)}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Subsidized utility fee</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Net Payable to Vendor</p>
                    <p className="text-2xl font-extrabold text-white font-mono mt-1">₹{(totalTodayRevenue * 0.975).toFixed(0)}</p>
                    <p className="text-[10px] text-emerald-400 mt-1">Ready for transfer</p>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Last Settled</p>
                    <p className="text-base font-bold text-slate-200 mt-1">Yesterday, 08:30 PM</p>
                    <p className="text-[10px] text-sky-400 mt-1 font-mono">UTR: HDFC89271104</p>
                  </div>
                </div>

                {/* Payment Methods Breakdown */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Payment Gateway Distribution</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>UPI / QR (PhonePe, GPay, Paytm)</span>
                        <span className="font-mono font-bold text-amber-400">68% (₹{(totalTodayRevenue * 0.68).toFixed(0)})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Campus Smart Card & Digital Wallet</span>
                        <span className="font-mono font-bold text-sky-400">24% (₹{(totalTodayRevenue * 0.24).toFixed(0)})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full rounded-full" style={{ width: '24%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Debit / Credit Cards & POS</span>
                        <span className="font-mono font-bold text-emerald-400">8% (₹{(totalTodayRevenue * 0.08).toFixed(0)})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: '8%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Ledger */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Today's Transactions Ledger</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="pb-2">Token #</th>
                          <th className="pb-2">Student</th>
                          <th className="pb-2">Method</th>
                          <th className="pb-2">Items</th>
                          <th className="pb-2">Amount</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {canteenOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-900/50">
                            <td className="py-2.5 font-mono font-bold text-amber-400">#{order.tokenNumber}</td>
                            <td className="py-2.5">{order.studentName}</td>
                            <td className="py-2.5 font-mono text-slate-400">{order.paymentMethod}</td>
                            <td className="py-2.5 text-slate-400">{order.items.length} items</td>
                            <td className="py-2.5 font-mono font-bold text-white">₹{order.totalAmount}</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono font-bold">
                                Settled
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 7. INVENTORY / STOCK */}
            {activeVendorTab === 'Inventory/Stock' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-400" />
                      Kitchen Raw Ingredients & Stock
                    </h2>
                    <p className="text-xs text-slate-400">
                      Real-time inventory levels, re-order thresholds, and campus store replenishment.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAutoRestock}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Auto-Restock Low Items
                    </button>
                    <button
                      onClick={() => setIsAddInventoryModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      + Add Stock Item
                    </button>
                  </div>
                </div>

                {/* Inventory Filter Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search inventory items..."
                      value={inventorySearch}
                      onChange={e => setInventorySearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setInventoryFilter('All')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        inventoryFilter === 'All'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      All ({inventoryList.length})
                    </button>
                    <button
                      onClick={() => setInventoryFilter('Low Stock')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        inventoryFilter === 'Low Stock'
                          ? 'bg-rose-500 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Low Stock Alert ({inventoryList.filter(i => i.status !== 'Healthy').length})
                    </button>
                  </div>
                </div>

                {/* Inventory Items List */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-[11px] text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">Item Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Current Qty</th>
                          <th className="p-3">Threshold</th>
                          <th className="p-3">Health Status</th>
                          <th className="p-3 text-right">Quick Restock / Use</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {inventoryList
                          .filter(i => inventoryFilter === 'All' || i.status !== 'Healthy')
                          .filter(i => i.name.toLowerCase().includes(inventorySearch.toLowerCase()))
                          .map(item => (
                            <tr key={item.id} className="hover:bg-slate-900/40">
                              <td className="p-3 font-semibold text-white">
                                {item.name}
                                <p className="text-[10px] text-slate-500">{item.supplier}</p>
                              </td>
                              <td className="p-3 text-slate-400">{item.category}</td>
                              <td className="p-3 font-mono font-bold text-amber-300">
                                {item.currentQty} {item.unit}
                              </td>
                              <td className="p-3 font-mono text-slate-400">
                                {item.minThreshold} {item.unit}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${
                                    item.status === 'Healthy'
                                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                      : 'bg-rose-950/60 text-rose-300 border-rose-800 animate-pulse'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleAdjustInventory(item.id, -1)}
                                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
                                    title="Consume 1 unit"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleAdjustInventory(item.id, 5);
                                      showToast(`Added +5 ${item.unit} of ${item.name} to stock.`);
                                    }}
                                    className="px-2.5 h-7 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                                    title="Add 5 units"
                                  >
                                    <Plus className="w-3 h-3" /> 5
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 8. REPORTS & ANALYTICS */}
            {activeVendorTab === 'Reports & Analytics' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Reports & Operational Analytics
                    </h2>
                    <p className="text-xs text-slate-400">
                      Understand peak meal rush hours, category sales velocity, and queue fulfillment rates.
                    </p>
                  </div>
                  <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                    {(['Today', 'Last 7 Days', 'This Month'] as const).map(rng => (
                      <button
                        key={rng}
                        onClick={() => setAnalyticsRange(rng)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          analyticsRange === rng ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rng}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Analytics Metrics Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Fulfillment Rate</p>
                    <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">98.6%</p>
                    <p className="text-[10px] text-slate-400 mt-1">Only 2 cancellations</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Peak Rush Window</p>
                    <p className="text-lg font-bold text-amber-300 mt-1">11:15 AM - 01:30 PM</p>
                    <p className="text-[10px] text-slate-400 mt-1">Morning recess & lunch</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Food Wastage Ratio</p>
                    <p className="text-2xl font-extrabold text-sky-400 font-mono mt-1">0.4%</p>
                    <p className="text-[10px] text-emerald-400 mt-1">Optimal pre-order precision</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[11px] text-slate-400 font-mono">Avg Basket Value</p>
                    <p className="text-2xl font-extrabold text-white font-mono mt-1">₹142</p>
                    <p className="text-[10px] text-slate-400 mt-1">~1.8 items per order</p>
                  </div>
                </div>

                {/* Hourly Rush Demand Bar Visualizer */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Hourly Order Inflow Volume</h3>
                    <span className="text-[11px] text-amber-400 font-mono">Peak: 12:00 PM (84 orders/hr)</span>
                  </div>

                  <div className="grid grid-cols-6 gap-3 items-end h-40 pt-4">
                    {[
                      { slot: '08 - 10 AM', count: 28, height: '35%', color: 'bg-sky-500' },
                      { slot: '10 - 11 AM', count: 45, height: '55%', color: 'bg-sky-500' },
                      { slot: '11 - 12 PM', count: 76, height: '90%', color: 'bg-amber-500' },
                      { slot: '12 - 02 PM', count: 84, height: '100%', color: 'bg-amber-400' },
                      { slot: '02 - 04 PM', count: 32, height: '40%', color: 'bg-indigo-500' },
                      { slot: '04 - 06 PM', count: 52, height: '65%', color: 'bg-indigo-400' }
                    ].map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] text-slate-400 font-mono">{bar.count}</span>
                        <div className={`w-full ${bar.color} rounded-t-xl transition-all duration-500`} style={{ height: bar.height }} />
                        <span className="text-[10px] text-slate-400 text-center font-mono whitespace-nowrap">{bar.slot}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Contribution Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Category Revenue Split</h3>
                    <div className="space-y-2 text-xs">
                      {[
                        { cat: 'Lunch & Meals', percent: 46, color: 'bg-amber-400' },
                        { cat: 'Snacks & Bites', percent: 28, color: 'bg-emerald-400' },
                        { cat: 'Beverages', percent: 16, color: 'bg-sky-400' },
                        { cat: 'Breakfast & Bowls', percent: 10, color: 'bg-purple-400' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-slate-300">
                            <span>{item.cat}</span>
                            <span className="font-mono font-bold">{item.percent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.percent}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Audit & Compliance Report</h3>
                      <p className="text-xs text-slate-400">
                        Monthly university food safety inspection and digital billing compliance certificate is active.
                      </p>
                      <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                        <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" /> Grade A+ Hygiene Certification
                        </p>
                        <p className="text-slate-400">Campus Inspection Date: 18 Sept 2026</p>
                        <p className="text-slate-400">Inspected by: Prof. Dr. P. K. Saxena (Food Safety Committee)</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Monthly Kitchen Performance & Audit PDF downloaded.')}
                      className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Audit PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 9. CUSTOMER / STUDENT ORDERS */}
            {activeVendorTab === 'Customer/Student Orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      Customer & Student Orders Register
                    </h2>
                    <p className="text-xs text-slate-400">
                      Search and view student order tickets, reprint kitchen order slips, and inspect receipts.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Total Records: {canteenOrders.length}
                  </span>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by student name or token..."
                      value={orderSearchTerm}
                      onChange={e => setOrderSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {(['all', 'new', 'preparing', 'ready', 'completed'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                          orderStatusFilter === st
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Master Orders Table */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-[11px] text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">Token #</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Pickup Window</th>
                          <th className="p-3">Dishes</th>
                          <th className="p-3">Total (₹)</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {canteenOrders
                          .filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                          .filter(
                            o =>
                              o.studentName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                              o.tokenNumber.toLowerCase().includes(orderSearchTerm.toLowerCase())
                          )
                          .map(order => (
                            <tr key={order.id} className="hover:bg-slate-900/40">
                              <td className="p-3 font-mono font-bold text-amber-400">#{order.tokenNumber}</td>
                              <td className="p-3">
                                <span className="font-semibold text-white">{order.studentName}</span>
                                <p className="text-[10px] text-slate-500">{order.studentId}</p>
                              </td>
                              <td className="p-3 text-slate-300 text-[11px]">{order.pickupTime}</td>
                              <td className="p-3 text-slate-400">
                                {order.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                              </td>
                              <td className="p-3 font-mono font-bold text-white">₹{order.totalAmount}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border uppercase ${
                                    order.status === 'completed'
                                      ? 'bg-slate-900 text-slate-400 border-slate-700'
                                      : order.status === 'ready'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : order.status === 'preparing'
                                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                                      : 'bg-sky-950 text-sky-300 border-sky-800'
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setSelectedOrderDetail(order)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                                >
                                  View Slip
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 10. VENDOR PROFILE & SETTINGS */}
            {activeVendorTab === 'Vendor Profile & Settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-slate-400" />
                      Vendor Stall Profile & Hardware Preferences
                    </h2>
                    <p className="text-xs text-slate-400">
                      Configure your campus counter details, kitchen sound chimes, and automatic queue capacities.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Form */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Stall Identification</h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">Stall / Outpost Display Name</label>
                        <input
                          type="text"
                          value={vendorProfile.stallName}
                          onChange={e => setVendorProfile({ ...vendorProfile, stallName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Head Chef / In-Charge Name</label>
                        <input
                          type="text"
                          value={vendorProfile.vendorName}
                          onChange={e => setVendorProfile({ ...vendorProfile, vendorName: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">Counter Number(s)</label>
                          <input
                            type="text"
                            value={vendorProfile.counterNumber}
                            onChange={e => setVendorProfile({ ...vendorProfile, counterNumber: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Operational Hours</label>
                          <input
                            type="text"
                            value={vendorProfile.operatingHours}
                            onChange={e => setVendorProfile({ ...vendorProfile, operatingHours: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Bank Settlement UPI ID</label>
                        <input
                          type="text"
                          value={vendorProfile.upiId}
                          onChange={e => setVendorProfile({ ...vendorProfile, upiId: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Toggles */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Kitchen Rules & Automation</h3>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <p className="text-xs font-semibold text-white">Stall Active Status</p>
                            <p className="text-[11px] text-slate-400">When paused, students cannot place new pre-orders</p>
                          </div>
                          <button
                            onClick={() => setVendorProfile({ ...vendorProfile, stallOpen: !vendorProfile.stallOpen })}
                            className={`w-11 h-6 rounded-full transition-colors relative ${vendorProfile.stallOpen ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          >
                            <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${vendorProfile.stallOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <p className="text-xs font-semibold text-white">Kitchen Audio Chime on New Order</p>
                            <p className="text-[11px] text-slate-400">Rings loud bell through terminal speakers</p>
                          </div>
                          <button
                            onClick={() => setVendorProfile({ ...vendorProfile, audioAlerts: !vendorProfile.audioAlerts })}
                            className={`w-11 h-6 rounded-full transition-colors relative ${vendorProfile.audioAlerts ? 'bg-amber-500' : 'bg-slate-700'}`}
                          >
                            <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${vendorProfile.audioAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <p className="text-xs font-semibold text-white">Low Inventory Push Warnings</p>
                            <p className="text-[11px] text-slate-400">Alerts kitchen manager when ingredients fall below threshold</p>
                          </div>
                          <button
                            onClick={() => setVendorProfile({ ...vendorProfile, inventoryPushAlerts: !vendorProfile.inventoryPushAlerts })}
                            className={`w-11 h-6 rounded-full transition-colors relative ${vendorProfile.inventoryPushAlerts ? 'bg-amber-500' : 'bg-slate-700'}`}
                          >
                            <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${vendorProfile.inventoryPushAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setProfileSavedFeedback(true);
                        showToast('Vendor Profile & Hardware preferences updated successfully!');
                        setTimeout(() => setProfileSavedFeedback(false), 3000);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {profileSavedFeedback ? <Check className="w-4 h-4 text-white" /> : <Settings className="w-4 h-4" />}
                      {profileSavedFeedback ? 'Preferences Saved ✓' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* STUDENT CANTEEN MODULE */
        <CanteenStudentModule />
      )}

      {/* QUICK WALK-IN ORDER MODAL (FOR COUNTER STAFF) */}
      <AnimatePresence>
        {isWalkInModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Generate Walk-in Token</h3>
                </div>
                <button onClick={() => setIsWalkInModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Customer / Student Reference</label>
                  <input
                    type="text"
                    value={walkInStudentName}
                    onChange={e => setWalkInStudentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Select Menu Dish</label>
                  <select
                    value={walkInItem}
                    onChange={e => setWalkInItem(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {canteenMenu.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} - ₹{m.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={walkInQty}
                      onChange={e => setWalkInQty(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Payment Tender</label>
                    <select
                      value={walkInPayment}
                      onChange={e => setWalkInPayment(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="UPI">UPI / QR (Counter)</option>
                      <option value="CampusWallet">Campus Smart Card</option>
                      <option value="Card">Debit / Cash</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Tender Due:</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">
                    ₹{((canteenMenu.find(m => m.id === walkInItem)?.price || 0) * walkInQty)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWalkInOrder}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print & Queue Token
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW DISH MODAL */}
      <AnimatePresence>
        {isAddDishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Add New Dish to Menu</h3>
                </div>
                <button onClick={() => setIsAddDishModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Dish Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Masala Pav Bhaji Platter"
                    value={newDishForm.name}
                    onChange={e => setNewDishForm({ ...newDishForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Category</label>
                    <select
                      value={newDishForm.category}
                      onChange={e => setNewDishForm({ ...newDishForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option>Breakfast</option>
                      <option>Lunch & Meals</option>
                      <option>Snacks & Bites</option>
                      <option>Healthy Bowls</option>
                      <option>Beverages</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={newDishForm.price}
                      onChange={e => setNewDishForm({ ...newDishForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Est. Prep Time (mins)</label>
                    <input
                      type="number"
                      value={newDishForm.prepTimeMinutes}
                      onChange={e => setNewDishForm({ ...newDishForm, prepTimeMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Dietary Type</label>
                    <select
                      value={newDishForm.isVeg ? 'veg' : 'nonveg'}
                      onChange={e => setNewDishForm({ ...newDishForm, isVeg: e.target.value === 'veg' })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="veg">Vegetarian (Green)</option>
                      <option value="nonveg">Non-Vegetarian (Red)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Short description of ingredients..."
                    value={newDishForm.description}
                    onChange={e => setNewDishForm({ ...newDishForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setIsAddDishModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newDishForm.name) {
                      alert('Please provide a dish name');
                      return;
                    }
                    const newItem: CanteenMenuItem = {
                      id: `custom-m-${Date.now()}`,
                      name: newDishForm.name,
                      category: newDishForm.category,
                      price: newDishForm.price,
                      prepTimeMinutes: newDishForm.prepTimeMinutes,
                      isVeg: newDishForm.isVeg,
                      calories: newDishForm.calories,
                      image: newDishForm.image,
                      available: true,
                      description: newDishForm.description || 'Freshly made in campus food court.',
                      rating: 5.0
                    };
                    setVendorMenuItems(prev => [newItem, ...prev]);
                    setIsAddDishModalOpen(false);
                    showToast(`${newItem.name} added to canteen menu!`);
                    try {
                      confetti({ particleCount: 30, spread: 40 });
                    } catch (e) {}
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold transition-all shadow-md"
                >
                  Publish to Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW INVENTORY ITEM MODAL */}
      <AnimatePresence>
        {isAddInventoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Add Inventory Stock Item</h3>
                </div>
                <button onClick={() => setIsAddInventoryModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Item / Ingredient Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tomato Puree Cans"
                    value={newInventoryForm.name}
                    onChange={e => setNewInventoryForm({ ...newInventoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Canned Goods"
                      value={newInventoryForm.category}
                      onChange={e => setNewInventoryForm({ ...newInventoryForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Unit</label>
                    <input
                      type="text"
                      placeholder="kg, liters, packs"
                      value={newInventoryForm.unit}
                      onChange={e => setNewInventoryForm({ ...newInventoryForm, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Starting Quantity</label>
                    <input
                      type="number"
                      value={newInventoryForm.currentQty}
                      onChange={e => setNewInventoryForm({ ...newInventoryForm, currentQty: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Min Threshold</label>
                    <input
                      type="number"
                      value={newInventoryForm.minThreshold}
                      onChange={e => setNewInventoryForm({ ...newInventoryForm, minThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setIsAddInventoryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newInventoryForm.name) return;
                    const item: InventoryItem = {
                      id: `inv-${Date.now()}`,
                      name: newInventoryForm.name,
                      category: newInventoryForm.category,
                      currentQty: newInventoryForm.currentQty,
                      unit: newInventoryForm.unit,
                      minThreshold: newInventoryForm.minThreshold,
                      supplier: newInventoryForm.supplier,
                      status: newInventoryForm.currentQty <= newInventoryForm.minThreshold ? 'Low Stock' : 'Healthy'
                    };
                    setInventoryList(prev => [...prev, item]);
                    setIsAddInventoryModalOpen(false);
                    showToast(`${item.name} added to inventory register.`);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Add Stock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SETTLEMENT REQUEST MODAL */}
      <AnimatePresence>
        {isSettlementModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Instant Bank Settlement</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Transfer today's realized earnings to vendor linked bank account via IMPS/NEFT.
                </p>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-left">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Balance:</span>
                  <span className="font-mono font-bold text-white">₹{totalTodayRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Commission Fee (2.5%):</span>
                  <span className="font-mono text-amber-400">-₹{(totalTodayRevenue * 0.025).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold pt-1 border-t border-slate-800">
                  <span>Net Payout:</span>
                  <span className="font-mono text-emerald-400 text-sm">₹{(totalTodayRevenue * 0.975).toFixed(0)}</span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">To: {vendorProfile.upiId} (HDFC Bank)</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsSettlementModalOpen(false);
                    showToast(`₹${(totalTodayRevenue * 0.975).toFixed(0)} initiated for payout to ${vendorProfile.upiId}. Ref: UTR-${Date.now().toString().slice(-8)}`);
                    try {
                      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                    } catch (e) {}
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Confirm Payout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ORDER DETAIL / KITCHEN SLIP MODAL */}
      <AnimatePresence>
        {selectedOrderDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Kitchen Order Ticket (KOT)</h3>
                </div>
                <button onClick={() => setSelectedOrderDetail(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-center pb-2 border-b border-dashed border-slate-700">
                  <p className="font-extrabold text-sm text-white">{vendorProfile.stallName}</p>
                  <p className="text-amber-400 text-base font-bold mt-1">TOKEN #{selectedOrderDetail.tokenNumber}</p>
                  <p className="text-[10px] text-slate-400">Order ID: {selectedOrderDetail.id} • {selectedOrderDetail.orderTime}</p>
                </div>

                <div className="space-y-1 text-slate-300">
                  <p><span className="text-slate-500">Student:</span> {selectedOrderDetail.studentName}</p>
                  <p><span className="text-slate-500">ID:</span> {selectedOrderDetail.studentId}</p>
                  <p><span className="text-slate-500">Pickup Slot:</span> {selectedOrderDetail.pickupTime}</p>
                  <p><span className="text-slate-500">Payment:</span> {selectedOrderDetail.paymentMethod} (PAID)</p>
                </div>

                <div className="border-t border-b border-dashed border-slate-700 py-2 space-y-1">
                  {selectedOrderDetail.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-white">
                      <span>{it.quantity}x {it.name}</span>
                      <span>₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between text-sm font-bold text-amber-400 pt-1">
                  <span>TOTAL AMOUNT:</span>
                  <span>₹{selectedOrderDetail.totalAmount}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Physical Slip
                </button>
                <button
                  onClick={() => setSelectedOrderDetail(null)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STUDENT TOKEN DETAIL / QR CODE MODAL */}
      <AnimatePresence>
        {activeTokenModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Canteen Token</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveTokenModalOrder(null);
                    setVerifiedBillId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Digital QR Code & Verification State */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Token #{activeTokenModalOrder.tokenNumber}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                    PAID & REALIZED
                  </span>
                </div>

                {/* High-Contrast QR Matrix Display */}
                <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex flex-col items-center justify-center shadow-md border border-slate-200">
                  <div className="grid grid-cols-7 gap-1 w-full h-full p-1.5 bg-slate-950 rounded-xl">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i % 2 === 0 && i % 3 === 0) ||
                          i === 0 || i === 6 || i === 42 || i === 48 ||
                          i === 16 || i === 24 || i === 32
                            ? 'bg-indigo-400'
                            : (i % 5 === 0)
                            ? 'bg-white'
                            : 'bg-slate-900'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-mono truncate max-w-[280px] mx-auto">
                  {activeTokenModalOrder.qrCodeValue}
                </p>

                {/* Verification Confirmation Badge */}
                {verifiedBillId === activeTokenModalOrder.id ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Bill & Transaction Verified by Canteen Staff</span>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => {
                      setVerifiedBillId(activeTokenModalOrder.id);
                      try {
                        confetti({
                          particleCount: 50,
                          spread: 50,
                          origin: { y: 0.6 },
                          colors: ['#6366f1', '#10b981'],
                        });
                      } catch (e) {
                        // ignore
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Student Order Bill & Transaction QR</span>
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setActiveTokenModalOrder(null);
                  setVerifiedBillId(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                Close Bill View
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
