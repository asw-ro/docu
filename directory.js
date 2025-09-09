"use strict";
// Versiune înainte de adăugarea numărului de fișiere (files-chip)

let allCardsData = [];
let allTags = [];
let activeTag = null;
let publicationsData = [];
let currentTab = "docu";
let config = {
  urlDocu: "https://asis.asw.ro/asisservice/linkuri?codlink=docu&reponsetype=json",
  urlPubl: "https://asis.asw.ro/asisservice/linkuri?codlink=docup&reponsetype=json"
};
// Cache pentru rezumatele markdown ale publicatiilor (snippet) + continut complet
const publicationSummaryCache = new Map(); // version -> snippet HTML
const publicationFullMarkdownCache = new Map(); // version -> raw markdown

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  const tb = document.getElementById(tab + "Tab");
  if (tb) tb.classList.add("active");
  document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
  const ct = document.getElementById(tab + "Content");
  if (ct) ct.classList.add("active");
  if (tab === "publicatii" && publicationsData.length === 0) loadPublications();
}
window.switchTab = switchTab;

function renderTagFilters(tags) {
  const wrap = document.getElementById("tagFilters");
  if (!wrap) return;
  wrap.innerHTML = "";
  const all = document.createElement("button");
  all.className = "tag-filter" + (activeTag === null ? " active" : "");
  all.textContent = "Toate";
  all.onclick = () => {
    activeTag = null;
    renderDirectory(allCardsData);
    renderTagFilters(allTags);
  };
  wrap.appendChild(all);
  tags.forEach(t => {
    const b = document.createElement("button");
    b.className = "tag-filter" + (activeTag === t ? " active" : "");
    b.textContent = t.startsWith("#") ? t : "#" + t;
    b.onclick = () => {
      activeTag = t;
      renderDirectory(allCardsData, null, activeTag);
      renderTagFilters(allTags);
    };
    wrap.appendChild(b);
  });
}

