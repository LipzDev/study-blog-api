import React from "react";

export interface AuthSubtitleProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthSubtitle: React.FC<AuthSubtitleProps> = ({
  children,
  className,
}) => {
  return (
    <p
      className={`text-sm text-gray-600 text-center mb-8 leading-relaxed ${
        className || ""
      }`}
    >
      {children}
    </p>
  );
};

export default AuthSubtitle;
