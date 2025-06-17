import React from "react";

export interface ContentCardProps {
  children: React.ReactNode;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined";
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  padding = "md",
  variant = "default",
  className,
}) => {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "bg-white border border-gray-200",
    elevated: "bg-white shadow-lg border-0",
    outlined: "bg-transparent border-2 border-gray-300",
  };

  return (
    <div
      className={`rounded-lg ${paddingClasses[padding]} ${
        variantClasses[variant]
      } ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default ContentCard;
