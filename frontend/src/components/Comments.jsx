import axios from 'axios';
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const Comments = ({ commentData, fetchComments, postId, setCommentData, setComments }) => {
    return (
        <div>
            {
                commentData.map((comment) => {
                    return <SingleComment key={comment._id} setComments={setComments} comment={comment} postId={postId} setCommentData={setCommentData} />
                })
            }
            <div onClick={() => fetchComments()} className='p-2 text-blue-900 hover:underline'>
                Load more comments..
            </div>
        </div>
    )
}

const SingleComment = ({ comment, postId, setCommentData, setComments }) => {
    console.log("This component has been rendered");
    const [deleteComment, setDeleteComment] = useState(false);

    const handleDeleteComment = async () => {
        const result = await axios.delete('http://localhost:3000/post/comment', {
            headers: {
                token: localStorage.getItem('token'),
                postId: postId,
                commentId: comment._id
            }
        });

        setCommentData((prev) => prev.filter((data) => data._id !== comment._id));
        setComments((prev) => prev - 1);
        console.log(result.data);
    }

    return (
        <div key={comment._id} className='mt-2 mb-1 border rounded w-max p-2 bg-gray-100 shadow-sm'>
            <div >
                <div onMouseOver={() => setDeleteComment(true)} onMouseOut={() => setDeleteComment(false)} className='flex gap-1'>
                    <Link to={'/profile?id=' + comment.authorId} className='flex gap-2 items-center'>
                        <img className='h-6 w-6 rounded-[50%] ' src={comment.authorImage} alt="" />
                        <div className='flex flex-col'>
                            <p className='text-sm'>{comment.authorName}</p>
                            <p className='text-[10px] '>{moment(comment.createdAt).format("h:mm a, Do MMMM YYYY")}</p>
                        </div>
                    </Link>
                    {
                        deleteComment && comment.canDelete && <i onClick={handleDeleteComment} className='flex-grow flex justify-end cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </i>
                    }
                </div>

            </div>
            <p className='ml-5 text-sm font-sans'>{comment.text}</p>
        </div>
    )
}

export default Comments