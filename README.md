# Two Witness Project - Linktree Website

A clean, modern linktree-style website with full admin control and customizable theming. Built from scratch with Deno and TypeScript.

## Features

### Public Side
- **Clean Link Cards**: Beautiful, clickable cards displaying your important links
- **Responsive Design**: Works perfectly on all devices
- **Custom Themes**: Site automatically uses the admin-configured color scheme
- **Fast & Lightweight**: Server-side rendering for optimal performance

### Admin Dashboard
- **Full CRUD Operations**: Create, edit, and delete links
- **Theme Customization**:
  - Pick any base color
  - System automatically generates harmonious complementary colors using color theory
  - Live preview of all generated colors
  - Persistent theming stored in database
- **Secure Authentication**: Session-based login system
- **Clean Interface**: Easy-to-use dashboard with modal-based editing

### Theme System
The theme customization uses color theory to generate a complete palette from a single color:
- **Primary**: Your selected base color
- **Secondary**: Complementary color (180° opposite on color wheel)
- **Accent**: Analogous color (30° offset)
- **Light**: Desaturated, lighter variant for backgrounds
- **Dark**: Saturated, darker variant for text and shadows

## Tech Stack

- **Runtime**: Deno 2.x
- **Language**: TypeScript (strict mode)
- **Database**: Deno KV (built-in key-value store)
- **Styling**: Pure CSS with CSS variables for dynamic theming
- **Deployment**: Deno Deploy via GitHub Actions

## Project Structure

```
.
├── main.ts                    # Server entry point and routing
├── deno.json                  # Deno configuration
├── deno.deploy.json          # Deno Deploy configuration
├── public/
│   └── styles.css            # Responsive CSS with theme variables
└── src/
    ├── db.ts                 # Database service wrapper
    ├── auth.ts               # Authentication and session management
    ├── links.ts              # Link CRUD operations
    ├── theme.ts              # Theme storage and retrieval
    ├── colors.ts             # Color theory engine (HEX/HSL conversion, palette generation)
    └── views/
        ├── home.ts           # Public homepage
        ├── login.ts          # Admin login page
        └── admin.ts          # Admin dashboard
```

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) v1.x or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/roberto-morado/twowitnessproject.git
cd twowitnessproject
```

2. Set up environment variables (optional):
```bash
# Create a .env file or set environment variables
export ADMIN_USERNAME="your_username"
export ADMIN_PASSWORD="your_password"
export PORT="8000"  # Optional, defaults to 8000
```

3. Run the development server:
```bash
deno task dev
```

4. Open your browser to `http://localhost:8000`

### First Time Setup

1. Navigate to `http://localhost:8000/admin/login`
2. Login with your admin credentials (defaults: username=`admin`, password=`password`)
3. Add your first links
4. Customize your theme

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `password` |
| `PORT` | Server port | `8000` |

**⚠️ Important**: Change the default credentials in production!

## Deployment

### Deno Deploy (Recommended)

This project is configured for automatic deployment to Deno Deploy via GitHub Actions.

1. Create a project on [Deno Deploy](https://dash.deno.com)
2. Name it `twowitnessproject` (or update the workflow file)
3. Link it to GitHub Actions deployment
4. Set environment variables in Deno Deploy dashboard:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
5. Push to your repository - GitHub Actions will automatically deploy

### Manual Deployment

```bash
# Install deployctl
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts

# Deploy
deployctl deploy --project=twowitnessproject --prod main.ts
```

## Development

### Available Commands

```bash
# Run development server with auto-reload
deno task dev

# Run production server
deno task start

# Type check
deno check main.ts
```

### Database

The application uses Deno KV for storage. Data is automatically persisted:
- **Local Development**: Stored in `.deno-kv` directory
- **Deno Deploy**: Managed by Deno Deploy's KV service

No external database setup required!

## API Routes

### Public Routes
- `GET /` - Homepage with links
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Login authentication

### Protected Admin Routes
- `GET /admin` - Admin dashboard
- `GET /admin/logout` - Logout
- `POST /admin/links/create` - Create new link
- `POST /admin/links/update` - Update existing link
- `POST /admin/links/delete` - Delete link
- `POST /admin/theme` - Save theme customization

## Features in Detail

### Link Management
- Links are displayed in order of creation
- Each link has:
  - Name (displayed on card)
  - URL (opens in new tab)
  - Unique ID (generated automatically)
  - Order index (for sorting)

### Security
- Session-based authentication with HTTP-only cookies
- CSRF protection built-in to forms
- Secure password validation
- Admin routes protected by authentication middleware

### Color Theory Implementation
The theme system converts colors between HEX and HSL color spaces to calculate mathematically harmonious palettes:
- HSL allows easy manipulation of hue, saturation, and lightness
- Complementary colors are calculated using hue rotation
- Analogous colors use smaller hue offsets
- Light/dark variants adjust saturation and lightness values

## License

This project is built for the Two Witness Project ministry.

## Support

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ using Deno and TypeScript**
