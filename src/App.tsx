// App.tsx — full fixed file

import LoginPage from './components/LoginPage';
import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import OrderDesk from './components/OrderDesk';
import MenuManager from './components/MenuManager';
import StaffManager from './components/StaffManager';
import PrintableReceipt from './components/PrintableReceipt';
import { Order } from './types';
import { storage } from './lib/storage';
import { Printer, X } from 'lucide-react';

const dashboardPageBg = '/assets/dashboard-bg.jpg';
const sectionsPageBg  = '/assets/tahir-food-background.jpg';

type PrintCopy = 'Customer' | 'Kitchen';

export default function App() {
  // ✅ FIX 1: useState is now INSIDE the component where it belongs
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => sessionStorage.getItem('tahir_logged_in') === 'true'
  );
  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [printJob,     setPrintJob]     = useState<{ order: Order; copies: PrintCopy[] } | null>(null);
  const [recentOrderId, setRecentOrderId] = useState<string | null>(null);

  // ✅ FIX 2: ALL hooks come before any early return
  useEffect(() => {
    setOrders(storage.getOrders());
  }, []);

  useEffect(() => {
    const syncOrders  = () => setOrders(storage.getOrders());
    const clearPrint  = () => setPrintJob(null);
    window.addEventListener('focus',      syncOrders);
    window.addEventListener('storage',    syncOrders);
    window.addEventListener('afterprint', clearPrint);
    return () => {
      window.removeEventListener('focus',      syncOrders);
      window.removeEventListener('storage',    syncOrders);
      window.removeEventListener('afterprint', clearPrint);
    };
  }, []);

  // ✅ FIX 3: useEffect watches printJob and fires print AFTER React renders the receipt
  useEffect(() => {
    if (!printJob) return;
    // rAF guarantees the browser has painted #printable-wrap before the dialog opens
    const id = requestAnimationFrame(() => {
      window.print();
    });
    return () => cancelAnimationFrame(id);
  }, [printJob]);

  // ✅ FIX 2 cont: early return comes AFTER all hooks
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleOrderCreated = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...storage.getOrders().filter(o => o.id !== newOrder.id)];
    setOrders(updatedOrders);
    storage.saveOrders(updatedOrders);
    setRecentOrderId(newOrder.id);
    setTimeout(() => setRecentOrderId(null), 3500);
    setActiveTab('history');
  };

  // ✅ FIX 3 cont: handlePrint just sets state — the useEffect above does the actual print
  const handlePrint = (order: Order, copies: PrintCopy[] = ['Customer']) => {
    setPrintJob({ order, copies });
    // NO setTimeout + window.print() here anymore
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard orders={orders} goTo={setActiveTab} />;
      case 'orders':    return <OrderForm onOrderCreated={handleOrderCreated} />;
      case 'history':   return (
        <OrderDesk
          orders={orders}
          setOrders={setOrders}
          onPrint={handlePrint}
          highlightOrderId={recentOrderId}
        />
      );
      case 'menu':   return <MenuManager />;
      case 'staff':  return <StaffManager />;
      default:       return <Dashboard orders={orders} goTo={setActiveTab} />;
    }
  };

  const currentBackground = activeTab === 'dashboard' ? dashboardPageBg : sectionsPageBg;

  return (
    <div
      className="app-shell min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `
          radial-gradient(circle at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.45) 68%, rgba(0,0,0,0.75) 100%),
          linear-gradient(rgba(18,8,5,0.70), rgba(18,8,5,0.88)),
          url(${currentBackground})
        `,
      }}
    >
      <style>{`
        :root {
          --coffee-950: #120805;
          --coffee-900: #1b0c08;
          --coffee-800: #24110c;
          --coffee-700: #3d1508;
          --cream-100:  #fff8ee;
          --cream-200:  #fff0d1;
          --gold:       #f4c76a;
          --orange:     #e97b18;
          --cyan:       #39d5ff;
          --sky:        #38bdf8;
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 9px; height: 9px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }

        .premium-card {
          border-radius: 30px;
          background: linear-gradient(145deg, rgba(255,248,238,0.92), rgba(255,255,255,0.76));
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.03), 0 8px 30px rgba(57,213,255,0.04);
          transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s cubic-bezier(0.22,1,0.36,1);
        }
        .premium-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.03), 0 10px 34px rgba(57,213,255,0.06);
        }
        .primary-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          border: none; border-radius: 18px; padding: 14px 20px;
          background: linear-gradient(135deg, var(--coffee-900), var(--coffee-700));
          color: var(--gold); font-size: 12px; font-weight: 900;
          letter-spacing: 0.12em; text-transform: uppercase;
          box-shadow: 0 14px 28px rgba(0,0,0,0.22);
          transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
        }
        .primary-btn:hover { transform: translateY(-2px) scale(1.01); filter: brightness(1.03); box-shadow: 0 18px 36px rgba(0,0,0,0.26); }
        .icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 42px; height: 42px;
          border: 1px solid rgba(0,0,0,0.06); border-radius: 14px;
          background: linear-gradient(145deg, #ffffff, #fff8ef);
          color: #24110c; box-shadow: 0 10px 20px rgba(0,0,0,0.06);
          transition: all 0.22s ease;
        }
        .icon-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 14px 28px rgba(0,0,0,0.10); }
        .input-like {
          width: 100%; height: 48px; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.06);
          background: linear-gradient(145deg, #ffffff, #fffaf4);
          padding: 0 14px; font-size: 13px; font-weight: 700; color: #24110c;
          outline: none; box-shadow: 0 8px 18px rgba(0,0,0,0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .input-like:focus {
          border-color: rgba(57,213,255,0.75);
          box-shadow: 0 0 0 3px rgba(57,213,255,0.14), 0 12px 24px rgba(57,213,255,0.08);
        }
        .dark-input {
          width: 100%; min-height: 48px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.08); color: #fff;
          padding: 0 14px; font-size: 13px; font-weight: 700;
          outline: none; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .dark-input:focus { border-color: rgba(57,213,255,0.7); box-shadow: 0 0 0 3px rgba(57,213,255,0.14); }
        .dark-input option, .input-like option, select option { color: #111 !important; background: #fff !important; }
        .glass-top-chip {
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
        }

        /* ── PRINT STYLES ── */

@media print {
  @page {
    size: 80mm auto;
    margin: 0mm;
  }

  /* Reset everything on the page */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 80mm !important;
    max-width: 80mm !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* Hide the entire app UI */
  body * {
    visibility: hidden !important;
  }

  /* Show only the receipt and all its children */
  #printable-wrap,
  #printable-wrap * {
    visibility: visible !important;
  }

  /* Override the screen styles — make it fully static and sized */
  #printable-wrap {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 80mm !important;
    max-width: 80mm !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    opacity: 1 !important;
    overflow: visible !important;
    z-index: 99999 !important;
    pointer-events: auto !important;
  }

  .receipt-copy {
    width: 80mm !important;
    page-break-after: always;
    break-after: page;
  }
  .receipt-copy:last-child {
    page-break-after: auto;
    break-after: auto;
  }
}
      `}</style>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="min-h-screen p-6 pt-20 lg:ml-72 lg:p-8 lg:pt-8">
        {activeTab !== 'dashboard' && activeTab !== 'orders' && (
          <header className="mb-8">
            <h1 className="font-display text-5xl font-bold italic tracking-tight text-white">
              {activeTab === 'history' && 'Order Desk'}
              {activeTab === 'menu'    && 'Menu Items'}
              {activeTab === 'staff'   && 'Team & Riders'}
            </h1>
            <p className="mt-2 text-sm font-semibold text-white/60">
              Manage Tahir Fast Food orders, menu, staff, and riders.
            </p>
          </header>
        )}

        <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {renderContent()}
        </div>
      </main>

      {/* ✅ FIX 4: No inline display:none — visibility:hidden keeps it in the DOM
          so the print engine can see it, but it's invisible on screen */}

<div
  id="printable-wrap"
  aria-hidden="true"
  style={{
    // position:absolute keeps it out of layout but still in the paint tree —
    // mobile Safari will actually render absolute elements when printing,
    // unlike fixed which it frequently skips.
    position: 'absolute',
    top: 0,
    left: 0,
    width: '80mm',
    maxWidth: '80mm',
    background: '#fff',
    // opacity:0 is more universally respected than visibility:hidden on mobile
    // print engines — the element is fully rendered, just invisible on screen.
    opacity: printJob ? 1 : 0,
    // pointer-events off so it never intercepts clicks
    pointerEvents: 'none',
    // must not clip content — mobile Safari will cut off overflowing receipts
    overflow: 'visible',
    // pull it off-screen on screen, but NOT using negative z-index
    // (negative z-index causes mobile print engines to skip the element)
    zIndex: 0,
  }}
>
        {printJob && printJob.copies.map(copy => (
          <div key={`${printJob.order.id}-${copy}`} className="receipt-copy">
            <PrintableReceipt order={printJob.order} type={copy} />
          </div>
        ))}
      </div>

      {printJob && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4 rounded-2xl bg-[#1b0c08]/95 p-4 text-white shadow-2xl backdrop-blur-xl print:hidden">
          <div className="rounded-xl bg-[#f4c76a] p-2 text-[#24110c]">
            <Printer size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">Order {printJob.order.orderNumber}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Ready to print</p>
          </div>
          <button onClick={() => setPrintJob(null)} className="rounded-lg p-1 transition-colors hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}