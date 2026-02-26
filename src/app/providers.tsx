"use client";

import StoreProvider from "@/state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import Auth from "./(auth)/authProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CSPostHogProvider } from "@/components/PostHogProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <CSPostHogProvider>
      <StoreProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Authenticator.Provider>
            <Auth>{children}</Auth>
          </Authenticator.Provider>
        </ThemeProvider>
      </StoreProvider>
    </CSPostHogProvider>
  );
};

export default Providers;
