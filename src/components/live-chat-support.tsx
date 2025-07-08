
'use client';

import { useState, useEffect, useRef } from 'react';
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


export function LiveChatSupport() {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        setIsLoading(true);
        
        let currentSessionId = sessionId;
        
        try {
            // Create session if it doesn't exist
            if (!currentSessionId) {
                const sessionData: Omit<ChatSession, 'id'> = {
                    userId: effectiveUser.id,
                    userName: effectiveUser.name,
                    userAvatar: effectiveUser.avatar,
                    lastMessageText: text,
                    lastMessageAt: serverTimestamp(),
                    status: 'new',
                    hasUnreadAdminMessages: false,
                    hasUnreadUserMessages: true, // Admin needs to see this
                };
                const sessionRef = await addDoc(collection(db, 'chatSessions'), sessionData);
                currentSessionId = sessionRef.id;
                setSessionId(currentSessionId);
                localStorage.setItem(`chatSessionId_${effectiveUser.id}`, currentSessionId);
            }

            // Add message to the subcollection
            const messageData: Omit<ChatMessage, 'id'> = {
                sender: 'user',
                text,
                timestamp: serverTimestamp(),
                userName: effectiveUser.name,
                userAvatar: effectiveUser.avatar,
            };
            await addDoc(collection(db, 'chatSessions', currentSessionId, 'messages'), messageData);
            
            // Update session document with last message info
            await updateDoc(doc(db, 'chatSessions', currentSessionId), {
                lastMessageText: text,
                lastMessageAt: serverTimestamp(),
                status: 'open',
                hasUnreadUserMessages: true,
            });

        } catch (error) {
            console.error('Failed to send message:', error);
            // Optionally show an error message to the user
        } finally {
            setIsLoading(false);
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

    return (
        <>
            <div className={cn("fixed bottom-4 right-4 z-50 transition-transform duration-300", isOpen && 'translate-y-40')}>
                <Button
                    onClick={handleOpenChat}
                    className="h-14 rounded-full shadow-lg animate-pulse-slow px-6"
                >
                    <MessageSquare className="h-6 w-6" />
                    <span className="ml-2 font-semibold">Live Chat</span>
                </Button>
            </div>

            <Card className={cn(
                "fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[600px] flex flex-col shadow-2xl origin-bottom-right transition-all duration-300 ease-in-out",
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
                            {isLoading && messages.length <= 1 && (
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
                <CardFooter className="p-4 border-t">
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
