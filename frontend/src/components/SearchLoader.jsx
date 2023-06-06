import React from 'react'

const SearchLoader = () => {
    return (
        <div className='flex flex-col gap-2'>
            <div className="border border-blue-300 shadow rounded-md p-4 max-w-sm w-full mx-auto flex items-center gap-4 flex-col">
                <div className="animate-pulse flex space-x-4 items-center">
                    <div className="rounded-full bg-slate-700 h-10 w-10"></div>
                    <div className="flex-1 space-y-6 py-1 h-full">
                        <div className="h-2 bg-slate-700 rounded"></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4"></div>
                        </div>
                    </div>
                </div>
                <div className="animate-pulse flex space-x-4 items-center">
                    <div className="rounded-full bg-slate-700 h-10 w-10"></div>
                    <div className="flex-1 space-y-6 py-1 h-full">
                        <div className="h-2 bg-slate-700 rounded"></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4"></div>
                        </div>
                    </div>
                </div>
                <div className="animate-pulse flex space-x-4 items-center">
                    <div className="rounded-full bg-slate-700 h-10 w-10"></div>
                    <div className="flex-1 space-y-6 py-1 h-full">
                        <div className="h-2 bg-slate-700 rounded"></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4"></div>
                        </div>
                    </div>
                </div>
                <div className="animate-pulse flex space-x-4 items-center">
                    <div className="rounded-full bg-slate-700 h-10 w-10"></div>
                    <div className="flex-1 space-y-6 py-1 h-full">
                        <div className="h-2 bg-slate-700 rounded"></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchLoader