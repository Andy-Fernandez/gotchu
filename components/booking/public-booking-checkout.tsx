"use client";

import * as React from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileImage,
  LockKeyhole,
  QrCode,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export type PublicBookingCheckoutProps = {
  shopName: string;
  serviceName: string;
  professionalName: string;
  dateLabel: string;
  timeLabel: string;
  totalPriceMinorUnits: number;
  depositMinorUnits: number;
  bookingCode: string;
  timeZone: string;
};

type CheckoutStep = "details" | "deposit" | "preview";

type DetailsErrors = {
  name: string | null;
  whatsapp: string | null;
};

const QR_DEMO_PATTERN = [
  1, 1, 1, 0, 1,
  1, 0, 1, 1, 0,
  1, 1, 1, 0, 1,
  0, 1, 0, 1, 0,
  1, 0, 1, 1, 1,
] as const;

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
const ACCEPTED_RECEIPT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function formatBobMinorUnits(minorUnits: number) {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(minorUnits / 100);
}

function getNameError(value: string) {
  const name = value.trim();

  if (!name) {
    return "Ingresa tu nombre.";
  }

  if (name.length < 2) {
    return "El nombre debe tener al menos 2 caracteres.";
  }

  return null;
}

function getWhatsappError(value: string) {
  const whatsapp = value.trim();

  if (!whatsapp) {
    return "Ingresa tu WhatsApp.";
  }

  if (!/^\+?[\d\s()-]+$/.test(whatsapp)) {
    return "Usa solo números, espacios, paréntesis o guiones.";
  }

  const digitCount = whatsapp.replace(/\D/g, "").length;

  if (digitCount < 8 || digitCount > 15) {
    return "Ingresa entre 8 y 15 dígitos.";
  }

  return null;
}

