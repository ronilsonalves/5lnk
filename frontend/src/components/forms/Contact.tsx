"use client";

import React, { useState } from "react";
import { experimental_useFormState as useFormState } from "react-dom";
import { experimental_useFormStatus as useFormStatus } from "react-dom";
import { sendContactMsg } from "@/lib/actions/sendContactMsgAction";

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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn btn-primary">
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

export default function Contact() {
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
              <SubmitButton />
            </div>
            <span className="text-center text-sm text-gray-200">
              {state?.message}
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}
