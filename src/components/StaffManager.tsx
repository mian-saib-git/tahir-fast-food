import {
  Bike,
  Edit3,
  Save,
  Trash2,
  UserPlus,
  X,
  Users,
  ChefHat,
  BadgeDollarSign,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { storage } from '../lib/storage';
import { makeId, money } from '../lib/utils';
import { DeliveryBoy, Employee, EmployeeRole, Order } from '../types';

type StaffEntry = Employee | DeliveryBoy;
type StaffForm = Partial<Employee> & Partial<Omit<DeliveryBoy, 'role'>> & { role?: EmployeeRole };
type SectionKey = 'managers' | 'workers' | 'chefs' | 'support' | 'riders';

const emptyStaff: StaffForm = { name: '', phone: '', role: 'staff', shift: 'Evening' };
const roles: EmployeeRole[] = ['admin','manager','staff','chef','cashier','customer_support','delivery_boy'];

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

const SECTION_META: Record<SectionKey, { label: string; icon: React.ElementType; gradient: string; accent: string; glow: string; emoji: string }> = {
  managers: { label: 'Managers',  icon: Briefcase,       gradient: 'linear-gradient(135deg,#2d1200,#7c3a00)', accent: '#f4c76a', glow: 'rgba(244,199,106,0.35)', emoji: '👔' },
  workers:  { label: 'Workers',   icon: Users,           gradient: 'linear-gradient(135deg,#0d1f3c,#1e3a6e)', accent: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  emoji: '🧑‍💼' },
  chefs:    { label: 'Chefs',     icon: ChefHat,         gradient: 'linear-gradient(135deg,#1a0a00,#7c2e00)', accent: '#fb923c', glow: 'rgba(251,146,60,0.35)',  emoji: '👨‍🍳' },
  support:  { label: 'Support',   icon: BadgeDollarSign, gradient: 'linear-gradient(135deg,#001a1f,#005c69)', accent: '#34d399', glow: 'rgba(52,211,153,0.35)',  emoji: '💬' },
  riders:   { label: 'Riders',    icon: Bike,            gradient: 'linear-gradient(135deg,#0f0026,#3d0066)', accent: '#c084fc', glow: 'rgba(192,132,252,0.35)', emoji: '🏍️' },
};

// ── Labeled form field wrapper ───────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 10, fontWeight: 900, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'rgba(244,199,106,0.75)',
        paddingLeft: 4,
      }}>{label}</label>
      {children}
    </div>
  );
}

