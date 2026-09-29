import { type SchemaTypeDefinition } from "sanity";
import GeneralLayout from "./GeneralLayout/GeneralLayout";
import { blogLocalizedString, blogLocalizedText, localizedBlock, localizedString, localizedText } from "./Localized/localized";
import { legalDocuments } from "./LegalDocuments/LegalDocuments";
import HomePageHero from "./HomePage/Hero";
import HomePageBrandStatement from "./HomePage/BrandStatement";
import HomePagePackageCategories from "./HomePage/PackageCategories";
import HomePagePackageCategory from "./HomePage/PackageCategory";
import HomePageHowItWorks from "./HomePage/HowItWorks";
import HomePageHowItWorksStep from "./HomePage/HowItWorksStep";
import HomePageFeatureStory from "./HomePage/FeatureStory";
import HomePageFeatureStorySection from "./HomePage/FeatureStorySection";
import HomePageTrustIndicators from "./HomePage/TrustIndicators";
import HomePageCTABanner from "./HomePage/CTABanner";
import ProposalPackages from "./ProposalPackages/ProposalPackages";
// Same Sanity document type, extended with catalog and dinner configuration.
import IndividualProposalPackage from "./ExperienceCatalog/ExperiencePackage";
import ProposalPackageHeaders from "./ProposalPackages/ProposalPackageHeaders";
import CustomizationOptions from "./ProposalPackages/CustomizationOptions";
import StoriesPageHero from "./StoriesPage/Hero";
import ProposalType from "./StoriesPage/ProposalType";
import IndividualStory from "./StoriesPage/IndividualStory";
import StoriesPageCtaStrip from "./StoriesPage/CtaStrip";
import BlogPageHero from "./BlogPage/BlogPageHero";
import BlogPost from "./BlogPage/BlogPost";
import BlogPostSeo from "./BlogPage/BlogPostSeo";
import BlogCategory from "./BlogPage/BlogCategory";
import BlogPageCtaStrip from "./BlogPage/CtaStrip";
import ContactPageContent from "./ContactPage/Content";
import HowItWorksPageHero from "./HowItWorksPage/Hero";
import HowItWorksPageHowItWorksSteps from "./HowItWorksPage/HowItWorksSteps";
import HowItWorksPageHowItWorksFAQ from "./HowItWorksPage/HowItWorksFAQ";
import HowItWorksPageHowItWorksFaqCategory from "./HowItWorksPage/HowItWorksFaqCategory";
import HowItWorksPageHowItWorksCTA from "./HowItWorksPage/HowItWorksCTA";
import FaqsPageHeroComponent from "./FaqsPage/HeroComponent";
import FaqsPageFaqContactStrip from "./FaqsPage/FaqContactStrip";
import FaqsPageFaqsCategories from "./FaqsPage/FaqsCategories";
import FaqsPageFaqs from "./FaqsPage/Faqs";
import PageSeo from "./SEO/PageSeo";
import Seo from "./SEO/seo";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [localizedString, localizedText, localizedBlock, blogLocalizedString, blogLocalizedText,
    GeneralLayout, PageSeo, Seo, legalDocuments,
    HomePageHero, HomePageBrandStatement, HomePagePackageCategories, HomePagePackageCategory,
    HomePageHowItWorks, HomePageHowItWorksStep, HomePageFeatureStory, HomePageFeatureStorySection, HomePageTrustIndicators, HomePageCTABanner,
    ProposalPackages, IndividualProposalPackage, ProposalPackageHeaders, CustomizationOptions,
    StoriesPageHero, ProposalType, IndividualStory, StoriesPageCtaStrip,
    BlogPageHero, BlogPostSeo, BlogPost, BlogCategory, BlogPageCtaStrip, ContactPageContent,
    HowItWorksPageHero, HowItWorksPageHowItWorksSteps, HowItWorksPageHowItWorksFAQ, HowItWorksPageHowItWorksFaqCategory, HowItWorksPageHowItWorksCTA,
    FaqsPageHeroComponent, FaqsPageFaqContactStrip, FaqsPageFaqsCategories, FaqsPageFaqs],
};
