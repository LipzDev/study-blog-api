import React from "react";
import { CheckCircle } from "lucide-react";

export interface AuthSuccessMessageProps {
  title: string;
  description: string;
  icon?: string;
  className?: string;
}

export const AuthSuccessMessage: React.FC<AuthSuccessMessageProps> = ({
  title,
  description,
  icon,
  className,
}) => {
  return (
    <div
      className={`text-center p-6 bg-green-50 border border-green-200 rounded-xl ${
        className || ""
      }`}
    >
      <div className="flex justify-center mb-4">
        {icon ? (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl text-green-600">{icon}</span>
          </div>
        ) : (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-green-800 mb-2">{title}</h3>
      <p className="text-green-700 leading-relaxed">{description}</p>
    </div>
  );
};

export default AuthSuccessMessage;
