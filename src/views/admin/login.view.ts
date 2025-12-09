/**
 * Login View
 * Simple brutalist login form
 */

import { AppConfig } from "@config/app.config.ts";
import { CsrfService } from "../../services/csrf.service.ts";

export interface LoginViewData {
  error?: string;
  csrfToken?: string;
}

export function renderLogin(data: LoginViewData = {}): string {
  const { error, csrfToken } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - ${AppConfig.ministry.name}</title>
</head>
<body>
  <main>
    <h1>Admin Login</h1>
    <p>Enter your credentials to access the dashboard.</p>

    ${error ? `<details open><summary>Error</summary><p>${error}</p></details>` : ""}

    <form method="POST" action="/login">
      ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

      <fieldset>
        <legend>Login Credentials</legend>

        <p>
          <label for="username"><strong>Username:</strong></label>
          <input
            type="text"
            id="username"
            name="username"
            required
            autofocus
          >
        </p>

        <p>
          <label for="password"><strong>Password:</strong></label>
          <input
            type="password"
            id="password"
            name="password"
            required
          >
        </p>

        <button type="submit">
          Login
        </button>
      </fieldset>
    </form>

    <p>
      <a href="/">← Back to Website</a>
    </p>
  </main>
</body>
</html>`;
}
