export type RegistrationActionError =
  | "validation"
  | "rate_limited"
  | "backend"
  | "account_exists"
  | "email_rate_limited"
  | "signup_unavailable"
  | "email_delivery"
  | "registration_failed"

interface SupabaseRegistrationError {
  code?: string
  message?: string
  status?: number
}

export function mapRegistrationError(
  error: SupabaseRegistrationError,
): RegistrationActionError {
  switch (error.code) {
    case "email_exists":
    case "user_already_exists":
    case "identity_already_exists":
      return "account_exists"
    case "over_email_send_rate_limit":
      return "email_rate_limited"
    case "signup_disabled":
    case "email_provider_disabled":
    case "provider_disabled":
      return "signup_unavailable"
    case "email_address_invalid":
    case "validation_failed":
    case "weak_password":
      return "validation"
    case "over_request_rate_limit":
      return "rate_limited"
  }

  if (error.status === 429) return "rate_limited"
  if (/email|smtp|confirmation|mailer/i.test(error.message ?? ""))
    return "email_delivery"
  return "registration_failed"
}
