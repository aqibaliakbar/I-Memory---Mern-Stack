import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export const ReCaptchaWrapper = ({ children }) => (
  <GoogleReCaptchaProvider
    reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
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
