
'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, X, Bot, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, query, orderBy, getDoc, setDoc } from 'firebase/firestore';
import type { ChatMessage, ChatSession } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { useContentSettings } from '@/hooks/use-content-settings';

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-2.0441-.2733-4.2158-.2733-6.2599 0-.1636-.3847-.3973-.8742-.6082-1.2495a.0741.0741 0 00-.0785-.0371 19.7363 19.7363 0 00-4.8852 1.5152.069.069 0 00-.0321.0233C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0586c.2148.1354.4363.254.66.3615a.0751.0751 0 00.0776-.0206c.6776-.5545 1.133-1.2312 1.442-2.0022a.076.076 0 00-.0416-.1064c-.3997-.1582-.7882-.345-1.153-.56a.0726.0726 0 01.011-.0883c.311-.2411.6114-.492.896-.759a.0741.0741 0 01.0728-.011c3.9452 1.7646 8.18 1.7646 12.1252 0a.0741.0741 0 01.0727.011c.2847.267.585.5179.896.759a.0726.0726 0 01.011.0883c-.3648.214-.7533.4008-1.153.56a.076.076 0 00-.0416.1064c.309.7709.7644 1.4477 1.442 2.0022a.0751.0751 0 00.0776.0206c.2236-.1075.4451-.2261.66-.3615a.0824.0824 0 00.0312-.0586c.4182-4.4779-.4334-8.9808-2.3484-13.6647a.069.069 0 00-.032-.0233zM8.02 15.3312c-.7812 0-1.416-.6562-1.416-1.4655S7.2388 12.4 8.02 12.4s1.416.6562 1.416 1.4657-.6348 1.4655-1.416 1.4655zm7.96 0c-.7812 0-1.416-.6562-1.416-1.4655s.6348-1.4655 1.416-1.4655 1.416.6562 1.416 1.4657-.6348 1.4655-1.416 1.4655z"/>
    </svg>
);


