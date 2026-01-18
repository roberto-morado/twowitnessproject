export function renderLogin(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="container">
    <div class="login-box">
      <h1>Admin Login</h1>
      ${error ? `<div class="error">${error}</div>` : ""}
      <form method="POST" action="/admin/login">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" required autofocus>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Login</button>
      </form>
      <a href="/" class="back-link">← Back to home</a>
    </div>
  </div>
</body>
</html>`;
}
