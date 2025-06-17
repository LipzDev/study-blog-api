import React from "react";

export interface NavigationLinkProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "accent";
  underline?: "none" | "hover" | "always";
  external?: boolean;
  className?: string;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  children,
  href,
  onClick,
  variant = "primary",
  underline = "hover",
  external = false,
  className,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const variantClasses = {
    primary: "text-blue-600 hover:text-blue-800",
    secondary: "text-gray-600 hover:text-gray-800",
    accent: "text-purple-600 hover:text-purple-800",
  };

  const underlineClasses = {
    none: "no-underline",
    hover: "no-underline hover:underline",
    always: "underline",
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${variantClasses[variant]} ${
        underlineClasses[underline]
      } transition-colors cursor-pointer ${className || ""}`}
    >
      {children}
    </a>
  );
};

export default NavigationLink;
