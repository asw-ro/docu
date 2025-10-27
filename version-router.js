/**
 * Version Router - Handles navigation to specific publication versions
 * URL format: docu.asiserp.ro/v{version} or docu.asiserp.ro/{version}
 */
function handleVersionRouting() {
  // Extract path (e.g., "v9.26.0", "9.26.0", "v54439", "54439")
  const path = window.location.pathname.substring(1); // Remove leading "/"

  if (!path) return; // Empty path, do nothing

  // Check if path looks like a version number (semantic version or simple numeric)
  // Matches: v9.26.0, 9.26.0, v54439, 54439, etc.
  const versionPattern = /^v?(\d+(?:\.\d+(?:\.\d+)?)?)$/i;
  const match = path.match(versionPattern);

  if (match) {
    const versionNumber = match[1]; // Extract version without 'v' prefix

    // Redirect to publications tab with version parameter
    const url = new URL(window.location.origin);
    url.searchParams.set("tab", "publicatii");
    url.searchParams.set("version", versionNumber);

    window.location.href = url.toString();
  }
}

// Run on page load
if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
  handleVersionRouting();
}
