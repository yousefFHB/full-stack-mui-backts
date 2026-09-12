import { env } from "../config/env.js";

export interface LimoSmsResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface SendWhatsAppOptions {
  /**
   * Phone number(s) - 1 to 4 numbers. Can be a single string or array of strings.
   * e.g., ["09108902507"] or "09108902507"
   */
  phoneNumber: string[] | string;
  /**
   * Message text content
   */
  message: string;
  /**
   * Optional token if required by your whatsappsend.ir panel
   */
  token?: string;
  /**
   * Country code without '+' (e.g. "98")
   */
  countryCode?: string;
  /**
   * Mobile number for the quick action/glass call button
   */
  messageCall?: string;
  /**
   * Text label on the call button
   */
  messageCallName?: string;
  /**
   * Web link for the quick action/glass URL button
   */
  messageUrl?: string;
  /**
   * Text label on the URL button
   */
  messageUrlName?: string;
  /**
   * Base64 encoded file string (image/pdf/document)
   */
  base64?: string;
}

export interface WhatsAppApiResponse {
  Result: boolean;
  Response: string;
}

/**
 * Send SMS OTP Code via LimoSMS
 */
export const sendAuthCode = async (Mobile: string): Promise<LimoSmsResponse> => {
  try {
    const apiKey = env.smsKey || process.env.SMS_KEY || "";
    const res = await fetch("https://api.limosms.com/api/sendcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ApiKey: apiKey,
      },
      body: JSON.stringify({
        Mobile,
        Footer: "mui-app-TS",
      }),
    });
    const data = (await res.json()) as LimoSmsResponse;
    return data;
  } catch (_error: unknown) {
    return { success: false, message: "خطا در ارسال کد" };
  }
};

/**
 * Verify SMS OTP Code via LimoSMS
 */
export const verifyCode = async (
  Mobile: string,
  Code: string
): Promise<LimoSmsResponse> => {
  try {
    const apiKey = env.smsKey || process.env.SMS_KEY || "";
    const res = await fetch("https://api.limosms.com/api/checkcode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ApiKey: apiKey,
      },
      body: JSON.stringify({
        Mobile,
        Code,
      }),
    });
    const data = (await res.json()) as LimoSmsResponse;
    return data;
  } catch (_error: unknown) {
    return { success: false, message: "خطا در بررسی کد" };
  }
};

/**
 * Send WhatsApp message via whatsappsend.ir (1 to 4 recipients)
 */
export const sendWhatsAppMessage = async (
  options: SendWhatsAppOptions
): Promise<WhatsAppApiResponse> => {
  try {
    const apiKey =
      env.whatsappApiKey ||
      process.env.WHATSAPP_API_KEY ||
      env.smsKey ||
      process.env.SMS_KEY ||
      "";

    const token =
      options.token ||
      env.whatsappToken ||
      process.env.WHATSAPP_TOKEN ||
      "";

    const phoneNumbers = Array.isArray(options.phoneNumber)
      ? options.phoneNumber
      : [options.phoneNumber];

    const bodyPayload: Record<string, unknown> = {
      PhoneNumber: phoneNumbers,
      Message: options.message,
    };

    if (token) bodyPayload.Token = token;
    if (options.countryCode) bodyPayload.CountryCode = options.countryCode;
    if (options.messageCall) bodyPayload.MessageCall = options.messageCall;
    if (options.messageCallName) bodyPayload.MessageCallName = options.messageCallName;
    if (options.messageUrl) bodyPayload.MessageUrl = options.messageUrl;
    if (options.messageUrlName) bodyPayload.MessageUrlName = options.messageUrlName;
    if (options.base64) bodyPayload.Base64 = options.base64;

    const res = await fetch("https://whatsappsend.ir/api/RestApi/SendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ApiKey: apiKey,
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = (await res.json()) as WhatsAppApiResponse;
    return data;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "خطا در ارسال پیام واتساپ";
    return {
      Result: false,
      Response: errorMessage,
    };
  }
};

// Aliases to preserve compatibility with previous names
export const senAuthCode = sendAuthCode;
export const veifyCode = verifyCode;