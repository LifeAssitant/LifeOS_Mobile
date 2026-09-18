require("dotenv").config();

const appJson = require("./app.json");

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      apiUrl:
        process.env.EXPO_PUBLIC_API_URL ||
        appJson.expo.extra?.apiUrl ||
        "http://localhost:8000/api/v1",
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL ||
        appJson.expo.extra?.supabaseUrl ||
        "",
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        appJson.expo.extra?.supabaseAnonKey ||
        "",
    },
  },
};
