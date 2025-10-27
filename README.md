# 📚 Centralizator Documentație & Linkuri Utile

Acest proiect oferă un hub modern și rapid pentru accesarea documentației și a linkurilor importante din ecosistemul ASiS/ASW.

## 🎯 Cele 4 Funcționalități Principale

### 1. 🔗 Redirect pe Link Scurt (URL Shortener)

Accesează orice documentație rapid prin linkuri scurte personalizate.

**Exemplu:** `https://docu.asiserp.ro/accize`

**Cum funcționează:**

- Accesezi un link scurt de forma `https://docu.asiserp.ro/[numescurt]`
- Sistemul caută automat în baza de date linkul complet asociat
- Ești redirecționat instant către documentația completă
- Ideal pentru: share pe chat, incorporare în alte aplicații, link-uri rapide în documente

**Implementare:** Fișierul `404.html` încarcă `redirect-links.js` care face lookup în API și redirecționează automat.

### 2. 📖 Vizualizare Documentație în Site (Viewer Integrat)

Vizualizează documentele direct în cadrul site-ului, fără a părăsi interfața.

**URL format:** `https://docu.asiserp.ro/redir.html?document_id=[id_google_doc]`

**Cum funcționează:**

- Pagina `redir.html` încarcă și afișează conținutul documentelor Google
- Oferă o experiență unificată de navigare
- Include bară de navigare cu buton "Înapoi" către pagina principală
- Design responsive și optimizat pentru citire

**Implementare:** Fișierul `redir.html` folosește `google-doc-loader.js` pentru a încărca și afișa conținutul.

### 3. � Index Centralizat de Documentație

Catalog complet al tuturor documentațiilor disponibile cu funcții de căutare și filtrare.

**URL:** `https://docu.asiserp.ro/` (tab implicit "Documentație")

**Funcționalități:**

- Afișare card-uri pentru fiecare documentație
- Căutare în timp real
- Filtrare după etichete/categorii
- Acțiuni rapide: "Deschide" și "Copiază link scurt"
- Design modern cu iconițe Material Design
- Datele sunt preluate dinamic din API JSON

### 4. 📊 Detalii Publicare (Changelog Viewer)

Vizualizează informații complete despre o versiune publicată specifică.

**URL format:** `https://docu.asiserp.ro/publicare.html?v=[numar_versiune]`

**Exemplu:** `https://docu.asiserp.ro/publicare.html?v=54439`

**Cum funcționează:**

- Afișează metadata completă a publicării (versiune, dată, tip, număr fișiere)
- Prezintă rezumatul AI al modificărilor
- Design elegant cu gradient highlighting
- Buton "Înapoi" către lista completă de publicări

**Implementare:** Fișierul `publicare.html` extrage parametrul `v` din URL și caută în API-ul de publicări.

## Structura fișierelor

### Pagini principale

- `index.html` — Pagina principală cu navigare pe taburi (Documentație + Publicări)
- `redir.html` — Viewer pentru afișarea documentelor Google în cadrul site-ului
- `publicare.html` — Pagină detaliată pentru o publicare specifică (cu parametru `?v=`)
- `404.html` — Pagina pentru redirect automat (URL shortener)

### Scripts

- `directory.js` — Logica pentru afișarea documentației și publicărilor în interfața principală
- `redirect-links.js` — Implementează funcționalitatea de URL shortener
- `google-doc-loader.js` — Încarcă și afișează documente Google în viewer
- `version-router.js` — Gestionează rutarea și parametrii URL

### Configurare și stiluri

- `cfg.json` — Configurare centralizată cu URL-urile API-urilor
- `style.css` — Stiluri globale pentru design responsive și modern

### Resurse

- `assets/` — Iconițe, favicon și alte resurse grafice (logo, thumbnail pentru social media)

## 🧑‍💻 Cum adaugi conținut nou?

### Pentru documentație (funcționalitățile 1-3)

Adaugă linkul în sursa de date prin API-ul JSON:

- **Endpoint:** `https://asis.asw.ro/asisservice/linkuri?codlink=docu&reponsetype=json`
- **Format:** Fiecare intrare trebuie să conțină:
  - `numescurt` - identificator pentru link-ul scurt (ex: "accize")
  - `urlcomplet` - URL-ul complet către documentație
  - `nume` - titlu afișat în card
  - `descriere` - text descriptiv
  - `icon` - numele iconului Material Design
  - `etichete` - array de categorii/tags

**Nu e nevoie de modificări în cod!** Sistemul preia automat datele actualizate.

### Pentru publicări (funcționalitatea 4)

