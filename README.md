# rt-cms-nest

`rt-cms-nest` is a high-performance, enterprise-grade micro-frontend injector that dynamically fetches and nests CMS content seamlessly. It bypasses native Webflow CMS nesting limitations by scraping and injecting target DOM elements asynchronously.

<br>

It achieves this without compromising page performance, utilizing an internal architecture featuring:

- **Automatic concurrency management** (prevents network throttling and browser UI lockups)
- **Multi-tier caching** (Memory and SessionStorage) to instantly serve duplicate requests
- **Attribute-driven configuration** requiring zero custom JavaScript
- Support for **multiple independent instances** and deep nested hierarchies
- A clean, predictive global API under `window.rtCmsNest`
- Defensive fallbacks, visual skeleton loaders, and robust error handling
- Built-in Webflow IX2 (Interactions 2.0) re-initialization

---

# Table of Contents

- [1. Installation](#1-installation)
  - [1.1 CDN (jsDelivr)](#11-cdn-jsdelivr)
  - [1.2 npm & Module Bundlers](#12-npm--module-bundlers)
- [2. Quick Start](#2-quick-start)
- [3. Activation Rules](#3-activation-rules)
- [4. Configuration (HTML Attributes)](#4-configuration-html-attributes)
  - [4.1 Root / Wrapper Attributes](#41-root--wrapper-attributes)
  - [4.2 Item Attributes](#42-item-attributes)
  - [4.3 Slot (Dropzone) Attributes](#43-slot-dropzone-attributes)
  - [4.4 Target Page Attributes](#44-target-page-attributes)
- [5. Advanced Extraction & Injection](#5-advanced-extraction--injection)
- [6. Multiple Instances & State Management](#6-multiple-instances--state-management)
- [7. Global API](#7-global-api)
- [8. Lifecycle Events](#8-lifecycle-events)
- [9. Troubleshooting](#9-troubleshooting)
- [10. License](#10-license)

---

## 1. Installation

### 1.1 CDN (jsDelivr)

For traditional HTML/Webflow projects, include the script directly before the closing `</body>` tag.

```html
<script src="https://cdn.jsdelivr.net/npm/@rethink-js/rt-cms-nest@latest/dist/index.min.js"></script>
```

### 1.2 npm & Module Bundlers

For modern build environments (Webpack, Vite, Rollup):

```bash
npm install @rethink-js/rt-cms-nest
```

```javascript
import "@rethink-js/rt-cms-nest";

// The library automatically initializes upon DOMContentLoaded.
// The API is immediately accessible via window.rtCmsNest
```

---

## 2. Quick Start

To use `rt-cms-nest`, you establish a relationship between a **Destination Page** (where content will be injected) and a **Source Page** (where the content currently lives).

```html
<div data-rt-cms-nest>
  <div data-rt-cms-nest-item>
    <a href="/author/jane-doe" data-rt-cms-nest-link style="display: none;"></a>

    <div data-rt-cms-nest-slot="bio">
      <span class="skeleton-loader">Loading bio...</span>
    </div>
  </div>
</div>
```

```html
<div data-rt-cms-nest-target="bio">
  <p>Jane Doe is an amazing author with 10 years of experience.</p>
</div>
```

---

## 3. Activation Rules

The package utilizes a zero-config instantiation model. It activates when **any** element with the `data-rt-cms-nest` attribute is found on the page.

If no root attributes are found, the script safely remains idle with zero performance footprint. It runs a single highly-optimized query on `DOMContentLoaded` to build its internal registry.

---

## 4. Configuration (HTML Attributes)

All configuration is handled declaratively via `data-rt-cms-nest-*` attributes. The inheritance flows from **Root** -> **Item** -> **Slot**, allowing granular overrides at every level.

### 4.1 Root / Wrapper Attributes

Apply these to the primary container wrapping your list of items.

| Attribute                         | Default         | Description                                                           |
| --------------------------------- | --------------- | --------------------------------------------------------------------- |
| `data-rt-cms-nest`                | `true`          | Initializes the instance on this element.                             |
| `data-rt-cms-nest-id`             | Auto-generated  | Unique identifier for the instance. Useful for targeted API calls.    |
| `data-rt-cms-nest-concurrency`    | `6`             | Maximum number of simultaneous fetch requests. Prevents 429 errors.   |
| `data-rt-cms-nest-lazy`           | `true`          | Enables `IntersectionObserver` to fetch items only near viewport.     |
| `data-rt-cms-nest-root-margin`    | `600px`         | Intersection Observer root margin. Determines how early to fetch.     |
| `data-rt-cms-nest-prefetch`       | `none`          | Options: `none`, `all`, `viewport`, `top:N`. Preloads requests early. |
| `data-rt-cms-nest-cache`          | `memory`        | Options: `memory`, `session`, `none`. Caches HTML string responses.   |
| `data-rt-cms-nest-cache-ttl`      | `300`           | Time to live for cache in seconds.                                    |
| `data-rt-cms-nest-timeout`        | `5000`          | Fetch request `AbortController` timeout in milliseconds.              |
| `data-rt-cms-nest-rewrite-links`  | `none`          | Options: `none`, `absolute`, `relative`. Fixes broken relative links. |
| `data-rt-cms-nest-sanitize`       | `strip-scripts` | Strips `<script>` and `<style>` from fetched HTML to prevent XSS.     |
| `data-rt-cms-nest-webflow-reinit` | `false`         | Set to `true` to restart Webflow IX2 engine after DOM injection.      |
| `data-rt-cms-nest-loading-class`  | none            | CSS class applied to the slot while fetching is in progress.          |
| `data-rt-cms-nest-loaded-class`   | none            | CSS class applied to the slot upon successful injection.              |
| `data-rt-cms-nest-error-class`    | none            | CSS class applied to the slot if fetch fails or target is missing.    |

### 4.2 Item Attributes

Add these to the individual cards or rows containing the slots.

| Attribute                   | Default  | Description                                                           |
| --------------------------- | -------- | --------------------------------------------------------------------- |
| `data-rt-cms-nest-item`     | required | Designates the boundaries of a single item context.                   |
| `data-rt-cms-nest-link`     | required | Must be placed on the `<a>` tag containing the source URL.            |
| `data-rt-cms-nest-on-error` | `keep`   | Options: `keep`, `clear`, `hide`, `fallback`. dictates failure state. |
| `data-rt-cms-nest-fallback` | none     | CSS selector of a `<template>` element to clone if the fetch fails.   |

### 4.3 Slot (Dropzone) Attributes

Add these to the precise DOM nodes where you want content injected.

| Attribute                      | Default   | Description                                                                     |
| ------------------------------ | --------- | ------------------------------------------------------------------------------- |
| `data-rt-cms-nest-slot`        | required  | The exact string matching the target element on the source page.                |
| `data-rt-cms-nest-mode`        | `replace` | Options: `replace`, `append`, `prepend`, `before`, `after`.                     |
| `data-rt-cms-nest-extract`     | `node`    | Options: `node`, `text`, `html`, `outerhtml`, `attr:NAME`, `prop:NAME`.         |
| `data-rt-cms-nest-skeleton`    | none      | CSS selector of a `<template>` to inject as a temporary visual placeholder.     |
| `data-rt-cms-nest-placeholder` | `keep`    | Options: `keep`, `clear`, `hide`. How to treat existing inner content initially |
| `data-rt-cms-nest-wrap`        | none      | Emmet-style string (e.g., `div#id.class1`) to wrap the incoming node.           |
| `data-rt-cms-nest-add-class`   | none      | Comma-separated list of classes to append to the slot post-injection.           |

### 4.4 Target Page Attributes

These define the specific DOM nodes on the source page that will be isolated and extracted.

| Attribute                        | Description                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `data-rt-cms-nest-target="name"` | Matches the slot name. You can have multiple distinct targets on a single page. |

---

## 5. Advanced Extraction & Injection

`rt-cms-nest` is not limited to simply moving HTML blocks. You can extract specific attributes or properties, enabling sophisticated data mapping.

**Extracting an Image Source:**
If you want to pull an image's URL from a detail page and apply it directly to an `<img>` tag in your list, use `attr:src`:

```html
<img
  data-rt-cms-nest-slot="author-avatar"
  data-rt-cms-nest-extract="attr:src"
  src="placeholder-avatar.webp"
/>

<img
  data-rt-cms-nest-target="author-avatar"
  src="https://cdn.example.com/jane-doe.jpg"
/>
```

**Using mode="after" for Layout Preservation:**
To inject content as a direct sibling of an existing element without creating redundant wrapper `<div>`s:

```html
<div
  class="existing-header"
  data-rt-cms-nest-slot="extra-details"
  data-rt-cms-nest-mode="after"
>
  <h3>Post Details</h3>
</div>
```

---

## 6. Multiple Instances & State Management

`rt-cms-nest` handles complex pages effortlessly. You can have multiple CMS lists on the same page, each managed by its own isolated queue, memory cache, and intersection observer.

To create custom loading states, utilize the state classes:

```css
/* Custom CSS applied while the request is in flight */
.is-loading-nest {
  opacity: 0.5;
  pointer-events: none;
  filter: blur(2px);
  transition: all 0.3s ease;
}

/* Custom CSS applied when content fails to load */
.has-nest-error {
  display: none !important;
}
```

Apply these via your wrapper configuration:

```html
<div
  data-rt-cms-nest="true"
  data-rt-cms-nest-loading-class="is-loading-nest"
  data-rt-cms-nest-error-class="has-nest-error"
></div>
```

---

## 7. Global API

Once initialized, the package exposes a global interface allowing programmatic control, which is essential for Single Page Applications (SPAs) or integrations with third-party filtering libraries.

```javascript
window.rtCmsNest;
```

| Method         | Description                                                                            |
| -------------- | -------------------------------------------------------------------------------------- |
| `ids()`        | Returns an array of active instance IDs on the page.                                   |
| `get(id)`      | Returns the specific instance object, exposing its internal queue and item states.     |
| `refresh(id?)` | Destroys and re-initializes an instance. Provide an ID, or leave blank to refresh all. |
| `clearCache()` | Purges the internal Map memory and sessionStorage cache.                               |
| `destroy(id?)` | Safely aborts active fetch requests and disconnects `IntersectionObserver` instances.  |

**Integration Example: Finsweet CMS Filter**
When a user filters a list, the DOM updates dynamically. You must tell `rt-cms-nest` to rescan the DOM and fetch content for the newly rendered items.

```javascript
window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  "cmsfilter",
  (filterInstances) => {
    // Listen for Finsweet's render event
    filterInstances[0].listInstance.on("renderitems", () => {
      if (window.rtCmsNest) {
        // Rescan the DOM and process new items
        window.rtCmsNest.refresh();
      }
    });
  },
]);
```

---

## 8. Lifecycle Events

The script dispatches high-fidelity `CustomEvent`s to the `window` object. The `event.detail` payload contains deep context about the operation, allowing you to trigger custom animations or analytics events.

- `rtCmsNest:start` (Fired on initialization. Contains instance ID & root element)
- `rtCmsNest:itemStart` (Fired when an item enters the viewport and begins fetching)
- `rtCmsNest:itemSuccess` (Fired when a slot is successfully populated)
- `rtCmsNest:itemError` (Fired on HTTP failure, abort, or missing target)
- `rtCmsNest:complete` (Fired when all items within an instance have successfully resolved)

**Listening to Events:**

```javascript
window.addEventListener("rtCmsNest:itemSuccess", (event) => {
  const { url, drop, slot, durationMs, fromCache } = event.detail;

  console.log(`Successfully nested ${slot} from ${url} in ${durationMs}ms`);

  // Example: Triggering a GSAP animation on the newly injected node
  gsap.fromTo(drop, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
});
```

---

## 9. Troubleshooting

**Content isn't loading**

- Check the console for errors. `data-rt-cms-nest-debug="true"` will output verbose logs.
- Ensure `data-rt-cms-nest-link` is present on a valid `<a>` tag inside the item boundary.
- Verify `data-rt-cms-nest-target` matches the exact string in `data-rt-cms-nest-slot`. Case sensitivity matters.

**Items aren't loading until scrolled**

- This is the intended behavior of the `IntersectionObserver` to preserve user bandwidth and API limits. Add `data-rt-cms-nest-lazy="false"` to your wrapper to force immediate fetching on page load.

**Target content loses its styles**

- CSS is class-based. Ensure the CSS classes utilized in the target page actually exist in the stylesheet of the destination page. Webflow automatically removes "unused" CSS classes during publishing. _Fix: Create a hidden style-guide div on the destination page containing the necessary classes._

**Links break when fetched**

- Relative links (`<a href="#about-us">` or `<a href="/pricing">`) lose their context when injected into a new page path. Add `data-rt-cms-nest-rewrite-links="absolute"` to automatically convert them to fully qualified absolute URLs during injection.

**Webflow interactions (IX2) are broken on injected items**

- The Webflow IX2 engine only scans the DOM once on page load. When you inject new HTML, it doesn't know it exists. Add `data-rt-cms-nest-webflow-reinit="true"` to your wrapper. The library will automatically trigger `Webflow.require('ix2').init()` after injection is complete.

---

## 10. License

MIT License

Package: `@rethink-js/rt-cms-nest` <br>
GitHub: [https://github.com/Rethink-JS/rt-cms-nest](https://github.com/Rethink-JS/rt-cms-nest)

---

by **Rethink JS** <br>
[https://github.com/Rethink-JS](https://github.com/Rethink-JS)
