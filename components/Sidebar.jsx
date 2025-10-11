import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaList, FaChartBar, FaCog } from 'react-icons/fa';

function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="drawer-side bg-base-200 min-h-screen w-64 shadow-md">
      <ul className="menu p-4 w-full text-base-content">
        <li className={isActive('/')}>
          <Link to="/">
            <FaHome className="mr-2" />
            Dashboard
          </Link>
        </li>
        <li className={isActive('/rules')}>
          <Link to="/rules">
            <FaList className="mr-2" />
            DNS Rules
          </Link>
        </li>
        <li className={isActive('/statistics')}>
          <Link to="/statistics">
            <FaChartBar className="mr-2" />
            Statistics
          </Link>
        </li>
        <li className={isActive('/settings')}>
          <Link to="/settings">
            <FaCog className="mr-2" />
            Settings
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;