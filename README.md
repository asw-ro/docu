# 📚 Centralizator Documentație & Linkuri Utile

Acest proiect oferă un hub modern și rapid pentru accesarea documentației și a linkurilor importante din ecosistemul ASiS/ASW.

## 🚀 Ce face?

- Afișează automat, dinamic, toate linkurile relevante, cu descriere, pictogramă și acțiuni rapide.
- Permite deschiderea rapidă a fiecărui link sau copierea unui link scurt personalizat.
- Design responsive, curat, inspirat de platforme de documentație tehnică moderne.

## 🛠️ Cum funcționează?

- Datele sunt preluate dinamic dintr-un endpoint JSON (`asis.asw.ro/asisservice/linkuri?codlink=docu&reponsetype=json`).
- Fiecare link are: nume scurt, descriere, pictogramă (Google Material Icons), link complet și link scurt.
- Interfața este generată automat pe baza acestor date.
- **Redirect automat (URL shortener):** Dacă accesezi direct `https://docu.asiserp.ro/[nume_scurt]`, vei fi redirecționat automat către linkul complet asociat. Astfel, poți folosi acest site și ca un scurtător de linkuri pentru documentația internă.

## 📦 Structura fișierelor

- `index.html` — Pagina principală, stilizată modern, fără JavaScript inline.
- `directory.js` — Scriptul care preia datele și construiește interfața.

## 🖱️ Funcționalități cool

- **Deschide**: Accesezi direct resursa dorită.
- **Copiază link**: Obții instant linkul scurt, gata de trimis colegilor.
- **Redirect automat**: Oricine accesează un link scurt de forma `https://docu.asiserp.ro/[nume_scurt]` va fi dus direct la documentul complet.
- **Pictograme**: Fiecare resursă are o iconiță relevantă, pentru identificare rapidă.

## 🧑‍💻 Cum adaugi un link nou?

Adaugă-l în sursa de date (API-ul JSON). Nu e nevoie de modificări în cod!

## 🖼️ Exemplu vizual

```
+-------------------+   +-------------------+
|  [icon] Nume      |   |  [icon] Nume      |
|  Descriere        |   |  Descriere        |
| [Deschide] [Copy] |   | [Deschide] [Copy] |
+-------------------+   +-------------------+
```

## 💡 De ce să-l folosești?

- Centralizezi totul într-un singur loc.
- Găsești rapid orice documentație sau resursă.
- Arată profi și e ușor de extins.

---

> Made with ❤️ pentru comunitatea ASiS/ASW.
> Pentru feedback sau propuneri, deschide un issue sau trimite un mail la officecj@asw.ro
