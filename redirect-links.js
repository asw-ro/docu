function check404Redirects() {
  var path = window.location.pathname.substring(1);

  fetch("https://asis.asw.ro/asisservice/linkuri?codlink=docu&reponsetype=json")
    .then(function (r) {
      return r.json();
    })
    .then(function (redirects) {
      // The API returns an array of objects: { numescurt, urlcomplet }
      var found = redirects.find(function (item) {
        return item.numescurt === path;
      });
      if (found && found.urlcomplet) {
        var url = new URL(found.urlcomplet);
        // Preserve original URL parameters
        var search = window.location.search;
        if (search && search.length > 1) {
          var originalParams = new URLSearchParams(search);
          var targetParams = url.searchParams;
          originalParams.forEach(function (value, key) {
            targetParams.delete(key);
            targetParams.append(key, value);
          });
        }
        window.location.href = url.toString();
      }
    })
    .catch(function () {
      console.error("probleme gogule");
    });
}

window.addEventListener("load", function () {
  setTimeout(function () {
    check404Redirects();
  }, 10);
});
