import { FaSun, FaMoon } from 'react-icons/fa';

function Navbar({ darkMode, setDarkMode }) {
  return (
    <div className="navbar bg-base-200 shadow-md">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">DNS Parental Control</a>
      </div>
      <div className="flex-none">
        <button 
          className="btn btn-ghost btn-circle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

export default Navbar;