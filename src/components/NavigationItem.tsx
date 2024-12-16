import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";

interface NavigationItemProps {
    href: string;
    icon: IconProp;
    title: string;
}

function NavigationItem({ href, icon, title }: NavigationItemProps) {
    const tooltipId = `tooltip-${title.replace(" ", "-").toLowerCase()}`;
    return (
        <li className="cursor-pointer">
            <Link
                data-tooltip-id={tooltipId}
                to={href}
                className="flex items-center justify-center p-4 text-white rounded-lg hover:bg-zinc-700"
            >
                <FontAwesomeIcon icon={icon} />
            </Link>
            <Tooltip
                id={tooltipId}
                place="right"
                style={{ backgroundColor: "#18181b", borderRadius: "0.5rem" }}
                opacity={1}
            >
                {title}
            </Tooltip>
        </li>
    );
}

export default NavigationItem;
