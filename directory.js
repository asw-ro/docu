let allCardsData = [];
function renderDirectory(data, filter = "") {
  const dir = document.getElementById("directory");
  dir.innerHTML = "";
  data.forEach((item) => {
    const searchText = (
      item.numescurt +
      " " +
      (item.descriere || "") +
      " " +
      (item.urlcomplet || "")
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
