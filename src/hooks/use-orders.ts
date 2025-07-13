
'use client';

import { create } from 'zustand';
import type { Order, OrderStatus, User } from '@/lib/types';
import { useStock } from '@/hooks/use-stock';
import { useCategories } from '@/hooks/use-categories';
import { useUserDatabase } from './use-user-database';
import { USD_TO_VALHALLA_COIN_RATE } from '@/lib/ranks';
import { createClient } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { useAuth } from './use-auth';

type OrdersState = {
    orders: Order[];
    isLoading: boolean;
    fetchOrders: () => Promise<void>;
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'customer' | 'reviewPrompted'>) => Promise<Order>;
    updateOrderStatus: (orderId: string, status: OrderStatus, reason?: string, deliveredItems?: Record<string, string[]>) => Promise<void>;
    markOrderAsReviewPrompted: (orderIds: string[]) => Promise<void>;
    updateDeliveredItems: (orderId: string, deliveredItems: Record<string, string[]>) => Promise<void>;
};

export const useOrders = create<OrdersState>((set, get) => ({
    orders: [],
    isLoading: true,
    fetchOrders: async () => {
        const supabase = createClient();
        const { findUserById } = useUserDatabase.getState();
        set({ isLoading: true });

        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('createdAt', { ascending: false });
        
        if (error) {
            console.error("Error fetching orders:", error);
            set({ orders: [], isLoading: false });
            return;
        }

        const enrichedOrders = data.map(order => {
            const customer = findUserById(order.customerId);
            return { ...order, customer };
        }).filter(order => order.customer); // Filter out orders where customer couldn't be found

        set({ orders: enrichedOrders as Order[], isLoading: false });
    },
    addOrder: async (newOrderData) => {
        const supabase = createClient();
        const { user: authUser } = useAuth.getState();
        if (!authUser) throw new Error("User not authenticated");

        const { data, error } = await supabase
            .from('orders')
            .insert([{ ...newOrderData, customerId: authUser.id }])
            .select()
            .single();
        
        if (error) {
            console.error("Error adding order:", error);
            throw error;
        }

        const newOrder: Order = { ...data, customer: authUser };
        
        if (newOrder.valhallaCoinsApplied && newOrder.valhallaCoinsApplied > 0) {
            const { updateUser } = useUserDatabase.getState();
            await updateUser(authUser.id, { valhallaCoins: authUser.valhallaCoins - newOrder.valhallaCoinsApplied });
        }

        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return newOrder;
    },
    updateOrderStatus: async (orderId, status, reason, manualDeliveredItems) => {
        const { orders } = get();
        const orderToUpdate = orders.find((o) => o.id === orderId);
        if (!orderToUpdate || orderToUpdate.status === status) return;

        const supabase = createClient();
        const { updateUser } = useUserDatabase.getState();
        const { user: customer } = orderToUpdate;

        const updates: Partial<Order> = { status };
        
        if (status === 'refunded') {
            updates.refundReason = reason;
            updates.refundedAt = new Date().toISOString();
        }

        if (status === 'completed' && orderToUpdate.status !== 'completed') {
            const { deliverStockForOrder } = useStock.getState();
            const { categories } = useCategories.getState();
            const categoryMap = new Map(categories.map(c => [c.name, c]));
            const allDeliveredItems: Order['deliveredItems'] = { ...(manualDeliveredItems || {}) };
            
            for (const item of orderToUpdate.items) {
                const category = categoryMap.get(item.category);
                if (category?.deliveryMethod === 'instant') {
                    const deliveredCodes = await deliverStockForOrder(item.productId, item.quantity);
                    if (deliveredCodes.length > 0) {
                        allDeliveredItems[item.id] = deliveredCodes;
                    }
                }
            }
            updates.deliveredItems = allDeliveredItems;
        }

        const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
        if (error) {
            console.error('Error updating order status:', error);
            return;
        }
        
        // Handle side effects after successful DB update
        if (status === 'refunded') {
            if (orderToUpdate.paymentMethod.id === 'store_wallet') {
                await updateUser(customer.id, { walletBalance: customer.walletBalance + orderToUpdate.total });
            }
            if (orderToUpdate.valhallaCoinsApplied && orderToUpdate.valhallaCoinsApplied > 0) {
                await updateUser(customer.id, { valhallaCoins: customer.valhallaCoins + orderToUpdate.valhallaCoinsApplied });
            }
            // TODO: Deduct XP and earned coins if it was previously completed
        }

        if (status === 'completed' && orderToUpdate.status !== 'completed') {
            const { subscribeToPremium } = useUserDatabase.getState();
            const premiumItem = orderToUpdate.items.find(item => item.productId === 'premium-membership-product');
            if (premiumItem) {
                await subscribeToPremium(customer.id, premiumItem.quantity);
            }
            
            const freshCustomer = useUserDatabase.getState().findUserById(customer.id);
            const isPremium = !!(freshCustomer?.premium && new Date(freshCustomer.premium.expiresAt) > new Date());
            const xpMultiplier = isPremium ? 1.5 : 1.0;
            const cashSpent = orderToUpdate.total - (orderToUpdate.valhallaCoinsValue || 0);

            if (cashSpent > 0) {
                await updateUser(customer.id, { totalSpent: customer.totalSpent + (cashSpent * xpMultiplier) });
                const coinsToAward = Math.floor(cashSpent * USD_TO_VALHALLA_COIN_RATE);
                if (coinsToAward > 0) {
                    await updateUser(customer.id, { valhallaCoins: customer.valhallaCoins + coinsToAward });
                }
            }
        }
        
        // Refetch to ensure local state is consistent
        get().fetchOrders();
    },
    markOrderAsReviewPrompted: async (orderIds: string[]) => {
        const supabase = createClient();
        const { error } = await supabase.from('orders').update({ reviewPrompted: true }).in('id', orderIds);
        if (error) console.error("Error marking orders as prompted:", error);
        else {
            set((state) => ({
                orders: state.orders.map(order =>
                    orderIds.includes(order.id)
                    ? { ...order, reviewPrompted: true }
                    : order
                )
            }));
        }
    },
    updateDeliveredItems: async (orderId, deliveredItems) => {
        const supabase = createClient();
        const { error } = await supabase.from('orders').update({ deliveredItems }).eq('id', orderId);
        if (error) console.error("Error updating delivered items:", error);
        else {
            set((state) => ({
                orders: state.orders.map(order =>
                    order.id === orderId ? { ...order, deliveredItems } : order
                )
            }));
        }
    },
}));

export function OrdersInitializer() {
    const { isInitialized } = useUserDatabase.getState();
    useEffect(() => {
        if (isInitialized) {
            useOrders.getState().fetchOrders();
        }
    }, [isInitialized]);
    
    return null;
}
