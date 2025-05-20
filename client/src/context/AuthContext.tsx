import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { User, LoginCredentials, OtpVerification, SignupData } from "@/types";
import { 
  getStoredUser, 
  storeUser,
  storeAuthToken,
  removeAuthToken,
  generateOTP,
  verifyOTP,
  getAvatarUrl,
  getCurrencyForCountry
} from "@/utils/helpers";
import { useToast } from "@/hooks/use-toast";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };
    
    loadUser();
  }, []);
  
  // Simulated login function - In real app would call API
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const otp = generateOTP();
      
      // Simulate API call / OTP sending
      console.log(`OTP sent to ${credentials.countryCode} ${credentials.phoneNumber}: ${otp}`);
      
      // Store OTP temporarily (in real app this would be handled by server)
      localStorage.setItem('temp_otp', otp);
      localStorage.setItem('temp_phone', `${credentials.countryCode}${credentials.phoneNumber}`);
      
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your phone.",
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Simulated signup function
  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const otp = generateOTP();
      
      // Simulate API call / OTP sending
      console.log(`OTP sent to ${data.countryCode} ${data.phoneNumber}: ${otp}`);
      
      // Store signup data temporarily
      localStorage.setItem('temp_otp', otp);
      localStorage.setItem('temp_signup', JSON.stringify(data));
      
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your phone.",
      });
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup Failed",
        description: "Failed to create account. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Simulated OTP verification
  const verifyOtp = async (verification: OtpVerification): Promise<boolean> => {
    try {
      const tempOtp = localStorage.getItem('temp_otp');
      const tempSignup = localStorage.getItem('temp_signup');
      const tempPhone = localStorage.getItem('temp_phone');
      
      // Check if this is signup or login verification
      if (tempSignup) {
        // Signup flow
        const signupData = JSON.parse(tempSignup) as SignupData;
        
        if (verifyOTP(verification.otp, tempOtp || "")) {
          // Create new user
          const newUser: User = {
            id: Date.now(),
            username: signupData.username,
            phoneNumber: signupData.phoneNumber,
            countryCode: signupData.countryCode,
            email: signupData.email,
            gameId: signupData.gameId,
            gameMode: signupData.gameMode,
            role: "player",
            profilePicture: getAvatarUrl(signupData.username),
            kycStatus: "not_submitted",
            currency: getCurrencyForCountry(signupData.countryCode),
            walletBalance: 0,
            country: signupData.countryCode === "+91" ? "India" : 
                    signupData.countryCode === "+234" ? "Nigeria" : "Other",
            createdAt: new Date().toISOString()
          };
          
          // Store user in localStorage
          storeUser(newUser);
          
          // Generate fake token
          const token = Math.random().toString(36).substring(2);
          storeAuthToken(token);
          
          // Update state
          setUser(newUser);
          setIsAuthenticated(true);
          
          // Clean up temp storage
          localStorage.removeItem('temp_otp');
          localStorage.removeItem('temp_signup');
          
          toast({
            title: "Account Created",
            description: "Your account has been created successfully.",
          });
          
          return true;
        }
      } else if (tempPhone) {
        // Login flow
        if (verifyOTP(verification.otp, tempOtp || "")) {
          // For simplicity, create a mock user if not exists
          // In real app, this would fetch the user from a database
          const mockUser: User = {
            id: Date.now(),
            username: "Player" + Math.floor(Math.random() * 1000),
            phoneNumber: verification.phoneNumber,
            countryCode: verification.countryCode,
            role: "player",
            gameMode: "PUBG",
            profilePicture: getAvatarUrl("Player"),
            kycStatus: "not_submitted",
            currency: getCurrencyForCountry(verification.countryCode),
            walletBalance: 500, // Mock starting balance
            country: verification.countryCode === "+91" ? "India" : 
                    verification.countryCode === "+234" ? "Nigeria" : "Other",
            createdAt: new Date().toISOString()
          };
          
          // Store user
          storeUser(mockUser);
          
          // Generate fake token
          const token = Math.random().toString(36).substring(2);
          storeAuthToken(token);
          
          // Update state
          setUser(mockUser);
          setIsAuthenticated(true);
          
          // Clean up temp storage
          localStorage.removeItem('temp_otp');
          localStorage.removeItem('temp_phone');
          
          toast({
            title: "Login Successful",
            description: "You have been logged in successfully.",
          });
          
          return true;
        }
      }
      
      toast({
        title: "Verification Failed",
        description: "Invalid OTP code. Please try again.",
        variant: "destructive"
      });
      
      return false;
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Logout function
  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  }, [toast]);
  
  // Update user data
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const updatedUser = { ...prevUser, ...userData };
      storeUser(updatedUser);
      return updatedUser;
    });
  }, []);
  
  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      signup,
      verifyOtp,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
