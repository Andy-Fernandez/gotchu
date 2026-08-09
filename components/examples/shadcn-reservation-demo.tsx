"use client";

import { useState } from "react";
import { Check, Clock3, Scissors } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const services = [
  { name: "Corte clásico", duration: "45 min", price: "Bs 35" },
  { name: "Corte + barba", duration: "60 min", price: "Bs 50" },
  { name: "Barba", duration: "30 min", price: "Bs 25" },
  { name: "Lavado", duration: "15 min", price: "Bs 15" },
];

export function ShadcnReservationDemo() {
  const [selectedService, setSelectedService] = useState(services[0].name);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const service = services.find((item) => item.name === selectedService);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customerName.trim()) {
      return;
    }

    setSubmitted(true);
  }

  function handleReset() {
    setCustomerName("");
    setNotes("");
    setSubmitted(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="h-fit">
        <CardHeader>
          <Badge variant="outline" className="mb-2 w-fit">
            <Scissors aria-hidden="true" />
            Ejemplo de composición
          </Badge>
          <CardTitle>Qué estás viendo</CardTitle>
          <CardDescription>
            shadcn/ui agrega el código fuente de cada primitive a tu repo. Tú
            decides cómo combinarlo y cómo se ve el producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              1
            </span>
            <span className="mt-0.5 shrink-0 g-accent text-accent-foreground">5</span>
            <p>
              <strong className="text-foreground">Primitive:</strong> importa
              <code className="ml-1 rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
                Button
              </code>{" "}
              desde tu carpeta local.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              2
            </span>
            <p>
              <strong className="text-foreground">Composición:</strong> usa
              <code className="ml-1 rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
                Card
              </code>{" "}
              para agrupar una parte del flujo.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              3
            </span>
            <p>
              <strong className="text-foreground">Producto:</strong> agregas
              estado, reglas y textos propios de Gotchu.
            </p>
          </div>
        </CardContent>
        <CardFooter className="block">
          <p className="font-mono text-xs text-muted-foreground">
            components/ui/* → componentes que puedes editar
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Reserva rápida</CardTitle>
              <CardDescription className="mt-1">
                Un formulario local, sin base de datos.
              </CardDescription>
            </div>
            <Badge variant={submitted ? "default" : "secondary"}>
              {submitted ? "Enviada" : "Borrador"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Elige un servicio</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {services.map((item) => (
                  <Button
                    key={item.name}
                    type="button"
                    variant={
                      selectedService === item.name ? "default" : "outline"
                    }
                    className="h-auto min-h-20 justify-start px-3 py-3 text-left"
                    onClick={() => {
                      setSelectedService(item.name);
                      setSubmitted(false);
                    }}
                  >
                    <span className="flex flex-col items-start gap-1">
                      <span>{item.name}</span>
                      <span className="text-xs font-normal opacity-75">
                        {item.duration} · {item.price}
                      </span>
                    </span>
                  </Button>
                ))}
              </div>
            </fieldset>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="customer-name" className="text-sm font-medium">
                  Tu nombre
                </label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(event) => {
                    setCustomerName(event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="Ej. Valeria"
                  required
                  className="min-h-12 px-4"
                />
              </div>
              <div className="flex items-end gap-2 rounded-lg bg-muted px-4 py-3 text-sm">
                <Clock3
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-medium text-foreground">
                    Duración estimada
                  </span>
                  <span className="text-muted-foreground">
                    {service?.duration}
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reservation-notes" className="text-sm font-medium">
                Nota opcional
              </label>
              <Textarea
                id="reservation-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ej. Prefiero un acabado natural"
                className="min-h-24 px-4 py-3"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div role="status" aria-live="polite" className="text-sm">
                {submitted ? (
                  <span className="flex items-center gap-2 text-success">
                    <Check className="size-4" aria-hidden="true" />
                    Reserva de prueba creada para {customerName}.
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    Elige un servicio y completa tu nombre.
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={handleReset}>
                  Limpiar
                </Button>
                <Button type="submit" className="min-h-11 px-5">
                  Probar reserva
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
