/**
 * reader - Distraction-Free Reading Mode Bookmarklet
 * 
 * This file contains the bookmarklet loader code in both expanded and minified form.
 * The loader dynamically loads the core reader.js script from GitHub.
 * Use the minified version (end of file) for the actual bookmarklet.
 */

// ============================================
// EXPANDED VERSION (for understanding)
// ============================================

javascript:(function() {
  // Create a script element to load the core reader.js from GitHub
  var script = document.createElement('script');
  
  // Load reader.js with cache-busting parameter
  script.src = 'https://edgeof8.github.io/bml-tools/reader/reader.js?v=' + Date.now();
  
  // Append the script to the document body to execute it
  document.body.appendChild(script);
})();

// ============================================
// MINIFIED VERSION (for bookmarklet)
// ============================================

javascript:(function(){var s=document.createElement('script');s.src='https://edgeof8.github.io/bml-tools/reader/reader.js?v='+Date.now();document.body.appendChild(s)})();