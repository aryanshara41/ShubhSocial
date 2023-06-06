import React, { useContext } from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { context } from '../services/SocketContext'

const User = ({ name, friend, id, image, setFriendRequest, setFriends }) => {

    console.log(name, friend)

    const socket = useContext(context);

    const handleAccept = async () => {
        console.log("I am accepting the request");

        const result = await axios.put(`http://localhost:3000/user/makefriend`,
            {
                receiverId: id
            },
            {
                headers: {
                    token: localStorage.getItem('token')
                }
            }
        );

        // now when this operation is done then remove the id from friendRequest
        setFriendRequest((prev) => prev.filter((data) => data.userId !== id));
        setFriends((prev) => [...prev, result.data]);
    }

    return (
        <div className='border-2 shadow-sm p-1 flex gap-2 items-center rounded-md grow'>
            <Link to={'/profile/?id=' + id} className='flex items-center gap-2 cursor-pointer w-8/12 hover:bg-gray-100 hover:underline'>
                <Avatar />
                <span className='font-mono'>{name}</span>
            </Link>
            {
                !friend && (
                    <div className='flex grow justify-around'>
                        <span onClick={handleAccept} className='border rounded-xl bg-green-300 cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </span>
                        <span className='border rounded-xl bg-red-400 cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </span>
                    </div>
                )
            }
        </div>
    )
}

export default User