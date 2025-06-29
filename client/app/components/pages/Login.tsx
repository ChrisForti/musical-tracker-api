import { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="w-80 rounded-lg bg-black p-6 shadow-lg">
      <h2 className="mb-4 text-center text-2xl font-bold">Login</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-teal-600">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-teal-600">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-black py-2 px-4 text-white hover:bg-teal-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
