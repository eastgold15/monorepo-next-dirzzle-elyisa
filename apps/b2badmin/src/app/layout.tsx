import { UserProvider } from "@/providers/UserProvider";
import QueryProvider from "@/providers/query-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-black antialiased">
        <QueryProvider>
          <UserProvider>{children}</UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
