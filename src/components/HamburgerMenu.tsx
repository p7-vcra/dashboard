import { useState } from "react";
import './HamburgerMenu.css'; 

function HamburgerMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const selectView = (view: string) => {
        console.log(`Selected view: ${view}`);
        setIsMenuOpen(false); // Close the menu when a view is selected
    };

    return (
        <div>
            <button onClick={toggleMenu} className="hamburger-button">
                &#9776; {/* Hamburger Icon */}
            </button>
            <div className={`menu-content ${isMenuOpen ? 'menu-open' : 'menu-close'}`}>
                <button onClick={() => selectView('map')}>Map View</button>
                <button onClick={() => selectView('dashboard')}>Dashboard View</button>
            </div>
        </div>
    );
}

export default HamburgerMenu;
