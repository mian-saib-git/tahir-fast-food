// OrderForm.tsx — full replacement

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ClipboardCheck, Minus, Plus, ShoppingBag, Trash2, Star,
  User, Phone, MapPin, StickyNote, CreditCard, ChevronDown,
  BadgePercent, Bike, Send, Search, X as XIcon,
} from 'lucide-react';
import { storage } from '../lib/storage';
import { makeId, makeOrderNumber, money } from '../lib/utils';
import {
  DeliveryBoy, MenuItem, Order, OrderItem,
  OrderSource, OrderType, PaymentMethod,
} from '../types';

interface OrderFormProps {
  onOrderCreated: (order: Order) => void;
}

const logo = '/assets/tahir-logo.png';

const CATEGORY_ICONS: Record<string, { emoji: string; color: string; bg: string }> = {
  All:                    { emoji: '🍽️', color: '#9b6030', bg: '#fff1d0' },
  Pizza:                  { emoji: '🍕', color: '#c0392b', bg: '#ffeae8' },
  Burger:                 { emoji: '🍔', color: '#a0522d', bg: '#fff0e0' },
  Burgers:                { emoji: '🍔', color: '#a0522d', bg: '#fff0e0' },
  Sandwich:               { emoji: '🥪', color: '#6b8e23', bg: '#f0f5e0' },
  Shawarma:               { emoji: '🌮', color: '#b8860b', bg: '#fffacd' },
  'Shawarma & Rolls':     { emoji: '🌯', color: '#b8860b', bg: '#fffacd' },
  Rolls:                  { emoji: '🌯', color: '#d4670b', bg: '#fff3dd' },
  Fries:                  { emoji: '🍟', color: '#d4a017', bg: '#fffbe0' },
  Drinks:                 { emoji: '🧃', color: '#1a6b8a', bg: '#e0f4fa' },
  'Cold Drinks':          { emoji: '🥤', color: '#1a7a6b', bg: '#d8f4ef' },
  'Hot Drinks':           { emoji: '☕', color: '#7b4a1a', bg: '#f5e8d8' },
  Soup:                   { emoji: '🥣', color: '#8b4513', bg: '#f5efe8' },
  Dessert:                { emoji: '🍰', color: '#e91e8c', bg: '#fce4f3' },
  Deal:                   { emoji: '⭐', color: '#7c3aed', bg: '#ede9fe' },
  Deals:                  { emoji: '🎯', color: '#7c3aed', bg: '#ede9fe' },
  Chicken:                { emoji: '🍗', color: '#c0832b', bg: '#fff3e0' },
  Rice:                   { emoji: '🍚', color: '#6b8e23', bg: '#f0f5e0' },
  Biryani:                { emoji: '🍛', color: '#8b4513', bg: '#f5ece0' },
  Pasta:                  { emoji: '🍝', color: '#c0392b', bg: '#ffeae8' },
  Salad:                  { emoji: '🥗', color: '#2e7d32', bg: '#e8f5e9' },
  Snacks:                 { emoji: '🍿', color: '#9b6030', bg: '#fff1d0' },
  BBQ:                    { emoji: '🍖', color: '#b71c1c', bg: '#ffebee' },
  Wings:                  { emoji: '🍗', color: '#c0832b', bg: '#fff3e0' },
  Wrap:                   { emoji: '🌮', color: '#6b8e23', bg: '#f0f5e0' },
  Cake:                   { emoji: '🎂', color: '#e91e8c', bg: '#fce4f3' },
};

function getCategoryMeta(cat: string) {
  return CATEGORY_ICONS[cat] ?? { emoji: '🍽️', color: '#9b6030', bg: '#fff1d0' };
}

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

