import React from "react";

export interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, className }) => {
  return (
    <div
      className={`max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
};

export default AuthCard;
