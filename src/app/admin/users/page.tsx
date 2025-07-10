
'use client';

import { useState, useMemo } from 'react';
import type React from 'react';
import { useUserDatabase } from '@/hooks/use-user-database';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Coins, Wallet, Gem, Shield, ShieldOff, MessageCircleWarning, Trash2, CheckCircle, XCircle } from 'lucide-react';
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

export default function AdminUsersPage() {
  const { users } = useUserDatabase();
  const { updateWalletBalance, updateValhallaCoins, subscribeToPremium, cancelSubscription, banUser, unbanUser, sendWarning } = useUserDatabase();
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isBalanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [isWarningDialogOpen, setWarningDialogOpen] = useState(false);
  
  const [walletAmount, setWalletAmount] = useState(0);
  const [coinsAmount, setCoinsAmount] = useState(0);
  const [warningMessage, setWarningMessage] = useState('');

  const nonAdminUsers = useMemo(() => users.filter(u => !u.isAdmin), [users]);

  const handleOpenBalanceDialog = (user: User) => {
    setSelectedUser(user);
    setWalletAmount(0);
    setCoinsAmount(0);
    setBalanceDialogOpen(true);
  };
  
  const handleOpenWarningDialog = (user: User) => {
    setSelectedUser(user);
    setWarningMessage('');
    setWarningDialogOpen(true);
  };

  const handleBalanceUpdate = () => {
    if (!selectedUser) return;
    if (walletAmount !== 0) updateWalletBalance(selectedUser.id, walletAmount);
    if (coinsAmount !== 0) updateValhallaCoins(selectedUser.id, coinsAmount);
    toast({ title: "Balances Updated", description: `${selectedUser.name}'s balances have been adjusted.` });
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
  
  const handleBan = (userId: string) => {
    banUser(userId);
    toast({ title: "User Banned", description: "The user has been banned and can no longer log in." });
  };

  const handleUnban = (userId: string) => {
    unbanUser(userId);
    toast({ title: "User Unbanned", description: "The user has been unbanned and can now log in." });
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
            <DialogDescription>Add or remove funds from the user's wallet and coin balance. Use negative numbers to remove.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="wallet-amount">Wallet Balance (TND)</Label>
                <Input id="wallet-amount" type="number" value={walletAmount} onChange={(e) => setWalletAmount(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="coins-amount">Valhalla Coins</Label>
                <Input id="coins-amount" type="number" value={coinsAmount} onChange={(e) => setCoinsAmount(parseInt(e.target.value) || 0)} />
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
                            <DropdownMenuItem className="text-destructive" onClick={() => handleBan(user.id)}>
                                <ShieldOff className="mr-2 h-4 w-4" /> Ban User
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
