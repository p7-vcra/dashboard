import { faFilter, faMap, faShip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import VesselFilter from '../components/VesselFilter';

function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  const routes = {
    map: {
      display: 'Map',
      icon: faMap,
      href: '/',
    },
    vessels: {
      display: 'Vessels',
      icon: faShip,
      href: '/vessels',
    },
  };

  return (
    <div className="">
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform border-r-2 border-zinc-600"
        aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto bg-zinc-800 ">
          <ul className="space-y-2 font-medium">
            {Object.values(routes).map((route) => (
              <li key={route.href}>
                <Link to={route.href} className="flex items-center p-2 text-white rounded-lg  hover:bg-zinc-700">
                  <FontAwesomeIcon icon={route.icon} className="mr-2" />
                  <span>{route.display}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="z-[3000] fixed bottom-0 right-0 p-4">
        {isOpen ? (
          <VesselFilter onClose={() => setIsOpen(false)} />
        ) : (
          <div>
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2  text-white bg-zinc-800 bg-opacity-85 backdrop-blur-lg p-4  rounded-xl border-2 border-zinc-600 hover:bg-zinc-600 space-x-2">
              <FontAwesomeIcon icon={faFilter} />
              <span>Filters</span>
            </button>
          </div>
        )}
      </div>

      <main className="flex-1 ml-64 -z-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
