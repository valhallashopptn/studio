
'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { ChatSession, ChatMessage } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Send, User, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function ChatSessionList({ sessions, selectedSessionId, onSelectSession }: { sessions: ChatSession[], selectedSessionId: string | null, onSelectSession: (id: string) => void }) {
    return (
        <Card className="w-1/3">
            <CardHeader>
                <CardTitle>Active Chats</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[calc(80vh-100px)]">
                    <div className="space-y-2">
                        {sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => onSelectSession(session.id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors",
                                    selectedSessionId === session.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                                )}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={session.userAvatar} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{session.userName}</p>
                                    <p className="text-sm text-muted-foreground truncate">{session.lastMessageText}</p>
                                </div>
                                <div className="text-xs text-muted-foreground text-right space-y-1">
                                    <p>{session.lastMessageAt ? formatDistanceToNow(session.lastMessageAt.toDate(), { addSuffix: true }) : ''}</p>
                                    {session.hasUnreadUserMessages && <Circle className="w-3 h-3 text-primary fill-primary ml-auto" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function ChatWindow({ session, adminUser }: { session: ChatSession | null, adminUser: any }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!session) {
            setMessages([]);
            return;
        };

        const messagesCol = collection(db, 'chatSessions', session.id, 'messages');
        const q = query(messagesCol, orderBy('timestamp', 'asc'));

        setIsLoading(true);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
            setMessages(fetchedMessages);
            setIsLoading(false);

            const sessionRef = doc(db, 'chatSessions', session.id);
            getDoc(sessionRef).then(docSnap => {
                if(docSnap.exists() && docSnap.data().hasUnreadUserMessages) {
                    updateDoc(sessionRef, { hasUnreadUserMessages: false });
                }
            })

        }, (error) => {
            console.error("Error fetching messages:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [session]);
    
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session) return;
        
        const text = newMessage;
        setNewMessage('');

        const messageData: Omit<ChatMessage, 'id'> = {
            sender: 'admin',
            text,
            timestamp: serverTimestamp(),
            userName: adminUser.name,
            userAvatar: adminUser.avatar,
        };
        await addDoc(collection(db, 'chatSessions', session.id, 'messages'), messageData);

        await updateDoc(doc(db, 'chatSessions', session.id), {
            lastMessageText: text,
            lastMessageAt: serverTimestamp(),
            hasUnreadAdminMessages: true,
        });
    };

    if (!session) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a chat to start messaging</p>
            </div>
        )
    }

    const UserAvatar = () => (
        <Avatar className="h-8 w-8">
             <AvatarImage src={session.userAvatar} />
            <AvatarFallback><User /></AvatarFallback>
        </Avatar>
    );
    const AdminAvatar = () => (
        <Avatar className="h-8 w-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>
    );


    return (
        <Card className="flex-1 flex flex-col h-[80vh]">
            <CardHeader className="border-b">
                <CardTitle>{session.userName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
                    <div className="p-4 space-y-4">
                        {isLoading ? <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin text-muted-foreground" /> :
                            messages.map(message => (
                                <div key={message.id} className={cn(
                                    "flex items-end gap-2 max-w-[90%]",
                                    message.sender === 'admin' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                                )}>
                                    {message.sender === 'user' && <UserAvatar />}
                                    <div className={cn(
                                        "rounded-lg px-3 py-2 text-sm",
                                        message.sender === 'admin'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-secondary rounded-bl-none'
                                    )}>
                                        <p className="whitespace-pre-wrap">{message.text}</p>
                                    </div>
                                    {message.sender === 'admin' && <AdminAvatar />}
                                </div>
                            ))}
                    </div>
                </ScrollArea>
            </CardContent>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Reply to ${session.userName}...`}
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}

export default function AdminLiveChatPage() {
    const { user: adminUser } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'chatSessions'), orderBy('lastMessageAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatSession));
            setSessions(fetchedSessions);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to fetch sessions:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const selectedSession = sessions.find(s => s.id === selectedSessionId) || null;
    
    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex gap-6 h-full">
            <ChatSessionList sessions={sessions} selectedSessionId={selectedSessionId} onSelectSession={setSelectedSessionId} />
            <ChatWindow session={selectedSession} adminUser={adminUser} />
        </div>
    );
}
