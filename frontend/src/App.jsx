import { Route, Routes, useLocation } from 'react-router-dom';
import SignUp from './components/Signup';
import Login from './components/Login';
import OTP from './components/OTP';
import NavBar from './components/NavBar';
import MyFiles from './components/Contents/MyFiles';
import Upload from './components/Contents/Upload';
import Trash from './components/Contents/Trash';
import StorageUsage from './components/Contents/StorageUsage';
import Cookies from "js-cookie";
import { Navigate } from 'react-router-dom';

function App() {
  const location = useLocation();

  // List of routes where NavBar should not be displayed
  const authRoutes = ['/auth/signup', '/auth/otp', '/auth/login'];

  const isAuthRoute = authRoutes.includes(location.pathname);

  const isAllowed = () => {
    const token = Cookies.get('token');
    if(token){
      return true;
    }
    else
    return false;
  }

  return (
    <>
      {/* Render NavBar only if the route is not an auth route */}
      {!isAuthRoute && <NavBar />}

      <Routes>
        {/* Auth-related routes */}
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/otp" element={<OTP />} />

        {/* Main content routes */}
        <Route path="/" element={
          isAllowed() ? <MyFiles /> : <Navigate to="/auth/login" />
        } />
        <Route path="/myFiles" element={
          isAllowed() ? <MyFiles /> : <Navigate to="/auth/login" />
        } />
        <Route path="/upload" element={
          isAllowed() ? <Upload /> : <Navigate to="/auth/login" />
        } />
        <Route path="/trash" element={
          isAllowed() ? <Trash /> : <Navigate to="/auth/login" />
        } />
        <Route path="/storage" element={
          isAllowed() ? <StorageUsage /> : <Navigate to="/auth/login" />
        } />
      </Routes>
    </>
  );
}

export default App;
