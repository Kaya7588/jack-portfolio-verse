import { useState } from "react";
import { z } from "zod";
import { FadeIn } from "./FadeIn";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty({ message: "Name cannot be empty" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  message: z
    .string()
    .trim()
    .nonempty({ message: "Message cannot be empty" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

const inputStyle: React.CSSProperties = {
  background: "transparent",
  borderBottom: "1px solid rgba(215, 226, 234, 0.25)",
  color: "#D7E2EA",
  fontFamily: "'Kanit', sans-serif",
};

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSent(true);
  };

  const reset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setErrors({});
    setSent(false);
  };

  return (
    <section
      id="contact"
      className="relative px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ background: "#0C0C0C" }}
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading font-black uppercase text-center leading-none tracking-tight mb-6"
          style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
        >
          Contact
        </h2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <p
          className="text-center font-light max-w-xl mx-auto mb-14 sm:mb-16"
          style={{ color: "#D7E2EA", opacity: 0.65, fontSize: "clamp(0.95rem, 1.6vw, 1.2rem)" }}
        >
          Tell me about your project — I&apos;ll get back within 48 hours.
        </p>
      </FadeIn>

      <div className="max-w-2xl mx-auto">
        {sent ? (
          <FadeIn delay={0}>
            <div
              className="rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 text-center flex flex-col items-center gap-6"
              style={{ border: "1px solid rgba(215, 226, 234, 0.2)" }}
            >
              <div
                className="hero-heading font-black uppercase leading-none"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                Message sent
              </div>
              <p
                className="font-light"
                style={{ color: "#D7E2EA", opacity: 0.7, fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)" }}
              >
                Thanks, {name.split(" ")[0] || "friend"}. I&apos;ll be in touch soon.
              </p>
              <button
                onClick={reset}
                className="rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 text-sm hover:bg-[#D7E2EA]/10 transition-colors"
              >
                Send another
              </button>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0}>
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 sm:gap-10">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="uppercase tracking-widest text-xs font-light"
                  style={{ color: "#D7E2EA", opacity: 0.6 }}
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-3 outline-none focus:border-white transition-colors"
                  style={{ ...inputStyle, fontSize: "clamp(1rem, 1.6vw, 1.2rem)" }}
                />
                {errors.name && (
                  <span className="text-xs" style={{ color: "#ff6b9a" }}>
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="uppercase tracking-widest text-xs font-light"
                  style={{ color: "#D7E2EA", opacity: 0.6 }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 outline-none focus:border-white transition-colors"
                  style={{ ...inputStyle, fontSize: "clamp(1rem, 1.6vw, 1.2rem)" }}
                />
                {errors.email && (
                  <span className="text-xs" style={{ color: "#ff6b9a" }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="message"
                  className="uppercase tracking-widest text-xs font-light"
                  style={{ color: "#D7E2EA", opacity: 0.6 }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  maxLength={1000}
                  rows={4}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full py-3 outline-none focus:border-white transition-colors resize-none"
                  style={{ ...inputStyle, fontSize: "clamp(1rem, 1.6vw, 1.2rem)" }}
                />
                {errors.message && (
                  <span className="text-xs" style={{ color: "#ff6b9a" }}>
                    {errors.message}
                  </span>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-full px-10 py-4 text-sm md:text-base text-white font-medium uppercase tracking-widest"
                  style={{
                    background:
                      "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
                    boxShadow:
                      "0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset",
                    outline: "2px solid #ffffff",
                    outlineOffset: "-3px",
                  }}
                >
                  Send Message
                </button>
              </div>
            </form>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
