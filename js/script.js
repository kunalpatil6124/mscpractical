/* Shared JS for the static practicals site.
   - Sets document.title to the GitHub repository name (tries GitHub API then falls back)
   - Adds copy-to-clipboard for code blocks
   - Adds small navigation helpers and smooth scroll
   - All functions are simple and well-commented for beginners
*/

/* ========== Configuration & helpers ========== */

// Try to read repo owner/name from meta tags (easy to edit)
const repoOwner = document.querySelector('meta[name="repo-owner"]')?.content || '';
const repoName = document.querySelector('meta[name="repo-name"]')?.content || '';

// A small helper to safely set the page/site title
function setSiteTitle(title) {
  // Set document title and the visible header if present
  document.title = title;
  const titleEl = document.getElementById('site-title');
  if (titleEl) titleEl.textContent = title;
  // Also set brand text if present
  const brand = document.querySelector('.brand');
  if (brand) brand.textContent = title;
}

/* ========== Get repo name from GitHub API (best-effort) ========== */
async function resolveRepoName() {
  // If owner or repo missing, fallback quickly
  if (!repoOwner || !repoName) {
    setSiteTitle('MSC-Practical ZBPC');
    return;
  }

  // Try to fetch repository details from GitHub public API (CORS allowed)
  const api = `https://api.github.com/repos/${encodeURIComponent(repoOwner)}/${encodeURIComponent(repoName)}`;
  try {
    const resp = await fetch(api, {cache: 'no-store'});
    if (!resp.ok) throw new Error('network');
    const json = await resp.json();
    const name = json.name || `${repoOwner}/${repoName}`;
    setSiteTitle(name);
  } catch (e) {
    // If network fails, try to infer from location (if hosted under /owner/repo)
    const inferred = inferFromLocation() || repoName || 'MSC-Practical ZBPC';
    setSiteTitle(inferred);
  }
}

// Infer repo name if site is hosted on GitHub Pages path such as /owner/repo/
function inferFromLocation() {
  try {
    const parts = location.pathname.split('/');
    // Find non-empty segments
    const segs = parts.filter(Boolean);
    // If path ends with something like /owner/repo or /repo, prefer last segment
    if (segs.length >= 2) {
      return segs[segs.length - 1];
    } else if (segs.length === 1) {
      return segs[0];
    }
  } catch (e) { /* ignore */ }
  return null;
}

/* ========== Copy to clipboard ========== */

// Copy text from an element (code block) to clipboard
async function copyCodeToClipboard(codeEl) {
  if (!codeEl) return;
  const text = codeEl.innerText;
  // Use Clipboard API when available
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // fall back
    }
  }
  // Fallback method: textarea
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch (e) {
    document.body.removeChild(ta);
    return false;
  }
}

// Attach click listeners to copy buttons
function initCopyButtons() {
  // Buttons have data-copy-target attribute with the ID of the code element
  const buttons = document.querySelectorAll('.copy-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const targetId = btn.dataset.copyTarget;
      const codeEl = document.getElementById(targetId);
      if (!codeEl) return;
      // Provide immediate feedback
      const originalText = btn.textContent;
      btn.textContent = 'Copying…';
      btn.disabled = true;
      const ok = await copyCodeToClipboard(codeEl);
      btn.textContent = ok ? 'Copied ✓' : 'Copy';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 1500);
    });
  });
}

/* ========== Small UI helpers ========== */

// Smooth scroll for anchor links (if any)
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({behavior: 'smooth'});
    });
  });
}

/* ========== Init on DOMContentLoaded ========== */
document.addEventListener('DOMContentLoaded', () => {
  resolveRepoName();
  initCopyButtons();
  initSmoothLinks();
});