Publicările sunt adăugate automat prin sistemul de versioning:

- **Endpoint:** `https://asis.asw.ro/asisservice/linkuri?codlink=docup&reponsetype=json`
- **Format:** Fiecare publicare conține:
  - `versiune_publicata` - număr versiune (ex: 54439)
  - `dataora` - timestamp publicare
  - `tip` - "Standard" sau "Critic"
  - `fisiere` - array cu fișierele modificate
  - `rezumat` - text Markdown cu rezumatul AI

Pagina `publicare.html` va fi accesibilă automat la URL-ul `?v=[versiune]`.

### Configurare API endpoints

Editează fișierul `cfg.json` pentru a schimba sursele de date:

```json
{
  "urlDocu": "https://asis.asw.ro/asisservice/linkuri?codlink=docu&reponsetype=json",
  "urlPubl": "https://asis.asw.ro/asisservice/linkuri?codlink=docup&reponsetype=json"
}
```

## 🌐 SEO & Social Media

### Web App Manifest

Fișierul `assets/site.webmanifest` conține configurația pentru Progressive Web App (PWA):

- Nume aplicație: "ASiSerp documentatii"
- Nume scurt: "ASiSdocu"
- Iconițe pentru dispozitive mobile (192x192 și 512x512)
- Display mode: standalone (se deschide ca o aplicație nativă)

### Meta Tags Open Graph & Twitter Cards

Toate paginile includ meta tag-uri pentru:

- **Open Graph (Facebook):** Permite preview-uri frumoase când link-urile sunt share-uite pe Facebook
- **Twitter Cards:** Afișare optimizată pe Twitter cu thumbnail și descriere
- **Thumbnail:** `/assets/thumbnail.png` - imagine folosită pentru preview social media

Fiecare pagină HTML (`index.html`, `redir.html`, `publicare.html`, `404.html`) conține:

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://docu.asiserp.ro/assets/thumbnail.png" />
<meta property="og:url" content="https://docu.asiserp.ro/..." />
<meta name="twitter:card" content="summary_large_image" />
```

## 🖼️ Interfața vizuală

### Tab Documentație

```
+-------------------+   +-------------------+
|  [icon] Nume      |   |  [icon] Nume      |
|  #etichete        |   |  #etichete        |
|  Descriere        |   |  Descriere        |
| [Deschide] [Copy] |   | [Deschide] [Copy] |
+-------------------+   +-------------------+
```

### Tab Publicări

```
+----------------------------------+
| [📑] v1.2.3    [Standard] [⏰] 23.09.2025 |
| Fișiere: 5     [AI Summary...]      |
| ▼ Click pentru detalii fișiere     |
+----------------------------------+
| [📑] v1.2.2    [Critic]   [⏰] 20.09.2025 |
| Fișiere: 12    [AI Summary...]      |
+----------------------------------+
```

## 💡 De ce să-l folosești?

- **4 funcționalități integrate:** Redirect scurt, viewer documentație, index centralizat și detalii publicări
- **Centralizare completă:** Atât documentația, cât și istoricul publicărilor într-un singur loc
- **Acces rapid:** Găsești instant orice documentație sau urmărești evoluția versiunilor
- **Link-uri scurte:** Sistem de URL shortener pentru share rapid (`docu.asiserp.ro/accize`)
- **Viewer integrat:** Vizualizezi documentele direct în site fără a părăsi interfața
- **Detalii publicări:** Pagini dedicate pentru fiecare versiune cu informații complete
- **Inteligență artificială:** Rezumate automate ale publicărilor pentru înțelegere rapidă
- **Căutare avansată:** Poți căuta prin toate fișierele din toate versiunile simultan
- **Design modern:** Interfață profesională, responsivă și ușor de navigat
- **Expansibil:** Ușor de extins cu noi funcționalități și surse de date

## 🔗 Exemple de utilizare

### Link scurt pentru documentație

```
https://docu.asiserp.ro/accize
→ redirecționează automat către documentul complet
```

### Vizualizare documentație în site

```
https://docu.asiserp.ro/redir.html?document_id=1234567890abc
→ încarcă și afișează documentul în viewer-ul integrat
```

### Detalii publicare specifică

```
https://docu.asiserp.ro/publicare.html?v=54439
→ afișează informații complete despre versiunea 54439
```

### Index principal

```
https://docu.asiserp.ro/
→ acces la toate documentațiile și publicările (taburi)
```

---

> Made with ❤️ pentru comunitatea ASiS/ASW.
> Pentru feedback sau propuneri, deschide un issue sau trimite un mail la officecj@asw.ro
