import React from 'react'
import Landing from './pages/Landing/Landing'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Login/login'
import Signup from './pages/Signup/Signup'
import { Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center m-0 p-0">
        <Routes>
            <Route path='/' element={<Landing/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/signup' element={<Signup/>}/>
            <Route path='/dashboard' element={<Dashboard/>}/>
        </Routes>
    </div>
  )
}

export default App
