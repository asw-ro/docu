// google-doc-loader.js
// This script fetches and displays a Google Doc based on the ID from the query string.

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function showError() {
  const spinner = document.getElementsByClassName("spinner-container");
  if (spinner) spinner[0].remove();
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div style="background:#fff;padding:2rem 3rem;border-radius:1rem;box-shadow:0 4px 20px rgba(0,0,0,0.08);text-align:center;max-width:400px;margin:5rem auto;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:#333;">
  <h1 style="font-size:1.6rem;margin-bottom:0.5rem;color:#111827;">Document inaccesibil</h1>
  <p style="font-size:1rem;margin-bottom:1.5rem;color:#6b7280;">Ne pare rău, dar această pagină nu poate fi afișată fără un identificator de document valid.</p>
  <a href="/" style="display:inline-block;padding:0.6rem 1.2rem;border-radius:0.5rem;text-decoration:none;background:#2563eb;color:#fff;font-weight:500;transition:background 0.2s ease;">Înapoi la pagina principală</a>
</div>

`
  );
}

function hcb(o, e) {
  let t = o.className.split(" ", 1)[0],
    n = e.textContent,
    r = `.${t}{`,
    c = n.indexOf(r),
    i = "background-color:",
    a = n.indexOf(i, c),
    d = n.indexOf(";", a);
  let newBackgroundColor = n.substring(a + 17, d);
  document.body.style.backgroundColor = newBackgroundColor;
}

function lh(o) {
  fetch(o)
    .then(resp => {
      if (!resp.ok) throw new Error("foloseste corect un ID de google docs publicat pe web");
      return resp.text();
    })
    .then(html => {
      let temp = document.createElement("div");
      temp.innerHTML = html;
      let contents = temp.querySelector("#contents");
      if (!contents) throw new Error("No #contents found in Google Doc");
      let n = contents.children[0];
      let r = contents.children[1];
      r.style.maxWidth = "800px";
      r.style.margin = "0 auto";
      document.body.appendChild(n);
      document.body.appendChild(r);
      let c = getComputedStyle(r).backgroundColor;
      document.body.style.backgroundColor = c;
      const titleText = temp.querySelector("title").innerText;
      document.title = titleText;
      const spinner = document.getElementsByClassName("spinner-container");
      if (spinner) spinner[0].remove();
      try {
        const dt = document.getElementById("docTitle");
        if (dt) {
          const span = dt.querySelector(".doc-title-text");
          if (span) span.textContent = titleText;
        }
      } catch (e) {
        /* silent */
      }
      // Keep structured chip (dot + text); do not overwrite with plain innerText
      if (c === "rgba(0, 0, 0, 0)") {
        try {
          hcb(r, n);
        } catch (e) {
          console.error(e, e.stack);
        }
      }
    })
    .catch(err => {
      showError();
    })
    .finally(() => {
      window.dataLayer = window.dataLayer || [];
      function o() {
        dataLayer.push(arguments);
      }
      o("js", new Date());
    });
}

function main() {
  const docId = getQueryParam("document_id");
  if (!docId) {
    showError();
    return;
  }
  let url = docId.startsWith("2PACX-")
    ? `https://docs.google.com/document/d/e/${docId}/pub`
    : `https://docs.google.com/document/d/${docId}/pub`;
  lh(url);
}

document.addEventListener("DOMContentLoaded", main);
