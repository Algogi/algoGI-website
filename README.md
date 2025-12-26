# Algogi Marketing Website

A modern, responsive marketing website for Algogi, an AI agent development and automation company. Built with Next.js 15 (App Router), TypeScript, and Tailwind CSS, optimized for lead generation and SEO.

## Features

- **Modern Stack**: Next.js 15 with App Router, TypeScript, and Tailwind CSS
- **SEO Optimized**: Comprehensive metadata, Open Graph tags, and semantic HTML
- **Lead Generation**: Integrated lead capture forms with API endpoint
- **Responsive Design**: Fully responsive across mobile, tablet, and desktop
- **Accessible**: Keyboard navigation and ARIA labels
- **Production Ready**: Clean, maintainable code structure

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
algogi-website/
├── app/
│   ├── api/
│   │   └── lead/
│   │       └── route.ts          # Lead capture API endpoint
│   ├── about/
│   │   └── page.tsx              # About page
│   ├── case-studies/
│   │   └── page.tsx              # Case studies page
│   ├── contact/
│   │   └── page.tsx              # Contact page with lead form
│   ├── services/
│   │   └── page.tsx              # Services page
│   ├── globals.css               # Global styles and Tailwind
│   ├── layout.tsx                # Root layout with header/footer
│   └── page.tsx                  # Home page
├── components/
│   ├── footer/
│   │   └── site-footer.tsx       # Site footer component
│   ├── forms/
│   │   └── lead-capture-form.tsx # Lead capture form (Client Component)
│   ├── hero/
│   │   └── home-hero.tsx         # Home page hero section
│   ├── navigation/
│   │   └── site-header.tsx       # Site header with mobile nav (Client Component)
│   └── sections/
│       ├── case-study-strip.tsx  # Case study showcase section
│       └── services-overview.tsx # Services overview section
├── public/                        # Static assets
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Customization

### Styling

The site uses Tailwind CSS with a custom theme. Edit `tailwind.config.ts` to customize:

- **Colors**: Primary and accent color palettes
- **Typography**: Font families and sizes
- **Spacing**: Custom spacing scale
- **Components**: Reusable component classes in `app/globals.css`

### Content

- **Home Page**: Edit `app/page.tsx` and component files in `components/`
- **Services**: Update services array in `app/services/page.tsx`
- **Case Studies**: Modify case studies in `app/case-studies/page.tsx`
- **About**: Edit content in `app/about/page.tsx`
- **SEO Metadata**: Update metadata exports in each page file

### Lead Capture Integration

The lead capture form submits to `/api/lead/route.ts`. To integrate with your CRM:

1. Open `app/api/lead/route.ts`
2. Uncomment and implement one of the integration options:
   - HubSpot API
   - Salesforce API
   - Zapier webhook
   - Database storage
   - Email notification

Example Zapier webhook integration:

```typescript
// In app/api/lead/route.ts
const response = await fetch('YOUR_ZAPIER_WEBHOOK_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
```

### Adding New Pages

1. Create a new directory in `app/` (e.g., `app/resources/`)
2. Add a `page.tsx` file with metadata export
3. Add the route to `components/navigation/site-header.tsx`

## SEO Optimization

Each page includes:

- Unique title and description
- Open Graph tags for social sharing
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images (add when adding images)

Target keywords are naturally integrated into headings and copy:
- "AI agent development"
- "AI automation partner"
- "intelligent automation for businesses"

## Performance

- Server Components by default (faster initial load)
- Client Components only where needed (forms, interactive elements)
- Optimized images (use Next.js Image component when adding images)
- Minimal JavaScript bundle

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Cron jobs (Vercel)
- Cron definitions live in `vercel.json`.
- `/api/cron/warmup` — hourly (`0 * * * *`), sends paced warmup emails.
- `/api/cron/campaign-warmup` — hourly (`0 * * * *`), enqueues hourly campaign slices.
- `/api/cron/send-queue` — every 10 minutes (`*/10 * * * *`), processes queued sends with domain limits.
- All cron calls use `POST` with `Authorization: Bearer <CRON_SECRET>`. Add the secret in Vercel: `vercel env add CRON_SECRET <environment>`. Rotate by updating the value and redeploying.
- View and debug cron runs in Vercel: Project → Cron Jobs.

### Other Platforms

Build the project and deploy the `.next` folder:

```bash
npm run build
```

## Development Tips

- **Improve Hero Copy**: Edit `components/hero/home-hero.tsx`
- **Refine Services Page**: Update `app/services/page.tsx`
- **Connect CRM**: Modify `app/api/lead/route.ts`
- **Add Analytics**: Add tracking scripts to `app/layout.tsx`
- **Customize Colors**: Edit `tailwind.config.ts`

## Support

For questions or customization help, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

Private - Algogi

