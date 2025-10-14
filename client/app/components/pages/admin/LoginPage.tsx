import { useState } from "react";

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps = {}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

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
        // You could also redirect or update state here
        alert("Login successful!");
        // Close the modal if callback provided
        onLoginSuccess?.();
      } else {
        console.error("Login failed:", data);
        alert(
          "Login failed: " +
            (data.errors?.message || data.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: Network error");
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
        alert("Password reset instructions have been sent to your email!");
        setShowForgotPassword(false);
        setForgotEmail("");
      } else {
        alert(
          "Error: " +
            (data.errors?.message || data.error || "Failed to send reset email")
        );
      }
    } catch (error) {
      alert("Network error: Could not send reset email");
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
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
export default LoginPage;
