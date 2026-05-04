**✅ PRD: reader**  
**Distraction-Free Reader Mode Bookmarklet**

**Version**: 0.1  
**Date**: May 4, 2026  
**Author**: edgeof8  
**Status**: Ready for Implementation

---

### 1. Executive Summary
**reader** is a lightweight, high-performance bookmarklet that strips webpage clutter (ads, sidebars, popups) to provide a "Kindle-like" reading experience. It is designed to be 100% CSP-proof by avoiding injected `<style>` tags in favor of inline CSS variables and atomic styles.

---

### 2. Core Features
- **Heuristic Extraction**: Identify article content using semantic tags or paragraph density.
- **CSP Bypass**: All styles applied via `el.style.cssText` using CSS variables.
- **Responsive Typography**: Clean, readable scales with adjustable font sizes.
- **Theme Support**: Dark and Light modes out of the box.
- **Zero Dependencies**: No external JS libraries required.

### 3. Technical Constraints
- **Isolation**: Must strip all host-site classes and IDs to prevent CSS leakage.
- **Scroll Locking**: Disable body scrolling while the overlay is active.
- **Cleanup**: On close, restore original body state and remove all injected DOM elements.
