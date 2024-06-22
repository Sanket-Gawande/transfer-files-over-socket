import { Route, Routes, BrowserRouter } from 'react-router-dom'
import Home from './pages/home';
import Room from './pages/room';
import { ReactNode, createContext, useState } from 'react';
import { io, } from 'socket.io-client';

function App() {
  return <SocketContextProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/room/:room_id' Component={Room} />
      </Routes>
    </BrowserRouter>
  </SocketContextProvider>

}



export const SocketContext = createContext({} as object);

function SocketContextProvider({ children }: { children: ReactNode }) {
  const [socket] = useState(io(import.meta.env.VITE_SERVER_URL));
  return <SocketContext.Provider value={socket}>
    {children}
  </SocketContext.Provider>
}
export default App
