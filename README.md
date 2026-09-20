# 🌍 English Path

Curso de inglés **A2 → B2** hecho a medida, con tutor de IA integrado y orientado a **Comercio Internacional**.

Sesiones de 15, 25 o 45 minutos. El contenido **cambia todos los días** y el tipo de bloque rota según el día de la semana, así que nunca hacés dos veces lo mismo.

---

## Cómo lo abro

**Opción rápida:** doble clic en `index.html`. Funciona todo menos el micrófono.

**Opción recomendada (con micrófono):** el reconocimiento de voz exige un "contexto seguro", así que necesitás `localhost` o `https://`. Abrí una terminal en esta carpeta y corré:

```bash
python -m http.server 8000
```

Después entrá a `http://localhost:8000`. Si tenés Node en vez de Python: `npx serve`.

---

## 📱 En el celular

Una vez que esté en GitHub Pages (instrucciones más abajo), abrí la URL en el teléfono y **instalala como app**:

- **Android / Chrome:** menú ⋮ → "Agregar a pantalla principal" (o te aparece solo un cartel).
- **iPhone / Safari:** botón compartir → "Añadir a pantalla de inicio".

Queda con su icono, se abre a pantalla completa sin barra del navegador, y **funciona sin internet**: un service worker guarda toda la app en el teléfono. Sin conexión perdés sólo lo que necesita la IA (corrección de textos, conversación); vocabulario, gramática, lecturas y traducción siguen andando.

### Que el progreso no se pierda entre celular y compu

Cada navegador guarda su propio progreso, así que sin sincronizar tendrías dos rachas separadas. **Ajustes → Celular y computadora** lo resuelve: guarda tu progreso en un Gist privado de tu cuenta de GitHub.

**Primer dispositivo (por ejemplo, la compu):**

1. Sacá un token de GitHub (está el paso a paso desplegable dentro de la app):
   github.com → Settings → Developer settings → Personal access tokens → **Tokens (classic)** → Generate new token.
   Expiration: **No expiration**. Permisos: marcá **sólo `gist`**, ninguno más.
2. Pegalo en Ajustes y tocá **Conectar** dejando vacío el campo del ID.
3. Te muestra un **ID de Gist**. Anotalo.

**Segundo dispositivo (el celular):**

4. Abrí la app, Ajustes, pegá **el mismo token** y **el ID** que anotaste. Conectar.

Listo. A partir de ahí sincroniza sola al abrir la app y al terminar cada sesión.

> **Lo importante:** no pisa un lado con el otro, **fusiona**. Si hacés vocabulario en el celular a la mañana y gramática en la compu a la noche, al sincronizar quedan las dos cosas. Los XP toman el valor mayor, las unidades quedan aprobadas si lo están en cualquiera de los dos, los logros se unen y cada palabra del SRS conserva la revisión más reciente. Un dispositivo recién instalado **no puede borrar** el progreso del otro.

Con el permiso `gist` el token no puede tocar tu código ni tus repositorios. Igual que la key de Gemini, vive sólo en el navegador y nunca se sube al repo.

---

## Cómo funciona la sesión diaria

Cada día se arma una sesión con estos bloques:

| Bloque | Qué hacés |
|---|---|
| 🧠 **Vocabulario** | Flashcards con repetición espaciada (algoritmo SM-2) |
| 📐 **Gramática** | Teoría breve + ejercicios de la unidad que te toca |
| **Destreza del día** | Rota según el día de la semana (abajo) |

La destreza rota así:

| Día | Bloque |
|---|---|
| Lunes | 📖 Lectura |
| Martes | 🎧 Escucha (audio generado por el navegador) |
| Miércoles | ✍️ Escritura corregida por IA |
| Jueves | 🎤 Pronunciación (te escucha el micrófono) |
| Viernes | 🔄 Traducción español → inglés |
| Sábado | 💬 Conversación en vivo con la IA |
| Domingo | ⚔️ Desafío semanal (repaso de todo) |

Si elegís 45 minutos, se agregan bloques extra de destrezas distintas a la del día.

El botón 🎲 en la pantalla de inicio regenera la sesión si el contenido de hoy no te convence.

