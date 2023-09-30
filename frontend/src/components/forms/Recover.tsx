"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { useLoadingCallback } from "react-loading-hook";
import { ValidationError, object, string } from "yup";
import { useFirebaseAuth } from "@/auth/firebase";
import BackTo from "../BackTo";

interface UserRecoverFormData {
  email: string;
}

let userRecoverValidationSchema = object({
  email: string()
    .email("Invalid email provided")
    .required("Your email is required"),
});

export default function Recover() {
  const auth = useFirebaseAuth();
  const [formData, setFormData] = useState<UserRecoverFormData>({
    email: "",
  } as UserRecoverFormData);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const [handleSendPasswordResetEmail, isSendPasswordResetEmailLoading] =
    useLoadingCallback(async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const { email } = formData;
      try {
        await userRecoverValidationSchema.validate(formData, {
          abortEarly: false,
        });
        await sendPasswordResetEmail(auth.getFirebaseAuth(), email);
        setSuccess(
          "If your email is registered, you will receive a message with instructions to reset your password."
        );
      } catch (error) {
        if (error instanceof ValidationError) {
          setError(error.errors.join(", "));
        }
      }
    });
    
  return (
    <div className="hero min-h-screen bg-base-200">
      <div>
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">Reset your password</h1>
            <p className="py-6">
              Provide your email address and we will send you a link to reset
              your password.
            </p>
          </div>
          <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <form className="card-body" onSubmit={handleSendPasswordResetEmail}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="your email"
                  className="input input-bordered"
                  required={true}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control mt-6">
                {isSendPasswordResetEmailLoading ? (
                  <button
                    className="btn btn-primary"
                    disabled={isSendPasswordResetEmailLoading}
                  >
                    <div
                      className="loading loading-spinner loading-lg"
                      title="Recover my password"
                    ></div>
                  </button>
                ) : (
                  <button className="btn btn-primary">
                    Recover my password
                  </button>
                )}
              </div>
            </form>
            <div className="min-h-12">
              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
            </div>
          </div>
        </div>
        <BackTo title="Login" route="auth/login" />
      </div>
    </div>
  );
}
