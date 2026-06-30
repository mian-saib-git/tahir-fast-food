import React from 'react';
import { format } from 'date-fns';
import { DeliveryBoy, Order } from '../types';
import { storage } from '../lib/storage';

interface PrintableReceiptProps {
  order: Order;
  type: 'Customer' | 'Kitchen';
}

const logo = '/assets/tahir-logo.png';
const developerName = 'AHQAR';
const developerContact = '+923189995518';

function safeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function rupees(value: number) {
  return `Rs ${Math.round(safeNumber(value)).toLocaleString('en-PK')}`;
}

export default function PrintableReceipt({ order, type }: PrintableReceiptProps) {
  const isCustomer = type === 'Customer';
  const settings = storage.getSettings();
  const rider = storage.getEmployees().find(
    employee => employee.role === 'delivery_boy' && employee.id === order.deliveryBoyId,
  ) as DeliveryBoy | undefined;

  const subtotal = order.items.reduce(
    (sum, item) => sum + safeNumber(item.price) * safeNumber(item.quantity),
    0,
  );
  const deliveryFee = safeNumber(order.deliveryFee);
  const discount = safeNumber(order.discount);
  const total = Math.max(0, subtotal + deliveryFee - discount);
  const dash = '1px dashed #000';
  const itemGridColumns = '6mm minmax(0, 1fr) 14mm';

  return (
    <div
      className="thermal-receipt"
      style={{
        width: '100%',
        maxWidth: '71mm', // 72mm paper - 0.5mm margin each side
        boxSizing: 'border-box',
        margin: '0 auto',
        background: '#fff',
        padding: '3px 0.5mm',
        fontFamily: 'monospace',
        fontSize: '10.8px',
        lineHeight: 1.34,
        color: '#000',
        textAlign: 'left',
        overflow: 'hidden',
      }}
    >
      <div style={{ textAlign: 'center', borderBottom: dash, paddingBottom: 7 }}>
        <img
          src={logo}
          alt={`${settings.cafeName} logo`}
          style={{
            display: 'block',
            width: isCustomer ? 54 : 40,
            height: isCustomer ? 54 : 40,
            objectFit: 'contain',
            margin: '0 auto 4px',
          }}
        />
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 900, textTransform: 'uppercase' }}>
          {settings.cafeName || 'Tahir Fast Food'}
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: 10, fontWeight: 900 }}>
          For Order: {settings.phone || '+92 3431993614'}
        </p>
        <div style={{ marginTop: 6 }}>
          <span
            style={{
              display: 'inline-block',
              border: '1px solid #000',
              padding: '2px 8px',
              fontSize: 11,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: 0.7,
            }}
          >
            {isCustomer ? 'Customer Receipt' : 'Kitchen Ticket'}
          </span>
        </div>
      </div>

      <div
        style={{
          borderBottom: dash,
          padding: '7px 0',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          Order No.
        </div>
        <div
          style={{
            marginTop: 1,
            fontSize: isCustomer ? 18 : 16,
            lineHeight: 1.1,
            fontWeight: 900,
            wordBreak: 'break-word',
          }}
        >
          {order.orderNumber}
        </div>
      </div>

      <div style={{ borderBottom: dash, padding: '7px 0', display: 'grid', gap: 3 }}>
        <Row label="Date" value={format(order.createdAt, 'dd/MM/yyyy HH:mm')} />
        <Row label="Type" value={(order.orderType || 'delivery').replace('_', ' ')} />
        {order.customerName && <Row label="Customer" value={<b>{order.customerName}</b>} />}
        {order.customerPhone && <Row label="Phone" value={order.customerPhone} />}
        {order.tableNumber && <Row label="Table" value={<b>{order.tableNumber}</b>} />}
        {rider && <Row label="Rider" value={<b>{rider.name}</b>} />}
        {order.customerAddress && (
          <div style={{ marginTop: 2, wordBreak: 'break-word' }}>
            <b>Address:</b> {order.customerAddress}
          </div>
        )}
      </div>

      <div style={{ borderBottom: dash, padding: '7px 0' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: itemGridColumns,
            gap: 1,
            paddingBottom: 4,
            borderBottom: '1px solid #000',
            fontSize: 9,
            fontWeight: 900,
            textTransform: 'uppercase',
          }}
        >
          <span>Qty</span>
          <span>Item</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
        </div>

        {order.items.map((item, index) => (
          <div key={`${item.itemId}-${index}`} style={{ paddingTop: 5 }}>
            <div style={{ display: 'grid', gridTemplateColumns: itemGridColumns, gap: 1 }}>
              <b>{safeNumber(item.quantity)}</b>
              <span style={{ fontWeight: 700, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {item.name}
              </span>
              <b style={{ textAlign: 'right', whiteSpace: 'nowrap', fontSize: 10 }}>
                {rupees(safeNumber(item.price) * safeNumber(item.quantity))}
              </b>
            </div>
            {item.note && (
              <p style={{ margin: '2px 0 0 7mm', fontSize: 9, fontStyle: 'italic' }}>
                Note: {item.note}
              </p>
            )}
          </div>
        ))}
      </div>

      {isCustomer ? (
        <div style={{ borderBottom: dash, padding: '7px 0', display: 'grid', gap: 3 }}>
          <Row label="Subtotal" value={rupees(subtotal)} />
          {deliveryFee > 0 && <Row label="Delivery" value={rupees(deliveryFee)} />}
          {discount > 0 && <Row label="Discount" value={`-${rupees(discount)}`} />}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
              borderTop: '1px solid #000',
              marginTop: 4,
              paddingTop: 5,
              fontSize: 13,
              fontWeight: 900,
            }}
          >
            <span>Total</span>
            <span style={{ whiteSpace: 'nowrap' }}>{rupees(total)}</span>
          </div>
          <Row
            label="Payment"
            value={`${order.paymentMethod.replace('_', ' ')} / ${order.paymentStatus}`}
          />
        </div>
      ) : (
        <div style={{ borderBottom: dash, padding: '7px 0' }}>
          <b>Kitchen Notes:</b>
          <p style={{ margin: '3px 0 0' }}>{order.notes || 'No special notes.'}</p>
        </div>
      )}

      <div style={{ paddingTop: 7, textAlign: 'center', fontWeight: 800 }}>
        {isCustomer ? 'Thank you for your order!' : 'Prepare carefully'}
      </div>

      {isCustomer && (
        <div
          style={{
            borderTop: dash,
            marginTop: 7,
            paddingTop: 6,
            textAlign: 'center',
            fontSize: 9,
            lineHeight: 1.45,
            wordBreak: 'break-word',
          }}
        >
          <div>
            Software developed by: <b>{developerName}</b>
          </div>
          <div>
            Contact: <b>{developerContact}</b>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
      <span style={{ flexShrink: 0 }}>{label}</span>
      <span
        style={{
          maxWidth: '46mm',
          textAlign: 'right',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          textTransform: label === 'Type' || label === 'Payment' ? 'capitalize' : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}