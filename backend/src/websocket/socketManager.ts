import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Utilisateur connecté:', socket.id);

    socket.on('disconnect', () => {
      console.log('Utilisateur déconnecté:', socket.id);
    });
  });

  return io;
};
