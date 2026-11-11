import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Almacén seguro y tipado de pedidos para DEFENSA TI (Almacenamiento local seguro)
export interface DefensatiOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  targetUrl: string;
  planId: 'auditoria' | 'esencial' | 'blindaje-total' | 'limpieza';
  planName: string;
  amountPEN: number;
  paymentStatus: 'pending' | 'paid_advance' | 'paid_full' | 'failed';
  paymentMethod: 'culqi' | 'yape_manual';
  culqiChargeId?: string;
  authorizedByOwner: boolean;
  notes?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

function loadOrdersFromDisk(): Map<string, DefensatiOrder> {
  const map = new Map<string, DefensatiOrder>();
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
      if (Array.isArray(parsed)) {
        for (const order of parsed) {
          if (order && typeof order.id === 'string') map.set(order.id, order);
        }
      }
    }
  } catch {
    // Sin archivo o ilegible: se parte de un almacén vacío
  }
  return map;
}

// Pedidos en memoria respaldados en data/orders.json (sobreviven a reinicios de PM2)
const globalForOrders = globalThis as unknown as {
  __ordersStore?: Map<string, DefensatiOrder>;
};

if (!globalForOrders.__ordersStore) {
  globalForOrders.__ordersStore = loadOrdersFromDisk();
}

const ordersStore = globalForOrders.__ordersStore;

function persistOrdersToDisk(): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${ORDERS_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(Array.from(ordersStore.values()), null, 2), 'utf-8');
    fs.renameSync(tmp, ORDERS_FILE);
  } catch {
    // FS de solo lectura: el pedido queda solo en memoria
  }
}

export function createOrder(order: Omit<DefensatiOrder, 'id' | 'createdAt'>): DefensatiOrder {
  const id = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const newOrder: DefensatiOrder = {
    ...order,
    id,
    createdAt: new Date().toISOString(),
  };

  ordersStore.set(id, newOrder);
  persistOrdersToDisk();
  return newOrder;
}

export function getOrderById(id: string): DefensatiOrder | null {
  return ordersStore.get(id) || null;
}

export function updateOrderStatus(
  id: string,
  status: DefensatiOrder['paymentStatus'],
  culqiChargeId?: string
): DefensatiOrder | null {
  const order = ordersStore.get(id);
  if (!order) return null;

  order.paymentStatus = status;
  if (culqiChargeId) {
    order.culqiChargeId = culqiChargeId;
  }
  ordersStore.set(id, order);
  persistOrdersToDisk();
  return order;
}

export function getAllOrders(): DefensatiOrder[] {
  return Array.from(ordersStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
