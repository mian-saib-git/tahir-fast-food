import html2canvas from 'html2canvas';
import React, { useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Download, ImageUp, Search, Trash2, Filter, TrendingUp, Edit3, X, PlusCircle, Eye, History, RotateCcw, Ban } from 'lucide-react';
import { cn, money, statusLabel, whatsappPhone } from '../lib/utils';
import { storage } from '../lib/storage';
import { DeliveryBoy, Order, OrderStatus, MenuItem } from '../types';

interface OrderDeskProps {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  onPrint: (order: Order, copies?: Array<'Customer' | 'Kitchen'>) => void;
  highlightOrderId?: string | null;
}

const statuses: OrderStatus[] = ['pending','preparing','ready','out_for_delivery','delivered','cancelled'];
const logo = '/assets/tahir-logo.png';
const shareBillPhoto = '/assets/tahir-food-background.jpg';
const RESTAURANT_ORDER_PHONE = '+92 343-1993614';

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function getFinancials(order: Order) {
  const subtotal = order.items.reduce((sum, item) => sum + safeNumber(item.price) * safeNumber(item.quantity), 0);
  const deliveryFee = safeNumber(order.deliveryFee);
  const discount = safeNumber(order.discount);
  const total = Math.max(0, subtotal + deliveryFee - discount);
  return { subtotal, deliveryFee, discount, total };
}

