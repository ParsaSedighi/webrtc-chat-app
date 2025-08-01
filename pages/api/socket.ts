// pages/api/socket.ts
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';


type NextApiResponseWithSocket = NextApiResponse & {
    socket: {
        server: HttpServer & {
            io: Server;
        };
    };
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
    if (!res.socket.server.io) {
        console.log('🔌 Setting up Socket.IO server...');
        const io = new Server(res.socket.server, {
            path: '/api/socket',
            addTrailingSlash: false,
        });

        io.on('connection', (socket: Socket) => {
            console.log('✅ User connected:', socket.id);

            socket.on('join-room', (roomId: string) => {
                const { rooms } = io.sockets.adapter;
                const room = rooms.get(roomId);

                // A room can have at most 2 clients
                if (room && room.size === 2) {
                    socket.emit('room-full');
                    return;
                }

                socket.join(roomId);
                console.log(`User ${socket.id} joined room ${roomId}`);
                // Notify the other user in the room
                socket.to(roomId).emit('user-joined', socket.id);
            });

            socket.on('signal', (payload: { target: string; signal: any; type: string }) => {
                console.log(`Relaying signal of type ${payload.type} from ${socket.id} to ${payload.target}`);
                io.to(payload.target).emit('signal', {
                    from: socket.id,
                    signal: payload.signal,
                    type: payload.type,
                });
            });

            socket.on('disconnecting', () => {
                console.log('❌ User disconnecting:', socket.id);
                socket.rooms.forEach(room => {
                    socket.to(room).emit('user-left', socket.id);
                });
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export default ioHandler;