import React from "react";

export interface AuthTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthTitle: React.FC<AuthTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h1
      className={`text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight ${
        className || ""
      }`}
    >
      {children}
    </h1>
  );
};

export default AuthTitle;
