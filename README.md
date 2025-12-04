# Two Witness Project Website

A modern, privacy-focused website for the Two Witness Project ministry - spreading the Gospel across the nation.

## Features

### Public Pages
- 🏠 **Home Page**: Introduction to the ministry with key features
- 📖 **About Page**: Detailed information about the mission and story
- 🎥 **Videos Page**: Hub for all social media content
- 💝 **Donations Page**: Stripe integration with one-time and recurring donation options
- 🙏 **Prayer Requests**: Anonymous or named prayer submission with public/private toggle
- 📋 **Public Prayers**: View and pray for community prayer requests
- 🔒 **Privacy Policy**: Comprehensive privacy and data handling disclosure
- 🚫 **Custom 404 Page**: Helpful navigation when pages aren't found

### Admin Features
- 🔐 **Secure Admin Dashboard**: Session-based authentication at `/login`
- 📊 **Self-Hosted Analytics**: Privacy-focused page view tracking with anonymized IPs
- 🙏 **Prayer Management**: View, filter, mark as prayed, and manage prayer requests
- 📈 **Analytics Dashboard**: View statistics with date range filters, CSV export
- 🗑️ **Automated Cleanup**: Daily cron jobs for data retention compliance

### Technical Features
- ⚡ **Fast & Lightweight**: Built with pure Deno, no frameworks, brutalist CSS design
- 🗄️ **Deno KV Database**: Built-in key-value storage for all data
- 🔒 **Privacy-First**: No cookies, no client-side tracking, anonymized analytics
- 🛡️ **Security**: SHA-256 hashing, HTTP-only cookies, CSP headers
- ♿ **Accessibility**: WCAG AA compliant, focus indicators, 44px touch targets
- 🔍 **SEO Optimized**: Open Graph, Twitter Cards, JSON-LD structured data, sitemap.xml
- 🚀 **CI/CD Ready**: Automatic deployment to Deno Deploy via GitHub Actions

## Architecture

This project follows **SOLID principles** and clean architecture patterns:

### Design Patterns Used
- **Router Pattern**: Clean URL routing with pattern matching
- **Controller Pattern**: Separation of concerns by domain
- **Factory Pattern**: Consistent response creation
- **Template Pattern**: Reusable HTML layouts
- **Dependency Injection**: Loose coupling between components
- **Middleware Chain**: Composable request processing (security, caching, analytics)
- **Singleton Pattern**: Database service with single instance
- **Service Layer**: Business logic separated from controllers

### Project Structure

```
twowitnessproject/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions deployment workflow
├── src/
│   ├── core/                     # Core framework components
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── router.ts             # URL routing with middleware chain
│   │   ├── response.ts           # Response factory
│   │   └── middleware.ts         # Security, caching, analytics middleware
│   ├── controllers/              # Request handlers
│   │   ├── home.controller.ts
│   │   ├── about.controller.ts
│   │   ├── videos.controller.ts
│   │   ├── donate.controller.ts
│   │   ├── auth.controller.ts    # Admin login/logout
│   │   ├── prayer.controller.ts  # Prayer requests and public prayers
│   │   ├── analytics.controller.ts # Admin analytics dashboard
│   │   ├── seo.controller.ts     # Sitemap and robots.txt
│   │   └── privacy.controller.ts # Privacy policy
│   ├── services/                 # Business logic layer
│   │   ├── db.service.ts         # Deno KV singleton wrapper
│   │   ├── auth.service.ts       # Authentication and sessions
│   │   ├── prayer.service.ts     # Prayer CRUD operations
│   │   ├── analytics.service.ts  # Page view tracking
│   │   └── cleanup.service.ts    # Automated data retention
│   ├── views/                    # HTML templates
│   │   ├── layout.ts             # Main layout with SEO meta tags
│   │   ├── 404.view.ts           # Custom 404 page
│   │   ├── home.view.ts
│   │   ├── about.view.ts
│   │   ├── videos.view.ts
│   │   ├── donate.view.ts        # Stripe one-time and recurring
│   │   ├── pray.view.ts          # Prayer submission form
│   │   ├── prayers.view.ts       # Public prayers list
│   │   ├── privacy.view.ts       # Privacy policy
│   │   └── admin/
│   │       ├── login.view.ts     # Admin login page
│   │       ├── dashboard.layout.ts # Admin layout wrapper
│   │       ├── dashboard.view.ts # Admin home
│   │       ├── prayers.view.ts   # Prayer management
│   │       └── analytics.view.ts # Analytics dashboard
│   └── config/
│       └── app.config.ts         # Application configuration
├── public/
│   ├── css/
│   │   └── styles.css            # Brutalist stylesheet (356 lines)
│   └── images/                   # Static images
├── main.ts                       # Application entry point with cron jobs
├── deno.json                     # Deno configuration with KV and env flags
└── deno.deploy.json              # Deno Deploy configuration
```