function getReceiptError(file: File | null) {
  if (!file) {
    return "Selecciona una imagen o un PDF.";
  }

  if (!ACCEPTED_RECEIPT_TYPES.has(file.type)) {
    return "Usa un archivo JPG, PNG o PDF.";
  }

  if (file.size > MAX_RECEIPT_BYTES) {
    return "El archivo debe pesar 10 MB o menos.";
  }

  return null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PublicBookingCheckout({
  shopName,
  serviceName,
  professionalName,
  dateLabel,
  timeLabel,
  totalPriceMinorUnits,
  depositMinorUnits,
  bookingCode,
  timeZone,
}: PublicBookingCheckoutProps) {
  const [step, setStep] = React.useState<CheckoutStep>("details");
  const [customerName, setCustomerName] = React.useState("");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [detailsErrors, setDetailsErrors] = React.useState<DetailsErrors>({
    name: null,
    whatsapp: null,
  });
  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [receiptError, setReceiptError] = React.useState<string | null>(null);

  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const whatsappInputRef = React.useRef<HTMLInputElement>(null);
  const receiptInputRef = React.useRef<HTMLInputElement>(null);
  const hasMounted = React.useRef(false);

  React.useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    headingRef.current?.focus();
  }, [step]);

  function handleDetailsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: DetailsErrors = {
      name: getNameError(customerName),
      whatsapp: getWhatsappError(whatsapp),
    };

    setDetailsErrors(nextErrors);

    if (nextErrors.name) {
      nameInputRef.current?.focus();
      return;
    }

    if (nextErrors.whatsapp) {
      whatsappInputRef.current?.focus();
      return;
    }

    setCustomerName(customerName.trim());
    setWhatsapp(whatsapp.trim());
    setStep(depositMinorUnits > 0 ? "deposit" : "preview");
  }

  function handleReceiptChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;

    setReceiptFile(file);
    setReceiptError(file ? getReceiptError(file) : null);
  }

  function handleDepositSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextError = getReceiptError(receiptFile);
    setReceiptError(nextError);

    if (nextError) {
      receiptInputRef.current?.focus();
      return;
    }

    setStep("preview");
  }

  return (
    <Card className="mx-auto w-full min-w-0 max-w-xl gap-0 py-0 shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <Badge variant="outline" aria-live="polite">
          {step === "details" ? "Tus datos" : step === "deposit" ? "Anticipo demo" : "Vista previa"}
        </Badge>

        <BookingSummary
          shopName={shopName}
          serviceName={serviceName}
          professionalName={professionalName}
          dateLabel={dateLabel}
          timeLabel={timeLabel}
          totalPriceMinorUnits={totalPriceMinorUnits}
          depositMinorUnits={depositMinorUnits}
          timeZone={timeZone}
        />

        <Separator />

        {step === "details" ? (
          <form className="space-y-5" noValidate onSubmit={handleDetailsSubmit}>
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-title-sm tracking-tight outline-none"
              >
                Tus datos
              </h2>
              <p className="mt-1 text-body-sm text-muted-foreground">
                Para identificar tu solicitud.
              </p>
            </div>

            <div className="space-y-4">
              <Field label="Nombre" required error={detailsErrors.name}>
                <Input
                  ref={nameInputRef}
                  name="customerName"
                  autoComplete="name"
                  enterKeyHint="next"
                  maxLength={80}
                  value={customerName}
                  placeholder="Tu nombre"
                  onBlur={() =>
                    setDetailsErrors((current) => ({
                      ...current,
                      name: getNameError(customerName),
                    }))
                  }
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setCustomerName(value);
                    if (detailsErrors.name) {
                      setDetailsErrors((current) => ({
                        ...current,
                        name: getNameError(value),
                      }));
                    }
                  }}
                />
              </Field>

              <Field
                label="WhatsApp"
                description="Incluye el código de país si aplica."
                required
                error={detailsErrors.whatsapp}
              >
                <Input
                  ref={whatsappInputRef}
                  type="tel"
                  name="whatsapp"
                  autoComplete="tel"
                  inputMode="tel"
                  enterKeyHint="done"
                  maxLength={24}
                  value={whatsapp}
                  placeholder="+591 70000000"
                  onBlur={() =>
                    setDetailsErrors((current) => ({
                      ...current,
                      whatsapp: getWhatsappError(whatsapp),
                    }))
                  }
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setWhatsapp(value);
                    if (detailsErrors.whatsapp) {
                      setDetailsErrors((current) => ({
                        ...current,
                        whatsapp: getWhatsappError(value),
                      }));
                    }
                  }}
                />
              </Field>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
            >
              {depositMinorUnits > 0 ? "Continuar al anticipo" : "Revisar solicitud"}
            </Button>
          </form>
        ) : null}

        {step === "deposit" ? (
          <form className="space-y-5" noValidate onSubmit={handleDepositSubmit}>
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-title-sm tracking-tight outline-none"
              >
                Anticipo de demostración
              </h2>
              <p className="mt-1 text-body-sm text-muted-foreground">
                Usa el importe y código exactos.
              </p>
            </div>

            <DemoQrCard
              depositMinorUnits={depositMinorUnits}
              bookingCode={bookingCode}
            />

            <Field
              label="Comprobante"
                description="JPG, PNG o PDF · máximo 10 MB · selección local."
              required
              error={receiptError}
            >
              <Input
                ref={receiptInputRef}
                type="file"
                name="receipt"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleReceiptChange}
              />
            </Field>

            {receiptFile && !receiptError ? (
              <div
                className="flex min-w-0 items-center gap-3 rounded-md border bg-muted p-3"
                aria-live="polite"
              >
                <FileImage className="size-5 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-semibold">
                    {receiptFile.name}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Seleccionado localmente · {formatFileSize(receiptFile.size)}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => setStep("details")}
              >
                <ArrowLeft aria-hidden="true" />
                Volver
              </Button>
              <Button
                type="submit"
                size="lg"
                className="w-full"
              >
                Revisar archivo
              </Button>
            </div>
          </form>
        ) : null}

        {step === "preview" ? (
          <section aria-labelledby="preview-heading" className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-warning-subtle text-warning">
                <Clock3 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <Badge className="mb-2 bg-warning-subtle text-warning">
                  {depositMinorUnits > 0 ? "Ejemplo · pending_review" : "Ejemplo · solicitud"}
                </Badge>
                <h2
                  id="preview-heading"
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-title-sm tracking-tight outline-none"
                >
                  {depositMinorUnits > 0
                    ? "Así se vería pendiente de revisión"
                    : "Datos listos para enviar"}
                </h2>
              </div>
            </div>

            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="rounded-md border border-warning/30 bg-warning-subtle p-4 text-body-sm text-warning"
            >
              <p className="font-semibold">No se creó una reserva real.</p>
              <p className="mt-1">
                {depositMinorUnits > 0
                  ? "Esta vista es una simulación local. El archivo no fue enviado ni cargado."
                  : "Esta vista es una simulación local. Los datos no fueron enviados ni guardados."}
              </p>
            </div>

            <dl className="grid gap-3 rounded-md bg-muted p-4 text-body-sm">
              <SummaryDetail label="Nombre" value={customerName} />
              <SummaryDetail label="WhatsApp" value={whatsapp} />
              <SummaryDetail label="Código" value={bookingCode} mono />
              {depositMinorUnits > 0 ? (
                <SummaryDetail
                  label="Archivo local"
                  value={receiptFile?.name ?? "Sin archivo"}
                />
              ) : null}
            </dl>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => setStep(depositMinorUnits > 0 ? "deposit" : "details")}
            >
              <ArrowLeft aria-hidden="true" />
              {depositMinorUnits > 0 ? "Volver al anticipo" : "Volver a mis datos"}
            </Button>
          </section>
        ) : null}
      </CardContent>

      <CardFooter className="border-t bg-muted px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-caption text-muted-foreground">
          <LockKeyhole className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Vista local de demostración · sin envío remoto</span>
        </div>
      </CardFooter>
    </Card>
  );
}

