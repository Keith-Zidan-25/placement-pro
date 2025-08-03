import React from 'react';

export default function LoadingScreen () {
    return (
        <div className="relative w-[75px] h-[100px]">
            <div className="absolute bottom-0 w-[10px] h-[50%] bg-white origin-bottom shadow-md left-0 animate-bar-1"></div>
            <div className="absolute bottom-0 w-[10px] h-[50%] bg-white origin-bottom shadow-md left-[15px] animate-bar-2"></div>
            <div className="absolute bottom-0 w-[10px] h-[50%] bg-white origin-bottom shadow-md left-[30px] animate-bar-3"></div>
            <div className="absolute bottom-0 w-[10px] h-[50%] bg-white origin-bottom shadow-md left-[45px] animate-bar-4"></div>
            <div className="absolute bottom-0 w-[10px] h-[50%] bg-white origin-bottom shadow-md left-[60px] animate-bar-5"></div>
            
            <div className="absolute bottom-[10px] left-0 w-[10px] h-[10px] bg-white rounded-full animate-ball"></div>
        </div>
    );
};