function renderDirectory(data, search = null, tagFilter = null) {
  const dir = document.getElementById("directory");
  if (!dir) return;
  dir.innerHTML = "";
  const term = (search || "").toLowerCase();
  let shown = 0;
  data.forEach(item => {
    let tags = [];
    if (Array.isArray(item.etichete)) tags = item.etichete;
    else if (typeof item.etichete === "string")
      tags = item.etichete
        .split(/[,;]+/)
        .map(t => t.trim())
        .filter(Boolean);
    if (tagFilter && !tags.map(t => t.toLowerCase()).includes(tagFilter.toLowerCase())) return;
    const blob = [item.numescurt, item.descriere, ...tags].filter(Boolean).join(" ").toLowerCase();
    if (term && !blob.includes(term)) return;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<div class="card-title-row" style="display:flex;align-items:center;gap:8px;">
        <span class="material-icons icon" style="color:#444;">${item.icoana || "link"}</span>
        <a class="link-title" href="${item.urlcomplet}" target="_blank" rel="noopener">${item.numescurt}</a>
      </div>
      <div class="tags">${tags.map(t => `<span class='tag'>${t.startsWith("#") ? t : "#" + t}</span>`).join("")}</div>
      <div class="desc">${item.descriere || ""}</div>
      <div class="card-actions" style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:auto;width:100%;padding-top:8px;">
        <a class="open-link" href="${
          item.urlcomplet
        }" target="_blank" rel="noopener"><span class="material-icons" style="font-size:1.1em;">open_in_new</span> Deschide</a>
        <button class="open-link copy-link" data-link="${
          item.urlcomplet
        }" type="button" style="background:#43a047;"><span class="material-icons" style="font-size:1.1em;">content_copy</span> Copiază</button>
      </div>`;
    dir.appendChild(card);
    shown++;
  });
  if (!shown) dir.innerHTML = '<div class="no-files">Niciun rezultat.</div>';
  dir.querySelectorAll(".copy-link").forEach(btn =>
    btn.addEventListener("click", function () {
      const l = this.getAttribute("data-link");
      navigator.clipboard.writeText(l).then(() => {
        this.innerHTML = '<span class="material-icons" style="font-size:1.1em;">check</span> Copiat!';
        this.disabled = true;
        setTimeout(() => {
          this.innerHTML = '<span class="material-icons" style="font-size:1.1em;">content_copy</span> Copiază';
          this.disabled = false;
        }, 1200);
      });
    })
  );
}

function loadDocuData() {
  const dir = document.getElementById("directory");
  if (dir)
    dir.innerHTML = '<div class="loading-state"><span class="loading-spinner"></span>Se încarcă documentațiile...</div>';
  fetch(config.urlDocu, { headers: { Accept: "application/json" } })
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      allCardsData = data || [];
      const set = new Set();
      allCardsData.forEach(i => {
        if (Array.isArray(i.etichete)) i.etichete.forEach(t => set.add(t));
        else if (typeof i.etichete === "string")
          i.etichete
            .split(/[,;]+/)
            .map(t => t.trim())
            .filter(Boolean)
            .forEach(t => set.add(t));
      });
      allTags = [...set].sort();
      renderTagFilters(allTags);
      renderDirectory(allCardsData);
      const sb = document.getElementById("searchBar");
      if (sb) {
        sb.addEventListener("input", function () {
          renderDirectory(allCardsData, this.value, activeTag);
        });
      }
    })
    .catch(e => {
      console.error("Docu load error", e);
      if (dir) dir.innerHTML = '<div style="color:#c00;font-size:1.05rem;">Eroare la încărcarea datelor.</div>';
    });
}

// PUBLICATII (vertical layout, fara files-chip)
function loadPublications() {
  const wrap = document.getElementById("publicatiiDirectory");
  if (!wrap) return;
  wrap.innerHTML = '<div class="loading-state"><span class="loading-spinner"></span>Se încarcă publicările...</div>';
  fetch(config.urlPubl, { headers: { Accept: "application/json" } })
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(data => {
      publicationsData = (data.publicari || []).sort((a, b) => (b.versiune_publicata || 0) - (a.versiune_publicata || 0));
      renderPublications(publicationsData);
      setupPublicationsSearch();
    })
    .catch(e => {
      console.error("Publ load error", e);
      wrap.innerHTML = '<div class="error-state">Eroare la încărcare.<br><small>' + e.message + "</small></div>";
    });
}

function renderPublications(data, filter = "") {
  const c = document.getElementById("publicatiiDirectory");
  if (!c) return;
  if (!data || !data.length) {
    c.innerHTML = '<div class="no-files">Nu sunt disponibile publicări.</div>';
    return;
  }
  if (filter) renderFilteredFiles(data, filter, c);
  else renderAllPublications(data, c);
}

function renderAllPublications(data, container) {
  container.innerHTML = "";
  const list = document.createElement("div");
  list.className = "publications-vertical-list";
  data.forEach(pub => {
    let fDate = "Dată necunoscută";
    try {
      if (pub.dataora) {
        const d = new Date(pub.dataora);
        if (!isNaN(d.getTime()))
          fDate = d.toLocaleDateString("ro-RO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          });
      }
    } catch {}
    const filesCount = pub.fisiere ? pub.fisiere.length : 0;
    const card = document.createElement("div");
    card.className = "publication-card vertical";
    card.innerHTML = `<div class="publication-header vertical-header" tabindex="0">
        <div class="left-meta">
          <span class="material-icons">bookmark</span>
          <span class="publication-version">v${pub.versiune_publicata}</span>
          <span class="publication-type ${pub.tip && pub.tip.toLowerCase().includes("critic") ? "critical" : ""}">${
      pub.tip || "Standard"
    }</span>
          <span class="files-modified-chip" title="Fișiere modificate în această publicare">Fișiere: ${filesCount}</span>
        </div>
        <div class="right-meta">
          <span class="material-icons">schedule</span>
          <span class="publication-date">${fDate}</span>
          <button class="expand-btn" aria-label="Detalii versiune"><span class="material-icons">expand_more</span></button>
        </div>
        <div class="publication-summary-snippet" data-version="${pub.versiune_publicata}">
          <div class="snippet-loading">Se încarcă Rezumat cu AI...</div>
        </div>
      </div>
      <div class="publication-body" style="display:none">
        <div class="files-header"><span class="material-icons">description</span><span>Fișiere modificate</span></div>
        <div class="files-list">${
          filesCount
            ? pub.fisiere
                .map(
                  f =>
                    `<div class='file-item'><div class='file-info'><div class='file-name'>${
                      f.procedura || "Fișier necunoscut"
                    }</div><div class='file-path'><span class='material-icons' style='font-size:0.9rem;'>folder</span>${
                      f.director || "Director necunoscut"
                    }${f.versiune ? ` • v${f.versiune}` : ""}${
                      f.data ? ` • ${new Date(f.data).toLocaleDateString("ro-RO")}` : ""
                    }</div>${f.mesaj ? `<div class='file-message'>${f.mesaj}</div>` : ""}</div></div>`
                )
                .join("")
            : '<div class="no-files">Niciun fișier înregistrat.</div>'
        }</div>
      </div>`;
    const header = card.querySelector(".publication-header");
    const body = card.querySelector(".publication-body");
    const btn = card.querySelector(".expand-btn");
    let expanded = false;
    const toggle = () => {
      expanded = !expanded;
      if (expanded) {
        body.style.display = "";
        btn.innerHTML = '<span class="material-icons">expand_less</span>';
        card.classList.add("expanded");
      } else {
        body.style.display = "none";
        btn.innerHTML = '<span class="material-icons">expand_more</span>';
        card.classList.remove("expanded");
      }
    };
    header.addEventListener("click", e => {
      if (e.target.closest(".expand-btn")) return;
      toggle();
    });
    btn.addEventListener("click", e => {
      e.stopPropagation();
      toggle();
    });
    header.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    });
    // Incarcam rezumatul (snippet) din fisierul markdown corespunzator versiunii
    const summaryEl = card.querySelector(".publication-summary-snippet");
    if (summaryEl) {
      loadPublicationSummary(pub.versiune_publicata, summaryEl);
    }
    list.appendChild(card);
  });
  container.appendChild(list);
}

function renderFilteredFiles(data, filter, container) {
  const term = filter.toLowerCase();
  let matches = [];
  data.forEach(pub => {
    if (pub.fisiere) {
      pub.fisiere.forEach(f => {
        const blob = [
          f.director,
          f.procedura,
          f.versiune?.toString(),
          f.data,
          f.mesaj,
          pub.versiune_publicata?.toString(),
          pub.dataora,
          pub.tip
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (blob.includes(term))
          matches.push({ ...f, publication_version: pub.versiune_publicata, publication_date: pub.dataora });
      });
    }
  });
  if (!matches.length) {
    container.innerHTML = '<div class="no-files">Nu s-au găsit fișiere.</div>';
    return;
  }
  matches.sort((a, b) => (b.publication_version || 0) - (a.publication_version || 0));
  const wrap = document.createElement("div");
  wrap.className = "search-results";
  wrap.innerHTML = `<div class='search-results-header'><span class='material-icons'>search</span><span>Rezultate: ${matches.length}</span></div>`;
  const list = document.createElement("div");
  list.className = "files-search-list";
  matches.forEach(f => {
    let fd = "Dată necunoscută";
    try {
      if (f.data) {
        const d = new Date(f.data);
        if (!isNaN(d.getTime())) fd = d.toLocaleDateString("ro-RO");
      }
    } catch {}
    let pubDate = "";
    try {
      if (f.publication_date) {
        const d = new Date(f.publication_date);
        if (!isNaN(d.getTime())) pubDate = d.toLocaleDateString("ro-RO");
      }
    } catch {}
    const item = document.createElement("div");
    item.className = "file-search-item";
    item.innerHTML = `<div class='file-search-header'><div class='file-name'>${
      f.procedura || "Fișier necunoscut"
    }</div><div class='publication-info'><span class='material-icons'>bookmark</span>v${
      f.publication_version
    } • ${pubDate}</div></div><div class='file-details'><div class='file-path'><span class='material-icons' style='font-size:0.9rem;'>folder</span>${
      f.director || "Director necunoscut"
    }${f.versiune ? ` • v${f.versiune}` : ""}${f.data ? ` • ${fd}` : ""}</div>${
      f.mesaj ? `<div class='file-message'>${f.mesaj}</div>` : ""
    }</div>`;
    list.appendChild(item);
  });
  wrap.appendChild(list);
  container.innerHTML = "";
  container.appendChild(wrap);
}

function setupPublicationsSearch() {
  const sb = document.getElementById("publicatiiSearchBar");
  if (sb) {
    sb.addEventListener("input", function () {
      renderPublications(publicationsData, this.value);
    });
  }
}

// INIT
fetch("cfg.json")
  .then(r => (r.ok ? r.json() : {}))
  .then(cfg => {
    if (cfg.urlDocu) config.urlDocu = cfg.urlDocu;
    if (cfg.urlPubl) config.urlPubl = cfg.urlPubl;
  })
  .finally(() => {
    loadDocuData();
  });

// ================= Rezumat publicatie (markdown) =================
function loadPublicationSummary(version, container) {
  if (!version || !container) return;
  if (publicationSummaryCache.has(version)) {
    container.innerHTML = publicationSummaryCache.get(version);
    attachSnippetEvents(container, version);
    return;
  }
  const url = `readmes/v${version}.md`;
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error("Not found");
      return r.text();
    })
    .then(md => {
      publicationFullMarkdownCache.set(version, md);
      const html = buildSummarySnippet(md, version);
      publicationSummaryCache.set(version, html || "");
      container.innerHTML = html || `<div class="snippet-fallback">Nu s-au găsit puncte-cheie în fișierul markdown.</div>`;
      attachSnippetEvents(container, version);
    })
    .catch(err => {
      // In modul file:// fetch esueaza in majoritatea browserelor; afisam fallback
      const local = location.protocol === "file:";
      console.warn("[PublSnippet] fetch fail", version, err);
      container.innerHTML = `<div class="snippet-fallback">${
        local
          ? "Rezumat cu AI indisponibil în modul local (file://). Rulează un server static pentru a încărca fișierul."
          : "Rezumat cu AI indisponibil."
      }</div>`;
    });
}

function buildSummarySnippet(md, version) {
  if (!md) return "";
  // Extragem sectiunea "Puncte-cheie" sau primele bullet-uri din fisier
  let section = "";
  const lines = md.split(/\r?\n/);
  const startIdx = lines.findIndex(l => /#+\s.*puncte-?cheie/i.test(l));
  if (startIdx !== -1) {
    for (let i = startIdx + 1; i < lines.length; i++) {
      const l = lines[i];
      if (/^\s*#+\s/.test(l)) break; // urmatorul heading
      section += l + "\n";
    }
  } else {
    // fallback: primele 6 linii care incep cu '-'
    section = lines
      .filter(l => /^\s*[-*]\s+/.test(l))
      .slice(0, 6)
      .join("\n");
  }
  // Luam primele 4 bullet-uri pentru snippet
  const bullets = section
    .split(/\r?\n/)
    .filter(l => /^\s*[-*]\s+/.test(l))
    .slice(0, 4);
  if (!bullets.length) return "";
  const itemsHtml = bullets
    .map(b => "<li>" + escapeBasicMarkdownInline(b.replace(/^\s*[-*]\s+/, "").trim()) + "</li>")
    .join("");
  return `<div class="snippet-wrapper"><span class="snippet-label">Rezumat cu AI:</span><ul class="snippet-list" aria-label="Rezumat versiune v${version}">${itemsHtml}</ul><button type="button" class="snippet-full-btn" data-version="${version}" aria-label="Deschide markdown complet versiune ${version}">Citeste tot</button></div>`;
}

function escapeBasicMarkdownInline(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

// === Modal full markdown ===
function attachSnippetEvents(container, version) {
  const btn = container.querySelector(".snippet-full-btn");
  if (btn) {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      openMarkdownModal(version);
    });
  } else {
    container.addEventListener("click", () => {
      if (publicationFullMarkdownCache.has(version)) openMarkdownModal(version);
    });
  }
}

function ensureMarkdownModal() {
  let overlay = document.getElementById("markdownModalOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "markdownModalOverlay";
    overlay.innerHTML = `<div class="md-modal" role="dialog" aria-modal="true" aria-labelledby="mdModalTitle">
        <div class="md-modal-header">
          <h2 id="mdModalTitle">Publicare</h2>
          <div class="md-modal-actions">
            <button type="button" class="md-copy-btn" title="Copiază markdown" aria-label="Copiază markdown"><span class="material-icons">content_copy</span></button>
            <button type="button" class="md-close-btn" title="Închide" aria-label="Închide"><span class="material-icons">close</span></button>
          </div>
        </div>
        <div class="md-modal-body"><div class="md-loading">Se încarcă...</div></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeMarkdownModal();
    });
    overlay.querySelector(".md-close-btn").addEventListener("click", closeMarkdownModal);
    overlay.querySelector(".md-copy-btn").addEventListener("click", () => {
      const version = overlay.getAttribute("data-version");
      const md = publicationFullMarkdownCache.get(version) || "";
      navigator.clipboard.writeText(md).then(() => {
        const btn = overlay.querySelector(".md-copy-btn");
        const old = btn.innerHTML;
        btn.innerHTML = '<span class="material-icons">check</span>';
        setTimeout(() => (btn.innerHTML = old), 1200);
      });
    });
    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && overlay.style.display === "block") closeMarkdownModal();
    });
  }
  return overlay;
}

