import React from "react";

export interface SectionTitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  children,
  level = 2,
  variant = "primary",
  className,
}) => {
  const variantClasses = {
    primary: "text-gray-900",
    secondary: "text-gray-700",
    accent: "text-blue-600",
  };

  const levelClasses = {
    1: "text-4xl font-bold",
    2: "text-3xl font-semibold",
    3: "text-2xl font-semibold",
    4: "text-xl font-medium",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={`${levelClasses[level]} ${variantClasses[variant]} ${
        className || ""
      }`}
    >
      {children}
    </Tag>
  );
};

export default SectionTitle;
