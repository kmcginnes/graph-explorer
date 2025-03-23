import { PropsWithChildren, Suspense } from "react";
import { RecoilRoot } from "recoil";
import StateDebug from "./StateDebug";
import AppLoadingPage from "@/core/AppLoadingPage";
import { NotInProduction } from "@/components";
import { showRecoilStateLoggingAtom } from "@/core/featureFlags";

export default function StateProvider({
  children,
}: PropsWithChildren<Record<string, unknown>>) {
  return (
    <RecoilRoot>
      <Suspense fallback={<AppLoadingPage />}>
        {children}
        <NotInProduction featureFlag={showRecoilStateLoggingAtom}>
          <StateDebug />
        </NotInProduction>
      </Suspense>
    </RecoilRoot>
  );
}
