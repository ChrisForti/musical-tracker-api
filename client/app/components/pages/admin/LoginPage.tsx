import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToastHelpers } from "~/components/common/ToastProvider";
import { useAuth } from "~/hooks/useAuth";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: showError } = useToastHelpers();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/v2/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        // Store the token in localStorage for future API calls
        localStorage.setItem("authToken", data.token);

        success("Login Successful", "Welcome back! You are now signed in.");

        // Close the modal if callback provided
        onLoginSuccess?.();

        // Refresh auth state and navigate
        console.log("About to call refreshAuth...");
        await refreshAuth();
        console.log("refreshAuth completed");
        setTimeout(() => {
          console.log("Navigating to home...");
          navigate("/");
        }, 100);
      } else {
        console.error("Login failed:", data);
        showError(
          "Login Failed",
          data.errors?.message ||
            data.error ||
            "Please check your credentials and try again."
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      showError(
        "Login Failed",
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:3000/v2/user/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotEmail,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        success(
          "Reset Email Sent",
          "Password reset instructions have been sent to your email!"
        );
        setShowForgotPassword(false);
        setForgotEmail("");
      } else {
        showError(
          "Reset Failed",
          data.errors?.message || data.error || "Failed to send reset email"
        );
      }
    } catch (error) {
      showError(
        "Network Error",
        "Could not send reset email. Please try again."
      );
    }
  }

  if (showForgotPassword) {
    return (
      <div className="bg-white text-black dark:bg-gray-900 dark:text-white p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>
        <form onSubmit={handleForgotPassword}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Send Reset Email
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotEmail("");
              }}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white text-black dark:bg-gray-900 dark:text-white p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full px-4 py-2 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-white"
            required
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Forgot password?
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              Signing in...
            </div>
          ) : (
            "Sign in"
          )}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Sign up here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
export default LoginPage;
