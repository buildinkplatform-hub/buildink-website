export function verificationRequirementLabel(
  input: { required: boolean; expiryRequired: boolean },
  labels: { required: string; optional: string; expiryRequired: string },
) {
  const requirement = input.required ? labels.required : labels.optional
  return input.expiryRequired
    ? `${requirement} · ${labels.expiryRequired}`
    : requirement
}
