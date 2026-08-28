"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { BrowserQRCodeReader } from "@zxing/browser"
import {
  Camera,
  CheckCircle2,
  LocateFixed,
  LogOut,
  RefreshCw,
  ShieldAlert,
  WifiOff,
} from "lucide-react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  workerCheckInAction,
  workerCheckOutAction,
  workerLocationAction,
} from "@/features/dashboard/actions/operations.actions"
import type { OperationsShift } from "@/features/dashboard/data/portal-client"

type QueueItem = {
  id: string
  kind: "check-in" | "check-out" | "location"
  shiftId?: string
  body: Record<string, unknown>
  createdAt: string
}
type TokenClaims = { projectId: string; siteId: string }
const DB_NAME = "buildink-workforce"
const STORE = "attendance-events"

export function WorkerAttendanceCheckIn({
  initialShift,
}: {
  initialShift: OperationsShift | null
}) {
  const [shift, setShift] = useState(initialShift)
  const [mode, setMode] = useState<"QR" | "PIN">("QR")
  const [token, setToken] = useState("")
  const [projectId, setProjectId] = useState(initialShift?.projectId ?? "")
  const [siteId, setSiteId] = useState(initialShift?.siteId ?? "")
  const [message, setMessage] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [online, setOnline] = useState(true)
  const [gps, setGps] = useState<{
    accuracy: number
    sampledAt: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<{ stop(): void } | null>(null)
  const deviceId = useDeviceId()

  const refreshQueue = useCallback(
    async () => setPendingCount((await queueAll()).length),
    [],
  )
  const flush = useCallback(async () => {
    if (!navigator.onLine) return
    for (const item of await queueAll()) {
      const result =
        item.kind === "check-in"
          ? await workerCheckInAction(item.body)
          : item.kind === "check-out"
            ? await workerCheckOutAction(item.shiftId!, item.body)
            : await workerLocationAction(item.shiftId!, item.body)
      if (!result.ok) break
      await queueDelete(item.id)
    }
    await refreshQueue()
  }, [refreshQueue])

  useEffect(() => {
    const sync = () => {
      setOnline(navigator.onLine)
      if (navigator.onLine) void flush()
    }
    const initial = window.setTimeout(() => {
      sync()
      void refreshQueue()
    }, 0)
    window.addEventListener("online", sync)
    window.addEventListener("offline", sync)
    return () => {
      window.removeEventListener("online", sync)
      window.removeEventListener("offline", sync)
      window.clearTimeout(initial)
    }
  }, [flush, refreshQueue])

  const sampleLocation = useCallback(
    async (kind: "location" | "check-out" = "location") => {
      if (!shift) return null
      const position = await locate().catch(() => null)
      if (!position) {
        setMessage("Location permission is required while a shift is active.")
        return null
      }
      const body = {
        capturedAt: new Date().toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        clientEventId: crypto.randomUUID(),
        offline: !navigator.onLine,
      }
      setGps({
        accuracy: position.coords.accuracy,
        sampledAt: String(body.capturedAt),
      })
      if (kind === "location") {
        if (!navigator.onLine)
          await queuePut({
            id: String(body.clientEventId),
            kind,
            shiftId: shift.id,
            body,
            createdAt: String(body.capturedAt),
          })
        else {
          const result = await workerLocationAction(shift.id, body)
          if (!result.ok)
            await queuePut({
              id: String(body.clientEventId),
              kind,
              shiftId: shift.id,
              body: { ...body, offline: true },
              createdAt: String(body.capturedAt),
            })
        }
        await refreshQueue()
      }
      return body
    },
    [refreshQueue, shift],
  )

  useEffect(() => {
    if (!shift) return
    const initial = window.setTimeout(() => void sampleLocation(), 0)
    const timer = window.setInterval(() => void sampleLocation(), 5 * 60_000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(timer)
    }
  }, [sampleLocation, shift])

  async function scan() {
    setMessage(null)
    if (!videoRef.current) return
    const accept = (value: string) => {
      setToken(value)
      const claims = parseClaims(value)
      if (claims) {
        setProjectId(claims.projectId)
        setSiteId(claims.siteId)
      }
      scannerRef.current?.stop()
      setMessage("QR captured. Confirm check-in when ready.")
    }
    try {
      const Detector = (
        window as unknown as {
          BarcodeDetector?: new (options: { formats: string[] }) => {
            detect(
              video: HTMLVideoElement,
            ): Promise<Array<{ rawValue: string }>>
          }
        }
      ).BarcodeDetector
      if (Detector) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        const detector = new Detector({ formats: ["qr_code"] })
        let stopped = false
        scannerRef.current = {
          stop: () => {
            stopped = true
            stream.getTracks().forEach((track) => track.stop())
          },
        }
        while (!stopped) {
          const codes = await detector.detect(videoRef.current)
          if (codes[0]?.rawValue) {
            accept(codes[0].rawValue)
            break
          }
          await new Promise((resolve) => window.setTimeout(resolve, 250))
        }
      } else {
        const reader = new BrowserQRCodeReader()
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result) accept(result.getText())
          },
        )
        scannerRef.current = controls
      }
    } catch {
      setMessage(
        "Camera access failed. Use the site PIN or allow camera permission.",
      )
    }
  }

  function checkIn() {
    startTransition(async () => {
      const position = await locate().catch(() => null)
      if (!projectId || !siteId || !token || !position) {
        setMessage("Project, site, token, and GPS permission are required.")
        return
      }
      const body = {
        projectId,
        siteId,
        method: mode,
        token,
        capturedAt: new Date().toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        consentVersion: "gps-operations-v1",
        clientEventId: crypto.randomUUID(),
        deviceId,
        offline: !navigator.onLine,
      }
      if (!navigator.onLine) {
        await queuePut({
          id: String(body.clientEventId),
          kind: "check-in",
          body,
          createdAt: String(body.capturedAt),
        })
        await refreshQueue()
        setMessage("Check-in saved offline and will sync automatically.")
        return
      }
      const result = await workerCheckInAction(body)
      setMessage(result.ok ? "Check-in recorded." : result.message)
      if (result.ok) window.location.reload()
    })
  }

  function checkOut() {
    startTransition(async () => {
      if (!shift) return
      const body = await sampleLocation("check-out")
      if (!body) return
      if (!navigator.onLine) {
        await queuePut({
          id: String(body.clientEventId),
          kind: "check-out",
          shiftId: shift.id,
          body,
          createdAt: String(body.capturedAt),
        })
        await refreshQueue()
        setShift(null)
        setMessage("Check-out saved offline and will sync automatically.")
        return
      }
      const result = await workerCheckOutAction(shift.id, body)
      setMessage(result.ok ? "Shift submitted for approval." : result.message)
      if (result.ok) setShift(null)
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {!online || pendingCount ? (
        <Alert className="flex gap-3">
          <WifiOff className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">
              {online ? "Sync in progress" : "Offline mode"}
            </p>
            <p>
              {pendingCount} attendance event{pendingCount === 1 ? "" : "s"}{" "}
              waiting to sync.
            </p>
          </div>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="flex gap-3">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Attendance status</p>
            <p>{message}</p>
          </div>
        </Alert>
      ) : null}
      <Card className="overflow-hidden rounded-[28px] shadow-sm">
        <div className="bg-brand-navy p-6 text-white">
          <p className="text-xs font-bold tracking-[.14em] text-white/60 uppercase">
            Worker attendance
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {shift ? "Shift in progress" : "Check in to your site"}
          </h2>
          <p className="mt-1 text-sm text-white/70">
            {shift
              ? shift.checkedInAt
                ? `Started ${new Date(shift.checkedInAt).toLocaleString()}`
                : "Start time unavailable"
              : "Your location is sampled every five minutes while this page remains active."}
          </p>
        </div>
        <div className="space-y-5 p-6">
          {shift ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Signal
                  icon={LocateFixed}
                  label="GPS"
                  value={gps ? `±${Math.round(gps.accuracy)} m` : "Sampling"}
                />
                <Signal
                  icon={RefreshCw}
                  label="Last sample"
                  value={
                    gps
                      ? new Date(gps.sampledAt).toLocaleTimeString()
                      : "Waiting"
                  }
                />
                <Signal
                  icon={CheckCircle2}
                  label="Exceptions"
                  value={String(shift.exceptionCodes.length)}
                />
              </div>
              <Button
                className="min-h-12 w-full bg-red-600 hover:bg-red-700"
                onClick={checkOut}
                disabled={isPending}
              >
                <LogOut className="size-4" /> Check out and submit
              </Button>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={mode === "QR" ? "primary" : "secondary"}
                  onClick={() => setMode("QR")}
                >
                  <Camera className="size-4" /> Scan QR
                </Button>
                <Button
                  variant={mode === "PIN" ? "primary" : "secondary"}
                  onClick={() => setMode("PIN")}
                >
                  Use site PIN
                </Button>
              </div>
              {mode === "QR" ? (
                <>
                  <video
                    ref={videoRef}
                    className="aspect-video w-full rounded-2xl bg-slate-950 object-cover"
                    muted
                    playsInline
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => void scan()}
                  >
                    <Camera className="size-4" /> Start camera scanner
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold"
                    htmlFor="attendance-pin"
                  >
                    Site PIN
                  </label>
                  <Input
                    id="attendance-pin"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                  />
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    className="text-sm font-semibold"
                    htmlFor="attendance-project"
                  >
                    Project ID
                  </label>
                  <Input
                    id="attendance-project"
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="text-sm font-semibold"
                    htmlFor="attendance-site"
                  >
                    Site ID
                  </label>
                  <Input
                    id="attendance-site"
                    value={siteId}
                    onChange={(event) => setSiteId(event.target.value)}
                  />
                </div>
              </div>
              <Button
                className="min-h-12 w-full"
                onClick={checkIn}
                disabled={isPending || !deviceId}
              >
                {isPending ? "Recording…" : "Confirm check-in"}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

function Signal({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LocateFixed
  label: string
  value: string
}) {
  return (
    <div className="border-line/70 rounded-2xl border p-4">
      <Icon className="text-primary size-4" />
      <p className="text-muted mt-2 text-xs font-semibold">{label}</p>
      <p className="text-brand-navy mt-1 font-bold">{value}</p>
    </div>
  )
}
function locate() {
  return new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 30_000,
    }),
  )
}
function parseClaims(token: string): TokenClaims | null {
  try {
    const [part] = token.split(".")
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"))
    const claims = JSON.parse(json) as TokenClaims
    return claims.projectId && claims.siteId ? claims : null
  } catch {
    return null
  }
}
function useDeviceId() {
  const [id, setId] = useState("")
  useEffect(() => {
    const key = "buildink-attendance-device"
    const value = localStorage.getItem(key) ?? crypto.randomUUID()
    localStorage.setItem(key, value)
    const timer = window.setTimeout(() => setId(value), 0)
    return () => window.clearTimeout(timer)
  }, [])
  return id
}
function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE, { keyPath: "id" })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
async function queueAll(): Promise<QueueItem[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll()
    request.onsuccess = () =>
      resolve(
        (request.result as QueueItem[]).sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        ),
      )
    request.onerror = () => reject(request.error)
  })
}
async function queuePut(item: QueueItem) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const request = db
      .transaction(STORE, "readwrite")
      .objectStore(STORE)
      .put(item)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
async function queueDelete(id: string) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const request = db
      .transaction(STORE, "readwrite")
      .objectStore(STORE)
      .delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
