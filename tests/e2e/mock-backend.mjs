import { createServer } from "node:http"

const port = Number(process.env.E2E_BACKEND_PORT ?? 4100)

const server = createServer((request, response) => {
  response.setHeader("content-type", "application/json")
  if (request.url === "/health/live") {
    response.end(JSON.stringify({ status: "ok" }))
    return
  }
  if (request.url === "/api/v1/auth/me") {
    response.end(
      JSON.stringify({
        success: true,
        data: {
          identity: { id: "e2e-user", email: process.env.E2E_USER_EMAIL },
          account: {
            status: "ACTIVE",
            onboardingStatus: "APPROVED",
            nextAction: "enter_portal",
          },
          profile: {
            displayName: "Buildink E2E User",
            profileType: "CONTRACTOR",
            verificationStatus: "VERIFIED",
          },
        },
        requestId: "e2e-request",
      }),
    )
    return
  }
  response.statusCode = 404
  response.end(
    JSON.stringify({
      success: false,
      error: { code: "NOT_FOUND", message: "E2E mock route not found" },
    }),
  )
})

server.listen(port, "127.0.0.1")

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
