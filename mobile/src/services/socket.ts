import { io } from 'socket.io-client';

// Expo exposes EXPO_PUBLIC_* variables to the client bundle.
// This must be your Mac's LAN IP when testing on a physical iPhone.
const SOCKET_URL =
    process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://127.0.0.1:3000';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    timeout: 10000,
});