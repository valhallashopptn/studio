'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supportChat } from '@/ai/flows/support-chat-flow';
import type { Message } from 'genkit';

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export function LiveChatSupport() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initial greeting from the bot
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsLoading(true);
            setTimeout(() => {
                setMessages([{
                    role: 'model',
                    content: 'Hello! Welcome to TopUp Hub Support. How can I help you today?',
                }]);
                setIsLoading(false);
            }, 1000);
        }
    }, [isOpen, messages.length]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: inputValue };
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Transform local messages to Genkit's Message format
            const genkitHistory: Message[] = messages.map(m => ({
                role: m.role,
                content: [{ text: m.content }],
            }));
            
            const result = await supportChat({
                history: genkitHistory,
                newMessage: userMessage.content,
            });

            const modelMessage: ChatMessage = { role: 'model', content: result.response };
            setMessages((prev) => [...prev, modelMessage]);
        } catch (error) {
            console.error('Chat support failed:', error);
            const errorMessage: ChatMessage = {
                role: 'model',
                content: 'Sorry, I am having trouble connecting. Please try again later.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={cn("fixed bottom-4 right-4 z-50 transition-transform duration-300", isOpen && 'translate-y-40')}>
                <Button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full shadow-lg animate-pulse-slow"
                >
                    <MessageSquare className="h-8 w-8" />
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
                            {messages.map((message, index) => (
                                <div key={index} className={cn(
                                    "flex items-end gap-2 max-w-[90%]",
                                    message.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                                )}>
                                    {message.role === 'model' && <Avatar className="h-8 w-8"><AvatarFallback><Bot/></AvatarFallback></Avatar>}
                                    <div className={cn(
                                        "rounded-lg px-3 py-2 text-sm",
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-secondary rounded-bl-none'
                                    )}>
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && messages.length > 0 && (
                                <div className="flex items-end gap-2 justify-start">
                                    <Avatar className="h-8 w-8"><AvatarFallback><Bot/></AvatarFallback></Avatar>
                                    <div className="bg-secondary rounded-lg px-3 py-2 flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
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
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </>
    );
}
