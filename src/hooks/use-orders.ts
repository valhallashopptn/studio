
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '@/lib/types';

type OrdersState = {
    orders: Order[];
    addOrder: (order: Omit<Order, 'createdAt'>) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
};

export const useOrders = create(
    persist<OrdersState>(
        (set) => ({
            orders: [],
            addOrder: (newOrderData) => {
                const newOrder: Order = {
                    ...newOrderData,
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({ orders: [newOrder, ...state.orders] }));
            },
            updateOrderStatus: (orderId, status) => {
                set((state) => ({
                    orders: state.orders.map((order) =>
                        order.id === orderId ? { ...order, status } : order
                    ),
                }));
            },
        }),
        {
            name: 'topup-hub-orders',
        }
    )
);
