"use client";

import React, { useEffect, useState } from "react";
//@ts-ignore due to TypeScript error when using useFormState #56041
import { experimental_useFormState as useFormState } from "react-dom";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { sendContactMsg } from "@/lib/actions/sendContactMsgAction";
import GoogleRecaptchaWrapper from "@components/GoogleRecaptchaWrapper";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

const initialState = {
  message: null,
  success: false,
  validation: {
    name: "",
    email: "",
    message: "",
  },
};

let recaptchaToken: string | undefined;

export default function Contact() {
  return (
    <GoogleRecaptchaWrapper>
      <Form />
    </GoogleRecaptchaWrapper>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  setTimeout(() => {
  }, 1000);
  const { executeRecaptcha } = useGoogleReCaptcha();
  executeRecaptcha?.().then((token) => {
    recaptchaToken = token;
  });

  return (
    <button
      type="submit"
      disabled={pending || !executeRecaptcha}
      className="btn btn-primary"
    >
      {pending ? (
        <div
          className="loading loading-spinner loading-lg"
          title="Sending message..."
        ></div>
      ) : (
        "Send Message"
      )}
    </button>
  );
}

function Form() {
  const [state, formActions] = useFormState(sendContactMsg, initialState);
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    message: "",
  } as ContactFormData);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setContactFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (state.success) {
      setContactFormData({
        name: "",
        email: "",
        message: "",
      });
    }
  }, [state.success]);

  return (
    <div className="hero min-h-5/8 sm:min-h-7/8 bg-base-200 max-h-screen flex flex-col py-20">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Geting in touch</h1>
          <p className="py-6">
            If you have any concerns or comments, need some help, please, fill
            the our contact form and we will reach you as soon as possible.
          </p>
        </div>
        <div className="card flex-shrink-0 w-3/4 max-w-xl shadow-2xl bg-base-200">
          <form className="card-body" action={formActions}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Your name</span>
              </label>
              <input
                name="name"
                type="string"
                placeholder="Your name"
                className="input input-bordered"
                value={contactFormData.name}
                required={true}
                onChange={handleFormChange}
              />
              {state.validation.name && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {state.validation.name}
                  </span>
                </label>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Your email</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="Your email"
                className="input input-bordered"
                value={contactFormData.email}
                required={true}
                onChange={handleFormChange}
              />
              {state.validation?.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {initialState?.validation.email}
                  </span>
                </label>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Your message</span>
              </label>
              <textarea
                name="message"
                type="text"
                id="message"
                rows={4}
                placeholder="Type your message"
                className="input input-bordered h-36 w-full"
                value={contactFormData.message}
                required={true}
                //@ts-ignore
                onChange={handleFormChange}
              />
              {state.validation.message && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {state.validation.message}
                  </span>
                </label>
              )}
            </div>
            <div className="form-control mt-2">
              <input
                name="recaptcha-token"
                type="string"
                placeholder="Recaptcha token"
                className="sr-only"
                readOnly={true}
                value={recaptchaToken ?? ""}
                required={true}
              />
              <SubmitButton />
            </div>
            { state.success && state.message ? (
              <label className="label">
                <span className="label-text-alt text-success">
                  {state.message}
                </span>
              </label>
            ) : (
              <label className="label">
                <span className="label-text-alt text-error">
                  {state.message}
                </span>
              </label>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
