import NavMobileButton from "./nav-mobile-button";
import NavMobileMenu from "./nav-mobile-menu";
import {useState} from "react";

export default function NavMobile() {

    const [showMenu, setShowMenu] = useState(false);

    return <div>
        <NavMobileButton change={setShowMenu}/>
        <NavMobileMenu show={showMenu}/>
    </div>
}