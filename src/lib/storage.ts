import { CafeSettings, DeliveryBoy, Employee, MenuItem, Order, OrderItem } from '../types';
import { makeId } from './utils';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  ORDERS: 'tahir_cafe_orders_v2',
  MENU: 'tahir_cafe_menu_supabase',
  EMPLOYEES: 'tahir_cafe_employees_v2',
  SETTINGS: 'tahir_cafe_settings_v2',
};

const INITIAL_SETTINGS: CafeSettings = {
  cafeName:           'Tahir Cafe',
  tagline:            'Fresh taste, fast service',
  phone:              '+92 3431993614',
  address:            'in Peshawar',
  currency:           'PKR',
  defaultDeliveryFee: 150,
};

const INITIAL_MENU: MenuItem[] = [
  // ── PIZZA ──────────────────────────────────────────────────────────────────
  { id: 'p1s',  name: 'Tahir Café Special Pizza (S)', price: 499,  category: 'Pizza', isAvailable: true, isPopular: true },
  { id: 'p1m',  name: 'Tahir Café Special Pizza (M)', price: 849,  category: 'Pizza', isAvailable: true, isPopular: true },
  { id: 'p1l',  name: 'Tahir Café Special Pizza (L)', price: 1499, category: 'Pizza', isAvailable: true, isPopular: true },
  { id: 'p1f',  name: 'Tahir Café Special Pizza (F)', price: 1999, category: 'Pizza', isAvailable: true },

  { id: 'p2s',  name: 'Chicken Tikka Pizza (S)',      price: 480,  category: 'Pizza', isAvailable: true },
  { id: 'p2m',  name: 'Chicken Tikka Pizza (M)',      price: 780,  category: 'Pizza', isAvailable: true },
  { id: 'p2l',  name: 'Chicken Tikka Pizza (L)',      price: 1449, category: 'Pizza', isAvailable: true },
  { id: 'p2f',  name: 'Chicken Tikka Pizza (F)',      price: 1949, category: 'Pizza', isAvailable: true },

  { id: 'p3s',  name: 'Calzone Pizza (S)',            price: 480,  category: 'Pizza', isAvailable: true },
  { id: 'p3m',  name: 'Calzone Pizza (M)',            price: 780,  category: 'Pizza', isAvailable: true },
  { id: 'p3l',  name: 'Calzone Pizza (L)',            price: 1449, category: 'Pizza', isAvailable: true },
  { id: 'p3f',  name: 'Calzone Pizza (F)',            price: 1949, category: 'Pizza', isAvailable: true },

  { id: 'p4s',  name: 'Creamy Milk Pizza (S)',        price: 480,  category: 'Pizza', isAvailable: true },
  { id: 'p4m',  name: 'Creamy Milk Pizza (M)',        price: 780,  category: 'Pizza', isAvailable: true },
  { id: 'p4l',  name: 'Creamy Milk Pizza (L)',        price: 1449, category: 'Pizza', isAvailable: true },
  { id: 'p4f',  name: 'Creamy Milk Pizza (F)',        price: 1949, category: 'Pizza', isAvailable: true },

  { id: 'p5m',  name: 'Malai Boti Pizza (M)',         price: 780,  category: 'Pizza', isAvailable: true },
  { id: 'p5l',  name: 'Malai Boti Pizza (L)',         price: 1449, category: 'Pizza', isAvailable: true },
  { id: 'p5f',  name: 'Malai Boti Pizza (F)',         price: 1949, category: 'Pizza', isAvailable: true },

  { id: 'p6m',  name: 'Cheese Stuff Pizza (M)',       price: 780,  category: 'Pizza', isAvailable: true },
  { id: 'p6l',  name: 'Cheese Stuff Pizza (L)',       price: 1449, category: 'Pizza', isAvailable: true },
  { id: 'p6f',  name: 'Cheese Stuff Pizza (F)',       price: 1949, category: 'Pizza', isAvailable: true },

  { id: 'p7l',  name: 'Four Season Pizza (L)',        price: 1550, category: 'Pizza', isAvailable: true },
  { id: 'p7f',  name: 'Four Season Pizza (F)',        price: 2100, category: 'Pizza', isAvailable: true },

  { id: 'p8m',  name: 'Crown Crust Pizza (M)',        price: 849,  category: 'Pizza', isAvailable: true },
  { id: 'p8l',  name: 'Crown Crust Pizza (L)',        price: 1499, category: 'Pizza', isAvailable: true },
  { id: 'p8f',  name: 'Crown Crust Pizza (F)',        price: 1999, category: 'Pizza', isAvailable: true },

  { id: 'p9m',  name: 'Power Crust Pizza (M)',        price: 849,  category: 'Pizza', isAvailable: true },
  { id: 'p9l',  name: 'Power Crust Pizza (L)',        price: 1499, category: 'Pizza', isAvailable: true },
  { id: 'p9f',  name: 'Power Crust Pizza (F)',        price: 1999, category: 'Pizza', isAvailable: true },

  { id: 'p10s', name: 'Chicken Supreme Pizza (S)',    price: 450,  category: 'Pizza', isAvailable: true },
  { id: 'p10m', name: 'Chicken Supreme Pizza (M)',    price: 750,  category: 'Pizza', isAvailable: true },
  { id: 'p10l', name: 'Chicken Supreme Pizza (L)',    price: 1399, category: 'Pizza', isAvailable: true },
  { id: 'p10f', name: 'Chicken Supreme Pizza (F)',    price: 1799, category: 'Pizza', isAvailable: true },

  { id: 'p11s', name: 'Cheese Lover Pizza (S)',       price: 450,  category: 'Pizza', isAvailable: true },
  { id: 'p11m', name: 'Cheese Lover Pizza (M)',       price: 750,  category: 'Pizza', isAvailable: true },
  { id: 'p11l', name: 'Cheese Lover Pizza (L)',       price: 1400, category: 'Pizza', isAvailable: true },
  { id: 'p11f', name: 'Cheese Lover Pizza (F)',       price: 1800, category: 'Pizza', isAvailable: true },

  { id: 'p12s', name: 'Veggie Lover Pizza (S)',       price: 450,  category: 'Pizza', isAvailable: true },
  { id: 'p12m', name: 'Veggie Lover Pizza (M)',       price: 750,  category: 'Pizza', isAvailable: true },
  { id: 'p12l', name: 'Veggie Lover Pizza (L)',       price: 1400, category: 'Pizza', isAvailable: true },
  { id: 'p12f', name: 'Veggie Lover Pizza (F)',       price: 1800, category: 'Pizza', isAvailable: true },

  { id: 'p13s', name: 'Extra Topping (S)',            price: 100,  category: 'Pizza', isAvailable: true },
  { id: 'p13m', name: 'Extra Topping (M)',            price: 170,  category: 'Pizza', isAvailable: true },
  { id: 'p13l', name: 'Extra Topping (L)',            price: 230,  category: 'Pizza', isAvailable: true },
  { id: 'p13f', name: 'Extra Topping (F)',            price: 300,  category: 'Pizza', isAvailable: true },

  { id: 'p5x',  name: 'Special Matka Pizza',          price: 750,  category: 'Pizza', isAvailable: true, isPopular: true },
  { id: 'p14',  name: 'Train Pizza (36 Slice)',        price: 3499, category: 'Pizza', isAvailable: true },

  // ── BURGERS ────────────────────────────────────────────────────────────────
  { id: 'b1',  name: 'Zinger Burger',               price: 250, category: 'Burgers', isAvailable: true, isPopular: true },
  { id: 'b2',  name: 'Zinger Cheese Burger',        price: 300, category: 'Burgers', isAvailable: true },
  { id: 'b3',  name: 'Tower Burger',                price: 400, category: 'Burgers', isAvailable: true },
  { id: 'b5',  name: 'Pizza Burger',                price: 400, category: 'Burgers', isAvailable: true },
  { id: 'b6',  name: 'Chicken Supreme Burger',      price: 250, category: 'Burgers', isAvailable: true },
  { id: 'b7',  name: 'American Single Beef Burger', price: 350, category: 'Burgers', isAvailable: true },
  { id: 'b4',  name: 'American Double Beef Burger', price: 600, category: 'Burgers', isAvailable: true },
  { id: 'b8',  name: 'Grill Chicken Burger',        price: 250, category: 'Burgers', isAvailable: true },
  { id: 'b9',  name: 'Tandori Chicken Burger',      price: 500, category: 'Burgers', isAvailable: true },
  { id: 'b10', name: 'Fish Burger',                 price: 350, category: 'Burgers', isAvailable: true },

  // ── FRIES ──────────────────────────────────────────────────────────────────
  { id: 'f1',  name: 'Regular Fries',   price: 150, category: 'Fries', isAvailable: true },
  { id: 'f4',  name: 'Large Fries',     price: 250, category: 'Fries', isAvailable: true },
  { id: 'f5',  name: 'Cheese Fries',    price: 300, category: 'Fries', isAvailable: true },
  { id: 'f6',  name: 'Pizza Fries (S)', price: 250, category: 'Fries', isAvailable: true },
  { id: 'f2',  name: 'Pizza Fries (L)', price: 400, category: 'Fries', isAvailable: true, isPopular: true },
  { id: 'f3',  name: 'Zinger Fries',    price: 500, category: 'Fries', isAvailable: true },

  // ── SHAWARMA & ROLLS ───────────────────────────────────────────────────────
  { id: 's1',  name: 'Medium Shawarma',      price: 100, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 's3',  name: 'Large Shawarma',       price: 150, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 's2',  name: 'Special Shawarma',     price: 200, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 's4',  name: 'Zinger Shawarma',      price: 200, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 's5',  name: 'Grill Shawarma',       price: 200, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 'r1',  name: 'Chicken Paratha Roll', price: 180, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 'r3',  name: 'Grill Paratha Roll',   price: 200, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 'r4',  name: 'Zinger Paratha Roll',  price: 220, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 'r5',  name: 'Roll Cheese Topping',  price: 70,  category: 'Shawarma & Rolls', isAvailable: true },
  { id: 'r6',  name: 'Chicken Twister Roll', price: 200, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 'r2',  name: 'Zinger Twister Roll',  price: 270, category: 'Shawarma & Rolls', isAvailable: true },
  { id: 'r7',  name: 'Grill Twister Roll',   price: 270, category: 'Shawarma & Rolls', isAvailable: true },

  // ── WINGS & STARTERS ───────────────────────────────────────────────────────
  { id: 'w3',  name: 'Zinger Candy (1pc)',    price: 150,  category: 'Wings & Starters', isAvailable: true },
  { id: 'w4',  name: 'Bar.B.Q Candy (1pc)',   price: 150,  category: 'Wings & Starters', isAvailable: true },
  { id: 'w1',  name: 'Zinger Wings (6pc)',    price: 300,  category: 'Wings & Starters', isAvailable: true },
  { id: 'w5',  name: 'Bar.B.Q Wings (6pc)',   price: 300,  category: 'Wings & Starters', isAvailable: true },
  { id: 'w2',  name: 'Chicken Nuggets (8pc)', price: 300,  category: 'Wings & Starters', isAvailable: true },
  { id: 'w6',  name: 'Chicken Tempura (8pc)', price: 300,  category: 'Wings & Starters', isAvailable: true },
  { id: 'w7',  name: 'Shawarma Platter',      price: 250,  category: 'Wings & Starters', isAvailable: true },
  { id: 'w8',  name: 'Behari Roll',           price: 450,  category: 'Wings & Starters', isAvailable: true },
  { id: 'w9',  name: 'Starter Platter',       price: 1000, category: 'Wings & Starters', isAvailable: true },
  { id: 'w10', name: 'Ultimate Platter',      price: 2000, category: 'Wings & Starters', isAvailable: true },

  // ── ITALIAN & SANDWICHES ───────────────────────────────────────────────────
  { id: 'it3', name: 'Arbiata Pasta',          price: 750, category: 'Italian & Sandwiches', isAvailable: true },
  { id: 'it1', name: 'Alfredo Pasta',          price: 750, category: 'Italian & Sandwiches', isAvailable: true },
  { id: 'it4', name: 'Special Pasta',          price: 850, category: 'Italian & Sandwiches', isAvailable: true },
  { id: 'it2', name: 'Chicken Lasagne',        price: 900, category: 'Italian & Sandwiches', isAvailable: true },
  { id: 'it5', name: 'Grill Sandwich',         price: 180, category: 'Italian & Sandwiches', isAvailable: true },
  { id: 'it6', name: 'Panini Sandwich',        price: 300, category: 'Italian & Sandwiches', isAvailable: true },
  { id: 'it7', name: 'Special Grill Sandwich', price: 350, category: 'Italian & Sandwiches', isAvailable: true },
  { id: 'it8', name: 'Zinger Panini Sandwich', price: 350, category: 'Italian & Sandwiches', isAvailable: true },

  // ── DRINKS ─────────────────────────────────────────────────────────────────
  { id: 'dr1', name: 'Soft Drink 345ml', price: 90,  category: 'Drinks', isAvailable: true },
  { id: 'dr2', name: 'Soft Drink 1.5L',  price: 220, category: 'Drinks', isAvailable: true },

  // ── DEALS ──────────────────────────────────────────────────────────────────
  { id: 'd1',  name: 'Deal 1: 1 Zinger + Fries + Drink',                                                        price: 450,  category: 'Deals', isAvailable: true, isPopular: true },
  { id: 'd2',  name: 'Deal 2: 2 Zinger + S Pizza + 2 Drinks',                                                   price: 1050, category: 'Deals', isAvailable: true },
  { id: 'd3n', name: 'Deal 3: 3 Zinger + M Pizza + Grill Sandwich + 1L Drink',                                  price: 1900, category: 'Deals', isAvailable: true },
  { id: 'd4',  name: 'Deal 4: L Pizza + Chicken Pasta + 6 Zinger Wings + 1L Drink',                             price: 2500, category: 'Deals', isAvailable: true },
  { id: 'd5',  name: 'Deal 5: 4 Zinger + 2 M Pizza + Cheese Fries + 6 BBQ Wings + 1.5L Drink',                 price: 3100, category: 'Deals', isAvailable: true },
  { id: 'd6',  name: 'Deal 6: 4 Zinger + 2 L Pizza + 2 Cheese Fries + 1.5L Drink',                             price: 4350, category: 'Deals', isAvailable: true },
  { id: 'd7',  name: 'Deal 7: 6 Zinger + F Pizza + 2 Cheese Fries + 12 BBQ Wings + 8 Tempura + 2x1.5L Drink',  price: 4899, category: 'Deals', isAvailable: true },
  { id: 'd8',  name: 'Deal 8: 3 Zinger + S Pizza Fries + 1L Drink',                                            price: 1020, category: 'Deals', isAvailable: true },
  { id: 'd9',  name: 'Deal 9: 4 Zinger + 4 Shawarma + 1.5L Drink',                                             price: 1500, category: 'Deals', isAvailable: true },
  { id: 'd10', name: 'Deal 10: 6 Zinger + 1L Drink (Free)',                                                     price: 1500, category: 'Deals', isAvailable: true },
  { id: 'd11', name: 'Deal 11: 2 M Pizza + 1L Drink (Free)',                                                    price: 1700, category: 'Deals', isAvailable: true },
  { id: 'd12', name: 'Deal 12: 5 Zinger + M Pizza + 1.5L Drink',                                               price: 2100, category: 'Deals', isAvailable: true },
  { id: 'd13', name: 'Deal 13: 2 Zinger + 2 M Pizza + 1.5L Drink',                                             price: 2300, category: 'Deals', isAvailable: true },
  { id: 'd14', name: 'Deal 14: 10 Zinger + 10 Shawarma + Fries + 1.5L Drink (Free)',                           price: 3500, category: 'Deals', isAvailable: true },
  { id: 'd15', name: 'Deal 15 (Sunday Special): 2 L Pizza + 1.5L Drink',                                       price: 2800, category: 'Deals', isAvailable: true },
];

