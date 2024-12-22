import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// Create the Socket Context
const SocketContext = createContext();

// The URL where your backend is running (make sure to change it if needed)
const SOCKET_URL = import.meta.env.VITE_API_URL; // Replace with your backend URL

// Create a Socket Provider that will wrap the application
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize the socket connection on mount
    const socketInstance = io(SOCKET_URL);

    // Set the socket instance in state
    setSocket(socketInstance);

    // Clean up socket connection on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket instance in any component
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};
