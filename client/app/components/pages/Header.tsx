import { useEffect, useRef, useState } from "react";
import { Login } from "./Login";
import { Sidebar } from "./Sidebar";

type HeaderProps = {
  setHeaderNavigation: React.Dispatch<React.SetStateAction<number>>;
};

export function Header({ setHeaderNavigation }: HeaderProps) {
  const [showLogin, setShowLogin] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  // Optional: click outside to close dropdown
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       loginRef.current &&
  //       !loginRef.current.contains(event.target as Node)
  //     ) {
  //       setShowLogin(false);
  //     }
  //   };
  //   if (showLogin) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [showLogin]);
  return (
    <header className="flex justify-between bg-black pb-2 text-teal-600 items-center relative">
      <button
        className="absolute left-4 top-2 text-teal-600 md:hidden"
        onClick={() => setHeaderNavigation(0)}
        aria-label="Toggle Navigation"
      />
      <button
        className="mx-auto flex px-4 py-2 text-center bg-black border-none cursor-pointer"
        onClick={() => setHeaderNavigation(0)}
        style={{ background: "none" }}
        aria-label="Go to Main Page"
      >
        <header className="font-fantasy m-6 text-5xl">Musical Tracker</header>
      </button>

      <Sidebar />
    </header>
  );
}
