import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function validateForm() {
    if (!formData.userName.trim()) {
      toast({
        title: "Username is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.email.trim()) {
      toast({
        title: "Email is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.password.trim()) {
      toast({
        title: "Password is required",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }

  function onSubmit(event) {
    event.preventDefault();
    
    // Log the form data for debugging
    console.log("Form submission attempt:", formData);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    dispatch(registerUser(formData))
      .then((data) => {
        setIsSubmitting(false);
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigate("/auth/login");
      } else {
        toast({
            title: data?.payload?.message || "Registration failed",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        console.error("Registration error:", error);
        toast({
          title: "Registration failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="align-top">
      <a href="/" className="text-center bg-teal-600 text-white px-4 py-2 rounded shadow-lg hover:bg-teal-700 transition duration-300 ease-in-out transform hover:scale-105">
            Back
          </a>
    </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-teal-600 hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={isSubmitting ? "Signing Up..." : "Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        isBtnDisabled={isSubmitting}
      />
      <h4 className="text-center text-sm text-gray-500">After Signing Up,Check your mail & Please Verify Your Email to login</h4>
    </div>
  );
}

export default AuthRegister;
