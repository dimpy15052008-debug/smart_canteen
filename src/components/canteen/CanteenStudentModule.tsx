import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Clock, Plus, Minus, ShoppingBag, QrCode,
  CheckCircle2, CreditCard, ArrowRight, Sparkles,
  X, Calendar, Wallet, History, Home, AlertCircle,
  RefreshCw, ShieldCheck, ChefHat, Package,
  Scan
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Types ────────────────────────────────────────────────────────────────────

// Vendor category → student display category mapping
type FoodCategory = 'Breakfast' | 'Snacks' | 'Fast Food' | 'Main Course' | 'Beverages' | 'Lunch & Meals' | 'Snacks & Bites' | 'Healthy Bowls';

// Unified menu item that works with both local items and vendor CanteenMenuItem
interface MenuItem {
  id: string;
  name: string;
  category: string; // accepts both FoodCategory and vendor categories
  price: number;
  emoji: string;
  image?: string;
  description?: string;
  isVeg?: boolean;
  available?: boolean; // vendor availability flag
}

type OrderStatus = 'Confirmed' | 'Preparing' | 'Ready' | 'Cancelled';
type CancelType = 'shared_refund' | 'single_charge' | null;

interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CanteenOrderRecord {
  id: string;
  orderId: string;
  paymentId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'UPI' | 'Wallet';
  paymentStatus: 'Paid' | 'Pending';
  orderStatus: OrderStatus;
  cancelType: CancelType;
  walletAdjustment: number;
  dateTime: string;
  createdAt: number;
  pickupTime?: string;
  refundStatus?: 'Pending' | 'Processed' | null;
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  date: string;
  createdAt: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'm-1',
    name: 'Poha',
    category: 'Breakfast',
    price: 30,
    emoji: '🥘',
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=500&auto=format&fit=crop&q=80',
    description: 'Steamed flattened rice tempered with mustard seeds, curry leaves, onions & peanuts.',
    isVeg: true
  },
  {
    id: 'm-2',
    name: 'Aloo Paratha',
    category: 'Breakfast',
    price: 40,
    emoji: '🫓',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80',
    description: 'Golden shallow fried whole wheat flatbread stuffed with spiced potato filling.',
    isVeg: true
  },
  {
    id: 'm-vendor-2',
    name: 'Protein Quinoa & Sprout Bowl',
    category: 'Breakfast',
    price: 90,
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    description: 'Nutrient-packed salad bowl with organic sprouts, boiled quinoa & fresh greens.',
    isVeg: true
  },
  {
    id: 'm-3',
    name: 'Samosa',
    category: 'Snacks',
    price: 15,
    emoji: '🔺',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy flaky crust pastry filled with spiced potatoes and peas, served with chutneys.',
    isVeg: true
  },
  {
    id: 'm-4',
    name: 'Grilled Veg Sandwich',
    category: 'Snacks',
    price: 50,
    emoji: '🥪',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
    description: 'Toasted multigrain bread layered with cucumber, tomato, cheese and fresh mint chutney.',
    isVeg: true
  },
  {
    id: 'm-5',
    name: 'Maggi Noodles',
    category: 'Snacks',
    price: 40,
    emoji: '🍜',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
    description: 'Classic spicy 2-minute campus noodles cooked with sweet corn, onions and capsicum.',
    isVeg: true
  },
  {
    id: 'm-6',
    name: 'Veg Momos',
    category: 'Fast Food',
    price: 60,
    emoji: '🥟',
    image: 'https://images.unsplash.com/photo-1625242664057-04d8c8382352?w=500&auto=format&fit=crop&q=80',
    description: 'Steamed Himalayan dumplings stuffed with seasoned vegetables, served with red chili dip.',
    isVeg: true
  },
  {
    id: 'm-7',
    name: 'Paneer Kathi Roll',
    category: 'Fast Food',
    price: 70,
    emoji: '🌯',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
    description: 'Flaky paratha rolled with grilled spiced paneer chunks, crisp bell peppers & spicy mayo.',
    isVeg: true
  },
  {
    id: 'm-8',
    name: 'South Indian Masala Dosa',
    category: 'Fast Food',
    price: 50,
    emoji: '🥞',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy crepe stuffed with mashed potato masala, served with sambar & coconut chutney.',
    isVeg: true
  },
  {
    id: 'm-9',
    name: 'Veg Dum Biryani',
    category: 'Main Course',
    price: 90,
    emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    description: 'Slow-cooked aromatic basmati rice layered with vegetables, saffron and fried onions.',
    isVeg: true
  },
  {
    id: 'm-vendor-1',
    name: 'Paneer Butter Masala Thali',
    category: 'Main Course',
    price: 130,
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    description: 'Rich paneer butter masala served with 3 rotis, jeera rice, salad & sweet gulab jamun.',
    isVeg: true
  },
  {
    id: 'm-10',
    name: 'Chole Bhature',
    category: 'Main Course',
    price: 80,
    emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=80',
    description: 'Authentic spiced chickpea curry served with two hot fluffy fried bhaturas and pickles.',
    isVeg: true
  },
  {
    id: 'm-11',
    name: 'Dal Rice Combo',
    category: 'Main Course',
    price: 70,
    emoji: '🍚',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    description: 'Comforting homestyle yellow tadka dal with steamed jeera rice, roasted papad & pickle.',
    isVeg: true
  },
  {
    id: 'm-12',
    name: 'Special Masala Chai',
    category: 'Beverages',
    price: 15,
    emoji: '🍵',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    description: 'Hot brewed campus tea boiled with fresh ginger, crushed cardamom & creamy milk.',
    isVeg: true
  },
  {
    id: 'm-13',
    name: 'Filter Coffee',
    category: 'Beverages',
    price: 25,
    emoji: '☕',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh decoction brewed South Indian filter coffee with frothy hot milk.',
    isVeg: true
  },
  {
    id: 'm-14',
    name: 'Iced Cold Coffee',
    category: 'Beverages',
    price: 50,
    emoji: '🧋',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
    description: 'Chilled blended thick coffee topped with chocolate syrup and cocoa powder.',
    isVeg: true
  },
  {
    id: 'm-15',
    name: 'Fresh Lime Soda / Juice',
    category: 'Beverages',
    price: 30,
    emoji: '🍋',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
    description: 'Refreshing sweet & salty freshly squeezed lime soda with mint leaves.',
    isVeg: true
  },
];

