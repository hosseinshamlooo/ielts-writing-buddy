import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TaskProvider } from "@/src/contexts/TaskContext";
import Header from "@/src/components/Header";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IELTS Writing Feedback Generator",
  description: "AI-powered IELTS Writing practice and feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TaskProvider>
            <Header />
            {children}
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
