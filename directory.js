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

// Check URL parameters on load
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get("tab");
  const version = urlParams.get("version");

  console.log("[checkUrlParams] tab:", tab, "version:", version);

  if (tab === "publicatii") {
    switchTab("publicatii");

    // If version parameter exists, wait for publications to load then expand it
    if (version) {
      const expandVersion = () => {
        setTimeout(() => {
          console.log("[expandVersion] Looking for version:", version);
          console.log(
            "[expandVersion] Available publication versions:",
            publicationsData.map(p => p.versiune_publicata)
          );

          // Try to find the card - handle both string and number comparisons
          let versionCard = document.querySelector(`[data-version="${version}"]`);

          if (!versionCard) {
            // Try alternate selector in case version is stored as number
            const allCards = document.querySelectorAll(".publication-card[data-version]");
            console.log(
              "[expandVersion] All cards with data-version:",
              Array.from(allCards).map(c => c.getAttribute("data-version"))
            );

            // Find by comparing values (handles string vs number)
            versionCard = Array.from(allCards).find(card => card.getAttribute("data-version") == version);
          }

          if (versionCard) {
            console.log("[expandVersion] Found card for version:", version);
            const expandBtn = versionCard.querySelector(".expand-btn");
            if (expandBtn) {
              // Simulate click to expand
              expandBtn.click();
              // Scroll to the card
              versionCard.scrollIntoView({ behavior: "smooth", block: "start" });
              // Highlight temporarily
              versionCard.style.outline = "3px solid #1976d2";
              setTimeout(() => {
                versionCard.style.outline = "";
              }, 2000);
            }
          } else {
            console.warn("[expandVersion] Version not found:", version);
          }
        }, 500); // Wait for render
      };

      // If publications not loaded yet, wait for them
      if (publicationsData.length === 0) {
        console.log("[checkUrlParams] Waiting for publications to load...");
        const checkLoaded = setInterval(() => {
          if (publicationsData.length > 0) {
            clearInterval(checkLoaded);
            console.log("[checkUrlParams] Publications loaded, expanding version");
            expandVersion();
          }
        }, 100);
      } else {
        expandVersion();
      }
    }
  }
}

