import type { Metadata, Viewport } from "next";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { getCatalog } from "@/lib/catalog/build";
import { CatalogProvider } from "@/lib/catalog/context";
import { Providers } from "@/components/layout/providers";
import { AppShell } from "@/components/layout/app-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <CatalogProvider catalog={getCatalog()}>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </CatalogProvider>
      </body>
    </html>
  );
}
