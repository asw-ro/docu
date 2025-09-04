let allCardsData = [];
let allTags = [];
let activeTag = null;
let publicationsData = [];
let currentTab = "docu";

// Tab switching functionality
function switchTab(tab) {
  currentTab = tab;

  // Update tab buttons
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(tab + "Tab").classList.add("active");

  // Update tab content
  document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
  document.getElementById(tab + "Content").classList.add("active");

  // Load data for the active tab
  if (tab === "publicatii" && publicationsData.length === 0) {
    loadPublications();
  }
}

function renderTagFilters(tags) {
  const tagFilters = document.getElementById("tagFilters");
  tagFilters.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.className = "tag-filter" + (activeTag === null ? " active" : "");
  allBtn.textContent = "Toate";
  allBtn.onclick = () => {
    activeTag = null;
    renderTagFilters(tags);
    renderDirectory(allCardsData, document.getElementById("searchBar").value);
  };
  tagFilters.appendChild(allBtn);
  tags.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tag-filter" + (activeTag === tag ? " active" : "");
    btn.textContent = tag.startsWith("#") ? tag : "#" + tag;
    btn.onclick = () => {
      activeTag = tag;
      renderTagFilters(tags);
      renderDirectory(allCardsData, document.getElementById("searchBar").value);
    };
    tagFilters.appendChild(btn);
  });
}

