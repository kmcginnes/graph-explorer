import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Graph Explorer",
  description: "Graph Explorer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#FFFFFF" />
        <meta name="theme-color" content="#ffffff" />
      </head>

      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
