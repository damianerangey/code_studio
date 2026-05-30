import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterHistory } from "@tanstack/react-router";

import { AppAtomRegistryProvider } from "./rpc/atomRegistry";
import { routeTree } from "./routeTree.gen";

// ClearML integration: when the SPA is built with a non-root Vite `base`
// (VITE_BASE=/service/<task>/), import.meta.env.BASE_URL carries that prefix.
// Feed it to the router as basepath so client-side routing matches/produces
// prefixed URLs. Defaults to "/" (no-op) for upstream/dev builds.
const RAW_BASE = import.meta.env.BASE_URL || "/";
const ROUTER_BASEPATH = RAW_BASE === "/" ? undefined : RAW_BASE.replace(/\/+$/, "");

export function getRouter(history: RouterHistory) {
  const queryClient = new QueryClient();

  return createRouter({
    routeTree,
    history,
    basepath: ROUTER_BASEPATH,
    context: {
      queryClient,
    },
    Wrap: ({ children }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AppAtomRegistryProvider, undefined, children),
      ),
  });
}

export type AppRouter = ReturnType<typeof getRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
