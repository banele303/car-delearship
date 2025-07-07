import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next";
import { Poppins, Montserrat, Outfit } from 'next/font/google';
import "./globals.css";


const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
});
import "@aws-amplify/ui-react/styles.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "SaCar Dealership - Your Dream Car Awaits",
  description: "Find your next car at SaCar Dealership. Browse new and used cars, schedule test drives, and get financing options.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} ${montserrat.variable} ${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Toaster 
          position="bottom-right"
          closeButton
          richColors
          duration={4000}
        />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme');
                  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {
                  console.error('Failed to set initial theme:', e);
                }
              })();
            `
          }}
        />
      </body>
    </html>
  );
}