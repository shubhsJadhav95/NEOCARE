import { io } from 'socket.io-client';

const socket = io('https://api.neocare.devcloudzone.store', {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export default socket;