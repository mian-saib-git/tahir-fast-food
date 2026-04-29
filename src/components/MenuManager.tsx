// MenuManager.tsx — full replacement

import { Edit3, PackagePlus, Save, Search, Star, Trash2, X, ChevronDown, Tag, DollarSign, AlignLeft, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { storage } from '../lib/storage';
import { makeId, money } from '../lib/utils';
import { CATEGORIES, MenuItem } from '../types';

const emptyItem: Partial<MenuItem> = {
  name: '', price: 0, category: CATEGORIES[0],
  description: '', isAvailable: true, isPopular: false,
};

const CATEGORY_META: Record<string, { emoji: string; color: string; bg: string; accent: string }> = {
  Pizza:              { emoji: '🍕', color: '#c0392b', bg: '#fff0ee', accent: '#e74c3c' },
  Burger:             { emoji: '🍔', color: '#a0522d', bg: '#fff4ed', accent: '#c0632d' },
  Burgers:            { emoji: '🍔', color: '#a0522d', bg: '#fff4ed', accent: '#c0632d' },
  Sandwich:           { emoji: '🥪', color: '#5a7a1a', bg: '#f4faeb', accent: '#6b8e23' },
  Shawarma:           { emoji: '🌮', color: '#b8860b', bg: '#fffbe8', accent: '#d4a017' },
  'Shawarma & Rolls': { emoji: '🌯', color: '#b8860b', bg: '#fffbe8', accent: '#d4a017' },
  Rolls:              { emoji: '🌯', color: '#d4670b', bg: '#fff3e8', accent: '#e07820' },
  Fries:              { emoji: '🍟', color: '#c49a00', bg: '#fffde8', accent: '#d4a017' },
  Drinks:             { emoji: '🧃', color: '#1a6b8a', bg: '#e8f6fb', accent: '#2196b8' },
  'Cold Drinks':      { emoji: '🥤', color: '#1a7a6b', bg: '#e8faf6', accent: '#1a9e8a' },
  'Hot Drinks':       { emoji: '☕', color: '#7b4a1a', bg: '#faf0e8', accent: '#9b6030' },
  Soup:               { emoji: '🥣', color: '#8b4513', bg: '#f8f0e8', accent: '#a05520' },
  Dessert:            { emoji: '🍰', color: '#c2185b', bg: '#fce8f3', accent: '#e91e8c' },
  Deal:               { emoji: '⭐', color: '#6d28d9', bg: '#f0eeff', accent: '#7c3aed' },
  Deals:              { emoji: '🎯', color: '#6d28d9', bg: '#f0eeff', accent: '#7c3aed' },
  Chicken:            { emoji: '🍗', color: '#b06a00', bg: '#fff4e0', accent: '#c07820' },
  Rice:               { emoji: '🍚', color: '#5a7a1a', bg: '#f4faeb', accent: '#6b8e23' },
  Biryani:            { emoji: '🍛', color: '#8b4513', bg: '#f8f0e8', accent: '#a05520' },
  Pasta:              { emoji: '🍝', color: '#c0392b', bg: '#fff0ee', accent: '#e74c3c' },
  Salad:              { emoji: '🥗', color: '#2e7d32', bg: '#eaf5eb', accent: '#388e3c' },
  Snacks:             { emoji: '🍿', color: '#9b6030', bg: '#fff4e8', accent: '#b07040' },
  BBQ:                { emoji: '🍖', color: '#b71c1c', bg: '#fdecea', accent: '#c62828' },
  Wings:              { emoji: '🍗', color: '#b06a00', bg: '#fff4e0', accent: '#c07820' },
  Wrap:               { emoji: '🌮', color: '#5a7a1a', bg: '#f4faeb', accent: '#6b8e23' },
  Cake:               { emoji: '🎂', color: '#c2185b', bg: '#fce8f3', accent: '#e91e8c' },
};

function getMeta(cat: string) {
  return CATEGORY_META[cat] ?? { emoji: '🍽️', color: '#9b6030', bg: '#fff4e8', accent: '#b07040' };
}

export default function MenuManager() {
  const [menu, setMenu]       = useState<MenuItem[]>(storage.getMenu());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]       = useState<Partial<MenuItem>>(emptyItem);
  const [query, setQuery]     = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Group items by category for the stat bar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: menu.length };
    menu.forEach(i => { counts[i.category] = (counts[i.category] ?? 0) + 1; });
    return counts;
  }, [menu]);

  const uniqueCategories = useMemo(
    () => ['All', ...Array.from(new Set(menu.map(i => i.category)))],
    [menu]
  );

  const filtered = useMemo(() =>
    menu.filter(item =>
      (activeCategory === 'All' || item.category === activeCategory) &&
      `${item.name} ${item.category} ${item.description ?? ''}`.toLowerCase().includes(query.toLowerCase())
    ),
    [menu, query, activeCategory]
  );

  const startAdd  = () => { setEditingId('new');  setForm(emptyItem); };
  const startEdit = (item: MenuItem) => { setEditingId(item.id); setForm(item); };
  const cancel    = () => { setEditingId(null); setForm(emptyItem); };

  const save = () => {
    if (!form.name || !form.category || Number(form.price) <= 0) {
      alert('Please enter item name, category, and a valid price.');
      return;
    }
    const next = editingId === 'new'
      ? [{ ...emptyItem, ...form, id: makeId('menu'), price: Number(form.price) } as MenuItem, ...menu]
      : menu.map(item => item.id === editingId ? { ...item, ...form, price: Number(form.price) } as MenuItem : item);
    setMenu(next); storage.saveMenu(next); cancel();
  };

  const remove = (id: string) => {
    if (confirm('Delete this menu item?')) {
      const next = menu.filter(i => i.id !== id);
      setMenu(next); storage.saveMenu(next);
    }
  };

  const toggleAvailability = (id: string) => {
    const next = menu.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item);
    setMenu(next); storage.saveMenu(next);
  };

  const togglePopular = (id: string) => {
    const next = menu.map(item => item.id === id ? { ...item, isPopular: !item.isPopular } : item);
    setMenu(next); storage.saveMenu(next);
  };

  const availableCount = menu.filter(i => i.isAvailable).length;
  const popularCount   = menu.filter(i => i.isPopular).length;

  return (
    <div style={{ fontFamily: "'Sora','Nunito',sans-serif" }}>
      <style>{`
        .mm-card {
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s cubic-bezier(0.22,1,0.36,1);
        }
        .mm-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 56px rgba(0,0,0,0.13), 0 4px 16px rgba(57,213,255,0.06) !important;
        }
        .mm-toggle {
          transition: all 0.2s ease;
        }
        .mm-toggle:hover { transform: scale(1.04); }
        .mm-cat-pill { transition: all 0.18s ease; cursor: pointer; }
        .mm-cat-pill:hover { transform: translateY(-1px); }
        @keyframes mmSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .mm-card-appear { animation: mmSlideIn 0.22s ease both; }
        @keyframes mmEditorIn { from{opacity:0;transform:translateY(-12px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        .mm-editor { animation: mmEditorIn 0.28s cubic-bezier(0.22,1,0.36,1); }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 900, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#f4c76a' }}>Catalog</p>
            <h2 style={{ margin: 0, fontSize: 38, fontWeight: 800, fontStyle: 'italic', color: '#fff', lineHeight: 1.1 }}>Menu Management</h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
              Add, edit, and manage all Tahir Café items
            </p>
          </div>
          <button
            onClick={startAdd}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: 'none', borderRadius: 18, padding: '13px 22px',
              background: 'linear-gradient(135deg,#1b0c08,#3d1508)',
              color: '#f4c76a', fontSize: 12, fontWeight: 900,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              boxShadow: '0 14px 28px rgba(0,0,0,0.3)', cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 18px 36px rgba(0,0,0,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 14px 28px rgba(0,0,0,0.3)'; }}
          >
            <PackagePlus size={16} /> Add Item
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Items',  value: menu.length,      color: '#f4c76a', bg: 'rgba(244,199,106,0.12)' },
            { label: 'Available',    value: availableCount,   color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
            { label: 'Hidden',       value: menu.length - availableCount, color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
            { label: 'Popular ★',   value: popularCount,     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: s.bg, borderRadius: 14, padding: '10px 16px',
              border: `1px solid ${s.color}22`,
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.value}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── SEARCH + FILTER BAR ── */}
      <div style={{
        borderRadius: 22, background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        backdropFilter: 'blur(12px)', padding: '16px 18px', marginBottom: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.08)', borderRadius: 16,
          border: '1.5px solid rgba(255,255,255,0.12)',
          padding: '0 16px', height: 46, marginBottom: 14,
        }}>
          <Search size={15} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, category, or description…"
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#fff', outline: 'none', fontFamily: 'inherit' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', borderRadius: 8, width: 22, height: 22, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
          {uniqueCategories.map(cat => {
            const meta   = getMeta(cat);
            const active = cat === activeCategory;
            const count  = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                className="mm-cat-pill"
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: active ? meta.bg : 'rgba(255,255,255,0.07)',
                  boxShadow: active ? `0 4px 16px ${meta.color}33` : 'none',
                  transform: active ? 'translateY(-1px)' : 'none',
                }}
              >
                <span style={{ fontSize: 14 }}>{cat === 'All' ? '🍽️' : meta.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: active ? meta.color : 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{cat}</span>
                <span style={{
                  fontSize: 9, fontWeight: 900, minWidth: 18, textAlign: 'center',
                  background: active ? meta.color : 'rgba(255,255,255,0.1)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.45)',
                  borderRadius: 999, padding: '1px 6px',
                }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── EDITOR ── */}
      {editingId && (
        <div className="mm-editor" style={{ marginBottom: 20 }}>
          <MenuEditor form={form} setForm={setForm} save={save} cancel={cancel} />
        </div>
      )}

      {/* ── RESULTS COUNT ── */}
      {(query || activeCategory !== 'All') && (
        <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
          Showing <span style={{ color: '#f4c76a', fontWeight: 900 }}>{filtered.length}</span> item{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' && <> in <span style={{ color: '#f4c76a' }}>{activeCategory}</span></>}
          {query && <> matching <span style={{ color: '#f4c76a' }}>"{query}"</span></>}
        </p>
      )}

      {/* ── MENU GRID ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 14,
      }}>
        {filtered.map((item, idx) => {
          const meta = getMeta(item.category);
          return (
            <div
              key={item.id}
              className="mm-card mm-card-appear"
              style={{
                animationDelay: `${Math.min(idx * 0.03, 0.35)}s`,
                borderRadius: 24, overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 8px 28px rgba(0,0,0,0.09)',
                border: `1px solid ${item.isAvailable ? 'rgba(0,0,0,0.06)' : 'rgba(239,68,68,0.18)'}`,
                opacity: item.isAvailable ? 1 : 0.72,
              }}
            >
              {/* Card top accent bar */}
              <div style={{ height: 5, background: `linear-gradient(90deg, ${meta.color}, ${meta.accent})` }} />

              <div style={{ padding: '16px 16px 14px' }}>
                {/* Top row — emoji + name + actions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  {/* Emoji bubble */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                    background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, boxShadow: `0 4px 14px ${meta.color}22`,
                    border: `1.5px solid ${meta.color}22`,
                  }}>
                    {meta.emoji}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: '0 0 3px', fontSize: 14, fontWeight: 800,
                      color: '#1a0a06', lineHeight: 1.3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.name}
                    </h3>
                    {/* Category pill */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: meta.bg, color: meta.color,
                      fontSize: 9, fontWeight: 900, padding: '3px 8px',
                      borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.07em',
                    }}>
                      {meta.emoji} {item.category}
                    </span>
                  </div>

                  {/* Edit / Delete */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEdit(item)} style={actionIconBtn('#e8f4ff', '#0284c7')}>
                      <Edit3 size={13} />
                    </button>
                    <button onClick={() => remove(item.id)} style={actionIconBtn('#fff0f0', '#dc2626')}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {item.description ? (
                  <p style={{
                    margin: '0 0 12px', fontSize: 11, color: '#6b6060', fontWeight: 500,
                    lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {item.description}
                  </p>
                ) : (
                  <p style={{ margin: '0 0 12px', fontSize: 11, color: '#c0a898', fontStyle: 'italic', fontWeight: 500 }}>
                    No description
                  </p>
                )}

                {/* Price */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg,#fff7e8,#fff)',
                  border: '1.5px solid #f0d8b0', borderRadius: 12,
                  padding: '6px 12px', marginBottom: 12,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#9b6030' }}>Price</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: '#c0632d' }}>
                    {money(item.price)}
                  </span>
                </div>

                {/* Toggle row */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {/* Available toggle */}
                  <button
                    className="mm-toggle"
                    onClick={() => toggleAvailability(item.id)}
                    style={{
                      flex: 1, border: 'none', borderRadius: 12, padding: '8px 6px',
                      fontSize: 10, fontWeight: 900, cursor: 'pointer',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: item.isAvailable ? '#dcfce7' : '#fee2e2',
                      color:      item.isAvailable ? '#15803d' : '#dc2626',
                    }}
                  >
                    {item.isAvailable ? '✓ Available' : '✕ Hidden'}
                  </button>

                  {/* Popular toggle */}
                  <button
                    className="mm-toggle"
                    onClick={() => togglePopular(item.id)}
                    style={{
                      flex: 1, border: 'none', borderRadius: 12, padding: '8px 6px',
                      fontSize: 10, fontWeight: 900, cursor: 'pointer',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: item.isPopular ? '#fef9c3' : 'rgba(0,0,0,0.04)',
                      color:      item.isPopular ? '#a16207' : '#9ca3af',
                    }}
                  >
                    {item.isPopular ? '★ Popular' : '☆ Not Popular'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🍽️</div>
            <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>
              {query ? 'No items match your search' : 'No items in this category'}
            </p>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
              {query ? 'Try a different keyword' : 'Add your first item to get started'}
            </p>
            {query && (
              <button onClick={() => setQuery('')} style={{ border: '1px solid rgba(244,199,106,0.3)', background: 'rgba(244,199,106,0.1)', borderRadius: 12, padding: '9px 20px', color: '#f4c76a', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Action icon button helper ──────────────────────────────────────────────
function actionIconBtn(bg: string, color: string) {
  return {
    width: 30, height: 30, border: 'none', borderRadius: 9,
    background: bg, color, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s',
  } as const;
}

// ── Editor panel ───────────────────────────────────────────────────────────
function MenuEditor({
  form, setForm, save, cancel,
}: {
  form: Partial<MenuItem>;
  setForm: (f: Partial<MenuItem>) => void;
  save: () => void;
  cancel: () => void;
}) {
  const meta = getMeta(form.category ?? '');
  return (
    <div style={{
      borderRadius: 28, background: 'linear-gradient(145deg,#1b0c08,#2e1205)',
      border: '1px solid rgba(244,199,106,0.18)',
      boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
      padding: '24px 24px 20px', color: '#fff',
    }}>
      {/* Editor header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(244,199,106,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {meta.emoji}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f4c76a' }}>
              {form.id ? 'Editing item' : 'New item'}
            </p>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontStyle: 'italic', color: '#fff' }}>
              {form.name || 'Item Details'}
            </h3>
          </div>
        </div>
        <button onClick={cancel} style={{ border: 'none', background: 'rgba(255,255,255,0.08)', borderRadius: 12, width: 36, height: 36, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={17} />
        </button>
      </div>

      {/* Form grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
        <EditorField label="Item Name" icon={<Tag size={13} />}>
          <input
            value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Zinger Burger"
            style={editorInputStyle}
          />
        </EditorField>

        <EditorField label="Category" icon={<ChevronDown size={13} />}>
          <select value={form.category || CATEGORIES[0]} onChange={e => setForm({ ...form, category: e.target.value })} style={editorInputStyle}>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ color: '#111', background: '#fff' }}>{c}</option>)}
          </select>
        </EditorField>

        <EditorField label="Price (Rs)" icon={<DollarSign size={13} />}>
          <input
            type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
            placeholder="e.g. 499"
            style={editorInputStyle}
          />
        </EditorField>
      </div>

      <EditorField label="Description (Optional)" icon={<AlignLeft size={13} />}>
        <input
          value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of the item…"
          style={{ ...editorInputStyle, width: '100%' }}
        />
      </EditorField>

      {/* Toggles + Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>
          <input type="checkbox" checked={!!form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
          Available
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#fff' }}>
          <input type="checkbox" checked={!!form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })} />
          <Sparkles size={12} style={{ color: '#f4c76a' }} /> Popular
        </label>
        <div style={{ flex: 1 }} />
        <button onClick={cancel} style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', borderRadius: 14, padding: '11px 20px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={save} style={{
          border: 'none', borderRadius: 14, padding: '11px 24px',
          background: 'linear-gradient(135deg,#f4c76a,#e9a820)',
          color: '#1b0c08', fontSize: 12, fontWeight: 900,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: '0 8px 20px rgba(244,199,106,0.3)',
        }}>
          <Save size={14} /> Save Item
        </button>
      </div>
    </div>
  );
}

function EditorField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ margin: '0 0 6px 2px', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: '#f4c76a' }}>{icon}</span> {label}
      </p>
      {children}
    </div>
  );
}

const editorInputStyle: React.CSSProperties = {
  width: '100%', height: 44, borderRadius: 14,
  border: '1.5px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff', padding: '0 14px',
  fontSize: 13, fontWeight: 700, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};