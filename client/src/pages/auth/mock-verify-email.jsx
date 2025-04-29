import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

function MockVerifyEmail() {
  const { toast } = useToast();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  // Simulate successful verification
  const simulateSuccess = () => {
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setMessage("Your email has been verified successfully. You can now log in.");
      toast({
        title: "Email verified successfully",
      });
    }, 1500);
  };

  // Simulate failed verification
  const simulateError = () => {
    setStatus("loading");
    setTimeout(() => {
      setStatus("error");
      setMessage("Invalid or expired verification token. Please request a new verification email.");
      toast({
        title: "Verification failed",
        variant: "destructive",
      });
    }, 1500);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Email Verification Test</h1>
      
      <div className="space-y-4">
        <Button onClick={simulateSuccess} className="w-full">
          Simulate Successful Verification
        </Button>
        <Button onClick={simulateError} variant="outline" className="w-full">
          Simulate Failed Verification
        </Button>
      </div>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-lg">Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div className="rounded-lg bg-green-50 p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-green-800">Email Verified Successfully!</h3>
          <p className="mt-2 text-green-600">{message}</p>
          <p className="mt-4 text-sm text-green-600">Redirecting to login page...</p>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-lg bg-red-50 p-6">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-red-800">Verification Failed</h3>
          <p className="mt-2 text-red-600">{message}</p>
          
          <div className="mt-6 space-y-4 rounded-lg bg-white p-4 shadow-sm">
            <h4 className="text-md font-medium text-gray-800">Need help?</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                If you're having trouble verifying your email, you can:
              </p>
              <ul className="ml-4 list-disc text-left text-sm text-gray-600">
                <li>Check if you're using the correct verification link</li>
                <li>Request a new verification email</li>
                <li>Contact support for assistance</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center text-sm text-gray-500">
        <p>This is a test page for simulating email verification responses.</p>
      </div>
    </div>
  );
}

export default MockVerifyEmail; 