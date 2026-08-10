import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Scissors,
  Trash2,
} from "lucide-react"

import { Button, IconButton } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "UI Lab · Button",
  description: "Laboratorio visual de los primitives de Gotchu.",
}

// const variants = [
//   { name: "default", label: "Confirmar reserva" },
//   { name: "outline", label: "Cambiar horario" },
//   { name: "ghost", label: "Cancelar" },
//   { name: "destructive", label: "Eliminar reserva" },
//   { name: "link", label: "Ver más" },
// ] as const

const variants = [
  { name: "primary", label: "Confirmar reserva" },
  { name: "secondary", label: "Cambiar horario" },
  { name: "ghost", label: "Cancelar" },
  { name: "destructive", label: "Eliminar reserva" },
  { name: "link", label: "Ver más" },
] as const

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5 rounded-lg border bg-card p-4 sm:p-6">
      <header className="space-y-1">
        <h2 className="text-title-sm">{title}</h2>
        <p className="max-w-2xl text-body-sm text-muted-foreground">
          {description}
        </p>
      </header>
      {children}
    </section>
  )
}

export default function ButtonLabPage() {
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
            Primitive 3.1 · UI Lab
          </p>
          <h1 className="text-title-lg">Button</h1>
          <p className="max-w-2xl text-body text-muted-foreground">
            Botones neutrales, directos y cómodos para tocar. Usa Tab para
            recorrerlos, pasa el cursor para ver hover y mantén presionado para
            comprobar active.
          </p>
        </div>
      </header>

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
                      <Button variant={variant.name}>{variant.label}</Button>
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
    </main>
  )
}
