import { Sidebar } from "./Sidebar";

export function Header() {
  return (
    <header className=" bg-black pb-2 flex items-center justify-center h-26 relative text-teal-600 ">
      <h1 className="font-fantasy text-5xl">Musical Tracker</h1>
      <Sidebar />
    </header>
  );
}
