import React from 'react';
import { Order } from '../types';
import { format } from 'date-fns';
import { storage } from '../lib/storage';
import { DeliveryBoy } from '../types';

interface PrintableReceiptProps {
  order: Order;
  type: 'Customer' | 'Kitchen';
}

const logo = '/assets/tahir-logo.png';
const RESTAURANT_ORDER_PHONE = '+92 343-1993614';

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function rupees(value: number) {
  return `Rs ${Math.round(safeNumber(value)).toLocaleString('en-PK')}`;
}

export default function PrintableReceipt({ order, type }: PrintableReceiptProps) {
  const isCustomer = type === 'Customer';

  const rider = storage.getEmployees().find(
    e => e.role === 'delivery_boy' && e.id === order.deliveryBoyId
  ) as DeliveryBoy | undefined;

  const subtotal = order.items.reduce((sum, item) => sum + safeNumber(item.price) * safeNumber(item.quantity), 0);
  const deliveryFee = safeNumber(order.deliveryFee);
  const discount = safeNumber(order.discount);
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const dashedBorder = '1px dashed #000';
  const solidBorder  = '1px solid #000';

  return (
   <div style={{ width: '100%', background: '#fff', padding: '11px', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.4', color: '#000', textAlign: 'left' }}>
      {/* HEADER */}
      <div style={{ borderBottom: dashedBorder, paddingBottom: '3px', textAlign: 'center' }}>
        <img src={logo} alt="Tahir Fast Food" style={{ margin: '0 auto 8px', width: '64px', height: '64px', objectFit: 'contain' }} />
        <h2 style={{ fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Tahir Fast Food</h2>
        <p style={{ marginTop: '1px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>Fresh Fast Food &amp; Delivery</p>

        {isCustomer && (
          <div style={{ marginTop: 8, display: 'inline-block', border: `1.5px solid #111`, borderRadius: 6, padding: '5px 10px' }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Order Now</p>
            <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 900 }}>{RESTAURANT_ORDER_PHONE}</p>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <p style={{ display: 'inline-block', border: solidBorder, padding: '2px 8px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>
            {isCustomer ? 'Customer Receipt' : 'Kitchen Ticket'}
          </p>
        </div>
      </div>

      {/* ORDER META */}
      <div style={{ borderBottom: dashedBorder, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Row label="Order #" value={<b>{order.orderNumber}</b>} />
        <Row label="Date" value={format(order.createdAt, 'dd/MM/yyyy HH:mm')} />
        <Row label="Type" value={<b style={{ textTransform: 'uppercase' }}>{(order.orderType || 'delivery').replace('_', ' ')}</b>} />
        <Row label="Customer" value={<b>{order.customerName}</b>} />
        <Row label="Phone" value={order.customerPhone} />
        {order.tableNumber && <Row label="Table" value={<b>{order.tableNumber}</b>} />}
        {rider && (
          <>
            <Row label="Rider" value={<b>{rider.name}</b>} />
            <Row label="Rider Phone" value={rider.phone} />
            <Row label="Vehicle" value={rider.vehicleNumber || 'Not added'} />
          </>
        )}
        {order.customerAddress && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingTop: '4px' }}>
            <span style={{ fontWeight: 700, flexShrink: 0 }}>Address</span>
            <span style={{ wordBreak: 'break-word', textAlign: 'right' }}>{order.customerAddress}</span>
          </div>
        )}
      </div>

      {/* ITEMS */}
      <div style={{ borderBottom: dashedBorder, padding: '12px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '9mm 1fr 18mm', gap: '2px', borderBottom: solidBorder, paddingBottom: '4px', marginBottom: 8, fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>
          <span>Qty</span>
          <span>Item</span>
          <span style={{ textAlign: 'right' }}>Total</span>
        </div>
        {order.items.map((item, index) => (
          <div key={`${item.itemId}-${index}`} style={{ marginBottom: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '9mm 1fr 18mm', gap: '2px' }}>
              <span style={{ fontWeight: 900 }}>{safeNumber(item.quantity)}</span>
              <div>
                <span style={{ fontWeight: 700, wordBreak: 'break-word' }}>{item.name}</span>
                {safeNumber(item.quantity) > 1 && (
                  <>
                    <br />
                    <span style={{ fontSize: 9, color: '#555' }}>{rupees(safeNumber(item.price))} each</span>
                  </>
                )}
              </div>
              <span style={{ fontWeight: 700, textAlign: 'right' }}>
                {rupees(safeNumber(item.price) * safeNumber(item.quantity))}
              </span>
            </div>
            {item.note && <p style={{ marginLeft: '9mm', marginTop: 4, fontSize: 9, fontStyle: 'italic' }}>Note: {item.note}</p>}
          </div>
        ))}
      </div>

      {/* TOTALS — customer only */}
      {isCustomer && (
        <div style={{ borderBottom: dashedBorder, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Row label="Subtotal" value={rupees(subtotal)} />
          {deliveryFee > 0 && <Row label="Delivery" value={rupees(deliveryFee)} />}
          {discount > 0 && <Row label="Discount" value={`-${rupees(discount)}`} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, borderTop: solidBorder, paddingTop: 8, fontSize: 14, fontWeight: 900 }}>
            <span>TOTAL BILL</span>
            <span>{rupees(total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4, fontSize: 9, textTransform: 'uppercase' }}>
            <span>Payment</span>
            <span style={{ fontWeight: 700 }}>{order.paymentMethod?.replace('_', ' ')} · {order.paymentStatus || 'unpaid'}</span>
          </div>
        </div>
      )}

      {/* KITCHEN NOTES */}
      {!isCustomer && (
        <div style={{ borderBottom: dashedBorder, padding: '12px 0' }}>
          <p style={{ marginBottom: 8, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>Kitchen Instructions</p>
          {order.notes
            ? <p style={{ background: '#f3f4f6', padding: '8px', fontSize: 10, fontWeight: 700, fontStyle: 'italic', wordBreak: 'break-word' }}>{order.notes}</p>
            : <p style={{ fontSize: 10, fontStyle: 'italic' }}>No special notes.</p>
          }
        </div>
      )}

      {/* FOOTER */}
      <div style={{ paddingTop: 12, textAlign: 'center' }}>
        {isCustomer ? (
          <>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>Thank you for choosing Tahir Fast Food</p>
            <p style={{ marginTop: 4, fontSize: 9 }}>Please keep this receipt with you.</p>
            <div style={{ marginTop: 12, borderTop: dashedBorder, paddingTop: 12 }}>
              <p style={{ fontSize: 9, fontWeight: 700 }}>Software Developed by: <span style={{ fontWeight: 900 }}>AHQAR</span></p>
              <p style={{ fontSize: 9 }}>Contact: +92 318-9995518</p>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>— Kitchen Ticket —</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <span>{label}</span>
      <span style={{ maxWidth: '42mm', wordBreak: 'break-word', textAlign: 'right' }}>{value}</span>
    </div>
  );
}