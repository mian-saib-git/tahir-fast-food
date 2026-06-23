export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'easypaisa' | 'jazzcash' | 'bank_transfer';
export type OrderType = 'delivery' | 'takeaway' | 'dine_in';
export type OrderSource = 'whatsapp' | 'phone' | 'walk_in';
export type EmployeeRole =
  | 'admin'
  | 'manager'
  | 'staff'
  | 'chef'
  | 'cashier'
  | 'customer_support'
  | 'delivery_boy';
export type DeliveryStatus = 'available' | 'on_delivery' | 'offline';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email?: string;
  cnic?: string;
  shift?: string;
  salary?: number;
  active: boolean;
}

export interface DeliveryBoy extends Employee {
  role: 'delivery_boy';
  vehicleNumber?: string;
  status: DeliveryStatus;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  orderType: OrderType;
  orderSource: OrderSource;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'unpaid' | 'paid';
  createdAt: number;
  updatedAt: number;
  deliveryBoyId?: string;
  notes?: string;
  tableNumber?: string;
  customerId?: string;
  outForDeliveryAt?: number;
  deliveredAt?: number;
  cancelledAt?: number;
  cancellationReason?: string;
}

export interface CafeSettings {
  cafeName: string;
  tagline: string;
  phone: string;
  address: string;
  currency: 'PKR';
  defaultDeliveryFee: number;
}

export const CATEGORIES = [
  'Pizza',
  'Burgers',
  'Fries',
  'Shawarma & Rolls',
  'Wings & Starters',
  'Italian & Sandwiches',
  'Deals',
  'Drinks',
];
