import React from "react";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginForm from "./components/forms/LoginForm";
import RegisterForm from "./components/forms/RegisterForm";
import Home from "./components/homepage/Home";
import PrivateRoute from "./components/routes/PrivateRoute";
import ImageUploader from "./components/imageuploader/ImageUploader";
import ProfilePage from "./components/profilepage/ProfilePage";
import EditProfile from "./components/editprofile/EditProfile";
import OtherProfile from "./components/othersprofile/OtherProfile";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Private Route */}
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/imageuploader" element={<PrivateRoute element={<ImageUploader />} />} />
        <Route path="/profilepage" element={<PrivateRoute element={<ProfilePage />} />} />
        <Route path="/otherprofile/:userId" element={<PrivateRoute element={<OtherProfile />} />} />

        <Route path="/edit-profile/:userId" element={<PrivateRoute element={<EditProfile />} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
