'use client';

import { useState } from 'react';
import { Plus, Search, Send } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Datos de ejemplo para chats
const chatData = [
  {
    id: '1',
    user: {
      name: 'Carlos Mendoza',
      avatar: '/placeholder.svg',
      area: 'Activaciones',
    },
    lastMessage: 'Necesito información sobre esa solicitud que mencionaste',
    timestamp: '10:30 AM',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    user: {
      name: 'Ana Castillo',
      avatar: '/placeholder.svg',
      area: 'Comisiones',
    },
    lastMessage: '¿Podemos revisar el reporte de comisiones de este mes?',
    timestamp: 'Ayer',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    user: {
      name: 'María Rodríguez',
      avatar: '/placeholder.svg',
      area: 'Administración',
    },
    lastMessage: 'El sistema ha sido actualizado con las nuevas políticas',
    timestamp: 'Lunes',
    unread: 0,
    online: true,
  },
  {
    id: '4',
    user: {
      name: 'Roberto Jiménez',
      avatar: '/placeholder.svg',
      area: 'Soporte',
    },
    lastMessage: 'Ya revisé la solicitud REQ-2023-005, necesita más información',
    timestamp: '2 ago',
    unread: 1,
    online: true,
  },
];

// Datos de ejemplo para mensajes de un chat
const messageHistory = [
  {
    id: '1',
    sender: 'other',
    user: 'Carlos Mendoza',
    avatar: '/placeholder.svg',
    message: 'Hola, necesito información sobre la solicitud REQ-2023-010',
    timestamp: '10:15 AM',
  },
  {
    id: '2',
    sender: 'me',
    user: 'Tú',
    avatar: '/placeholder.svg',
    message: 'Claro, ¿qué necesitas saber específicamente?',
    timestamp: '10:18 AM',
  },
  {
    id: '3',
    sender: 'other',
    user: 'Carlos Mendoza',
    avatar: '/placeholder.svg',
    message: 'Quiero saber el estado actual y si ya fue asignada a alguien del equipo',
    timestamp: '10:20 AM',
  },
  {
    id: '4',
    sender: 'me',
    user: 'Tú',
    avatar: '/placeholder.svg',
    message: 'Déjame revisar...',
    timestamp: '10:22 AM',
  },
  {
    id: '5',
    sender: 'me',
    user: 'Tú',
    avatar: '/placeholder.svg',
    message: "La solicitud está en estado 'En revisión' y fue asignada a Roberto Jiménez del equipo de Soporte",
    timestamp: '10:25 AM',
  },
  {
    id: '6',
    sender: 'other',
    user: 'Carlos Mendoza',
    avatar: '/placeholder.svg',
    message: 'Perfecto, gracias por la información',
    timestamp: '10:27 AM',
  },
  {
    id: '7',
    sender: 'other',
    user: 'Carlos Mendoza',
    avatar: '/placeholder.svg',
    message: 'Necesito información sobre esa solicitud que mencionaste',
    timestamp: '10:30 AM',
  },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chatData.filter((chat) => chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    // Aquí iría la lógica para enviar el mensaje
    console.log('Enviando mensaje:', newMessage);

    // Limpiar el campo de mensaje
    setNewMessage('');
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
          <p className="text-muted-foreground">Comunicación entre usuarios del sistema</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva conversación
        </Button>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversaciones</CardTitle>
              <CardDescription>Chats con otros usuarios del sistema</CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar conversaciones..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="px-4">
                <TabsList className="mb-2 w-full justify-start">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="unread">No leídos</TabsTrigger>
                  <TabsTrigger value="groups">Grupos</TabsTrigger>
                </TabsList>
              </Tabs>
              <ScrollArea className="h-[500px]">
                <div className="px-4 py-2 space-y-2">
                  {filteredChats.length === 0 ? (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">No se encontraron conversaciones</p>
                    </div>
                  ) : (
                    filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedChat === chat.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                        onClick={() => setSelectedChat(chat.id)}>
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={chat.user.avatar || '/placeholder.svg'} alt={chat.user.name} />
                            <AvatarFallback>
                              {chat.user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          {chat.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{chat.user.name}</p>
                            <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                            {chat.unread > 0 && <Badge className="ml-2">{chat.unread}</Badge>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            {selectedChat ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={chatData.find((c) => c.id === selectedChat)?.user.avatar || '/placeholder.svg'} alt={chatData.find((c) => c.id === selectedChat)?.user.name || 'Usuario'} />
                      <AvatarFallback>
                        {(chatData.find((c) => c.id === selectedChat)?.user.name || 'U')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{chatData.find((c) => c.id === selectedChat)?.user.name}</CardTitle>
                      <CardDescription>
                        {chatData.find((c) => c.id === selectedChat)?.user.area} • {chatData.find((c) => c.id === selectedChat)?.online ? 'En línea' : 'Desconectado'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] p-4">
                    <div className="space-y-4">
                      {messageHistory.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : ''}`}>
                          <div className={`flex gap-3 max-w-[80%] ${message.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.avatar || '/placeholder.svg'} alt={message.user} />
                              <AvatarFallback>
                                {message.user
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className={`px-3 py-2 rounded-lg ${message.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p>{message.message}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{message.timestamp}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="border-t p-3">
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
                  <p className="text-muted-foreground">Elige una conversación de la lista para comenzar a chatear</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