// All unique categories from both local and vendor menus for the filter bar
const ALL_DISPLAY_CATEGORIES = [
  'All',
  'Breakfast',
  'Snacks & Bites',
  'Snacks',
  'Fast Food',
  'Lunch & Meals',
  'Main Course',
  'Healthy Bowls',
  'Beverages',
] as const;

// ─── Shared Menu Sync (vendor → student) ──────────────────────────────────────

/** Key shared with SmartCanteenView.tsx (vendor portal) */
const SHARED_MENU_KEY = 'canteen_shared_menu_v1';

/** Best-effort emoji for vendor categories */
const CATEGORY_EMOJI: Record<string, string> = {
  'Breakfast': '🍳',
  'Lunch & Meals': '🍛',
  'Snacks & Bites': '🥪',
  'Healthy Bowls': '🥗',
  'Beverages': '☕',
  'Snacks': '🥨',
  'Fast Food': '🍔',
  'Main Course': '🍲',
};

/** Convert a raw vendor/shared menu item into the local MenuItem shape */
function toMenuItem(v: Record<string, unknown>): MenuItem {
  return {
    id: String(v.id ?? ''),
    name: String(v.name ?? 'Item'),
    category: String(v.category ?? 'Snacks & Bites'),
    price: Number(v.price ?? 0),
    emoji: CATEGORY_EMOJI[String(v.category)] ?? '🍽️',
    image: v.image as string | undefined,
    description: v.description as string | undefined,
    isVeg: v.isVeg !== false,
    available: v.available !== false,
  };
}

/**
 * Read the live menu from localStorage (written by vendor portal).
 * Falls back to MENU_ITEMS and seeds localStorage on first load.
 */
function readSharedMenu(): MenuItem[] {
  try {
    const raw = localStorage.getItem(SHARED_MENU_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(toMenuItem);
      }
    }
  } catch { /* ignore */ }

  // First boot: seed localStorage from MENU_ITEMS (mapped to CanteenMenuItem shape)
  try {
    const seed = MENU_ITEMS.map(m => ({
      id: m.id,
      name: m.name,
      category:
        m.category === 'Snacks' ? 'Snacks & Bites'
        : m.category === 'Fast Food' ? 'Snacks & Bites'
        : m.category === 'Main Course' ? 'Lunch & Meals'
        : m.category,
      price: m.price,
      prepTimeMinutes: 8,
      isVeg: m.isVeg ?? true,
      calories: 320,
      image: m.image ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80',
      available: true,
      description: m.description ?? '',
      rating: 4.5,
    }));
    localStorage.setItem(SHARED_MENU_KEY, JSON.stringify(seed));
  } catch { /* ignore */ }

  return MENU_ITEMS;
}

const SCHEDULE = [
  { meal: 'Breakfast', time: '8:00 AM – 10:30 AM', start: 8 * 60,   end: 10 * 60 + 30 },
  { meal: 'Lunch',     time: '12:00 PM – 3:00 PM',  start: 12 * 60,  end: 15 * 60 },
  { meal: 'Snacks',    time: '4:00 PM – 6:00 PM',   start: 16 * 60,  end: 18 * 60 },
  { meal: 'Dinner',    time: '7:00 PM – 9:00 PM',   start: 19 * 60,  end: 21 * 60 },
];

const LS = {
  cart:    'canteen_cart_v2',
  bal:     'canteen_wallet_balance_v2',
  tx:      'canteen_wallet_tx_v2',
  orders:  'canteen_orders_v2',
};

