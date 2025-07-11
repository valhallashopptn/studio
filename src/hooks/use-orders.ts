
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, OrderStatus, User } from '@/lib/types';
import { useStock } from '@/hooks/use-stock';
import { useCategories } from '@/hooks/use-categories';
import { useAuth } from './use-auth';
import { USD_TO_VALHALLA_COIN_RATE } from '@/lib/ranks';
import { useUserDatabase } from './use-user-database';

type OrdersState = {
    orders: Order[];
    addOrder: (order: Omit<Order, 'createdAt'>) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string, deliveredItems?: Record<string, string[]>) => void;
    markOrderAsReviewPrompted: (orderIds: string[]) => void;
    updateDeliveredItems: (orderId: string, deliveredItems: Record<string, string[]>) => void;
};

export const useOrders = create(
    persist<OrdersState>(
        (set, get) => ({
            orders: [],
            addOrder: (newOrderData) => {
                const newOrder: Order = {
                    ...newOrderData,
                    createdAt: new Date().toISOString(),
                    reviewPrompted: false,
                };
                
                // Deduct any used Valhalla Coins immediately on order creation
                if (newOrder.customer.id && newOrder.valhallaCoinsApplied && newOrder.valhallaCoinsApplied > 0) {
                    useAuth.getState().updateValhallaCoins(newOrder.customer.id, -newOrder.valhallaCoinsApplied);
                }

                set((state) => ({ orders: [newOrder, ...state.orders] }));
            },
            updateOrderStatus: (orderId, status, reason, manualDeliveredItems) => {
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
                            const { findUserById } = useUserDatabase.getState();
                            const user = findUserById(orderToUpdate.customer.id);
                            const isPremium = !!(user?.premium && user.premium.status === 'active' && new Date(user.premium.expiresAt) > new Date());
                            const xpMultiplier = isPremium ? 1.5 : 1.0;
                            
                            const cashSpent = (orderToUpdate.total + (orderToUpdate.discountAmount ?? 0)) - (orderToUpdate.valhallaCoinsValue ?? 0);
                            useAuth.getState().updateTotalSpent(orderToUpdate.customer.id, -(cashSpent * xpMultiplier));
                            const coinsEarned = Math.floor(cashSpent * USD_TO_VALHALLA_COIN_RATE);
                            useAuth.getState().updateValhallaCoins(orderToUpdate.customer.id, -coinsEarned);
                        }

                        orderToUpdate.refundReason = reason;
                        orderToUpdate.refundedAt = new Date().toISOString();
                    }

                    // Process completion logic - only if moving from a non-completed state
                    if (status === 'completed' && previousStatus !== 'completed') {
                        const { updateTotalSpent, updateValhallaCoins } = useAuth.getState();
                        const { findUserById } = useUserDatabase.getState();
                        
                        // Check for premium subscription item in the order
                        const premiumItem = orderToUpdate.items.find(item => item.productId === 'premium-membership-product');
                        if (premiumItem) {
                            const { subscribeToPremium } = useAuth.getState();
                            subscribeToPremium(orderToUpdate.customer.id, premiumItem.quantity);
                        }
                        
                        // We need the user's LATEST status to check for premium boost.
                        const user = findUserById(orderToUpdate.customer.id);
                        const isPremium = !!(user?.premium && user.premium.status === 'active' && new Date(user.premium.expiresAt) > new Date());
                        const xpMultiplier = isPremium ? 1.5 : 1.0;
                        
                        // Amount paid with cash/wallet after all discounts and coin redemptions
                        const cashSpent = (orderToUpdate.total + (orderToUpdate.discountAmount || 0)) - (orderToUpdate.valhallaCoinsValue || 0);

                        // Grant XP and Valhalla coins based on cash spent
                        if (cashSpent > 0) {
                            updateTotalSpent(orderToUpdate.customer.id, cashSpent * xpMultiplier);
                            const coinsToAward = Math.floor(cashSpent * USD_TO_VALHALLA_COIN_RATE);
                            updateValhallaCoins(orderToUpdate.customer.id, coinsToAward);
                        }
                        
                        // --- DELIVERY LOGIC ---
                        const { deliverStockForOrder } = useStock.getState();
                        const { categories } = useCategories.getState();
                        const categoryMap = new Map(categories.map(c => [c.name, c]));
                        const allDeliveredItems: Order['deliveredItems'] = { ...(manualDeliveredItems || {}) };
                        
                        for (const item of orderToUpdate.items) {
                            const category = categoryMap.get(item.category);
                            if (category?.deliveryMethod === 'instant') {
                                const deliveredCodes = deliverStockForOrder(item.productId, item.quantity);
                                if (deliveredCodes.length > 0) {
                                    allDeliveredItems[item.id] = deliveredCodes;
                                }
                            }
                        }
                        orderToUpdate.deliveredItems = allDeliveredItems;
                    }

                    orderToUpdate.status = status;
                    orders[orderIndex] = orderToUpdate;
                    
                    return { orders };
                });
            },
            markOrderAsReviewPrompted: (orderIds: string[]) => {
                const orderIdSet = new Set(orderIds);
                set((state) => ({
                    orders: state.orders.map(order => 
                        orderIdSet.has(order.id)
                        ? { ...order, reviewPrompted: true }
                        : order
                    )
                }));
            },
            updateDeliveredItems: (orderId, deliveredItems) => {
                set((state) => ({
                    orders: state.orders.map(order =>
                        order.id === orderId ? { ...order, deliveredItems } : order
                    )
                }));
            },
        }),
        {
            name: 'topup-hub-orders',
        }
    )
);
