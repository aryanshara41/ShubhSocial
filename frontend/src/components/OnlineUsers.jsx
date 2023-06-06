import React from 'react'
import Avatar from './Avatar'

const OnlineUsers = ({ onlineUsers }) => {
    console.log(onlineUsers);
    return (
        <div className='p-2'>
            <h1 className='font-bold text-lg'>Online Users</h1>
            <p>Number of online users are : {onlineUsers.length}</p>
            {
                onlineUsers.map((user) => {
                    return <SingleUser key={user.id} user = {user} />
                })
            }
        </div>

    )
}

const SingleUser = ({user}) => {
    return (
        <div className='flex items-center mt-2'>
            <Avatar />
            <div className='bg-green-300 h-3 w-3 rounded-md relative bottom-3 right-3'></div>
            <p>{user.name}</p>
        </div>
    )
}

export default OnlineUsers