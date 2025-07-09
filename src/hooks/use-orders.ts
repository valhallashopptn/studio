
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus } from '@/lib/types';
import { useStock } from '@/hooks/use-stock';
import { useCategoriesStore } from '@/hooks/use-categories';
import { useAuth } from './use-auth';
import { USD_TO_VALHALLA_COIN_RATE } from '@/lib/ranks';

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
                
                // Deduct any used Valhalla Coins immediately on order creation
                if (newOrder.customer.id && newOrder.valhallaCoinsApplied && newOrder.valhallaCoinsApplied > 0) {
                    useAuth.getState().updateValhallaCoins(newOrder.customer.id, -newOrder.valhallaCoinsApplied);
                }

                set((state) => ({ orders: [newOrder, ...state.orders] }));
            },
            updateOrderStatus: (orderId, status, reason) => {
                set((state) => {
                    const orderIndex = state.orders.findIndex((o) => o.id === orderId);
                    if (orderIndex === -1) return state;

                    const orders = [...state.orders];
                    const orderToUpdate = { ...orders[orderIndex] };
                    const previousStatus = orderToUpdate.status;

                    // Prevent redundant updates
                    if (previousStatus === status) return state;

                    // Process refund logic
                    if (status === 'refunded' && previousStatus !== 'refunded') {
                        // Refund wallet balance if applicable
                        if (orderToUpdate.paymentMethod.id === 'store_wallet') {
                            useAuth.getState().updateWalletBalance(orderToUpdate.customer.id, orderToUpdate.total);
                        }
                        // Refund used Valhalla Coins
                        if (orderToUpdate.valhallaCoinsApplied && orderToUpdate.valhallaCoinsApplied > 0) {
                            useAuth.getState().updateValhallaCoins(orderToUpdate.customer.id, orderToUpdate.valhallaCoinsApplied);
                        }
                        
                        // Deduct XP and Coins earned from this purchase if it was completed
                        if(previousStatus === 'completed') {
                            const cashSpent = (orderToUpdate.total + (orderToUpdate.discountAmount ?? 0)) - (orderToUpdate.valhallaCoinsValue ?? 0);
                            useAuth.getState().updateTotalSpent(orderToUpdate.customer.id, -cashSpent);
                            const coinsEarned = Math.floor(cashSpent * USD_TO_VALHALLA_COIN_RATE);
                            useAuth.getState().updateValhallaCoins(orderToUpdate.customer.id, -coinsEarned);
                        }

                        orderToUpdate.refundReason = reason;
                        orderToUpdate.refundedAt = new Date().toISOString();
                    }

                    // Process completion logic - only if moving from a non-completed state
                    if (status === 'completed' && previousStatus !== 'completed') {
                        const { updateTotalSpent, updateValhallaCoins } = useAuth.getState();
                        
                        // Amount paid with cash/wallet after all discounts and coin redemptions
                        const cashSpent = (orderToUpdate.total + (orderToUpdate.discountAmount || 0)) - (orderToUpdate.valhallaCoinsValue || 0);

                        // Grant XP and Valhalla coins based on cash spent
                        if (cashSpent > 0) {
                            updateTotalSpent(orderToUpdate.customer.id, cashSpent);
                            const coinsToAward = Math.floor(cashSpent * USD_TO_VALHALLA_COIN_RATE);
                            updateValhallaCoins(orderToUpdate.customer.id, coinsToAward);
                        }
                        
                        // Deliver instant stock if applicable
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