const DEFAULT_EMPLOYEE_IDS = new Set(['admin_1', 'cashier_1', 'chef_1', 'db_1']);
let initialized = false;

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function emitChange() {
  window.dispatchEvent(new Event('storage'));
}

function reportSyncError(scope: string, error: unknown) {
  console.error(`Supabase sync failed for ${scope}:`, error);
}

function nullable(value?: string | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function menuToRow(item: MenuItem) {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    category: item.category,
    description: nullable(item.description),
    is_available: item.isAvailable ?? true,
    is_popular: item.isPopular ?? false,
  };
}

function menuFromRow(row: any): MenuItem {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price) || 0,
    category: row.category,
    description: row.description ?? undefined,
    isAvailable: row.is_available ?? true,
    isPopular: row.is_popular ?? false,
  };
}

function employeeToRow(employee: Employee | DeliveryBoy) {
  return {
    id: employee.id,
    name: employee.name,
    role: employee.role,
    phone: employee.phone,
    email: nullable(employee.email),
    cnic: nullable(employee.cnic),
    shift: nullable(employee.shift),
    salary: Number(employee.salary) || 0,
    active: employee.active ?? true,
    vehicle_number: employee.role === 'delivery_boy' && 'vehicleNumber' in employee ? nullable(employee.vehicleNumber) : null,
    status: employee.role === 'delivery_boy' && 'status' in employee ? employee.status : null,
  };
}

