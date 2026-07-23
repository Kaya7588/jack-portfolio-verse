import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LiveProjectButton } from "./ContactButton";

interface Project {
  n: string;
  name: string;
  category: string;
  img1: string;
  img2: string;
  img3: string;
}

const PROJECTS: Project[] = [
  {
    n: "01",
    name: "Nextlevel Studio",
    category: "Client",
    img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85",
    img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85",
    img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85",
  },
  {
    n: "02",
    name: "Aura Brand Identity",
    category: "Personal",
    img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85",
    img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85",
    img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85",
  },
  {
    n: "03",
    name: "Solaris Digital",
    category: "Client",
    img1: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85",
    img2: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85",
    img3: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85",
  },
];

function Card({ project, index, total, progress }: { project: Project; index: number; total: number; progress: any }) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div className="sticky top-24 md:top-32 h-[85vh] flex items-start justify-center px-4 sm:px-6 md:px-10" style={{ top: `calc(6rem + ${index * 28}px)` }}>
      <motion.div
        style={{ scale }}
        className="w-full max-w-6xl rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 p-4 sm:p-6 md:p-8"
        // eslint-disable-next-line react/forbid-dom-props
      >
        <div
          className="rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 p-4 sm:p-6 md:p-8"
          style={{ borderColor: "#D7E2EA", background: "#0C0C0C" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="font-black leading-none hero-heading" style={{ fontSize: "clamp(3rem, 8vw, 120px)" }}>
                {project.n}
              </div>
              <div className="flex flex-col">
                <span className="uppercase tracking-widest text-xs sm:text-sm font-light" style={{ color: "#D7E2EA", opacity: 0.6 }}>
                  {project.category}
                </span>
                <span className="uppercase font-medium" style={{ color: "#D7E2EA", fontSize: "clamp(1rem, 2vw, 1.75rem)" }}>
                  {project.name}
                </span>
              </div>
            </div>
            <LiveProjectButton />
          </div>

          <div className="grid grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            <div className="col-span-2 flex flex-col gap-3 sm:gap-4 md:gap-6">
              <img
                src={project.img1}
                alt=""
                className="w-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover"
                style={{ height: "clamp(130px, 16vw, 230px)" }}
                loading="lazy"
              />
              <img
                src={project.img2}
                alt=""
                className="w-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover"
                style={{ height: "clamp(160px, 22vw, 340px)" }}
                loading="lazy"
              />
            </div>
            <div className="col-span-3">
              <img
                src={project.img3}
                alt=""
                className="w-full h-full rounded-[40px] sm:rounded-[50px] md:rounded-[60px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ProjectsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section
      id="projects"
      ref={ref}
      className="relative rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-10 pt-20 pb-32"
      style={{ background: "#0C0C0C" }}
    >
      <h2 className="hero-heading font-black uppercase text-center leading-none tracking-tight mb-16" style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}>
        Project
      </h2>
      {PROJECTS.map((p, i) => (
        <Card key={p.n} project={p} index={i} total={PROJECTS.length} progress={scrollYProgress} />
      ))}
    </section>
  );
}
