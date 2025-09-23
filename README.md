# 📚 Centralizator Documentație & Linkuri Utile

Acest proiect oferă un hub modern și rapid pentru accesarea documentației și a linkurilor importante din ecosistemul ASiS/ASW.

## 🚀 Ce face?

- **Tab Documentație**: Afișează automat, dinamic, toate linkurile relevante, cu descriere, pictogramă și acțiuni rapide.
- **Tab Publicări**: Oferă acces cronologic la toate versiunile publicate, cu detalii despre fișierele modificate și rezumate AI.
- Permite deschiderea rapidă a fiecărui link sau copierea unui link scurt personalizat.
- Design responsive, curat, inspirat de platforme de documentație tehnică moderne.

## 🛠️ Cum funcționează?

### Tab Documentație

- Datele sunt preluate dinamic dintr-un endpoint JSON (`asis.asw.ro/asisservice/linkuri?codlink=docu&reponsetype=json`).
- Fiecare link are: nume scurt, descriere, pictogramă (Google Material Icons), link complet și link scurt.
- Interfața este generată automat pe baza acestor date.
- **Redirect automat (URL shortener):** Dacă accesezi direct `https://docu.asiserp.ro/[nume_scurt]`, vei fi redirecționat automat către linkul complet asociat.

### Tab Publicări

- Afișează versiunile publicate în ordine cronologică inversă (cea mai nouă versiune prima).
- Pentru fiecare versiune sunt prezentate: numărul versiunii, tipul publicării (Standard/Critic), data/ora publicării și numărul de fișiere modificate.
- **Rezumate AI**: Fiecare publicare are un rezumat generat automat cu inteligența artificială.
- **Detalii expandabile**: Click pe orice publicare pentru a vedea lista detaliată a fișierelor modificate.
- **Căutare avansată**: Poți căuta prin toate fișierele din toate versiunile pentru a găsi rapid modificări specifice.

## 📦 Structura fișierelor

- `index.html` — Pagina principală cu navigare pe taburi, stilizată modern.
- `directory.js` — Scriptul care preia datele și construiește interfața pentru ambele taburi.
- `style.css` — Stilurile pentru design responsive și interfața modernă.
- `redirect-links.js` — Logica pentru redirect automat (URL shortener).
- `404.html` — Pagina pentru linkuri inexistente.
- `assets/` — Iconițe, favicon și alte resurse grafice.

## 🖱️ Funcționalități cool

### Tab Documentație

- **Deschide**: Accesezi direct resursa dorită.
- **Copiază link**: Obții instant linkul scurt, gata de trimis colegilor.
- **Redirect automat**: Oricine accesează un link scurt de forma `https://docu.asiserp.ro/[nume_scurt]` va fi dus direct la documentul complet.
- **Pictograme**: Fiecare resursă are o iconiță relevantă, pentru identificare rapidă.
- **Filtrare pe etichete**: Poți filtra linkurile după categorii/etichete.

### Tab Publicări

- **Istoric complet**: Vizualizează toate versiunile publicate în ordine cronologică.
- **Rezumate AI**: Fiecare publicare are un rezumat automat generat cu AI pentru înțelegere rapidă.
- **Detalii versiune**: Click pentru a desfășura și a vedea toate fișierele modificate în acea versiune.
- **Căutare globală**: Caută prin toate fișierele din toate versiunile simultan.
- **Informații metadata**: Vezi data/ora publicării, tipul (Standard/Critic) și numărul de fișiere afectate.
- **Design responsive**: Layout optimizat pentru vizualizare pe orice dispozitiv.

## 🧑‍💻 Cum adaugi conținut nou?

### Pentru documentație

Adaugă linkul în sursa de date (API-ul JSON `codlink=docu`). Nu e nevoie de modificări în cod!

### Pentru publicări

Publicările sunt adăugate automat prin sistemul de versioning. Datele sunt preluate din API-ul JSON `codlink=docup`.

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

- **Centralizare completă**: Atât documentația, cât și istoricul publicărilor într-un singur loc.
- **Acces rapid**: Găsești instant orice documentație sau urmărești evoluția versiunilor.
- **Inteligență artificială**: Rezumate automate ale publicărilor pentru înțelegere rapidă.
- **Căutare avansată**: Poți căuta prin toate fișierele din toate versiunile simultan.
- **Design modern**: Interfață profesională, responsivă și ușor de navigat.
- **Expansibil**: Ușor de extins cu noi funcționalități și surse de date.

---

> Made with ❤️ pentru comunitatea ASiS/ASW.
> Pentru feedback sau propuneri, deschide un issue sau trimite un mail la officecj@asw.ro
