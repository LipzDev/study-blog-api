import React from "react";

export interface ContentTextProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "muted" | "accent";
  weight?: "normal" | "medium" | "semibold";
  className?: string;
}

export const ContentText: React.FC<ContentTextProps> = ({
  children,
  size = "md",
  variant = "secondary",
  weight = "normal",
  className,
}) => {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variantClasses = {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    muted: "text-gray-500",
    accent: "text-blue-600",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
  };

  return (
    <p
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${
        weightClasses[weight]
      } ${className || ""}`}
    >
      {children}
    </p>
  );
};

export default ContentText;
