import type {
  PublicArticle,
  PublicEntityRecord,
  PublicHelpArticle,
  PublicLegalDocument,
  PublicModule,
} from "@/features/public/types/public.types"

function record(
  input: PublicEntityRecord,
): PublicEntityRecord {
  return input
}

export const publicEntities: Record<PublicModule, PublicEntityRecord[]> = {
  companies: [
    record({
      module: "companies",
      slug: "alpine-build-italia",
      title: "Alpine Build Italia",
      subtitle: "General contractor for civic and logistics projects",
      summary:
        "A Milan-based contractor delivering industrial shells, fit-outs and phased refurbishment programs across Northern Italy.",
      location: "Milan, Lombardy",
      verification: "Verified company",
      categories: ["General Contracting", "Logistics", "Fit-out"],
      tags: ["ISO 9001", "Design-build", "Fast-track"],
      metrics: [
        { label: "Active public projects", value: "8" },
        { label: "Approved certifications", value: "6" },
        { label: "Average review score", value: "—" },
      ],
      contact: {
        email: "contact@alpinebuild.example",
        phone: "+39 02 5550 4412",
        website: "https://www.alpinebuild.example",
        address: "Via Torino 14, Milan, Italy",
        hours: "Mon-Fri, 09:00-18:00",
      },
      sections: [
        {
          id: "overview",
          title: "Overview",
          body: "Alpine Build Italia combines procurement, site coordination and specialist partner management for complex delivery programs where phasing and safety are critical.",
        },
        {
          id: "specializations",
          title: "Specializations",
          body: "The company is strongest in logistics hubs, civic refurbishment and industrial fit-out packages.",
          items: [
            "Main works coordination and sequencing",
            "Structural adaptation and shell packages",
            "Interior fit-out, MEP integration and handover planning",
          ],
        },
        {
          id: "trust",
          title: "Trust and compliance",
          body: "Public verification covers identity, company existence, selected certifications and approved public contact channels.",
        },
      ],
      subpages: [
        {
          slug: "services",
          title: "Services and expertise",
          description:
            "A focused view of public services, capability statements and linked project proof.",
          sections: [
            {
              id: "service-cards",
              title: "Core services",
              body: "Public service cards emphasize scope clarity rather than long boilerplate.",
              items: [
                "General contracting and package coordination",
                "Industrial fit-out and phased delivery",
                "Refurbishment planning with occupied-site constraints",
              ],
            },
            {
              id: "industries",
              title: "Industries served",
              body: "Current public focus includes logistics, civic infrastructure and light industrial upgrades.",
            },
          ],
        },
        {
          slug: "projects",
          title: "Projects portfolio",
          description: "Approved public project references linked to the company.",
          sections: [
            {
              id: "portfolio",
              title: "Featured public projects",
              body: "Project cards should stay concise and decision-focused.",
              items: [
                "Parma distribution center shell and fit-out",
                "Turin municipal depot retrofit",
                "Bergamo logistics mezzanine expansion",
              ],
            },
          ],
        },
        {
          slug: "reviews",
          title: "Reviews and responses",
          description: "Moderated review summaries and company replies.",
          sections: [
            {
              id: "ratings",
              title: "Public review summary",
              body: "No published reviews yet.",
            },
          ],
        },
        {
          slug: "certifications",
          title: "Certifications and compliance",
          description: "Approved public certification metadata without exposing private documents.",
          sections: [
            {
              id: "certificates",
              title: "Certification highlights",
              body: "Only approved metadata is public.",
              items: ["ISO 9001", "SOA public works category", "Safety management declaration"],
            },
          ],
        },
        {
          slug: "contact",
          title: "Contact and quote request",
          description: "Privacy-aware contact options and quote request flow.",
          sections: [
            {
              id: "contact-flow",
              title: "Contact expectations",
              body: "Public contact focuses on quote requests, capability discussions and approved contact routes.",
            },
          ],
        },
      ],
      relatedSlugs: ["cantiere-primo-group"],
    }),
    record({
      module: "companies",
      slug: "cantiere-primo-group",
      title: "Cantiere Primo Group",
      subtitle: "Civil and public-realm specialist",
      summary:
        "A Florence contractor focused on streetscape upgrades, public-realm packages and structural remediation for municipal owners.",
      location: "Florence, Tuscany",
      verification: "Pending enhanced review",
      categories: ["Civil Works", "Public Realm", "Remediation"],
      tags: ["Municipal", "Roadworks", "Concrete repair"],
      metrics: [
        { label: "Regions served", value: "4" },
        { label: "Published references", value: "5" },
        { label: "Public team profiles", value: "3" },
      ],
      contact: {
        email: "info@cantiereprimo.example",
        phone: "+39 055 883 1120",
        address: "Piazza Libertà 21, Florence, Italy",
        hours: "Mon-Fri, 08:30-17:30",
      },
      sections: [
        {
          id: "overview",
          title: "Overview",
          body: "Cantiere Primo Group specializes in public-facing infrastructure work where stakeholder coordination and continuity planning shape delivery.",
        },
        {
          id: "services",
          title: "Delivery strengths",
          body: "Public works packaging, concrete repair and public-realm sequencing sit at the center of this profile.",
        },
      ],
    }),
  ],
  profiles: [
    record({
      module: "profiles",
      slug: "marco-ferri-contractor",
      title: "Marco Ferri",
      subtitle: "Contractor profile • Envelope and façade packages",
      summary:
        "Independent contractor profile with public façade, rainscreen and envelope delivery experience across commercial refurbishments.",
      location: "Bologna, Emilia-Romagna",
      verification: "Verified profile",
      categories: ["Contractor", "Façades", "Commercial Refurbishment"],
      tags: ["Italian", "English", "Available Q4"],
      metrics: [
        { label: "Years of experience", value: "14" },
        { label: "Featured projects", value: "7" },
        { label: "Languages", value: "2" },
      ],
      contact: {
        email: "marco.ferri@example.com",
        phone: "+39 051 440 9911",
      },
      sections: [
        {
          id: "about",
          title: "About this profile",
          body: "This public contractor profile is structured around capability, location, verification and approved contact paths rather than internal company permissions.",
        },
        {
          id: "skills",
          title: "Skills and services",
          body: "Marco focuses on envelope systems, renovation sequencing and subcontractor coordination.",
          items: [
            "Façade package planning and coordination",
            "Refurbishment sequencing in live environments",
            "Supplier and installer interface management",
          ],
        },
      ],
      relatedSlugs: ["alpine-build-italia"],
    }),
    record({
      module: "profiles",
      slug: "sara-amin-worker",
      title: "Sara Amin",
      subtitle: "Worker profile • Site document control and coordination",
      summary:
        "A multilingual worker profile centered on site coordination, document control and subcontractor communication support.",
      location: "Rome, Lazio",
      verification: "Verified profile",
      categories: ["Worker", "Coordination", "Documentation"],
      tags: ["Arabic", "Italian", "Immediate availability"],
      metrics: [
        { label: "Years of experience", value: "6" },
        { label: "Certifications", value: "3" },
        { label: "Open to travel", value: "Yes" },
      ],
      contact: {
        email: "sara.amin@example.com",
      },
      sections: [
        {
          id: "about",
          title: "Profile summary",
          body: "Sara supports document flow, multilingual communication and site administration in fast-moving projects.",
        },
      ],
    }),
  ],
  suppliers: [
    record({
      module: "suppliers",
      slug: "nord-steel-supply",
      title: "Nord Steel Supply",
      subtitle: "Structural steel and metal package supplier",
      summary:
        "A supplier directory detail oriented around public product categories, service regions and approved enquiry routes.",
      location: "Brescia, Lombardy",
      verification: "Verified supplier",
      categories: ["Steel", "Metalwork", "Custom fabrication"],
      tags: ["Catalog ready", "Northern Italy", "B2B supply"],
      metrics: [
        { label: "Catalog families", value: "12" },
        { label: "Regions served", value: "7" },
        { label: "Lead time range", value: "2-6 weeks" },
      ],
      contact: {
        email: "sales@nordsteel.example",
        phone: "+39 030 221 7650",
        hours: "Mon-Fri, 08:00-17:00",
      },
      sections: [
        {
          id: "catalog",
          title: "Catalog overview",
          body: "The supplier detail page highlights categories, service coverage and approved enquiry paths rather than private pricing contracts.",
        },
      ],
    }),
  ],
  equipment: [
    record({
      module: "equipment",
      slug: "merlo-telehandler-rotational-40-26",
      title: "Merlo Rotational Telehandler 40.26",
      subtitle: "Telehandler listing • Rotational boom • Operator optional",
      summary:
        "A public equipment listing showing what a visitor needs before deciding whether to enquire.",
      location: "Verona, Veneto",
      verification: "Verified listing",
      categories: ["Telehandler", "Lifting", "Plant hire"],
      tags: ["Available this month", "Operator optional", "Maintained"],
      metrics: [
        { label: "Year", value: "2023" },
        { label: "Condition", value: "Excellent" },
        { label: "Availability", value: "Weekdays" },
      ],
      contact: {
        email: "hire@plantflow.example",
        phone: "+39 045 220 9990",
      },
      sections: [
        {
          id: "specs",
          title: "Public specifications",
          body: "Gallery, capacity, condition and service area lead the decision flow on this page.",
          items: [
            "40m class reach with rotational head",
            "Maintenance records retained privately",
            "Service area available on request",
          ],
        },
      ],
    }),
  ],
  projects: [
    record({
      module: "projects",
      slug: "turin-logistics-yard-upgrade",
      title: "Turin Logistics Yard Upgrade",
      subtitle: "Public project opportunity",
      summary:
        "A staged logistics-yard upgrade with public scoping information, dates and approved proposal CTA rules.",
      location: "Turin, Piedmont",
      verification: "Published project",
      categories: ["Infrastructure", "Logistics", "External works"],
      tags: ["Deadline 28 Aug 2026", "Budget public", "Proposal open"],
      metrics: [
        { label: "Status", value: "Open" },
        { label: "Budget", value: "€1.8M" },
        { label: "Delivery window", value: "14 weeks" },
      ],
      contact: {
        email: "projects@yardworks.example",
      },
      sections: [
        {
          id: "scope",
          title: "Project scope",
          body: "The detail page explains scope, timeline and related attachments while preserving proposal privacy.",
        },
        {
          id: "requirements",
          title: "Public requirements",
          body: "Proposal eligibility, package categories and deadline communication remain explicit on public project pages.",
        },
      ],
    }),
  ],
  tenders: [
    record({
      module: "tenders",
      slug: "naples-waterfront-restoration-lot-2",
      title: "Naples Waterfront Restoration • Lot 2",
      subtitle: "Public tender summary",
      summary:
        "An example tender detail with source attribution, deadline visibility and public attachment access rules.",
      location: "Naples, Campania",
      verification: "Imported public tender",
      categories: ["Public works", "Waterfront", "Restoration"],
      tags: ["Official source", "Open", "Documents available"],
      metrics: [
        { label: "Deadline", value: "02 Sep 2026" },
        { label: "Value", value: "€4.4M" },
        { label: "Source", value: "Municipal procurement" },
      ],
      contact: {
        website: "https://procurement.example",
      },
      sections: [
        {
          id: "scope",
          title: "Tender scope",
          body: "Tender pages emphasize source authority, eligibility and timeline clarity.",
        },
      ],
    }),
  ],
  "opportunities-companies": [
    record({
      module: "opportunities-companies",
      slug: "bari-hotel-fitout-subcontractors",
      title: "Seeking hotel fit-out subcontractors",
      subtitle: "Looking for a company",
      summary:
        "A company-request detail page focused on capability, region, dates and an eligibility-aware response CTA.",
      location: "Bari, Apulia",
      verification: "Verified requester",
      categories: ["Fit-out", "Interiors", "Hospitality"],
      tags: ["Response open", "Subcontractors", "Interior packages"],
      metrics: [
        { label: "Start date", value: "15 Sep 2026" },
        { label: "Duration", value: "10 weeks" },
        { label: "Package count", value: "3" },
      ],
      contact: {
        email: "procurement@ospitalia.example",
      },
      sections: [
        {
          id: "capability",
          title: "Required capability",
          body: "The request page should separate itself clearly from tenders and projects while staying just as decision-focused.",
        },
      ],
    }),
  ],
  "opportunities-workers": [
    record({
      module: "opportunities-workers",
      slug: "venice-mep-coordination-team",
      title: "Looking for MEP coordination team",
      subtitle: "Looking for workers",
      summary:
        "A workforce request showing trade, quantity, timing and contact/application pathways.",
      location: "Venice, Veneto",
      verification: "Verified requester",
      categories: ["MEP", "Coordination", "Site support"],
      tags: ["5 positions", "Contract basis", "Starts October"],
      metrics: [
        { label: "Trade", value: "MEP coordination" },
        { label: "Quantity", value: "5" },
        { label: "Duration", value: "6 months" },
      ],
      contact: {
        email: "staffing@lagunaprojects.example",
      },
      sections: [
        {
          id: "need",
          title: "Workforce need",
          body: "The public detail flow should let eligible visitors understand the need quickly and then move into protected application steps.",
        },
      ],
    }),
  ],
}

