import React, { useState } from "react";
import Logo from "../../atoms/Logo";
import Menu from "../../atoms/Menu";
import IconMenu from "../../atoms/IconMenu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${
        isOpen ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          <Logo />
          <Menu expanded={isOpen} />
          <IconMenu onClick={() => setIsOpen(!isOpen)} expanded={isOpen} />
        </div>
      </div>
    </header>
  );
};

export default Header;
