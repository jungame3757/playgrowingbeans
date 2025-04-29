import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { eslintrc } from "@eslint/eslintrc";
import nextPlugin from "eslint-config-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals")];

const { config } = new eslintrc.ConfigArray().combine(nextPlugin);

export default [
  ...eslintConfig,
  ...config,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];