## Requirements

- [Deno](https://deno.land/) 1.37 or higher

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd twowitnessproject
```

2. No dependencies to install! Deno has everything built-in.

## Usage

### Development Mode (with auto-reload)
```bash
deno task dev
```

### Production Mode
```bash
deno task start
```

The server will start on `http://localhost:8000`

## Configuration

### Environment Variables

Create a `.env` file or set environment variables for admin access:

```bash
ADMIN_USER=yourusername
ADMIN_PASS=yourpassword
```

These credentials will be automatically hashed with SHA-256 on first startup. The admin dashboard is accessible at `/login`.

### Application Config

Edit `src/config/app.config.ts` to customize:

- Ministry information (name, tagline, description)
- Social media links
- Contact email (`ministry@twowitnessproject.org`)
- Data retention policies (90 days for analytics, 30 days for prayed prayers)
- Server port and hostname

### Stripe Configuration

To enable donations:

1. **One-Time Donations**: Update the `buy-button-id` in `src/views/donate.view.ts` (already configured)
2. **Recurring Donations**:
   - Log into [Stripe Dashboard](https://dashboard.stripe.com)
   - Create a new product with "Recurring" payment type (monthly)
   - Create a buy button for the product
   - Replace `buy_btn_RECURRING_PLACEHOLDER` in `src/views/donate.view.ts` with your actual buy button ID

**Security**: Never commit your Stripe secret keys to the repository. The publishable key is safe to include in the code.

## Adding New Pages

Thanks to the clean architecture, adding new pages is simple:

1. **Create a view** in `src/views/yourpage.view.ts`
2. **Create a controller** in `src/controllers/yourpage.controller.ts`
3. **Register the controller** in `main.ts`

Example:

```typescript
// src/controllers/blog.controller.ts
import type { Controller, Route } from "@core/types.ts";
import { ResponseFactory } from "@core/response.ts";
import { renderBlog } from "@views/blog.view.ts";

export class BlogController implements Controller {
  getRoutes(): Route[] {
    return [
      {
        method: "GET",
        pattern: "/blog",
        handler: this.index.bind(this),
      },
    ];
  }

  private index(): Response {
    const html = renderBlog();
    return ResponseFactory.html(html);
  }
}
```

Then register it in `main.ts`:
```typescript
router.registerController(new BlogController());
```

## Admin Dashboard

The admin dashboard provides powerful tools for managing your ministry website.

### Accessing the Dashboard

1. Navigate to `/login` (not linked publicly for security)
2. Enter your admin credentials (set via environment variables)
3. Access the dashboard at `/dashboard`

### Features

#### Prayer Management (`/dashboard/prayers`)
- View all prayer requests (public and private)
- Filter by: All, Public, Private, Prayed
- Mark prayers as prayed
- Delete inappropriate requests
- See submission details (name, email if provided, timestamp)

#### Analytics Dashboard (`/dashboard/analytics`)
- **Page Views**: Track which pages are most visited
- **Date Ranges**: Filter by 7, 30, 90 days, or all time
- **Top Pages**: See your most popular content
- **Referrers**: Understand where traffic comes from
- **Devices**: Mobile vs Desktop vs Tablet breakdown
- **Browsers**: Browser usage statistics
- **Export**: Download analytics data as CSV

**Privacy Note**: All IP addresses are anonymized using SHA-256 hashing. No personal data is tracked.

### Data Retention

Automated cleanup runs daily at 2:00 AM via Deno cron:

- **Analytics**: Kept for 90 days, then automatically deleted
- **Prayed Prayers**: Kept for 30 days after being marked as prayed
- **Unprayed Prayers**: Kept indefinitely until prayed for
- **Admin Sessions**: Expire after 7 days of inactivity

Configure retention periods in `src/config/app.config.ts`.

## Deployment

### Deploy to Deno Deploy with GitHub Actions (Recommended)

This repository is configured for automatic deployment to Deno Deploy via GitHub Actions.

#### Initial Setup

1. **Create a Deno Deploy Project**
   - Go to [dash.deno.com](https://dash.deno.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Choose "Empty Project" (don't link to GitHub yet)
   - Name your project (e.g., `two-witness-project`)

2. **Configure Environment Variables**
   - In your Deno Deploy project settings, go to "Settings" → "Environment Variables"
   - Add the following variables:
     ```
     ADMIN_USER=yourusername
     ADMIN_PASS=yourpassword
     ```
   - These credentials will be used to access the admin dashboard at `/login`

3. **Link GitHub Repository**
   - In your Deno Deploy project settings, go to "Settings" → "Git Integration"
   - Connect your GitHub repository
   - Select the branch you want to deploy (e.g., `main` or `master`)
   - The project will use the GitHub Action for deployment

4. **Update Workflow Configuration**
   - Edit `.github/workflows/deploy.yml`
   - Change the `project` name to match your Deno Deploy project:
     ```yaml
     project: "your-project-name" # Change this to your actual project name
     ```

5. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure Deno Deploy"
   git push origin main
   ```

6. **Automatic Deployment**
   - Every push to `main` or `master` branch will trigger automatic deployment
   - Pull requests will also be deployed to preview URLs
   - Check the "Actions" tab in your GitHub repository to monitor deployments

#### What the GitHub Action Does

The workflow (`.github/workflows/deploy.yml`) automatically:
- ✅ Checks out your code
- ✅ Sets up Deno environment
- ✅ Runs type checking (`deno check`)
- ✅ Deploys to Deno Deploy
- ✅ Provides preview URLs for pull requests

#### Manual Deployment with deployctl

If you prefer manual deployment:

1. Install deployctl:
```bash
deno install -Arf jsr:@deno/deployctl
```

2. Deploy:
```bash
deployctl deploy --project=your-project-name main.ts
```

### Deploy to Deno Deploy (Dashboard Method)

1. Go to [dash.deno.com](https://dash.deno.com)
2. Create a new project
3. Link your GitHub repository
4. Set the entry point to `main.ts`
5. Deploy automatically on every push

### Deploy to any VPS

```bash
# Install Deno on your server
curl -fsSL https://deno.land/x/install/install.sh | sh

# Run as a service
deno run --allow-net --allow-read main.ts
```

For production VPS deployment, consider using a process manager like systemd or PM2.

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- Each controller handles only one domain (home, about, videos, donate)
- Each view renders only one page
- Router only handles routing

### Open/Closed Principle (OCP)
- Easy to add new routes without modifying existing code
- Easy to extend response types without changing ResponseFactory

### Liskov Substitution Principle (LSP)
- All controllers implement the same Controller interface
- Can be substituted without breaking the router

### Interface Segregation Principle (ISP)
- Small, focused interfaces (Controller, View, Route)
- No unnecessary dependencies

### Dependency Inversion Principle (DIP)
- Controllers are injected into the router
- Dependencies on abstractions, not concrete implementations

## Performance

- ⚡ Zero external dependencies
- 🚀 Direct Deno.serve() for maximum performance
- 📦 Minimal bundle size
- 🎯 Efficient routing with pattern matching

## Security

### Authentication & Sessions
- ✅ **SHA-256 Password Hashing**: Admin passwords are securely hashed
- ✅ **HTTP-Only Cookies**: Session tokens cannot be accessed by JavaScript
- ✅ **7-Day Session Expiration**: Automatic logout after inactivity
- ✅ **Secure Cookie Flags**: SameSite=Strict, Secure in production

### Data Protection
- ✅ **Anonymized Analytics**: IP addresses hashed with SHA-256, cannot be traced back
- ✅ **No Client-Side Tracking**: No cookies or localStorage used for analytics
- ✅ **XSS Protection**: All user input properly escaped
- ✅ **No SQL Injection**: Using Deno KV (key-value store), not SQL
- ✅ **Type-Safe**: Full TypeScript type safety

### HTTP Security Headers
- ✅ **Content Security Policy (CSP)**: Prevents XSS attacks
- ✅ **X-Frame-Options**: Prevents clickjacking
- ✅ **X-Content-Type-Options**: Prevents MIME sniffing
- ✅ **Strict-Transport-Security**: Forces HTTPS in production
- ✅ **Referrer-Policy**: Controls referrer information

### Privacy
- ✅ **GDPR Compliant**: Automated data retention and deletion
- ✅ **Privacy Policy**: Comprehensive disclosure at `/privacy`
- ✅ **Self-Hosted**: No third-party analytics or tracking
- ✅ **Anonymous Prayers**: Optional name/email for prayer requests

### Permissions
- ✅ **Deno's Secure-by-Default**: Explicit permissions required
- ✅ **Minimal Permissions**: Only `--allow-net`, `--allow-read`, `--allow-env`, `--unstable-kv`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

This project is dedicated to spreading the Gospel. Feel free to use, modify, and share.

## Support

For questions or suggestions about the website, please contact the Two Witness Project team.

---

Built with ❤️ and faith for the Two Witness Project
