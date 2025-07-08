
'use client';

import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Invalid email address.'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ['confirmPassword'],
});

export default function SettingsPage() {
    const { user, updateUser, changePassword, updateAvatar } = useAuth();
    const { toast } = useToast();
    const { t } = useTranslation();

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
        },
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onProfileSubmit = (values: z.infer<typeof profileSchema>) => {
        if (!user) return;
        updateUser(user.id, values);
        toast({ title: t('dashboardSettings.profileUpdatedToast'), description: t('dashboardSettings.profileUpdatedToastDesc') });
    };

    const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
        if (!user) return;
        // In a real app, you'd verify the current password against a backend.
        if (user.password !== values.currentPassword) {
            passwordForm.setError('currentPassword', { message: 'Incorrect current password.' });
            return;
        }
        changePassword(user.id, values.newPassword);
        toast({ title: t('dashboardSettings.passwordChangedToast'), description: t('dashboardSettings.passwordChangedToastDesc') });
        passwordForm.reset();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    updateAvatar(user.id, reader.result);
                    toast({ title: t('dashboardSettings.avatarUpdatedToast') });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">{t('dashboardSettings.title')}</h1>
                <p className="text-muted-foreground">{t('dashboardSettings.subtitle')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardSettings.profilePicture')}</CardTitle>
                    <CardDescription>{t('dashboardSettings.profilePictureDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">{t('dashboardSettings.uploadNewPicture')}</Label>
                            <Input id="picture" type="file" accept="image/*" onChange={handleAvatarChange} className="file:text-primary file:font-semibold" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardSettings.personalInfo')}</CardTitle>
                    <CardDescription>{t('dashboardSettings.personalInfoDesc')}</CardDescription>
                </CardHeader>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField control={profileForm.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={profileForm.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.email')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit">{t('dashboardSettings.saveChanges')}</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('dashboardSettings.changePassword')}</CardTitle>
                    <CardDescription>{t('dashboardSettings.changePasswordDesc')}</CardDescription>
                </CardHeader>
                 <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.currentPassword')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.newPassword')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                <FormItem><FormLabel>{t('dashboardSettings.confirmNewPassword')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit">{t('dashboardSettings.updatePassword')}</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
