"use client"

import { useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { FormState } from "@/lib/form-state"

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className,
}: {
  label: string
  name: string
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className ?? "space-y-2"}>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function SubmitButton({ children, pendingText = "Salvando…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? pendingText : children}
    </Button>
  )
}

export function FormAlert({ state }: { state: FormState }) {
  if (!state.error) return null
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
      {state.error}
    </div>
  )
}

/** Botão que executa uma Server Action, com confirmação opcional e mensagem de erro inline. */
export function ActionButton({
  action,
  children,
  confirmText,
  variant = "outline",
  size = "sm",
}: {
  action: () => Promise<FormState | void>
  children: React.ReactNode
  confirmText?: string
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string>()
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={pending}
        onClick={() => {
          if (confirmText && !window.confirm(confirmText)) return
          setError(undefined)
          start(async () => {
            const r = await action()
            if (r && r.error) setError(r.error)
          })
        }}
      >
        {pending ? "Aguarde…" : children}
      </Button>
      {error && (
        <span className="text-xs text-destructive font-medium" role="alert">
          {error}
        </span>
      )}
    </span>
  )
}
