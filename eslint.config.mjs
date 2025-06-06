import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Add a new configuration object for your specific rule overrides
  {
    rules: {
      // IMPORTANT: Disable the base ESLint rule as it can conflict
      // 'no-unused-vars' is often part of 'eslint:recommended' which `next/core-web-vitals` might extend
      "no-unused-vars": "off",

      // Configure the TypeScript-specific rule to ignore variables starting with "_"
      "@typescript-eslint/no-unused-vars": [
        "warn", // Or "error" if you want it to fail builds
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];

export default eslintConfig;
