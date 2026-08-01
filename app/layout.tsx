import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "軌道雷達｜即時衛星追蹤與碰撞風險情報",
  description: "以繁體中文掌握衛星、太空碎片、近接事件與發射情報。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
