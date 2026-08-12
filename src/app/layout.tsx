import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SmoothScrollProvider from "@/components/providers/smooth-scroll-provider";
import { siteConfig } from "@/lib/constants";

function toSafeJsonLd(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2A2A2A",
};

const searchVerification = {
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
    ? {
        other: {
          "naver-site-verification":
            process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
        },
      }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.title} | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["회계사무소", "세무", "감사", "회계", "컨설팅", "서울"],
  authors: [{ name: siteConfig.founder }],
  ...(Object.keys(searchVerification).length > 0
    ? { verification: searchVerification }
    : {}),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.title} | ${siteConfig.name}`,
    description: siteConfig.description,
    type: "website",
    locale: "ko_KR",
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.title} | ${siteConfig.name}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.name,
  alternateName: siteConfig.title,
  url: siteConfig.url,
  description: siteConfig.description,
  email: siteConfig.email,
  areaServed: "KR",
  inLanguage: "ko-KR",
  founder: {
    "@type": "Person",
    name: siteConfig.founder,
  },
  logo: new URL("/images/logo.png", siteConfig.url).toString(),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "ko-KR",
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLd(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJsonLd(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <SmoothScrollProvider>
          <Header />
          <main className="flex-1 pt-20">{children}</main>
          <Footer />
        </SmoothScrollProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
