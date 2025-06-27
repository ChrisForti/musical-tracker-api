type HeaderProps = {
  setHeaderNavigation: React.Dispatch<React.SetStateAction<number>>;
};

export function Header({ setHeaderNavigation }: HeaderProps) {
  return (
    <header className="justify-between overflow-hidden bg-black pb-2 text-center text-teal-600 sm:text-center lg:text-right">
      <button
        className="mx-auto flex px-4 py-2 text-center sm:text-left md:text-center "
        onClick={() => {
          // "flex items-center justify-between overflow-hidden bg-sky-900 p-6 text-teal-600">
          setHeaderNavigation(0);
        }}
      >
        <span className="font-fantasy m-6 text-5xl">
          <a href="/Mainpage">Musical Tracker</a>
        </span>
      </button>
      {/* <ul>
        <li
          className="pb-1 text-xl text-teal-600 sm:text-right"
          onClick={() => {
            setHeaderNavigation(0);
          }}
        >
          <a href="/Mainpage">Home</a>
        </li>
      </ul> */}
    </header>
  );
}
