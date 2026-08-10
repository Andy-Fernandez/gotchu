import * as React from "react"

import { cn } from "@/lib/utils"

type FieldControlProps = {
  id?: string
  required?: boolean
  "aria-describedby"?: string
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
}

type FieldProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
  children: React.ReactElement<FieldControlProps>
}

function Field({
  className,
  label,
  description,
  error,
  required = false,
  children,
  ...props
}: FieldProps) {
  const generatedId = React.useId()
  const controlId = children.props.id ?? generatedId
  const descriptionId = description ? `${controlId}-description` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy = Array.from(
    new Set(
      [
        ...(children.props["aria-describedby"]?.split(/\s+/) ?? []),
        descriptionId,
        errorId,
      ].filter(Boolean)
    )
  ).join(" ")

  const control = React.cloneElement(children, {
    id: controlId,
    required: required || children.props.required,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : children.props["aria-invalid"],
  })

  return (
    <div data-slot="field" className={cn("space-y-2", className)} {...props}>
      <label
        data-slot="field-label"
        htmlFor={controlId}
        className="block text-body-sm font-semibold text-foreground"
      >
        {label}
        {(required || children.props.required) && (
          <span aria-hidden="true" className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>

      {control}

      {description && (
        <p
          id={descriptionId}
          data-slot="field-description"
          className="text-caption text-muted-foreground"
        >
          {description}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          data-slot="field-error"
          className="text-caption font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { Field }
export type { FieldProps }
