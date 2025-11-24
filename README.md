# Two Witness Project Website

A modern, responsive website for the Two Witness Project ministry - spreading the Gospel across the nation.

## Features

- 🏠 **Home Page**: Introduction to the ministry with key features
- 📖 **About Page**: Detailed information about the mission and story
- 🎥 **Videos Page**: Hub for all social media content
- 💝 **Donations Page**: Multiple ways to support the ministry
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Fast & Lightweight**: Built with pure Deno, no frameworks
- 🚀 **CI/CD Ready**: Automatic deployment to Deno Deploy via GitHub Actions

## Architecture

This project follows **SOLID principles** and clean architecture patterns:

### Design Patterns Used
- **Router Pattern**: Clean URL routing with pattern matching
- **Controller Pattern**: Separation of concerns by domain
- **Factory Pattern**: Consistent response creation
- **Template Pattern**: Reusable HTML layouts
- **Dependency Injection**: Loose coupling between components

### Project Structure

```
twowitnessproject/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions deployment workflow
├── src/
│   ├── core/                 # Core framework components
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── router.ts         # URL routing
│   │   ├── response.ts       # Response factory
│   ├── controllers/          # Request handlers
│   │   ├── home.controller.ts
│   │   ├── about.controller.ts
│   │   ├── videos.controller.ts
│   │   └── donate.controller.ts
│   ├── views/                # HTML templates
│   │   ├── layout.ts         # Main layout wrapper
│   │   ├── home.view.ts
│   │   ├── about.view.ts
│   │   ├── videos.view.ts
│   │   └── donate.view.ts
│   └── config/
│       └── app.config.ts     # Application configuration
├── public/
│   ├── css/
│   │   └── styles.css        # Responsive stylesheet
│   └── images/               # Static images
├── main.ts                   # Application entry point
├── deno.json                 # Deno configuration
└── deno.deploy.json          # Deno Deploy configuration
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

Edit `src/config/app.config.ts` to customize:

- Ministry information
- Social media links (update the `#` placeholders with real URLs)
- Donation platform details (PayPal, Venmo, Cash App)
- Server port and hostname

**Important**: Update all social media URLs and donation information with actual links before deploying!

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

2. **Link GitHub Repository**
   - In your Deno Deploy project settings, go to "Settings" → "Git Integration"
   - Connect your GitHub repository
   - Select the branch you want to deploy (e.g., `main` or `master`)
   - The project will use the GitHub Action for deployment

3. **Update Workflow Configuration**
   - Edit `.github/workflows/deploy.yml`
   - Change the `project` name to match your Deno Deploy project:
     ```yaml
     project: "your-project-name" # Change this to your actual project name
     ```

4. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure Deno Deploy"
   git push origin main
   ```

5. **Automatic Deployment**
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

- ✅ No SQL injection risk (no database)
- ✅ XSS protection through proper HTML escaping
- ✅ Type-safe with TypeScript
- ✅ Deno's secure-by-default permissions

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
