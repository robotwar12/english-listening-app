import withPWA from "next-pwa";
import { PWAConfig } from "next-pwa";


const pwaConfig: PWAConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
};

export default withPWA(pwaConfig);