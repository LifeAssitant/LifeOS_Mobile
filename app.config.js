const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const desktopEnvPath = path.resolve(process.cwd(), "../LifeOS_Desktop/.env");
if (fs.existsSync(desktopEnvPath)) {
  dotenv.config({ path: desktopEnvPath });
}
dotenv.config();

const appJson = require("./app.json");
const productionBuild =
  process.env.NODE_ENV === "production" ||
  ["preview", "production"].includes(process.env.EAS_BUILD_PROFILE);
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() || "";

if (productionBuild) {
  let parsedUrl;
  try {
    parsedUrl = new URL(apiUrl);
  } catch {
    throw new Error("Set EXPO_PUBLIC_API_URL to the public LifeOS API URL for production builds.");
  }
  if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname) {
    throw new Error("Production EXPO_PUBLIC_API_URL must be an HTTPS URL.");
  }
}

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      apiUrl,
      productionBuild,
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        appJson.expo.extra?.supabaseUrl ||
        "",
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY ||
        appJson.expo.extra?.supabaseAnonKey ||
        "",
    },
  },
};
