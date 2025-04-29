import { createContext, useContext } from "react";
import { useToast } from "../hooks/useToast";
import ToastContainer from "../components/ui/ToastContainer";

// Create context
const ToastContext = createContext(null);

// Create ToastProvider
export const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Create hook to use the toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}; 