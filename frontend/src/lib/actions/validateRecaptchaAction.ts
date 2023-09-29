"use server";

export async function validateRecaptchaAction(recaptchaToken: string) {
  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.NEXT_RECAPTCHA_KEY}&response=${recaptchaToken}`,
    }
  );

  const data = await response.json();
  return data.success && data.score > 0.6;
};