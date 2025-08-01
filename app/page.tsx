'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

type Message = {
  from: 'Me' | 'Peer';
  text: string;
};

export default function HomePage() {
  const [room, setRoom] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const cleanup = useCallback(() => {
    console.log('Cleaning up connections.');
    setIsConnected(false);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!currentRoom) return;

    // Initialize socket connection
    fetch('/api/socket').then(() => {
      const socket = io({ path: '/api/socket' });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        socket.emit('join-room', currentRoom);
      });

      socket.on('room-full', () => {
        toast.error('Room is full', {
          description: 'Please try a different room ID.',
        });
        setCurrentRoom('');
      });

      socket.on('user-joined', (peerId: string) => {
        toast.info('A user has joined the room.');
        console.log('A peer has joined, creating offer for', peerId);
        createPeerConnection(peerId);
        createOffer(peerId);
      });

      socket.on('signal', (data: { from: string; signal: any; type: string }) => {
        if (!peerConnectionRef.current) {
          createPeerConnection(data.from);
        }

        if (data.type === 'offer') {
          console.log('Received offer from', data.from);
          peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.signal))
            .then(() => createAnswer(data.from));
        } else if (data.type === 'answer') {
          console.log('Received answer from', data.from);
          peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.signal));
        } else if (data.type === 'ice-candidate') {
          console.log('Received ICE candidate from', data.from);
          peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(data.signal));
        }
      });

      socket.on('user-left', (peerId: string) => {
        toast.warning('The other user has left the room.');
        cleanup();
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        cleanup();
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      cleanup();
    };
  }, [currentRoom, cleanup]);

  const createPeerConnection = (peerId: string) => {
    if (peerConnectionRef.current) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('signal', {
          target: peerId,
          signal: event.candidate,
          type: 'ice-candidate',
        });
      }
    };

    pc.ondatachannel = (event) => {
      dataChannelRef.current = event.channel;
      setupDataChannel();
    };

    peerConnectionRef.current = pc;
  };

  const createOffer = (peerId: string) => {
    if (!peerConnectionRef.current) return;
    dataChannelRef.current = peerConnectionRef.current.createDataChannel('messaging');
    setupDataChannel();
    peerConnectionRef.current.createOffer()
      .then(offer => peerConnectionRef.current?.setLocalDescription(offer))
      .then(() => {
        if (socketRef.current && peerConnectionRef.current?.localDescription) {
          socketRef.current.emit('signal', {
            target: peerId,
            signal: peerConnectionRef.current.localDescription,
            type: 'offer',
          });
        }
      });
  };

  const createAnswer = (peerId: string) => {
    if (!peerConnectionRef.current) return;
    peerConnectionRef.current.createAnswer()
      .then(answer => peerConnectionRef.current?.setLocalDescription(answer))
      .then(() => {
        if (socketRef.current && peerConnectionRef.current?.localDescription) {
          socketRef.current.emit('signal', {
            target: peerId,
            signal: peerConnectionRef.current.localDescription,
            type: 'answer',
          });
        }
      });
  };

  const setupDataChannel = () => {
    if (!dataChannelRef.current) return;
    dataChannelRef.current.onopen = () => {
      console.log('✅ Data channel open');
      setIsConnected(true);
      toast.success('Connected!', { description: 'You can now send messages.' });
    };
    dataChannelRef.current.onclose = () => {
      console.log('❌ Data channel closed');
      cleanup();
    };
    dataChannelRef.current.onmessage = (event) => {
      setMessages((prev) => [...prev, { from: 'Peer', text: event.data }]);
    };
  };

  const handleJoinRoom = () => {
    if (room) {
      setCurrentRoom(room);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && dataChannelRef.current?.readyState === 'open') {
      dataChannelRef.current.send(newMessage);
      setMessages((prev) => [...prev, { from: 'Me', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">⚡️ WebRTC + WebSocket Messenger</CardTitle>
        </CardHeader>
        <CardContent>
          {!currentRoom ? (
            <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
              <Input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                placeholder="Enter Room ID"
              />
              <Button onClick={handleJoinRoom}>Join Room</Button>
            </div>
          ) : (
            <div>
              <div className="text-center mb-4">
                <p>Room: <span className="font-bold">{currentRoom}</span></p>
                <p>Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? 'Connected' : 'Disconnected'}</span></p>
              </div>
              <ScrollArea className="h-96 w-full rounded-md border p-4 mb-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.from === 'Me' ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div className={`rounded-lg px-4 py-2 ${msg.from === 'Me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </ScrollArea>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={!isConnected}
                />
                <Button onClick={handleSendMessage} disabled={!isConnected}>Send</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}