// Call on page load
window.addEventListener("DOMContentLoaded", checkUrlParams);

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
    // Filtrare: nu afișa linkurile cu privat: true
    if (item.privat === true) return;
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
    // Construim URL-ul scurt care redirectioneaza (format: {origin}/{numescurt})
    const origin = (typeof window !== "undefined" && window.location && window.location.origin) || "https://docu.asiserp.ro";
    const shortUrl = origin.replace(/\/$/, "") + "/" + encodeURIComponent(item.numescurt || "");
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
        <button class="open-link copy-link" data-link="${shortUrl}" type="button" style="background:#43a047;"><span class="material-icons" style="font-size:1.1em;">content_copy</span> Copiază</button>
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
  if (dir) {
    // Show skeleton cards while loading
    dir.innerHTML = Array.from(
      { length: 6 },
      () => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line medium"></div>
        <div class="skeleton skeleton-line long"></div>
      </div>
    `
    ).join("");
  }
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
  // Show skeleton publication cards
  wrap.innerHTML = Array.from(
    { length: 4 },
    () => `
    <div class="skeleton-card" style="height: 120px;">
      <div class="skeleton skeleton-line short" style="height: 20px;"></div>
      <div class="skeleton skeleton-line medium" style="height: 16px; margin-top: 16px;"></div>
      <div class="skeleton skeleton-line long" style="height: 16px;"></div>
    </div>
  `
  ).join("");
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
    card.setAttribute("data-version", pub.versiune_publicata); // Add version attribute for URL targeting
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
          <button class="copy-version-link" data-version="${
            pub.versiune_publicata
          }" title="Copiază link către această versiune" aria-label="Copiază link"><span class="material-icons" style="font-size:1rem;">link</span></button>
          <button class="expand-btn" aria-label="Detalii versiune"><span class="material-icons">expand_more</span></button>
        </div>
        <div class="publication-summary-snippet" data-version="${pub.versiune_publicata}">
          <div class="snippet-loading">Se încarcă Rezumat cu AI <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-left: 4px;"><path d="M12 2L13.09 7.26L18 8L13.09 8.74L12 14L10.91 8.74L6 8L10.91 7.26L12 2Z"/><path d="M19 15L20.09 17.26L23 18L20.09 18.74L19 21L17.91 18.74L15 18L17.91 17.26L19 15Z"/><path d="M7.5 10L8.09 11.26L10 12L8.09 12.74L7.5 14L6.91 12.74L5 12L6.91 11.26L7.5 10Z"/></svg>...</div>
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

    // Handle copy version link button
    const copyLinkBtn = card.querySelector(".copy-version-link");
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener("click", e => {
        e.stopPropagation();
        const version = pub.versiune_publicata;
        const origin = window.location.origin;
        // Use publicare.html for clean, shareable version URLs
        const versionUrl = `${origin}/publicare.html?v=${version}`;

        navigator.clipboard
          .writeText(versionUrl)
          .then(() => {
            const originalHtml = copyLinkBtn.innerHTML;
            copyLinkBtn.innerHTML = '<span class="material-icons" style="font-size:1rem;">check</span>';
            copyLinkBtn.style.color = "#43a047";
            setTimeout(() => {
              copyLinkBtn.innerHTML = originalHtml;
              copyLinkBtn.style.color = "";
            }, 1500);
          })
          .catch(err => {
            console.error("Failed to copy:", err);
          });
      });
    }

    // Incarcam rezumatul (snippet) din campul "rezumat" al publicatiei
    const summaryEl = card.querySelector(".publication-summary-snippet");
    if (summaryEl) {
      loadPublicationSummary(pub, summaryEl);
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

// ================= Rezumat publicatie (din JSON) =================
function loadPublicationSummary(publication, container) {
  if (!publication || !container) return;

  const version = publication.versiune_publicata;
  if (publicationSummaryCache.has(version)) {
    container.innerHTML = publicationSummaryCache.get(version);
    attachSnippetEvents(container, publication);
    return;
  }

  // Folosim campul "rezumat" din JSON in loc de fisiere markdown
  if (publication.rezumat && publication.rezumat.trim()) {
    publicationFullMarkdownCache.set(version, publication.rezumat);
    const html = buildSummarySnippet(publication.rezumat, version);
    publicationSummaryCache.set(version, html || "");
    container.innerHTML = html || `<div class="snippet-fallback">Nu s-au găsit puncte-cheie în rezumat.</div>`;
    attachSnippetEvents(container, publication);
    console.log("[PublSnippet] Snippet OK pentru v" + version);
  } else {
    container.innerHTML = `<div class="snippet-fallback">Nu există rezumat disponibil pentru această versiune.</div>`;
  }
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
  return `<div class="snippet-wrapper two-col">
    <div class="snippet-side" aria-label="Acțiuni rezumat v${version}">
      <div class="snippet-label">Rezumat cu AI <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-left: 4px;"><path d="M12 2L13.09 7.26L18 8L13.09 8.74L12 14L10.91 8.74L6 8L10.91 7.26L12 2Z"/><path d="M19 15L20.09 17.26L23 18L20.09 18.74L19 21L17.91 18.74L15 18L17.91 17.26L19 15Z"/><path d="M7.5 10L8.09 11.26L10 12L8.09 12.74L7.5 14L6.91 12.74L5 12L6.91 11.26L7.5 10Z"/></svg></div>
      <button type="button" class="snippet-full-btn" data-version="${version}" aria-label="Deschide markdown complet versiune ${version}">Citeste tot</button>
    </div>
    <ul class="snippet-list" aria-label="Rezumat versiune v${version}">${itemsHtml}</ul>
  </div>`;
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

// === Navigation to publicare.html ===
function attachSnippetEvents(container, publication) {
  const version = publication.versiune_publicata;
  const btn = container.querySelector(".snippet-full-btn");
  if (btn) {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      // Navigate to dedicated publication page
      window.location.href = `publicare.html?v=${version}`;
    });
  }
}

// ================= Utility functions for markdown rendering (used for snippets) =================
function escapeBasicMarkdownInline(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
