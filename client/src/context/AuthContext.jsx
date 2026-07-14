import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.PROD
  ? "https://flexhub-ng.onrender.com"
  : import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_URL = `${API_BASE_URL}/api/auth`;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("flexhub-user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("flexhub-user");
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("flexhub-token") || ""
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("flexhub-user", JSON.stringify(user));
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

  async function sendAuthRequest(endpoint, payload) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Authentication request failed.");
    }

    return data;
  }

  async function login(email, password) {
    setLoading(true);

    try {
      const data = await sendAuthRequest("login", {
        email: email.trim(),
        password,
      });

      setUser(data.user);
      setToken(data.token);

      toast.success(data.message || "Welcome back!");

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Unable to reach the server. Please try again."
          : error.message;

      toast.error(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }

  async function register(formData) {
    setLoading(true);

    try {
      const data = await sendAuthRequest("register", {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });

      setUser(data.user);
      setToken(data.token);

      toast.success(data.message || "Account created successfully!");

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      const message =
        error instanceof TypeError
          ? "Unable to reach the server. Please try again."
          : error.message;

      toast.error(message);

      return {
        success: false,
        message,
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

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
} 