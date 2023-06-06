import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const [userName, setuserName] = useState('');
    const [userPassword, setuserPassword] = useState('');
    const [userEmail, setuserEmail] = useState('');
    const navigate = useNavigate();

    const LoginUser = async () => {
        // do the login and save the token into the localstorage
        const data = await axios.post('http://localhost:3000/auth/login', {
            userName: userName,
            password: userPassword,
            email: userEmail
        });

        console.log(data.data);
        setuserName('');
        setuserPassword('');

        localStorage.setItem('token', data.data.token);
        navigate('/home');
    }

    return (
        <div className='items-center flex justify-center bg-gray-200 h-full w-full'>

            <div className='shadow-lg h-1/2 bg-gray-100'>
                <dir className='flex items-center gap-2 pb-4'>
                    <div className="w-10 h-10">
                        <img src="https://avatars.githubusercontent.com/u/84093675?v=4" alt="" />
                    </div>
                    <div className='font-bold'>ShubhSocial</div>
                </dir>

                <div className="
                    border-1 
                    border-gray-600
                    
                ">
                    <div className="m-3">
                        <input onChange={(e) => setuserName(e.target.value)} className='p-2 rounded-md' placeholder='Enter your name' type="text" />
                    </div>
                    <div className="m-3">
                        <input onChange={(e) => setuserEmail(e.target.value)} className='p-2 rounded-md' placeholder='Enter your email' type="email" />
                    </div>
                    <div className="m-3">
                        <input onChange={(e) => setuserPassword(e.target.value)} className='p-2 rounded-md' placeholder='Enter your password' type="password" />
                    </div>

                </div>

                <div className="bg-red-100 flex justify-center m-3 rounded-lg">
                    <button onClick={LoginUser} className='p-2 bg-blue-200 w-full rounded-lg' >Login</button>
                </div>

            </div>

        </div>
    )
}

export default Login