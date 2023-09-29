"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useLoadingCallback } from "react-loading-hook";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { ValidationError, object, ref, string } from "yup";
import { useFirebaseAuth } from "@/auth/firebase";
import {
  getGithubProvider,
  getGoogleProvider,
  loginWithProvider,
} from "@/app/auth/login/firebase";

import { FirebaseError } from "firebase/app";
import BackTo from "@components/BackTo";

interface UserRegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

let userRegistrationValidationSchema = object({
  firstName: string()
    .matches(/^[a-zA-Z]+$/, "First name must contain only letters")
    .required("First name is required"),
  lastName: string()
    .matches(/^[a-zA-Z]+$/, "Last name must contain only letters")
    .required("Last name is required"),
  email: string().email("Invalid email").required("Email is required"),
  password: string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      "Your password must contain at least one number and one uppercase and lowercase letter, one special character and at least 8 or more characters"
    )
    .required("Password is required"),
  passwordConfirm: string()
    .oneOf([ref("password")], "Passwords must match")
    .required("Password confirm is required"),
});

export default function Register() {
  const router = useRouter();
  const params = useSearchParams();
  const { getFirebaseAuth } = useFirebaseAuth();
  const redirect = params.get("redirect");

  const [formData, setFormData] = React.useState<UserRegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  } as UserRegisterFormData);

  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const [firebaseAuthError, setFirebaseAuthError] = React.useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [registerWithEmailAndPassword, isRegisterLoading] = useLoadingCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const auth = getFirebaseAuth();
      const email = (event.target as HTMLFormElement).email.value;
      const password = (event.target as HTMLFormElement).password.value;

      try {
        await userRegistrationValidationSchema.validate(formData, {
          abortEarly: false,
        });

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, {
          displayName:
            (event.target as HTMLFormElement).firstName.value +
            " " +
            (event.target as HTMLFormElement).lastName.value,
        });
        await sendEmailVerification(userCredential.user);
        const idTokenResult = await userCredential.user.getIdTokenResult();
        await fetch("/api/login", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idTokenResult.token}`,
          },
        });

        router.push(redirect ?? "/dashboard");
      } catch (err) {
        if (err instanceof ValidationError) {
          const newErrors: { [key: string]: string } = {};
          err.inner.forEach((validationErr) => {
            if (validationErr.path) {
              newErrors[validationErr.path] = validationErr.message;
            }
          });
          setErrors(newErrors);
          setTimeout(() => {
            setErrors({});
          }, 3000);
        }

        if (err instanceof FirebaseError) {
          switch (err.code) {
            case "auth/email-already-in-use":
              setFirebaseAuthError("Email already in use!");
              break;
            case "auth/invalid-email":
              setFirebaseAuthError("Invalid email!");
              break;
            case "auth/weak-password":
              setFirebaseAuthError("Weak password!");
              break;
            default:
              setFirebaseAuthError(
                "An error occurred while trying to register your account: " +
                  err.code
              );
              break;
          }
          setTimeout(() => {
            setFirebaseAuthError("");
          }, 3000);
        }
      }
    }
  );

  const [handleLoginWithGoogle, isGoogleLoginLoading, googleLoginError] =
    useLoadingCallback(async () => {
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
        router.push(redirect ?? "/dashboard");
      } catch (error) {
        googleLoginError(error);
      }
    });

  const [handleLoginWithGithub, isGithubLoginLoading] = useLoadingCallback(
    async () => {
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

  function getLoginUrl() {
    if (redirect) {
      return `/auth/login?redirect=${redirect}`;
    }
    return "/auth/login";
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerWithEmailAndPassword(event);
  }

  return (
    <div className="hero min-h-screen bg-base-200 max-h-7/8 flex flex-col pb-20">
      <Link href="/">
        <Image
          className="mx-auto md:my-12 dark:hidden"
          src="/logo_dark.svg"
          alt={process.env.NEXT_PUBLIC_SITE_NAME||"5lnk - URL Shortener"}
          loading="lazy"
          width={120}
          height={120}
        />
        <Image
          className="mx-auto md:my-12 hidden dark:block"
          src="/logo.svg"
          alt={process.env.NEXT_PUBLIC_SITE_NAME||"5lnk - URL Shortener"}
          loading="lazy"
          width={120}
          height={120}
        />
      </Link>
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Create your account!</h1>
          <p className="py-6">
            Create a free account to manage your links and view your links
            stats!
          </p>
        </div>
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                name="firstName"
                type="text"
                placeholder="first name"
                className="input input-bordered"
                required={true}
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <span className="label-text-alt alert bg-red-800 text-white">
                  {errors.firstName}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                name="lastName"
                type="text"
                placeholder="last name"
                className="input input-bordered"
                required={true}
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <span className="label-text-alt alert bg-red-800 text-white">
                  {errors.lastName}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="email"
                className="input input-bordered"
                required={true}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className="label-text-alt alert bg-red-800 text-white">
                  {errors.email}
                </span>
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
                required={true}
                title="Must contain at least one number and one uppercase and lowercase letter, one special character and at least 8 or more characters"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="label-text-alt alert bg-red-800 text-white">
                  {errors.password}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Repeat your password</span>
              </label>
              <input
                name="passwordConfirm"
                type="password"
                placeholder="password"
                className="input input-bordered"
                required={true}
                title="Must contain at least one number and one uppercase and lowercase letter, one special character and at least 8 or more characters"
                value={formData.passwordConfirm}
                onChange={handleChange}
              />
              {errors.passwordConfirm && (
                <span className="label-text-alt alert bg-red-800 text-white">
                  {errors.passwordConfirm}
                </span>
              )}
            </div>
            {firebaseAuthError && (
              <div className="alert alert-error sm">{firebaseAuthError}</div>
            )}
            <div className="form-control mt-6">
              {isGithubLoginLoading ||
              isGoogleLoginLoading ||
              isRegisterLoading ? (
                <div className="flex flex-col text-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      isGithubLoginLoading ||
                      isGoogleLoginLoading ||
                      isRegisterLoading
                    }
                  >
                    <div
                      className="loading loading-spinner loading-lg"
                      title="Register a new account"
                    ></div>
                  </button>
                  <a
                    href={getLoginUrl()}
                    className="label-text-alt link link-hover mt-4"
                    title="Login to your account!"
                  >
                    Already have an account? Login!
                  </a>
                  <div className="my-2">or</div>
                </div>
              ) : (
                <div className="flex flex-col text-center">
                  <button type="submit" className="btn btn-primary">
                    Create account
                  </button>
                  <a
                    href={getLoginUrl()}
                    className="label-text-alt link link-hover mt-4"
                    title="Login to your account!"
                  >
                    Already have an account? Login!
                  </a>
                  <div className="my-2">or</div>
                </div>
              )}
              {/* Social Login buttons */}
              <div className="grid grid-flow-row gap-3">
                <button
                  className="btn btn-primary text-center"
                  disabled={
                    isGithubLoginLoading ||
                    isGoogleLoginLoading ||
                    isRegisterLoading
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
                  <span>Continue with Google</span>
                </button>
                <button
                  className="btn btn-primary text-center"
                  disabled={
                    isGithubLoginLoading ||
                    isGoogleLoginLoading ||
                    isRegisterLoading
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
                  <span>Continue with GitHub</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <BackTo title="Home" route="/"/>
    </div>
  );
}
