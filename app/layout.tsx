import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aroma Perfumes",
  description: "Discover your perfect scent with Aroma - premium crafted fragrances and administrative dashboard.",
  openGraph: {
    title: "Aroma Perfumes",
    description: "Discover your perfect scent with Aroma - premium crafted fragrances and administrative dashboard.",
    type: "website",
    locale: "en_LK",
    images: [
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=85",
        width: 1200,
        height: 630,
        alt: "Aroma Fine Perfumery Ceylon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aroma Perfumes",
    description: "Discover your perfect scent with Aroma - premium crafted fragrances and administrative dashboard.",
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&auto=format&fit=crop&q=85"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PerfumeStore",
    "name": "Aroma Perfumes",
    "description": "Discover your perfect scent with Aroma - premium crafted fragrances and administrative dashboard.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "No. 45, Ward Place",
      "addressLocality": "Colombo 07",
      "addressCountry": "LK"
    },
    "telephone": "+94771234567",
    "priceRange": "LKR 4,500 - LKR 18,500"
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-[#050505] text-white antialiased selection:bg-amber-400 selection:text-black`}>
        {children}
      </body>
    </html>
  );
}