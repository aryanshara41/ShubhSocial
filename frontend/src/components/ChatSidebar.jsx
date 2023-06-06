import React, { useEffect, useState } from 'react'
import Avatar from './Avatar';
import axios from 'axios';

const ChatSidebar = ({ users, setUser }) => {
    const [selectedName, setSelectedName] = useState('');
    // const [users, setUsers] = useState([]);


    const handleClick = (user) => {
        setSelectedName(user.name);
        setUser(user);
    }

    return (
        <div>
            <div className="">
                {
                    users.length ? users.map((user) => {
                        return (
                            <div
                                onClick={() => handleClick(user)}
                                key={user.userId} className=
                                {" flex items-center gap-2 p-2 text-1xl font-semibold border-b-2 hover:bg-blue-100 hover:border-l-1 hover:border-l-blue-400 hover:border-l-2 cursor-pointer" + (selectedName === `${user.name}` ? " bg-blue-200" : "")} >
                                <Avatar />{user.userName}
                            </div>
                        );
                    }) : <h1 className='text-lg font-bold text-center'>No chats available</h1>
                }
            </div>
        </div>
    )
}

export default ChatSidebar