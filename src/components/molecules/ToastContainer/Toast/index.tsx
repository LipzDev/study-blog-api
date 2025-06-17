import React, { useEffect } from "react";
import { ToastMessage, useToast } from "../../../../hooks/toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  message: ToastMessage;
  style: React.CSSProperties;
}

const Toast: React.FC<ToastProps> = ({ message, style }) => {
  const { removeToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(message.id);
    }, message.duration);

    return () => {
      clearTimeout(timer);
    };
  }, [message.id, message.duration, removeToast]);

  const getToastStyles = () => {
    const baseStyles =
      "pointer-events-auto relative flex w-full max-w-sm items-center space-x-3 rounded-lg p-4 shadow-lg";

    switch (message.type) {
      case "success":
        return `${baseStyles} bg-green-50 border border-green-200`;
      case "error":
        return `${baseStyles} bg-red-50 border border-red-200`;
      case "info":
        return `${baseStyles} bg-blue-50 border border-blue-200`;
      default:
        return `${baseStyles} bg-white border border-gray-200`;
    }
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 flex-shrink-0";

    switch (message.type) {
      case "success":
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case "error":
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case "info":
        return <Info className={`${iconClass} text-blue-500`} />;
      default:
        return <Info className={`${iconClass} text-gray-500`} />;
    }
  };

  const getTextColor = () => {
    switch (message.type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "info":
        return "text-blue-800";
      default:
        return "text-gray-800";
    }
  };

  return (
    <div data-toast className={getToastStyles()} style={style}>
      {getIcon()}

      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium ${getTextColor()}`}>
          {message.title}
        </h4>
        {message.description && (
          <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {message.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => removeToast(message.id)}
        aria-label="Fechar notificação"
        className={`flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors ${getTextColor()}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
