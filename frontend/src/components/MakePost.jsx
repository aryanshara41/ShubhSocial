import React, { useRef, useState } from 'react'
import Avatar from './Avatar'
import axios from 'axios';

const MakePost = ({ setPosts }) => {
    const [Postimage, setImage] = useState({
        image: '',
        preview: ''
    });

    const PostText = useRef('');

    const handleFileChange = (e) => {
        const img = {
            preview: URL.createObjectURL(e.target.files[0]),
            image: e.target.files[0]
        };
        console.log(PostText.current.value);
        setImage(img);
    };

    const handlePost = async () => {
        // first check if there exits something in the post
        if (PostText.current.value === '' && Postimage.preview === '') return;

        let formData = new FormData();
        formData.append('image', Postimage.image);
        formData.append('text', PostText.current.value);

        const result = await axios.post('http://localhost:3000/post', formData, {
            headers: {
                token: localStorage.getItem('token'),
                'Content-Type': 'multipart/form-data'
            }
        });

        // insert this post into the posts

        setImage((prev) => prev = { image: '', preview: '' }); // make the image empty
        PostText.current.value = ""; // empty the text field

        setPosts((prev) => [result.data, ...prev]);
        console.log(result);
    }

    return (
        <div className=' full m-4 shadow-md rounded-xl overflow-hidden'>
            <div className="flex items-center p-2 border-b border-b-gray-300">
                <Avatar />
                <div className='flex-grow h-16 m-2 pt-3'>
                    <textarea ref={PostText} placeholder='Write something to post' name="" id="" cols="30" rows="10" className='h-full w-full grow bg-inherit text-gray-500'></textarea>
                </div>
            </div>
            {
                Postimage.preview && <img className='mt-3' src={Postimage.preview} alt="" />
            }
            <div className='flex items-center'>
                <div>
                    <label htmlFor="file" className='cursor-pointer pt-1 pb-1 pl-3 pr-3 m-2 text-centershadow-md rounded border'>Photo</label>
                    <input id="file" type="file" style={{ display: 'none' }} onChange={(e) => handleFileChange(e)} />
                    <span className=' cursor-pointer pt-1 pb-1 pl-3 pr-3 m-2 text-centershadow-md rounded border' >Feelings</span>
                </div>

                <div className='ml-auto bg-blue-100'>
                    <button onClick={handlePost} className=' font-mono font-bold text-xl  pt-1 pb-1 pl-3 pr-3 m-2 text-centershadow-md rounded border'  >Post</button>
                </div>
            </div>

        </div>
    )
}

export default MakePost