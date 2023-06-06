import React, { useState } from 'react'

const Header = () => {

    const [userLogin, setuserLogin] = useState(false);

    return (
        <div className='flex justify-between
            pt-3
            pb-2
            pr-5
            pl-5
            bg-blue-50
        '>
            <div className='flex gap-2 items-center' >
                <div className="w-10 h-10">
                    <img src="https://avatars.githubusercontent.com/u/84093675?v=4" alt="" />
                </div>
                <div className="text-lg font-bold">ShubhSocial</div>
            </div>

            {userLogin &&
                <div className='' >
                    <button>Logout</button>
                </div>
            }

            {
                !userLogin &&
                <div className='mr-2
                 bg-blue-100 flex 
                 items-center 
                 rounded-lg
                 pl-3
                 pr-3
                 
                 ' >
                    <button className='
                        text-center
                        font-semibold
                    '>Login</button>
                </div>
            }

        </div>
    )
}

export default Header