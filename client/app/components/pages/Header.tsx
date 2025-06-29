import { useEffect, useRef, useState } from "react";
import { Login } from "../auth/login";
import { Sidebar } from "./Sidebar";

type HeaderProps = {
  setHeaderNavigation: React.Dispatch<React.SetStateAction<number>>;
};

export function Header({ setHeaderNavigation }: HeaderProps) {
   const [showLogin, setShowLogin] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

    // Optional: click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        loginRef.current &&
        !loginRef.current.contains(event.target as Node)
      ) {
        setShowLogin(false);
      }
    };
    if (showLogin) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogin]);
  return (
    <header className="flex justify-between bg-black pb-2 text-teal-600 items-center relative">
      <button
        className="absolute left-4 top-2 text-teal-600 md:hidden"
        onClick={() => setHeaderNavigation(0)}
        aria-label="Toggle Navigation"/>
      <button
        className="mx-auto flex px-4 py-2 text-center bg-black border-none cursor-pointer"
        onClick={() => setHeaderNavigation(0)}
        style={{ background: "none" }}
        aria-label="Go to Main Page"
      >
        <header className="font-fantasy m-6 text-5xl">
          Musical Tracker
        </header>
      </button>
      
      <div className="relative" ref={loginRef}>
        <button
          className="text-xl text-teal-600 bg-black px-4 py-2 rounded hover:bg-teal-900"
          onClick={() => setHeaderNavigation(0)}
          aria-haspopup="true"
          aria-expanded={showLogin}
        >
          Login
        </button>
        {showLogin && (
          <div className="absolute right-0 mt-2 bg-white rounded shadow-lg z-50 p-4 w-64">
            <Login />
          </div>
        )}
      </div>
      <Sidebar/>
    </header>
  );
}