type BookingSummaryProps = Pick<
  PublicBookingCheckoutProps,
  | "shopName"
  | "serviceName"
  | "professionalName"
  | "dateLabel"
  | "timeLabel"
  | "totalPriceMinorUnits"
  | "depositMinorUnits"
  | "timeZone"
>;

function BookingSummary({
  shopName,
  serviceName,
  professionalName,
  dateLabel,
  timeLabel,
  totalPriceMinorUnits,
  depositMinorUnits,
  timeZone,
}: BookingSummaryProps) {
  return (
    <section
      aria-labelledby="checkout-summary-heading"
      className="rounded-md bg-muted p-3"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption font-medium text-muted-foreground">
            Tu reserva
          </p>
          <h2
            id="checkout-summary-heading"
            className="truncate font-semibold"
          >
            {shopName}
          </h2>
          <p className="mt-0.5 truncate text-body-sm text-muted-foreground">
            {serviceName} · {professionalName}
          </p>
        </div>
        <p className="shrink-0 font-semibold">
          {formatBobMinorUnits(totalPriceMinorUnits)}
        </p>
      </div>

      <div className="mt-3 flex items-start gap-2 border-t border-border pt-3 text-body-sm">
        <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1">
          {dateLabel} · {timeLabel}
          <span className="text-muted-foreground">
            {` · ${timeZone === "America/La_Paz" ? "hora de Bolivia" : timeZone}`}
          </span>
        </p>
        <p className="shrink-0 text-right">
          <span className="block text-caption text-muted-foreground">
            Anticipo
          </span>
          <span className="font-semibold">
            {depositMinorUnits > 0 ? formatBobMinorUnits(depositMinorUnits) : "No requiere"}
          </span>
        </p>
      </div>
    </section>
  );
}

function DemoQrCard({
  depositMinorUnits,
  bookingCode,
}: Pick<
  PublicBookingCheckoutProps,
  "depositMinorUnits" | "bookingCode"
>) {
  return (
    <div className="grid grid-cols-[6rem_1fr] items-center gap-4 rounded-lg bg-foreground p-4 text-primary-foreground sm:grid-cols-[8rem_1fr]">
      <div className="relative mx-auto aspect-square w-24 rounded-md bg-card p-3 text-foreground sm:w-32">
        <div
          aria-hidden="true"
          className="grid h-full grid-cols-5 gap-1 opacity-45"
        >
          {QR_DEMO_PATTERN.map((cell, index) => (
            <span
              key={index}
              className={cell ? "rounded-[2px] bg-foreground" : "bg-transparent"}
            />
          ))}
        </div>
        <span className="absolute inset-x-2 top-1/2 -translate-y-1/2 rotate-[-12deg] rounded-sm bg-card/95 py-1 text-center text-caption font-bold tracking-[0.18em]">
          DEMO
        </span>
      </div>

      <div className="min-w-0 text-left">
        <div className="flex items-center gap-2 text-body-sm font-semibold">
          <QrCode className="size-4" aria-hidden="true" />
          QR de demostración
        </div>
        <p className="mt-1 text-caption text-primary-foreground/70">
          No escaneable
        </p>
        <p className="mt-4 text-title-md">
          {formatBobMinorUnits(depositMinorUnits)}
        </p>
        <p className="mt-1 break-all font-mono text-caption leading-5 text-primary-foreground/80">
          {bookingCode}
        </p>
      </div>
    </div>
  );
}

function SummaryDetail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`min-w-0 break-words font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
