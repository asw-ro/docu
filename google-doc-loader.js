// google-doc-loader.js
// This script fetches and displays a Google Doc based on the ID from the query string.

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function showError(o) {
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div style='margin: 25px; font-family: Helvetica, Arial, sans-serif'>Nu s-a putut prelua documentul Google: ${o} | 1) Ai urmat instrucțiunile și ai publicat documentul pe web? | 2) Ai copiat/lipit corect adresa URL?</div>
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
      showError(err.message);
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
    showError("Lipsește ID-ul documentului Google în șirul de interogare (?document_id=...)");
    return;
  }
  let url = docId.startsWith("2PACX-")
    ? `https://docs.google.com/document/d/e/${docId}/pub`
    : `https://docs.google.com/document/d/${docId}/pub`;
  lh(url);
}

document.addEventListener("DOMContentLoaded", main);
