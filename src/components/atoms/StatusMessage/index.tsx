import React from "react";

export interface StatusMessageProps {
  children: React.ReactNode;
  variant?: "success" | "error" | "warning" | "info";
  size?: "sm" | "md";
  className?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  children,
  variant = "info",
  size = "sm",
  className,
}) => {
  const variantClasses = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const sizeClasses = {
    sm: "p-4 text-sm",
    md: "p-5 text-base",
  };

  return (
    <div
      className={`border rounded-xl ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${className || ""}`}
    >
      {children}
    </div>
  );
};

export default StatusMessage;
