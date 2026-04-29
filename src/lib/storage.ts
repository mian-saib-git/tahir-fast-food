import { CafeSettings, DeliveryBoy, Employee, MenuItem, Order } from '../types';
import { makeId } from './utils';

// ── VERSION KEY ─────────────────────────────────────────────────────────────
// Bump MENU_VERSION whenever you update INITIAL_MENU so localStorage
// is automatically replaced with the new data on next load.
const MENU_VERSION = 'v4';

const STORAGE_KEYS = {
  ORDERS:    'tahir_cafe_orders_v2',
  MENU:      `tahir_cafe_menu_${MENU_VERSION}`,   // ← version-stamped
  EMPLOYEES: 'tahir_cafe_employees_v2',
  SETTINGS:  'tahir_cafe_settings_v2',
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

const INITIAL_EMPLOYEES: (Employee | DeliveryBoy)[] = [
  { id: 'admin_1',   name: 'Tahir Admin',   role: 'admin',        phone: '0300 0000000', email: 'admin@tahircafe.com', shift: 'Full day', active: true },
  { id: 'cashier_1', name: 'Front Counter', role: 'cashier',      phone: '0301 1111111', shift: 'Evening', active: true },
  { id: 'chef_1',    name: 'Kitchen Team',  role: 'chef',         phone: '0302 2222222', shift: 'Evening', active: true },
  { id: 'db_1',      name: 'Ali Rider',     role: 'delivery_boy', phone: '0303 3333333', vehicleNumber: 'LEA-1234', status: 'available', shift: 'Evening', active: true },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getSettings:  () => read<CafeSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (settings: CafeSettings) => write(STORAGE_KEYS.SETTINGS, settings),

  // Menu: reads from version-stamped key so new INITIAL_MENU always loads fresh
  getMenu:   () => read<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU),
  saveMenu:  (menu: MenuItem[]) => write(STORAGE_KEYS.MENU, menu),
  resetMenu: () => write(STORAGE_KEYS.MENU, INITIAL_MENU),

  getEmployees:  () => read<(Employee | DeliveryBoy)[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES),
  saveEmployees: (employees: (Employee | DeliveryBoy)[]) => write(STORAGE_KEYS.EMPLOYEES, employees),

  getOrders:  () => read<Order[]>(STORAGE_KEYS.ORDERS, []),
  saveOrders: (orders: Order[]) => write(STORAGE_KEYS.ORDERS, orders),
  addOrder:   (order: Order) => {
    const orders = read<Order[]>(STORAGE_KEYS.ORDERS, []);
    write(STORAGE_KEYS.ORDERS, [order, ...orders]);
  },
  updateOrder: (id: string, patch: Partial<Order>) => {
    const orders = read<Order[]>(STORAGE_KEYS.ORDERS, []);
    const updated = orders.map(order => order.id === id ? { ...order, ...patch, updatedAt: Date.now() } : order);
    write(STORAGE_KEYS.ORDERS, updated);
    return updated;
  },
  deleteOrder: (id: string) => {
    const orders = read<Order[]>(STORAGE_KEYS.ORDERS, []);
    const updated = orders.filter(order => order.id !== id);
    write(STORAGE_KEYS.ORDERS, updated);
    return updated;
  },
  newEmployeeId: () => makeId('emp'),
  newMenuId:     () => makeId('menu'),
};