import { defineArrayMember, defineField, defineType } from "sanity";
import Base from "../ProposalPackages/IndividualProposalPackage";

// Keep the original document name, fields and existing content intact.
export default defineType({
  ...Base,
  title: "Experiences: proposals & romantic dinners",
  groups: [...Base.groups, { name: "catalog", title: "Interactive catalog" }],
  fields: [
    ...Base.fields.filter((field) => field.name !== "gallery"),
    defineField({
      name: "experienceKind", title: "Experience type", type: "string", group: "catalog",
      initialValue: "proposal", options: { list: [{ title: "Marriage proposal (including proposals with dinner)", value: "proposal" }, { title: "Romantic dinner (anniversary, birthday, date night...)", value: "dinner" }], layout: "radio" },
      description: "Existing documents default to proposal. Set dinner only for the separate celebration product line.",
    }),
    defineField({ name: "catalogOrder", title: "Catalog order", type: "number", group: "catalog", validation: (Rule) => Rule.integer().min(0) }),
    defineField({
      name: "gallery", title: "General experience gallery (3 to 5 photos)", type: "array", group: "gallery",
      description: "General photos of this experience, independent of the selected style. Use distinct real photos; do not duplicate one photo to fill the carousel.",
      of: [defineArrayMember({ type: "image", options: { hotspot: true }, fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string", validation: (Rule) => Rule.required() }),
        defineField({ name: "caption", title: "Caption", type: "localizedString" }),
      ] })],
      validation: (Rule) => Rule.required().min(3).max(5).custom((value) => {
        const images = (value ?? []) as { asset?: { _ref?: string } }[];
        const refs = images.map((image) => image.asset?._ref).filter(Boolean);
        return new Set(refs).size === refs.length || "Use different photographs, not duplicate assets.";
      }),
    }),
    defineField({
      name: "dinnerMenu", title: "Three-course dinner menu", type: "array", group: "catalog",
      hidden: ({ document }) => document?.experienceKind !== "dinner",
      description: "Actual available dishes. Each guest selects a starter, main and dessert. Price is a per-person supplement: explicitly enter 0 for an included dish. Do not enter an unconfirmed menu.",
      of: [defineArrayMember({ type: "object", name: "dinnerDish", fields: [
        defineField({ name: "name", title: "Dish", type: "localizedString", validation: (Rule) => Rule.required() }),
        defineField({ name: "description", title: "Ingredients / dietary notes", type: "localizedText" }),
        defineField({ name: "course", title: "Course", type: "string", options: { list: [{ title: "Starter", value: "starter" }, { title: "Main", value: "main" }, { title: "Dessert", value: "dessert" }] }, validation: (Rule) => Rule.required() }),
        defineField({ name: "price", title: "Supplement per guest (USD)", type: "number", initialValue: 0, validation: (Rule) => Rule.required().min(0).precision(2) }),
      ], preview: { select: { title: "name.en", subtitle: "course" } } })],
      validation: (Rule) => Rule.custom((value, context) => {
        if (context.document?.experienceKind !== "dinner") return true;
        const dishes = (value ?? []) as { course?: string }[];
        return ["starter", "main", "dessert"].every((course) => dishes.some((dish) => dish.course === course)) || "A dinner needs at least one real choice for each of its three courses.";
      }),
    }),
  ],
});
