import { mergeMessages } from "../merge-messages"
import authForgotPassword from "./pages/auth/forgot-password.json"
import authLogin from "./pages/auth/login.json"
import authRegister from "./pages/auth/register.json"
import authResetPassword from "./pages/auth/reset-password.json"
import authShared from "./pages/auth/shared.json"
import dashboard from "./pages/dashboard.json"
import home from "./pages/home.json"
import notFound from "./pages/not-found.json"
import offline from "./pages/offline.json"
import publicSite from "./pages/public-site.json"
import onboardingDocuments from "./pages/onboarding/documents.json"
import onboardingProfile from "./pages/onboarding/profile.json"
import onboardingReview from "./pages/onboarding/review.json"
import onboardingRole from "./pages/onboarding/role.json"
import onboardingShared from "./pages/onboarding/shared.json"
import common from "./shared/common.json"
import metadata from "./shared/metadata.json"

export default mergeMessages(
  metadata,
  common,
  home,
  publicSite,
  authShared,
  authLogin,
  authRegister,
  authForgotPassword,
  authResetPassword,
  onboardingShared,
  onboardingRole,
  onboardingProfile,
  onboardingDocuments,
  onboardingReview,
  dashboard,
  offline,
  notFound,
)
