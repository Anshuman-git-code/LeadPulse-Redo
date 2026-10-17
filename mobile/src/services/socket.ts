import { io } from 'socket.io-client';

export const API_BASE_URL =
    process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://127.0.0.1:3000';

export const socket = io(API_BASE_URL, {
    autoConnect: false,
    reconnection: true,
    timeout: 10000,
});