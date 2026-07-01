import Link from "next/link";

const utilityLinks = [
  { label: "Careers", href: "/careers" },
  { label: "Join Now", href: "/join" },
  { label: "Waiver Form", href: "/waiver" },
  { label: "Contact Us", href: "/contact" },
  { label: "Book A Tour", href: "/tours" },
  { label: "Membership Cancellation", href: "/cancel" },
];

const legalLinks = ["PRIVACY POLICY", "TERMS OF SERVICE", "CCPA"];

const Footer = () => {
  return (
    <footer className="w-full px-6 py-20 text-white sm:py-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <div className="grid w-full gap-14 md:grid-cols-[1fr_1.2fr] md:gap-54">
          <div className="text-center md:text-left">
            <h2 className="font-heading text-lg font-black uppercase">
              Utilities
            </h2>
            <ul className="mt-5 flex flex-col gap-4 text-sm font-bold text-white/65">
              {utilityLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-(--primary)"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-heading text-lg font-black uppercase">
              Sign Up To Our Newsletter
            </h2>
            <div className="mt-5 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="footer-email">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Your Email Address"
                className="min-h-12 flex-1 rounded-md border border-white/35 bg-transparent px-5 text-sm font-semibold text-white outline-none transition placeholder:text-white/45 focus:border-(--primary)"
              />
              <button
                type="button"
                className="min-h-12 rounded-md bg-white px-7 font-heading text-sm font-black uppercase text-black transition hover:bg-(--primary)"
              >
                Sign Up
              </button>
            </div>

            <div className="mt-9 h-px w-full max-w-md bg-white/18" />

            <div className="mt-9 flex w-full max-w-md items-center justify-between gap-8">
              <h2 className="font-heading text-lg font-black uppercase">
                Follow Us
              </h2>
              <a
                href="https://www.instagram.com/"
                aria-label="Instagram"
                className="grid size-8 place-items-center rounded-md border border-white/35 text-xs font-black text-white/75 transition hover:border-(--primary) hover:text-(--primary)"
              >
                IG
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-[0.7rem] font-bold uppercase leading-relaxed text-white/55">
          <p className="text-white/80">
            &copy; 2026 Iron Palace. All Rights Reserved
          </p>
          <p className="mt-2 font-heading text-white">
            Learn More | Train Hard | Be More
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {legalLinks.map((link, index) => (
              <span key={link} className="flex items-center gap-2">
                {index > 0 && <span className="text-white/30">|</span>}
                <span>{link}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