function employeeFromRow(row: any): Employee | DeliveryBoy {
  const base: Employee = {
    id: row.id,
    name: row.name,
    role: row.role,
    phone: row.phone,
    email: row.email ?? undefined,
    cnic: row.cnic ?? undefined,
    shift: row.shift ?? undefined,
    salary: Number(row.salary) || 0,
    active: row.active ?? true,
  };

  if (row.role === 'delivery_boy') {
    return {
      ...base,
      role: 'delivery_boy',
      vehicleNumber: row.vehicle_number ?? undefined,
      status: row.status ?? 'available',
    };
  }

  return base;
}

function orderItemToRow(orderId: string, item: OrderItem) {
  return {
    order_id: orderId,
    item_id: item.itemId,
    name: item.name,
    price: Number(item.price) || 0,
    quantity: Math.max(1, Number(item.quantity) || 1),
    note: nullable(item.note),
  };
}

function orderItemFromRow(row: any): OrderItem {
  return {
    itemId: row.item_id,
    name: row.name,
    price: Number(row.price) || 0,
    quantity: Number(row.quantity) || 1,
    note: row.note ?? undefined,
  };
}

function orderToRow(order: Order, includeOrderNumber = true) {
  const row: Record<string, unknown> = {
    id: order.id,
    customer_name: nullable(order.customerName),
    customer_phone: nullable(order.customerPhone),
    customer_address: nullable(order.customerAddress),
    order_type: order.orderType,
    order_source: order.orderSource,
    subtotal: Number(order.subtotal) || 0,
    discount: Number(order.discount) || 0,
    delivery_fee: Number(order.deliveryFee) || 0,
    total: Number(order.total) || 0,
    status: order.status,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    delivery_boy_id: order.deliveryBoyId ?? null,
    notes: nullable(order.notes),
    table_number: nullable(order.tableNumber),
    created_at: new Date(order.createdAt).toISOString(),
    updated_at: new Date(order.updatedAt || order.createdAt).toISOString(),
    cancellation_reason: nullable(order.cancellationReason),
  };

  if (includeOrderNumber && order.orderNumber) {
    row.order_number = order.orderNumber;
  }

  return row;
}

