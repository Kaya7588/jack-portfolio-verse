import { FadeIn } from "./FadeIn";
import { ContactButton } from "./ContactButton";

const TIERS = [
  {
    n: "01",
    name: "Starter",
    price: "$450",
    tag: "One-off project",
    features: [
      "1 concept direction",
      "3D modeling of a single object",
      "Photoreal render (2 angles)",
      "2 rounds of revisions",
      "Delivery in 7 days",
    ],
  },
  {
    n: "02",
    name: "Signature",
    price: "$1,200",
    tag: "Most popular",
    features: [
      "3 concept directions",
      "Full scene modeling & lighting",
      "Photoreal renders + short loop",
      "Unlimited revisions",
      "Source files included",
      "Delivery in 14 days",
    ],
    highlight: true,
  },
  {
    n: "03",
    name: "Studio",
    price: "Custom",
    tag: "Retainer",
    features: [
      "Dedicated 3D direction",
      "Branding, motion & web assets",
      "Weekly delivery cadence",
      "Priority turnaround",
      "Monthly strategy calls",
    ],
  },
];

export function PriceSection() {
  return (
    <section
      id="price"
      className="relative px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ background: "#0C0C0C" }}
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading font-black uppercase text-center leading-none tracking-tight mb-14 sm:mb-20 md:mb-24"
          style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
        >
          Price
        </h2>
      </FadeIn>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
        {TIERS.map((t, i) => (
          <FadeIn key={t.n} delay={i * 0.12}>
            <div
              className="h-full rounded-[32px] sm:rounded-[40px] md:rounded-[48px] p-6 sm:p-8 md:p-10 flex flex-col gap-6 sm:gap-7 md:gap-8"
              style={{
                border: "1px solid rgba(215, 226, 234, 0.18)",
                background: t.highlight
                  ? "linear-gradient(160deg, rgba(182,0,168,0.12) 0%, rgba(118,33,176,0.08) 60%, rgba(12,12,12,0) 100%)"
                  : "rgba(215, 226, 234, 0.02)",
              }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="font-black leading-none"
                  style={{
                    color: "#D7E2EA",
                    opacity: 0.35,
                    fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                  }}
                >
                  {t.n}
                </span>
                <span
                  className="uppercase tracking-widest text-xs sm:text-sm font-light px-3 py-1 rounded-full"
                  style={{
                    color: "#D7E2EA",
                    border: "1px solid rgba(215, 226, 234, 0.25)",
                  }}
                >
                  {t.tag}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3
                  className="font-medium uppercase leading-tight"
                  style={{ color: "#D7E2EA", fontSize: "clamp(1.25rem, 2.4vw, 2rem)" }}
                >
                  {t.name}
                </h3>
                <div
                  className="hero-heading font-black leading-none"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
                >
                  {t.price}
                </div>
              </div>

              <ul className="flex flex-col gap-3 sm:gap-4 flex-1">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 font-light leading-relaxed"
                    style={{
                      color: "#D7E2EA",
                      opacity: 0.8,
                      fontSize: "clamp(0.85rem, 1.4vw, 1.05rem)",
                    }}
                  >
                    <span
                      aria-hidden
                      className="mt-2 shrink-0 rounded-full"
                      style={{ width: 6, height: 6, background: "#D7E2EA" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <a href="#contact" className="inline-block">
                  <ContactButton />
                </a>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