const SHARED_KEY = 'canteen_shared_sim_v2';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lsGet<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : fallback; }
  catch { return fallback; }
}
function lsSet(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

function nowStr() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

function getStatus(): { isOpen: boolean; meal: string | null } {
  const now = new Date();
  if (now.getDay() === 0) return { isOpen: false, meal: null };
  const m = now.getHours() * 60 + now.getMinutes();
  for (const s of SCHEDULE) {
    if (m >= s.start && m < s.end) return { isOpen: true, meal: s.meal };
  }
  return { isOpen: false, meal: null };
}

// Shared-order simulation in sessionStorage
interface SharedEntry { itemId: string; count: number; }

function getShared(): SharedEntry[] {
  try {
    const r = sessionStorage.getItem(SHARED_KEY);
    if (r) return JSON.parse(r);
  } catch { /* ignore */ }
  // Seed: another student has Dosa and Veg Biryani
  const seed: SharedEntry[] = [
    { itemId: 'm-8', count: 1 },
    { itemId: 'm-9', count: 1 },
  ];
  sessionStorage.setItem(SHARED_KEY, JSON.stringify(seed));
  return seed;
}

function saveShared(e: SharedEntry[]) {
  sessionStorage.setItem(SHARED_KEY, JSON.stringify(e));
}

function registerShared(items: OrderItem[]) {
  const s = getShared();
  items.forEach(i => {
    const idx = s.findIndex(e => e.itemId === i.itemId);
    if (idx >= 0) s[idx].count += i.quantity;
    else s.push({ itemId: i.itemId, count: i.quantity });
  });
  saveShared(s);
}

function unregisterShared(items: OrderItem[]) {
  const s = getShared();
  items.forEach(i => {
    const idx = s.findIndex(e => e.itemId === i.itemId);
    if (idx >= 0) s[idx].count = Math.max(0, s[idx].count - i.quantity);
  });
  saveShared(s);
}

function hasOtherStudent(items: OrderItem[]): boolean {
  const s = getShared();
  return items.some(i => {
    const e = s.find(x => x.itemId === i.itemId);
    // count >= 2 means at least one other student (besides current user)
    return e && e.count >= 2;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

type View = 'dashboard' | 'menu' | 'cart' | 'payment' | 'my-orders' | 'wallet' | 'history';

export const CanteenStudentModule: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const normalizeView = (tab: string | null): View => {
    if (tab === 'menu') return 'menu';
    if (tab === 'cart') return 'cart';
    if (tab === 'orders' || tab === 'my-orders') return 'my-orders';
    if (tab === 'wallet') return 'wallet';
    if (tab === 'history') return 'history';
    if (tab === 'payment') return 'payment';
    return 'dashboard';
  };

  const [view, setViewState] = useState<View>(() => normalizeView(tabParam));

  useEffect(() => {
    setViewState(normalizeView(tabParam));
  }, [tabParam]);

  const setView = (newView: View) => {
    setViewState(newView);
    const param = newView === 'my-orders' ? 'orders' : newView;
    setSearchParams(param === 'dashboard' ? {} : { tab: param }, { replace: true });
    window.dispatchEvent(new Event('canteen_state_changed'));
  };

  // Cart
  const [cart, setCart] = useState<Record<string, number>>(() => lsGet(LS.cart, {}));
  const [activeCat, setActiveCat] = useState<string>('All');

  // ── Live menu: syncs from vendor portal via localStorage ─────────────────────
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => readSharedMenu());

  useEffect(() => {
    const onMenuChanged = () => setMenuItems(readSharedMenu());
    window.addEventListener('canteen_menu_changed', onMenuChanged);
    return () => window.removeEventListener('canteen_menu_changed', onMenuChanged);
  }, []);

  // Payment
  const [payMethod, setPayMethod] = useState<'UPI' | 'Wallet'>('UPI');
  const [payStep, setPayStep] = useState<'select' | 'processing' | 'success'>('select');
  const [lastOrder, setLastOrder] = useState<CanteenOrderRecord | null>(null);
  const [storeCredit, setStoreCredit] = useState<number>(0);
  const [pickupTime, setPickupTime] = useState<string>('');

  // Orders
  const [orders, setOrders] = useState<CanteenOrderRecord[]>(() => lsGet(LS.orders, []));

  // Wallet
  const [balance, setBalance] = useState<number>(() => lsGet(LS.bal, 500));
  const [txHistory, setTxHistory] = useState<WalletTransaction[]>(() => lsGet(LS.tx, []));

  // Cancel dialog
  const [cancelTarget, setCancelTarget] = useState<CanteenOrderRecord | null>(null);
  const [cancelMode, setCancelMode] = useState<'shared' | 'single' | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Tick for live status
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 30000);
    return () => clearInterval(t);
  }, []);

  // Persist & Notify Sidebar
  useEffect(() => {
    lsSet(LS.cart, cart);
    window.dispatchEvent(new Event('canteen_state_changed'));
  }, [cart]);
  useEffect(() => {
    lsSet(LS.orders, orders);
    window.dispatchEvent(new Event('canteen_state_changed'));
  }, [orders]);
  useEffect(() => lsSet(LS.bal, balance), [balance]);
  useEffect(() => lsSet(LS.tx, txHistory), [txHistory]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Cart helpers
  const addToCart = (id: string) => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const decCart = (id: string) => setCart(p => {
    const n = { ...p };
    if ((n[id] || 0) > 1) n[id]--; else delete n[id];
    return n;
  });
  const removeItem = (id: string) => setCart(p => { const n = { ...p }; delete n[id]; return n; });
  const clearCart = () => setCart({});

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => ({ item: menuItems.find(m => m.id === id)!, qty }))
    .filter(e => e.item);
  const cartCount = cartEntries.reduce((a, e) => a + e.qty, 0);
  const cartTotal = cartEntries.reduce((a, e) => a + e.item.price * e.qty, 0);

  // Payment
  const startPayment = () => { setPayStep('select'); setStoreCredit(0); setPickupTime(''); setView('payment'); };

  const effectiveTotal = Math.max(0, cartTotal - storeCredit);

  const payNow = () => {
    if (!pickupTime) { showToast('Please select a pickup time before paying.'); return; }
    if (storeCredit > 0) {
      // Deduct store credit from wallet
      setBalance(b => b - storeCredit);
      const scTx: WalletTransaction = { id: uid('tx'), type: 'debit', amount: storeCredit, reason: `Store Credit Applied — ${cartEntries.map(e => e.item.name).join(', ')}`, date: nowStr(), createdAt: Date.now() };
      setTxHistory(p => [scTx, ...p]);
    }
    if (payMethod === 'Wallet') {
      if (balance - storeCredit < effectiveTotal) { showToast('Insufficient wallet balance.'); return; }
      const nb = balance - storeCredit - effectiveTotal;
      setBalance(nb);
      const tx: WalletTransaction = { id: uid('tx'), type: 'debit', amount: effectiveTotal, reason: `Canteen Order — ${cartEntries.map(e => e.item.name).join(', ')}`, date: nowStr(), createdAt: Date.now() };
      setTxHistory(p => [tx, ...p]);
    }
    setPayStep('processing');
    setTimeout(completeOrder, 1800);
  };

  const completeOrder = () => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentId = `PAY-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const items: OrderItem[] = cartEntries.map(e => ({ itemId: e.item.id, name: e.item.name, price: e.item.price, quantity: e.qty }));
    const o: CanteenOrderRecord = {
      id: uid('order'), orderId, paymentId, items,
      totalAmount: cartTotal, paymentMethod: payMethod,
      paymentStatus: 'Paid', orderStatus: 'Confirmed',
      cancelType: null, walletAdjustment: 0,
      dateTime: nowStr(), createdAt: Date.now(),
      pickupTime: pickupTime,
      refundStatus: null,
    };
    registerShared(items);
    setOrders(p => [o, ...p]);
    setLastOrder(o);
    clearCart();
    setPayStep('success');
    try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#f59e0b', '#10b981', '#6366f1'] }); } catch { /* ignore */ }
  };

  // Order status advance
  const advanceStatus = (oid: string) => {
    setOrders(p => p.map(o => {
      if (o.id !== oid) return o;
      const next: OrderStatus = o.orderStatus === 'Confirmed' ? 'Preparing' : o.orderStatus === 'Preparing' ? 'Ready' : o.orderStatus;
      return { ...o, orderStatus: next };
    }));
    showToast('Order status updated!');
  };

  // Cancel — always refund immediately, no vendor approval needed
  const requestCancel = (o: CanteenOrderRecord) => {
    setCancelMode('shared'); // always show refund mode
    setCancelTarget(o);
  };

  const doCancel = (action: 'keep' | 'cancel') => {
    if (!cancelTarget) return;
    if (action === 'keep') { setCancelTarget(null); setCancelMode(null); return; }

    const refund = cancelTarget.totalAmount;
    unregisterShared(cancelTarget.items);

    setOrders(p => p.map(o => o.id === cancelTarget.id
      ? { ...o, orderStatus: 'Cancelled' as OrderStatus, cancelType: 'shared_refund', walletAdjustment: refund, refundStatus: 'Processed' }
      : o));

    setBalance(b => b + refund);
    const tx: WalletTransaction = { id: uid('tx'), type: 'credit', amount: refund, reason: `Refund — Cancelled Order ${cancelTarget.orderId}`, date: nowStr(), createdAt: Date.now() };
    setTxHistory(p => [tx, ...p]);
    showToast(`Order cancelled. ₹${refund} refunded to your Canteen Wallet instantly.`);
    setCancelTarget(null); setCancelMode(null);
  };

  // Wallet top-up
  const topUp = (amt: number) => {
    setBalance(b => b + amt);
    const tx: WalletTransaction = { id: uid('tx'), type: 'credit', amount: amt, reason: 'Top-up via UPI (Simulated)', date: nowStr(), createdAt: Date.now() };
    setTxHistory(p => [tx, ...p]);
    showToast(`₹${amt} added to your Canteen Wallet!`);
  };

  // Derived
  const { isOpen, meal: currentMeal } = getStatus();
  const isSunday = new Date().getDay() === 0;
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long' });
  const activeOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
  const filteredMenu = (activeCat === 'All'
    ? menuItems
    : menuItems.filter(m => m.category === activeCat)
  ).filter(m => m.available !== false);

  const statusClass = (s: OrderStatus) => {
    if (s === 'Confirmed') return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (s === 'Preparing') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (s === 'Ready') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };


  const QRGrid = () => (
    <div className="grid grid-cols-7 gap-0.5 w-full h-full p-1 bg-slate-950 rounded-xl">
      {Array.from({ length: 49 }).map((_, i) => (
        <div key={i} className={`rounded-sm ${[0,6,42,48,16,24,32].includes(i) ? 'bg-amber-400' : i % 5 === 0 ? 'bg-white' : 'bg-slate-900'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-amber-500/40 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-xl max-w-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toast}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-1"><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cancel Dialog ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cancelTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-rose-500/20">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cancel Order?</h3>
                  <p className="text-xs text-slate-400">{cancelTarget.orderId}</p>
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs text-emerald-200 space-y-1">
                <p className="font-bold text-emerald-300">✓ Instant Refund Guaranteed</p>
                <p>Cancelling will immediately refund <span className="font-bold text-white">₹{cancelTarget.totalAmount}</span> to your Canteen Wallet.</p>
                <p className="text-emerald-400/70 text-[10px] mt-1">No vendor approval needed — refunds are processed instantly.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => doCancel('keep')} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold">Keep Order</button>
                <button onClick={() => doCancel('cancel')} className="py-2.5 rounded-xl text-white text-xs font-bold bg-rose-600 hover:bg-rose-500">
                  Cancel &amp; Get Refund
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${isOpen ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                {isOpen ? `● Open — ${currentMeal}` : '● Closed'}
              </span>
              <span className="text-xs text-slate-400">{isSunday ? 'Sunday — Closed' : today}</span>
            </div>
            <h1 className="text-xl font-bold text-white">Canteen</h1>
            <p className="text-xs text-slate-400 mt-0.5">Order food, track status, manage your wallet</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-700 rounded-2xl px-4 py-2 text-center">
              <p className="text-[10px] text-slate-400">Wallet</p>
              <p className="text-lg font-extrabold text-emerald-400 font-mono">₹{balance}</p>
            </div>
            {cartCount > 0 && (
              <button onClick={() => setView('cart')} className="relative bg-slate-800/90 hover:bg-slate-700 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 p-2 rounded-xl transition-all group">
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
                <span className="absolute opacity-0 group-hover:opacity-100 right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap transition-opacity">₹{cartTotal}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          VIEWS (Controlled via Sidebar navigation sub-items)
      ═══════════════════════════════════════════════════════════════════ */}

      {/* ─── DASHBOARD ─────────────────────────────────────────────────── */}
      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><ChefHat className="w-4 h-4 text-amber-400" />Canteen Status</h3>
            <div className={`p-4 rounded-2xl border ${isOpen ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
              <p className={`text-xl font-extrabold ${isOpen ? 'text-emerald-400' : 'text-rose-400'}`}>{isOpen ? '✓ Open' : '✗ Closed'}</p>
              {isOpen && <p className="text-xs text-slate-300 mt-1">Now serving: <span className="text-amber-300 font-bold">{currentMeal}</span></p>}
              {isSunday && <p className="text-xs text-rose-300 mt-1">Closed on Sundays</p>}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" />Today's Schedule</h3>
            <div className="space-y-2">
              {SCHEDULE.map(slot => {
                const m = new Date().getHours() * 60 + new Date().getMinutes();
                const active = !isSunday && m >= slot.start && m < slot.end;
                return (
                  <div key={slot.meal} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${active ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                    <span className="font-semibold">{slot.meal}</span>
                    <span className="font-mono text-[11px]">{slot.time}</span>
                  </div>
                );
              })}
              <p className="text-[10px] text-slate-500 pt-1">{isSunday ? 'Closed Sundays' : 'Mon–Sat Open'}</p>
            </div>
          </div>

          {/* Wallet */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Wallet className="w-4 h-4 text-emerald-400" />Canteen Wallet</h3>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-slate-400">Available Balance</p>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">₹{balance}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[100, 200].map(amt => (
                <button key={amt} onClick={() => topUp(amt)} className="py-2 rounded-xl bg-slate-800 hover:bg-emerald-600/20 text-slate-200 hover:text-emerald-300 text-xs font-bold border border-slate-700 hover:border-emerald-500/30 transition-all">
                  + ₹{amt}
                </button>
              ))}
            </div>
            <button onClick={() => setView('wallet')} className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors">View Transactions →</button>
          </div>

          {/* Current Orders */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Package className="w-4 h-4 text-purple-400" />Current Orders</h3>
              <button onClick={() => setView('my-orders')} className="text-xs text-amber-400 hover:text-amber-300 font-semibold">View All →</button>
            </div>
            {activeOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs"><ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-700" />No active orders</div>
            ) : (
              <div className="space-y-2">
                {activeOrders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                    <div><p className="font-bold text-white">{o.orderId}</p><p className="text-slate-400 text-[11px]">{o.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</p></div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 font-bold">₹{o.totalAmount}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass(o.orderStatus)}`}>{o.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick add */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Utensils className="w-4 h-4 text-amber-400" />Quick Add</h3>
            <div className="space-y-2">
              {menuItems.filter(m => m.available !== false).slice(0, 4).map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-7 h-7 rounded-lg object-cover border border-slate-800" />
                    ) : (
                      <span className="text-base">{item.emoji}</span>
                    )}
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono font-bold">₹{item.price}</span>
                    {cart[item.id] ? (
                      <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                        <button onClick={() => decCart(item.id)} className="text-slate-400 hover:text-white font-bold leading-none">−</button>
                        <span className="text-white font-mono text-xs px-1">{cart[item.id]}</span>
                        <button onClick={() => addToCart(item.id)} className="text-slate-400 hover:text-amber-400 font-bold leading-none">+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item.id)} className="px-2 py-0.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition-colors">+Add</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setView('menu')} className="w-full py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors">Browse Full Menu →</button>
          </div>
        </div>
      )}

      {/* ─── MENU ──────────────────────────────────────────────────────── */}
      {view === 'menu' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {/* Build dynamic category list from current menu items */}
            {['All', ...Array.from(new Set(menuItems.map(m => m.category)))].map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${activeCat === cat ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMenu.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <motion.div key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-sm hover:shadow-amber-500/5">
                  <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-950/60">
                        {item.emoji}
                      </div>
                    )}
                    <span className="absolute top-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-300 border border-slate-700/60">
                      {item.category}
                    </span>
                    {item.isVeg !== undefined && (
                      <span className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-md border border-slate-700/60">
                        <span className={`block w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">{item.name}</p>
                        <p className="text-base font-extrabold text-amber-400 font-mono shrink-0">₹{item.price}</p>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                    {qty > 0 ? (
                      <div>
                        <div className="flex items-center justify-between bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5">
                          <button onClick={() => decCart(item.id)} className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="font-bold text-white font-mono text-sm">{qty}</span>
                          <button onClick={() => addToCart(item.id)} className="w-6 h-6 rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        <p className="text-center text-[11px] text-amber-400 font-mono mt-1">Subtotal: ₹{item.price * qty}</p>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item.id)} className="w-full py-2 rounded-xl bg-slate-800/90 hover:bg-amber-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <Plus className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── CART ──────────────────────────────────────────────────────── */}
      {view === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-amber-400" />Your Cart<span className="text-xs font-mono text-slate-400 ml-auto">{cartCount} items</span></h2>
            {cartEntries.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-400 text-sm">Cart is empty</p>
                <button onClick={() => setView('menu')} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold">Browse Menu</button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartEntries.map(({ item, qty }) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800" />
                      ) : (
                        <div className="text-2xl shrink-0">{item.emoji}</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1">
                          <button onClick={() => decCart(item.id)} className="text-slate-400 hover:text-white font-bold text-sm leading-none">−</button>
                          <span className="font-mono text-white text-xs px-1">{qty}</span>
                          <button onClick={() => addToCart(item.id)} className="text-slate-400 hover:text-amber-400 font-bold text-sm leading-none">+</button>
                        </div>
                        <span className="text-amber-400 font-mono font-bold text-sm w-14 text-right">₹{item.price * qty}</span>
                        <button onClick={() => removeItem(item.id)} className="text-slate-600 hover:text-rose-400 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="text-2xl font-extrabold text-amber-400 font-mono">₹{cartTotal}</span>
                </div>
              </>
            )}
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
            <h3 className="text-sm font-bold text-white">Order Summary</h3>
            {cartEntries.map(({ item, qty }) => (
              <div key={item.id} className="flex justify-between text-xs text-slate-400">
                <span>{item.name} × {qty}</span>
                <span className="font-mono text-slate-300">₹{item.price * qty}</span>
              </div>
            ))}
            <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Grand Total</span>
              <span className="font-mono font-extrabold text-amber-400 text-base">₹{cartTotal}</span>
            </div>
            {cartEntries.length > 0 && (
              <button onClick={startPayment} className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all">
                Proceed to Payment <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <p className="text-[10px] text-slate-500 text-center">Wallet balance: <span className="text-emerald-400 font-mono">₹{balance}</span></p>
          </div>
        </div>
      )}

      {/* ─── PAYMENT ───────────────────────────────────────────────────── */}
      {view === 'payment' && (
        <div className="max-w-md mx-auto space-y-4">
          {/* Select method */}
          {payStep === 'select' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-400" />Payment</h2>

              {/* Order summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                {cartEntries.map(({ item, qty }) => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-slate-300">
                    <span className="flex items-center gap-2">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-5 h-5 rounded-md object-cover border border-slate-800" />
                      ) : (
                        <span>{item.emoji}</span>
                      )}
                      <span>{item.name} × {qty}</span>
                    </span>
                    <span className="font-mono">₹{item.price * qty}</span>
                  </div>
                ))}
                {storeCredit > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                    <span>Store Credit Applied</span>
                    <span className="font-mono">−₹{storeCredit}</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400 font-mono">₹{effectiveTotal}</span>
                </div>
              </div>

              {/* Store Credit */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-emerald-400" />Apply Store Credit <span className="text-emerald-400/70 text-[10px] font-normal">(Wallet: ₹{balance})</span></p>
                <div className="flex gap-2">
                  <button onClick={() => setStoreCredit(0)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${storeCredit === 0 ? 'bg-slate-700 border-slate-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}>
                    None
                  </button>
                  {[100, 200].map(amt => (
                    <button key={amt} onClick={() => setStoreCredit(balance >= amt ? amt : 0)}
                      disabled={balance < amt}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        storeCredit === amt ? 'bg-emerald-600 border-emerald-500 text-white' :
                        balance < amt ? 'bg-slate-950 border-slate-800 text-slate-700 cursor-not-allowed' :
                        'bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40'
                      }`}>
                      −₹{amt}
                    </button>
                  ))}
                </div>
                {storeCredit > 0 && balance < storeCredit && (
                  <p className="text-[10px] text-rose-400">Insufficient wallet balance for this credit option.</p>
                )}
              </div>

              {/* Pickup Time */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400" />Select Pickup Time <span className="text-rose-400 text-[10px]">*required</span></p>
                <div className="grid grid-cols-3 gap-2">
                  {['ASAP', '15 min', '30 min', '45 min', '1 hour'].map(slot => (
                    <button key={slot} onClick={() => setPickupTime(slot)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${pickupTime === slot ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
                {!pickupTime && (
                  <p className="text-[10px] text-slate-500">Choose when you'd like to collect your order.</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400">Choose Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['UPI', 'Wallet'] as const).map(method => (
                    <button key={method} onClick={() => setPayMethod(method)}
                      className={`p-4 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-2 ${payMethod === method ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'}`}>
                      {method === 'UPI' ? <QrCode className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                      {method === 'UPI' ? 'UPI / QR' : `Wallet (₹${balance - storeCredit})`}
                    </button>
                  ))}
                </div>
                {payMethod === 'Wallet' && (balance - storeCredit) < effectiveTotal && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                    ⚠ Insufficient balance. Need ₹{effectiveTotal - (balance - storeCredit)} more.
                  </div>
                )}
              </div>

              <button onClick={payNow} disabled={!pickupTime || (payMethod === 'Wallet' && (balance - storeCredit) < effectiveTotal)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all">
                <ShieldCheck className="w-5 h-5" />Pay Now — ₹{effectiveTotal}
              </button>
              <button onClick={() => setView('cart')} className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors">← Back to Cart</button>
            </div>
          )}

          {/* Processing */}
          {payStep === 'processing' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center space-y-5">
              <h2 className="text-base font-bold text-white">Processing Payment…</h2>
              <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto shadow-2xl border border-slate-200"><QRGrid /></div>
              <p className="text-xs text-slate-400">Demo QR — Simulated Payment</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs text-amber-300">Verifying transaction…</span>
              </div>
            </div>
          )}

          {/* Success */}
          {payStep === 'success' && lastOrder && (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 space-y-5 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Payment Successful!</h2>
                <p className="text-sm text-emerald-400 mt-1">Your order has been confirmed</p>
              </div>

              {/* Preparing status banner */}
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-amber-300">Preparing your order…</p>
                  <p className="text-[10px] text-amber-400/70">The canteen has received your order and is getting it ready.</p>
                </div>
              </motion.div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-300"><span className="text-slate-500">Order ID</span><span className="font-mono font-bold text-white">{lastOrder.orderId}</span></div>
                <div className="flex justify-between text-slate-300"><span className="text-slate-500">Payment ID</span><span className="font-mono font-bold text-amber-400">{lastOrder.paymentId}</span></div>
                <div className="flex justify-between text-slate-300"><span className="text-slate-500">Amount</span><span className="font-mono font-bold text-emerald-400">₹{lastOrder.totalAmount}</span></div>
                <div className="flex justify-between text-slate-300"><span className="text-slate-500">Method</span><span className="font-bold">{lastOrder.paymentMethod}</span></div>
                {lastOrder.pickupTime && (
                  <div className="flex justify-between text-slate-300"><span className="text-slate-500">Pickup Time</span><span className="font-bold text-blue-300">{lastOrder.pickupTime}</span></div>
                )}
                <div className="flex justify-between text-slate-300"><span className="text-slate-500">Date &amp; Time</span><span className="text-slate-400 text-[10px]">{lastOrder.dateTime}</span></div>
                <div className="border-t border-slate-800 pt-2 space-y-1">
                  {lastOrder.items.map(i => (
                    <div key={i.itemId} className="flex justify-between text-slate-300"><span>{i.name} × {i.quantity}</span><span className="font-mono">₹{i.price * i.quantity}</span></div>
                  ))}
                </div>
              </div>
              <div className="w-36 h-36 bg-white p-2.5 rounded-2xl mx-auto shadow-xl border border-slate-200">
                <div className="grid grid-cols-7 gap-0.5 w-full h-full p-1 bg-slate-950 rounded-xl">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${[0,6,42,48,16,24,32].includes(i) ? 'bg-indigo-400' : i % 5 === 0 ? 'bg-white' : 'bg-slate-900'}`} />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-500">Demo QR — Show at counter to collect your order</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setView('my-orders'); setPayStep('select'); }} className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">Track Order</button>
                <button onClick={() => { setView('menu'); setPayStep('select'); }} className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold">Order More</button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ─── MY ORDERS ─────────────────────────────────────────────────── */}
      {view === 'my-orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-purple-400" />Current Orders</h2>
            <span className="text-xs text-slate-400 font-mono">{activeOrders.length} active</span>
          </div>
          {activeOrders.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl py-16 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-400">No active orders</p>
              <button onClick={() => setView('menu')} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold">Browse Menu</button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => (
                <div key={order.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-white text-sm">{order.orderId}</p>
                      <p className="text-[11px] text-slate-400">{order.dateTime}</p>
                      {order.pickupTime && (
                        <p className="text-[11px] text-blue-300 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />Pickup: {order.pickupTime}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">{order.paymentStatus}</span>
                    </div>
                  </div>

                  {/* Preparing banner */}
                  {order.orderStatus === 'Preparing' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-amber-300">Preparing your order</p>
                        <p className="text-[10px] text-amber-400/70">Your food is being freshly prepared. We'll let you know when it's ready!</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${order.orderStatus === 'Ready' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: order.orderStatus === 'Confirmed' ? '25%' : order.orderStatus === 'Preparing' ? '60%' : order.orderStatus === 'Ready' ? '95%' : '100%' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      {['Confirmed', 'Preparing', 'Ready', 'Collected'].map(s => (
                        <span key={s} className={order.orderStatus === s ? (s === 'Ready' ? 'text-emerald-400' : s === 'Preparing' ? 'text-amber-400' : 'text-indigo-400') : ''}>{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-1.5">
                    {order.items.map(item => (
                      <div key={item.itemId} className="flex justify-between text-xs text-slate-300">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-mono text-slate-400">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-800 pt-1.5 flex justify-between text-xs font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-amber-400 font-mono">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {order.orderStatus !== 'Ready' && order.orderStatus !== 'Cancelled' && (
                      <button onClick={() => advanceStatus(order.id)}
                        className="flex-1 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center justify-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" />Advance Status (Demo)
                      </button>
                    )}
                    {order.orderStatus !== 'Cancelled' && (
                      <button onClick={() => requestCancel(order)}
                        className="py-2 px-4 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-bold border border-rose-500/20">
                        Cancel &amp; Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── WALLET ─────────────────────────────────────────────────────── */}
      {view === 'wallet' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto"><Wallet className="w-7 h-7 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-slate-400">Canteen Wallet Balance</p>
              <p className="text-4xl font-extrabold text-emerald-400 font-mono">₹{balance}</p>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {[100, 200, 500].map(amt => (
                <button key={amt} onClick={() => topUp(amt)} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors">+ ₹{amt}</button>
              ))}
            </div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2"><History className="w-4 h-4 text-slate-400" />Transaction History</h3>
            {txHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No transactions yet. Top up your wallet to get started!</div>
            ) : (
              <div className="space-y-2">
                {txHistory.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                        <span className={`font-bold text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>{tx.type === 'credit' ? '+' : '−'}</span>
                      </div>
                      <div>
                        <p className="text-slate-200 font-semibold">{tx.reason}</p>
                        <p className="text-slate-500 text-[10px]">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-extrabold text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'credit' ? '+' : '−'}₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── ORDER HISTORY ──────────────────────────────────────────────── */}
      {view === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2"><History className="w-5 h-5 text-slate-400" />Order History</h2>
            <span className="text-xs text-slate-400 font-mono">{orders.length} total orders</span>
          </div>
          {orders.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl py-16 text-center space-y-3">
              <History className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-slate-400">No order history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-white text-sm">{order.orderId}</p>
                      <p className="text-[11px] text-slate-400">{order.dateTime}</p>
                      {order.pickupTime && (
                        <p className="text-[11px] text-blue-300 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />Pickup: {order.pickupTime}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">{order.paymentStatus}</span>
                      {order.refundStatus === 'Processed' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-500/30 bg-blue-500/10 text-blue-300">Refunded</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {order.items.map(item => (
                      <div key={item.itemId} className="flex justify-between text-xs text-slate-400">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-mono">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-mono font-bold text-amber-400">₹{order.totalAmount}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="font-bold text-slate-300">{order.paymentMethod}</span></div>
                    {order.orderStatus === 'Cancelled' && order.refundStatus === 'Processed' && (
                      <div className="col-span-2 pt-1 border-t border-slate-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Refund Status</span>
                          <span className="font-bold text-emerald-400">+₹{order.walletAdjustment} Refunded</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Refund processed instantly to Canteen Wallet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
