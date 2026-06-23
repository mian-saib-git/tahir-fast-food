import React, { useState } from 'react';
import {
  Bike,
  ClipboardPlus,
  LayoutDashboard,
  LogOut,
  Menu,
  Soup,
  Users,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const logo = '/assets/tahir-logo.png';
const sidebarBg = '/assets/sidebar-bg.jpg';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'orders',    label: 'New Order',   icon: ClipboardPlus },
  { id: 'history',   label: 'Order Desk',  icon: Bike },
  { id: 'menu',      label: 'Menu Items',  icon: Soup },
  { id: 'staff',     label: 'Team & Riders', icon: Users },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [showSignOut,  setShowSignOut]  = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const handleSignOut = async () => {
    setShowSignOut(false);
    await supabase.auth.signOut();
    sessionStorage.clear();
    window.location.reload();
  };

  const SidebarContent = () => (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(12,8,6,0.82), rgba(16,10,8,0.95)), url(${sidebarBg})`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(244,199,106,0.16),transparent_34%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_30%,rgba(57,213,255,0.08),transparent_24%)]" />

      <div className="relative z-10 flex h-full flex-col px-5 py-6">
        {/* Logo block */}
        <div className="mb-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur-xl shadow-[0_20px_55px_rgba(0,0,0,0.30)]">
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.5rem] bg-white/5 ring-1 ring-white/10">
                <img src={logo} alt="Tahir Fast Food" className="h-24 w-24 object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#f4c76a]">Tahir</p>
                <h1 className="mt-1 text-2xl font-black uppercase leading-none tracking-tight text-white">Fast Food</h1>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Order Suite</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-300',
                  active
                    ? 'bg-[linear-gradient(135deg,#e0f7ff,#86e7ff)] text-[#08212a] shadow-[0_16px_34px_rgba(57,213,255,0.25)] scale-[1.01]'
                    : 'border border-white/0 text-white/72 hover:border-white/10 hover:bg-white/[0.07] hover:text-white hover:translate-y-[-2px]'
                )}
              >
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition', active ? 'bg-white/60 shadow-inner' : 'bg-white/[0.06] group-hover:bg-white/[0.10]')}>
                  <Icon size={18} />
                </span>
                <span className="text-sm font-bold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="border-t border-white/10 pt-5">
          <button
            onClick={() => setShowSignOut(true)}
            className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-white/48 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] group-hover:bg-red-500/15">
              <LogOut size={18} />
            </span>
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Sign out confirmation modal */}
      {showSignOut && (
        <div
          style={{
            position:'fixed', inset:0, zIndex:9999,
            background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}
          onClick={() => setShowSignOut(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background:'linear-gradient(145deg,#1a0800,#2e1205)',
              borderRadius:28, padding:32, maxWidth:360, width:'90%',
              border:'1px solid rgba(244,199,106,0.2)',
              boxShadow:'0 40px 100px rgba(0,0,0,0.6)',
              textAlign:'center',
            }}
          >
            <div style={{ fontSize:44, marginBottom:12 }}>👋</div>
            <h3 style={{ margin:0, fontSize:20, fontWeight:900, color:'#fff' }}>Sign Out?</h3>
            <p style={{ margin:'10px 0 24px', fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:600, lineHeight:1.5 }}>
              Are you sure you want to sign out of Tahir Fast Food POS?
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button
                onClick={() => setShowSignOut(false)}
                style={{ flex:1, height:46, borderRadius:14, border:'1.5px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.75)', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                style={{ flex:1, height:46, borderRadius:14, border:'none', background:'linear-gradient(135deg,#dc2626,#991b1b)', color:'#fff', fontSize:13, fontWeight:900, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 6px 20px rgba(220,38,38,0.4)' }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#1c0905]/92 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tahir" className="h-10 w-10 object-contain" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#f4c76a]">Tahir</p>
            <p className="text-sm font-black text-white">Fast Food</p>
          </div>
        </div>
        <button onClick={() => setMobileOpen(true)} className="rounded-xl bg-white/10 p-2 text-white backdrop-blur">
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn('fixed inset-y-0 left-0 z-50 w-72 overflow-hidden transition-transform duration-300 lg:hidden', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 z-20 rounded-xl bg-white/10 p-2 text-white">
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 overflow-hidden lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}