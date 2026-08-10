"use client"

import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { forwardRef, useState, type InputHTMLAttributes } from "react"

import { Input } from "@/components/ui/input"

export const PasswordInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const [visible, setVisible] = useState(false)
  const t = useTranslations("auth")
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className="ltr-content pe-12"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="text-muted hover:bg-light-blue hover:text-primary absolute end-1 top-1 flex size-10 items-center justify-center rounded-lg"
        aria-label={visible ? t("hidePassword") : t("showPassword")}
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  )
})
PasswordInput.displayName = "PasswordInput"