function orderFromRow(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name ?? '',
    customerPhone: row.customer_phone ?? '',
    customerAddress: row.customer_address ?? undefined,
    orderType: row.order_type ?? 'delivery',
    orderSource: row.order_source ?? 'walk_in',
    items: (row.order_items ?? []).map(orderItemFromRow),
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    deliveryFee: Number(row.delivery_fee) || 0,
    total: Number(row.total) || 0,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status ?? 'unpaid',
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at ?? row.created_at).getTime(),
    deliveryBoyId: row.delivery_boy_id ?? undefined,
    notes: row.notes ?? undefined,
    tableNumber: row.table_number ?? undefined,
    customerId: row.customer_id ?? undefined,
    outForDeliveryAt: row.out_for_delivery_at ? new Date(row.out_for_delivery_at).getTime() : undefined,
    deliveredAt: row.delivered_at ? new Date(row.delivered_at).getTime() : undefined,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at).getTime() : undefined,
    cancellationReason: row.cancellation_reason ?? undefined,
  };
}

async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(orderFromRow);
}

async function persistOrder(order: Order, syncItems = false) {
  const { error } = await supabase
    .from('orders')
    .upsert(orderToRow(order), { onConflict: 'id' });
  if (error) throw error;

  if (syncItems) {
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', order.id);
    if (deleteError) throw deleteError;

    if (order.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(order.items.map((item) => orderItemToRow(order.id, item)));
      if (itemsError) throw itemsError;
    }
  }
}

