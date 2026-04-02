import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateSession from './pages/CreateSession';
import Room from './pages/Room';
import Join from './pages/Join';
import Monitor from './pages/Monitor';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateSession />} />
          <Route path="/room/:code" element={<Room />} />
          <Route path="/join/:code" element={<Join />} />
          <Route path="/monitor/:code" element={<Monitor />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
