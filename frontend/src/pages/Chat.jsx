import React, { useContext, useEffect, useState } from 'react'
import ChatSidebar from '../components/ChatSidebar';
import Conversations from '../components/Conversations';
import Login from './Login';
import { context } from '../services/SocketContext';
import axios from 'axios';

const Chat = () => {
    const socket = useContext(context);

    if (localStorage.getItem('token')) {
        console.log("token exists");
    }
    else {
        console.log("Token doesn't exists");
        return <Login />
    }

    const [users, setUsers] = useState([]);
    const [selectedUser, setselectedUser] = useState('');

    useEffect(() => {
        // get the list of all the users with whom the user has done chat
        const getUsers = async () => {
            const result = await axios.get('http://localhost:3000/user/chatpeople', {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            console.log(result.data);
            setUsers(result.data);
        };

        getUsers();
    }, []);

    useEffect(() => {
        if (!socket) return;

        return (() => {
            socket.off("online-users");
        })
    }, [socket]);

    return (
        <div className='flex gap-2 h-full w-full'>
            <div className='w-1/3 h-full border-r-2'>
                {/* Now passall the users to chatsidebar */}
                <ChatSidebar users={users} setUser={setselectedUser} />
            </div>
            <div className="flex-grow">
                {/* Pass the selected user to the conversation */}
                <Conversations key={selectedUser.name} user={selectedUser} socket={socket} />
            </div>
        </div>
    )
}

export default Chat