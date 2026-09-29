import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import { Link } from "@/i18n/navigation";
import ExperienceCatalog from "@/components/ExperienceCatalog/ExperienceCatalog";
import styles from "@/components/ExperienceCatalog/catalog.module.css";
import { homePageHero } from "@/sanity/queries/HomePage/Hero";
import { getExperienceCatalog } from "@/sanity/queries/ProposalPackages/catalog";
import { buildSeoMetadata, fallbackSiteMetadata } from "@/lib/seo/buildMetadata";
import { siteCanonicalUrl } from "@/lib/seo/constants";
import { getPageSeo, getStructuredData } from "@/sanity/queries/SEO/seo";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: requestedLocale } = await params;
  const locale = requestedLocale === "es" ? "es" : "en";
  const [hero, experiences, structuredData] = await Promise.all([homePageHero(), getExperienceCatalog(), getStructuredData("home")]);
  const es = locale === "es";
  const image = hero?.image?.asset?.url || experiences[0]?.photos[0]?.url;
  return <main className={styles.page}>
    <JsonLd id="structured-data-schema" data={structuredData?.seo?.structuredData?.[locale]} />
    <section className={styles.hero}>
      <div><p className={styles.eyebrow}>Punta Cana, Dominican Republic</p>
        <h1>{es ? "Un momento para ustedes. A su manera." : "A moment for the two of you. Made yours."}</h1>
        <p>{es ? "Propuestas de matrimonio y cenas rom\u00e1nticas para celebrar. Explora, personaliza y consulta disponibilidad sin salir del cat\u00e1logo." : "Marriage proposals and romantic dinners worth celebrating. Explore, personalize and enquire, all in one place."}</p>
        <nav className={styles.heroActions} aria-label={es ? "Experiencias" : "Experiences"}><a href="#proposals">{es ? "Propuestas de matrimonio" : "Explore proposals"} &#8599;</a><a href="#romantic-dinners">{es ? "Cenas rom\u00e1nticas" : "Romantic dinners"} &#8599;</a></nav>
      </div>
      {image && <div className={styles.heroPhoto}><Image src={image} alt={hero?.image?.alt || (es ? "Una experiencia rom\u00e1ntica en Punta Cana" : "A romantic experience in Punta Cana")} fill sizes="(max-width: 720px) 1px, 45vw" priority className={styles.photo} /></div>}
    </section>
    <ExperienceCatalog experiences={experiences} locale={locale} />
    <section className={styles.steps} id="how-it-works" aria-label={es ? "C\u00f3mo funciona" : "How it works"}>
      <p><strong>{es ? "01. Elige tu experiencia" : "01. Choose your experience"}</strong>{es ? "Compara las fotos y elige tu propuesta o cena." : "Explore the photos and find your proposal or dinner."}</p>
      <p><strong>{es ? "02. Hazla tuya" : "02. Make it yours"}</strong>{es ? "Selecciona estilo, extras y, para las cenas, el men\u00fa de cada persona." : "Select the style, extras and, for dinners, each guest's menu."}</p>
      <p><strong>{es ? "03. Coordinamos los detalles" : "03. We arrange the details"}</strong>{es ? "Env\u00eda tu solicitud. Confirmaremos disponibilidad y precio antes de reservar." : "Send your request. We confirm availability and pricing before booking."} <Link href="/contact">{es ? "Habla con nosotros" : "Talk to us"} &#8599;</Link></p>
    </section>
  </main>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: "en" | "es" }> }) {
  const { locale } = await params;
  const pageSeo = await getPageSeo("home");
  const path = "";
  const canonicalUrl = siteCanonicalUrl(locale, path);
  if (!pageSeo) return fallbackSiteMetadata(locale, path, canonicalUrl);
  return buildSeoMetadata({ locale, path, canonicalUrl, meta: pageSeo.seo.meta[locale],
    openGraph: { title: pageSeo.seo.openGraph[locale].title, description: pageSeo.seo.openGraph[locale].description, image: pageSeo.seo.openGraph.image },
    noIndex: pageSeo.seo.noIndex, noFollow: pageSeo.seo.noFollow });
}
