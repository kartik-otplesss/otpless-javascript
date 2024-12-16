//OTPLess Helper Script to initialise the SDK

let OTPlessSignin = null;
async function OTPlessSdk() {
  return new Promise(async (resolve) => {
    if (document.getElementById("otpless-sdk") && OTPlessSignin)
      return resolve();

    // Loading the script if it's not already loaded

    const script = document.createElement("script");
    script.src = "https://otpless.com/v4/headless.js";
    script.id = "otpless-sdk";

    // Get your app id from https://otpless.com/dashboard/customer/dev-settings

    script.setAttribute("data-appid", "Your_App_id");

    // Initializing the OTPless SDK when the script loads with the callback function

    script.onload = function () {
      const OTPless = Reflect.get(window, "OTPless");
      OTPlessSignin = new OTPless(callback);
      resolve();
    };
    document.head.appendChild(script);
  });
}

async function hitOTPlessSdk(params) {
  await OTPlessSdk();

  const { requestType, request } = params;

  return await OTPlessSignin[requestType](request);
}

//OTPLess Main Script to initiate the authentication

/**  Otpless callback function
 * @description
 * This function is called after authentication is done, by otpless-sdk.
 * Use this function to further process the otplessUser object, navigate to next page or perform any other action based on your requirement.
 * @param {Object} eventCallback
 * @returns {void}
 */
const callback = (eventCallback) => {
  console.log({ eventCallback });

  const ONETAP = () => {
    const { response } = eventCallback;

    console.log({ response, token: response.token });

    // Replace the following code with your own logic
    console.log(response);
    alert(JSON.stringify(response));
    location.reload();
  };

  const OTP_AUTO_READ = () => {
    const {
      response: { otp },
    } = eventCallback;

    // YOUR OTP FLOW

    const otpInput = document.getElementById("otp-input");

    otpInput.value = otp;
  };

  const FAILED = () => {
    const { response } = eventCallback;

    console.log({ response });
  };

  const FALLBACK_TRIGGERED = () => {
    const { response } = eventCallback;
  };

  const EVENTS_MAP = {
    ONETAP,
    OTP_AUTO_READ,
    FAILED,
    FALLBACK_TRIGGERED,
  };

  if ("responseType" in eventCallback) EVENTS_MAP[eventCallback.responseType]();
};

/**
 * Authenticates the user using any authentication method available.
 * Email / Phone, OTP / Magic Link / Social Authentications
 * @param {Object} params - The parameters for primary authentication.
 * for social authentication use 'channel': 'OAUTH' and 'channelType' (eg. 'GOOGLE', 'WHATSAPP', 'GITHUB', etc)
 * for otp/magic link via email use 'channel': 'EMAIL' and 'email'
 * for otp/magic link via phone use 'channel': 'PHONE', 'phone' and 'countryCode'(optional)
 * @TODO activate your chosen authentication method from otpless Dashboard(https://otpless.com/dashboard/customer/channels) before executing this function
 * */

async function initiate() {
  const phoneNumber = inputMobile.value;

  const request = {
    channel: "PHONE",
    phone: phoneNumber,
    countryCode: "+91",
    deliveryChannel: "WHATSAPP", //Headless request can be customized with custom Delivery Channel like 'WHATSAPP','SMS' and 'VIBER'
    otpLength: 6, // Headless request can be customized with custom OTP length 4 or 6.
    expiry: "60", //Headless request can be customized with custom expiry.
  };
  const initiate = await hitOTPlessSdk({
    requestType: "initiate",
    request,
  });
  console.log({ initiate });
}

async function oauth(channelType) {
  const initiate = await hitOTPlessSdk({
    requestType: "initiate",
    request: {
      channel: "OAUTH",
      channelType,
    },
  });

  console.log({ initiate });
}

/**
 * Verifies the OTP (One-Time Password) for the given authentication channel.
 *
 * @param {Object} params - The parameters for verifying the OTP.
 * @param {string} [channel='PHONE'] - The authentication channel (default: 'PHONE').
 * @param {string} otp - The OTP to be verified.
 * @param {string} [countryCode='+91'] - The country code for the user's phone number (default: '+91').
 * @param {string} phone - The user's phone number.
 * @param {string} email - The user's email address.
 */

async function verify() {
  const phone = inputMobile.value;
  const otp = otpInput.value;

  const verify = await hitOTPlessSdk({
    requestType: "verify",
    request: {
      channel: "PHONE",
      phone: phone,
      otp: otp,
      countryCode: "+91",
    },
  });

  console.log({ verify });
}

OTPlessSdk();
