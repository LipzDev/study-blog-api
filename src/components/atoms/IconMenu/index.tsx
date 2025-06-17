import React from "react";
import { Menu, X } from "lucide-react";

export type IconMenuProps = {
  onClick?: () => void;
  expanded?: boolean;
};

const IconMenu = ({ onClick, expanded }: IconMenuProps) => {
  return (
    <button
      onClick={onClick}
      className="p-2 text-gray-600 hover:text-gray-800 transition-colors md:hidden"
      aria-label={expanded ? "Close menu" : "Open menu"}
    >
      {expanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
};

export default IconMenu;
