import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export const ReCaptchaWrapper = ({ children }) => (
  <GoogleReCaptchaProvider
    reCaptchaKey={"6Lc_N2QqAAAAALCAfUeIdTCaWLpbULXvme-jqaK8"}
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
