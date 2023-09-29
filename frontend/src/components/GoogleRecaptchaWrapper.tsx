"use client";

import React from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function GoogleRecaptchaWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const recaptchaKey: string | undefined =
    process.env.NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY;

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaKey ?? "NOT_SET"}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
