import {useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from "./UserContext.js";

// The provider component is where the logic lives
export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // State to track if user data has been fetched

  // Fetch user data when the component mounts
  useEffect(() => {
    if (!user) {
      axios.get('/api/profile').then(({ data }) => {
        setUser(data);
      }).catch(error => {
        console.error("Not logged in or session expired:", error);
        setUser(null); // Ensure user is null if fetch fails
      }).finally(() => {
        setReady(true); // Mark as ready regardless of success or failure
      });
    }
  }, [user]); // Re-run if user state changes (e.g., on logout)

  // The value passed to provider includes user state, setter, and ready flag
  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}