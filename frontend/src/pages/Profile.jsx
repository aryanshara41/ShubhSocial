import React, { useContext, useEffect, useState } from 'react'
import Post from '../components/Post'
import MakePost from '../components/MakePost'
import User from '../components/User'
import { useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { context } from '../services/SocketContext'
import Conversations from '../components/Conversations'

const Profile = () => {
    console.log("I am into the profile section");
    const [searchParams, setSearchParams] = useSearchParams();
    const [user, setUser] = useState([]);

    const [requestStatus, setRequestStatus] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showChats, setShowChats] = useState(false);
    const socket = useContext(context);

    useEffect(() => {
        var id = "";
        if (searchParams.has("id")) id = "?id=" + searchParams.get("id");
        // first get the details of the user
        const getUser = async () => {
            const result = await axios.get(`http://localhost:3000/user/${id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            const data = result.data;
            setUser(data);
            setRequestStatus(prev => data.requestStatus);
            setLoading(false);
            console.log(result.data);
        }

        getUser();
        return (() => {
            setShowChats(false);
        })
    }, [searchParams.get("id")]);

    // this function will unfriend the two friends
    const handleUnfriend = async () => {
        const result = await axios.put('http://localhost:3000/user/unfriend',
            {
                receiverId: searchParams.get("id")
            },
            {
                headers: {
                    token: localStorage.getItem("token")
                }
            }
        );

        console.log(result.data);
        // change the state of requeststatus
        setRequestStatus(prev => 3);
    }

    const handleSendRequest = async () => {
        socket.emit("sendFriendRequest", { receiverId: searchParams.get("id") });
        // change the status of requestStatus
        setRequestStatus(prev => 1);
    }


    return (
        <div className='flex w-full h-full'>
            {
                loading ? <h1>Loading....</h1> : <>
                    <div className='w-4/12 flex flex-col h-full mr-2 border shadow-lg'>
                        <div className="flex mx-auto w-3/4 h-2/5 mt-2 flex-col items-center">
                            <img className='w-full h-full rounded-2xl object-cover' src={"http://localhost:3000/post/images/" + user.profilePic} alt="" />
                            <div className='flex gap-2 mt-2 items-center'>
                                <h1 className='font-mono text-2xl'>{user.userName}</h1>
                                {
                                    !user.admin && (requestStatus === 2) && <button onClick={handleUnfriend} className='bg-blue-700 p-1 rounded-lg text-white flex gap-2 font-semibold'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                        </svg>
                                        Unfriend
                                    </button>
                                }
                                {
                                    !user.admin && (requestStatus === 3) && <button onClick={handleSendRequest} className='bg-blue-700 p-1 rounded-lg text-white flex gap-2 font-semibold'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                        </svg>
                                        Send Request
                                    </button>
                                }

                                {
                                    !user.admin && (requestStatus === 1) && <button className='bg-blue-700 p-1 rounded-lg text-white flex gap-2 font-semibold'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-full">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Request sent
                                    </button>
                                }
                            </div>
                        </div>

                        <div className='p-2 mt-10'>
                            <span className='font-bold font-sans mt-10'>Address:</span>
                            <p className='pl-2'>{user.Address}</p>
                            {
                                !user.admin && <button onClick={() => setShowChats(prev => !prev)} className='p-2 bg-blue-400 rounded-md'>
                                    {
                                        showChats ? "Close Conversation" : "Start Conversation"
                                    }
                                </button>
                            }
                        </div>
                    </div>
                    {
                        showChats ? <Conversations user={user} socket={socket} /> : <UserData user={user} />
                    }
                </>
            }
        </div>
    )
}

const UserData = ({ user }) => {

    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendRequest, setFriendRequest] = useState([]);

    useEffect(() => {
        // get all the posts of the user with given user id
        var id = "";
        if (searchParams.has("id")) id = "?id=" + searchParams.get("id");

        const fetchPost = async () => {
            const result = await axios.get(`http://localhost:3000/post${id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });

            console.log(result.data);
            setPosts((prev) => result.data);
        }

        // get the friends list 
        const getFriendsList = async () => {
            const result = await axios.get(`http://localhost:3000/user/friends${id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            console.log(result.data);
            setFriends(prev => result.data);
        }

        // get the friend request list
        const getFriendRequestList = async () => {
            const result = await axios.get(`http://localhost:3000/user/friendRequest${id}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            console.log(result.data);
            setFriendRequest(prev => result.data);
        }

        fetchPost();
        getFriendsList();
        getFriendRequestList();
    }, [searchParams.get("id")]);

    return (
        <>
            <div className=' overflow-scroll w-5/12 ml-2 mr-2 shadow-lg'>
                {
                    user.admin && <MakePost />
                }
                {
                    posts.map((post) => {
                        return <Post setPosts={setPosts} post={post} key={post._id} />
                    })
                }
            </div>
            <div className='grow ml-2 mr-2 shadow-lg border-'>
                <div className='h-1/2 flex flex-col'>
                    <span className='font-mono font-bold text-center'>Friends</span>
                    <div className="h-[90%] overflow-scroll border-2 shadow-md">
                        {
                            friends.map((friend) => {
                                return <User key={friend.userId} name={friend.userName} friend={true} id={friend.userId} image={friend.image} />
                            })
                        }
                    </div>
                </div>
                <div className='h-1/2 flex flex-col'>
                    <span className='font-mono font-bold text-center'>Friend Requests</span>
                    <div className="h-[90%] overflow-scroll border-2 shadow-md">
                        {
                            friendRequest.map((friend) => {
                                return <User key={friend.userId} name={friend.userName} friend={false} id={friend.userId} image={friend.image} setFriendRequest={setFriendRequest} setFriends={setFriends} />
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    )
}

export default Profile