export function LiveChatSupport() {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const { discordUrl } = useContentSettings();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isDashboardPage = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

    const effectiveUser = {
        id: isAuthenticated ? user!.id : (typeof window !== 'undefined' ? localStorage.getItem('guestId') || `guest_${Date.now()}`: ''),
        name: isAuthenticated ? user!.name : 'Guest',
        avatar: isAuthenticated ? user!.avatar : undefined,
    };

    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('guestId')) {
            localStorage.setItem('guestId', effectiveUser.id);
        }
    }, [isAuthenticated, effectiveUser.id]);
    
    // Auto-scroll to the latest message
    useEffect(() => {
        setTimeout(() => {
            if (scrollViewportRef.current) {
                scrollViewportRef.current.scrollTo({
                    top: scrollViewportRef.current.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }, 100);
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300); // Delay to allow animation to finish
        }
    }, [isOpen]);

    // Subscribe to messages when sessionId is available
    useEffect(() => {
        if (!sessionId) return;
    
        const messagesCol = collection(db, 'chatSessions', sessionId, 'messages');
        const q = query(messagesCol, orderBy('timestamp', 'asc'));
    
        setIsLoading(true);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(fetchedMessages);
            setIsLoading(false);
            
            // Mark messages as read by user
            const sessionRef = doc(db, 'chatSessions', sessionId);
            getDoc(sessionRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().hasUnreadAdminMessages) {
                    updateDoc(sessionRef, { hasUnreadAdminMessages: false });
                }
            });

        }, (error) => {
            console.error("Error fetching messages:", error);
            setIsLoading(false);
        });
    
        return () => unsubscribe();
    }, [sessionId]);

    const handleOpenChat = async () => {
        setIsOpen(true);
        if (sessionId) return;

        const storedSessionId = localStorage.getItem(`chatSessionId_${effectiveUser.id}`);
        if(storedSessionId) {
            const sessionRef = doc(db, 'chatSessions', storedSessionId);
            const sessionSnap = await getDoc(sessionRef);
            if(sessionSnap.exists()) {
              setSessionId(storedSessionId);
              return;
            } else {
              localStorage.removeItem(`chatSessionId_${effectiveUser.id}`);
            }
        }

        // If no session exists, we wait for the first message to create one.
        setMessages([{
            id: 'initial',
            sender: 'admin',
            text: 'Hello! How can we help you today?',
            timestamp: new Date(),
            userName: 'Support',
        }]);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const text = inputValue;
        setInputValue('');

        const tempId = `temp_${Date.now()}`;
        const optimisticMessage: ChatMessage = {
            id: tempId,
            sender: 'user',
            text,
            timestamp: new Date(),
            userName: effectiveUser.name,
            userAvatar: effectiveUser.avatar,
        };

        setMessages(prev => prev.filter(m => m.id !== 'initial').concat(optimisticMessage));

        let currentSessionId = sessionId;

        try {
            if (!currentSessionId) {
                const sessionData: Omit<ChatSession, 'id'> = {
                    userId: effectiveUser.id,
                    userName: effectiveUser.name,
                    userAvatar: effectiveUser.avatar,
                    lastMessageText: text,
                    lastMessageAt: serverTimestamp(),
                    status: 'new',
                    hasUnreadAdminMessages: false,
                    hasUnreadUserMessages: true,
                };
                const sessionRef = await addDoc(collection(db, 'chatSessions'), sessionData);
                currentSessionId = sessionRef.id;
                setSessionId(currentSessionId);
                localStorage.setItem(`chatSessionId_${effectiveUser.id}`, currentSessionId);
            }

            const messageData: Omit<ChatMessage, 'id'> = {
                sender: 'user',
                text,
                timestamp: serverTimestamp(),
                userName: effectiveUser.name,
                userAvatar: effectiveUser.avatar,
            };

            if (!currentSessionId) {
              throw new Error("Session ID is not available");
            }

            await addDoc(collection(db, 'chatSessions', currentSessionId, 'messages'), messageData);
            
            await updateDoc(doc(db, 'chatSessions', currentSessionId), {
                lastMessageText: text,
                lastMessageAt: serverTimestamp(),
                status: 'open',
                hasUnreadUserMessages: true,
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast({
                variant: 'destructive',
                title: 'Error sending message',
                description: 'Please try again.',
            });
        }
    };

    const UserAvatar = () => (
        <Avatar className="h-8 w-8">
            {effectiveUser.avatar ? <AvatarImage src={effectiveUser.avatar} /> : <AvatarFallback><User/></AvatarFallback>}
        </Avatar>
    );
    const AdminAvatar = () => (
        <Avatar className="h-8 w-8"><AvatarFallback><Bot/></AvatarFallback></Avatar>
    )

    if (isDashboardPage) {
        return null;
    }

    return (
        <>
            <div className={cn("fixed bottom-4 right-4 z-40 transition-transform duration-300", isOpen && 'translate-y-40')}>
                <Button
                    onClick={handleOpenChat}
                    className="h-14 rounded-full shadow-lg animate-pulse-slow px-6"
                >
                    <MessageSquare className="h-6 w-6" />
                    <span className="ml-2 font-semibold">Live Chat</span>
                </Button>
            </div>

            <Card className={cn(
                "fixed bottom-4 right-4 z-50 h-[70vh] max-h-[600px] flex flex-col shadow-2xl origin-bottom-right transition-all duration-300 ease-in-out left-4 sm:left-auto sm:w-full max-w-sm",
                isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            )}>
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <Avatar className="bg-primary/10 p-1.5 text-primary">
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-lg">Support Chat</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
                        <div className="p-4 space-y-4">
                            {isLoading && messages.length === 0 && (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {messages.map((message) => (
                                <div key={message.id} className={cn(
                                    "flex items-end gap-2 max-w-[90%]",
                                    message.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                                )}>
                                    {message.sender === 'admin' && <AdminAvatar />}
                                    <div className={cn(
                                        "rounded-lg px-3 py-2 text-sm",
                                        message.sender === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-secondary rounded-bl-none'
                                    )}>
                                        <p className="whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                    {message.sender === 'user' && <UserAvatar />}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t flex flex-col gap-3">
                    {discordUrl && (
                        <Button asChild variant="outline" className="w-full">
                            <a href={discordUrl} target="_blank" rel="noopener noreferrer">
                                <DiscordIcon className="h-5 w-5 mr-2 fill-current" />
                                Open Ticket in Discord
                            </a>
                        </Button>
                    )}
                    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                        <Input 
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </>
    );
}
