"use client";

import React, { Suspense, useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import {
  updatePassword,
  updateEmail,
  updateProfile,
  deleteUser,
  sendEmailVerification,
} from "firebase/auth";
import Image from "next/image";
import { lazy, ValidationError, object, ref, string } from "yup";
import { useAuth } from "@/auth/context";
import { useFirebaseAuth } from "@/auth/firebase";
import {
  getGoogleProvider,
  getGithubProvider,
  linkWithProvider,
} from "@/app/auth/login/firebase";
import { useTokens } from "@/lib/hooks/useTokens";

declare global {
  interface Window {
    delete_modal: any;
  }
}

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface APIFormProps {
  apiToken?: string;
  userId: string;
}

let profileFormValidationSchema = object({
  firstName: string()
    .matches(/(^[a-zA-Z])/, "First name must contain only letters")
    .required("First name is required"),
  lastName: string()
    .matches(/^[a-zA-Z]+$/, "Last name must contain only letters")
    .required("Last name is required"),
  email: string().email("Invalid email").required("Email is required"),
  password: lazy((value, confirmPassword) => {
    if (confirmPassword.value !== "" && value) {
      return string()
        .matches(
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
          "Your password must contain at least one number and one uppercase and lowercase letter, one special character and at least 8 or more characters"
        )
        .required("Password is required");
    }
    return string().notRequired();
  }),
  confirmPassword: lazy((value, password) => {
    if (password.parent.password !== "") {
      return string()
        .oneOf([ref("password")], "Passwords must match")
        .required("Confirm password is required");
    }
    if (password.value !== value) {
      return string().oneOf([ref("password")], "Passwords must match");
    }
    return string().notRequired();
  }),
});

export default function ProfileForm() {
  const { getFirebaseAuth } = useFirebaseAuth();
  const auth = getFirebaseAuth();
  const { user } = useAuth();
  const [profileFormData, setProfileFormData] = useState<ProfileFormProps>({
    firstName: user?.displayName?.split(" ")[0] || "",
    lastName: user?.displayName?.split(" ")[1] || "",
    email: user?.email || "",
    password: "",
    confirmPassword: "",
  } as ProfileFormProps);
  const [apiFormData, setApiFormData] = useState<APIFormProps>({
    userId: user?.uid || "",
    apiToken: "",
  } as APIFormProps);
  const [apiToken, setApiToken] = useState<string>("");
  const [apiTokenIsCopied, setApiTokenIsCopied] = useState<boolean>(false);
  const [dataIsEdited, setDataIsEdited] = useState<boolean>(false);
  const [isProviderLoading, setIsProviderLoading] = useState<boolean>(true);
  const [isGoogleLinked, setIsGoogleLinked] = useState<boolean>(false);
  const [isGithubLinked, setIsGithubLinked] = useState<boolean>(false);

  const [profileFormSuccessMsg, setProfileFormSuccessMsg] = useState<{
    [key: string]: string;
  }>({});

  const [profileFormErrors, setProfileFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const [socialLinkingSuccessMsg, setSocialLinkingSuccessMsg] = useState<{
    [key: string]: string;
  }>({});

  const [socialLinkingErrors, setSocialLinkingErrors] = useState<{
    [key: string]: string;
  }>({});

  const [firebaseError, setFirebaseError] = useState<string>("");
  const [tokenError, setTokenError] = useState<string>("");
  const [deleteAccountError, setDeleteAccountError] = useState<string>("");

  const handleProfileDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setDataIsEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      profileFormValidationSchema.validateSync(profileFormData, {
        abortEarly: false,
      });
      if (profileFormData.email !== user?.email) {
        await updateEmail(auth.currentUser!, profileFormData.email);
        await sendEmailVerification(auth.currentUser!);
        setProfileFormSuccessMsg(() => ({
          ...profileFormSuccessMsg,
          email:
            "Email changed. A verification email has been sent to your new email",
        }));
      }
      if (profileFormData.password !== "") {
        await updatePassword(auth.currentUser!, profileFormData.password);
        setProfileFormSuccessMsg(() => ({
          ...profileFormSuccessMsg,
          password: "Password changed",
        }));
      }
      if (
        profileFormData.firstName !== user?.displayName?.split(" ")[0] ||
        profileFormData.lastName !== user?.displayName?.split(" ")[1]
      ) {
        await updateProfile(auth.currentUser!, {
          displayName: `${profileFormData.firstName} ${profileFormData.lastName}`,
        });
        setProfileFormSuccessMsg(() => ({
          ...profileFormSuccessMsg,
          name: "Name changed",
        }));
      }
      setProfileFormErrors({});
    } catch (err) {
      if (err instanceof ValidationError) {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((validationErr) => {
          if (validationErr.path) {
            newErrors[validationErr.path] = validationErr.message;
          }
        });
        setProfileFormErrors(newErrors);
        setTimeout(() => {
          setProfileFormErrors({});
        }, 3000);
      }
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/email-already-in-use":
          case "auth/invalid-email":
            setFirebaseError("Email is already in use or is invalid");
            break;
          case "auth/weak-password":
            setFirebaseError("Password is too weak");
            break;
          default:
            setFirebaseError("An error occured while updating your profile");
        }
        setTimeout(() => {
          setFirebaseError("");
        }, 3000);
      }
    }
  };

  const handleLinkWithGithub = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      const provider = getGithubProvider(auth);
      await linkWithProvider(auth, provider);
      setIsGithubLinked(true);
      setSocialLinkingSuccessMsg(() => ({
        ...socialLinkingSuccessMsg,
        github: "Your account has been linked with GitHub",
      }));
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/credential-already-in-use":
            setSocialLinkingErrors(() => ({
              ...socialLinkingErrors,
              github: "This account is already linked with another account",
            }));
            break;
          default:
            setSocialLinkingErrors(() => ({
              ...socialLinkingErrors,
              github: "An error occured while linking your account",
            }));
        }
      }
    }
  };

  const handleLinkWithGoogle = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      const provider = getGoogleProvider(auth);
      await linkWithProvider(auth, provider);
      setIsGoogleLinked(true);
      setSocialLinkingSuccessMsg(() => ({
        ...socialLinkingSuccessMsg,
        google: "Your account has been linked with Google",
      }));
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/credential-already-in-use":
            setSocialLinkingErrors(() => ({
              ...socialLinkingErrors,
              google: "This account is already linked with another account",
            }));
            break;
          default:
            setSocialLinkingErrors(() => ({
              ...socialLinkingErrors,
              google: "An error occured while linking your account",
            }));
        }
      }
    }
  };

  const handleDeleteAccount = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    try {
      await deleteUser(auth.currentUser!);
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      window.location.href = "/";
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/requires-recent-login":
            setDeleteAccountError(
              "This action is sensitive and requires recent authentication. Log in again before retrying this request."
            );
            document.getElementById("cancel-btn")?.click();
            break;
          default:
            setDeleteAccountError(
              "An error occured while deleting your account. Please, try again later"
            );
            break;
        }
      }
    }
  };

  const handleGenerateToken = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: apiFormData.userId,
        }),
      });

      const data = await response.json();
      setApiToken(data);
    } catch (err) {
      if (err instanceof Error) {
        setTokenError(
          "An error occured while generating your token: " + err.message
        );
      }
    }
  };

  const handleCopyToken = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await navigator.clipboard.writeText(apiToken);
    setApiTokenIsCopied(true);
  };

  useEffect(() => {
    useTokens(setTokenError, setApiToken);
    auth.authStateReady().then(() => auth.currentUser?.providerData).then((data) => {
      if (data) {
        data.forEach((provider) => {
          if (provider.providerId === "github.com") {
            setIsGithubLinked(true);
          }
          if (provider.providerId === "google.com") {
            setIsGoogleLinked(true);
          }
        });
      }
      setIsProviderLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full pt-8">
      <div className="my-6 hero max-h-7/8">
        <div className="card flex-shrink-0 w-full max-w-2xl shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="pb-6">
              <h2 className="text-base font-semibold leading-7 text-white-900">
                Update your profile
              </h2>
              <p className="my-4 text-sm leading-6 ">
                Update your profile information. This information will not be
                shared publicly.
              </p>
              <div className="form-control">
                <label
                  htmlFor="firstName"
                  className="label-text font-medium leading-6 "
                >
                  First name
                </label>
                <div className="my-2">
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    autoComplete="given-name"
                    value={profileFormData.firstName}
                    onChange={handleProfileDataChange}
                    className="input input-bordered w-full"
                  />
                  {profileFormErrors.firstName && (
                    <span className="label-text-alt alert bg-red-800 text-white">
                      {profileFormErrors.firstName}
                    </span>
                  )}
                  {profileFormSuccessMsg.name && (
                    <span className="label-text-alt alert bg-green-800 text-white">
                      {profileFormSuccessMsg.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-control">
                <label
                  htmlFor="lastName"
                  className="label-text font-medium leading-6"
                >
                  Last name
                </label>
                <div className="my-2">
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    autoComplete="family-name"
                    value={profileFormData.lastName}
                    onChange={handleProfileDataChange}
                    className="input input-bordered w-full"
                  />
                  {profileFormErrors.lastName && (
                    <span className="label-text-alt alert bg-red-800 text-white">
                      {profileFormErrors.lastName}
                    </span>
                  )}
                  {profileFormSuccessMsg.name && (
                    <span className="label-text-alt alert bg-green-800 text-white">
                      {profileFormSuccessMsg.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-control">
                <label
                  htmlFor="email"
                  className="label-text font-medium leading-6"
                >
                  Email
                </label>
                <div className="my-2">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    value={profileFormData.email}
                    onChange={handleProfileDataChange}
                    className="input input-bordered w-full"
                  />
                  {profileFormErrors.email && (
                    <span className="label-text-alt alert bg-red-800 text-white">
                      {profileFormErrors.email}
                    </span>
                  )}
                  {profileFormSuccessMsg.email && (
                    <span className="label-text-alt alert bg-green-800 text-white">
                      {profileFormSuccessMsg.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-control">
                <label
                  htmlFor="password"
                  className="label-text font-medium leading-6"
                >
                  New password
                </label>
                <div className="my-2">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={profileFormData.password}
                    onChange={handleProfileDataChange}
                    className="input input-bordered w-full"
                  />
                  {profileFormErrors.password && (
                    <span className="label-text-alt alert bg-red-800 text-white">
                      {profileFormErrors.password}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-control">
                <label
                  htmlFor="confirmPassword"
                  className="label-text font-medium leading-6"
                >
                  Confirm password
                </label>
                <div className="my-2">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={profileFormData.confirmPassword}
                    onChange={handleProfileDataChange}
                    className="input input-bordered w-full"
                  />
                  {profileFormErrors.confirmPassword && (
                    <span className="label-text-alt alert bg-red-800 text-white">
                      {profileFormErrors.confirmPassword}
                    </span>
                  )}
                  {profileFormSuccessMsg.password && (
                    <span className="label-text-alt alert bg-green-800 text-white">
                      {profileFormSuccessMsg.password}
                    </span>
                  )}
                </div>
              </div>
              <div className="form-control mt-4">
                <button className="btn btn-primary" disabled={!dataIsEdited}>
                  Update profile
                </button>
              </div>
              {firebaseError && (
                <span className="mt-4 label-text-alt alert bg-red-800 text-white">
                  {firebaseError}
                </span>
              )}
            </div>
            <div className="divider"></div>
            {/* Social Account Linking */}
            <div className="form-control">
              <h2 className="text-base font-semibold leading-7 text-white-900">
                Link your social accounts
              </h2>
              <p className="my-4 text-sm leading-6">
                Link your social accounts to login with them. You can link your
                GitHub or Google account.
              </p>
              <Suspense fallback={<div>Loading...</div>}>
                <div className="grid grid-flow-row gap-3">
                  <button
                    className="btn btn-primary text-center"
                    disabled={isGithubLinked || isProviderLoading}
                    onClick={handleLinkWithGithub}
                  >
                    <Image
                      className="w-6 h-6"
                      src="https://www.svgrepo.com/show/512317/github-142.svg"
                      loading="lazy"
                      alt="GitHub logo"
                      width={6}
                      height={6}
                    />
                    <span>Link with GitHub</span>
                  </button>
                  {socialLinkingErrors.github && (
                    <span className="label-text-alt alert bg-red-800 text-white">
                      {socialLinkingErrors.github}
                    </span>
                  )}
                  {socialLinkingSuccessMsg.github && (
                    <span className="label-text-alt alert bg-green-800 text-white">
                      {socialLinkingSuccessMsg.github}
                    </span>
                  )}
                  <button
                    className="btn btn-primary text-center"
                    disabled={isGoogleLinked || isProviderLoading}
                    onClick={handleLinkWithGoogle}
                  >
                    <Image
                      className="w-6 h-6"
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      loading="lazy"
                      alt="google logo"
                      width={6}
                      height={6}
                    />
                    <span>Link with Google</span>
                  </button>
                  {socialLinkingErrors.google && (
                    <span className="label-text-alt alert bg-red-800 text-white">
                      {socialLinkingErrors.google}
                    </span>
                  )}
                  {socialLinkingSuccessMsg.google && (
                    <span className="label-text-alt alert bg-green-800 text-white">
                      {socialLinkingSuccessMsg.google}
                    </span>
                  )}
                </div>
              </Suspense>
            </div>
          </form>
        </div>
      </div>
      <div className="my-6 hero max-h-7/8" id="settings">
        <div className="card flex-shrink-0 w-full max-w-2xl shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleGenerateToken}>
            <div className="pb-8">
              <h2 className="text-base font-semibold leading-7 text-white-900">
                API Token
              </h2>
              <p className="my-4 text-sm leading-6 ">
                Generate or update your API token. To know more about our REST
                API works <a href="/pages/api">click here</a>
              </p>
              <p className="my-2 text-xs leading-6 italic dark:text-warning">
                Remember: When you generate a new API Token if you already have
                one it's revoked automatically
              </p>
              <div className="form-control">
                <label
                  htmlFor="api-token"
                  className="label-text font-medium leading-6"
                >
                  API Token
                </label>
                <div className="my-2 flex flex-row justify-center text-center align-middle content-center">
                  <input
                    type="text"
                    name="api-token"
                    id="api-token"
                    value={apiToken}
                    disabled={true}
                    className="input input-bordered w-full"
                  />
                  <button
                    className="btn btn-primary ml-2"
                    id="copy-api-token"
                    disabled={
                      apiToken === "" ||
                      apiTokenIsCopied ||
                      apiToken.charAt(8) === "*"
                    }
                    onClick={handleCopyToken}
                  >
                    Copy
                  </button>
                </div>
                {apiTokenIsCopied && (
                  <div>
                    <label className="label">
                      <span className="label-text-alt italic dark:text-warning">
                        This API Token will not be shown again. Please, save it
                        in a secure place.
                      </span>
                    </label>
                    <div className="alert alert-success">
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Your API Token has been copied!</span>
                    </div>
                  </div>
                )}
                {tokenError && (
                  <span className="label-text-alt alert bg-red-800 text-white">
                    {tokenError}
                  </span>
                )}
              </div>
              <div className="form-control mt-8">
                <button className="btn btn-primary">Generate new token</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="my-6 hero max-h-7/8" id="account-exclusion">
        <div className="card flex-shrink-0 w-full max-w-2xl shadow-2xl bg-base-100">
          <div className="card-body">
            <div className="pb-6">
              <h2 className="text-base font-semibold leading-7 text-white-900">
                Account Exclusion
              </h2>
              <p className="my-4 text-sm leading-6 ">
                If you want to delete your account, click the button below. This
                action is irreversible.
              </p>
              <p className="my-2 text-xs leading-6 italic dark:text-warning">
                Remember: All data linked to your account will be deleted
                imeadiately. Again, this action is irreversible!
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm hover:bg-red-500 hover:text-white"
              title="The exclusion of you account will erase all your data"
              onClick={() => window.delete_modal.showModal()}
            >
              Delete my account
            </button>
            {deleteAccountError && (
              <span className="label-text-alt alert bg-red-500 text-white">
                {deleteAccountError}
              </span>
            )}
            {/* Dialog to confirm delete account! */}
            <dialog id="delete_modal" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Are you sure?</h3>
                <p className="py-4">
                  This action will delete your account and all your data. This
                  action is irreversible.
                </p>
                <div className="modal-action">
                  <button
                    className="btn btn-error"
                    onClick={handleDeleteAccount}
                  >
                    Yes, delete
                  </button>
                  <form method="dialog" className="btn">
                    <button className="btn" id="cancel-btn">
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button>X</button>
              </form>
            </dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
