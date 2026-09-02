import Link from "next/link";
import { siteConfig, navLinks, imageCredits } from "@/lib/constants";
import { StaggerChildren } from "@/components/motion";
import { StaggerItem } from "@/components/motion/stagger-item";

export default function Footer() {
  const practiceLinks = [
    { label: "세무 기장", href: "/services/tax-bookkeeping" },
    { label: "세무 조정", href: "/services/tax-adjustment" },
    { label: "세무 자문", href: "/services/tax-advisory" },
    { label: "기업가치평가", href: "/services/valuation" },
    { label: "M&A · IPO 자문", href: "/services/transaction-advisory" },
  ];

  return (
    <footer className="bg-foreground text-white">
      {/* Divider */}
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10 pt-12">
        <div className="h-px bg-neutral-800" />
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10 py-16">
        <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <StaggerItem className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-base font-bold tracking-[0.12em] uppercase mb-5">
              {siteConfig.name}
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
              {siteConfig.tagline}
            </p>
            <div className="mt-6 space-y-1">
              <p className="text-xs text-neutral-500">
                Founder · {siteConfig.founder} 공인회계사
              </p>
            </div>
          </StaggerItem>

          {/* Practice Column */}
          <StaggerItem>
            <h3 className="t-label t-label-d mb-5">
              Practice
            </h3>
            <nav className="flex flex-col gap-3">
              {practiceLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </StaggerItem>

          {/* Menu Column */}
          <StaggerItem>
            <h3 className="t-label t-label-d mb-5">
              Menu
            </h3>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </StaggerItem>

          {/* Contact Column */}
          <StaggerItem>
            <h3 className="t-label t-label-d mb-5">
              Contact
            </h3>
            <div className="flex flex-col gap-3 text-sm text-neutral-400">
              <p>
                <span className="text-neutral-500 text-xs uppercase tracking-wider">Kakao</span>
                <br />
                <a
                  href={siteConfig.kakaoChannelUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-white transition-colors"
                >
                  카카오톡 채널
                </a>
              </p>
              <p>
                <span className="text-neutral-500 text-xs uppercase tracking-wider">Email</span>
                <br />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.email}
                </a>
              </p>
              <p className="mt-2 leading-relaxed">
                <span className="text-neutral-500 text-xs uppercase tracking-wider">Location</span>
                <br />
                {siteConfig.location}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={siteConfig.clientPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center self-start text-xs tracking-wider uppercase text-neutral-400 hover:text-white transition-colors duration-300 border-b border-neutral-700 hover:border-white pb-0.5"
                >
                  Client Login &rarr;
                </a>
              </div>
            </div>
          </StaggerItem>
        </StaggerChildren>
      </div>

      {/* Affiliation Disclosure */}
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="h-px bg-neutral-800" />
      </div>
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10 py-8 space-y-4">
        <p className="text-xs text-neutral-400 leading-relaxed max-w-4xl">
          <span className="text-neutral-300 font-medium">Affiliation Notice.</span>{" "}
          {siteConfig.affiliation}
        </p>
        {imageCredits.length > 0 && (
          <p className="text-[11px] text-neutral-400 leading-relaxed max-w-4xl">
            <span className="text-neutral-300 font-medium uppercase tracking-wider">
              Image Credits ·{" "}
            </span>
            {imageCredits.map((credit, i) => (
              <span key={credit.title}>
                {i > 0 && " · "}
                <a
                  href={credit.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neutral-200 transition-colors"
                >
                  {credit.title}
                </a>
                {" by "}
                {credit.photographer}
                {" ("}
                {credit.license}
                {")"}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="h-px bg-neutral-800" />
      </div>
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-neutral-400 tracking-wide">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <p className="text-xs text-neutral-400">
          Seoul, South Korea
        </p>
      </div>
    </footer>
  );
}
