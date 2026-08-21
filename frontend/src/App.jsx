import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Players from "./components/Players";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Matches from "./components/Matches";
import MyMatches from "./pages/MyMatches";
import AdminDashboard from "./components/AdminDashboard";
import Posts from "./components/Posts";
import AdminPosts from "./components/AdminPosts";
import PostDetails from "./components/PostDetails";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import Announcements from "./pages/Announcements";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import AdminTeam from "./pages/AdminTeam";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/players" element={<Players />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/my-matches" element={<MyMatches />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/posts" element={<Posts />} />
        <Route path="/admin/posts" element={<AdminPosts />} />
        <Route path="/posts/:id" element={<PostDetails />} />

        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/team" element={<AdminTeam />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
