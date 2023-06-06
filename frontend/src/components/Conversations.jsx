import React, { useEffect, useState } from 'react'
import Avatar from './Avatar';
import axios from 'axios';
import moment from 'moment';

const Conversations = ({ user, socket }) => {
    const [message, setmessage] = useState('');
    const [chats, setChats] = useState([]);
    const [typing, setTyping] = useState(false);
    let timer;

    // get the chats of the user
    const getChats = async () => {
        const result = await axios.get(`http://localhost:3000/user/chats/${user.userId}`, {
            headers: {
                token: localStorage.getItem('token')
            }
        });

        setChats((prev) => result.data);
        console.log(result.data);
    }

    useEffect(() => {
        var timer;
        socket.on('typing', (data) => {
            console.log("typing");
            setTyping(true);
            // erase the previous timer
            clearTimeout(timer);
            timer = setTimeout(() => {
                setTyping(false);
            }, 1000);
        })

        return (() => {
            socket.off('typing');
        })
    }, [])

    useEffect(() => {
        if (!user) return;
        socket.on("message-from-server", (data) => {
            console.log(data);
            setChats((prev) => prev = [...prev, { message: data.message, send: false }]);
            console.log(chats);
        })

        getChats();

        // when leaving the chat room disable this event listener
        return () => {
            socket.off("message-from-server");
        }
    }, [user.userId]);

    const sendMessage = (e) => {
        e.preventDefault();
        // now send this message to all the users
        socket.emit('message-from-client', {
            receiver: user.userId,
            message: message
        })

        setChats((prev) => prev = [...prev, { message: message, send: true, date: moment().format() }]);
        setmessage('');
    }

    const handleTyping = (e) => {
        // send server an emit that I am typing in the text box
        socket.emit('typing', { receiver: user.userId });
        setmessage(e.target.value);
    }

    return (
        <div className='flex flex-col h-full w-full pt-2'>
            {
                user ? <>
                    <div className='flex items-center gap-2 border-b-2 pb-2 '>
                        <Avatar />
                        <div>
                            <h1 className='font-semibold'>{user.userName}</h1>
                            {
                                typing && <p>typing....</p>
                            }
                        </div>
                    </div>
                    <div className='overflow-y-scroll'>
                        {
                            chats.map((chat) => {
                                return (
                                    <div
                                        key={chat.date}
                                        className={"shadow-lg p-2 bg-blue-100 break-words m-2 min-w-4/12 max-w-4/12 w-4/12 rounded-md font-serif ml-auto" + (chat.send ? "" : 'ml-auto')}
                                    >
                                        <div className='flex flex-col'>
                                            <div>
                                                {chat.message}
                                            </div>
                                            <i className="text-[10px] ml-auto text-gray-500">
                                                {moment(chat.date).format('h:mm a, MMMM Do YYYY')}
                                            </i>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className='mt-auto mb-3 flex gap-3 w-full' >
                        <form onSubmit={sendMessage} className='flex w-full m-4'>
                            <input onChange={(e) => handleTyping(e)} value={message} className='pl-2 pr-2 h-11 border-2 border-blue-300 rounded-xl mr-3 flex-grow' placeholder='Enter the message' type="text" />
                            <button type="submit" className='bg-blue-600 rounded-md pl-2 pr-2 text-white font-semibold'>Submit</button>
                        </form>
                    </div>
                </> : <div className='flex justify-center items-center flex-col h-full w-full'>
                    <div className="w-10 h-10">
                        <img src="https://avatars.githubusercontent.com/u/84093675?v=4" alt="" />
                    </div>
                    <div className='font-bold'>ShubhSocial</div>
                </div>
            }
        </div>
    )
}

export default Conversations