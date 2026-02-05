import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './api';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const token = getAuthToken();
      
      if (!token) {
        reject(new Error('Token d\'authentification requis'));
        return;
      }

      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connexion WebSocket établie');
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur de connexion WebSocket:', error);
        this.handleReconnect();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Déconnexion WebSocket:', reason);
        if (reason === 'io server disconnect') {
          // Le serveur a fermé la connexion, reconnecter manuellement
          this.handleReconnect();
        }
      });

      this.socket.on('error', (error) => {
        console.error('❌ Erreur WebSocket:', error);
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Échec de la reconnexion:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🔌 Déconnexion WebSocket manuelle');
    }
  }

  emit(event: string, data?: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Tentative d\'émission sur une socket non connectée');
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Méthodes spécialisées pour l'application
  sendMessage(content: string) {
    this.emit('send_message', {
      content,
      timestamp: new Date().toISOString(),
    });
  }

  startTyping() {
    this.emit('typing_start');
  }

  stopTyping() {
    this.emit('typing_stop');
  }

  sendPrivateMessage(targetUserId: number, message: string) {
    this.emit('private_message', {
      targetUserId,
      message,
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Instance singleton
export const socketManager = new SocketManager();
export default socketManager;