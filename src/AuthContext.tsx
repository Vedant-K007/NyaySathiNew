import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase'; // Import auth from your firebase.ts file
import { Loader2 } from 'lucide-react';

// Define the shape of your context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType>({ 
  currentUser: null, 
  loading: true 
});

// Create a custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is the magic! Firebase checks the user's login state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []);

  // Show a full-screen loader while Firebase is checking the user's status
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Once loading is done, provide the user status to the rest of the app
  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};