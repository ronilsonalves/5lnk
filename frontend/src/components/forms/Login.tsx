"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useFirebaseAuth } from "@/auth/firebase";
import { useLoadingCallback } from "react-loading-hook";
import {
  getGoogleProvider,
  getGithubProvider,
  loginWithProvider,
} from "@/app/auth/login/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ValidationError, object, string } from "yup";

import RedirectingPage from "../skeleton/RedirectingPage";
import { FirebaseError } from "firebase/app";

interface UserLoginFormData {
  email: string;
  password: string;
}

let userLoginValidationSchema = object({
  email: string().email("Invalid email").required("Email is required"),
  password: string().required("Your password is required"),
});

export default function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const { getFirebaseAuth } = useFirebaseAuth();
  const redirect = params?.get("redirect");

  const [formData, setFormData] = React.useState<UserLoginFormData>({
    email: "",
    password: "",
  } as UserLoginFormData);

  const [formErrors, setFormErrors] = React.useState<{ [key: string]: string }>(
    {}
  );
  const [firebaseAuthError, setFirebaseAuthError] = React.useState<string>("");

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [handleLoginWithEmailAndPassword, isLoginLoading, loginError] =
    useLoadingCallback(async (event: React.FormEvent<HTMLFormElement>) => {
      setIsRedirecting(false);
      event.preventDefault();
      const auth = getFirebaseAuth();

      try {
        await userLoginValidationSchema.validate(formData, {
          abortEarly: false,
        });
        const userCredential = await signInWithEmailAndPassword(
          auth,
          (event.target as HTMLFormElement).email.value,
          (event.target as HTMLFormElement).password.value
        );
        const idTokenResult = await userCredential.user.getIdTokenResult();
        await fetch("/api/login", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idTokenResult.token}`,
          },
        });
        setIsRedirecting(true);
        router.push(redirect ?? "/dashboard");
      } catch (error) {
        if (error instanceof ValidationError) {
          const newErrors: { [key: string]: string } = {};
          error.inner.forEach((validationErr) => {
            if (validationErr.path) {
              newErrors[validationErr.path] = validationErr.message;
            }
          });
          setFormErrors(newErrors);
        }

        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/invalid-email":
              setFirebaseAuthError("Invalid email!");
              break;
            case "auth/user-not-found":
            case "auth/wrong-password":
              setFirebaseAuthError("User not found or wrong password!");
              break;
            default:
              setFirebaseAuthError(
                "An error ocurred while trying to login: " + error.code
              );
              break;
          }
          setTimeout(() => {
            setFirebaseAuthError("");
          }, 5000);
        }
      }
    });

  const [handleLoginWithGoogle, isGoogleLoginLoading, googleLoginError] =
    useLoadingCallback(async () => {
      setIsRedirecting(false);
      const auth = getFirebaseAuth();
      try {
        const user = await loginWithProvider(auth, getGoogleProvider(auth));
        const idTokenResult = await user.getIdTokenResult();
        await fetch("/api/login", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idTokenResult.token}`,
          },
        });
        setIsRedirecting(true);
        router.push(redirect ?? "/dashboard");
      } catch (error) {
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/account-exists-with-different-credential":
              setFirebaseAuthError(
                "You already have an account with us. To link your Google account, please login to your account"+
                " then link your Google account from your profile page."
              );
              break;
            default:
              setFirebaseAuthError(
                "An error ocurred while trying to login: " + error.code
              );
              setTimeout(() => {
                setFirebaseAuthError("");
              }, 5000);
              break;
          }
        }
      }
    });

  const [handleLoginWithGithub, isGithubLoginLoading] = useLoadingCallback(
    async () => {
      setIsRedirecting(false);
      const auth = getFirebaseAuth();
      try {
        const user = await loginWithProvider(auth, getGithubProvider(auth));
        const idTokenResult = await user.getIdTokenResult();
        await fetch("/api/login", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idTokenResult.token}`,
          },
        });
        setIsRedirecting(true);
        router.push(redirect ?? "/dashboard");
      } catch (error) {
        console.warn(error);
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/account-exists-with-different-credential":
              setFirebaseAuthError(
                "You already have an account with us. To link your GitHub account, please login to your account then link your GitHub account from your profile page."
              );
              break;
            default:
              setFirebaseAuthError(
                "An error occurred while trying to login: " + error.code
              );
              setTimeout(() => {
                setFirebaseAuthError("");
              }, 5000);
              break;
          }
        }
      }
    }
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    await handleLoginWithEmailAndPassword(event);
  };

  return (
    <>
      <div className="hero min-h-screen bg-base-200 max-h-7/8 flex flex-col pb-20">
        <Link href="/">
          <Image
            className="mx-auto md:my-12 dark:hidden"
            src="/logo_dark.svg"
            alt={process.env.NEXT_PUBLIC_SITE_NAME || "5lnk - URL Shortener"}
            width={120}
            height={120}
          />
          <Image
            className="mx-auto md:my-12 hidden dark:block"
            src="/logo.svg"
            alt={process.env.NEXT_PUBLIC_SITE_NAME || "5lnk - URL Shortener"}
            width={120}
            height={120}
          />
        </Link>
        {isRedirecting && (
          <RedirectingPage>
            {<p>Redirecting to {redirect ?? "/dashboard"}...</p>}
          </RedirectingPage>
        )}
        {!isRedirecting && (
          <div className="hero-content flex-col lg:flex-row-reverse">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-bold">Login to your account!</h1>
              <p className="py-6">
                Login to your account to manage your links and view your stats!
              </p>
            </div>
            <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
              <form className="card-body" onSubmit={handleSubmit}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="email"
                    className="input input-bordered"
                    value={formData.email}
                    required={true}
                    onChange={handleFormChange}
                  />
                  {formErrors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {formErrors.email}
                      </span>
                    </label>
                  )}
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="password"
                    className="input input-bordered"
                    value={formData.password}
                    required={true}
                    onChange={handleFormChange}
                  />
                  {formErrors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {formErrors.password}
                      </span>
                    </label>
                  )}
                  <label className="label">
                    <a
                      href="/auth/recover"
                      className="label-text-alt link link-hover"
                      title="Recover your passwoord!"
                    >
                      Forgot your password?
                    </a>
                  </label>
                </div>
                {firebaseAuthError && (
                  <div className="alert alert-error">{firebaseAuthError}</div>
                )}
                <div className="form-control mt-6">
                  {isLoginLoading ||
                  isGoogleLoginLoading ||
                  isGithubLoginLoading ? (
                    <div className="flex flex-col text-center">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={
                          isGithubLoginLoading ||
                          isGoogleLoginLoading ||
                          isLoginLoading
                        }
                      >
                        <div
                          className="loading loading-spinner loading-lg"
                          title="Login"
                        ></div>
                      </button>
                      <a
                        href="/auth/register"
                        className="label-text-alt link link-hover my-3"
                        title="Create a new account!"
                      >
                        Create a new account!
                      </a>
                      <div className="my-2">or</div>
                    </div>
                  ) : (
                    <div className="flex flex-col text-center">
                      <button type="submit" className="btn btn-primary">
                        Login
                      </button>
                      <a
                        href="/auth/register"
                        className="label-text-alt link link-hover my-3"
                        title="Create a new account!"
                      >
                        Create a new account!
                      </a>
                      <div className="my-2">or</div>
                    </div>
                  )}
                </div>
                {/* Social Login buttons */}
                <div className="grid grid-flow-row gap-3">
                  <button
                    className="btn btn-primary text-center"
                    disabled={
                      isGithubLoginLoading ||
                      isGoogleLoginLoading ||
                      isLoginLoading
                    }
                    onClick={handleLoginWithGoogle}
                  >
                    <Image
                      className="w-6 h-6"
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      loading="lazy"
                      alt="google logo"
                      width={6}
                      height={6}
                    />
                    <span>Login with Google</span>
                  </button>
                  <button
                    className="btn btn-primary text-center"
                    disabled={
                      isGithubLoginLoading ||
                      isGoogleLoginLoading ||
                      isLoginLoading
                    }
                    onClick={handleLoginWithGithub}
                  >
                    <Image
                      className="w-6 h-6"
                      src="https://www.svgrepo.com/show/512317/github-142.svg"
                      loading="lazy"
                      alt="google logo"
                      width={6}
                      height={6}
                    />
                    <span>Login with GitHub</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {loginError ||
          (googleLoginError && (
            <div className="toast toast-end max-w-md">
              <div className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{loginError ?? googleLoginError?.toString()}</span>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
