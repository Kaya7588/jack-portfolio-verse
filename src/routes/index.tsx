import { createFileRoute } from "@tanstack/react-router";
import { AryaOnboarding } from "@/components/arya/AryaOnboarding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arya Premium — Onboarding" },
      {
        name: "description",
        content:
          "Arya Premium onboarding — a premium Telegram Story experience. Choose your language, appearance, and currency.",
      },
      { property: "og:title", content: "Arya Premium — Onboarding" },
      {
        property: "og:description",
        content: "Premium Telegram Story Experience. Personalize your Arya Premium.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0C0C0C" },
    ],
  }),
  component: Index,
});

function Index() {
  return <AryaOnboarding />;
}
