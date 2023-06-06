import React, { useContext, useEffect, useState } from 'react';
import SearchLoader from './SearchLoader';
import axios from 'axios';
import User from './User';
import { Link } from 'react-router-dom';
import { context } from '../services/SocketContext';

const PopupSearch = ({ search, isOpen, onClose }) => {

    const [loading, setLoading] = useState(true);
    const [loadedData, setLoadedData] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        const searchResult = async () => {
            const result = await axios.get(`http://localhost:3000/user/search/${search}`);
            const data = result.data;
            setLoading(false);
            setLoadedData(data);
        }

        searchResult();
    }, [isOpen]);


    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 border border-black-2">
                    <div className="bg-gray-100  rounded-lg shadow-3xl p-8 w-[50%]">

                        {
                            loading && <SearchLoader />
                        }

                        {
                            !loading && (
                                <div className='gap-2 flex flex-col text-black '>
                                    {
                                        loadedData.map((data) => {
                                            return <Data data={data} key={data._id} />
                                        })
                                    }
                                </div>
                            )
                        }

                        <button
                            className=" mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const Data = ({ data }) => {
    console.log(data);
    const [sendRequest, setSendRequest] = useState(true);
    const socket = useContext(context);

    const handleFriendRequest = (receiverId) => {
        socket.emit("sendFriendRequest", { receiverId: receiverId });
        setSendRequest((prev) => !prev);
    }

    return (
        <>
            <div className='flex justify-between'>
                <Link to={"/profile?id=" + data._id} className='grow'>
                    <User name={data.name} friend={true} id={data._id} image={data.profilePic} />
                </Link>
                <div className='flex items-center cursor-pointer'>
                    {sendRequest ?
                        <svg onClick={() => handleFriendRequest(data._id)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    }

                </div>
            </div>
        </>
    )
}

export default PopupSearch;
