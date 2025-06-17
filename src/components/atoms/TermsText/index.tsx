import React from "react";

export interface TermsTextProps {
  children: React.ReactNode;
  className?: string;
}

export const TermsText: React.FC<TermsTextProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`terms-text text-xs text-center text-gray-500 leading-relaxed mt-6 ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
};

export default TermsText;
