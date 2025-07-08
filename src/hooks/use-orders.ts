
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '@/lib/types';
import { useStock } from '@/hooks/use-stock';
import { useCategoriesStore } from '@/hooks/use-categories';
import { useAuth } from './use-auth';

type OrdersState = {
    orders: Order[];
    addOrder: (order: Omit<Order, 'createdAt'>) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
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
            updateOrderStatus: (orderId, status, reason) => {
                set((state) => {
                    const orderIndex = state.orders.findIndex((o) => o.id === orderId);
                    if (orderIndex === -1) return state;

                    const orders = [...state.orders];
                    const orderToUpdate = { ...orders[orderIndex] };

                    // Prevent re-processing if status is the same
                    if (orderToUpdate.status === status) return state;

                    // Process refund logic
                    if (status === 'refunded' && orderToUpdate.status !== 'refunded') {
                        if (orderToUpdate.paymentMethod.id === 'store_wallet') {
                            useAuth.getState().updateWalletBalance(orderToUpdate.customer.id, orderToUpdate.total);
                        }
                        orderToUpdate.refundReason = reason;
                        orderToUpdate.refundedAt = new Date().toISOString();
                        // Note: stock is not returned on refund in this implementation
                    }

                    // Process completion logic
                    if (status === 'completed') {
                        const { deliverStockForOrder } = useStock.getState();
                        const { categories } = useCategoriesStore.getState();
                        const categoryMap = new Map(categories.map(c => [c.name, c]));
                        const deliveredItems: Order['deliveredItems'] = { ...orderToUpdate.deliveredItems };
                        
                        for (const item of orderToUpdate.items) {
                            const category = categoryMap.get(item.category);
                            if (category?.deliveryMethod === 'instant') {
                                const deliveredCodes = deliverStockForOrder(item.productId, item.quantity);
                                if (deliveredCodes.length > 0) {
                                    deliveredItems[item.id] = deliveredCodes;
                                }
                            }
                        }
                        orderToUpdate.deliveredItems = deliveredItems;
                    }

                    orderToUpdate.status = status;
                    orders[orderIndex] = orderToUpdate;
                    
                    return { orders };
                });
            },
        }),
        {
            name: 'topup-hub-orders',
        }
    )
);
