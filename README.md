# Two Witness Project Website

A modern, responsive website for the Two Witness Project ministry - spreading the Gospel across the nation.

## Features

- 🏠 **Home Page**: Introduction to the ministry with key features
- 📖 **About Page**: Detailed information about the mission and story
- 🎥 **Videos Page**: Hub for all social media content
- 💝 **Donations Page**: Multiple ways to support the ministry
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Fast & Lightweight**: Built with pure Deno, no frameworks

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
└── deno.json                 # Deno configuration
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

### Deploy to Deno Deploy (Recommended)

1. Install deployctl:
```bash
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
```

2. Deploy:
```bash
deployctl deploy --project=twowitness main.ts
```

### Deploy to any VPS

```bash
# Install Deno on your server
curl -fsSL https://deno.land/x/install/install.sh | sh

# Run as a service
deno run --allow-net --allow-read main.ts
```

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