---

## El tutor de IA (opcional pero recomendado)

La app **funciona completa sin conexión ni API key**: trae 235 palabras, 24 unidades de gramática con 144 ejercicios, 14 lecturas, 11 diálogos, 18 consignas de escritura, 14 roleplays y 50 frases de traducción.

Con una API key de Google Gemini se desbloquea:

- **Corrección de tus textos** con explicación de cada error
- **Conversación en vivo** en los roleplays (negociar, entrevista de trabajo, rueda de prensa)
- **Ejercicios y lecturas nuevas** generadas al momento, sobre tus temas
- **Chat libre** con el tutor para cualquier duda
- **Validación inteligente de traducciones** (acepta versiones correctas distintas a la de referencia)

### Cómo consigo la key

1. Entrá a **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Iniciá sesión con tu cuenta de Google
3. "Create API key" → copiala (empieza con `AIza…`)
4. En la app: **Ajustes → API key → pegala → "Guardar y probar"**

Tiene capa gratuita. Para el uso de esta app no deberías pagar nada.

### 🔒 Sobre la seguridad de la key

**La key se guarda únicamente en el `localStorage` de tu navegador.** No está en ningún archivo del proyecto, no se sube a GitHub y no viaja a ningún servidor que no sea el de Google.

Por eso **nunca escribas la key dentro del código**. Si alguna vez la pegás en un archivo y lo subís, GitHub la detecta y Google te la revoca automáticamente. Si eso pasa, generá una nueva y listo.

Cada persona que abra tu app pone su propia key: no estás pagando el uso de nadie más.

---

## Subirlo a GitHub Pages

Así lo usás desde el celular y tenés el micrófono habilitado (Pages sirve por `https://`).

```bash
cd "ruta/a/proyecto aprender ingles"
git init
git add .
git commit -m "English Path: curso de inglés con tutor de IA"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/english-path.git
git push -u origin main
```

Después, en GitHub: **Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `(root)` → Save**.

En un par de minutos queda en `https://TU-USUARIO.github.io/english-path/`.

> Si ponés el repo en público, cualquiera puede abrir la app pero nadie ve tu progreso ni tu key: todo eso vive en tu navegador.

---

## Test de nivel

Si no sabés en qué nivel estás, la app te lo mide. Aparece en el onboarding ("No estoy seguro — tomame un test") y también en **Ajustes → Tomar el test de nivel**, por si querés repetirlo más adelante para ver cuánto subiste.

Son 14 preguntas **adaptativas**: arranca en A2 y si acertás se pone más difícil, si errás se ablanda. Así te ubica entre A1 y C1 en unos cinco minutos sin hacerte responder 50 preguntas.

No te muestra si acertaste o no durante el test — a propósito: verlo cambiaría cómo respondés las siguientes y falsearía el resultado. Al final sí ves el desglose completo por nivel, que te dice dónde se te cortó.

Funciona sin API key (banco de 30 preguntas). Con key podés pedir un test generado a medida.

El resultado **no es una sentencia**: la app ajusta el nivel sola según cómo te vaya, y podés cambiarlo a mano cuando quieras.

---

## Tu progreso

Todo se guarda en el navegador: racha, XP, rango, vocabulario aprendido, unidades aprobadas y los textos que escribiste.

Si activaste la sincronización, además viaja a tu Gist privado y aparece en tus dos dispositivos. Si no, **vive sólo en ese navegador**: borrar los datos del sitio o cambiar de computadora lo pierde.

En **Ajustes → Copia de seguridad** tenés *Exportar* e *Importar* en archivo. Sirve como respaldo aunque uses la sincronización.

### Rangos

Vas subiendo de rango con XP, con temática de la carrera:

📋 Intern → 📊 Junior Analyst → 📦 Trade Assistant → 🚢 Export Officer → 🤝 Account Manager → 🧭 Trade Manager → 🏛️ Head of Exports → 💼 Trade Director → 🌍 Global Strategist

---

## La currícula

**24 unidades de gramática** ordenadas de A2 a B2. La app te lleva por ellas sola: cuando aprobás una con 75% o más, pasa a la siguiente. Cuando terminás un nivel, sube al siguiente automáticamente.

