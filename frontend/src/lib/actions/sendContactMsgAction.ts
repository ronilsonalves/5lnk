"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { Resend } from "resend";
import { ValidationError, object, string } from "yup";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

interface ContactFormData {
  firstName: string;
  email: string;
  message: string;
}

let contactValidationSchema = object({
  name: string()
    .matches(/^[A-Za-z ]+$/, "Your name must contain only letters")
    .required("Your name is required"),
  email: string().email("Invalid email").required("Your email is required"),
  message: string().required("Please, write your message."),
});

export async function sendContactMsg(prevState: any, formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  try {
    await contactValidationSchema.validate({
        name: name,
        email: email,
        message: message,
    }, {
      abortEarly: false,
    });
    //Sending email to the user who submitted the form
    resend.emails.send({
      from: process.env.NEXT_PUBLIC_MAIL_FROM!,
      //@ts-ignore
      to: email,
      subject: "Thank you for contacting us",
      html: `<p>Thank you for contacting us. We will get back to you as soon as possible.</p></br><p>Regards,</p><p>Team ${process.env.NEXT_PUBLIC_SITE_NAME}</p>`,
    });

    // Sending email to the admin
    resend.emails.send({
      from: process.env.NEXT_PUBLIC_MAIL_FROM!,
      // @ts-ignore
      reply_to: email,
      to: process.env.NEXT_PUBLIC_MAIL_TO!,
      subject: "New contact message",
      html: `<p>You have received a new contact message from ${name}.</p></br><p>Message: ${message}</p>`,
    });

    revalidatePath("/pages/contact", "page");
    return {
      message: `${name}, thank you for contacting us. We will get back to you as soon as possible.`,
      success: true,
      validation: {},
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      const newErrors: { [key: string]: string } = {};
      error.inner.forEach((validationErr) => {
        if (validationErr.path) {
          newErrors[validationErr.path] = validationErr.message;
        };
      });
      return {
        message: `Sorry, we could not send your message. Please check the fields and try again later.`,
        success: false,
        validation: newErrors,
      };
    }
    if (error instanceof Error) {
      return {
        message: `Sorry ${name}, we could not send your message. Please try again later.`,
        success: false,
        validation: {},
      };
    };
  };
};