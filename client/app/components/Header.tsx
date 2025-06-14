import { useState } from "react";
import { Login } from "./Login";

type HeaderProps = {
  setHeaderNavigation: React.Dispatch<React.SetStateAction<number>>;
};

export function Header({ setHeaderNavigation }: HeaderProps) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  return (
    <div>
      <header className=" bg-black p-4 text-white">
        <h1 className="text-7xl">Musical Tracker</h1>
        <ul>
          <li
            className="pb-1 text-xl text-teal-600 sm:text-left"
            onClick={() => {
              setHeaderNavigation(0);
            }}
          >
            <button
              className="hover:underline"
              onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            >
              Login
            </button>
            {isDropdownVisible && (
              <div className="absolute justify-center bg-white text-black shadow-lg">
                <Login />
              </div>
            )}
          </li>
        </ul>
      </header>
    </div>
  );
}
