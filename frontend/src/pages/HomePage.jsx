import React, { createContext, useContext, useEffect, useState } from 'react'
import MakePost from '../components/MakePost';
import Post from '../components/Post';
import PopupSearch from '../components/PopupSearch';
import { Link } from 'react-router-dom';
import axios from 'axios';
import OnlineUsers from '../components/OnlineUsers';
import SocketContext, { context } from '../services/SocketContext';
import Login from './Login';


// export const SocketContext = createContext();

const HomePage = () => {

    if (localStorage.getItem('token')) {
        console.log("token exists");
    }
    else {
        console.log("Token doesn't exists");
        return <Login />
    }

    const [searchData, setsearchData] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const socket = useContext(context);
    console.log(socket);

    useEffect(() => {
        if (!socket) return;

        console.log("Socket is ready");
        console.log(socket);
        socket.on('online-users', (data) => {
            console.log("Here is the number of connetected users");
            console.log(data.connected_clients);
            setOnlineUsers(data.connected_clients);
        });

        // when leaving the homepage turn off this socket
        return (()=>{
            socket.off("message-from-server");
        })
    }, [socket]);

    // fetch all the post when this component is rendered for the first time
    useEffect(() => {

        const fetchPost = async () => {
            const result = await axios.get('http://localhost:3000/post', {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            console.log(result.data);
            setPosts(result.data);
        }

        fetchPost();
    }, []);


    const openPopup = () => {
        setIsOpen(true);
    };

    const closePopup = () => {
        setIsOpen(false);
    };


    return (
        <>
            <div className='w-full 
            h-full 
            flex
        '>
                <div className="
                w-3/12
                sticky
                top-0
            ">
                    <dir className='flex items-center gap-2 pb-4'>
                        <div className="w-10 h-10">
                            <img src="https://avatars.githubusercontent.com/u/84093675?v=4" alt="" />
                        </div>
                        <div className='font-bold'>ShubhSocial</div>
                    </dir>
                    <div className="flex flex-col sticky top-0">
                        <Link to='/profile'>
                            <div className='pl-4 pt-2 pb-2  cursor-pointer hover:bg-blue-300 flex text-center hover:font-semibold hover:text-2xl hover:border-l-4 hover:border-l-blue-500 '>
                                Profile
                            </div>
                        </Link>
                        <Link
                            to='/chat'
                            className='pl-4 pt-2 pb-2 cursor-pointer hover:bg-blue-300 flex text-center  hover:font-semibold hover:text-2xl hover:border-l-4 hover:border-l-blue-500 '>
                            Chat
                        </Link>

                    </div>
                </div>
                <div className='
                w-full
                md:w-6/12
                overflow-scroll
            '>
                    <MakePost setPosts={setPosts} />
                    {
                        posts.map((post) => {
                            return <Post setPosts={setPosts} post={post} key={post._id} />
                        })
                    }
                </div>

                <div className=''>
                    <div className='m-4 border-2  rounded-lg overflow-hidden'>
                        <input onChange={(e) => setsearchData(e.target.value)} className='grow pl-2 h-10 border-none' type="text" placeholder='Enter name to search' />
                        <button onClick={openPopup} className='bg-blue-100 h-10'>Search</button>
                    </div>
                    <PopupSearch search={searchData} isOpen={isOpen} onClose={closePopup} />

                    {/* Here I will show the online users */}
                    <OnlineUsers onlineUsers={onlineUsers} />
                </div>
            </div>
        </>
    )
};



export default HomePage