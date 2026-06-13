import { io } from 'socket.io-client';

const socket = io('https://api.neocare.devcloudzone.store', {
  transports: ['websocket'],
  withCredentials: true,
});

export default socket;