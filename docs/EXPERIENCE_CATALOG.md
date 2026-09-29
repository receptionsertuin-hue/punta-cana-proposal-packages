# Interactive proposal catalog and Punta Cana Romantic Dinners

## Status and safe rollout

This change is a review implementation, not a production deployment. It preserves the existing Sanity document type and all existing content. No menu, price, package style or photograph has been invented or written to the live CMS. No booking, email or payment has been sent during development.

The connected repository was inspected through GitHub. A local full clone and dependency installation were unavailable in this environment, so a complete Next.js build, genuine browser interaction/visual QA and Netlify delivery test have NOT been completed. The local checks that did pass are listed below. Keep the pull request in draft until integration and content checks pass.

## Customer experience

The home page becomes a compact, bilingual catalog with two anchored sections: Proposal Packages and Punta Cana Romantic Dinners. The existing header logo, language switcher, footer, stories, blog, contact pages and SEO metadata remain in place.

Each proposal is a single card with a general 3-5 photograph carousel, style selector, independently priced optional extras, live estimate and inline availability request. Style prices are full prices and REPLACE the base price. The general gallery does not change when a style changes. Gallery motion pauses on interaction, focus, document invisibility or reduced-motion preference; only visible galleries advance. Four cards per section are initially shown, with in-place expansion. Existing deep links expand the appropriate card.

Dinner cards let each guest independently select a starter, main and dessert. Every menu item has an explicit per-person supplement, including 0 for an included choice. The occasion and red/white wine are separate selections. The base experience includes round-trip transportation throughout Punta Cana, basic table decoration, sparkling wine to celebrate, red or white wine, a welcome drink and a three-course dinner for two. Transportation is never added a second time as an extra.

Unknown prices are shown as requiring quotation, not as zero. An incomplete menu is not presented as a final total. Other special requests and dietary requirements are sent to the team for confirmation, without promises about allergen accommodation.

## CMS configuration before release

Open the existing `IndividualProposalPackage` documents in Sanity Studio. Their schema is extended, not replaced by a new document type.

1. Review the complete set of published documents; the new catalog reads published IndividualProposalPackage records. Remove unintended test/obsolete records from publication before release.
2. Existing records default to proposal. A proposal WITH dinner remains a proposal. Set `experienceKind` to `dinner` only for the separate anniversary/birthday/date-night dinner product line. New dinner records have to be created and approved in the CMS; without them the dinner section shows an honest enquiry panel, not fake purchasable products.
3. Set `catalogOrder` to control ordering. Add 3-5 distinct real photographs to each general gallery. New schema validation enforces this. Legacy records with fewer photographs are not artificially padded or silently hidden: repair them before release.
4. Use the existing variants array for actual approved styles such as Boho, Velvet or Tropical, and enter each FULL price. Those names are examples, not new inventory created by this change. The inherited schema requires at least one variant; for a one-style dinner, add its basic setup at the full base price.
5. Use each experience's existing addons array for its approved videographer, violinist, photographer or other extras. Dinner and proposal prices remain independent. Confirm dinner standalone services are priced consistently with the business policy against undercutting equivalent proposal packages. No arbitrary markup, floor price or invented service price is imposed by code.
6. Populate `dinnerMenu` with confirmed dishes in both languages. Include at least one option for each course; more choices are supported. Enter 0 explicitly when included or the confirmed supplement per person. Do not publish placeholder dishes. Keep transport out of dinner extras; inherited `car` extras are filtered because standard transport is included.
7. Review current homepage SEO copy and structured data in the CMS for the broader proposal-and-dinner offer. Existing metadata and structured data are preserved rather than overwritten with fabricated marketing claims.

## Forms and price integrity

Submissions use the existing `package-booking` Netlify form at `/__forms.html`. Package, style, extras and the full configuration are included; the existing `notes` field receives structured JSON with each guest's menu, supplements, occasion, wine choice, dietary notes and custom requests. Reusing an existing static form field avoids Netlify dropping new dynamic fields.

The form is an availability enquiry, not checkout. The browser estimate is NOT an authoritative invoice or payment amount. The team must verify availability, menu, service prices and any applicable charges before confirming a reservation. No payment handling was added. Test a controlled submission in the deployment preview and confirm the complete JSON reaches the real recipient before release; do not use real customer details for tests.

Only selected product IDs, occasion, wine and menu IDs are saved in sessionStorage. Contact details, dietary text, notes and client-supplied prices are not saved there. Stored IDs are checked against current CMS data and the total is recalculated with current prices.

## Migration and URLs

`next.config.ts` permanently redirects old Classic, Modern, Dining and Adventure category URLs to the proposal section; package URLs redirect to their matching `#experience-{slug}` card. English default, explicit English and Spanish prefixes are covered. Old page source files remain for rollback but cease to be the customer journey. The sitemap excludes redirected category and package paths while retaining blog, stories and other pages. Header and footer links use the new catalog anchors.

Confirm that the connected repository is the production deployment source and that every legacy slug maps to a published record before activating these redirects. Check both locale variants and a deep link to a card beyond the first four.

## Verification

Completed locally:
- 16 business-logic tests: full-price replacement, independent extras, no gallery/style coupling, unique 3-5 images, no fabricated missing photos, included dinner transport, independent guest menus, per-person supplements, incomplete/unknown prices, currency rounding, validated restored selections, isolated card state and Punta Cana date boundaries.
- TypeScript/TSX syntax checks for all 10 changed/new TS/TSX source files.
- Strict TypeScript checking for the standalone catalog business logic.

Run in the complete repository:

```sh
npm ci
node --test tests/experience-catalog.test.cjs
npx tsc --noEmit
npm run build
```

The included pull-request workflow runs unit tests, repository type checking and linting for new catalog modules. It does not deploy, change CMS content or send enquiries. A full build needs the repository's normal public Sanity configuration.

Manual release checks: desktop and 320/375/390px mobile layouts; English/Spanish; keyboard and touch swipes; autoplay pause and reduced motion; independent card state; menu selection for both guests; required fields inside collapsible sections; submission failures and successful Netlify delivery; all old redirects; no transport surcharge; correct published menu, prices and photographs. Check unpriced special requests are confirmed by the team, not silently included.
