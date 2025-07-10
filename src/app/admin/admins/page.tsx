
'use client';

import { useState, useMemo } from 'react';
import type React from 'react';
import { useUserDatabase } from '@/hooks/use-user-database';
import type { User, AdminPermissions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Check, X, Shield, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const permissionsSchema = z.object({
  canManageProducts: z.boolean().default(false),
  canManageCategories: z.boolean().default(false),
  canManageOrders: z.boolean().default(false),
  canManageUsers: z.boolean().default(false),
  canManageCoupons: z.boolean().default(false),
  canManageAppearance: z.boolean().default(false),
  canManageAdmins: z.boolean().default(false),
});

const addAdminSchema = z.object({
  userId: z.string().min(1, "Please select a user."),
  permissions: permissionsSchema,
});

export const ALL_PERMISSIONS: { key: keyof AdminPermissions, label: string, description: string }[] = [
    { key: 'canManageProducts', label: 'Manage Products', description: 'Can add, edit, and delete products and stock.' },
    { key: 'canManageCategories', label: 'Manage Categories', description: 'Can add, edit, and delete categories.' },
    { key: 'canManageOrders', label: 'Manage Orders', description: 'Can view and update the status of all orders.' },
    { key: 'canManageUsers', label: 'Manage Users', description: 'Can ban, warn, and edit user balances.' },
    { key: 'canManageCoupons', label: 'Manage Coupons', description: 'Can create and delete promotional coupons.' },
    { key: 'canManageAppearance', label: 'Manage Appearance', description: 'Can change site theme, branding, and content.' },
    { key: 'canManageAdmins', label: 'Manage Admins', description: 'Can add, edit permissions for, and remove other admins.' },
];

export default function AdminAdminsPage() {
    const { users, promoteToAdmin, demoteAdmin, updateAdminPermissions } = useUserDatabase();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<User | null>(null);

    const admins = useMemo(() => users.filter(u => u.isAdmin), [users]);
    const regularUsers = useMemo(() => users.filter(u => !u.isAdmin), [users]);

    const form = useForm<z.infer<typeof addAdminSchema>>({
        resolver: zodResolver(addAdminSchema),
        defaultValues: {
            userId: '',
            permissions: {
                canManageProducts: false,
                canManageCategories: false,
                canManageOrders: false,
                canManageUsers: false,
                canManageCoupons: false,
                canManageAppearance: false,
                canManageAdmins: false,
            }
        }
    });

    const handleAddNew = () => {
        setEditingAdmin(null);
        form.reset();
        setIsDialogOpen(true);
    };

    const handleEdit = (admin: User) => {
        setEditingAdmin(admin);
        form.setValue('userId', admin.id);
        form.setValue('permissions', admin.permissions || {});
        setIsDialogOpen(true);
    };

    const handleDelete = (adminId: string) => {
        demoteAdmin(adminId);
        toast({ title: "Admin Removed", description: "The user has been returned to regular user status." });
    };

    const onSubmit = (values: z.infer<typeof addAdminSchema>) => {
        if (editingAdmin) {
            updateAdminPermissions(editingAdmin.id, values.permissions);
            toast({ title: "Admin Permissions Updated" });
        } else {
            promoteToAdmin(values.userId, values.permissions);
            toast({ title: "Admin Added", description: "The user has been promoted to an admin role." });
        }
        setIsDialogOpen(false);
        setEditingAdmin(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold">Admin Management</h1>
                <p className="text-muted-foreground">Add, remove, and manage permissions for administrators.</p>
                </div>
                <Button onClick={handleAddNew}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Admin
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{editingAdmin ? 'Edit Admin Permissions' : 'Add New Admin'}</DialogTitle>
                    <DialogDescription>
                    {editingAdmin ? `Editing permissions for ${editingAdmin.name}.` : 'Select a user to promote and configure their permissions.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form id="admin-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {!editingAdmin && (
                             <FormField
                                control={form.control}
                                name="userId"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User to Promote</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {regularUsers.map(user => (
                                        <SelectItem key={user.id} value={user.id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {user.name} ({user.email})
                                            </div>
                                        </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                       
                        <Separator />

                        <div className="space-y-1">
                            <h3 className="font-medium">Permissions</h3>
                            <div className="space-y-4 pt-2">
                                {ALL_PERMISSIONS.map((p) => (
                                    <FormField
                                        key={p.key}
                                        control={form.control}
                                        name={`permissions.${p.key}`}
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                <div className="space-y-0.5">
                                                <FormLabel>{p.label}</FormLabel>
                                                <FormDescription>{p.description}</FormDescription>
                                                </div>
                                                <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                    </form>
                </Form>
                 <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="submit" form="admin-form">Save Changes</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                <CardTitle>Current Admins</CardTitle>
                <CardDescription>A list of all users with administrative privileges.</CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-6 md:pt-0">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Permissions Summary</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.map(admin => {
                            const permissionCount = admin.permissions ? Object.values(admin.permissions).filter(Boolean).length : 0;
                            const isOwner = admin.id === '1'; // Assuming '1' is the immutable owner ID
                            return (
                                <TableRow key={admin.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3 font-medium">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={admin.avatar} />
                                                <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                {admin.name}
                                                {isOwner && <span className="text-xs text-primary font-bold ml-2">(Owner)</span>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {permissionCount} / {ALL_PERMISSIONS.length} permissions
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isOwner}>
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(admin)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Permissions
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(admin.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Demote to User
                                            </DropdownMenuItem>
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
