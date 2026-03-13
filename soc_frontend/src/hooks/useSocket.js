// src/hooks/useSocket.js
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001'

// ─────────────────────────────────────────────────────────────
// useSocket — custom hook for Socket.io connection
//
// Usage:
//   const socket = useSocket()
//   useEffect(() => {
//     socket.on('new_incident', (incident) => { ... })
//     return () => socket.off('new_incident')
//   }, [socket])
//
// WHY useRef instead of useState for the socket?
// The socket object never needs to trigger a re-render by itself.
// useRef gives us a stable reference that persists across renders
// without causing extra renders when it's set.
// ─────────────────────────────────────────────────────────────
export const useSocket = () => {
  const socketRef = useRef(null)

  useEffect(() => {
    // Create connection when component mounts
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,  // send cookies with the handshake
      transports: ['websocket', 'polling'], // try WebSocket first, fall back to polling
    })

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected:', socketRef.current.id)
    })

    socketRef.current.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message)
    })

    // Cleanup: disconnect when component unmounts (logout/navigate away)
    return () => {
      socketRef.current?.disconnect()
      console.log('🔌 Socket disconnected')
    }
  }, []) // empty deps — run once on mount, cleanup on unmount

  return socketRef.current
}
