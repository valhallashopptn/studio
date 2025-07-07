
'use client';

import { useState, useEffect } from 'react';
import { paymentMethods as initialPaymentMethods } from '@/lib/data';
import type { PaymentMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Landmark, Wallet } from 'lucide-react';


export default function AdminSettingsPage() {
    const { toast } = useToast();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setPaymentMethods(initialPaymentMethods);
        setIsMounted(true);
    }, []);

    const handleSave = () => {
        // In a real app, this would be an API call to save the settings
        console.log("Saving settings:", paymentMethods);
        toast({
            title: "Settings Saved",
            description: "Your payment method details have been updated.",
        });
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Payment Settings</h1>
                <p className="text-muted-foreground">Manage your manual payment methods.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                        Configure the details for manual payment methods. These instructions will be shown to users at checkout.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4 rounded-md border p-4">
                        <div className="flex items-center gap-2">
                             <Landmark className="h-5 w-5 text-primary" />
                             <h3 className="font-semibold">Bank Transfer Details</h3>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bank-name">Bank Name</Label>
                            <Input id="bank-name" defaultValue="First National Bank" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="account-name">Account Name</Label>
                            <Input id="account-name" defaultValue="TopUp Hub Inc." />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="account-number">Account Number</Label>
                            <Input id="account-number" defaultValue="123-456-7890" />
                        </div>
                    </div>

                     <div className="space-y-4 rounded-md border p-4">
                        <div className="flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">E-Wallet Details</h3>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ewallet-service">Service Name</Label>
                            <Input id="ewallet-service" defaultValue="PayNow" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="ewallet-recipient">Recipient Name</Label>
                            <Input id="ewallet-recipient" defaultValue="TopUp Hub" />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="ewallet-phone">Phone Number / ID</Label>
                            <Input id="ewallet-phone" defaultValue="+1 987 654 3210" />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
