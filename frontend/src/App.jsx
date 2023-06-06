import './App.css'
import HomePage from './pages/HomePage'
import Chat from './pages/Chat';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Profile from './pages/Profile';
import Login from './pages/Login';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />}></Route>
        <Route path="/home" element={<Chat />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path='/chat' element={<Chat />} />
        <Route path='/auth' element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