export const publicArticles: PublicArticle[] = [
  {
    slug: "how-verified-profiles-build-faster-trust",
    title: "How verified profiles build faster trust on construction marketplaces",
    excerpt:
      "Why visible verification, clear categories and public contact rules improve conversion before the first message is sent.",
    category: "Trust",
    author: "Buildink Editorial",
    updatedAt: "2026-08-08",
    readingTime: "6 min read",
    sections: [
      {
        id: "intro",
        title: "Why this matters",
        body: "Trust signals reduce hesitation in fragmented procurement and hiring workflows.",
      },
      {
        id: "signals",
        title: "Signals that matter",
        body: "Visitors respond best to verification, relevance and availability signals they can interpret quickly.",
      },
    ],
  },
  {
    slug: "what-to-publish-on-a-company-profile-first",
    title: "What to publish on a company profile first",
    excerpt:
      "A practical order for publishing public company information without leaking private operational details.",
    category: "Company profiles",
    author: "Buildink Editorial",
    updatedAt: "2026-08-07",
    readingTime: "4 min read",
    sections: [
      {
        id: "order",
        title: "Start with the essentials",
        body: "Identity, categories, approved contact channels and proof projects create the first useful public layer.",
      },
    ],
  },
]

export const helpArticles: PublicHelpArticle[] = [
  {
    slug: "how-to-choose-the-right-profile-type",
    title: "How to choose the right Buildink profile type",
    excerpt:
      "Understand when to use Individual, Worker, Contractor, Supplier Contact or Service Provider.",
    category: "Account and profile",
    updatedAt: "2026-08-08",
    sections: [
      {
        id: "overview",
        title: "Choose the profile that matches how you work",
        body: "Profile types shape public discovery and some onboarding fields, but company authority still comes from permissions and memberships.",
      },
    ],
  },
  {
    slug: "how-public-contact-settings-work",
    title: "How public contact settings work",
    excerpt:
      "What becomes publicly visible and how approved contact paths are controlled.",
    category: "Privacy and security",
    updatedAt: "2026-08-06",
    sections: [
      {
        id: "contact",
        title: "Approved public contact",
        body: "Public detail pages should only show contact methods that the platform has approved for publication.",
      },
    ],
  },
]

export const legalDocuments: PublicLegalDocument[] = [
  {
    slug: "privacy",
    updatedAt: "2026-08-08",
    sections: [
      {
        id: "controller",
        title: "Controller identity",
        body: "This legal template is designed to receive final client-approved privacy text and structured section navigation.",
      },
      {
        id: "rights",
        title: "User rights",
        body: "Public legal pages must stay readable on mobile and expose anchored sections for fast navigation.",
      },
    ],
  },
  {
    slug: "terms",
    updatedAt: "2026-08-08",
    sections: [
      {
        id: "agreement",
        title: "Service use and eligibility",
        body: "Terms content should be loaded from approved text and presented with consistent public-site legal navigation.",
      },
    ],
  },
  {
    slug: "cookies",
    updatedAt: "2026-08-08",
    sections: [
      {
        id: "consent",
        title: "Cookie categories and controls",
        body: "Cookie guidance should explain what categories exist, how consent works and where the user can reopen settings.",
      },
    ],
  },
]
