import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
// import AppLoadingPage from "./core/AppLoadingPage";
import { Route } from "./+types/root";
// import AppErrorPage from "./core/AppErrorPage";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function links() {
  return [
    {
      rel: "icon",
      href: `favicon.png`,
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: `apple-touch-icon.png`,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: `favicon-32x32.png`,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: `favicon-16x16.png`,
    },
    {
      rel: "mask-icon",
      href: `safari-pinned-tab.svg`,
      color: "#FFFFFF",
    },
    {
      // manifest.json provides metadata used when your web app is installed on a
      // user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/
      rel: "manifest",
      href: "manifest.json",
    },
  ];
}

export function meta() {
  return [
    {
      name: "theme-color",
      content: "#ffffff",
    },
    {
      name: "theme-color",
      content: "#000000",
    },
    {
      name: "title",
      content: "Graph Explorer",
    },
    {
      name: "description",
      content: "Graph Explorer",
    },
  ];
}

// export function HydrateFallback() {
//   return <AppLoadingPage />;
// }

// export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
//   return <AppErrorPage error={error} />;
// }

export default function Root() {
  return <Outlet />;
}
