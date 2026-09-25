import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Ellipsis,
  Plus,
  Scissors,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "UI Lab · Primitives",
  description: "Laboratorio visual de los primitives de Gotchu.",
};

const variants = [
  { name: "primary", label: "Confirmar reserva" },
  { name: "secondary", label: "Cambiar horario" },
  { name: "ghost", label: "Cancelar" },
  { name: "destructive", label: "Eliminar reserva" },
  { name: "link", label: "Ver más" },
] as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-lg border bg-card p-4 sm:p-6">
      <header className="space-y-1">
        <h3 className="text-title-sm">{title}</h3>
        <p className="max-w-2xl text-body-sm text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}

function PrimitiveGroup({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="space-y-6">
      <header className="space-y-2">
        <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <h2 id={id} className="text-title-md">
          {title}
        </h2>
        <p className="max-w-2xl text-body text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}

export default function PrimitivesLabPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8 space-y-5">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            Volver
          </Link>
        </Button>

        <div className="space-y-3">
          <p className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
            Primitive components · UI Lab
          </p>
          <h1 className="text-title-lg">UI Lab</h1>
          <p className="max-w-2xl text-body text-muted-foreground">
            Contratos visuales e interactivos de los primitives de Gotchu.
            Recorre los controles con Tab para comprobar su foco y compáralos en
            cada estado antes de usarlos en una feature.
          </p>
        </div>
      </header>

      <div className="space-y-12">
        <PrimitiveGroup
          id="button"
          eyebrow="Primitive 3.1"
          title="Button"
          description="Botones neutrales, directos y cómodos para tocar. Pasa el cursor para ver hover y mantén presionado para comprobar active."
        >
          <div className="space-y-6">
            <Section
              title="Variants"
              description="Cada variante expresa jerarquía o significado; el púrpura se reserva para acciones terciarias y el foco."
            >
              <div className="flex flex-wrap items-center gap-3">
                {variants.map((variant) => (
                  <Button key={variant.name} variant={variant.name}>
                    {variant.label}
                  </Button>
                ))}
              </div>
            </Section>

            <Section
              title="Sizes"
              description="Default mide 44 px, lg 52 px y los botones de icono mantienen un área de 44 × 44 px."
            >
              <div className="flex flex-wrap items-center gap-3">
                <Button size="default">Default · 44 px</Button>
                <Button size="lg">
                  Large · 52 px
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <IconButton label="Agregar cita">
                  <Plus />
                </IconButton>
              </div>
            </Section>

            <Section
              title="Interaction states"
              description="Loading conserva el ancho, comunica ocupación y bloquea la acción; disabled conserva el contexto sin aceptar interacción."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-2xl border-separate border-spacing-y-3 text-left">
                  <thead className="text-caption text-muted-foreground">
                    <tr>
                      <th className="pr-4 font-medium">Variant</th>
                      <th className="px-2 font-medium">Default</th>
                      <th className="px-2 font-medium">Disabled</th>
                      <th className="pl-2 font-medium">Loading</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.name}>
                        <th className="pr-4 text-body-sm font-medium">
                          <code>{variant.name}</code>
                        </th>
                        <td className="px-2">
                          <Button variant={variant.name}>
                            {variant.label}
                          </Button>
                        </td>
                        <td className="px-2">
                          <Button variant={variant.name} disabled>
                            {variant.label}
                          </Button>
                        </td>
                        <td className="pl-2">
                          <Button variant={variant.name} loading>
                            {variant.label}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section
              title="Icons"
              description="El icono acompaña el texto cuando aporta significado. IconButton exige un label accesible aunque solo muestre el símbolo."
            >
              <div className="flex flex-wrap items-center gap-3">
                <Button>
                  <Check data-icon="inline-start" />
                  Confirmar
                </Button>
                <Button variant="secondary">
                  Elegir barbero
                  <Scissors data-icon="inline-end" />
                </Button>
                <IconButton variant="secondary" label="Agregar cita">
                  <Plus />
                </IconButton>
                <IconButton variant="ghost" label="Ver servicios">
                  <Scissors />
                </IconButton>
                <IconButton variant="destructive" label="Eliminar reserva">
                  <Trash2 />
                </IconButton>
                <IconButton label="Guardando cambios" loading>
                  <Check />
                </IconButton>
              </div>
            </Section>

            <Section
              title="Focus & keyboard"
              description="El anillo púrpura aparece solo con navegación de teclado, separado 2 px del control. Enter y Espacio activan botones nativos."
            >
              <div className="flex flex-wrap items-center gap-3">
                <Button className="outline-2 outline-offset-2 outline-ring">
                  Focus preview
                </Button>
                <Button variant="secondary">Siguiente con Tab</Button>
                <IconButton variant="ghost" label="Continuar">
                  <ArrowRight />
                </IconButton>
              </div>
            </Section>
          </div>
        </PrimitiveGroup>

        <PrimitiveGroup
          id="form-primitives"
          eyebrow="Primitive 3.2"
          title="Form primitives"
          description="Input, Textarea y NativeSelect conservan la semántica nativa. Field los convierte en una unidad accesible con nombre, ayuda y error conectados."
        >
          <div className="space-y-6">
            <Section
              title="Field composition"
              description="La etiqueta siempre permanece visible. Field genera y conecta los IDs sin ocultar las props nativas del control."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Nombre del cliente"
                  description="Así aparecerá en la agenda."
                  required
                >
                  <Input name="customer-name" placeholder="Ej. Andrea Rojas" />
                </Field>

                <Field
                  label="WhatsApp"
                  description="Lo usaremos para confirmar la cita."
                  required
                >
                  <Input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    name="customer-whatsapp"
                    placeholder="Ej. 71234567"
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Input states"
              description="Hover refuerza el borde; focus-visible usa el anillo púrpura. Invalid, disabled y read-only conservan diferencias semánticas nativas."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Default" description="Disponible para edición.">
                  <Input placeholder="Escribe un valor" />
                </Field>

                <Field
                  label="Disabled"
                  description="No acepta foco ni edición."
                >
                  <Input defaultValue="Valor no disponible" disabled />
                </Field>

                <Field
                  label="Read-only"
                  description="Puede recibir foco y su contenido puede copiarse."
                >
                  <Input defaultValue="Código GTC-1042" readOnly />
                </Field>

                <Field label="Invalid" error="Este campo es obligatorio.">
                  <Input defaultValue="" />
                </Field>
              </div>
            </Section>

            <Section
              title="Textarea states"
              description="Textarea comparte el mismo contrato visual y accesible, permite crecimiento vertical y mantiene texto de 16 px."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Notas"
                  description="Incluye preferencias útiles para la atención."
                >
                  <Textarea placeholder="Ej. Prefiere tijera en los laterales" />
                </Field>

                <Field
                  label="Notas con error"
                  error="Resume la nota en un máximo de 200 caracteres."
                >
                  <Textarea defaultValue="Una nota que necesita corrección." />
                </Field>

                <Field label="Disabled" description="No está disponible.">
                  <Textarea defaultValue="Edición deshabilitada" disabled />
                </Field>

                <Field
                  label="Read-only"
                  description="Sigue disponible para lectura y selección."
                >
                  <Textarea
                    defaultValue="Nota registrada por recepción."
                    readOnly
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="NativeSelect states"
              description="El selector mantiene el control nativo del dispositivo y comparte etiqueta, ayuda, error y estados con los demás campos."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Barbero"
                  description="Elige un profesional disponible."
                >
                  <NativeSelect defaultValue="">
                    <option value="" disabled>
                      Selecciona un barbero
                    </option>
                    <option value="andres">Andrés</option>
                    <option value="marco">Marco</option>
                  </NativeSelect>
                </Field>

                <Field label="Servicio" description="Selección no disponible.">
                  <NativeSelect defaultValue="corte" disabled>
                    <option value="corte">Corte clásico</option>
                  </NativeSelect>
                </Field>

                <Field
                  label="Horario"
                  error="Selecciona un horario para continuar."
                >
                  <NativeSelect defaultValue="">
                    <option value="" disabled>
                      Selecciona un horario
                    </option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                  </NativeSelect>
                </Field>
              </div>
            </Section>
          </div>
        </PrimitiveGroup>

        <PrimitiveGroup
          id="surface-primitives"
          eyebrow="Primitive 3.3"
          title="Surface primitives"
          description="Card agrupa contenido relacionado con una superficie neutral; Separator comunica un límite real entre secciones sin sustituir al espaciado."
        >
          <div className="space-y-6">
            <Section
              title="Card sizes"
              description="Default usa el ritmo de 16 px de Gotchu. Small conserva la misma composición con un ritmo compacto de 12 px."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h4>Default Card</h4>
                    </CardTitle>
                    <CardDescription>
                      Superficie, borde y radio definidos por tokens semánticos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body">
                      El contenido mantiene un ritmo interno de 16 px.
                    </p>
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardHeader>
                    <CardTitle>
                      <h4>Small Card</h4>
                    </CardTitle>
                    <CardDescription>
                      La composición permanece igual con menor densidad.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body-sm">
                      El contenido compacto usa un ritmo interno de 12 px.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </Section>

            <Section
              title="Card composition"
              description="Header, Title, Description, Action, Content y Footer se combinan sin introducir significado de producto en el primitive."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h4>Composición completa</h4>
                    </CardTitle>
                    <CardDescription>
                      Cada región conserva la misma alineación horizontal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body">
                      El contenido principal puede crecer sin cambiar el
                      contrato de la superficie.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary">Acción secundaria</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h4>Header con acción</h4>
                    </CardTitle>
                    <CardDescription>
                      CardAction alinea controles sin decidir qué hacen.
                    </CardDescription>
                    <CardAction>
                      <IconButton variant="ghost" label="Más opciones">
                        <Ellipsis />
                      </IconButton>
                    </CardAction>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body">
                      La acción pertenece al componente que compone la Card.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      <h4>Contenido largo</h4>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-body">
                      Una Card debe admitir contenido que ocupe varias líneas
                      sin truncarlo ni imponer una altura fija. La superficie
                      comunica que estos elementos pertenecen al mismo grupo,
                      mientras la página conserva el control de su jerarquía.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <p className="text-body">Card con contenido mínimo.</p>
                  </CardContent>
                </Card>
              </div>
            </Section>

            <Section
              title="Separator orientations"
              description="Horizontal es la orientación predeterminada. Vertical toma la altura disponible de su contenedor."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-body-sm font-semibold">Primera sección</p>
                  <Separator />
                  <p className="text-body-sm font-semibold">Segunda sección</p>
                </div>

                <div className="flex h-6 items-center gap-3">
                  <span className="text-body-sm font-semibold">Elemento</span>
                  <Separator orientation="vertical" />
                  <span className="text-body-sm font-semibold">Elemento</span>
                </div>
              </div>
            </Section>

            <Section
              title="Badge variants"
              description="Las etiquetas comunican significado con texto y color. No actúan como controles."
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="neutral">Neutral</Badge>
                <Badge variant="success">Confirmada</Badge>
                <Badge variant="warning">Pendiente</Badge>
                <Badge variant="danger">Rechazada</Badge>
                <Badge variant="information">Información</Badge>
                <Badge variant="outline">Demo</Badge>
              </div>
            </Section>

            <Section
              title="Skeleton"
              description="Bloques de carga que conservan el espacio del contenido mientras llega la página."
            >
              <div aria-hidden="true" className="max-w-sm space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </Section>
          </div>
        </PrimitiveGroup>
      </div>
    </main>
  );
}
