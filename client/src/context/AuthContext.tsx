import { createContext, useState, useEffect, ReactNode } from "react";
import { User, LoginCredentials, SignupData, OtpVerification } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  verifyOtp: (verification: OtpVerification) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Default auth context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => false,
  signup: async () => false,
  verifyOtp: async () => false,
  logout: () => {},
  updateUser: () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      // For demo, we'll use mock login
      // In a real app, this would be an API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });
      // const data = await response.json();
      
      // For demo purposes, mock successful login with fake user data
      const mockUser: User = {
        id: 1,
        username: "player1",
        phoneNumber: credentials.phoneNumber,
        countryCode: credentials.countryCode,
        email: "player1@example.com",
        password: "******", // Never store actual passwords in state
        gameId: "PUBG12345",
        gameMode: "PUBG",
        profilePicture: null,
        country: "India",
        role: "user",
        walletBalance: 500,
        kycStatus: "not_submitted",
        createdAt: new Date(),
        currency: "INR"
      };
      
      // Store user in localStorage and state
      localStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      setLoading(true);
      // For demo, we'll use mock signup
      // In a real app, this would be an API call
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // const responseData = await response.json();
      
      // Mock signup success - but don't set the user yet
      // We'll need OTP verification first
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      setLoading(false);
      return false;
    }
  };

  // OTP verification function
  const verifyOtp = async (verification: OtpVerification): Promise<boolean> => {
    try {
      setLoading(true);
      // For demo, we'll use mock OTP verification
      // In a real app, this would be an API call
      // const response = await fetch('/api/auth/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(verification)
      // });
      // const data = await response.json();
      
      // Mock OTP verification success and create a user
      const newUser: User = {
        id: 1,
        username: "new_player",
        phoneNumber: verification.phoneNumber,
        countryCode: verification.countryCode,
        email: null,
        password: "******", // Never store actual passwords in state
        gameId: null,
        gameMode: "PUBG",
        profilePicture: null,
        country: "India",
        role: "user",
        walletBalance: 0,
        kycStatus: "not_submitted",
        createdAt: new Date(),
        currency: "INR"
      };
      
      // Store user in localStorage and state
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("OTP verification error:", error);
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user information
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        verifyOtp,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};