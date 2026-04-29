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

  const subtotal    = order.items.reduce((sum, item) => sum + safeNumber(item.price) * safeNumber(item.quantity), 0);
  const deliveryFee = safeNumber(order.deliveryFee);
  const discount    = safeNumber(order.discount);
  const total       = Math.max(0, subtotal + deliveryFee - discount);

  return (
    <div
      className="receipt-page mx-auto w-[80mm] bg-white px-[3mm] py-[3mm] font-mono text-[11px] leading-tight text-black"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      {/* HEADER */}
      <div className="border-b border-dashed border-black pb-3 text-center">
        <img src={logo} alt="Tahir Fast Food" className="mx-auto mb-2 h-16 w-16 object-contain" />
        <h2 className="text-[16px] font-black uppercase tracking-wide">Tahir Fast Food</h2>
        <p className="mt-1 text-[9px] font-bold uppercase">Fresh Fast Food &amp; Delivery</p>

        {isCustomer && (
          <div style={{ marginTop: 8, display: 'inline-block', border: '1.5px solid #111', borderRadius: 6, padding: '5px 10px' }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Order Now</p>
            <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 900 }}>{RESTAURANT_ORDER_PHONE}</p>
          </div>
        )}

        <div className="mt-3">
          <p className="inline-block border border-black px-2 py-1 text-[10px] font-black uppercase">
            {isCustomer ? 'Customer Receipt' : 'Kitchen Ticket'}
          </p>
        </div>
      </div>

      {/* ORDER META */}
      <div className="space-y-1 border-b border-dashed border-black py-3">
        <Row label="Order #"  value={<b>{order.orderNumber}</b>} />
        <Row label="Date"     value={format(order.createdAt, 'dd/MM/yyyy HH:mm')} />
        <Row label="Type"     value={<b className="uppercase">{(order.orderType || 'delivery').replace('_', ' ')}</b>} />
        <Row label="Customer" value={<b>{order.customerName}</b>} />
        <Row label="Phone"    value={order.customerPhone} />
        {order.tableNumber && <Row label="Table" value={<b>{order.tableNumber}</b>} />}
        {rider && (
          <>
            <Row label="Rider"       value={<b>{rider.name}</b>} />
            <Row label="Rider Phone" value={rider.phone} />
            <Row label="Vehicle"     value={rider.vehicleNumber || 'Not added'} />
          </>
        )}
{order.customerAddress && (
  <div className="flex justify-between gap-3 pt-1">
    <span className="font-bold shrink-0">Address</span>
    <span className="break-words text-right">{order.customerAddress}</span>
  </div>
)}
      </div>

      {/* ITEMS */}
      <div className="border-b border-dashed border-black py-3">
        <div className="mb-2 grid grid-cols-[9mm_1fr_18mm] gap-1 border-b border-black pb-1 text-[9px] font-black uppercase">
          <span>Qty</span><span>Item</span><span className="text-right">Total</span>
        </div>
        {order.items.map((item, index) => (
          <div key={`${item.itemId}-${index}`} className="mb-2">
            <div className="grid grid-cols-[9mm_1fr_18mm] gap-1">
              <span className="font-black">{safeNumber(item.quantity)}</span>
              <div>
                <span className="break-words font-bold">{item.name}</span>
                <br />
                <span className="text-[9px] text-black/50">{rupees(safeNumber(item.price))} each</span>
              </div>
              <span className="text-right font-bold">{rupees(safeNumber(item.price) * safeNumber(item.quantity))}</span>
            </div>
            {item.note && <p className="ml-[9mm] mt-1 text-[9px] italic">Note: {item.note}</p>}
          </div>
        ))}
      </div>

      {/* TOTALS — customer only */}
      {isCustomer && (
        <div className="space-y-1 border-b border-dashed border-black py-3">
          <Row label="Subtotal" value={rupees(subtotal)} />
          {deliveryFee > 0 && <Row label="Delivery" value={rupees(deliveryFee)} />}
          {discount > 0 && <Row label="Discount" value={`-${rupees(discount)}`} />}
          <div className="mt-2 flex justify-between border-t border-black pt-2 text-[14px] font-black">
            <span>TOTAL BILL</span>
            <span>{rupees(total)}</span>
          </div>
          <div className="flex justify-between pt-1 text-[9px] uppercase">
            <span>Payment</span>
            <span className="font-bold">{order.paymentMethod?.replace('_', ' ')} · {order.paymentStatus || 'unpaid'}</span>
          </div>
        </div>
      )}

      {/* KITCHEN NOTES */}
      {!isCustomer && (
        <div className="border-b border-dashed border-black py-3">
          <p className="mb-2 text-[11px] font-black uppercase">Kitchen Instructions</p>
          {order.notes
            ? <p className="break-words bg-gray-100 p-2 text-[10px] font-bold italic">{order.notes}</p>
            : <p className="text-[10px] italic">No special notes.</p>
          }
        </div>
      )}

      {/* FOOTER */}
      <div className="pt-3 text-center">
        {isCustomer ? (
          <>
            <p className="text-[10px] font-black uppercase">Thank you for choosing Tahir Fast Food</p>
            <p className="mt-1 text-[9px]">Please keep this receipt with you.</p>
            <div className="mt-3 border-t border-dashed border-black pt-3">
              <p className="text-[9px] font-bold">Software Developed by: <span className="font-black">AHQAR</span></p>
              <p className="text-[9px]">Contact: +92 318-9995518</p>
            </div>
          </>
        ) : (
          <p className="text-[10px] font-black uppercase">— Kitchen Ticket —</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span className="max-w-[42mm] break-words text-right">{value}</span>
    </div>
  );
}