const darkInputStyle: React.CSSProperties = {
  height: 46, borderRadius: 14,
  border: '1.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff', padding: '0 16px',
  fontSize: 13, fontWeight: 600,
  outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box',
};

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffEntry[]>(storage.getEmployees());
  const [orders, setOrders] = useState<Order[]>(storage.getOrders());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyStaff);
  const [activeSection, setActiveSection] = useState<SectionKey>('riders');

  useEffect(() => {
    const sync = () => { setStaff(storage.getEmployees()); setOrders(storage.getOrders()); };
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('focus', sync); window.removeEventListener('storage', sync); };
  }, []);

  const saveAllStaff  = (next: StaffEntry[]) => { setStaff(next); storage.saveEmployees(next); };
  const saveAllOrders = (next: Order[])       => { setOrders(next); storage.saveOrders(next); };

  const startAdd  = () => { setEditingId('new'); setForm(emptyStaff); };
  const startEdit = (m: StaffEntry) => { setEditingId(m.id); setForm(m); };
  const cancel    = () => { setEditingId(null); setForm(emptyStaff); };

  const save = () => {
    if (!form.name || !form.phone || !form.role) { alert('Please fill name, phone, and role.'); return; }
    const entry = {
      id: editingId === 'new' ? makeId('emp') : editingId!,
      name: form.name, role: form.role, phone: form.phone,
      email: form.email, cnic: form.cnic, shift: form.shift,
      salary: safeNumber(form.salary), active: true,
      ...(form.role === 'delivery_boy' ? { vehicleNumber: form.vehicleNumber, status: form.status || 'available' } : {}),
    } as StaffEntry;
    const next = editingId === 'new' ? [entry, ...staff] : staff.map(m => m.id === editingId ? entry : m);
    saveAllStaff(next); cancel();
  };

  const remove = (id: string) => {
    if (!confirm('Remove this team member?')) return;
    saveAllStaff(staff.filter(m => m.id !== id));
  };

  const releaseRiderOrders = (riderId: string) => {
    saveAllOrders(orders.map(o =>
      o.deliveryBoyId !== riderId ? o
      : { ...o, deliveryBoyId: undefined, status: o.status === 'out_for_delivery' ? 'ready' : o.status, updatedAt: Date.now() }
    ));
  };

  const setRiderStatus = (id: string, status: DeliveryBoy['status']) => {
    if (status === 'available' || status === 'offline') releaseRiderOrders(id);
    saveAllStaff(staff.map(m => m.id === id && m.role === 'delivery_boy' ? { ...m, status, active: true } : m) as StaffEntry[]);
  };

  const riders   = useMemo(() => staff.filter((m): m is DeliveryBoy => m.role === 'delivery_boy'), [staff]);
  const managers = staff.filter(m => m.role === 'admin' || m.role === 'manager');
  const workers  = staff.filter(m => m.role === 'staff');
  const chefs    = staff.filter(m => m.role === 'chef');
  const support  = staff.filter(m => m.role === 'cashier' || m.role === 'customer_support');

  const sectionData: Record<SectionKey, StaffEntry[]> = { managers, workers, chefs, support, riders };

  const totalStaff   = staff.length;
  const activeRiders = riders.filter(r => r.status !== 'offline').length;
  const busyRiders   = riders.filter(r => r.status === 'on_delivery').length;

  return (
    <>
      <style>{`
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .float-in  { animation: floatIn 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .staff-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .staff-card:hover { transform: translateY(-3px); box-shadow: 0 24px 60px rgba(0,0,0,0.22) !important; }
        .section-tab { transition: all 0.25s cubic-bezier(0.22,1,0.36,1); }
        .dark-input:focus { border-color: rgba(244,199,106,0.5) !important; background: rgba(255,255,255,0.09) !important; }
      `}</style>

      <div style={{ fontFamily: "'Sora','Nunito',sans-serif" }} className="space-y-8">

        {/* ══ HERO HEADER ══════════════════════════════════════════════════════ */}
        <div style={{
          borderRadius: 32, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(145deg,#0c0602,#2b1206,#4a1e0b)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.45)',
          border: '1px solid rgba(244,199,106,0.12)',
        }}>
          <div style={{ position:'absolute', top:-60, left:-40, width:280, height:280, borderRadius:'50%', background:'rgba(244,199,106,0.10)', filter:'blur(60px)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-80, right:-40, width:320, height:320, borderRadius:'50%', background:'rgba(192,132,252,0.07)', filter:'blur(70px)', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1, padding:'30px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24 }}>
            <div>
              <p style={{ margin:0, fontSize:10, fontWeight:900, letterSpacing:'0.28em', textTransform:'uppercase', color:'#f4c76a', opacity:0.7 }}>Human Resources</p>
              <h2 style={{ margin:'6px 0 0', fontSize:36, fontWeight:900, color:'#fff', lineHeight:1, fontStyle:'italic' }}>Team & Riders</h2>
              <p style={{ margin:'8px 0 0', fontSize:13, color:'rgba(255,255,255,0.45)', fontWeight:600 }}>Manage your complete team with live delivery tracking</p>
            </div>

            {/* Stats row */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
              {[
                { label:'Total Staff',   value: totalStaff,   color:'#f4c76a' },
                { label:'Active Riders', value: activeRiders, color:'#c084fc' },
                { label:'On Delivery',   value: busyRiders,   color:'#34d399' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'12px 20px', textAlign:'center', minWidth:80 }}>
                  <p style={{ margin:0, fontSize:26, fontWeight:900, color:s.color, lineHeight:1, fontFamily:'monospace' }}>{s.value}</p>
                  <p style={{ margin:'5px 0 0', fontSize:9, fontWeight:800, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>{s.label}</p>
                </div>
              ))}
              <button onClick={startAdd} style={{
                display:'flex', alignItems:'center', gap:9,
                background:'linear-gradient(135deg,#f4c76a,#e0a830)',
                color:'#1a0800', border:'none', borderRadius:20,
                padding:'14px 22px', fontSize:12, fontWeight:900, cursor:'pointer',
                letterSpacing:'0.06em', textTransform:'uppercase',
                boxShadow:'0 8px 28px rgba(244,199,106,0.45)',
                transition:'transform 0.15s, box-shadow 0.15s', whiteSpace:'nowrap',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; }}
              >
                <UserPlus size={16} /> Add Member
              </button>
            </div>
          </div>

          {/* Section tab bar */}
          <div style={{ position:'relative', zIndex:1, borderTop:'1px solid rgba(255,255,255,0.07)', padding:'0 32px', display:'flex', gap:4, overflowX:'auto', scrollbarWidth:'none' }}>
            {(Object.keys(SECTION_META) as SectionKey[]).map(key => {
              const m = SECTION_META[key];
              const active = activeSection === key;
              const count = sectionData[key].length;
              return (
                <button key={key} onClick={() => setActiveSection(key)} className="section-tab" style={{
                  flexShrink:0, display:'flex', alignItems:'center', gap:8,
                  padding:'14px 18px', border:'none',
                  borderBottom: active ? `3px solid ${m.accent}` : '3px solid transparent',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: active ? m.accent : 'rgba(255,255,255,0.45)',
                  cursor:'pointer', fontSize:12, fontWeight:800,
                  letterSpacing:'0.05em', textTransform:'uppercase',
                }}>
                  <span style={{ fontSize:16 }}>{m.emoji}</span>
                  {m.label}
                  <span style={{
                    background: active ? m.accent : 'rgba(255,255,255,0.12)',
                    color: active ? '#111' : 'rgba(255,255,255,0.5)',
                    borderRadius:999, padding:'2px 8px', fontSize:10, fontWeight:900,
                  }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ EDITOR ══════════════════════════════════════════════════════════ */}
        {editingId && (
          <div className="float-in" style={{
            borderRadius:28, overflow:'hidden',
            background:'linear-gradient(145deg,#1a0800,#2e1205)',
            border:'1px solid rgba(244,199,106,0.2)',
            boxShadow:'0 32px 80px rgba(0,0,0,0.5)',
          }}>
            {/* Editor header */}
            <div style={{ background:'linear-gradient(90deg,rgba(244,199,106,0.12),transparent)', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <p style={{ margin:0, fontSize:10, fontWeight:900, letterSpacing:'0.2em', textTransform:'uppercase', color:'#f4c76a', opacity:0.7 }}>{editingId === 'new' ? 'New Member' : 'Edit Member'}</p>
                <h3 style={{ margin:'4px 0 0', fontSize:22, fontWeight:900, color:'#fff', fontStyle:'italic' }}>
                  {editingId === 'new' ? '➕ Add Team Member' : `✏️ Editing: ${form.name || 'Member'}`}
                </h3>
              </div>
              <button onClick={cancel} style={{ background:'rgba(255,255,255,0.08)', border:'none', borderRadius:12, padding:8, cursor:'pointer', color:'rgba(255,255,255,0.6)', display:'flex' }}><X size={18} /></button>
            </div>

            <div style={{ padding:24 }}>
              {/* ── Row 1: core info ── */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:14 }}>
                <FormField label="Full Name *">
                  <input className="dark-input" style={darkInputStyle} type="text" value={form.name||''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ali Hassan" />
                </FormField>
                <FormField label="Phone Number *">
                  <input className="dark-input" style={darkInputStyle} type="text" value={form.phone||''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="03xx-xxxxxxx" />
                </FormField>
                <FormField label="Email Address">
                  <input className="dark-input" style={darkInputStyle} type="email" value={form.email||''} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" />
                </FormField>
                <FormField label="CNIC Number">
                  <input className="dark-input" style={darkInputStyle} type="text" value={form.cnic||''} onChange={e => setForm({ ...form, cnic: e.target.value })} placeholder="xxxxx-xxxxxxx-x" />
                </FormField>
                <FormField label="Work Shift">
                  <input className="dark-input" style={darkInputStyle} type="text" value={form.shift||''} onChange={e => setForm({ ...form, shift: e.target.value })} placeholder="e.g. Morning / Evening" />
                </FormField>
                <FormField label="Monthly Salary (Rs)">
                  <input className="dark-input" style={darkInputStyle} type="number" value={String(form.salary||'')} onChange={e => setForm({ ...form, salary: safeNumber(e.target.value) })} placeholder="e.g. 25000" />
                </FormField>
                <FormField label="Role / Position *">
                  <select className="dark-input" style={{ ...darkInputStyle, cursor:'pointer', appearance:'none' }} value={form.role||'staff'} onChange={e => setForm({ ...form, role: e.target.value as EmployeeRole })}>
                    {roles.map(r => <option key={r} value={r} style={{ background:'#1a0800' }}>{r.replace('_',' ')}</option>)}
                  </select>
                </FormField>
              </div>

              {/* ── Rider-only fields ── */}
              {form.role === 'delivery_boy' && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:14, padding:16, background:'rgba(192,132,252,0.07)', borderRadius:18, border:'1px solid rgba(192,132,252,0.2)' }}>
                  <p style={{ gridColumn:'1/-1', margin:'0 0 4px', fontSize:11, fontWeight:900, color:'#c084fc', textTransform:'uppercase', letterSpacing:'0.12em' }}>🏍️ Rider Information</p>
                  <FormField label="Vehicle / Bike Number">
                    <input className="dark-input" style={darkInputStyle} type="text" value={form.vehicleNumber||''} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="e.g. LHR-1234" />
                  </FormField>
                  <FormField label="Current Status">
                    <select className="dark-input" style={{ ...darkInputStyle, cursor:'pointer', appearance:'none' }} value={form.status||'available'} onChange={e => setForm({ ...form, status: e.target.value as DeliveryBoy['status'] })}>
                      <option value="available" style={{ background:'#1a0800' }}>✅ Available</option>
                      <option value="on_delivery" style={{ background:'#1a0800' }}>🚀 On Delivery</option>
                      <option value="offline" style={{ background:'#1a0800' }}>⛔ Offline</option>
                    </select>
                  </FormField>
                </div>
              )}

              <button onClick={save} style={{
                display:'flex', alignItems:'center', gap:8,
                background:'linear-gradient(135deg,#f4c76a,#d4960a)',
                color:'#1a0800', border:'none', borderRadius:14,
                padding:'14px 28px', fontSize:13, fontWeight:900,
                cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase',
                boxShadow:'0 8px 24px rgba(244,199,106,0.4)',
                transition:'transform 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; }}
              >
                <Save size={16} /> Save Member
              </button>
            </div>
          </div>
        )}

        {/* ══ CONTENT ═════════════════════════════════════════════════════════ */}
        {activeSection === 'riders'
          ? <RidersSection riders={riders} orders={orders} setRiderStatus={setRiderStatus} startEdit={startEdit} remove={remove} />
          : <StaffSection  section={activeSection} members={sectionData[activeSection]} startEdit={startEdit} remove={remove} />
        }
      </div>
    </>
  );
}

// ══ RIDERS ════════════════════════════════════════════════════════════════════
function RidersSection({ riders, orders, setRiderStatus, startEdit, remove }: {
  riders: DeliveryBoy[]; orders: Order[];
  setRiderStatus: (id: string, s: DeliveryBoy['status']) => void;
  startEdit: (m: any) => void; remove: (id: string) => void;
}) {
  const getActiveOrder = (id: string) =>
    orders.find(o => o.deliveryBoyId === id && o.status === 'out_for_delivery');

  const getRideStats = (id: string) => {
    const now = new Date();
    const isToday = (timestamp?: number) => {
      if (!timestamp) return false;
      const date = new Date(timestamp);
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    };

    const delivered = orders.filter(
      order => order.deliveryBoyId === id && order.status === 'delivered'
    );

    return {
      today: delivered.filter(order => isToday(order.deliveredAt || order.updatedAt)).length,
      total: delivered.length,
    };
  };

  const statusConfig = {
    available:   { label:'Available',   dot:'#34d399', headerBg:'linear-gradient(135deg,#064e2e,#0d7a4a)', text:'#34d399',  border:'rgba(52,211,153,0.3)' },
    on_delivery: { label:'On Delivery', dot:'#60a5fa', headerBg:'linear-gradient(135deg,#0d2244,#1a4080)', text:'#60a5fa',  border:'rgba(96,165,250,0.3)' },
    offline:     { label:'Offline',     dot:'#6b7280', headerBg:'linear-gradient(135deg,#1a1a1a,#2a2a2a)', text:'#9ca3af', border:'rgba(107,114,128,0.2)' },
  };

  return (
    <div className="float-in" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Section header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:4, height:32, borderRadius:4, background:'linear-gradient(180deg,#c084fc,#7c3aed)' }} />
          <div>
            <p style={{ margin:0, fontSize:12, fontWeight:900, color:'#c084fc', textTransform:'uppercase', letterSpacing:'0.15em' }}>Live Fleet</p>
            <p style={{ margin:0, fontSize:20, fontWeight:900, color:'#24110c' }}>Delivery Riders</p>
          </div>
        </div>

        {/* FIX: Status summary as cards, not pills */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {(['available','on_delivery','offline'] as const).map(s => {
            const cfg = statusConfig[s];
            const count = riders.filter(r => (r.status || 'available') === s).length;
            return (
              <div key={s} style={{
                background: '#fff',
                border: `1.5px solid ${cfg.border}`,
                borderRadius: 16,
                padding: '10px 16px',
                display:'flex', alignItems:'center', gap:10,
                boxShadow: `0 4px 14px ${cfg.border}`,
                minWidth: 110,
              }}>
                <div style={{ width: 10, height: 10, borderRadius:'50%', background: cfg.dot, boxShadow:`0 0 8px ${cfg.dot}`, flexShrink:0 }} />
                <div>
                  <p style={{ margin:0, fontSize:18, fontWeight:900, color:'#24110c', lineHeight:1, fontFamily:'monospace' }}>{count}</p>
                  <p style={{ margin:'3px 0 0', fontSize:9, fontWeight:800, color: cfg.text, textTransform:'uppercase', letterSpacing:'0.1em', whiteSpace:'nowrap' }}>{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {riders.length === 0 ? (
        <div style={{ borderRadius:28, border:'2px dashed rgba(192,132,252,0.3)', background:'rgba(192,132,252,0.04)', padding:'48px 24px', textAlign:'center' }}>
          <p style={{ margin:0, fontSize:40 }}>🏍️</p>
          <p style={{ margin:'12px 0 0', fontSize:15, fontWeight:800, color:'rgba(0,0,0,0.35)' }}>No riders added yet</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {riders.map((rider, i) => {
            const status = rider.status || 'available';
            const cfg = statusConfig[status];
            const liveOrder = getActiveOrder(rider.id);
            const rideStats = getRideStats(rider.id);
            return (
              <div key={rider.id} className="staff-card float-in" style={{
                animationDelay: `${i * 0.06}s`,
                borderRadius: 24, background:'#fff',
                border: `1.5px solid ${cfg.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.09)',
                overflow:'hidden',
              }}>
                {/* Top band with status colour */}
                <div style={{ background: cfg.headerBg, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.07)', filter:'blur(20px)' }} />
                  <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:50, height:50, borderRadius:18, background:'rgba(255,255,255,0.12)', border:'2px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🏍️</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, fontSize:16, fontWeight:900, color:'#fff' }}>{rider.name}</p>
                      <p style={{ margin:'3px 0 0', fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600 }}>{rider.phone}</p>
                    </div>
                    {/* Status indicator dot */}
                    <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(0,0,0,0.25)', borderRadius:999, padding:'5px 10px' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:cfg.dot, boxShadow:`0 0 8px ${cfg.dot}` }} />
                      <span style={{ fontSize:10, fontWeight:900, color:cfg.text, textTransform:'uppercase', letterSpacing:'0.08em' }}>{cfg.label}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:12 }}>
                  {/* Vehicle and ride-count cards */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:8 }}>
                    <div style={{ background:'#f8f9fa', borderRadius:14, padding:'10px 12px', minWidth:0 }}>
                      <p style={{ margin:0, fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af' }}>Vehicle</p>
                      <p style={{ margin:'4px 0 0', fontSize:12, fontWeight:900, color:'#24110c', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rider.vehicleNumber || 'Not set'}</p>
                    </div>
                    <div style={{ background:'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderRadius:14, padding:'10px 12px', border:'1px solid rgba(16,185,129,0.18)' }}>
                      <p style={{ margin:0, fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#059669' }}>Rides Today</p>
                      <p style={{ margin:'4px 0 0', fontSize:20, lineHeight:1, fontWeight:900, color:'#047857', fontFamily:'monospace' }}>{rideStats.today}</p>
                    </div>
                    <div style={{ background:'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderRadius:14, padding:'10px 12px', border:'1px solid rgba(124,58,237,0.15)' }}>
                      <p style={{ margin:0, fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', color:'#7c3aed' }}>Total Rides</p>
                      <p style={{ margin:'4px 0 0', fontSize:20, lineHeight:1, fontWeight:900, color:'#6d28d9', fontFamily:'monospace' }}>{rideStats.total}</p>
                    </div>
                  </div>

                  {/* Live order card */}
                  {liveOrder ? (
                    <div style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius:16, padding:'12px 14px', border:'1px solid rgba(96,165,250,0.3)' }}>
                      <p style={{ margin:'0 0 6px', fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.14em', color:'#3b82f6' }}>🔵 Live Delivery</p>
                      <p style={{ margin:0, fontSize:13, fontWeight:900, color:'#1e3a5f' }}>{liveOrder.orderNumber} — {liveOrder.customerName || 'Walk-in customer'}</p>
                      {liveOrder.customerPhone && <p style={{ margin:'2px 0 0', fontSize:11, color:'#4b7ab8', fontWeight:600 }}>{liveOrder.customerPhone}</p>}
                      {liveOrder.customerAddress && (
                        <div style={{ display:'flex', gap:5, marginTop:6, alignItems:'flex-start' }}>
                          <MapPin size={11} color="#60a5fa" style={{ marginTop:1, flexShrink:0 }} />
                          <p style={{ margin:0, fontSize:11, color:'#4b7ab8', lineHeight:1.4 }}>{liveOrder.customerAddress}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ background:'rgba(0,0,0,0.03)', borderRadius:14, padding:'10px 14px', border:'1px solid rgba(0,0,0,0.06)', textAlign:'center' }}>
                      <p style={{ margin:0, fontSize:12, fontWeight:700, color:'rgba(0,0,0,0.3)' }}>No active delivery</p>
                    </div>
                  )}

                  {/* FIX: Status selector as a labeled card, not a pill */}
                  <div style={{ background:'#f8f9fa', borderRadius:14, padding:'10px 14px', border:'1px solid rgba(0,0,0,0.07)' }}>
                    <p style={{ margin:'0 0 8px', fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.12em', color:'#9ca3af' }}>Update Rider Status</p>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                      {(['available','on_delivery','offline'] as const).map(s => {
                        const c = statusConfig[s];
                        const isActive = status === s;
                        return (
                          <button key={s} onClick={() => setRiderStatus(rider.id, s)} style={{
                            border: isActive ? `2px solid ${c.dot}` : '1.5px solid rgba(0,0,0,0.08)',
                            background: isActive ? c.headerBg : '#fff',
                            borderRadius:12, padding:'8px 4px', cursor:'pointer',
                            display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                            transition:'all 0.15s',
                          }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background: isActive ? c.dot : '#d1d5db', boxShadow: isActive ? `0 0 8px ${c.dot}` : 'none' }} />
                            <span style={{ fontSize:9, fontWeight:900, color: isActive ? c.text : '#6b7280', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
                              {s === 'on_delivery' ? 'On Delivery' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => startEdit(rider)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(192,132,252,0.1)', border:'1px solid rgba(192,132,252,0.25)', borderRadius:12, padding:'10px 0', fontSize:12, fontWeight:800, color:'#7c3aed', cursor:'pointer' }}>
                      <Edit3 size={14} /> Edit
                    </button>
                    <button onClick={() => remove(rider.id)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'10px 0', fontSize:12, fontWeight:800, color:'#dc2626', cursor:'pointer' }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══ STAFF SECTION ════════════════════════════════════════════════════════════
function StaffSection({ section, members, startEdit, remove }: {
  section: Exclude<SectionKey,'riders'>; members: StaffEntry[];
  startEdit: (m: StaffEntry) => void; remove: (id: string) => void;
}) {
  const meta = SECTION_META[section];
  const roleEmoji: Record<string, string> = {
    admin:'👑', manager:'👔', staff:'🧑‍💼', chef:'👨‍🍳', cashier:'💰', customer_support:'💬', delivery_boy:'🏍️',
  };

  return (
    <div className="float-in" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 4px' }}>
        <div style={{ width:4, height:32, borderRadius:4, background:meta.gradient }} />
        <div>
          <p style={{ margin:0, fontSize:12, fontWeight:900, color:meta.accent, textTransform:'uppercase', letterSpacing:'0.15em' }}>{meta.emoji} {meta.label}</p>
          <p style={{ margin:0, fontSize:20, fontWeight:900, color:'#24110c' }}>{members.length} Member{members.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {members.length === 0 ? (
        <div style={{ borderRadius:28, border:`2px dashed ${meta.accent}44`, background:`${meta.accent}08`, padding:'48px 24px', textAlign:'center' }}>
          <p style={{ margin:0, fontSize:40 }}>{meta.emoji}</p>
          <p style={{ margin:'12px 0 0', fontSize:15, fontWeight:800, color:'rgba(0,0,0,0.35)' }}>No {meta.label.toLowerCase()} added yet</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
          {members.map((member, i) => (
            <div key={member.id} className="staff-card float-in" style={{
              animationDelay:`${i * 0.06}s`,
              borderRadius:24, background:'#fff',
              border:'1.5px solid rgba(0,0,0,0.07)',
              boxShadow:'0 8px 32px rgba(0,0,0,0.08)',
              overflow:'hidden',
            }}>
              {/* Top band */}
              <div style={{ background:meta.gradient, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-15, right:-15, width:70, height:70, borderRadius:'50%', background:`${meta.accent}20`, filter:'blur(16px)' }} />
                <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:48, height:48, borderRadius:16, background:`${meta.accent}22`, border:`2px solid ${meta.accent}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                    {roleEmoji[member.role] || '🧑'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:15, fontWeight:900, color:'#fff' }}>{member.name}</p>
                    <p style={{ margin:'2px 0 0', fontSize:10, fontWeight:800, color:meta.accent, textTransform:'uppercase', letterSpacing:'0.1em' }}>{member.role.replace('_',' ')}</p>
                  </div>
                </div>
              </div>

              {/* Info cards grid */}
              <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { icon:<Phone size={13} />,         label:'Phone',   value: member.phone },
                  { icon:<Mail size={13} />,           label:'Email',   value: member.email || '—' },
                  { icon:<Clock size={13} />,          label:'Shift',   value: member.shift || 'Not set' },
                  { icon:<BadgeDollarSign size={13} />,label:'Salary',  value: member.salary ? money(safeNumber(member.salary)) + '/mo' : 'Not set' },
                ].map((row, idx) => (
                  <div key={idx} style={{ background:'#f8f9fa', borderRadius:12, padding:'8px 12px', display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ color:meta.accent, flexShrink:0, opacity:0.8 }}>{row.icon}</span>
                    <div style={{ minWidth:0 }}>
                      <p style={{ margin:0, fontSize:8, fontWeight:900, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.1em' }}>{row.label}</p>
                      <p style={{ margin:'2px 0 0', fontSize:12, fontWeight:700, color: row.value === '—' || row.value === 'Not set' ? '#d1d5db' : '#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{row.value}</p>
                    </div>
                  </div>
                ))}

                {/* Actions */}
                <div style={{ display:'flex', gap:8, marginTop:4 }}>
                  <button onClick={() => startEdit(member)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:`${meta.accent}18`, border:`1px solid ${meta.accent}40`, borderRadius:12, padding:'10px 0', fontSize:12, fontWeight:800, color:meta.accent, cursor:'pointer' }}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => remove(member.id)} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'10px 0', fontSize:12, fontWeight:800, color:'#dc2626', cursor:'pointer' }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}