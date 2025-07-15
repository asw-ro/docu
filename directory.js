let allCardsData = [];
let allTags = [];
let activeTag = null;

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
  tags.forEach((tag) => {
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
  data.forEach((item) => {
    // Parse tags from item.etichete (comma or semicolon separated, or array)
    let tags = [];
    if (Array.isArray(item.etichete)) {
      tags = item.etichete;
    } else if (typeof item.etichete === "string") {
      tags = item.etichete
        .split(/[,;]+/)
        .map((t) => t.trim())
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
      <span class="material-icons icon">${item.icoana || "link"}</span>
      <a class="link-title" href="${
        item.urlcomplet
      }" target="_blank" rel="noopener">
        ${item.numescurt}
      </a>
      <div class="tags">
        ${tags
          .map(
            (tag) =>
              `<span class="tag">${
                tag.startsWith("#") ? tag : "#" + tag
              }</span>`
          )
          .join("")}
      </div>
      <div class="desc">${item.descriere || ""}</div>
      <div style="display:flex;gap:8px;align-items:center;margin-top:auto;">
        <a class="open-link" href="${
          item.urlcomplet
        }" target="_blank" rel="noopener">
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
  document.querySelectorAll(".copy-link").forEach((btn) => {
    btn.addEventListener("click", function () {
      const link = this.getAttribute("data-link");
      navigator.clipboard.writeText(link).then(() => {
        this.innerHTML =
          '<span class="material-icons" style="font-size:1.1em;">check</span> Copiat!';
        this.disabled = true;
        setTimeout(() => {
          this.innerHTML =
            '<span class="material-icons" style="font-size:1.1em;">content_copy</span> Copiază link';
          this.disabled = false;
        }, 1200);
      });
    });
  });
}

fetch("https://asis.asw.ro/asisservice/linkuri?codlink=docu&reponsetype=json")
  .then((r) => r.json())
  .then((data) => {
    allCardsData = data;
    // Collect unique tags from all cards
    const tagSet = new Set();
    data.forEach((item) => {
      let tags = [];
      if (Array.isArray(item.etichete)) {
        tags = item.etichete;
      } else if (typeof item.etichete === "string") {
        tags = item.etichete
          .split(/[,;]+/)
          .map((t) => t.trim())
          .filter(Boolean);
      }
      tags.forEach((tag) => tagSet.add(tag));
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
