import QueryProvider from "@/providers/query-provider";
import { UserProvider } from "@/providers/UserProvider";
import "./globals.css";
import { MasterCategoryProvider } from "@/providers/master-categories-provider";
import { SiteCategoryProvider } from "@/providers/site-category-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-black antialiased">
        <QueryProvider>
          <SiteCategoryProvider>
            <MasterCategoryProvider>
              <UserProvider>{children}</UserProvider>
            </MasterCategoryProvider>
          </SiteCategoryProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
