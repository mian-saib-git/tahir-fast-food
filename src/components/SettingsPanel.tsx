import { Save } from 'lucide-react';
import { useState } from 'react';
import { storage } from '../lib/storage';
import { CafeSettings } from '../types';

export default function SettingsPanel() {
  const [settings, setSettings] = useState<CafeSettings>(storage.getSettings());
  const save = () => {
    storage.saveSettings(settings);
    alert('Settings saved.');
  };
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#9b6030]">Business</p>
        <h2 className="font-display text-4xl font-bold italic text-[#24110c]">Cafe Settings</h2>
        <p className="mt-1 text-sm text-black/45">These details appear on receipts and new orders.</p>
      </div>
      <div className="premium-card p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Cafe Name" value={settings.cafeName} onChange={value => setSettings({ ...settings, cafeName: value })} />
          <Field label="Tagline" value={settings.tagline} onChange={value => setSettings({ ...settings, tagline: value })} />
          <Field label="Phone" value={settings.phone} onChange={value => setSettings({ ...settings, phone: value })} />
          <Field label="Default Delivery Fee" type="number" value={String(settings.defaultDeliveryFee)} onChange={value => setSettings({ ...settings, defaultDeliveryFee: Number(value) })} />
          <label className="md:col-span-2"><span className="mb-2 block text-xs font-black uppercase tracking-widest text-black/35">Address</span><textarea value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className="min-h-28 w-full rounded-2xl border border-black/5 bg-[#fff8ee] px-4 py-3 text-sm outline-none focus:border-[#f4c76a]" /></label>
        </div>
        <button onClick={save} className="primary-btn mt-6"><Save size={17} /> Save Settings</button>
      </div>
    </div>
  );
}
function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className="mb-2 block text-xs font-black uppercase tracking-widest text-black/35">{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} className="input-like w-full" /></label>;
}
