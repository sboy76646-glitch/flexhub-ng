import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("flexhub-user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("flexhub-token") || ""
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "flexhub-user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("flexhub-user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("flexhub-token", token);
    } else {
      localStorage.removeItem("flexhub-token");
    }
  }, [token]);

  async function login(email, password) {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to log in."
        );
      }

      setUser(data.user);
      setToken(data.token);

      toast.success(data.message || "Login successful.");

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      toast.error(error.message);

      return {
        success: false,
        message: error.message,
      };
    } finally {
      setLoading(false);
    }
  }

  async function register(formData) {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create account."
        );
      }

      setUser(data.user);
      setToken(data.token);

      toast.success(
        data.message || "Account created successfully."
      );

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      toast.error(error.message);

      return {
        success: false,
        message: error.message,
      };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setToken("");
    toast.success("Logged out successfully.");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user && token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
} 