import { useToast } from "../../hooks/useToast";
import Toast from "./Toast";

const ToastContainer = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex flex-col items-end pointer-events-none p-4 space-y-4 z-50"
      style={{ top: "1rem", right: "1rem" }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="w-full max-w-sm pointer-events-auto">
          <Toast
            id={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={dismissToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer; 