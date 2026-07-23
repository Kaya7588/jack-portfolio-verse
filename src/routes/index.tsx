import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/jack/HeroSection";
import { MarqueeSection } from "@/components/jack/MarqueeSection";
import { AboutSection } from "@/components/jack/AboutSection";
import { ServicesSection } from "@/components/jack/ServicesSection";
import { ProjectsSection } from "@/components/jack/ProjectsSection";
import { PriceSection } from "@/components/jack/PriceSection";
import { ContactSection } from "@/components/jack/ContactSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jack — 3D Creator" },
      {
        name: "description",
        content:
          "Portfolio of Jack, a 3D creator crafting striking and unforgettable projects across branding, motion, and web design.",
      },
      { property: "og:title", content: "Jack — 3D Creator" },
      {
        property: "og:description",
        content: "A 3D creator driven by crafting striking and unforgettable projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main style={{ background: "#0C0C0C", overflowX: "clip", fontFamily: "'Kanit', sans-serif" }}>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
    </main>
  );
}
