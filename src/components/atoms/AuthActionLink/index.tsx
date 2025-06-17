import React from "react";

export interface AuthActionLinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const AuthActionLink: React.FC<AuthActionLinkProps> = ({
  children,
  onClick,
  type = "button",
  className,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-3 bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 ${
        className || ""
      }`}
    >
      {children}
    </button>
  );
};

export default AuthActionLink;
