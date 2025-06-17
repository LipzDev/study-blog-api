import React from "react";

export interface PrimaryButtonProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className,
}) => {
  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gray-100 hover:bg-gray-200 focus:bg-gray-200 text-gray-700 border border-gray-300",
    success:
      "bg-green-600 hover:bg-green-700 focus:bg-green-700 text-white shadow-lg hover:shadow-xl",
    error:
      "bg-red-600 hover:bg-red-700 focus:bg-red-700 text-white shadow-lg hover:shadow-xl",
    warning:
      "bg-yellow-500 hover:bg-yellow-600 focus:bg-yellow-600 text-white shadow-lg hover:shadow-xl",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white bg-transparent",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const baseClasses =
    "font-semibold rounded-xl transition-all duration-200 border-none cursor-pointer inline-flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-200 active:scale-95";
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass =
    disabled || loading ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${widthClass} ${disabledClass} ${className || ""}`}
    >
      {loading ? "Carregando..." : children}
    </button>
  );
};

export default PrimaryButton;
