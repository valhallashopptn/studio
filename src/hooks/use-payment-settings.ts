
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentMethod } from '@/lib/types';

type PaymentSettingsState = {
  paymentMethods: PaymentMethod[];
  addMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  updateMethod: (method: PaymentMethod) => void;
  deleteMethod: (methodId: string) => void;
};

const initialPaymentMethods: PaymentMethod[] = [
    {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: 'Landmark',
        instructions: 'Please transfer the total amount to:\nBank: First National Bank\nAccount Name: TopUp Hub Inc.\nAccount Number: 123-456-7890\n\nPlease include your Order ID in the transaction description.',
        requiresProof: true,
    },
    {
        id: 'e_wallet',
        name: 'E-Wallet',
        icon: 'Wallet',
        instructions: 'Please send the total amount to:\nService: PayNow\nRecipient Name: TopUp Hub\nPhone Number: +1 987 654 3210\n\nPlease include your Order ID in the payment reference.',
        requiresProof: false,
    }
];

export const usePaymentSettings = create(
  persist<PaymentSettingsState>(
    (set) => ({
      paymentMethods: initialPaymentMethods,
      addMethod: (methodData) => set((state) => ({
          paymentMethods: [...state.paymentMethods, { id: `pm_${Date.now()}`, ...methodData }]
      })),
      updateMethod: (updatedMethod) => set((state) => ({
          paymentMethods: state.paymentMethods.map(m => m.id === updatedMethod.id ? updatedMethod : m)
      })),
      deleteMethod: (methodId) => set((state) => ({
          paymentMethods: state.paymentMethods.filter(m => m.id !== methodId)
      })),
    }),
    {
      name: 'topup-hub-payment-settings',
    }
  )
);
