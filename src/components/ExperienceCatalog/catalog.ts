export type Locale = "en" | "es";
export type Localized = { en?: string; es?: string };
export type Course = "starter" | "main" | "dessert";
export const COURSES: Course[] = ["starter", "main", "dessert"];
export const OCCASIONS = ["anniversary", "birthday", "date", "celebration", "other"] as const;
export type Occasion = (typeof OCCASIONS)[number];
export type Photo = { url: string; alt: string };
export type Option = { id: string; name: Localized; description?: Localized; price: number | null };
export type Dish = Option & { course: Course };
export type Experience = {
  id: string; slug: string; kind: "proposal" | "dinner";
  name: Localized; description?: Localized; price: number | null;
  photos: Photo[]; styles: Option[]; extras: Option[]; menu: Dish[];
  inclusions: { title: Localized; description?: Localized }[];
};
export type Selection = {
  style: string; extras: string[]; occasion: Occasion; wine: "red" | "white";
  guests: [Record<Course, string>, Record<Course, string>];
};
export type RawExperience = {
  _id: string; slug?: { current?: string }; experienceKind?: string;
  name?: Localized; description?: Localized; price?: number | null;
  image?: { asset?: { url?: string }; alt?: string };
  gallery?: { asset?: { url?: string }; alt?: string }[];
  variants?: { _key?: string; name: Localized; description?: Localized; price?: number | null }[];
  addons?: { _key?: string; name: Localized; description?: Localized; price?: number | null; icon?: string }[];
  dinnerMenu?: { _key?: string; name: Localized; description?: Localized; price?: number | null; course: Course }[];
  inclusions?: Experience["inclusions"];
};

export function text(value: Localized | undefined, locale: Locale): string {
  return value?.[locale] || value?.en || value?.es || "";
}
export function validPrice(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}
export function normalizeExperience(raw: RawExperience): Experience {
  const photos: Photo[] = [];
  // General experience gallery: NEVER selected or replaced according to style.
  for (const photo of [...(raw.gallery ?? []), ...(raw.image ? [raw.image] : [])]) {
    const url = photo.asset?.url;
    if (url && !photos.some((item) => item.url === url)) photos.push({ url, alt: photo.alt || text(raw.name, "en") });
  }
  const options = (items: NonNullable<RawExperience["variants"]>, prefix: string): Option[] =>
    items.map((item, index) => ({ id: item._key || `${prefix}-${index}`, name: item.name,
      description: item.description, price: validPrice(item.price) }));
  const kind = raw.experienceKind === "dinner" ? "dinner" : "proposal";
  return {
    id: raw._id, slug: raw.slug?.current || raw._id, kind,
    name: raw.name ?? {}, description: raw.description, price: validPrice(raw.price),
    photos: photos.slice(0, 5), styles: options(raw.variants ?? [], "style"),
    // Dinner transport is an inclusion, never a transport add-on.
    extras: options((raw.addons ?? []).filter((item) => kind !== "dinner" || item.icon !== "car"), "extra"),
    menu: (raw.dinnerMenu ?? []).filter((dish) => COURSES.includes(dish.course)).map((dish, index) => ({
      id: dish._key || `dish-${index}`, name: dish.name, description: dish.description,
      price: validPrice(dish.price), course: dish.course,
    })), inclusions: raw.inclusions ?? [],
  };
}
export function defaultSelection(experience: Experience): Selection {
  return { style: experience.styles[0]?.id ?? "", extras: [], occasion: "date", wine: "white",
    guests: [{ starter: "", main: "", dessert: "" }, { starter: "", main: "", dessert: "" }] };
}
export function restoreSelection(experience: Experience, value: unknown): Selection {
  const fallback = defaultSelection(experience);
  if (!value || typeof value !== "object") return fallback;
  const saved = value as Partial<Selection>;
  const guests = fallback.guests.map((guest, index) => {
    for (const course of COURSES) {
      const id = saved.guests?.[index]?.[course];
      if (typeof id === "string" && experience.menu.some((dish) => dish.id === id && dish.course === course)) guest[course] = id;
    }
    return guest;
  }) as Selection["guests"];
  return { style: experience.styles.some((style) => style.id === saved.style) ? saved.style! : fallback.style,
    extras: Array.isArray(saved.extras) ? [...new Set(saved.extras.filter((id) => experience.extras.some((extra) => extra.id === id)))] : [],
    occasion: OCCASIONS.includes(saved.occasion as Occasion) ? saved.occasion! : fallback.occasion,
    wine: saved.wine === "red" ? "red" : "white", guests };
}
export function menuReady(experience: Experience): boolean {
  return COURSES.every((course) => experience.menu.some((dish) => dish.course === course));
}
export function calculateQuote(experience: Experience, selection: Selection) {
  const style = experience.styles.find((item) => item.id === selection.style);
  // A style price REPLACES the base price; it is not an additional charge.
  const base = style ? style.price : experience.styles.length ? null : experience.price;
  const extras = experience.extras.filter((item) => selection.extras.includes(item.id));
  const dishes = experience.kind === "dinner" ? selection.guests.flatMap((guest) =>
    COURSES.map((course) => experience.menu.find((dish) => dish.id === guest[course] && dish.course === course)).filter((dish): dish is Dish => !!dish)) : [];
  const prices = [base, ...extras.map((item) => item.price), ...dishes.map((item) => item.price)];
  const cents = (price: number) => Math.round(price * 100);
  const subtotal = prices.reduce<number>((sum, price) => sum + (price === null ? 0 : cents(price)), 0) / 100;
  const incomplete = prices.some((price) => price === null) ||
    (experience.kind === "dinner" && (!menuReady(experience) || dishes.length !== 6));
  return { style, base, extras, dishes, subtotal, total: incomplete ? null : subtotal };
}
export function destinationDate(now = new Date()): string {
  // Punta Cana date, not the visitor's time zone and not UTC.
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Santo_Domingo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
