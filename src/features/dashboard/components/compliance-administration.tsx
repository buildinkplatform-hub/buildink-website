"use client"

import { LoaderCircle, ShieldCheck } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  assignComplianceAction,
  transitionComplianceAction,
} from "@/features/dashboard/actions/operations-completion.actions"
import { OperationsEvidenceUploader } from "@/features/dashboard/components/operations-evidence-uploader"
import { OperationsStatusBadge } from "@/features/dashboard/components/operations-ui"

type Assignment = Record<string, unknown>
type Props = {
  companyId: string
  projectId: string
  canManage: boolean
  data: {
    items: Assignment[]
    workers: Array<{ id: string; displayName: string | null }>
    requirements: Array<{ id: string; title: string }>
    credentials: Array<{
      id: string
      profileId: string
      title: string
      status: string
      expiresOn: string | null
    }>
  }
}

export function ComplianceAdministration({
  companyId,
  projectId,
  data,
  canManage,
}: Props) {
  const t = useTranslations("operations.completion")
  const [items, setItems] = useState<Assignment[]>(data.items)
  const [requirementId, setRequirementId] = useState("")
  const [workerId, setWorkerId] = useState("")
  const [credentialId, setCredentialId] = useState("none")
  const [review, setReview] = useState<{ row: Assignment; status: string }>()
  const [reason, setReason] = useState("")
  const [expiry, setExpiry] = useState("")
  const [pending, startTransition] = useTransition()
  const workerCredentials = useMemo(
    () =>
      data.credentials.filter(
        (credential) => credential.profileId === workerId,
      ),
    [data.credentials, workerId],
  )

  function assign() {
    startTransition(async () => {
      try {
        const result = await assignComplianceAction(companyId, projectId, {
          requirementId,
          workerId,
          credentialId: credentialId === "none" ? null : credentialId,
        })
        setItems((current) => [
          {
            requirementId,
            workerId,
            credentialId: credentialId === "none" ? null : credentialId,
            status: "PENDING",
            version: 1,
            ...result,
          },
          ...current.filter((item) => String(item.id) !== result.id),
        ])
        setRequirementId("")
        setWorkerId("")
        setCredentialId("none")
        toast.success(t("complianceAssigned"))
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("assignmentFailed"),
        )
      }
    })
  }

  function transition() {
    if (!review) return
    const assignmentId = String(review.row.id)
    startTransition(async () => {
      try {
        const body = {
          status: review.status,
          version: Number(review.row.version),
          reason: reason || null,
          waiverExpiresOn: review.status === "WAIVED" ? expiry : null,
        }
        const result = await transitionComplianceAction(
          companyId,
          projectId,
          assignmentId,
          body,
        )
        setItems((current) =>
          current.map((item) =>
            String(item.id) === assignmentId
              ? {
                  ...item,
                  ...body,
                  version: Number(item.version ?? 0) + 1,
                  ...result,
                }
              : item,
          ),
        )
        toast.success(t("complianceRecorded"))
        setReview(undefined)
        setReason("")
        setExpiry("")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("reviewFailed"))
      }
    })
  }

  return (
    <section className="space-y-4">
      {canManage ? (
        <Card className="rounded-2xl p-5 shadow-none">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary size-5" />
            <h3 className="text-foreground font-semibold">
              {t("credentialWaivers")}
            </h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Select value={requirementId} onValueChange={setRequirementId}>
              <SelectTrigger>
                <SelectValue placeholder={t("requirement")} />
              </SelectTrigger>
              <SelectContent>
                {data.requirements.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={workerId}
              onValueChange={(value) => {
                setWorkerId(value)
                setCredentialId("none")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("worker")} />
              </SelectTrigger>
              <SelectContent>
                {data.workers.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.displayName || item.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={credentialId} onValueChange={setCredentialId}>
              <SelectTrigger>
                <SelectValue placeholder={t("credential")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("noCredential")}</SelectItem>
                {workerCredentials.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title} · {item.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="mt-3"
            disabled={pending || !requirementId || !workerId}
            aria-busy={pending}
            onClick={assign}
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            {t("assignRequirement")}
          </Button>
        </Card>
      ) : null}
      <div className="grid gap-3">
        {items.map((row) => {
          const worker = data.workers.find((item) => item.id === row.workerId)
          const requirement = data.requirements.find(
            (item) => item.id === row.requirementId,
          )
          return (
            <Card key={String(row.id)} className="rounded-2xl p-4 shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-foreground font-semibold">
                    {requirement?.title ?? String(row.requirementId)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {worker?.displayName ?? String(row.workerId)}
                  </p>
                  <div className="mt-2">
                    <OperationsStatusBadge status={String(row.status)} />
                  </div>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setReview({ row, status: "COMPLIANT" })}
                    >
                      {t("markCompliant")}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setReview({ row, status: "NON_COMPLIANT" })
                      }
                    >
                      {t("reject")}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setReview({ row, status: "WAIVED" })}
                    >
                      {t("waive")}
                    </Button>
                    <OperationsEvidenceUploader
                      companyId={companyId}
                      projectId={projectId}
                      entityType="compliance_assignment"
                      entityId={String(row.id)}
                    />
                  </div>
                ) : null}
              </div>
            </Card>
          )
        })}
      </div>
      {canManage ? (
        <Dialog
          open={Boolean(review)}
          onOpenChange={(open) => {
            if (!open && !pending) setReview(undefined)
          }}
        >
          <DialogContent showClose={!pending}>
            <DialogHeader>
              <DialogTitle>
                {review?.status === "WAIVED"
                  ? t("grantWaiver")
                  : t("recordComplianceDecision")}
              </DialogTitle>
              <DialogDescription>
                {t("complianceDecisionDescription")}
              </DialogDescription>
            </DialogHeader>
            <label className="mt-4 grid gap-1.5 text-sm font-semibold">
              {t("reason")}
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                required={review?.status !== "COMPLIANT"}
              />
            </label>
            {review?.status === "WAIVED" ? (
              <label className="mt-3 grid gap-1.5 text-sm font-semibold">
                {t("waiverExpires")}
                <Input
                  type="date"
                  value={expiry}
                  onChange={(event) => setExpiry(event.target.value)}
                />
              </label>
            ) : null}
            <DialogFooter>
              <Button
                variant="secondary"
                disabled={pending}
                onClick={() => setReview(undefined)}
              >
                {t("cancel")}
              </Button>
              <Button
                disabled={
                  pending ||
                  (review?.status !== "COMPLIANT" &&
                    reason.trim().length < 3) ||
                  (review?.status === "WAIVED" && !expiry)
                }
                aria-busy={pending}
                onClick={transition}
              >
                {pending ? (
                  <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" />
                ) : null}
                {t("confirmDecision")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </section>
  )
}
