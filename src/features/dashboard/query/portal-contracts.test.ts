import { describe, expect, it } from "vitest"

import {
  companyVisibilityContract,
  memberUpdateContract,
  projectMutationContract,
  profileVisibilityContract,
} from "./portal-contracts"

describe("identity and company portal contracts", () => {
  it("requires the complete profile visibility response", () => {
    expect(() =>
      profileVisibilityContract.parse({
        publicProfileVisible: false,
        websiteVisible: false,
        displayNameVisible: true,
        profileImageVisible: true,
        biographyVisible: true,
        skillsVisible: true,
        languagesVisible: true,
        portfolioVisible: true,
        reviewsVisible: true,
        generalLocationVisible: true,
        exactAddressVisible: false,
        phoneVisible: false,
        emailVisible: false,
        availabilityVisible: true,
        lastActiveVisible: false,
        searchEngineIndexable: false,
        version: 1,
      }),
    ).not.toThrow()
  })

  it("keeps all company visibility decisions typed", () => {
    const result = companyVisibilityContract.safeParse({
      publicProfileVisible: true,
      websiteVisible: true,
      legalNameVisible: true,
      identifiersVisible: false,
      descriptionVisible: true,
      logoVisible: true,
      galleryVisible: false,
      capabilitiesVisible: true,
      catalogueVisible: true,
      equipmentVisible: false,
      projectsVisible: true,
      reviewsVisible: true,
      generalLocationVisible: true,
      exactAddressVisible: false,
      phoneVisible: false,
      emailVisible: false,
      websiteUrlVisible: true,
      businessHoursVisible: false,
      searchEngineIndexable: true,
    })
    expect(result.success).toBe(true)
  })

  it("rejects non-positive stale versions for member updates", () => {
    expect(memberUpdateContract.safeParse({ version: 0 }).success).toBe(false)
  })

  it("PAL-00654/PAL-00655 keeps project coordinates paired", () => {
    const result = projectMutationContract.safeParse({
      title: "Milan civic renewal",
      description: "A detailed and accessible project delivery scope.",
      categoryId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      cityId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      latitude: 45.46,
    })
    expect(result.success).toBe(false)
  })

  it("PAL-00738 keeps scored project criteria normalized", () => {
    const result = projectMutationContract.safeParse({
      title: "Milan civic renewal",
      description: "A detailed and accessible project delivery scope.",
      categoryId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      cityId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      criteria: [
        {
          label: "Technical delivery",
          kind: "TECHNICAL",
          weight: 75,
          required: true,
          sortOrder: 0,
        },
      ],
    })
    expect(result.success).toBe(false)
  })
})
