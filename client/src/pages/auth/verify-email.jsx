import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { api } from "../../store/auth-slice";

// Configuration flags
const DEBUG_MODE = true;
const USE_TEST_ENDPOINT = false; // Set to false to use the real endpoint

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [debugInfo, setDebugInfo] = useState({});

  const token = searchParams.get("token") || "testtoken123";

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      setDebugInfo({ error: "No token in URL parameters" });
      return;
    }

    const verifyToken = async () => {
      try {
        // Log the token and URL for debugging
        const tokenDebug = token.substring(0, 10) + '...';
        console.log(`Attempting to verify token: ${tokenDebug}`);
        
        // Update the debug info
        setDebugInfo(prev => ({ 
          ...prev, 
          token: tokenDebug,
          useTestEndpoint: USE_TEST_ENDPOINT,
          requestStartTime: new Date().toISOString()
        }));
        
        // Choose which endpoint to use
        const endpoint = USE_TEST_ENDPOINT 
          ? `/auth/test-verify-email/${token}` 
          : `/auth/verify-email/${token}`;
        
        console.log(`Using endpoint: ${endpoint}`);
        
        // Use the configured API instance
        const response = await api.get(endpoint);
        
        console.log('Verification response:', response.data);
        
        // Update debug info
        setDebugInfo(prev => ({ 
          ...prev, 
          endpoint,
          responseStatus: response.status,
          responseData: response.data,
          responseTime: new Date().toISOString()
        }));
        
        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
          toast({
            title: response.data.message,
          });
          setTimeout(() => {
            navigate("/auth/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Verification failed.");
        }
      } catch (error) {
        console.error('Verification error:', error);
        
        // Update debug info with error details
        setDebugInfo(prev => ({ 
          ...prev, 
          error: error.message,
          errorStatus: error.response?.status,
          errorData: error.response?.data,
          errorTime: new Date().toISOString(),
          errorStack: error.stack
        }));
        
        // More detailed error handling
        if (error.response) {
          // Server responded with error status
          setStatus("error");
          setMessage(error.response.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
          // Request was made but no response received (network issue)
          setStatus("error");
          setMessage("Network error: Could not connect to the verification server.");
        } else {
          // Request setup error
          setStatus("error");
          setMessage(`Error: ${error.message}`);
        }
        
        toast({
          title: "Verification failed",
          description: error.response?.data?.message || error.message,
          variant: "destructive",
        });
      }
    };

    verifyToken();
  }, [token, toast, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setDebugInfo(prev => ({ 
        ...prev, 
        resendEmail: email,
        resendStartTime: new Date().toISOString()
      }));
      
      // For test mode, just simulate success
      if (USE_TEST_ENDPOINT) {
        toast({
          title: "Test verification email sent successfully",
        });
        setDebugInfo(prev => ({ 
          ...prev, 
          resendResponse: { success: true, message: "Test verification email sent successfully" },
          resendResponseTime: new Date().toISOString()
        }));
        return;
      }
      
      // Use the configured API instance
      const response = await api.post("/auth/resend-verification", { email });
      
      setDebugInfo(prev => ({ 
        ...prev, 
        resendResponse: response.data,
        resendResponseTime: new Date().toISOString()
      }));
      
      if (response.data.success) {
        toast({
          title: response.data.message,
        });
      } else {
        toast({
          title: response.data.message || "Failed to resend verification email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      
      setDebugInfo(prev => ({ 
        ...prev, 
        resendError: error.message,
        resendErrorData: error.response?.data,
        resendErrorTime: new Date().toISOString()
      }));
      
      toast({
        title: error.response?.data?.message || "An error occurred while resending verification email.",
        variant: "destructive",
      });
    }
  };

  // For development testing
  const testVerificationStates = () => {
    return (
      <div className="mt-4 space-y-2 rounded-lg bg-gray-100 p-4">
        <h3 className="font-medium">Test Controls</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setStatus("success");
              setMessage("Test success message");
            }}
          >
            Test Success
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setStatus("error");
              setMessage("Test error message");
            }}
          >
            Test Error
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setStatus("loading");
            }}
          >
            Test Loading
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Email Verification</h1>

      {DEBUG_MODE && testVerificationStates()}

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
            <h4 className="text-md font-medium text-gray-800">Didn't receive a verification email?</h4>
            <div className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="rounded border border-gray-300 p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleResendVerification}>Resend Verification Email</Button>
            </div>
          </div>
          
          <div className="mt-6">
            <Button variant="outline" onClick={() => navigate("/auth/login")}>
              Return to Login
            </Button>
          </div>
          
          {/* Debug info section - only visible in debug mode */}
          {DEBUG_MODE && (
            <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-gray-700">Debug Information</summary>
                <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-900 p-2 text-xs text-white">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyEmail; 