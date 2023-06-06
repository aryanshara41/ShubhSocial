import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client';

export const context = createContext();

const SocketContext = (props) => {
    const [socket, setSocket] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token == undefined) return;
        const s = io.connect("ws://localhost:3000", {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        setSocket(prev => s);
    }, [token])

    return (
        <context.Provider value={socket} >
            {props.children}
        </context.Provider>
    )
}

export default SocketContext