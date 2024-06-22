import { useContext, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { SocketContext } from "../App";
import getBrowserInfo from "../utils/browser-info";
import { useNavigate } from "react-router-dom";

export interface iJoined {
  name: string
  id: string
}
function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socket = useContext(SocketContext) as any;
  const roomId = useRef(Math.random().toString(32).substring(2).toUpperCase()).current
  const roomURL = useRef(import.meta.env.VITE_SERVER_URL + '/room/' + roomId).current
  const navigation = useNavigate()
  useEffect(() => {
    socket.emit('join-room', { roomId, name: getBrowserInfo() })
    socket.on('user-joined', (data: iJoined[]) => {
      if (data?.length > 1) {
        navigation(`/room/${roomId}`)
      }
    })
    return () => {
      socket.off('user-joined')
    }
  }, [roomId, socket, navigation, roomURL])

  return <section className='w-screen text-slate-200 h-screen bg-purple-950 grid place-items-center p-6'>
    <div className='flex-wrap  text-center flex flex-col justify-center items-center'>
      <article className='bg-white p-1 rounded-md w-fit scale-75 origin-top'>
        <QRCode value={roomURL} />
      </article>
      <p className='bg-neutral-900 p-1 rounded-md px-2 font-mono'>{roomURL}</p>
    </div>
  </section>
}

export default Home;
