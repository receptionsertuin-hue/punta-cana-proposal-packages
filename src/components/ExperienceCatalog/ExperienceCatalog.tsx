"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { calculateQuote, COURSES, defaultSelection, destinationDate, menuReady, OCCASIONS,
  restoreSelection, text, type Course, type Experience, type Locale, type Occasion, type Photo, type Selection } from "./catalog";
import styles from "./catalog.module.css";

const DINNER_INCLUSIONS = {
  en: ["Round-trip transportation throughout Punta Cana", "Basic table decoration", "Sparkling wine to celebrate", "Red or white wine", "Welcome drink", "Three-course dinner for two"],
  es: ["Transporte de ida y vuelta en todo Punta Cana", "Decoraci\u00f3n b\u00e1sica de la mesa", "Espumante para celebrar", "Vino tinto o blanco", "Bebida de bienvenida", "Cena de tres tiempos para dos"],
};
const OCCASION_LABELS = {
  en: { anniversary: "Wedding anniversary", birthday: "Birthday", date: "Dinner for two", celebration: "Special celebration", other: "Another occasion" },
  es: { anniversary: "Aniversario de bodas", birthday: "Cumplea\u00f1os", date: "Cena para dos", celebration: "Celebraci\u00f3n especial", other: "Otra ocasi\u00f3n" },
};
const COURSE_LABELS = { en: { starter: "Starter", main: "Main course", dessert: "Dessert" }, es: { starter: "Entrada", main: "Plato principal", dessert: "Postre" } };

function Gallery({ photos, name, locale }: { photos: Photo[]; name: string; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const element = useRef<HTMLDivElement>(null);
  const visible = useRef(false);
  const hover = useRef(false);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const es = locale === "es";
  useEffect(() => {
    const node = element.current;
    if (!node || photos.length < 2) return;
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting; }, { threshold: 0.5 });
    observer.observe(node);
    const timer = window.setInterval(() => {
      if (!paused && visible.current && !hover.current && !document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setIndex((current) => (current + 1) % photos.length);
      }
    }, 6000);
    return () => { observer.disconnect(); window.clearInterval(timer); };
  }, [paused, photos.length]);
  const move = (direction: number) => {
    setPaused(true);
    setIndex((current) => (current + direction + photos.length) % photos.length);
  };
  return (
    <div ref={element} className={styles.gallery} role="group" aria-roledescription={es ? "carrusel" : "carousel"} aria-label={`${name}: ${es ? "fotograf\u00edas generales" : "general photographs"}`}
      onMouseEnter={() => { hover.current = true; }} onMouseLeave={() => { hover.current = false; }} onFocus={() => setPaused(true)}
      onPointerDown={(event) => { pointer.current = { x: event.clientX, y: event.clientY }; }}
      onPointerCancel={() => { pointer.current = null; }}
      onPointerUp={(event) => {
        const start = pointer.current; pointer.current = null;
        if (!start || photos.length < 2) return;
        const dx = event.clientX - start.x; const dy = event.clientY - start.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      }}
      onKeyDown={(event) => { if (photos.length < 2) return; if (event.key === "ArrowRight") { event.preventDefault(); move(1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } }}>
      {photos[index] ? <Image src={photos[index].url} alt={photos[index].alt || name} fill sizes="(max-width: 720px) 100vw, (max-width: 1200px) 50vw, 580px" quality={80} className={styles.photo} draggable={false} /> : <p className={styles.noPhoto}>{es ? "Galer\u00eda pendiente de actualizaci\u00f3n" : "Gallery being updated"}</p>}
      {photos.length > 1 && <>
        <button className={`${styles.galleryButton} ${styles.previous}`} type="button" onClick={() => move(-1)} aria-label={es ? "Foto anterior" : "Previous photograph"}>&#8592;</button>
        <button className={`${styles.galleryButton} ${styles.next}`} type="button" onClick={() => move(1)} aria-label={es ? "Foto siguiente" : "Next photograph"}>&#8594;</button>
        <div className={styles.galleryBar}>
          <span>{index + 1} / {photos.length}</span>
          <span className={styles.dots}>{photos.map((_, position) => <button key={position} type="button" className={position === index ? styles.activeDot : styles.dot} aria-label={`${es ? "Ver foto" : "View photograph"} ${position + 1}`} aria-current={position === index ? "true" : undefined} onClick={() => { setPaused(true); setIndex(position); }} />)}</span>
          <button type="button" onClick={() => setPaused((current) => !current)} aria-pressed={paused} aria-label={paused ? (es ? "Reproducir galer\u00eda" : "Play slideshow") : (es ? "Pausar galer\u00eda" : "Pause slideshow")}>{paused ? "\u25b6" : "\u23f8"}</button>
        </div>
      </>}
    </div>
  );
}

