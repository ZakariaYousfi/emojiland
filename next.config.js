// actually the error was a validation error because we had a env variable (db sqlite), we had to include it in vercel because there is a check done (check src/env.js) that checks wether or not we included the envs that we have in the vercel env variables. 

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  /* i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },*/
};

export default config;
