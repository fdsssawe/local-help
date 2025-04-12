import "~/styles/globals.css";
import Header from "~/components/ui/Header";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ClerkProvider} from '@clerk/nextjs'
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "LocalHelp",
  icons: [{ rel: "icon", url: "../../../assets/logo.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
    >
    <html lang="en" className="">
      <body className="pt-[57px] h-screen">
      <Header/>
      <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}
