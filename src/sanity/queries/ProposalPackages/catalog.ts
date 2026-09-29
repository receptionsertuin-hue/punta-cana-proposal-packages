import { client } from "@/sanity/lib/client";
import { normalizeExperience, type RawExperience } from "@/components/ExperienceCatalog/catalog";

// Existing proposal documents remain proposals; a proposal with dinner is NOT
// automatically moved into the separate romantic-dinner product line.
const query = `*[_type == "IndividualProposalPackage" && !(_id in path("drafts.**"))]
  | order(coalesce(catalogOrder, 1000) asc, _createdAt asc) {
  _id, slug, name, description, price, experienceKind,
  image {alt, asset->{url}}, gallery[]{alt, asset->{url}},
  variants[]{_key, name, description, price},
  addons[]{_key, name, description, price, icon},
  inclusions[]{title, description},
  dinnerMenu[]{_key, name, description, price, course}
}`;
export async function getExperienceCatalog() {
  const documents = await client.fetch<RawExperience[]>(query, {}, { next: { revalidate: 300 } });
  return documents.map(normalizeExperience);
}