- **A2 (8 unidades):** presente simple vs. continuo, pasado simple, present perfect vs. past simple, contables/incontables, comparativos, futuro, modales, preposiciones.
- **B1 (9 unidades):** present perfect continuous, pasado continuo, condicionales 1 y 2, gerundios vs. infinitivos, voz pasiva, relativas, estilo indirecto, *used to*, phrasal verbs.
- **B2 (7 unidades):** tercer condicional y mixtos, modales de deducción, pasiva avanzada e impersonal, *wish / would rather*, conectores formales, inversión y énfasis, y **lenguaje diplomático para negociación** — la más útil para tu carrera.

Cada unidad marca el **error típico del hispanohablante**, que es donde más se nota el nivel.

---

## Estructura del proyecto

```
index.html              Punto de entrada
manifest.webmanifest    Datos para instalarla como app
sw.js                   Service worker (funciona sin conexión)
icons/                  Iconos de la app
css/styles.css          Estilos (tema oscuro y claro)
js/
  core.js               Utilidades, fechas, RNG con semilla, almacenamiento
  state.js              Perfil, XP, rachas, rangos, logros
  srs.js                Repetición espaciada (SM-2)
  session.js            Generador de la sesión diaria
  ai.js                 Cliente de Gemini y prompts del tutor
  sync.js               Sincronización entre dispositivos y fusión de estados
  speech.js             Síntesis y reconocimiento de voz
  ui.js                 Toasts, modales, componentes compartidos
  activities.js         Lógica de cada tipo de bloque
  views.js              Pantallas (inicio, test de nivel, progreso, tutor, ajustes)
  app.js                Arranque y navegación
  data/
    vocab.js            235 palabras con ejemplos y traducción
    grammar-a2/b1/b2.js 24 unidades, 144 ejercicios
    content.js          Lecturas, diálogos, escritura, roleplays, traducciones
    placement.js        Banco del test de nivel (30 preguntas A1-C1)
```

No hay build ni dependencias: es HTML, CSS y JavaScript. Para agregar contenido, editá los archivos de `js/data/` siguiendo el formato que ya está ahí.

> ⚠️ **Si modificás algún archivo**, subí el número de `VERSION` en [sw.js](sw.js). Si no, los navegadores que ya tienen la app instalada siguen sirviendo la versión vieja desde su caché.

---

## Problemas frecuentes

**El micrófono no anda.** Necesitás Chrome o Edge, y abrir por `localhost` o `https://`. Con doble clic en el archivo el navegador lo bloquea.

**No se escucha el audio.** Revisá que en Ajustes haya una voz en inglés. Si la lista está vacía, instalá un paquete de voz en inglés desde la configuración de tu sistema.

**"Superaste el límite gratuito".** Es el límite por minuto de Gemini. Esperá un rato o probá otro modelo en Ajustes.

**Perdí mi progreso.** Si tenías sincronización, conectá el mismo token e ID de Gist y vuelve. Si tenés un export, Ajustes → Importar. Si no, no hay forma de recuperarlo.

**Cambié un archivo y el celular sigue mostrando lo viejo.** Subí `VERSION` en `sw.js`, subí el cambio, y en el teléfono cerrá y reabrí la app. La caché del service worker es justamente lo que la hace andar sin internet.

**En el celular no aparece "Agregar a pantalla principal".** Tiene que ser por `https://` (GitHub Pages sirve). Por `http://localhost` desde otra computadora no va.

**La sincronización dice que el token no es válido.** Lo más común es que le hayas puesto fecha de vencimiento y se haya cumplido. Generá uno nuevo con "No expiration" y pegalo en los dos dispositivos.

---

## Consejo de uso

Lo que hace que esto funcione no es la app, son los días seguidos. Veinte minutos por día valen mucho más que tres horas el domingo, porque la memoria se construye por repetición espaciada en el tiempo.

Elegí un horario fijo y protegé la racha. En seis meses de constancia llegás a B2 con vocabulario técnico de comercio, que es exactamente lo que vas a necesitar el año que viene.
