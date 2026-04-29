import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, PackageCheck, TrendingUp } from 'lucide-react';
import { Order } from '../types';
import { cn } from '../lib/utils';
import { storage } from '../lib/storage';

const heroFood = '/assets/hero-food.jpg';
const logo = '/assets/tahir-logo.png';

interface DashboardProps {
  orders?: Order[];
  goTo?: (tab: string) => void;
}

function money(value: number) {
  return `Rs ${Math.round(value).toLocaleString('en-PK')}`;
}

export default function Dashboard({ orders: ordersProp, goTo }: DashboardProps) {
  const [localOrders, setLocalOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!ordersProp) {
      setLocalOrders(storage.getOrders());
    }
  }, [ordersProp]);

  const orders = ordersProp ?? localOrders;

  const today = new Date().toDateString();

  const todayOrders = useMemo(
    () =>
      orders.filter(
        order => new Date(order.createdAt).toDateString() === today
      ),
    [orders, today]
  );

  const todayRevenue = todayOrders.reduce(
    (sum, order) => (order.status !== 'cancelled' ? sum + order.total : sum),
    0
  );

  const activeOrders = orders.filter(order =>
    ['pending', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)
  );

  const stats = [
    {
      label: 'Today Orders',
      value: todayOrders.length,
      icon: PackageCheck,
      tint: 'from-amber-100 to-white text-amber-700',
    },
    {
      label: 'Today Revenue',
      value: money(todayRevenue),
      icon: TrendingUp,
      tint: 'from-emerald-100 to-white text-emerald-700',
    },
    {
      label: 'Preparing',
      value: orders.filter(o => o.status === 'preparing').length,
      icon: Clock3,
      tint: 'from-orange-100 to-white text-orange-700',
    },
    {
      label: 'Delivered',
      value: orders.filter(o => o.status === 'delivered').length,
      icon: CheckCircle2,
      tint: 'from-violet-100 to-white text-violet-700',
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section
        className="relative overflow-hidden rounded-[2.25rem] shadow-[0_28px_90px_rgba(0,0,0,0.42)] ring-1 ring-white/10"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(22,8,4,0.94) 0%, rgba(22,8,4,0.82) 44%, rgba(22,8,4,0.28) 100%), url(${heroFood})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,210,125,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_28%)]" />

        <div className="relative z-10 px-8 py-10 md:px-12 lg:px-14 lg:py-14">
          <div className="max-w-[720px]">
<div className="inline-flex items-center gap-4 rounded-[1.4rem] bg-black/22 px-5 py-4 ring-1 ring-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
<img
  src={logo}
  alt="Tahir Fast Food"
  className="h-20 w-20 object-contain"
/>

  <div>
    <p className="text-[14px] font-black uppercase tracking-[0.24em] text-[#f4c76a]">
      Tahir Fast Food
    </p>
    <p className="mt-1 text-base font-semibold text-white/80">
      Restaurant Order Dashboard
    </p>
  </div>
</div>

            <h1 className="mt-9 max-w-[720px] font-display text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl xl:text-[4.75rem]">
              Fast orders, smooth service, better control.
            </h1>

            <p className="mt-5 max-w-[560px] text-sm font-medium leading-7 text-white/76 md:text-base">
              Manage customer orders, riders, menu items, and daily restaurant activity from one clean workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => goTo?.('orders')}
                className="rounded-2xl bg-gradient-to-r from-[#ffe19a] to-[#f4ae3f] px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-[#24110c] shadow-[0_14px_34px_rgba(244,174,63,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(244,174,63,0.36)]"
              >
                Create Order
              </button>

              <button
                onClick={() => goTo?.('history')}
                className="rounded-2xl bg-white/94 px-7 py-4 text-xs font-black uppercase tracking-[0.16em] text-[#24110c] shadow-xl transition hover:-translate-y-0.5 hover:bg-white"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="rounded-[1.75rem] bg-[#fff4df]/92 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.18)] ring-1 ring-white/50 backdrop-blur-sm transition hover:-translate-y-1"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'rounded-3xl bg-gradient-to-br p-3 shadow-inner',
                  stat.tint
                )}
              >
                <stat.icon size={22} />
              </div>

              <span className="rounded-full bg-[#efd18e]/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#946024]">
                Today
              </span>
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-widest text-[#8c6a55]">
              {stat.label}
            </p>

            <h3 className="mt-1 text-2xl font-black text-[#24110c]">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-[1.75rem] bg-[#fff4df]/92 shadow-[0_18px_48px_rgba(0,0,0,0.18)] ring-1 ring-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-[#3a1d13]/10 p-6">
          <div>
            <h2 className="font-display text-2xl font-bold italic text-[#24110c]">
              Recent Orders
            </h2>
            <p className="mt-1 text-xs font-semibold text-[#8c6a55]">
              Latest restaurant activity
            </p>
          </div>

          <button
            onClick={() => goTo?.('history')}
            className="rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-[#24110c] shadow-md transition hover:-translate-y-0.5"
          >
            View All
          </button>
        </div>

        <div className="divide-y divide-[#3a1d13]/5">
          {orders.slice(0, 6).map(order => (
            <div
              key={order.id}
              className="grid grid-cols-1 gap-3 p-5 transition hover:bg-white/50 md:grid-cols-[1.1fr_1.4fr_auto] md:items-center"
            >
              <div>
                <p className="font-black text-[#24110c]">{order.orderNumber}</p>
                <p className="mt-1 text-xs font-semibold text-[#8c6a55]">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="font-bold text-[#24110c]">{order.customerName}</p>
                <p className="mt-1 truncate text-xs font-medium text-[#8c6a55]">
                  {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                </p>
              </div>

              <b className="font-mono text-[#9b6030]">{money(order.total)}</b>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="p-10 text-center text-sm font-semibold text-[#8c6a55]">
              No orders yet. Create your first order from the New Order page.
            </div>
          )}
        </div>

        {activeOrders.length > 0 && (
          <div className="border-t border-[#3a1d13]/5 bg-[#fffaf4] px-6 py-4 text-sm font-semibold text-[#7a5740]">
            Active orders now:{' '}
            <span className="font-black text-[#24110c]">{activeOrders.length}</span>
          </div>
        )}
      </section>
    </div>
  );
}