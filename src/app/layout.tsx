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
  return (
    <html lang="vi" className="box-border scroll-smooth motion-reduce:scroll-auto">
      <body className="m-0 bg-cream font-sans text-[16px] leading-[1.6] text-ink
        selection:bg-[#dce5f4] selection:text-navy
        [&_*]:box-border [&_*::before]:box-border [&_*::after]:box-border
        [&_[id]]:scroll-mt-[32px] [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-[#5274ae]
        [:where(&_figure,&_h1,&_h2,&_h3,&_p)]:m-0
        [:where(&_h1,&_h2,&_h3)]:font-serif [:where(&_h1,&_h2,&_h3)]:leading-[1.03] [:where(&_h1,&_h2,&_h3)]:font-semibold
        [:where(&_a)]:text-inherit [:where(&_a)]:no-underline
        [:where(&_input,&_textarea,&_select,&_button)]:[font:inherit] [:where(&_button)]:cursor-pointer
        motion-reduce:[&_*]:transition-none! motion-reduce:[&_*::before]:transition-none! motion-reduce:[&_*::after]:transition-none!">
        {children}
      </body>
    </html>
  );
}
