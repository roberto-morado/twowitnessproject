/**
 * Login View
 * Simple brutalist login form
 */

import { AppConfig } from "@config/app.config.ts";
import { CsrfService } from "../services/csrf.service.ts";

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
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <main>
    <div class="container">
      <div class="content-section">
        <h1>Admin Login</h1>
        <p>Enter your credentials to access the dashboard.</p>

        ${error ? `<p style="color: #000; border: 2px solid #000; padding: 10px; margin: 20px 0;"><strong>Error:</strong> ${error}</p>` : ""}

        <form method="POST" action="/login" style="max-width: 400px; margin-top: 40px;">
          ${csrfToken ? CsrfService.generateTokenInput(csrfToken) : ""}

          <div style="margin-bottom: 20px;">
            <label for="username" style="display: block; font-weight: bold; margin-bottom: 5px;">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              required
              autofocus
              style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 18px; font-family: Times, serif;"
            >
          </div>

          <div style="margin-bottom: 20px;">
            <label for="password" style="display: block; font-weight: bold; margin-bottom: 5px;">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              style="width: 100%; padding: 10px; border: 2px solid #000; font-size: 18px; font-family: Times, serif;"
            >
          </div>

          <button type="submit" class="btn" style="width: 100%;">
            Login
          </button>
        </form>

        <p style="margin-top: 40px;">
          <a href="/">← Back to Website</a>
        </p>
      </div>
    </div>
  </main>
</body>
</html>`;
}
