import React, { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import axios from 'axios'
import moment from 'moment';
import Comments from './Comments';
import { Link } from 'react-router-dom';

const Post = ({ post, setPosts }) => {
    // console.log("post component is rerendered");
    const [isLike, setIsLike] = useState(false);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState(0);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentData, setCommentData] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState(false);
    const [commentIndex, setCommentIndex] = useState(0);
    const [showDelete, setShowDelete] = useState(false);
    const commentRef = useRef('');

    useEffect(() => {
        // console.log("Comment data has been updated ");
        // set loading to false means data has been loaded
        setCommentsLoading((prev) => false);
    }, [commentData])

    // it will fetch the comments from the database and increase the index count by 1 
    const fetchComments = async () => {
        // set loading to true
        setCommentsLoading((prev) => true);

        const result = await axios.get(`http://localhost:3000/post/comment/${post._id}/?page=${commentIndex}`, {
            headers: {
                token: localStorage.getItem('token')
            }
        });

        const data = result.data;

        const newData = [...commentData, ...data];
        setCommentData(prev => newData); // set the data

        //increase the index count 
        setCommentIndex((prev) => prev + 1);
    }

    // it will handle the show comments section
    const handleShowComments = async () => {
        // if this is the first call of showComments
        // means if the size of commentsData is still zero means we can call  fetchComments
        // fetchComments can be called only if we are going to show the comment section
        // means the current state of the comment section is close
        if (commentData.length === 0 && !showComments) {
            // means we can call the fetchComments
            // console.log("Fetch comments has been called");
            fetchComments();
        }

        // and reverse the state of the data
        setShowComments((prev) => !prev);
    }

    // here check if the user has liked the post or not
    const checkLike = async () => {
        const result = await axios.get(`http://localhost:3000/post/like/${post._id}`, {
            headers: {
                token: localStorage.getItem('token')
            }
        });
        // console.log(result);
        setIsLike(result.data.liked);
    };

    useEffect(() => {
        checkLike();
        setLikes(post.numberOfLikes);
        setComments(post.numberOfComments);
    }, [post._id]);

    // it will handle the like and dislike
    const handleLike = async () => {
        const url = "http://localhost:3000/post/" + (isLike ? "dislike" : "like");
        const result = await axios.put(url,
            {
                postId: post._id
            },
            {
                headers: {
                    token: localStorage.getItem('token')
                }
            })

        // console.log(result);
        if (isLike) setLikes((prev) => prev - 1);
        else setLikes((prev) => prev + 1);

        setIsLike((prev) => !prev);
    }

    // it will handle the comment 
    const handleComment = async () => {
        const result = await axios.post(`http://localhost:3000/post/comment/${post._id}`,
            {
                comment: commentRef.current.value,
            },
            {
                headers: {
                    token: localStorage.getItem('token')
                }
            }
        );

        // console.log(result);
        commentRef.current.value = '';

        // now store the result into commentData
        setCommentData((prev) => [result.data, ...prev]);

        //increase the number of comments on the post
        setComments((prev) => prev + 1);
    }

    const deletePost = async () => {
        const result = await axios.delete('http://localhost:3000/post', {
            headers: {
                token: localStorage.getItem('token'),
                postId: post._id
            },
        })

        setPosts((prev) => prev.filter((data) => data._id !== post._id));

        console.log(result.data);
    }

    return (
        <div className='full m-4 shadow-lg rounded-md overflow-hidden' >
            <div className='p-2 flex justify-between' >
                <div className='flex gap-2 cursor-pointer'>
                    <Avatar />
                    <div className='flex flex-col'>
                        <Link to={'/profile?id=' + post.authorId} className='hover:underline'>
                            <h4>{post.authorName}</h4>
                        </Link>
                        <i className='text-[12px] font-medium'>{
                            moment(post.createdAt).format("h:mm a, Do MMMM YYYY")
                        }</i>
                    </div>
                </div>
                <div className='relative'>
                    <svg onClick={() => setShowDelete(prev => !prev)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                    {
                        post.canDelete && showDelete && <button onClick={deletePost} className='flex gap-1 p-1 mt-1 absolute right-1 bg-gray-400 rounded-md text-gray-700'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                            Delete</button>
                    }
                </div>
            </div>

            <div className='ml-1 mt-1 mb-2 mr-1 p-1 text-md'>
                <p>
                    {post.textMessage}
                </p>
            </div>

            {/* //image */}

            <div className=''>
                <img className='max-h-[30rem] min-h  w-full object-scale-down' src={"http://localhost:3000/post/images/" + post.image} alt="" />
            </div>

            {/* // bottom */}
            <div className='flex justify-between pl-2 pr-2 pt-1'>
                <div className='p-1 flex flex-col items-center'>
                    <span className='hover:underline cursor-pointer'>{likes} likes</span>
                    <svg onClick={handleLike} xmlns="http://www.w3.org/2000/svg" fill={isLike ? "red" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </div>

                <div className='p-1 flex flex-col items-center'>
                    <span onClick={handleShowComments} className='hover:underline cursor-pointer'>{comments}Comments</span>
                    <svg onClick={() => setCommentInput((prev) => !prev)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                </div>
            </div>

            {
                commentInput && <div className='p-2 transition'>
                    <div className='w-full flex border-2 rounded-xl overflow-hidden'>
                        <input ref={commentRef} type="text" className='w-10/12 h-full p-2' />
                        <button onClick={handleComment} className='grow bg-red-100 text-xl font-bold'>Send</button>
                    </div>
                </div>
            }

            {
                showComments && <div className='border-t-2 pl-5 pr-5 h-64 overflow-scroll'>

                    {
                        <div>{commentData.length}</div>
                    }

                    {
                        commentsLoading ?
                            <h1>
                                <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                </svg>
                            </h1> : <Comments setComments={setComments} setCommentData={setCommentData} postId={post._id} commentData={commentData} fetchComments={fetchComments} />
                    }

                </div>
            }

        </div>
    )
}

export default Post