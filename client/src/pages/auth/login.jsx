import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus, FaEnvelope } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "../../store/auth-slice";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
      } else {
        const errorMessage = data?.payload?.message || "";
        toast({
          title: errorMessage,
          variant: "destructive",
        });
        
        // If the error is about email verification, offer to resend
        if (errorMessage.includes("verify your email")) {
          setVerifyEmail(formData.email);
          setIsVerifyDialogOpen(true);
        }
      }
    });
  }
  
  const handleResendVerification = async () => {
    if (!verifyEmail) {
      toast({
        title: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await api.post("/auth/resend-verification", { email: verifyEmail });
      
      if (response.data.success) {
        toast({
          title: response.data.message,
        });
        setIsVerifyDialogOpen(false);
      } else {
        toast({
          title: response.data.message || "Failed to resend verification email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: error.response?.data?.message || "An error occurred while resending verification email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-teal-800 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600 mb-6">
          Sign in to access your account and explore our premium cold-pressed oils
        </p>
      </div>
      
      <CommonForm
        formControls={loginFormControls}
        buttonText={
          <div className="flex items-center justify-center gap-2">
            <FaSignInAlt />
            <span>Sign In</span>
          </div>
        }
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link
            className="font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
            to="/auth/register"
          >
            <span className="flex items-center justify-center gap-1 mt-2">
              <FaUserPlus />
              <span>Create an account</span>
            </span>
          </Link>
        </p>
        <p className="text-gray-600 mt-4">
          <button
            onClick={() => setIsVerifyDialogOpen(true)}
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            <span className="flex items-center justify-center gap-1">
              <FaEnvelope />
              <span>Need to verify your email?</span>
            </span>
          </button>
        </p>
      </div>
      
      {/* Email Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resend Verification Email</DialogTitle>
            <DialogDescription>
              Enter your email address below to receive a new verification link.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="verify-email" className="text-right">
                Email
              </Label>
              <Input
                id="verify-email"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsVerifyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleResendVerification}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Verification Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AuthLogin;
