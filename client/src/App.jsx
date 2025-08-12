import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { UserContextProvider } from "./context/UserContext.jsx"; // Note the .jsx extension
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Configure Axios defaults
axios.defaults.baseURL = 'http://localhost:4000'; // Your backend server URL
axios.defaults.withCredentials = true; // Crucial: ensures cookies are sent with every request

function App() {
  return (
    // Wrap the entire app in the UserContextProvider
    <UserContextProvider>
      <Routes>
        {/* Set login page as the default route */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </UserContextProvider>
  );
}

export default App;