function ExperienceCard({ experience, locale }: { experience: Experience; locale: Locale }) {
  const es = locale === "es";
  const t = (en: string, spanish: string) => es ? spanish : en;
  const name = text(experience.name, locale);
  const id = `experience-${experience.slug}`;
  const storageKey = `experience-catalog-v1:${experience.id}`;
  const [selection, setSelection] = useState<Selection>(() => defaultSelection(experience));
  const [requestOpen, setRequestOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [minimumDate, setMinimumDate] = useState("");
  useEffect(() => {
    // Restore only product choices, never contact details or client-supplied prices.
    try {
      const saved = sessionStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only storage is reconciled after hydration
      if (saved) setSelection(restoreSelection(experience, JSON.parse(saved)));
    } catch { /* Storage may be disabled; the configurator still works. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resolve the destination clock after hydration
    setMinimumDate(destinationDate());
  }, [experience, storageKey]);
  const choose = (next: Selection) => {
    setSelection(next);
    try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Optional persistence. */ }
  };
  const quote = calculateQuote(experience, selection);
  const money = (value: number | null) => value === null ? t("To be quoted", "Por cotizar") : new Intl.NumberFormat(es ? "es-DO" : "en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
  const dinner = experience.kind === "dinner";
  const readyMenu = menuReady(experience);
  const chooseDish = (guestIndex: number, course: Course, dishId: string) => {
    const guests = selection.guests.map((guest, index) => index === guestIndex ? { ...guest, [course]: dishId } : guest) as Selection["guests"];
    choose({ ...selection, guests });
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requestOpen) { setRequestOpen(true); return; }
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const requestedDate = String(fields.get("date") || "");
    if (!requestedDate || requestedDate < destinationDate()) { setStatus("error"); return; }
    setStatus("submitting");
    const detail = {
      experienceId: experience.id, experience: name, type: experience.kind,
      style: quote.style ? text(quote.style.name, locale) : t("Original setup", "Montaje original"),
      currency: "USD", basePrice: quote.base,
      extras: quote.extras.map((item) => ({ name: text(item.name, locale), price: item.price })),
      ...(dinner ? { occasion: OCCASION_LABELS[locale][selection.occasion], otherOccasion: String(fields.get("otherOccasion") || ""),
        wine: selection.wine, included: DINNER_INCLUSIONS[locale],
        guests: selection.guests.map((guest, index) => ({ guest: index + 1, courses: COURSES.map((course) => {
          const dish = experience.menu.find((item) => item.id === guest[course] && item.course === course);
          return { course, dish: dish ? text(dish.name, locale) : "To confirm", supplement: dish?.price ?? null };
        }) })) } : {}),
      pricedSubtotal: quote.subtotal, estimatedTotal: quote.total,
      allergies: String(fields.get("allergies") || ""), requests: String(fields.get("notes") || ""),
      status: "Availability enquiry only; menu, services and pricing require team confirmation.",
    };
    // Keep the existing Netlify form contract. The full configuration is stored
    // in its existing notes field, so no dynamic fields are silently discarded.
    const payload = new URLSearchParams({ "form-name": "package-booking", category: experience.kind,
      packageName: name, variant: quote.style ? text(quote.style.name, locale) : "",
      variantPrice: quote.base === null ? "To be quoted" : String(quote.base),
      addons: quote.extras.map((item) => text(item.name, locale)).join(", "),
      addonsTotal: quote.extras.some((item) => item.price === null) ? "To be quoted" : String(quote.extras.reduce((sum, item) => sum + (item.price ?? 0), 0)),
      estimatedTotal: quote.total === null ? "To be confirmed" : String(quote.total),
      name: String(fields.get("name") || ""), hotel: String(fields.get("hotel") || ""),
      phone: String(fields.get("phone") || ""), email: String(fields.get("email") || ""),
      date: requestedDate, notes: JSON.stringify(detail, null, 2),
    });
    try {
      const response = await fetch("/__forms.html", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: payload.toString() });
      if (!response.ok) throw new Error("Request failed");
      setStatus("success");
    } catch { setStatus("error"); }
  }
  return (
    <article id={id} className={styles.card}>
      <Gallery photos={experience.photos} name={name} locale={locale} />
      <form className={styles.cardBody} onSubmit={submit} onInvalidCapture={(event) => {
        if (event.target instanceof HTMLElement) { const details = event.target.closest("details"); if (details) details.open = true; }
      }}>
        <div className={styles.cardTitle}><div><p className={styles.eyebrow}>{dinner ? t("A celebration for two", "Una celebraci\u00f3n para dos") : t("Marriage proposal", "Propuesta de matrimonio")}</p><h3>{name}</h3></div><span className={styles.basePrice}>{money(quote.base)}<small>{t("USD / experience", "USD / experiencia")}</small></span></div>
        <p className={styles.description}>{text(experience.description, locale)}</p>
        <p className={styles.galleryNote}>{t("Gallery shows the experience in different settings; your style is selected below.", "La galer\u00eda muestra la experiencia en distintos montajes; el estilo se elige abajo.")}</p>
        {experience.styles.length > 0 && <label className={styles.field} htmlFor={`${id}-style`}><span>{t("Choose your style", "Elige tu estilo")}</span><select id={`${id}-style`} value={selection.style} onChange={(event) => choose({ ...selection, style: event.target.value })}>{experience.styles.map((style) => <option key={style.id} value={style.id}>{text(style.name, locale)} &mdash; {money(style.price)}</option>)}</select></label>}
        {quote.style?.description && <p className={styles.muted}>{text(quote.style.description, locale)}</p>}
        {dinner && <>
          <div className={styles.twoColumns}>
            <label className={styles.field} htmlFor={`${id}-occasion`}><span>{t("What are you celebrating?", "\u00bfQu\u00e9 celebramos?")}</span><select id={`${id}-occasion`} value={selection.occasion} onChange={(event) => choose({ ...selection, occasion: event.target.value as Occasion })}>{OCCASIONS.map((occasion) => <option key={occasion} value={occasion}>{OCCASION_LABELS[locale][occasion]}</option>)}</select></label>
            <label className={styles.field} htmlFor={`${id}-wine`}><span>{t("Included wine", "Vino incluido")}</span><select id={`${id}-wine`} value={selection.wine} onChange={(event) => choose({ ...selection, wine: event.target.value as "red" | "white" })}><option value="white">{t("White wine", "Vino blanco")}</option><option value="red">{t("Red wine", "Vino tinto")}</option></select></label>
          </div>
          {selection.occasion === "other" && <label className={styles.field} htmlFor={`${id}-other`}><span>{t("Tell us the occasion", "Cu\u00e9ntanos la ocasi\u00f3n")}</span><input id={`${id}-other`} name="otherOccasion" required maxLength={150} /></label>}
          <details className={styles.details}>
            <summary>{t("Choose your three-course menu", "Elige tu men\u00fa de tres tiempos")}<span>{quote.dishes.length}/6</span></summary>
            {readyMenu ? <div className={styles.detailBody}>{selection.guests.map((guest, guestIndex) => <fieldset key={guestIndex} className={styles.guest}><legend>{t("Guest", "Comensal")} {guestIndex + 1}</legend>{COURSES.map((course) => <label className={styles.field} key={course} htmlFor={`${id}-guest-${guestIndex}-${course}`}><span>{COURSE_LABELS[locale][course]}</span><select id={`${id}-guest-${guestIndex}-${course}`} required value={guest[course]} onChange={(event) => chooseDish(guestIndex, course, event.target.value)}><option value="">{t("Choose a dish", "Elige un plato")}</option>{experience.menu.filter((dish) => dish.course === course).map((dish) => <option key={dish.id} value={dish.id}>{text(dish.name, locale)} &mdash; {dish.price === 0 ? t("Included", "Incluido") : dish.price === null ? t("To be quoted", "Por cotizar") : `+${money(dish.price)}`}</option>)}</select>{text(experience.menu.find((dish) => dish.id === guest[course])?.description, locale) && <small>{text(experience.menu.find((dish) => dish.id === guest[course])?.description, locale)}</small>}</label>)}</fieldset>)}<p className={styles.muted}>{t("Each guest chooses independently. Any supplement is per person and is added to the estimate.", "Cada comensal elige de forma independiente. Los suplementos son por persona y se suman al estimado.")}</p></div> : <p className={styles.detailBody}>{t("The available menu will be confirmed by our team. Send an enquiry; no unconfirmed dishes or prices are offered here.", "Nuestro equipo confirmar\u00e1 el men\u00fa disponible. Puedes solicitar informaci\u00f3n; no se ofrecen platos ni precios sin confirmar.")}</p>}
          </details>
        </>}
        <details className={styles.details}><summary>{t("What's included", "Qu\u00e9 incluye")}</summary><div className={styles.detailBody}>{dinner ? <ul className={styles.inclusions}>{DINNER_INCLUSIONS[locale].map((item) => <li key={item}>{item}</li>)}</ul> : <ul className={styles.inclusions}>{experience.inclusions.map((item, index) => <li key={index}><strong>{text(item.title, locale)}</strong>{text(item.description, locale) && <span> &mdash; {text(item.description, locale)}</span>}</li>)}</ul>}<p className={styles.fullDescription}>{text(experience.description, locale)}</p></div></details>
        <details className={styles.details}><summary>{t("Make it yours: optional extras", "Personaliza con extras")}<span>{selection.extras.length || "+"}</span></summary><div className={styles.detailBody}>
          {experience.extras.length ? experience.extras.map((extra) => <label className={styles.extra} key={extra.id}><input type="checkbox" checked={selection.extras.includes(extra.id)} onChange={(event) => choose({ ...selection, extras: event.target.checked ? [...selection.extras, extra.id] : selection.extras.filter((value) => value !== extra.id) })} /><span><strong>{text(extra.name, locale)}</strong>{text(extra.description, locale) && <small>{text(extra.description, locale)}</small>}</span><span>{extra.price === null ? money(null) : `+${money(extra.price)}`}</span></label>) : <p className={styles.muted}>{t("Ask our team about a videographer, violinist or another special detail.", "Consulta con nuestro equipo por un vide\u00f3grafo, violinista u otro detalle especial.")}</p>}
          <p className={styles.muted}>{t("Another idea? Add it to your request. Custom services are quoted separately.", "\u00bfOtra idea? Escr\u00edbela en tu solicitud. Los servicios personalizados se cotizan por separado.")}</p>
        </div></details>
        <div className={styles.summary} aria-live="polite" aria-atomic="true"><span>{quote.total === null ? t("Priced selections", "Selecciones cotizadas") : t("Estimated total", "Total estimado")}<small>{quote.total === null ? t("Final total pending confirmation", "Total final pendiente de confirmaci\u00f3n") : t("USD \u00b7 subject to availability", "USD \u00b7 sujeto a disponibilidad")}</small></span><strong>{quote.base === null ? money(null) : money(quote.total ?? quote.subtotal)}</strong></div>
        {(quote.extras.length > 0 || quote.dishes.some((dish) => (dish.price ?? 0) > 0)) && <p className={styles.muted}>{[...quote.extras.map((extra) => `${text(extra.name, locale)} (${money(extra.price)})`), ...quote.dishes.filter((dish) => (dish.price ?? 0) > 0).map((dish) => `${text(dish.name, locale)} (+${money(dish.price)})`)].join(" \u00b7 ")}</p>}
        {status === "success" ? <div className={styles.success} role="status"><strong>{t("Request received", "Solicitud recibida")}</strong><p>{t("Our team will confirm availability, details and final pricing. This is not a confirmed reservation.", "Nuestro equipo confirmar\u00e1 disponibilidad, detalles y precio final. Esto no es una reserva confirmada.")}</p></div> : <>
          <button type="button" className={styles.primary} aria-expanded={requestOpen} aria-controls={`${id}-request`} onClick={() => setRequestOpen((current) => !current)}>{requestOpen ? t("Close request", "Cerrar solicitud") : t("Check availability", "Consultar disponibilidad")} <span aria-hidden="true">{requestOpen ? "\u2212" : "\u2197"}</span></button>
          <div id={`${id}-request`} hidden={!requestOpen} className={styles.request}>
            <p className={styles.muted}>{t("Your package, style, extras and menu choices will be included automatically.", "Tu paquete, estilo, extras y men\u00fa se adjuntar\u00e1n autom\u00e1ticamente.")}</p>
            <div className={styles.twoColumns}>{[{ key: "name", label: t("Full name", "Nombre completo"), type: "text", auto: "name" }, { key: "hotel", label: t("Hotel / accommodation", "Hotel / alojamiento"), type: "text", auto: "off" }, { key: "email", label: "Email", type: "email", auto: "email" }, { key: "phone", label: t("Phone / WhatsApp", "Tel\u00e9fono / WhatsApp"), type: "tel", auto: "tel" }].map((field) => <label className={styles.field} key={field.key} htmlFor={`${id}-${field.key}`}><span>{field.label}</span><input id={`${id}-${field.key}`} name={field.key} type={field.type} autoComplete={field.auto} maxLength={200} required={requestOpen} disabled={status === "submitting"} /></label>)}</div>
            <label className={styles.field} htmlFor={`${id}-date`}><span>{t("Preferred date", "Fecha deseada")}</span><input id={`${id}-date`} name="date" type="date" min={minimumDate || undefined} required={requestOpen} disabled={status === "submitting"} /></label>
            {dinner && <label className={styles.field} htmlFor={`${id}-allergies`}><span>{t("Allergies and dietary requirements", "Alergias y restricciones alimentarias")}</span><textarea id={`${id}-allergies`} name="allergies" rows={2} maxLength={1000} placeholder={t("Tell us which guest they apply to. Our team must confirm accommodations.", "Indica a cu\u00e1l comensal corresponden. Nuestro equipo debe confirmar las adaptaciones.")} /></label>}
            <label className={styles.field} htmlFor={`${id}-notes`}><span>{t("Special requests / other extras", "Peticiones especiales / otros extras")}</span><textarea id={`${id}-notes`} name="notes" rows={3} maxLength={1500} /></label>
            {status === "error" && <p className={styles.error} role="alert">{t("We couldn't send your request. Check the date and try again, or contact our team.", "No pudimos enviar tu solicitud. Revisa la fecha e intenta de nuevo o contacta al equipo.")} <Link href="/contact">{t("Contact us", "Contacto")}</Link></p>}
            <button type="submit" className={styles.primary} disabled={status === "submitting"}>{status === "submitting" ? t("Sending...", "Enviando...") : t("Send my request", "Enviar mi solicitud")}</button>
            <p className={styles.muted}>{t("No payment is taken here. Final services, pricing and any applicable charges are confirmed before booking.", "Aqu\u00ed no se realiza ning\u00fan cobro. Los servicios, el precio y los cargos aplicables se confirman antes de reservar.")}</p>
          </div>
        </>}
      </form>
    </article>
  );
}

function CatalogSection({ kind, experiences, locale }: { kind: "proposal" | "dinner"; experiences: Experience[]; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);
  const es = locale === "es";
  useEffect(() => {
    const revealHash = () => {
      const match = experiences.find((experience) => window.location.hash === `#experience-${experience.slug}`);
      if (!match) return;
      setExpanded(true);
      window.setTimeout(() => document.getElementById(`experience-${match.slug}`)?.scrollIntoView({ block: "start" }), 0);
    };
    const frame = window.requestAnimationFrame(revealHash);
    window.addEventListener("hashchange", revealHash);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("hashchange", revealHash); };
  }, [experiences]);
  const dinner = kind === "dinner";
  return <section id={dinner ? "romantic-dinners" : "proposals"} className={styles.section} aria-labelledby={`${kind}-heading`}>
    <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{dinner ? (es ? "Celebra a tu manera" : "Make time for each other") : (es ? "El inicio de su historia" : "Your next chapter starts here")}</p><h2 id={`${kind}-heading`}>{dinner ? "Punta Cana Romantic Dinners" : "Punta Cana Proposal Packages"}</h2></div>{experiences.length > 0 && <span className={styles.count}>{experiences.length} {es ? "experiencias" : "experiences"}</span>}</div>
    <p className={styles.sectionIntro}>{dinner ? (es ? "Aniversarios, cumplea\u00f1os o simplemente una cena para dos. Elige la ocasi\u00f3n, los platos de cada comensal y tus extras. Transporte incluido en todo Punta Cana." : "Anniversaries, birthdays or simply dinner for two. Choose the occasion, each guest's dishes and your extras. Transportation throughout Punta Cana is included.") : (es ? "Explora las fotos, elige tu estilo y a\u00f1ade tus detalles favoritos. Todo dentro de la misma tarjeta, sin abrir otras p\u00e1ginas." : "Browse the photographs, choose your style and add your favorite details. Everything stays in your card, without opening another page.")}</p>
    {dinner && <div className={styles.includedStrip}>{DINNER_INCLUSIONS[locale].map((item) => <span key={item}><span aria-hidden="true">&#10003;</span> {item}</span>)}</div>}
    {experiences.length ? <><div className={styles.grid}>{experiences.map((experience, index) => <div key={experience.id} hidden={!expanded && index >= 4}><ExperienceCard experience={experience} locale={locale} /></div>)}</div>{experiences.length > 4 && <button className={styles.more} type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded}>{expanded ? (es ? "Mostrar menos" : "Show fewer") : (es ? `Ver ${experiences.length - 4} experiencias m\u00e1s` : `Show ${experiences.length - 4} more experiences`)}</button>}</> : <div className={styles.empty}><h3>{dinner ? (es ? "Tu ocasi\u00f3n. Tu men\u00fa. Tu momento." : "Your occasion. Your menu. Your moment.") : (es ? "Planeemos tu experiencia" : "Let's plan your experience")}</h3><p>{es ? "Consulta con nuestro equipo las opciones y tarifas disponibles." : "Ask our team about the available options and pricing."}</p><Link className={styles.more} href="/contact">{es ? "Consultar opciones" : "Enquire about options"} &#8599;</Link></div>}
  </section>;
}

export default function ExperienceCatalog({ experiences, locale }: { experiences: Experience[]; locale: Locale }) {
  return <div className={styles.catalog}><CatalogSection kind="proposal" experiences={experiences.filter((item) => item.kind === "proposal")} locale={locale} /><CatalogSection kind="dinner" experiences={experiences.filter((item) => item.kind === "dinner")} locale={locale} /></div>;
}