async function syncMenu(menu: MenuItem[]) {
  if (menu.length > 0) {
    const { error } = await supabase
      .from('menu_items')
      .upsert(menu.map(menuToRow), { onConflict: 'id' });
    if (error) throw error;
  }

  const { data: remote, error: selectError } = await supabase
    .from('menu_items')
    .select('id');
  if (selectError) throw selectError;

  const keep = new Set(menu.map((item) => item.id));
  const remove = (remote ?? []).map((row) => row.id).filter((id) => !keep.has(id));
  if (remove.length > 0) {
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .in('id', remove);
    if (deleteError) throw deleteError;
  }
}

async function syncEmployees(employees: (Employee | DeliveryBoy)[]) {
  if (employees.length > 0) {
    const { error } = await supabase
      .from('employees')
      .upsert(employees.map(employeeToRow), { onConflict: 'id' });
    if (error) throw error;
  }

  const { data: remote, error: selectError } = await supabase
    .from('employees')
    .select('id');
  if (selectError) throw selectError;

  const keep = new Set(employees.map((employee) => employee.id));
  const remove = (remote ?? []).map((row) => row.id).filter((id) => !keep.has(id));
  if (remove.length > 0) {
    const { error: deleteError } = await supabase
      .from('employees')
      .delete()
      .in('id', remove);
    if (deleteError) throw deleteError;
  }
}

