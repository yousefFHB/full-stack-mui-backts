import dotenv from "dotenv";

dotenv.config();

export interface EnvConfig {
  port: number;
  databaseUrl: string;
  secretKey: string;
  smsKey: string;
  whatsappApiKey: string;
  whatsappToken: string;
  nodeEnv: "development" | "production" | "test";
}

export const env: EnvConfig = {
  port: Number(process.env.PORT) || 5000,
  databaseUrl: process.env.DATA_BASE || "",
  secretKey: process.env.SECRET_KEY || "",
  smsKey: process.env.SMS_KEY || "",
  whatsappApiKey: process.env.WHATSAPP_API_KEY || "",
  whatsappToken: process.env.WHATSAPP_TOKEN || "",
  nodeEnv: (process.env.NODE_ENV as EnvConfig["nodeEnv"]) || "development",
};

export default env;
