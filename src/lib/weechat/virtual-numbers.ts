// Affiliate partner for virtual numbers. Replace the URL once the partner link is issued.
export const SMS_ACTIVATE_SIGNUP = 'https://sms-activate.io/';
export const virtualNumbersAffiliateUrl: string =
  (import.meta.env['VITE_SMS_ACTIVATE_AFFILIATE_URL'] as string | undefined) || SMS_ACTIVATE_SIGNUP;
