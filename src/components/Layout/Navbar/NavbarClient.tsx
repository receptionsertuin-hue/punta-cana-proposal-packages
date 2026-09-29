"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import NavbarLinks from "./NavbarLinks";
import NavbarCTA from "./NavbarCTA";
import NavbarMobileToggle from "./NavbarMobileToggle";
import NavbarMobileMenu from "./NavbarMobileMenu";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";

export default function NavbarClient() {
  const t = useTranslations("Navbar");
  const es = useLocale() === "es";
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => document.getElementById("navbar")?.setAttribute("data-scrolled", String(window.scrollY > 20));
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [menuOpen]);
  const links = [
    { label: es ? "Propuestas" : "Proposals", href: "/#proposals" },
    { label: es ? "Cenas rom\u00e1nticas" : "Romantic Dinners", href: "/#romantic-dinners" },
    { label: t("howItWorks"), href: "/#how-it-works" },
  ];
  return <>
    <div className="hidden lg:flex justify-center"><NavbarLinks links={links} /></div>
    <div className="flex items-center justify-end gap-4"><div className="hidden lg:flex items-center justify-end gap-4"><LanguageSwitcher /></div><NavbarCTA /><NavbarMobileToggle isOpen={menuOpen} onToggle={() => setMenuOpen((current) => !current)} /></div>
    <NavbarMobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} links={links} />
  </>;
}
