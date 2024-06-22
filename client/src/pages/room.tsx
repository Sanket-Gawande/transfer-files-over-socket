import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../App";
import { iJoined } from "./home";
import getBrowserInfo from "../utils/browser-info";


function Room() {
  const { room_id } = useParams()
  const files = useRef(new Map()).current
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socket = useContext(SocketContext) as any;

  const [users, setUsers] = useState<{ name: string, id: string }[]>([])
  useEffect(() => {
    socket.emit('join-room', { roomId: room_id, name: getBrowserInfo() })
    socket.on('user-joined', (data: iJoined[]) => {
      setUsers(data)
      console.log(data);
    })
    return () => {
      socket.off('user-joined')
    }
  }, [room_id, socket])

  useEffect(() => {

    socket.on('collect-file', (data: { name: string, chunk: BinaryData }) => {
      console.log(data);
      if (!files.has(data.name)) {
        files.set(data.name, [data.chunk])
      } else {
        files.get(data.name).push(data.chunk)
      }
    })

    socket.on('save-file', (data: { name: string }) => {
      const file = files.get(data.name)
      const blob = new Blob(file);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = data.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })

    return () => {
      socket.off('collect-file')
      socket.off('save-file')
    }
  }, [files, room_id, socket])

  async function handleFile(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault()
    const fileNode = document.querySelector('input') as HTMLInputElement

    const [file] = fileNode.files!;
    const chunkSize = 64 * 1024;
    let offset = 0;

    const readAndEmit = () => {
      const reader = new FileReader();
      const slice = file.slice(offset, offset + chunkSize);

      reader.onload = () => {
        socket.emit('file-chunk', { roomId: room_id, name: file.name, chunk: reader.result });
        offset += chunkSize;

        if (offset < file.size) {
          readAndEmit();
        } else {
          socket.emit('file-end', { roomId: room_id, name: file.name });
        }
      };

      reader.readAsArrayBuffer(slice);
    };
    readAndEmit()
  }

  return <section className='w-screen text-slate-200 h-screen bg-purple-950 p-6'>
    <section className="bg-white/20 p-4 rounded-md mb-6" >
      <p className="font-bold text-lg">Connected Users</p>
      <ul className="list-disc list-inside space-y-1">
        {users?.map(user =>
          <li key={user.id} >{user.name} {socket.id === user.id ? '- This device' : ''}</li>
        )}
      </ul>
    </section>
    <form onSubmit={handleFile} className='space-y-4'>
      <h2>Choose file</h2>
      <input type="file" />
      <button className='bg-slate-900 py-2 px-4 rounded-md'>Send File</button>
    </form>
  </section>

}

export default Room;
