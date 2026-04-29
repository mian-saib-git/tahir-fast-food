import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Order, OrderStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(amount: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function makeId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function makeOrderNumber() {
  const today = new Date();
  const date = `${today.getFullYear().toString().slice(2)}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  return `TC-${date}-${String(Date.now()).slice(-4)}`;
}

export function statusLabel(status: OrderStatus) {
  return status.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

export function whatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppReceipt(order: Order) {
  const lines = [
    `*Tahir Cafe Receipt*`,
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    order.customerAddress ? `Address: ${order.customerAddress}` : '',
    '',
    '*Items*',
    ...order.items.map(item => `${item.quantity} x ${item.name} = ${money(item.price * item.quantity)}`),
    '',
    `Subtotal: ${money(order.subtotal)}`,
    order.discount > 0 ? `Discount: -${money(order.discount)}` : '',
    order.deliveryFee > 0 ? `Delivery: ${money(order.deliveryFee)}` : '',
    `*Total: ${money(order.total)}*`,
    `Payment: ${order.paymentMethod.replace('_', ' ').toUpperCase()} (${order.paymentStatus})`,
    '',
    'Thank you for ordering from Tahir Cafe.',
  ].filter(Boolean);

  return lines.join('\n');
}