function renderDirectory(data, filter = "") {
  const dir = document.getElementById("directory");
  dir.innerHTML = "";
  data.forEach(item => {
    // Skip display if privat is true (but allow redirection/copy)
    if (item.privat === true || item.privat === "true" || item.privat === 1) return;
    // Parse tags from item.etichete (comma or semicolon separated, or array)
    let tags = [];
    if (Array.isArray(item.etichete)) {
      tags = item.etichete;
    } else if (typeof item.etichete === "string") {
      tags = item.etichete
        .split(/[,;]+/)
        .map(t => t.trim())
        .filter(Boolean);
    }
    // Tag filter logic
    if (activeTag && !tags.includes(activeTag)) return;
    const searchText = (
      item.numescurt +
      " " +
      (item.descriere || "") +
      " " +
      (item.urlcomplet || "") +
      " " +
      tags.join(" ")
    ).toLowerCase();
    if (filter && !searchText.includes(filter.toLowerCase())) return;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-title-row" style="display:flex;align-items:center;gap:8px;">
        <span class="material-icons icon" style="color:#444;">${item.icoana || "link"}</span>
        <a class="link-title" href="${item.urlcomplet}" target="_blank" rel="noopener">${item.numescurt}</a>
      </div>
      <div class="tags">
        ${tags.map(tag => `<span class="tag">${tag.startsWith("#") ? tag : "#" + tag}</span>`).join("")}
      </div>
      <div class="desc">${item.descriere || ""}</div>
      <div class="card-actions" style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:auto;width:100%;padding-top:8px;">
        <a class="open-link" href="${item.urlcomplet}" target="_blank" rel="noopener">
          <span class="material-icons" style="font-size:1.1em;">open_in_new</span> Deschide
        </a>
        <button class="open-link copy-link" data-link="https://docu.asiserp.ro/${
          item.numescurt
        }" type="button" style="background:#43a047;">
          <span class="material-icons" style="font-size:1.1em;">content_copy</span> Copiază
        </button>
      </div>
    `;
    dir.appendChild(card);
  });
  // Add copy event listeners
  document.querySelectorAll(".copy-link").forEach(btn => {
    btn.addEventListener("click", function () {
      const link = this.getAttribute("data-link");
      navigator.clipboard.writeText(link).then(() => {
        this.innerHTML = '<span class="material-icons" style="font-size:1.1em;">check</span> Copiat!';
        this.disabled = true;
        setTimeout(() => {
          this.innerHTML = '<span class="material-icons" style="font-size:1.1em;">content_copy</span> Copiază';
          this.disabled = false;
        }, 1200);
      });
    });
  });
}

// Publications functionality
function loadPublications() {
  const publicatiiDir = document.getElementById("publicatiiDirectory");
  publicatiiDir.innerHTML =
    '<div class="loading-state"><span class="loading-spinner"></span>Se încarcă publicările...</div>';

  fetch("https://dev.asw.ro/ria/asisservice/linkuri?codlink=pasis")
    .then(r => {
      if (!r.ok) {
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      return r.json();
    })
    .then(data => {
      // API-ul returnează un obiect cu proprietatea 'publicari'
      publicationsData = data.publicari || [];

      // Sortez publicațiile după versiune (descrescător - cele mai noi primul)
      publicationsData.sort((a, b) => (b.versiune_publicata || 0) - (a.versiune_publicata || 0));

      renderPublications(publicationsData);
      setupPublicationsSearch();
    })
    .catch(error => {
      console.error("Error loading publications:", error);
      publicatiiDir.innerHTML =
        '<div class="error-state">Eroare la încărcarea publicărilor. Verificați conexiunea și încercați din nou.<br><small>Detalii: ' +
        error.message +
        "</small></div>";
    });
}

function renderPublications(data, filter = "") {
  const publicatiiDir = document.getElementById("publicatiiDirectory");

  if (!data || !Array.isArray(data) || data.length === 0) {
    publicatiiDir.innerHTML = '<div class="no-files">Nu sunt disponibile publicări.</div>';
    return;
  }

  publicatiiDir.innerHTML = "";

  if (filter) {
    // Când există filtru, afișez doar fișierele individuale care se potrivesc
    renderFilteredFiles(data, filter, publicatiiDir);
  } else {
    // Când nu există filtru, afișez toate publicările complete
    renderAllPublications(data, publicatiiDir);
  }
}

function renderFilteredFiles(data, filter, container) {
  const searchTerm = filter.toLowerCase();
  let matchingFiles = [];

  // Colectez toate fișierele care se potrivesc cu căutarea
  data.forEach(publication => {
    if (publication.fisiere) {
      publication.fisiere.forEach(file => {
        const fileSearchText = [
          file.director,
          file.procedura,
          file.versiune?.toString(),
          file.data,
          file.mesaj,
          publication.versiune_publicata?.toString(),
          publication.dataora,
          publication.tip
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (fileSearchText.includes(searchTerm)) {
          matchingFiles.push({
            ...file,
            publication_version: publication.versiune_publicata,
            publication_date: publication.dataora,
            publication_type: publication.tip
          });
        }
      });
    }
  });

  if (matchingFiles.length === 0) {
    container.innerHTML = '<div class="no-files">Nu s-au găsit fișiere care să conțină termenul căutat.</div>';
    return;
  }

  // Sortez fișierele după versiunea publicației (descrescător)
  matchingFiles.sort((a, b) => (b.publication_version || 0) - (a.publication_version || 0));

  // Creez un container pentru rezultatele căutării
  const searchResults = document.createElement("div");
  searchResults.className = "search-results";
  searchResults.innerHTML = `
    <div class="search-results-header">
      <span class="material-icons">search</span>
      <span>Rezultate căutare: ${matchingFiles.length} fișier${matchingFiles.length === 1 ? "" : "e"} găsit${
    matchingFiles.length === 1 ? "" : "e"
  }</span>
    </div>
  `;

  const filesList = document.createElement("div");
  filesList.className = "files-search-list";

  matchingFiles.forEach(file => {
    const fileCard = document.createElement("div");
    fileCard.className = "file-search-item";

    // Formatare dată
    let formattedDate = "Dată necunoscută";
    try {
      if (file.data) {
        const date = new Date(file.data);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString("ro-RO");
        }
      }
    } catch (e) {
      console.warn("Eroare la formatarea datei:", e);
    }

    // Formatare dată publicare
    let formattedPublicationDate = "";
    try {
      if (file.publication_date) {
        const date = new Date(file.publication_date);
        if (!isNaN(date.getTime())) {
          formattedPublicationDate = date.toLocaleDateString("ro-RO");
        }
      }
    } catch (e) {
      console.warn("Eroare la formatarea datei publicării:", e);
    }

    fileCard.innerHTML = `
      <div class="file-search-header">
        <div class="file-name">${file.procedura || "Fișier necunoscut"}</div>
        <div class="publication-info">
          <span class="material-icons">bookmark</span>
          v${file.publication_version} • ${formattedPublicationDate}
        </div>
      </div>
      <div class="file-details">
        <div class="file-path">
          <span class="material-icons" style="font-size: 0.9rem;">folder</span>
          ${file.director || "Director necunoscut"}
          ${file.versiune ? ` • v${file.versiune}` : ""}
          ${file.data ? ` • ${formattedDate}` : ""}
        </div>
        ${file.mesaj ? `<div class="file-message">${file.mesaj}</div>` : ""}
      </div>
    `;

    filesList.appendChild(fileCard);
  });

  searchResults.appendChild(filesList);
  container.appendChild(searchResults);
}

function renderAllPublications(data, container) {
  data.forEach(publication => {
    const pubCard = document.createElement("div");
    pubCard.className = "publication-card";

    // Formatare dată mai robustă
    let formattedDate = "Dată necunoscută";
    try {
      if (publication.dataora) {
        const date = new Date(publication.dataora);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleDateString("ro-RO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        }
      }
    } catch (e) {
      console.warn("Eroare la formatarea datei:", e);
    }

    const filesCount = publication.fisiere ? publication.fisiere.length : 0;

    pubCard.innerHTML = `
      <div class="publication-header">
        <div class="publication-version">
          <span class="material-icons">bookmark</span>
          Versiunea ${publication.versiune_publicata}
        </div>
        <div class="publication-date">
          <span class="material-icons">schedule</span>
          ${formattedDate}
        </div>
        <div class="publication-type">${publication.tip || "Standard"}</div>
      </div>
      <div class="publication-body">
        <div class="files-header">
          <span class="material-icons">description</span>
          <span>Fișiere modificate</span>
          <span class="files-count">${filesCount}</span>
        </div>
        <div class="files-list">
          ${
            publication.fisiere && publication.fisiere.length > 0
              ? publication.fisiere
                  .map(
                    file => `
                <div class="file-item">
                  <div class="file-info">
                    <div class="file-name">${file.procedura || "Fișier necunoscut"}</div>
                    <div class="file-path">
                      <span class="material-icons" style="font-size: 0.9rem;">folder</span>
                      ${file.director || "Director necunoscut"}
                      ${file.versiune ? ` • v${file.versiune}` : ""}
                      ${file.data ? ` • ${new Date(file.data).toLocaleDateString("ro-RO")}` : ""}
                    </div>
                    ${file.mesaj ? `<div class="file-message">${file.mesaj}</div>` : ""}
                  </div>
                </div>
              `
                  )
                  .join("")
              : '<div class="no-files">Nu sunt disponibile detalii despre fișiere.</div>'
          }
        </div>
      </div>
    `;

    container.appendChild(pubCard);
  });
}

function setupPublicationsSearch() {
  const searchBar = document.getElementById("publicatiiSearchBar");
  if (searchBar) {
    searchBar.addEventListener("input", function () {
      renderPublications(publicationsData, this.value);
    });
  }
}

fetch("https://asis.asw.ro/asisservice/linkuri?codlink=docu&reponsetype=json")
  .then(r => r.json())
  .then(data => {
    allCardsData = data;
    // Collect unique tags from all cards
    const tagSet = new Set();
    data.forEach(item => {
      let tags = [];
      if (Array.isArray(item.etichete)) {
        tags = item.etichete;
      } else if (typeof item.etichete === "string") {
        tags = item.etichete
          .split(/[,;]+/)
          .map(t => t.trim())
          .filter(Boolean);
      }
      tags.forEach(tag => tagSet.add(tag));
    });
    allTags = Array.from(tagSet).sort();
    renderTagFilters(allTags);
    renderDirectory(allCardsData);
    // Attach search event
    const searchBar = document.getElementById("searchBar");
    if (searchBar) {
      searchBar.addEventListener("input", function () {
        renderDirectory(allCardsData, this.value);
      });
    }
  })
  .catch(() => {
    document.getElementById("directory").innerHTML =
      '<div style="color:#c00;font-size:1.1rem;">Eroare la încărcarea datelor.</div>';
  });
