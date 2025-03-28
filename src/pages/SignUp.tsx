
import React from "react";
import Header from "@/components/Header";
import SignUpForm from "@/components/SignUpForm";

const SignUp: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
