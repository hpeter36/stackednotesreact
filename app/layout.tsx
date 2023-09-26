import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/config/auth";
import { SessProvider } from "@/components";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stacked Notes",
  description: "Stacked Notes desc",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <SessProvider session={session!}>
        <body className={`${inter.className}`}>
          <Navigation />
          <main>{children}</main>
        </body>
      </SessProvider>
    </html>
  );
}
