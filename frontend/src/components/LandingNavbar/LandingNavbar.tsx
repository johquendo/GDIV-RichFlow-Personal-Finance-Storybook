import React from 'react'
import { Link } from 'react-router-dom';
import '../LandingNavbar/LandingNavbar.css'

const LandingNavbar = () => {
  return (
    <nav className="w-full h-[10vh] flex justify-between bg-black parent">
        <div className="flex flex-row items-center justify-center gap-3 container1">
            <div className="w-12 h-12 bg-dark rounded-full flex items-center justify-center">
                <img src="/assets/richflow.png" alt="RichFlow Logo" />
            </div>
            <span className="text-5xl font-bold text-gold">
                RichFlow
            </span>
        </div>
        <div className="flex flex-row gap-4 w-[20%] justify-end items-center h-full">
            <Link to='/login'>
                <button className="bg-purple text-gold h-[50px] w-[150px] px-8 py-3 rounded-2xl font-bold text-xl hover:bg-opacity-90 transition btn-hover-effect">
                  Log in
                </button>
            </Link>
            <Link to='/signup'>
                <button className="bg-purple text-gold h-[50px] w-[150px] px-8 py-3 rounded-2xl font-bold text-xl hover:bg-opacity-90 transition btn-hover-effect">
                  Sign up
                </button>
            </Link>
        </div>
    </nav>
  )
}

export default LandingNavbar
