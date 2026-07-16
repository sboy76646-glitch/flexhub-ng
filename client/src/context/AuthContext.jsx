/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
} from "react";
import toast from "react-hot-toast";

import { API_BASE_URL } from "../lib/api";

const AuthContext = createContext(null);

const API_URL = `${API_BASE_URL}/api/auth`;

const USER_STORAGE_KEY = "flexhub-user";
const TOKEN_STORAGE_KEY = "flexhub-token";

function clearStoredSession() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);

  sessionStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

function readStoredSession() {
  try {
    const localToken =
      localStorage.getItem(TOKEN_STORAGE_KEY);

    const localUser =
      localStorage.getItem(USER_STORAGE_KEY);

    if (localToken && localUser) {
      return {
        token: localToken,
        user: JSON.parse(localUser),
        rememberMe: true,
      };
    }

    const sessionToken =
      sessionStorage.getItem(TOKEN_STORAGE_KEY);

    const sessionUser =
      sessionStorage.getItem(USER_STORAGE_KEY);

    if (sessionToken && sessionUser) {
      return {
        token: sessionToken,
        user: JSON.parse(sessionUser),
        rememberMe: false,
      };
    }
  } catch (error) {
    console.error(
      "Unable to restore authentication session:",
      error
    );

    clearStoredSession();
  }

  return {
    token: "",
    user: null,
    rememberMe: false,
  };
}

function saveSession({
  user,
  token,
  rememberMe,
}) {
  clearStoredSession();

  const storage = rememberMe
    ? localStorage
    : sessionStorage;

  storage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(user)
  );

  storage.setItem(
    TOKEN_STORAGE_KEY,
    token
  );
}

export function AuthProvider({ children }) {
  const [initialSession] =
    useState(readStoredSession);

  const [user, setUser] =
    useState(initialSession.user);

  const [token, setToken] =
    useState(initialSession.token);

  const [
    rememberSession,
    setRememberSession,
  ] = useState(
    initialSession.rememberMe
  );

  const [loading, setLoading] =
    useState(false);

  async function sendAuthRequest(
    endpoint,
    payload
  ) {
    const response = await fetch(
      `${API_URL}/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The server returned an invalid response."
      );
    }

    if (!response.ok) {
      const error = new Error(
        data.message ||
          "Authentication request failed."
      );

      error.data = data;
      error.status = response.status;

      throw error;
    }

    return data;
  }

  function getErrorMessage(error) {
    return error instanceof TypeError
      ? "Unable to reach the server. Please try again."
      : error.message;
  }

  function applyAuthenticatedSession({
    user: authenticatedUser,
    token: authenticatedToken,
    rememberMe = false,
  }) {
    setUser(authenticatedUser);
    setToken(authenticatedToken);
    setRememberSession(rememberMe);

    saveSession({
      user: authenticatedUser,
      token: authenticatedToken,
      rememberMe,
    });
  }

  async function login(
    identifier,
    password,
    rememberMe = false
  ) {
    setLoading(true);

    try {
      const data = await sendAuthRequest(
        "login",
        {
          identifier:
            identifier.trim(),
          password,
        }
      );

      applyAuthenticatedSession({
        user: data.user,
        token: data.token,
        rememberMe,
      });

      toast.success(
        data.message ||
          "Welcome back!"
      );

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      const message =
        getErrorMessage(error);

      toast.error(message);

      return {
        success: false,
        message,
        requiresVerification: Boolean(
          error.data
            ?.requiresVerification
        ),
        email:
          error.data?.email || "",
      };
    } finally {
      setLoading(false);
    }
  }

  async function register(formData) {
    setLoading(true);

    try {
      const data = await sendAuthRequest(
        "register",
        {
          ...formData,
          firstName:
            formData.firstName.trim(),
          lastName:
            formData.lastName.trim(),
          email:
            formData.email.trim(),
          phone:
            formData.phone.trim(),
        }
      );

      toast.success(
        data.message ||
          "Account created successfully."
      );

      return {
        success: true,
        user: data.user || null,
        email:
          data.email ||
          formData.email.trim(),
        requiresVerification: Boolean(
          data.requiresVerification
        ),
      };
    } catch (error) {
      const message =
        getErrorMessage(error);

      toast.error(message);

      return {
        success: false,
        message,
        requiresVerification: Boolean(
          error.data
            ?.requiresVerification
        ),
        email:
          error.data?.email ||
          formData.email.trim(),
      };
    } finally {
      setLoading(false);
    }
  }

  async function verifyEmail({
    email,
    otp,
  }) {
    setLoading(true);

    try {
      const data = await sendAuthRequest(
        "verify-email",
        {
          email: email.trim(),
          otp: otp.trim(),
        }
      );

      if (data.user && data.token) {
        applyAuthenticatedSession({
          user: data.user,
          token: data.token,
          rememberMe: false,
        });
      }

      toast.success(
        data.message ||
          "Email verified successfully."
      );

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      const message =
        getErrorMessage(error);

      toast.error(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }

  async function resendVerificationOTP(
    email
  ) {
    try {
      const data = await sendAuthRequest(
        "resend-verification-otp",
        {
          email: email.trim(),
        }
      );

      toast.success(
        data.message ||
          "A new verification code has been sent."
      );

      return {
        success: true,
      };
    } catch (error) {
      const message =
        getErrorMessage(error);

      toast.error(message);

      return {
        success: false,
        message,
      };
    }
  }

  async function forgotPassword(
    identifier
  ) {
    setLoading(true);

    try {
      const data = await sendAuthRequest(
        "forgot-password",
        {
          identifier:
            identifier.trim(),
        }
      );

      toast.success(
        data.message ||
          "A reset code has been sent."
      );

      return {
        success: true,
        email: data.email || "",
      };
    } catch (error) {
      const message =
        getErrorMessage(error);

      toast.error(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }

  async function verifyResetOTP({
    email,
    otp,
  }) {
    setLoading(true);

    try {
      const data = await sendAuthRequest(
        "verify-reset-otp",
        {
          email: email.trim(),
          otp: otp.trim(),
        }
      );

      toast.success(
        data.message ||
          "Reset code verified."
      );

      return {
        success: true,
        resetToken: data.resetToken,
      };
    } catch (error) {
      const message =
        getErrorMessage(error);

      toast.error(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword({
    resetToken,
    password,
    confirmPassword,
  }) {
    setLoading(true);

    try {
      const data = await sendAuthRequest(
        "reset-password",
        {
          resetToken,
          password,
          confirmPassword,
        }
      );

      toast.success(
        data.message ||
          "Password reset successfully."
      );

      return {
        success: true,
      };
    } catch (error) {
      const message =
        getErrorMessage(error);

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
    setRememberSession(false);

    clearStoredSession();

    toast.success(
      "Logged out successfully."
    );
  }

  function updateUser(changes) {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser = {
        ...currentUser,
        ...changes,
      };

      const storage =
        rememberSession
          ? localStorage
          : sessionStorage;

      storage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    verifyEmail,
    resendVerificationOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
    logout,
    updateUser,
    isAuthenticated: Boolean(
      user && token
    ),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
} 