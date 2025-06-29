import { useState } from "react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="w-80 rounded-lg bg-black p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
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
