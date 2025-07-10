
'use client';

import { useState, useMemo } from 'react';
import type React from 'react';
import { useUserDatabase } from '@/hooks/use-user-database';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Coins, Wallet, Gem, Shield, ShieldOff, MessageCircleWarning, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown, ShieldBan } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCurrency, CONVERSION_RATES } from '@/hooks/use-currency';

export default function AdminUsersPage() {
  const { users, updateUser, banUser, unbanUser, sendWarning, subscribeToPremium, cancelSubscription } = useUserDatabase();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBalanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [isWarningDialogOpen, setWarningDialogOpen] = useState(false);
  const [isBanDialogOpen, setBanDialogOpen] = useState(false);
  
  const [walletAddAmountUSD, setWalletAddAmountUSD] = useState('');
  const [walletAddAmountTND, setWalletAddAmountTND] = useState('');
  const [walletRemoveAmountUSD, setWalletRemoveAmountUSD] = useState('');
  const [walletRemoveAmountTND, setWalletRemoveAmountTND] = useState('');
  const [coinsAddAmount, setCoinsAddAmount] = useState('');
  const [coinsRemoveAmount, setCoinsRemoveAmount] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [banReason, setBanReason] = useState('');

  const nonAdminUsers = useMemo(() => users.filter(u => !u.isAdmin), [users]);

  const handleOpenBalanceDialog = (user: User) => {
    setSelectedUser(user);
    setWalletAddAmountUSD('');
    setWalletAddAmountTND('');
    setWalletRemoveAmountUSD('');
    setWalletRemoveAmountTND('');
    setCoinsAddAmount('');
    setCoinsRemoveAmount('');
    setBalanceDialogOpen(true);
  };
  
  const handleOpenWarningDialog = (user: User) => {
    setSelectedUser(user);
    setWarningMessage('');
    setWarningDialogOpen(true);
  };

  const handleOpenBanDialog = (user: User) => {
    setSelectedUser(user);
    setBanReason('');
    setBanDialogOpen(true);
  };

  const handleBalanceUpdate = () => {
    if (!selectedUser) return;
    
    const addUSD = parseFloat(walletAddAmountUSD) || 0;
    const addTND = parseFloat(walletAddAmountTND) || 0;
    const removeUSD = parseFloat(walletRemoveAmountUSD) || 0;
    const removeTND = parseFloat(walletRemoveAmountTND) || 0;
    
    const totalUSDToAdd = addUSD + (addTND / CONVERSION_RATES.TND);
    const totalUSDToRemove = removeUSD + (removeTND / CONVERSION_RATES.TND);

    const coinsToAdd = parseInt(coinsAddAmount) || 0;
    const coinsToRemove = parseInt(coinsRemoveAmount) || 0;

    const newWalletBalance = selectedUser.walletBalance + totalUSDToAdd - totalUSDToRemove;
    const newCoinsBalance = selectedUser.valhallaCoins + coinsToAdd - coinsToRemove;
    
    updateUser(selectedUser.id, {
        walletBalance: newWalletBalance < 0 ? 0 : newWalletBalance,
        valhallaCoins: newCoinsBalance < 0 ? 0 : newCoinsBalance,
    });
    
    if (totalUSDToAdd || totalUSDToRemove || coinsToAdd || coinsToRemove) {
        toast({ title: "Balances Updated", description: `${selectedUser.name}'s balances have been adjusted.` });
    }
    
    setBalanceDialogOpen(false);
  };

  const handleSendWarning = () => {
    if (!selectedUser || !warningMessage.trim()) return;
    sendWarning(selectedUser.id, warningMessage);
    toast({ title: "Warning Sent", description: `A warning has been sent to ${selectedUser.name}.` });
    setWarningDialogOpen(false);
  };
  
  const handleGivePremium = (userId: string) => {
    subscribeToPremium(userId, 1);
    toast({ title: "Premium Granted", description: "The user has been given 1 month of Premium." });
  };
  
  const handleRemovePremium = (userId: string) => {
    cancelSubscription(userId);
    toast({ title: "Premium Removed", description: "The user's premium subscription has been cancelled." });
  };
  
  const handleBan = () => {
    if (!selectedUser) return;
    banUser(selectedUser.id, banReason);
    toast({ title: "User Banned", description: `${selectedUser.name} has been banned.` });
    setBanDialogOpen(false);
  };

  const handleUnban = (userId: string) => {
    unbanUser(userId);
    toast({ title: "User Unbanned", description: "The user has been unbanned." });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Oversee and manage all registered users.</p>
      </div>
      
      {/* Manage Balance Dialog */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Balances for {selectedUser?.name}</DialogTitle>
            <DialogDescription>Add or remove funds. Changes are calculated in USD and applied upon saving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Wallet Balance</Label>
                    <span className="font-bold text-lg text-primary">{formatPrice(selectedUser?.walletBalance ?? 0)}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-1 text-green-600 mb-2"><ArrowUp className="h-4 w-4"/>Add Funds</Label>
                    <div className="grid grid-cols-2 gap-2">
                       <Input type="number" min="0" step="0.01" placeholder="0.00 USD" value={walletAddAmountUSD} onChange={(e) => setWalletAddAmountUSD(e.target.value)} />
                       <Input type="number" min="0" step="0.01" placeholder="0.00 TND" value={walletAddAmountTND} onChange={(e) => setWalletAddAmountTND(e.target.value)} />
                    </div>
                  </div>
                   <div>
                    <Label className="flex items-center gap-1 text-red-600 mb-2"><ArrowDown className="h-4 w-4"/>Remove Funds</Label>
                     <div className="grid grid-cols-2 gap-2">
                       <Input type="number" min="0" step="0.01" placeholder="0.00 USD" value={walletRemoveAmountUSD} onChange={(e) => setWalletRemoveAmountUSD(e.target.value)} />
                       <Input type="number" min="0" step="0.01" placeholder="0.00 TND" value={walletRemoveAmountTND} onChange={(e) => setWalletRemoveAmountTND(e.target.value)} />
                    </div>
                  </div>
                </div>
            </div>
            <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Valhalla Coins</Label>
                    <span className="font-bold text-lg text-amber-500">{selectedUser?.valhallaCoins.toLocaleString() ?? 0}</span>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="coins-add" className="flex items-center gap-1 text-green-600"><ArrowUp className="h-4 w-4"/>Add Coins</Label>
                        <Input id="coins-add" type="number" min="0" step="1" placeholder="0" value={coinsAddAmount} onChange={(e) => setCoinsAddAmount(e.target.value)} />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="coins-remove" className="flex items-center gap-1 text-red-600"><ArrowDown className="h-4 w-4"/>Remove Coins</Label>
                        <Input id="coins-remove" type="number" min="0" step="1" placeholder="0" value={coinsRemoveAmount} onChange={(e) => setCoinsRemoveAmount(e.target.value)} />
                    </div>
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
            <Button onClick={handleBalanceUpdate}>Update Balances</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Send Warning Dialog */}
      <Dialog open={isWarningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Warning to {selectedUser?.name}</DialogTitle>
            <DialogDescription>This message will be displayed prominently on the user's dashboard.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <Textarea value={warningMessage} onChange={(e) => setWarningMessage(e.target.value)} placeholder="e.g., Your recent activity violates our terms of service..." rows={4} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleSendWarning}>Send Warning</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban {selectedUser?.name}?</DialogTitle>
            <DialogDescription>The user will be able to log in but will be redirected to a page informing them of the ban.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <Label htmlFor="ban-reason">Reason for Ban</Label>
             <Textarea id="ban-reason" value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="e.g., Violation of terms of service." rows={4} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleBan}>Confirm Ban</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>A list of all non-admin users in your store.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6 md:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonAdminUsers.map((user) => {
                const isPremium = !!(user.premium && user.premium.status === 'active' && new Date(user.premium.expiresAt) > new Date());
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            {isPremium && <Badge variant="outline" className="border-yellow-500 text-yellow-500 font-bold">PREMIUM</Badge>}
                            {user.isBanned && <Badge variant="destructive">Banned</Badge>}
                            {user.warningMessage && <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">Warned</Badge>}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenBalanceDialog(user)}>
                            <Wallet className="mr-2 h-4 w-4" /> Manage Balances
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Gem className="mr-2 h-4 w-4" />
                                <span>Manage Premium</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleGivePremium(user.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Give 1 Month Premium
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRemovePremium(user.id)} disabled={!isPremium}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Revoke Premium
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenWarningDialog(user)}>
                            <MessageCircleWarning className="mr-2 h-4 w-4" /> Send Warning
                          </DropdownMenuItem>
                          {user.isBanned ? (
                            <DropdownMenuItem onClick={() => handleUnban(user.id)}>
                                <Shield className="mr-2 h-4 w-4" /> Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-destructive" onClick={() => handleOpenBanDialog(user)}>
                                <ShieldBan className="mr-2 h-4 w-4" /> Ban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
