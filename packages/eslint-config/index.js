module.exports = {
  extends: [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    node: true,
    es6: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-console": "warn",
    "react/prop-types": "off"
  },
  overrides: [
    {
      files: ["**/*.tsx", "**/*.ts"],
      rules: {
        "react/prop-types": "off"
      }
    }
  ]
};