// ══════════════════════════════════════
//  EDIT ORDER MODAL – Search bar fixed
// ══════════════════════════════════════
function EditOrderModal({
  order,
  onSave,
  onClose,
}: {
  order: Order;
  onSave: (updatedOrder: Order) => void;
  onClose: () => void;
}) {
  const menuItems: MenuItem[] = storage.getMenu();
  const [items, setItems] = useState(order.items.map(item => ({ ...item })));
  const [newItemId, setNewItemId] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newNote, setNewNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredMenu = menuItems.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateItem = (index: number, patch: Partial<Order['items'][0]>) => {
    setItems(prev => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (!newItemId) return;
    const menuItem = menuItems.find(m => m.id === newItemId);
    if (!menuItem) return;
    const newItem = {
      itemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: newQty,
      note: newNote,
    };
    setItems(prev => [...prev, newItem]);
    setNewItemId('');
    setNewQty(1);
    setNewNote('');
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSave = () => {
    const validItems = items.filter(i => i.quantity > 0 && i.itemId);
    const updatedOrder: Order = {
      ...order,
      items: validItems,
      updatedAt: Date.now(),
    };
    onSave(updatedOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white shadow-2xl p-0 max-h-[90vh] overflow-y-auto ring-1 ring-black/5">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2a0d06] to-[#7b3a18] p-6 rounded-t-[2rem] text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">Update Order</p>
            <h2 className="text-2xl font-black mt-1">#{order.orderNumber}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Items */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Current Items</h3>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div
                  key={`${item.itemId}-${i}`}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#fefdf9] p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-[#3b1e0e]">{item.name}</span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {money(item.price)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Qty</label>
                        <input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={e => updateItem(i, { quantity: Number(e.target.value) || 0 })}
                          className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Note</label>
                        <input
                          value={item.note || ''}
                          onChange={e => updateItem(i, { note: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                          placeholder="Extra cheese, no onions…"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="self-center p-2 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-gray-400 italic py-4 text-center">No items in this order yet.</p>
              )}
            </div>
          </section>

          {/* Add New Item – search bar fixed */}
          <section className="rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-6 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle size={18} className="text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-700">Add New Item</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[2fr_auto_1fr] gap-4 items-end">
              {/* Search input */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Item</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={newItemId ? menuItems.find(m => m.id === newItemId)?.name || '' : searchTerm}
                    placeholder="Search pizza, burger…"
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setNewItemId('');
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '12px 40px 12px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      background: '#fff',
                      outline: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'border-color 0.2s',
                    }}
                  />
                  {newItemId && (
                    <button
                      onClick={() => { setNewItemId(''); setSearchTerm(''); }}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#94a3b8',
                        cursor: 'pointer',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && !newItemId && (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      marginTop: '4px',
                    }}>
                      {filteredMenu.length === 0 ? (
                        <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                          No items found
                        </div>
                      ) : (
                        filteredMenu.map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setNewItemId(m.id);
                              setSearchTerm('');
                              setShowDropdown(false);
                            }}
                            style={{
                              padding: '12px 16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{m.name}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>
                              {money(m.price)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <div
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 19 }}
                      onClick={() => setShowDropdown(false)}
                    />
                  </>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={newQty}
                  onChange={e => setNewQty(Number(e.target.value) || 1)}
                  className="w-20 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Note</label>
                <input
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleAddItem}
              disabled={!newItemId}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#7b3a18] text-white px-6 py-3 text-sm font-bold shadow-lg shadow-[#7b3a18]/20 hover:bg-[#5a2610] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <PlusCircle size={16} />
              Add Item
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-xl bg-[#1c0905] text-amber-400 text-sm font-black shadow-lg hover:bg-[#2a0d06] transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main OrderDesk component ───
export default function OrderDesk({ orders, setOrders, onPrint, highlightOrderId }: OrderDeskProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shareOrder, setShareOrder] = useState<Order | null>(null);
  const [sendingOrderId, setSendingOrderId] = useState<string | null>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'delivered' | 'cancelled' | 'all'>('active');

  const riders = storage.getEmployees().filter((e): e is DeliveryBoy => e.role === 'delivery_boy');

  const filtered = useMemo(() => orders.filter(order => {
    const matchesView =
      viewMode === 'all' ||
      (viewMode === 'active' && !['delivered', 'cancelled'].includes(order.status)) ||
      (viewMode === 'delivered' && order.status === 'delivered') ||
      (viewMode === 'cancelled' && order.status === 'cancelled');
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const text = `${order.orderNumber} ${order.customerName || ''} ${order.customerPhone || ''} ${order.customerAddress || ''} ${order.items.map(i => i.name).join(' ')}`.toLowerCase();
    return matchesView && matchesStatus && text.includes(query.trim().toLowerCase());
  }), [orders, query, statusFilter, viewMode]);

  const customerHistoryFor = (order: Order) => {
    const phone = (order.customerPhone || '').replace(/\D/g, '');
    const name = (order.customerName || '').trim().toLowerCase();
    return orders
      .filter(candidate => {
        if (phone) return (candidate.customerPhone || '').replace(/\D/g, '') === phone;
        if (name) return (candidate.customerName || '').trim().toLowerCase() === name;
        return candidate.id === order.id;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  const updateRiderStatus = (riderId: string, status: DeliveryBoy['status']) => {
    const employees = storage.getEmployees();
    storage.saveEmployees(employees.map(e => e.id === riderId && e.role === 'delivery_boy' ? { ...e, status, active: true } : e));
  };

  const updateOrder = (id: string, patch: Partial<Order>) => {
    const current = orders.find(o => o.id === id);
    if (!current) return;

    let finalPatch: Partial<Order> = { ...patch, updatedAt: Date.now() };

    if (patch.status === 'cancelled' && current.status !== 'cancelled') {
      const reason = window.prompt('Why was this order cancelled?');
      if (reason === null) return;
      if (!reason.trim()) {
        alert('Please enter a cancellation reason.');
        return;
      }
      finalPatch = {
        ...finalPatch,
        cancellationReason: reason.trim(),
        cancelledAt: Date.now(),
      };
    }

    if (current.status === 'cancelled' && patch.status && patch.status !== 'cancelled') {
      finalPatch = {
        ...finalPatch,
        cancellationReason: undefined,
        cancelledAt: undefined,
      };
    }

    if (current.deliveryBoyId && patch.status) {
      if (patch.status === 'out_for_delivery') updateRiderStatus(current.deliveryBoyId, 'on_delivery');
      if (['ready','delivered','cancelled','preparing','pending'].includes(patch.status)) updateRiderStatus(current.deliveryBoyId, 'available');
    }
    setOrders(storage.updateOrder(id, finalPatch));
  };

  const assignRider = (order: Order, riderId: string) => {
    if (order.deliveryBoyId && order.deliveryBoyId !== riderId) updateRiderStatus(order.deliveryBoyId, 'available');
    if (riderId) {
      updateRiderStatus(riderId, 'on_delivery');
      setOrders(storage.updateOrder(order.id, { deliveryBoyId: riderId, status: 'out_for_delivery', updatedAt: Date.now() }));
    } else {
      if (order.deliveryBoyId) updateRiderStatus(order.deliveryBoyId, 'available');
      setOrders(storage.updateOrder(order.id, { deliveryBoyId: undefined, status: order.status === 'out_for_delivery' ? 'ready' : order.status, updatedAt: Date.now() }));
    }
  };

  const deleteOrder = (order: Order) => {
    if (!confirm('Delete this order?')) return;
    if (order.deliveryBoyId) updateRiderStatus(order.deliveryBoyId, 'available');
    setOrders(storage.deleteOrder(order.id));
  };

  const handleEditSave = (updatedOrder: Order) => {
    setOrders(storage.updateOrder(updatedOrder.id, updatedOrder));
    setEditingOrder(null);
  };

  const downloadAllAndClear = () => {
    const allOrders = storage.getOrders();
    if (!allOrders.length) { alert('No orders found to download.'); return; }
    if (!confirm(`Download ${allOrders.length} orders and clear ALL orders?`)) return;
    const csvValue = (v: string | number | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Order Number','Date','Customer','Phone','Type','Source','Items','Subtotal','Delivery Fee','Discount','Total','Payment Method','Payment Status','Order Status','Rider','Address','Notes'].join(','),
      ...allOrders.map(order => {
        const riderName = riders.find(r => r.id === order.deliveryBoyId)?.name || '';
        const totals = getFinancials(order);
        return [csvValue(order.orderNumber),csvValue(format(order.createdAt,'dd/MM/yyyy HH:mm')),csvValue(order.customerName),csvValue(order.customerPhone),csvValue(order.orderType),csvValue(order.orderSource),csvValue(order.items.map(i => `${i.quantity}x ${i.name}`).join(' | ')),csvValue(totals.subtotal),csvValue(totals.deliveryFee),csvValue(totals.discount),csvValue(totals.total),csvValue(order.paymentMethod),csvValue(order.paymentStatus),csvValue(order.status),csvValue(riderName),csvValue(order.customerAddress||''),csvValue(order.notes||'')].join(',');
      }),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `all-orders-${format(Date.now(),'yyyy-MM-dd-HH-mm')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    storage.saveOrders([]); setOrders([]);
    storage.saveEmployees(storage.getEmployees().map(e => e.role === 'delivery_boy' ? { ...e, status: 'available', active: true } : e));
    alert('All orders downloaded and cleared.');
  };

  const sendBillImage = async (order: Order) => {
    try {
      setSendingOrderId(order.id); setShareOrder(order);
      await new Promise(r => setTimeout(r, 250));
      const node = shareCardRef.current;
      if (!node) throw new Error('Bill image not ready');
      const canvas = await html2canvas(node, { backgroundColor: '#111111', scale: 2, useCORS: true });
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png', 1));
      if (!blob) throw new Error('Could not create image');
      const file = new File([blob], `bill-${order.orderNumber}.png`, { type: 'image/png' });
      const nav = navigator as any;
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: `Bill ${order.orderNumber}` });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a'); a.href = url; a.download = `bill-${order.orderNumber}.png`;
        a.click(); URL.revokeObjectURL(url);
        window.open(`https://wa.me/${whatsappPhone(order.customerPhone)}`, '_blank', 'noopener,noreferrer');
        alert('Bill image downloaded. Please attach it in WhatsApp chat.');
      }
    } catch (err) {
      console.error(err); alert('Could not create bill image.');
    } finally {
      setSendingOrderId(null); setTimeout(() => setShareOrder(null), 100);
    }
  };

  const stats = useMemo(() => ({
    total: orders.length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivering: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    active: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
  }), [orders]);

  return (
    <>
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onSave={handleEditSave}
          onClose={() => setEditingOrder(null)}
        />
      )}

      <style>{`
        @keyframes newOrderReveal {
          0% { opacity: 0; transform: translateY(-12px) scale(0.97); }
          40% { opacity: 1; transform: translateY(2px) scale(1.008); }
          65% { transform: translateY(-1px) scale(1.003); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes newOrderGlowPulse {
          0% { box-shadow: 0 0 0 0 rgba(57,213,255,0.55), 0 0 0 0 rgba(57,213,255,0.25), 0 20px 50px rgba(0,0,0,0.12); }
          30% { box-shadow: 0 0 0 4px rgba(57,213,255,0.35), 0 0 40px rgba(57,213,255,0.22), 0 20px 50px rgba(0,0,0,0.14); }
          65% { box-shadow: 0 0 0 8px rgba(57,213,255,0.12), 0 0 60px rgba(57,213,255,0.10), 0 20px 50px rgba(0,0,0,0.12); }
          100% { box-shadow: 0 0 0 0 rgba(57,213,255,0), 0 0 0 rgba(57,213,255,0), 0 20px 50px rgba(0,0,0,0.10); }
        }
        @keyframes newOrderBorderShimmer {
          0%   { border-color: rgba(57,213,255,0.70); }
          40%  { border-color: rgba(57,213,255,0.90); }
          100% { border-color: rgba(57,213,255,0.20); }
        }
        .order-card-new {
          animation:
            newOrderReveal 0.55s cubic-bezier(0.22,1,0.36,1) both,
            newOrderGlowPulse 2.2s ease 0.2s 2,
            newOrderBorderShimmer 2.4s ease 0.2s forwards;
        }
        .od-search-wrap:focus-within {
          box-shadow: 0 0 0 3px rgba(57,213,255,0.18), 0 16px 40px rgba(0,0,0,0.10) !important;
          border-color: rgba(57,213,255,0.45) !important;
        }
      `}</style>

      <div className="space-y-6">
        {/* HEADER CARD */}
        <div style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,0.28)', border: '1px solid rgba(244,199,106,0.18)' }}>
          <div style={{ background: 'linear-gradient(135deg,#1c0905 0%,#4a1a08 55%,#7b3a18 100%)', padding: '22px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: 180, width: 200, height: 200, borderRadius: '50%', background: 'rgba(244,199,106,0.08)', filter: 'blur(40px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(57,213,255,0.06)', filter: 'blur(32px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ background: 'rgba(244,199,106,0.15)', borderRadius: 16, padding: '10px 12px', border: '1px solid rgba(244,199,106,0.25)', display: 'flex' }}>
                  <TrendingUp size={22} color="#f4c76a" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#f4c76a', opacity: 0.75 }}>Operations</p>
                  <h2 style={{ margin: '3px 0 0', fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1, fontStyle: 'italic' }}>Order Desk</h2>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <HeaderStat label="Total" value={stats.total} accent="#f4c76a" />
                <HeaderStat label="Preparing" value={stats.preparing} accent="#fb923c" />
                <HeaderStat label="Delivering" value={stats.delivering} accent="#38d5ff" />
                <HeaderStat label="Delivered" value={orders.filter(o => o.status === 'delivered').length} accent="#4ade80" />
              </div>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(145deg,#fff8ee,#fff3e0)', borderTop: '1px solid rgba(244,199,106,0.25)', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="od-search-wrap" style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 16, border: '1.5px solid #ead8bd', overflow: 'hidden', height: 48, boxShadow: '0 2px 10px rgba(155,96,48,0.08)', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
              <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#fff5e0,#ffecc8)', borderRight: '1.5px solid #ead8bd', flexShrink: 0 }}>
                <Search size={16} color="#c0832b" />
              </div>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search order no, customer, phone…" style={{ flex: 1, height: 48, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 13, fontWeight: 600, color: '#24110c', outline: 'none', fontFamily: 'inherit' }} />
              {query && <button onClick={() => setQuery('')} style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '0 14px', color: '#b08060', fontSize: 18, lineHeight: 1 }}>×</button>}
            </div>

            <div style={{ flexShrink: 0, minWidth: 155, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 16, border: '1.5px solid #ead8bd', padding: '0 12px 0 14px', height: 48, boxShadow: '0 2px 10px rgba(155,96,48,0.08)' }}>
              <Filter size={13} color="#c0832b" style={{ flexShrink: 0 }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, fontWeight: 700, color: '#24110c', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', appearance: 'none' }}>
                <option value="all">All Status</option>
                {statuses.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
              <ChevronDownIcon />
            </div>

            <button onClick={downloadAllAndClear} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#1c0905,#7b3a18)', color: '#f4c76a', border: 'none', borderRadius: 16, padding: '0 20px', height: 48, fontSize: 11, fontWeight: 900, cursor: 'pointer', letterSpacing: '0.07em', textTransform: 'uppercase', boxShadow: '0 6px 20px rgba(28,9,5,0.30)', transition: 'transform 0.15s, box-shadow 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(28,9,5,0.38)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(28,9,5,0.30)'; }}>
              <Download size={14} />
              Download All & Clear
            </button>
          </div>
        </div>

        {/* ORDER SECTIONS */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['active', 'Active Orders', stats.active, '#0891b2'],
            ['delivered', 'Delivered', stats.delivered, '#059669'],
            ['cancelled', 'Cancelled', stats.cancelled, '#dc2626'],
            ['all', 'All Orders', stats.total, '#7b3a18'],
          ].map(([mode, label, count, color]) => {
            const active = viewMode === mode;
            return (
              <button
                key={String(mode)}
                onClick={() => setViewMode(mode as typeof viewMode)}
                style={{
                  borderRadius: 18,
                  border: active ? `2px solid ${color}` : '1.5px solid rgba(255,255,255,0.18)',
                  background: active ? '#fff' : 'rgba(255,255,255,0.82)',
                  padding: '14px 16px',
                  textAlign: 'left',
                  boxShadow: active ? `0 12px 30px ${color}22` : '0 8px 22px rgba(0,0,0,0.08)',
                }}
              >
                <span style={{ display: 'block', fontSize: 22, fontWeight: 900, color: String(color) }}>{Number(count)}</span>
                <span style={{ display: 'block', marginTop: 4, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4b2a19' }}>{String(label)}</span>
              </button>
            );
          })}
        </div>

        {/* ORDER CARDS */}
        <div className="grid grid-cols-1 gap-5">
          {filtered.map(order => {
            const totals = getFinancials(order);
            const isNew = highlightOrderId === order.id;
            return (
              <div key={order.id} className={cn('premium-card overflow-hidden', isNew && 'order-card-new')} style={{ background: 'linear-gradient(145deg, rgba(255,248,238,0.95), rgba(255,255,255,0.84))', border: isNew ? '1.5px solid rgba(57,213,255,0.70)' : undefined }}>
                {isNew && (
                  <div style={{ background: 'linear-gradient(90deg,#39d5ff,#0891b2)', padding: '7px 20px', fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 13 }}>✦</span>New Order Received<span style={{ fontSize: 13 }}>✦</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-[1.05fr_1.4fr_auto] xl:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-[#24110c]">{order.orderNumber}</h3>
                      <span className={cn('rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest', statusTone(order.status))}>{statusLabel(order.status)}</span>
                    </div>
                    <p className="mt-2 text-sm font-bold">
                      {order.customerName || 'Walk-in customer'}
                      {order.customerPhone ? ` · ${order.customerPhone}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-black/40">{format(order.createdAt,'dd MMM yyyy, hh:mm a')} · {order.orderType.replace('_',' ')} · {order.orderSource}</p>
                    {order.customerAddress && <p className="mt-2 text-xs text-black/50">{order.customerAddress}</p>}
                    {order.status === 'cancelled' && order.cancellationReason && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                        Cancelled: {order.cancellationReason}
                        {order.cancelledAt ? ` · ${format(order.cancelledAt, 'dd MMM, hh:mm a')}` : ''}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-black/5 bg-[#fffaf4] p-3">
                      <p className="text-sm text-black/60">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <select value={order.status} onChange={e => updateOrder(order.id, { status: e.target.value as OrderStatus })} className="input-like">
                        {statuses.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                      </select>
                      <select value={order.deliveryBoyId || ''} onChange={e => assignRider(order, e.target.value)} className="input-like">
                        <option value="">No rider</option>
                        {riders.filter(r => r.status !== 'offline').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <select value={order.paymentStatus} onChange={e => updateOrder(order.id, { paymentStatus: e.target.value as 'paid'|'unpaid' })} className="input-like">
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateOrder(order.id, { status: 'ready' })} className="rounded-xl bg-cyan-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-cyan-700">Mark Ready</button>
                      <button onClick={() => updateOrder(order.id, { status: 'preparing' })} className="rounded-xl bg-orange-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-orange-700">Preparing</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 xl:items-end">
                    <div className="rounded-2xl bg-[#fff2de] px-4 py-3 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#9b6030]">Final Total</p>
                      <b className="font-mono text-2xl text-[#9b6030]">{money(totals.total)}</b>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-[#7b3a18] shadow-md ring-1 ring-[#ead8bd] transition hover:-translate-y-0.5"
                      >
                        <Eye size={14} className="mr-1 inline" /> Details & History
                      </button>
                      {order.status === 'cancelled' && (
                        <button
                          onClick={() => updateOrder(order.id, { status: 'pending' })}
                          className="rounded-xl bg-emerald-100 px-4 py-2 text-xs font-black uppercase tracking-wider text-emerald-700"
                        >
                          <RotateCcw size={14} className="mr-1 inline" /> Restore
                        </button>
                      )}
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="rounded-xl bg-[#f4c76a] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#1c0905] shadow-md transition hover:-translate-y-0.5"
                      >
                        <Edit3 size={14} className="inline mr-1" /> Edit
                      </button>
                      <button onClick={() => onPrint(order, ['Customer'])} className="rounded-xl bg-[#24110c] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#f4c76a] shadow-md transition hover:-translate-y-0.5">Customer Receipt</button>
                      <button onClick={() => onPrint(order, ['Kitchen'])} className="rounded-xl bg-[#7b3a18] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:-translate-y-0.5">Kitchen Ticket</button>
                      <button onClick={() => sendBillImage(order)} className="flex items-center gap-2 rounded-xl bg-[#0891b2] px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:-translate-y-0.5">
                        <ImageUp size={15} />
                        {sendingOrderId === order.id ? 'Creating…' : 'Send Picture'}
                      </button>
                      <button onClick={() => deleteOrder(order)} className="icon-btn text-red-500" title="Delete"><Trash2 size={17} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="premium-card p-12 text-center font-semibold text-black/35">No matching orders found.</div>
          )}
        </div>
      </div>

      {selectedOrder && (() => {
        const history = customerHistoryFor(selectedOrder);
        const completed = history.filter(item => item.status === 'delivered');
        const spent = completed.reduce((sum, item) => sum + getFinancials(item).total, 0);
        const rider = riders.find(item => item.id === selectedOrder.deliveryBoyId);
        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6" onClick={() => setSelectedOrder(null)}>
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.5rem] bg-[#fffaf4] shadow-2xl sm:rounded-[2rem]" onClick={event => event.stopPropagation()}>
              <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-[#1c0905] to-[#7b3a18] px-5 py-4 text-white sm:px-7">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f4c76a]">Order record</p>
                  <h3 className="mt-1 text-xl font-black sm:text-2xl">{selectedOrder.orderNumber}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="rounded-xl bg-white/10 p-2"><X size={20} /></button>
              </div>

              <div className="grid gap-5 p-4 sm:p-7 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="space-y-4">
                  <div className="rounded-2xl border border-[#ead8bd] bg-white p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Info label="Customer" value={selectedOrder.customerName || 'Walk-in customer'} />
                      <Info label="Phone" value={selectedOrder.customerPhone || 'Not provided'} />
                      <Info label="Order type" value={statusLabel(selectedOrder.orderType as any)} />
                      <Info label="Created" value={format(selectedOrder.createdAt, 'dd MMM yyyy, hh:mm a')} />
                      <Info label="Rider" value={rider?.name || 'Not assigned'} />
                      <Info label="Payment" value={`${selectedOrder.paymentMethod.replaceAll('_', ' ')} · ${selectedOrder.paymentStatus}`} />
                    </div>
                    {selectedOrder.customerAddress && <div className="mt-4 rounded-xl bg-[#fff5e6] p-3 text-sm font-semibold">{selectedOrder.customerAddress}</div>}
                    {selectedOrder.status === 'cancelled' && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                        <Ban size={16} className="mr-2 inline" />
                        {selectedOrder.cancellationReason || 'No cancellation reason recorded'}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#ead8bd] bg-white p-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#9b6030]">Items</h4>
                    <div className="mt-3 divide-y divide-black/5">
                      {selectedOrder.items.map((item, index) => (
                        <div key={`${item.itemId}-${index}`} className="flex items-start justify-between gap-3 py-3">
                          <div>
                            <p className="font-bold">{item.quantity} × {item.name}</p>
                            {item.note && <p className="mt-1 text-xs text-black/45">{item.note}</p>}
                          </div>
                          <b className="font-mono text-[#9b6030]">{money(item.price * item.quantity)}</b>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-lg font-black">
                      <span>Total</span><span>{money(getFinancials(selectedOrder).total)}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Summary label="Customer orders" value={history.length} />
                    <Summary label="Delivered" value={completed.length} />
                    <div className="col-span-2 rounded-2xl bg-[#1c0905] p-4 text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#f4c76a]">Customer lifetime spend</p>
                      <p className="mt-2 text-2xl font-black">{money(spent)}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#ead8bd] bg-white p-4">
                    <div className="flex items-center gap-2">
                      <History size={17} className="text-[#9b6030]" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-[#9b6030]">Customer history</h4>
                    </div>
                    <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                      {history.map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedOrder(item)}
                          className="w-full rounded-xl border border-black/5 bg-[#fffaf4] p-3 text-left transition hover:border-[#f4c76a]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <b>{item.orderNumber}</b>
                            <span className={cn('rounded-full px-2 py-1 text-[9px] font-black uppercase', statusTone(item.status))}>{statusLabel(item.status)}</span>
                          </div>
                          <div className="mt-2 flex justify-between text-xs text-black/50">
                            <span>{format(item.createdAt, 'dd MMM yyyy')}</span>
                            <b className="text-[#9b6030]">{money(getFinancials(item).total)}</b>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        );
      })()}

      {shareOrder && (
        <div style={{ position: 'fixed', left: '-10000px', top: 0, width: 1080, zIndex: -1, pointerEvents: 'none' }}>
          <div ref={shareCardRef}><ShareBillCard order={shareOrder} /></div>
        </div>
      )}
    </>
  );
}

// ─── ShareBillCard (unchanged from previous, includes your requested changes) ───
function ShareBillCard({ order }: { order: Order }) {
  const settings = storage.getSettings();
  const totals = getFinancials(order);
  const rider = storage.getEmployees().find(e => e.role === 'delivery_boy' && e.id === order.deliveryBoyId) as DeliveryBoy | undefined;

  return (
    <div style={{ width: 1080, minHeight: 1520, background: '#0f0f0e', color: '#ffffff', padding: 48, position: 'relative', overflow: 'hidden', fontFamily: "'Sora', 'Nunito', sans-serif" }}>
      {/* Decorative shapes */}
      <div style={{ position: 'absolute', top: -30, left: -30, width: 130, height: 130, background: '#e97b18', borderRadius: 36, transform: 'rotate(18deg)', opacity: 0.85 }} />
      <div style={{ position: 'absolute', top: 60, left: -20, width: 60, height: 40, background: '#ead25d', borderRadius: 14, transform: 'rotate(-10deg)', opacity: 0.7 }} />
      <div style={{ position: 'absolute', top: -25, right: -25, width: 110, height: 110, background: '#7c4a2f', borderRadius: 32, transform: 'rotate(-20deg)', opacity: 0.8 }} />
      <div style={{ position: 'absolute', top: 70, right: -10, width: 55, height: 35, background: '#fff', borderRadius: 14, transform: 'rotate(30deg)', opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: 620, left: -40, width: 90, height: 150, background: '#ead25d', borderRadius: 28, transform: 'rotate(28deg)', opacity: 0.55 }} />
      <div style={{ position: 'absolute', top: 740, left: -20, width: 50, height: 32, background: '#8ca52d', borderRadius: 12, transform: 'rotate(-12deg)', opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: 700, right: -35, width: 80, height: 130, background: '#e97b18', borderRadius: 26, transform: 'rotate(-25deg)', opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 100, background: '#8ca52d', borderRadius: 30, transform: 'rotate(-15deg)', opacity: 0.75 }} />
      <div style={{ position: 'absolute', bottom: 60, left: -15, width: 60, height: 40, background: '#fff', borderRadius: 16, transform: 'rotate(20deg)', opacity: 0.5 }} />
      <div style={{ position: 'absolute', bottom: -25, right: -25, width: 120, height: 90, background: '#ead25d', borderRadius: 28, transform: 'rotate(22deg)', opacity: 0.8 }} />
      <div style={{ position: 'absolute', bottom: 70, right: -10, width: 55, height: 36, background: '#7c4a2f', borderRadius: 14, transform: 'rotate(-30deg)', opacity: 0.65 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 36, alignItems: 'start', position: 'relative', zIndex: 1 }}>
        <div>
          <img src={logo} alt="Logo" style={{ height: 62, width: 62, objectFit: 'contain', marginBottom: 26 }} />
          <h1 style={{ margin: 0, fontSize: 58, fontWeight: 900, color: '#e97b18', lineHeight: 1 }}>
            {settings.cafeName || 'Tahir Fast Food'}
          </h1>
          <p style={{
            margin: '8px 0 0',
            fontSize: 22,
            fontWeight: 600,
            fontFamily: "'Dancing Script', 'Pacifico', 'Brush Script MT', cursive",
            color: '#f4c76a',
            letterSpacing: '0.5px',
            fontStyle: 'italic'
          }}>
            Main Namak Mandi Chowk Peshawar
          </p>
          <div style={{ marginTop: 18, fontSize: 22, fontWeight: 700, color: '#f5f5f4', lineHeight: 1.45 }}>
            <div style={{ marginTop: 14 }}>Customer Name: {order.customerName}</div>
            <div>Order #: {order.orderNumber}</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              Customer Contact: {order.customerPhone}
            </div>
          </div>
        </div>

        <div style={{ justifySelf: 'end', width: 350, height: 265, borderRadius: 60, padding: 8, background: '#fff', position: 'relative' }}>
          <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 52 }}>
            <img src={shareBillPhoto} alt="Food" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, position: 'relative', zIndex: 1 }}>
        {[['Date', format(order.createdAt,'dd MMM yyyy')],['Time', format(order.createdAt,'hh:mm a')],['Type', order.orderType.replace('_',' ')],['Payment', `${String(order.paymentMethod).replace('_',' ')} / ${order.paymentStatus}`]].map(([label, value]) => (
          <div key={label} style={{ borderRadius: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#f4c76a' }}>{label}</div>
            <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800, color: '#fff' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 42, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 150px 120px 150px', background: '#df7e17', color: '#171717', borderRadius: '18px 18px 0 0', padding: '16px 20px', fontSize: 24, fontWeight: 900 }}>
          <div>No.</div><div>Item Description</div><div style={{ textAlign: 'center' }}>Price</div><div style={{ textAlign: 'center' }}>Qty</div><div style={{ textAlign: 'right' }}>Total</div>
        </div>
        <div style={{ background: '#5f5f5f', borderRadius: '0 0 18px 18px', overflow: 'hidden' }}>
          {order.items.map((item, index) => (
            <div key={`${item.itemId}-${index}`} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 150px 120px 150px', padding: '18px 20px', color: '#fff', fontSize: 22, borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.08)', alignItems: 'center' }}>
              <div>{index + 1}</div>
              <div style={{ paddingRight: 16 }}>
                <div>{item.name}</div>
                {safeNumber(item.quantity) > 1 && (
                  <div style={{ fontSize: 16, color: '#d6d3d1', marginTop: 4 }}>{money(safeNumber(item.price))} each</div>
                )}
                {item.note && <div style={{ fontSize: 14, color: '#a8a29e', marginTop: 2, fontStyle: 'italic' }}>Note: {item.note}</div>}
              </div>
              <div style={{ textAlign: 'center' }}>{money(safeNumber(item.price))}</div>
              <div style={{ textAlign: 'center' }}>{safeNumber(item.quantity)}</div>
              <div style={{ textAlign: 'right' }}>{money(safeNumber(item.price) * safeNumber(item.quantity))}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Address</div>
          <div style={{ fontSize: 18, lineHeight: 1.65, color: '#e7e5e4', maxWidth: 560 }}>{order.customerAddress || 'Address not added'}</div>
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Rider Details</div>
            <div style={{ fontSize: 18, lineHeight: 1.65, color: '#d6d3d1', maxWidth: 560 }}>
              {rider ? (<><div>Name: {rider.name}</div><div>Phone: {rider.phone}</div><div>Vehicle: {rider.vehicleNumber || 'Not added'}</div></>) : 'No rider assigned'}
            </div>
          </div>
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Order Notes</div>
            <div style={{ fontSize: 18, lineHeight: 1.65, color: '#d6d3d1', maxWidth: 560 }}>{order.notes || 'No special notes added for this bill.'}</div>
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 900 }}>
          {[['Sub Total :', money(totals.subtotal)],['Delivery :', money(totals.deliveryFee)],['Discount :', money(totals.discount)]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 20, color: '#ffffff' }}>
              <span style={{ color: '#f5f5f4' }}>{l}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, gap: 20 }}>
            <span style={{ color: '#e97b18' }}>Total</span><span style={{ color: '#e97b18' }}>{money(totals.total)}</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 48, right: 48, bottom: 36, zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18, textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#f4c76a' }}>Software Developed by : AHQAR</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, color: '#f5f5f4' }}>Contact: +92 318-9995518</div>
      </div>
    </div>
  );
}

function HeaderStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '10px 16px', minWidth: 72, border: '1px solid rgba(255,255,255,0.10)' }}>
      <span style={{ fontSize: 24, fontWeight: 900, color: accent, fontFamily: 'monospace', lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-black/35">{label}</p>
      <p className="mt-1 text-sm font-bold capitalize text-[#24110c]">{value}</p>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#ead8bd] bg-white p-4">
      <p className="text-2xl font-black text-[#9b6030]">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-black/40">{label}</p>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9b6030" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function statusTone(status: OrderStatus) {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'cancelled') return 'bg-red-100 text-red-700';
  if (status === 'out_for_delivery') return 'bg-cyan-100 text-cyan-700';
  if (status === 'ready') return 'bg-cyan-100 text-cyan-700';
  return 'bg-orange-100 text-orange-700';
}