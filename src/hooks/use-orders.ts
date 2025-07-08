
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '@/lib/types';
import { useStock } from '@/hooks/use-stock';
import { categories as initialCategories } from '@/lib/data';

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
                set((state) => {
                    const orderToUpdate = state.orders.find((o) => o.id === orderId);
                    if (!orderToUpdate) return { orders: state.orders };

                    if (status === 'completed' && orderToUpdate.status !== 'completed') {
                        const { deliverStockForOrder } = useStock.getState();
                        const deliveredItems: Order['deliveredItems'] = { ...orderToUpdate.deliveredItems };
                        
                        for (const item of orderToUpdate.items) {
                            const category = initialCategories.find(c => c.name === item.category);
                            if (category?.deliveryMethod === 'instant') {
                                const deliveredCodes = deliverStockForOrder(item.id, item.quantity);
                                if (deliveredCodes.length > 0) {
                                    deliveredItems[item.id] = deliveredCodes;
                                }
                            }
                        }
                        
                        const updatedOrder = { ...orderToUpdate, status, deliveredItems };
                        return {
                            orders: state.orders.map((order) =>
                                order.id === orderId ? updatedOrder : order
                            ),
                        };
                    } else {
                        return {
                            orders: state.orders.map((order) =>
                                order.id === orderId ? { ...order, status } : order
                            ),
                        };
                    }
                });
            },
        }),
        {
            name: 'topup-hub-orders',
        }
    )
);