async function syncOrders(orders: Order[]) {
  for (const order of orders) {
    await persistOrder(order, true);
  }

  const { data: remote, error: selectError } = await supabase
    .from('orders')
    .select('id');
  if (selectError) throw selectError;

  const keep = new Set(orders.map((order) => order.id));
  const remove = (remote ?? []).map((row) => row.id).filter((id) => !keep.has(id));
  if (remove.length > 0) {
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .in('id', remove);
    if (deleteError) throw deleteError;
  }
}

export const storage = {
  initialize: async () => {
    if (initialized) return;

    const cachedMenu = readLocal<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU);
    const cachedEmployees = readLocal<(Employee | DeliveryBoy)[]>(STORAGE_KEYS.EMPLOYEES, []);
    const cachedOrders = readLocal<Order[]>(STORAGE_KEYS.ORDERS, []);

    const [menuResult, employeesResult, ordersResult] = await Promise.all([
      supabase.from('menu_items').select('*').order('category').order('name'),
      supabase.from('employees').select('*').order('name'),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
    ]);

    if (menuResult.error) throw menuResult.error;
    if (employeesResult.error) throw employeesResult.error;
    if (ordersResult.error) throw ordersResult.error;

    let menu = (menuResult.data ?? []).map(menuFromRow);
    if (menu.length === 0) {
      menu = cachedMenu.length > 0 ? cachedMenu : INITIAL_MENU;
      await syncMenu(menu);
    }

    let employees = (employeesResult.data ?? []).map(employeeFromRow);
    if (employees.length === 0) {
      const customEmployees = cachedEmployees.filter((employee) => !DEFAULT_EMPLOYEE_IDS.has(employee.id));
      if (customEmployees.length > 0) {
        await syncEmployees(customEmployees);
        employees = customEmployees;
      }
    }

    let orders = (ordersResult.data ?? []).map(orderFromRow);
    if (orders.length === 0 && cachedOrders.length > 0) {
      await syncOrders(cachedOrders);
      orders = await fetchOrders();
    }

    writeLocal(STORAGE_KEYS.MENU, menu);
    writeLocal(STORAGE_KEYS.EMPLOYEES, employees);
    writeLocal(STORAGE_KEYS.ORDERS, orders);
    initialized = true;
    emitChange();
  },

  getSettings: () => readLocal<CafeSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (settings: CafeSettings) => writeLocal(STORAGE_KEYS.SETTINGS, settings),

  getMenu: () => readLocal<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU),
  saveMenu: (menu: MenuItem[]) => {
    writeLocal(STORAGE_KEYS.MENU, menu);
    emitChange();
    void syncMenu(menu).catch((error) => reportSyncError('menu', error));
  },
  resetMenu: () => {
    writeLocal(STORAGE_KEYS.MENU, INITIAL_MENU);
    emitChange();
    void syncMenu(INITIAL_MENU).catch((error) => reportSyncError('menu reset', error));
  },

  getEmployees: () => readLocal<(Employee | DeliveryBoy)[]>(STORAGE_KEYS.EMPLOYEES, []),
  saveEmployees: (employees: (Employee | DeliveryBoy)[]) => {
    writeLocal(STORAGE_KEYS.EMPLOYEES, employees);
    emitChange();
    void syncEmployees(employees).catch((error) => reportSyncError('employees', error));
  },

  getOrders: () => readLocal<Order[]>(STORAGE_KEYS.ORDERS, []),
  saveOrders: (orders: Order[]) => {
    writeLocal(STORAGE_KEYS.ORDERS, orders);
    emitChange();
    void syncOrders(orders).catch((error) => reportSyncError('orders', error));
  },
  addOrder: async (order: Order) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderToRow(order, false))
      .select('*')
      .single();
    if (error) throw error;

    if (order.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(order.items.map((item) => orderItemToRow(order.id, item)));
      if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }
    }

    const saved = orderFromRow({ ...data, order_items: order.items.map((item) => ({
      item_id: item.itemId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      note: item.note,
    })) });

    const orders = [saved, ...storage.getOrders().filter((item) => item.id !== saved.id)];
    writeLocal(STORAGE_KEYS.ORDERS, orders);
    emitChange();
    return saved;
  },
  updateOrder: (id: string, patch: Partial<Order>) => {
    const orders = storage.getOrders();
    const updated = orders.map((order) =>
      order.id === id
        ? { ...order, ...patch, updatedAt: Date.now() }
        : order
    );
    writeLocal(STORAGE_KEYS.ORDERS, updated);
    emitChange();

    const changed = updated.find((order) => order.id === id);
    if (changed) {
      void persistOrder(changed, patch.items !== undefined)
        .catch((error) => reportSyncError('order update', error));
    }

    return updated;
  },
  deleteOrder: (id: string) => {
    const updated = storage.getOrders().filter((order) => order.id !== id);
    writeLocal(STORAGE_KEYS.ORDERS, updated);
    emitChange();
    void supabase
      .from('orders')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) reportSyncError('order delete', error);
      });
    return updated;
  },

  newEmployeeId: () => makeId('emp'),
  newMenuId: () => makeId('menu'),
};
