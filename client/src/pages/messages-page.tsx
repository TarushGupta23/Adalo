import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import { User, Message, Connection } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { SearchIcon, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MessagesPage() {
  const [, params] = useRoute("/messages/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get selected contact ID
  const selectedContactId = params?.id ? parseInt(params.id) : null;
  
  // Fetch user connections
  const { data: connections, isLoading: isConnectionsLoading } = useQuery<Connection[]>({
    queryKey: ["/api/connections?status=accepted"],
    enabled: !!user,
    queryFn: async () => {
      const response = await fetch("/api/connections?status=accepted");
      if (!response.ok) throw new Error("Failed to fetch connections");
      return await response.json();
    }
  });
  
  // Fetch all users for connection details
  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!connections,
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return await response.json();
    }
  });
  
  // Fetch conversation messages
  const { data: messages, isLoading: isMessagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedContactId],
    enabled: !!selectedContactId,
    queryFn: async () => {
      const response = await fetch(`/api/messages/${selectedContactId}`);
      // Handle empty conversations
      if (response.status === 404) return [];
      if (!response.ok) throw new Error("Failed to fetch messages");
      return await response.json();
    }
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", {
        recipientId: selectedContactId,
        content
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // WebSocket connection
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Setup WebSocket connection
  useEffect(() => {
    if (!user) return;
    
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);
    
    // Connection opened
    newSocket.addEventListener('open', () => {
      console.log('WebSocket connected');
      // Authenticate the WebSocket connection
      newSocket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    });
    
    // Listen for messages
    newSocket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      
      // Handle incoming messages
      if (data.type === 'message') {
        // Only update messages if they're from the currently selected contact
        if (
          selectedContactId && 
          (data.message.senderId === selectedContactId || data.message.recipientId === selectedContactId)
        ) {
          queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
        }
      }
    });
    
    // Handle WebSocket errors
    newSocket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection issue",
        description: "There was a problem with the chat connection. Messages might be delayed.",
        variant: "destructive",
      });
    });
    
    // Set socket in state
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      newSocket.close();
    };
  }, [user, toast]);
  
  // Send message through WebSocket
  const sendMessageViaWebSocket = (content: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !selectedContactId) {
      return false;
    }
    
    socket.send(JSON.stringify({
      type: 'message',
      recipientId: selectedContactId,
      content: content
    }));
    
    return true;
  };
  
  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!messages || !selectedContactId || !user) return;
      
      // Find unread messages from the selected contact
      const unreadMessages = messages.filter(
        msg => msg.senderId === selectedContactId && !msg.isRead
      );
      
      // Mark each message as read
      for (const msg of unreadMessages) {
        try {
          await apiRequest("PATCH", `/api/messages/${msg.id}/read`, {});
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }
      
      // Refresh messages if needed
      if (unreadMessages.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedContactId] });
      }
    };
    
    markMessagesAsRead();
  }, [messages, selectedContactId, user]);
  
  // Get contacts from connections
  const contacts = connections && users ? connections.map(connection => {
    // Find the other user in the connection
    const contactId = connection.requesterId === user?.id 
      ? connection.recipientId 
      : connection.requesterId;
    
    return users.find(u => u.id === contactId);
  }).filter(Boolean) as User[] : [];
  
  // Filter contacts by search query
  const filteredContacts = contacts?.filter(contact => 
    contact.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Get selected contact
  const selectedContact = users?.find(u => u.id === selectedContactId);
  
  // Sort messages by date
  const sortedMessages = messages?.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedContactId) return;
    
    // Try to send via WebSocket first, fall back to REST API
    const sentViaWebSocket = sendMessageViaWebSocket(message);
    
    // If WebSocket sending failed, use the REST API
    if (!sentViaWebSocket) {
      sendMessageMutation.mutate(message);
    } else {
      // Clear the message input if sent via WebSocket
      setMessage("");
    }
  };
  
  // Format message time
  const formatMessageTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };
  
  // Format date for conversation grouping
  const formatMessageDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  return (
    <>
      <Helmet>
        <title>Messages - JewelConnect</title>
        <meta name="description" content="Chat with your connections in the jewelry industry. Send messages, share information, and collaborate with professionals." />
      </Helmet>
      
      <Navbar />
      
      <main className="pt-16 pb-12 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center text-sm text-neutral-600 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </Link>
          </div>
          
          <div className="h-[calc(100vh-11rem)]">
            <div className="bg-white rounded-lg shadow-md h-full flex flex-col md:flex-row overflow-hidden">
              {/* Contacts Sidebar */}
            <div className="w-full md:w-80 border-r border-neutral-200 flex flex-col">
              <div className="p-4 border-b border-neutral-200">
                <h1 className="font-serif text-xl font-bold text-neutral-800 mb-4">Messages</h1>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {isConnectionsLoading || isUsersLoading ? (
                  // Loading placeholders
                  <div className="py-2">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="p-3 hover:bg-neutral-100 flex items-center">
                        <Skeleton className="h-12 w-12 rounded-full mr-3" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredContacts.length > 0 ? (
                  <div className="py-2">
                    {filteredContacts.map((contact) => (
                      <a 
                        key={contact.id}
                        href={`/messages/${contact.id}`}
                        className={`p-3 hover:bg-neutral-100 flex items-center cursor-pointer ${selectedContactId === contact.id ? 'bg-neutral-100' : ''}`}
                      >
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarImage src={contact.profileImage} alt={contact.fullName} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {contact.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-neutral-800">{contact.fullName}</h3>
                          <p className="text-sm text-neutral-500 truncate capitalize">
                            {contact.userType.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-neutral-500">No contacts found</p>
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Conversation Area */}
            {selectedContactId ? (
              <div className="flex-1 flex flex-col h-full">
                {selectedContact && (
                  <div className="p-4 border-b border-neutral-200 flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={selectedContact.profileImage} alt={selectedContact.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {selectedContact.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-neutral-800">{selectedContact.fullName}</h3>
                      <p className="text-xs text-neutral-500 capitalize">
                        {selectedContact.userType.replace(/([A-Z])/g, ' $1').trim()}
                        {selectedContact.company && ` • ${selectedContact.company}`}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  {isMessagesLoading ? (
                    // Message loading placeholder
                    <div className="space-y-4">
                      {Array(4).fill(0).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[80%] ${i % 2 === 0 ? 'bg-neutral-100' : 'bg-primary/10'} rounded-lg p-3`}>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : sortedMessages && sortedMessages.length > 0 ? (
                    <div className="space-y-4">
                      {/* Group messages by date */}
                      {(() => {
                        let currentDate = "";
                        return sortedMessages.map((msg, index) => {
                          const messageDate = formatMessageDate(msg.createdAt);
                          const showDateSeparator = messageDate !== currentDate;
                          if (showDateSeparator) {
                            currentDate = messageDate;
                          }
                          
                          const isCurrentUser = msg.senderId === user?.id;
                          
                          return (
                            <div key={msg.id}>
                              {showDateSeparator && (
                                <div className="flex items-center my-4">
                                  <Separator className="flex-grow" />
                                  <span className="px-2 text-xs text-neutral-500">{messageDate}</span>
                                  <Separator className="flex-grow" />
                                </div>
                              )}
                              
                              <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    isCurrentUser 
                                      ? 'bg-primary text-white rounded-tr-none' 
                                      : 'bg-neutral-100 text-neutral-800 rounded-tl-none'
                                  }`}
                                >
                                  <p className="break-words">{msg.content}</p>
                                  <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white/70' : 'text-neutral-500'}`}>
                                    {formatMessageTime(msg.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                      <MessageSquare className="h-12 w-12 text-neutral-300 mb-4" />
                      <h3 className="text-lg font-medium text-neutral-800 mb-2">No messages yet</h3>
                      <p className="text-neutral-500 mb-6 max-w-md">
                        Send a message to start a conversation with {selectedContact?.fullName}
                      </p>
                    </div>
                  )}
                </ScrollArea>
                
                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-200 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            ) : (
              // Empty state when no conversation is selected
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="h-16 w-16 text-neutral-300 mb-4" />
                <h2 className="text-xl font-medium text-neutral-800 mb-2">Select a contact</h2>
                <p className="text-neutral-500 max-w-md">
                  Choose a contact from the list to start messaging with them
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