function openMarkdownModal(version) {
  const overlay = ensureMarkdownModal();
  overlay.style.display = "block";
  overlay.setAttribute("data-version", version);
  const body = overlay.querySelector(".md-modal-body");
  const title = overlay.querySelector("#mdModalTitle");
  title.textContent = "Publicare v" + version;
  if (publicationFullMarkdownCache.has(version)) {
    body.innerHTML = renderFullMarkdown(publicationFullMarkdownCache.get(version));
  } else {
    body.innerHTML = '<div class="md-loading">Se încarcă...</div>';
    fetch(`readmes/v${version}.md`)
      .then(r => (r.ok ? r.text() : Promise.reject()))
      .then(md => {
        publicationFullMarkdownCache.set(version, md);
        body.innerHTML = renderFullMarkdown(md);
      })
      .catch(() => {
        body.innerHTML = '<div class="md-error">Nu s-a putut încărca fișierul markdown.</div>';
      });
  }
}

function closeMarkdownModal() {
  const overlay = document.getElementById("markdownModalOverlay");
  if (overlay) overlay.style.display = "none";
}

function renderFullMarkdown(md) {
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false,
    inCode = false;
  lines.forEach(line => {
    if (/^```/.test(line.trim())) {
      if (!inCode) {
        html += '<pre class="md-code"><code>';
        inCode = true;
      } else {
        html += "</code></pre>";
        inCode = false;
      }
      return;
    }
    if (inCode) {
      html += esc(line) + "\n";
      return;
    }
    if (/^\s*$/.test(line)) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      return;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      const lvl = heading[1].length;
      html += `<h${lvl}>${escapeBasicMarkdownInline(heading[2])}</h${lvl}>`;
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += "<li>" + escapeBasicMarkdownInline(line.replace(/^[-*]\s+/, "")) + "</li>";
      return;
    }
    if (inList) {
      html += "</ul>";
      inList = false;
    }
    html += "<p>" + escapeBasicMarkdownInline(line) + "</p>";
  });
  if (inList) html += "</ul>";
  if (inCode) html += "</code></pre>";
  return `<div class="md-content">${html}</div>`;
}

document.addEventListener("click", e => {
  const btn = e.target.closest(".snippet-full-btn");
  if (btn) {
    e.stopPropagation();
    openMarkdownModal(btn.getAttribute("data-version"));
  }
});
