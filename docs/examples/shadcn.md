# Ejemplo sencillo de shadcn/ui

La demo está disponible en [`/ejemplo-shadcn`](../../app/ejemplo-shadcn/page.tsx) cuando el proyecto corre en desarrollo.

## Qué instala shadcn/ui

shadcn/ui no funciona como una librería cerrada. El CLI copia el código fuente de cada componente dentro del repo para que puedas leerlo y modificarlo.

En este proyecto, los primitives están en `components/ui` y se importan con el alias `@`:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
```

La utilidad `cn` de `lib/utils.ts` combina clases de Tailwind sin dejar conflictos entre variantes.

## Cómo agregar otro primitive

Desde la raíz del repo:

```bash
pnpm dlx shadcn@latest add dialog
```

El archivo nuevo aparecerá en `components/ui/dialog.tsx`. Antes de usarlo en una pantalla, revisa sus props y adapta sus clases a los tokens de Gotchu.

## Patrón mínimo para implementarlo tú

1. Agrega solo el primitive que necesitas.
2. Impórtalo desde `@/components/ui/...`.
3. Compón la interfaz en un componente propio, por ejemplo `components/examples/...`.
4. Si necesitas `useState`, `onClick` u otro evento, agrega `"use client"` al componente interactivo. La página App Router puede mantenerse como Server Component e importar ese componente.

Ejemplo mínimo:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MiEjemplo() {
  const [guardado, setGuardado] = useState(false);

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <p>{guardado ? "Guardado" : "Todavía no guardado"}</p>
        <Button onClick={() => setGuardado(true)}>Guardar</Button>
      </CardContent>
    </Card>
  );
}
```

La demo completa agrega `Input`, `Textarea`, `Badge`, `Separator`, variantes de `Button` y un formulario controlado, pero conserva la misma idea.