// Highlight matching text in search results
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#f4c76a', color: '#24110c', borderRadius: 3, padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function OrderForm({ onOrderCreated }: OrderFormProps) {
  const [menu]               = useState<MenuItem[]>(storage.getMenu());
  const [employeesSnapshot, setEmployeesSnapshot] = useState(storage.getEmployees());
  const [bill, setBill]      = useState<OrderItem[]>([]);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [discount,     setDiscount]     = useState(0);
  const [deliveryFee,  setDeliveryFee]  = useState(storage.getSettings().defaultDeliveryFee);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [orderType,    setOrderType]    = useState<OrderType>('delivery');
  const [orderSource,  setOrderSource]  = useState<OrderSource>('whatsapp');
  const [tableNumber,  setTableNumber]  = useState('');
  const [customer,     setCustomer]     = useState({ name: '', phone: '', address: '', notes: '' });
  const [savingOrder,  setSavingOrder]  = useState(false);
  const [saveSuccess,  setSaveSuccess]  = useState(false);

  useEffect(() => {
    const sync = () => setEmployeesSnapshot(storage.getEmployees());
    window.addEventListener('focus',   sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('focus',   sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const availableRiders = employeesSnapshot.filter(
    (e): e is DeliveryBoy => e.role === 'delivery_boy'
  ).filter(r => r.status !== 'offline');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(menu.map(i => i.category)))],
    [menu]
  );

  // When searching, ignore category filter — search across everything
  const isSearching = searchQuery.trim().length > 0;

  const filteredMenu = useMemo(() => {
    const available = menu.filter(item => item.isAvailable ?? true);
    if (isSearching) {
      const q = searchQuery.toLowerCase();
      return available.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return available.filter(item => category === 'All' || item.category === category);
  }, [menu, category, searchQuery, isSearching]);

  const handleItemClick = (item: MenuItem) => {
    setBill(prev => {
      const existing = prev.find(b => b.itemId === item.id);
      if (existing) return prev.map(b => b.itemId === item.id ? { ...b, quantity: b.quantity + 1 } : b);
      return [{ itemId: item.id, name: item.name, price: safeNumber(item.price), quantity: 1, note: '' }, ...prev];
    });
  };

  const updateQty  = (id: string, delta: number) =>
    setBill(prev => prev.map(b => b.itemId === id ? { ...b, quantity: Math.max(1, safeNumber(b.quantity) + delta) } : b));
  const removeItem = (id: string) => setBill(prev => prev.filter(b => b.itemId !== id));

  const subtotal           = bill.reduce((s, i) => s + safeNumber(i.price) * safeNumber(i.quantity), 0);
  const appliedDeliveryFee = orderType === 'delivery' ? safeNumber(deliveryFee) : 0;
  const appliedDiscount    = safeNumber(discount);
  const total              = Math.max(0, subtotal - appliedDiscount + appliedDeliveryFee);

  const buildOrder = (): Order | null => {
    if (bill.length === 0)                                     { alert('Add at least one item.'); return null; }
    if (!customer.name.trim() || !customer.phone.trim())       { alert('Enter customer name and phone.'); return null; }
    if (orderType === 'delivery' && !customer.address.trim())  { alert('Enter delivery address.'); return null; }
    return {
      id: makeId('order'), orderNumber: makeOrderNumber(),
      customerName: customer.name.trim(), customerPhone: customer.phone.trim(),
      customerAddress: customer.address.trim(), orderType, orderSource,
      items: bill.map(i => ({ ...i, price: safeNumber(i.price), quantity: safeNumber(i.quantity) })),
      subtotal, discount: appliedDiscount, deliveryFee: appliedDeliveryFee, total,
      status: 'preparing', paymentMethod, paymentStatus,
      createdAt: Date.now(), updatedAt: Date.now(),
      deliveryBoyId: selectedDeliveryBoy || undefined,
      notes: customer.notes.trim(), tableNumber: tableNumber.trim(),
    };
  };

  const resetForm = () => {
    setBill([]); setCustomer({ name: '', phone: '', address: '', notes: '' });
    setSelectedDeliveryBoy(''); setDiscount(0); setTableNumber('');
    setPaymentStatus('unpaid'); setPaymentMethod('cash');
    setOrderType('delivery'); setOrderSource('whatsapp');
    setDeliveryFee(storage.getSettings().defaultDeliveryFee);
    setCategory('All'); setSearchQuery('');
  };

  const submit = () => {
    if (savingOrder) return;
    const order = buildOrder();
    if (!order) return;
    setSavingOrder(true);
    setTimeout(() => {
      onOrderCreated(order);
      resetForm();
      setSavingOrder(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2200);
    }, 380);
  };

  const getBillQty = (itemId: string) => bill.find(b => b.itemId === itemId)?.quantity ?? 0;

  return (
    <>
      <style>{`
        .of-layout { display: grid; grid-template-columns: minmax(0,1fr) minmax(360px,500px); gap: 20px; align-items: start; }
        @media (max-width: 1024px) { .of-layout { grid-template-columns: 1fr !important; } }

        .of-menu-item {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          user-select: none;
        }
        .of-menu-item:hover  { transform: translateY(-3px) scale(1.02); }
        .of-menu-item:active { transform: scale(0.97); }

        .of-cat-btn { transition: all 0.18s ease; }
        .of-cat-btn:hover { transform: translateY(-2px); }

        /* Search bar glow on focus */
        .of-search-wrap:focus-within {
          border-color: rgba(244,199,106,0.7) !important;
          box-shadow: 0 0 0 3px rgba(244,199,106,0.18), 0 8px 24px rgba(0,0,0,0.28) !important;
        }

        /* Search result — category badge */
        .of-cat-badge {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        @keyframes ofSuccessPop  { 0%{transform:scale(0.85);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
        @keyframes ofPulseRing   { 0%{box-shadow:0 0 0 0 rgba(56,200,120,.55)} 70%{box-shadow:0 0 0 14px rgba(56,200,120,0)} 100%{box-shadow:0 0 0 0 rgba(56,200,120,0)} }
        @keyframes fadeSlideIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes searchPop     { 0%{opacity:0;transform:scale(0.96)} 100%{opacity:1;transform:scale(1)} }

        .of-search-results-label {
          animation: fadeSlideIn 0.22s ease;
        }
        .of-menu-item-appear {
          animation: searchPop 0.18s ease both;
        }

        @media (max-width: 768px) {
          .of-menu-grid { grid-template-columns: repeat(auto-fill, minmax(130px,1fr)) !important; }
          .of-two-col, .of-three-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="of-layout" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* ══════════════════════════════════════════════════
            LEFT — MENU PANEL
        ══════════════════════════════════════════════════ */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRadius: 30, overflow: 'hidden',
          background: 'linear-gradient(160deg,#180904,#3d1508)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          position: 'relative', minWidth: 0,
          minHeight: 'calc(100vh - 100px)',
        }}>
          {/* Texture overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/assets/bg-pattern.png)', backgroundSize: 'cover', opacity: 0.07, pointerEvents: 'none' }} />

          {/* ── TOP BAR ── */}
          <div style={{ padding: '22px 22px 0', position: 'relative', zIndex: 1, flexShrink: 0 }}>

            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <img src={logo} alt="Tahir" style={{ height: 44, width: 44, objectFit: 'contain', borderRadius: 12, background: 'rgba(255,255,255,0.08)', padding: 4 }} />
              <div>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 900, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#f4c76a' }}>Restaurant POS</p>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>New Order</h2>
              </div>
              {bill.length > 0 && (
                <div style={{ marginLeft: 'auto', background: '#f4c76a', color: '#24110c', borderRadius: 999, padding: '5px 14px', fontSize: 11, fontWeight: 900 }}>
                  {bill.reduce((s, b) => s + b.quantity, 0)} in bill
                </div>
              )}
            </div>

            {/* ── SEARCH BAR ── */}
            <div
              className="of-search-wrap"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(255,255,255,0.10)',
                borderRadius: 18, border: '1.5px solid rgba(255,255,255,0.14)',
                padding: '0 16px', height: 48, marginBottom: 16,
                boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <Search size={16} color="rgba(255,255,255,0.5)" style={{ flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search any item by name or category…"
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  fontSize: 13, fontWeight: 600, color: '#fff', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                  style={{ border: 'none', background: 'rgba(255,255,255,0.12)', borderRadius: 8, width: 22, height: 22, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <XIcon size={13} />
                </button>
              )}
            </div>

            {/* ── CATEGORY TABS (hidden while searching) ── */}
            {!isSearching && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, scrollbarWidth: 'none' }}>
                {categories.map(cat => {
                  const meta  = getCategoryMeta(cat);
                  const active = cat === category;
                  return (
                    <button key={cat} className="of-cat-btn" onClick={() => setCategory(cat)} style={{
                      flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 5, padding: '10px 14px', borderRadius: 18, border: 'none', cursor: 'pointer',
                      background: active ? meta.bg : 'rgba(255,255,255,0.07)',
                      transform: active ? 'translateY(-2px)' : 'none',
                      boxShadow: active ? `0 8px 24px ${meta.color}44` : 'none',
                    }}>
                      <span style={{ fontSize: 22 }}>{meta.emoji}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: active ? meta.color : 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{cat}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search result count */}
            {isSearching && (
              <div className="of-search-results-label" style={{ paddingBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                  {filteredMenu.length === 0
                    ? 'No results'
                    : `${filteredMenu.length} result${filteredMenu.length > 1 ? 's' : ''} for`}
                </span>
                {filteredMenu.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#f4c76a' }}>"{searchQuery}"</span>
                )}
              </div>
            )}
          </div>

          {/* ── MENU GRID ── */}
          <div
            className="of-menu-grid"
            style={{
              flex: 1, overflowY: 'auto', padding: '0 18px 22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 10, alignContent: 'start',
              position: 'relative', zIndex: 1,
              scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent',
            }}
          >
            {filteredMenu.map((item, idx) => {
              const meta   = getCategoryMeta(item.category);
              const qty    = getBillQty(item.id);
              const inBill = qty > 0;
              return (
                <div
                  key={item.id}
                  className={`of-menu-item of-menu-item-appear`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleItemClick(item)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleItemClick(item); } }}
                  style={{
                    animationDelay: `${Math.min(idx * 0.025, 0.3)}s`,
                    position: 'relative', padding: '14px 13px', borderRadius: 22,
                    cursor: 'pointer', outline: 'none',
                    border: inBill ? `2px solid ${meta.color}` : '2px solid rgba(255,255,255,0.09)',
                    background: inBill
                      ? `linear-gradient(145deg, ${meta.bg}, #fff)`
                      : 'linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))',
                    boxShadow: inBill ? `0 12px 30px ${meta.color}30` : '0 4px 14px rgba(0,0,0,0.22)',
                  }}
                >
                  {/* Popular badge */}
                  {item.isPopular && (
                    <span style={{
                      position: 'absolute', top: 8, right: inBill ? 38 : 8,
                      background: '#f4c76a', color: '#24110c',
                      fontSize: 7, fontWeight: 900, padding: '3px 6px',
                      borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>★ Hot</span>
                  )}

                  {/* In-bill qty bubble */}
                  {inBill && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      background: meta.color, color: '#fff', borderRadius: '50%',
                      width: 24, height: 24, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 900,
                    }}>{qty}</div>
                  )}

                  {/* Emoji */}
                  <div style={{ fontSize: 28, marginBottom: 8, lineHeight: 1 }}>{meta.emoji}</div>

                  {/* Name — highlighted when searching */}
                  <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 800, color: inBill ? '#24110c' : '#fff', lineHeight: 1.35 }}>
                    <Highlight text={item.name} query={searchQuery} />
                  </p>

                  {/* Category badge — shown during search so user knows where it's from */}
                  {isSearching ? (
                    <span
                      className="of-cat-badge"
                      style={{ background: meta.bg, color: meta.color, marginBottom: 7, display: 'inline-block' }}
                    >
                      {meta.emoji} {item.category}
                    </span>
                  ) : (
                    <p style={{ margin: '0 0 8px', fontSize: 9, fontWeight: 700, color: inBill ? meta.color : 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
                      {item.category}
                    </p>
                  )}

                  {/* Price + qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: isSearching ? 6 : 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: inBill ? meta.color : '#f4c76a', fontFamily: 'monospace' }}>
                      {money(safeNumber(item.price))}
                    </p>
                    {inBill ? (
                      <div style={{ display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
                        <button onClick={e => { e.stopPropagation(); updateQty(item.id, -1); }} style={miniBtn(meta.color)}>−</button>
                        <button onClick={e => { e.stopPropagation(); updateQty(item.id, +1); }} style={miniBtn(meta.color)}>+</button>
                      </div>
                    ) : (
                      <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 8, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700 }}>+</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty states */}
            {filteredMenu.length === 0 && !isSearching && (
              <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 60, opacity: 0.4 }}>
                <span style={{ fontSize: 48 }}>🍽️</span>
                <p style={{ margin: 0, color: '#fff', fontWeight: 700 }}>No items in this category</p>
              </div>
            )}
            {filteredMenu.length === 0 && isSearching && (
              <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '48px 24px', opacity: 0.6 }}>
                <span style={{ fontSize: 44 }}>🔍</span>
                <p style={{ margin: 0, color: '#fff', fontWeight: 800, fontSize: 15 }}>No items found</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                  Try a different name or category
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ marginTop: 6, background: 'rgba(244,199,106,0.15)', border: '1px solid rgba(244,199,106,0.3)', borderRadius: 12, padding: '8px 18px', color: '#f4c76a', fontSize: 12, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.06em' }}
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT — BILL + CUSTOMER FORM
        ══════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

          {/* Bill card */}
          <div style={{ borderRadius: 30, overflow: 'hidden', background: '#fff8ee', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid #ead8bd' }}>

<div style={{ background: 'linear-gradient(135deg,#1c0905,#7b3a18)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
  <ShoppingBag size={20} color="#f4c76a" />
  <div style={{ flex: 1 }}>
    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#f4c76a' }}>Current Bill</p>
    <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#fff' }}>Order Items</p>
  </div>
</div>
            <div style={{ padding: '14px 16px' }}>
              {bill.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '22px 0', color: '#c4a07a', fontSize: 13, fontWeight: 700 }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🛒</span>
                  Tap menu items to add them here
                </div>
              ) : (
                <div style={{ maxHeight: '38vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4, scrollbarWidth: 'thin', scrollbarColor: '#e8c88a transparent' }}>
                  {bill.map(item => (
                    <div key={item.itemId} style={{ background: 'linear-gradient(135deg,#fff,#fff6e9)', border: '1px solid #ead2a9', borderRadius: 18, padding: '10px 13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#24110c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#9b7a60', fontWeight: 600 }}>{money(safeNumber(item.price))} each</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff4df', borderRadius: 12, padding: '3px 5px' }}>
                          <button onClick={() => updateQty(item.itemId, -1)} style={iconBtn('#8a5a30')}><Minus size={12} /></button>
                          <span style={{ fontSize: 13, fontWeight: 900, color: '#24110c', minWidth: 18, textAlign: 'center' }}>{safeNumber(item.quantity)}</span>
                          <button onClick={() => updateQty(item.itemId, +1)} style={iconBtn('#8a5a30')}><Plus size={12} /></button>
                        </div>
                        <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: '#a8652d', minWidth: 58, textAlign: 'right' }}>{money(safeNumber(item.price) * safeNumber(item.quantity))}</span>
                        <button onClick={() => removeItem(item.itemId)} style={iconBtn('#e07070')}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Customer info card */}
          <div style={{ borderRadius: 30, background: 'linear-gradient(145deg,#fff,#fff9f0)', boxShadow: '0 20px 60px rgba(155,96,48,0.15)', border: '1.5px solid #f0dfc0', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg,#f9a825,#e65100)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 12, padding: 8, display: 'flex' }}><User size={18} color="#fff" /></div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>Customer Info</p>
            </div>
            <div style={{ padding: '20px 18px' }}>

              <div className="of-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, marginBottom: 10 }}>
                <div><FL>Customer Name</FL><FI icon={<User size={14}/>} placeholder="Full name" value={customer.name} onChange={v => setCustomer(p => ({ ...p, name: v }))} /></div>
                <div><FL>Phone Number</FL><FI icon={<Phone size={14}/>} placeholder="03xx-xxxxxxx" value={customer.phone} onChange={v => setCustomer(p => ({ ...p, phone: v }))} type="tel" /></div>
              </div>

              <div className="of-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, marginBottom: 10 }}>
                <div><FL>Order Source</FL>
                  <FS icon={<Send size={14}/>} value={orderSource} onChange={v => setOrderSource(v as OrderSource)} options={[['whatsapp','WhatsApp'],['phone','Phone'],['walk_in','Walk-in']]} /></div>
                <div><FL>Order Type</FL>
                  <FS icon={<Bike size={14}/>} value={orderType} onChange={v => { setOrderType(v as OrderType); if (v !== 'dine_in') setTableNumber(''); if (v !== 'delivery') setSelectedDeliveryBoy(''); }} options={[['delivery','Delivery'],['takeaway','Takeaway'],['dine_in','Dine-in']]} /></div>
              </div>

              {orderType === 'dine_in' && (
                <div style={{ marginBottom: 10 }}><FL>Table Number</FL><FI icon={<Star size={14}/>} placeholder="e.g. Table 4" value={tableNumber} onChange={setTableNumber} /></div>
              )}

              {orderType === 'delivery' && (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <FL>Delivery Address</FL>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fff', borderRadius: 16, border: '1.5px solid #f0dfc0', padding: '10px 14px' }}>
                      <MapPin size={15} color="#e65100" style={{ marginTop: 3, flexShrink: 0 }} />
                      <textarea value={customer.address} onChange={e => setCustomer(p => ({ ...p, address: e.target.value }))} placeholder="Street, area, city" rows={2}
                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#24110c', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }} />
                    </div>
                  </div>
                  <div className="of-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, marginBottom: 10 }}>
                    <div><FL>Assign Rider</FL>
                      <FS icon={<Bike size={14}/>} value={selectedDeliveryBoy} onChange={setSelectedDeliveryBoy}
                        options={[['', availableRiders.length ? 'Select rider' : 'No riders available'], ...availableRiders.map(r => [r.id, `${r.name} • ${r.vehicleNumber || 'No bike'}`] as [string,string])]} /></div>
                    <div><FL>Delivery Charges (Rs)</FL><FI icon={<BadgePercent size={14}/>} placeholder="0" value={String(deliveryFee)} onChange={v => setDeliveryFee(safeNumber(v))} type="number" /></div>
                  </div>
                </>
              )}

              <div style={{ marginBottom: 12 }}>
                <FL>Kitchen Notes (Optional)</FL>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fff', borderRadius: 16, border: '1.5px solid #f0dfc0', padding: '10px 14px' }}>
                  <StickyNote size={15} color="#e65100" style={{ marginTop: 3, flexShrink: 0 }} />
                  <textarea value={customer.notes} onChange={e => setCustomer(p => ({ ...p, notes: e.target.value }))} placeholder="Special instructions…" rows={2}
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#24110c', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }} />
                </div>
              </div>

              <div className="of-three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
                <div><FL>Payment Method</FL>
                  <FS icon={<CreditCard size={14}/>} value={paymentMethod} onChange={v => setPaymentMethod(v as PaymentMethod)} options={[['cash','Cash'],['card','Card'],['easypaisa','Easypaisa'],['jazzcash','JazzCash'],['bank_transfer','Bank']]} /></div>
                <div><FL>Payment Status</FL>
                  <FS icon={<ClipboardCheck size={14}/>} value={paymentStatus} onChange={v => setPaymentStatus(v as 'paid'|'unpaid')} options={[['unpaid','Unpaid'],['paid','Paid']]} /></div>
                <div><FL>Discount (Rs)</FL><FI icon={<BadgePercent size={14}/>} placeholder="0" value={String(discount)} onChange={v => setDiscount(safeNumber(v))} type="number" /></div>
              </div>

              {/* Totals */}
              <div style={{ borderRadius: 22, background: 'linear-gradient(135deg,#fff7e8,#fff)', border: '1.5px solid #f0dfc0', padding: '14px 16px', marginBottom: 14 }}>
                <TRow label="Subtotal" value={money(subtotal)} />
                {orderType === 'delivery' && <TRow label="Delivery Charges" value={money(appliedDeliveryFee)} />}
                {appliedDiscount > 0 && <TRow label="Discount" value={`−${money(appliedDiscount)}`} color="#e07070" />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ead8bd', paddingTop: 10, marginTop: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#24110c' }}>Total</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 900, color: '#e65100' }}>{money(total)}</span>
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={submit}
                disabled={savingOrder}
                style={{
                  width: '100%', border: 'none', borderRadius: 18, padding: '15px 10px',
                  fontSize: 13, fontWeight: 900, cursor: savingOrder ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  animation: saveSuccess ? 'ofPulseRing 0.7s ease' : undefined,
                  background: saveSuccess
                    ? 'linear-gradient(135deg,#1a8c50,#2db870)'
                    : savingOrder
                    ? 'linear-gradient(135deg,#5a7a60,#3a6050)'
                    : 'linear-gradient(135deg,#1a5c40,#2d9162)',
                  boxShadow: saveSuccess
                    ? '0 0 0 3px rgba(56,200,120,0.4), 0 12px 28px rgba(26,92,64,0.35)'
                    : '0 10px 22px rgba(0,0,0,0.18)',
                }}
                onMouseEnter={e => !savingOrder && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              >
                {saveSuccess ? (
                  <><span style={{ fontSize: 16, animation: 'ofSuccessPop 0.4s ease' }}>✓</span> Order Saved!</>
                ) : savingOrder ? (
                  <><span style={{ display: 'inline-block', animation: 'spin 0.6s linear infinite', fontSize: 15 }}>⟳</span> Saving…</>
                ) : (
                  <><ClipboardCheck size={15} /> Save Order</>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Small style helpers ─────────────────────────────────────────────────────

function miniBtn(color: string) {
  return { background: color, border: 'none', borderRadius: 8, width: 22, height: 22, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 } as const;
}
function iconBtn(color: string) {
  return { border: 'none', background: 'none', cursor: 'pointer', padding: 3, color, display: 'flex' } as const;
}

function TRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: color ?? '#8c6a55', marginBottom: 5 }}>
      <span>{label}</span><span style={{ fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}

// Short aliases to keep JSX compact
function FL({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 5px 4px', fontSize: 10, fontWeight: 800, color: '#9b6030', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{children}</p>;
}

function FI({ icon, placeholder, value, onChange, type = 'text' }: { icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div style={{ width: '100%', minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, background: '#fff', borderRadius: 14, border: '1.5px solid #f0dfc0', padding: '0 13px', height: 46, boxShadow: '0 2px 8px rgba(155,96,48,0.06)', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
      <span style={{ color: '#e65100', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={e => { e.currentTarget.parentElement!.style.borderColor = '#39d5ff'; e.currentTarget.parentElement!.style.boxShadow = '0 0 0 3px rgba(57,213,255,0.14)'; }}
        onBlur={e => { e.currentTarget.parentElement!.style.borderColor = '#f0dfc0'; e.currentTarget.parentElement!.style.boxShadow = '0 2px 8px rgba(155,96,48,0.06)'; }}
        placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#24110c', outline: 'none', fontFamily: 'inherit' }} />
    </div>
  );
}

function FS({ icon, value, onChange, options }: { icon: React.ReactNode; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div style={{ width: '100%', minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, background: '#fff', borderRadius: 14, border: '1.5px solid #f0dfc0', padding: '0 10px 0 13px', height: 46, boxShadow: '0 2px 8px rgba(155,96,48,0.06)', transition: 'border-color 0.2s, box-shadow 0.2s', position: 'relative' }}>
      <span style={{ color: '#e65100', display: 'flex', flexShrink: 0 }}>{icon}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        onFocus={e => { e.currentTarget.parentElement!.style.borderColor = '#39d5ff'; e.currentTarget.parentElement!.style.boxShadow = '0 0 0 3px rgba(57,213,255,0.14)'; }}
        onBlur={e => { e.currentTarget.parentElement!.style.borderColor = '#f0dfc0'; e.currentTarget.parentElement!.style.boxShadow = '0 2px 8px rgba(155,96,48,0.06)'; }}
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 700, color: '#24110c', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none' }}>
        {options.map(([val, label]) => <option key={val} value={val} style={{ color: '#111', background: '#fff' }}>{label}</option>)}
      </select>
      <ChevronDown size={13} color="#9b6030" style={{ flexShrink: 0 }} />
    </div>
  );
}