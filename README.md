# CardSmith

CardSmith is a browser-based business card designer with a live preview and exports for print-ready PDF and editable Typst source.

## Features

- Build business cards with contact details and social profiles.
- Choose from multiple layouts and standard US, European, or square card sizes.
- Customize primary, text, and background colors.
- Preview cards as you edit, then download a PDF or Typst source.
- Keep in-progress work for the current browser tab using session storage.

## Privacy and storage

CardSmith is a static SvelteKit application. Card fields are compiled in the browser and stored in that tab's `sessionStorage`; the project has no application server or database.

Session storage is convenient, not a secure vault. Avoid entering secrets. Closing the tab, clearing site data, or using another browser removes access to saved card data.

## Local development

Requirements:

- Node.js 22 or a compatible current LTS release
- npm

From the repository root:

```sh
cd web
npm install
npm run dev
```

### Commands

Run these from `web/`:

| Command           | Purpose                               |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the development server          |
| `npm run build`   | Create the static production build    |
| `npm run preview` | Preview a production build locally    |
| `npm test`        | Run the Vitest suite                  |
| `npm run check`   | Run Svelte and TypeScript diagnostics |
| `npm run lint`    | Check formatting with Prettier        |
| `npm run format`  | Format the application workspace      |

## Deployment

The production target is Vercel with `web/` configured as the project root. SvelteKit uses the static adapter and writes the deployable site to `web/build/`. Typst compilation runs in the browser through WebAssembly.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, validation, and pull-request requirements. Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md), and follow the [Code of Conduct](CODE_OF_CONDUCT.md) when participating.

## License

CardSmith is licensed under the [GNU General Public License v3.0](LICENSE).
