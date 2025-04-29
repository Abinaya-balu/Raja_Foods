import React, { useEffect, useState } from "react";
import { ShoppingCart, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

const Toast = ({ id, title, description, variant = "default", onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      setIsExiting(true);
    };
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss && onDismiss(id);
    }, 500); // Animation duration
  };

  // Define variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-100 border-red-400 text-red-800";
      case "success":
        return "bg-green-100 border-green-400 text-green-800";
      case "warning":
        return "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "cart":
        return "bg-teal-100 border-teal-400 text-teal-800";
      default:
        return "bg-blue-100 border-blue-400 text-blue-800";
    }
  };
  
  // Get appropriate icon based on variant
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "cart":
        return <ShoppingCart className="h-5 w-5 text-teal-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 shadow-lg ${getVariantStyles()} transform transition-all duration-500 ${
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0"
      }`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          {title && <div className="font-semibold">{title}</div>}
          {description && <div className="text-sm mt-1">{description}</div>}
        </div>
        <button
          type="button"
          className="ml-4 inline-flex flex-shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={handleDismiss}
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
