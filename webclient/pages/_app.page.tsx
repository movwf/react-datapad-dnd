import "@webclient/styles/globals.css";
import { ThemeProvider } from "next-themes";
import { fetcher } from "@core/services/fetcher/index";
import { mockDashboardFetch } from "@core/hooks/data/use-dashboard-fetch";
import { mockMetricsAllFetch } from "@core/hooks/data/use-metrics-all-fetch";
import WindowSizeProvider from "@webclient/context/WindowSizeContext";

// Initialize fetcher
fetcher.setBaseUrl(process.env.NEXT_PUBLIC_FRONTEND_BASE_URL);

// data mocks
mockDashboardFetch();
mockMetricsAllFetch();

if (!("fetcher" in globalThis)) {
  globalThis.fetcher = fetcher;
}

function DatapadApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <WindowSizeProvider>
        <Component {...pageProps} />
      </WindowSizeProvider>
    </ThemeProvider>
  );
}

export default DatapadApp;
