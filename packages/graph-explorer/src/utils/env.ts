export const env = {
  DEV: process.env.NODE_ENV !== "production",
  PROD: process.env.NODE_ENV === "production",
  MODE: process.env.NODE_ENV,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "",
  NEXT_PUBLIC_FEEDBACK_URL: process.env.NEXT_PUBLIC_FEEDBACK_URL,
  VERSION: process.env.version,
};
