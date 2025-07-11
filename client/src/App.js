import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Arena from './pages/Arena'; // ✅ make sure this path is correct

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/:username" element={<Profile />} />
        <Route path="/arena" element={<Arena />} />
      </Routes>
    </Router>
  );
}

export default App;
