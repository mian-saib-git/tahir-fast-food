// App.tsx — printing via hidden iframe (no pop‑up, preview appears immediately)

import LoginPage from './components/LoginPage';
import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import OrderDesk from './components/OrderDesk';
import MenuManager from './components/MenuManager';
import StaffManager from './components/StaffManager';
import PrintableReceipt from './components/PrintableReceipt';
import { Order } from './types';
import { storage } from './lib/storage';
import { supabase } from './lib/supabase';
import { Printer, X } from 'lucide-react';

const dashboardPageBg = '/assets/dashboard-bg.jpg';
const sectionsPageBg  = '/assets/tahir-food-background.jpg';

type PrintCopy = 'Customer' | 'Kitchen';

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [printJob,     setPrintJob]     = useState<{ order: Order; copies: PrintCopy[] } | null>(null);
  const [recentOrderId, setRecentOrderId] = useState<string | null>(null);

  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setIsLoggedIn(Boolean(data.session));
      setAuthReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setIsLoggedIn(Boolean(session));
      setAuthReady(true);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setDataReady(false);
      setOrders([]);
      return;
    }

    let active = true;
    const syncOrders = () => setOrders(storage.getOrders());

    const loadData = async () => {
      try {
        await storage.initialize();
        if (!active) return;
        setOrders(storage.getOrders());
        setDataReady(true);
      } catch (error) {
        console.error(error);
        alert('Unable to load cafe data from Supabase. Check your internet connection and try again.');
      }
    };

    void loadData();
    window.addEventListener('focus', syncOrders);
    window.addEventListener('storage', syncOrders);

    return () => {
      active = false;
      window.removeEventListener('focus', syncOrders);
      window.removeEventListener('storage', syncOrders);
    };
  }, [isLoggedIn]);

  // ══════════════════════════════════════════
  //  PRINTING — reliable iframe method
  // ══════════════════════════════════════════
  useEffect(() => {
    if (!printJob) return;

    const sourceEl = document.getElementById('print-source');
    if (!sourceEl) return;

    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.title = 'Print Frame';
    document.body.appendChild(iframe);
    printFrameRef.current = iframe;

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      setPrintJob(null);
      return;
    }

    // Write the receipt HTML directly into the iframe
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${printJob.order.orderNumber}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            font-family: monospace;
            text-align: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          .receipt-copy {
            display: inline-block;
            width: 80mm;
            max-width: 80mm;
            margin: 0 auto;
            text-align: left;
            page-break-after: always;
          }
          .receipt-copy:last-child {
            page-break-after: auto;
          }
        </style>
      </head>
      <body>${sourceEl.innerHTML}</body>
      </html>
    `);
    iframeDoc.close();

    // After content loads, trigger print and clean up
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Clean up after print is done (or after a timeout)
        iframe.contentWindow?.addEventListener('afterprint', () => {
          document.body.removeChild(iframe);
          setPrintJob(null);
        }, { once: true });
        // Fallback in case afterprint doesn't fire (e.g., user cancels)
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
            setPrintJob(null);
          }
        }, 30000); // 30 seconds timeout
      }, 100);
    };
  }, [printJob]);

  // ══════════════════════════════════════════

  if (!authReady || (isLoggedIn && !dataReady)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#160805] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#f4c76a]" />
          <p className="text-sm font-bold">Loading Tahir Cafe data...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleOrderCreated = async (newOrder: Order) => {
    const savedOrder = await storage.addOrder(newOrder);
    setOrders(storage.getOrders());
    setRecentOrderId(savedOrder.id);
    setTimeout(() => setRecentOrderId(null), 3500);
    setActiveTab('history');
  };

  const handlePrint = (order: Order, copies: PrintCopy[] = ['Customer']) => {
    setPrintJob({ order, copies });
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
      `}</style>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="min-h-screen p-3 pt-4 sm:p-5 sm:pt-5 xl:ml-72 xl:p-8 xl:pt-8">
        {activeTab !== 'dashboard' && activeTab !== 'orders' && (
          <header className="mb-5 sm:mb-8">
            <h1 className="font-display text-3xl font-bold italic tracking-tight text-white sm:text-4xl xl:text-5xl">
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

      {/* Hidden container that renders the receipts — used as source for iframe */}
      {printJob && (
        <div
          id="print-source"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: '80mm',
            maxWidth: '80mm',
            background: '#fff',
            opacity: 1,
            pointerEvents: 'none',
          }}
        >
          {printJob.copies.map(copy => (
            <div key={`${printJob.order.id}-${copy}`} className="receipt-copy">
              <PrintableReceipt order={printJob.order} type={copy} />
            </div>
          ))}
        </div>
      )}

      {/* Feedback badge while printing */}
      {printJob && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4 rounded-2xl bg-[#1b0c08]/95 p-4 text-white shadow-2xl backdrop-blur-xl print:hidden">
          <div className="rounded-xl bg-[#f4c76a] p-2 text-[#24110c]">
            <Printer size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">Order {printJob.order.orderNumber}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Printing…</p>
          </div>
          <button onClick={() => setPrintJob(null)} className="rounded-lg p-1 transition-colors hover:bg-white/10">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}