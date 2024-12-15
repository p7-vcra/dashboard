import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import Tooltip from "./Tooltip";

interface NavigationItemProps {
    href: string;
    icon: IconProp;
    title: string;
}

function NavigationItem({ href, icon, title }: NavigationItemProps) {
    return (
        <li className="cursor-pointer">
            <Tooltip content={title} position="right">
                <Link
                    to={href}
                    className="flex items-center justify-center p-4 text-white rounded-lg hover:bg-zinc-700"
                >
                    <FontAwesomeIcon icon={icon} />
                </Link>
            </Tooltip>
        </li>
    );
}

export default NavigationItem;
