# Advanced SEO & Launch Plan

## Goal
Launch the application and improve SEO to differentiate "CoachFlow" from competitors with the same name.

## Launch
- Run `npm run dev` to start the local development server.

## Advanced SEO Strategy
To outrank or differentiate from the other "CoachFlow", we will use **Structured Data** and **Niche Specificity**.

### 1. Refine Meta Tags (LandingPage.jsx)
- **Title**: Change to "CoachFlow - High-Ticket Coaching Framework & Dashboard" (More specific).
- **Description**: Emphasize unique value props ("Operating System for Frameworks").
- **Canonical URL**: Enforce `https://coachflow.app/` to prevent duplicate content penalties.

### 2. Structured Data (JSON-LD)
Inject `SoftwareApplication` schema into the Landing Page. This tells Google exactly what the app is, its rating (if applicable), and price.

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "CoachFlow",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "49.00",
    "priceCurrency": "USD"
  },
  "description": "The Operating System for High-Ticket Frameworks. Automate your leads, visualize revenue, and manage your pipeline."
}
```

### 3. Technical SEO Assets (public/)
- **robots.txt**: Guide crawlers on what to index.
- **sitemap.xml**: List key pages (`/`, `/login`, `/admin`).

## Proposed File Changes

### [LandingPage.jsx](file:///c:/Users/HP/Downloads/Jacqueline%20Dashboard/src/components/LandingPage.jsx)
- Update `<Helmet>` tags.
- Add `<script type="application/ld+json">`.

### [NEW] [public/robots.txt](file:///c:/Users/HP/Downloads/Jacqueline%20Dashboard/public/robots.txt)
- Create standard robots file.

### [NEW] [public/sitemap.xml](file:///c:/Users/HP/Downloads/Jacqueline%20Dashboard/public/sitemap.xml)
- Create static sitemap.

## Verification
- Check Page Source for JSON-LD.
- Verify `localhost` is running.
