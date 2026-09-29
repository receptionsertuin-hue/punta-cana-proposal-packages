import { useLocale, useTranslations } from "next-intl";
import FooterBrand from "./FooterBrand";
import FooterContact from "./FooterContact";
import FooterNavColumn from "./FooterNavColumn";
import FooterSocial from "./FooterSocial";
import FooterBottom from "./FooterBottom";

interface FooterProps {
  companyName?: string;
  logo?: { asset: { url: string; metadata: { dimensions: { width: number; height: number } } }; alt: string } | null;
  description?: string; telephone?: string; email?: string;
  socialLinks?: { facebook: string; instagram: string; xURL: string; MessengerURL: string };
  location?: string;
}
export default function Footer({ logo, description, socialLinks = { facebook: "", instagram: "", xURL: "", MessengerURL: "" }, telephone = "", email = "", companyName = "" }: FooterProps) {
  const t = useTranslations("Footer");
  const es = useLocale() === "es";
  const packageLinks = [
    { label: es ? "Propuestas de matrimonio" : "Proposal Packages", href: "/#proposals" },
    { label: "Punta Cana Romantic Dinners", href: "/#romantic-dinners" },
    { label: t("stories"), href: "/stories" },
  ];
  const companyLinks = [
    { label: t("howItWorks"), href: "/how-it-works" }, { label: t("contactUs"), href: "/contact" },
    { label: t("faq"), href: "/faq" }, { label: t("blog"), href: "/blog" },
  ];
  const legalLinks = [{ label: t("privacyPolicy"), href: "/privacy-policy" }, { label: t("termsOfService"), href: "/terms-of-service" }];
  return <footer className="bg-black border-t border-gold/15">
    <div className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-16 pb-12"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 lg:gap-12">
      <div><FooterBrand logo={logo} description={description} /><FooterSocial links={socialLinks} telephone={telephone} /></div>
      <FooterNavColumn title={t("packages")} links={packageLinks} /><FooterNavColumn title={t("company")} links={companyLinks} />
      <FooterContact title={t("getInTouch")} phone={telephone} email={email} location={t("location")} />
    </div></div>
    <div className="max-w-[1280px] mx-auto px-6 lg:px-12"><div className="h-px bg-gold/10" /></div>
    <FooterBottom companyName={companyName} allRightsReserved={t("allRightsReserved")} legalLinks={legalLinks} />
  </footer>;
}
