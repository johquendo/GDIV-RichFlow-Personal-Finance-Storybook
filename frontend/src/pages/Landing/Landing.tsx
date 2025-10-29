import React from 'react';
import './Landing.css';
import LandingNavbar from '../../components/LandingNavbar/LandingNavbar'
import Dashboard from '../Dashboard/Dashboard';
import { Link } from 'react-router-dom'



const Landing: React.FC = () => {
  return (
    <div className="text-white flex flex-col items-center justify-center w-screen h-screen" style={{ background: 'linear-gradient(to bottom right, #7345AF, #7345AF, #1E1E1E, #000000)'}}>
      {/* Header */}
      <LandingNavbar/>
      {/* Hero Section */}
      <main className="flex h-[90vh] flex-col gap-4 items-center justify-center px-8 py-20">
        <div className="max-w-5xl mx-auto flex items-center justify-center flex-col gap-4 text-center">
          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold text-gold mb-8 leading-tight">
            See Where Your <span className="text-white">Money Flows</span> — and Make It Work for You.
          </h1>
          
          {/* Subheadline */}
          <p className="text-2xl text-gold italic font-light mb-12 max-w-3xl mx-auto">
            Understand where your money goes and learn how to make it work toward your financial goals.
          </p>
          
          {/* CTA Button */}
            <Link to="/dashboard">
              <button 
              className="text-gold px-12 h-[50px] w-[150px] py-5 rounded-2xl ctext-3xl font-bold hover:bg-opacity-80 transition shadow-lg cta-button"
              style={{ background: 'linear-gradient(to bottom right, #7345AF, #7345AF, #1E1E1E, #000000)' }}
              >
              Get Started
              </button>
            </Link>
        </div>
      </main>
    </div>
  );
};

export default Landing;
