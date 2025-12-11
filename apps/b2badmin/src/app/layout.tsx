import QueryProvider from "@/components/providers/query-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-black antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
