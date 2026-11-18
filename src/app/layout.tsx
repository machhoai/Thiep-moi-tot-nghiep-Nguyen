import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource-variable/noto-serif";
import "@fontsource-variable/noto-serif/wght-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thiệp mời tốt nghiệp",
  description: "Thư mời dự lễ tốt nghiệp và xác nhận tham dự.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
