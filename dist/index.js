/*! @rethink-js/rt-cms-nest v1.0.0 | MIT */
(() => {
  // src/index.js
  (function() {
    var RT_NS = "rtCmsNest";
    if (window[RT_NS] && window[RT_NS].__initialized) return;
    var PREFIX = "data-rt-cms-nest-";
    function uid() {
      return "n" + Math.random().toString(36).slice(2);
    }
    function assignUID(el, attr) {
      if (!el.getAttribute(attr)) el.setAttribute(attr, uid());
      return el.getAttribute(attr);
    }
    function toStr(v) {
      return v === null || v === void 0 ? "" : String(v);
    }
    function trimStr(v) {
      return toStr(v).trim();
    }
    function parseBool(v, def) {
      if (v === null || v === void 0) return def;
      var s = String(v).trim().toLowerCase();
      if (s === "") return true;
      if (s === "true" || s === "1" || s === "yes" || s === "y" || s === "on")
        return true;
      if (s === "false" || s === "0" || s === "no" || s === "n" || s === "off")
        return false;
      return def;
    }
    function parseNum(v, def) {
      if (v === null || v === void 0) return def;
      var s = String(v).trim();
      if (!s.length) return def;
      var n = Number(s);
      return Number.isFinite(n) ? n : def;
    }
    function parseList(v) {
      var s = trimStr(v);
      if (!s) return [];
      return s.split(",").map(function(x) {
        return x.trim();
      }).filter(Boolean);
    }
    function clampInt(n, min, max) {
      if (!Number.isFinite(n)) return min;
      if (n < min) return min;
      if (n > max) return max;
      return n;
    }
    function nowMs() {
      return typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    }
    function dispatch(name, detail) {
      try {
        var ev = new CustomEvent(name, { detail: detail || {} });
        window.dispatchEvent(ev);
      } catch (e) {
      }
    }
    function safeClosest(el, sel) {
      if (!el || !sel) return null;
      if (el.closest) return el.closest(sel);
      var n = el;
      while (n && n.nodeType === 1) {
        try {
          if (n.matches && n.matches(sel)) return n;
        } catch (e) {
        }
        n = n.parentElement;
      }
      return null;
    }
    function toAbsoluteUrl(href) {
      try {
        return new URL(href, window.location.href).toString();
      } catch (e) {
        return "";
      }
    }
    function normalizeUrl(url) {
      var u = "";
      try {
        u = new URL(url, window.location.href);
      } catch (e) {
        return "";
      }
      u.hash = "";
      return u.toString();
    }
    function sameOrigin(a, b) {
      try {
        return new URL(a).origin === new URL(b).origin;
      } catch (e) {
        return false;
      }
    }
    function sleep(ms) {
      return new Promise(function(r) {
        setTimeout(r, ms);
      });
    }
    function fetchWithTimeout(url, opts, timeoutMs) {
      var o = opts || {};
      var controller = new AbortController();
      var signal = controller.signal;
      var t = setTimeout(function() {
        try {
          controller.abort();
        } catch (e) {
        }
      }, timeoutMs);
      var merged = {};
      for (var k in o) merged[k] = o[k];
      merged.signal = signal;
      return fetch(url, merged).then(function(res) {
        clearTimeout(t);
        return res;
      }).catch(function(err) {
        clearTimeout(t);
        if (err && err.name === "AbortError")
          throw new Error("Request timed out");
        throw err;
      });
    }
    function parseHTML(htmlText) {
      var parser = new DOMParser();
      return parser.parseFromString(htmlText, "text/html");
    }
    function stripScriptsAndStyles(node) {
      if (!node || node.nodeType !== 1) return;
      var scripts = node.querySelectorAll("script");
      for (var i = 0; i < scripts.length; i++) {
        var s = scripts[i];
        if (s && s.parentNode) s.parentNode.removeChild(s);
      }
      var styles = node.querySelectorAll("style");
      for (var j = 0; j < styles.length; j++) {
        var st = styles[j];
        if (st && st.parentNode) st.parentNode.removeChild(st);
      }
    }
    function removeBySelectors(node, selectorsCsv) {
      if (!node || node.nodeType !== 1) return;
      var sels = parseList(selectorsCsv);
      if (!sels.length) return;
      for (var i = 0; i < sels.length; i++) {
        var sel = sels[i];
        try {
          var found = node.querySelectorAll(sel);
          for (var j = 0; j < found.length; j++) {
            var f = found[j];
            if (f && f.parentNode) f.parentNode.removeChild(f);
          }
        } catch (e) {
        }
      }
    }
    function rewriteLinks(node, mode, baseUrl) {
      if (!node || node.nodeType !== 1) return;
      var m = trimStr(mode).toLowerCase();
      if (!m || m === "none") return;
      var anchors = node.querySelectorAll("a[href]");
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        var href = a.getAttribute("href");
        if (!href) continue;
        if (/^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
        try {
          var abs = new URL(href, baseUrl).toString();
          if (m === "absolute") a.setAttribute("href", abs);
          else if (m === "relative") {
            var u = new URL(abs);
            a.setAttribute("href", u.pathname + u.search + u.hash);
          }
        } catch (e) {
        }
      }
      var imgs = node.querySelectorAll("img[src]");
      for (var j = 0; j < imgs.length; j++) {
        var img = imgs[j];
        var src = img.getAttribute("src");
        if (!src) continue;
        if (/^(data:|blob:)/i.test(src)) continue;
        try {
          var absSrc = new URL(src, baseUrl).toString();
          if (m === "absolute") img.setAttribute("src", absSrc);
          else if (m === "relative") {
            var uu = new URL(absSrc);
            img.setAttribute("src", uu.pathname + uu.search + uu.hash);
          }
        } catch (e) {
        }
      }
    }
    function addClass(el, cls) {
      if (!el || !cls) return;
      var list = parseList(cls);
      for (var i = 0; i < list.length; i++) el.classList.add(list[i]);
    }
    function removeClass(el, cls) {
      if (!el || !cls) return;
      var list = parseList(cls);
      for (var i = 0; i < list.length; i++) el.classList.remove(list[i]);
    }
    function setLoadingState(drop, cfg, isLoading) {
      if (!drop) return;
      if (isLoading) {
        if (cfg.loadingClass) addClass(drop, cfg.loadingClass);
        if (cfg.loadedClass) removeClass(drop, cfg.loadedClass);
        if (cfg.errorClass) removeClass(drop, cfg.errorClass);
      } else {
        if (cfg.loadingClass) removeClass(drop, cfg.loadingClass);
      }
    }
    function setSuccessState(drop, cfg) {
      if (!drop) return;
      if (cfg.loadingClass) removeClass(drop, cfg.loadingClass);
      if (cfg.errorClass) removeClass(drop, cfg.errorClass);
      if (cfg.loadedClass) addClass(drop, cfg.loadedClass);
    }
    function setErrorState(drop, cfg) {
      if (!drop) return;
      if (cfg.loadingClass) removeClass(drop, cfg.loadingClass);
      if (cfg.loadedClass) removeClass(drop, cfg.loadedClass);
      if (cfg.errorClass) addClass(drop, cfg.errorClass);
    }
    function buildWrapper(spec) {
      var s = trimStr(spec);
      if (!s) return null;
      var tag = "div";
      var id = "";
      var classes = [];
      var attrPairs = [];
      var rest = s;
      var tagMatch = rest.match(/^[a-zA-Z][a-zA-Z0-9-]*/);
      if (tagMatch) {
        tag = tagMatch[0];
        rest = rest.slice(tag.length);
      }
      var part = "";
      while (rest.length) {
        var c = rest[0];
        if (c === "#") {
          rest = rest.slice(1);
          part = rest.match(/^[a-zA-Z0-9\-_]+/);
          if (part) {
            id = part[0];
            rest = rest.slice(part[0].length);
          } else break;
        } else if (c === ".") {
          rest = rest.slice(1);
          part = rest.match(/^[a-zA-Z0-9\-_]+/);
          if (part) {
            classes.push(part[0]);
            rest = rest.slice(part[0].length);
          } else break;
        } else if (c === "[") {
          var end = rest.indexOf("]");
          if (end === -1) break;
          var inside = rest.slice(1, end);
          rest = rest.slice(end + 1);
          var eq = inside.indexOf("=");
          if (eq === -1) {
            attrPairs.push({ k: inside.trim(), v: "" });
          } else {
            var k = inside.slice(0, eq).trim();
            var v = inside.slice(eq + 1).trim();
            v = v.replace(/^["']|["']$/g, "");
            attrPairs.push({ k, v });
          }
        } else {
          break;
        }
      }
      var el = document.createElement(tag);
      if (id) el.id = id;
      for (var i = 0; i < classes.length; i++) el.classList.add(classes[i]);
      for (var j = 0; j < attrPairs.length; j++) {
        if (!attrPairs[j].k) continue;
        el.setAttribute(attrPairs[j].k, attrPairs[j].v);
      }
      return el;
    }
    function insertNode(drop, node, mode) {
      var m = trimStr(mode).toLowerCase();
      if (!m) m = "replace";
      if (m === "replace") {
        while (drop.firstChild) drop.removeChild(drop.firstChild);
        drop.appendChild(node);
        return;
      }
      if (m === "append") {
        drop.appendChild(node);
        return;
      }
      if (m === "prepend") {
        drop.insertBefore(node, drop.firstChild || null);
        return;
      }
      if (m === "before") {
        if (drop.parentNode) drop.parentNode.insertBefore(node, drop);
        return;
      }
      if (m === "after") {
        if (drop.parentNode) drop.parentNode.insertBefore(node, drop.nextSibling);
        return;
      }
      while (drop.firstChild) drop.removeChild(drop.firstChild);
      drop.appendChild(node);
    }
    function getTextOrHtml(node, extractMode, attrName) {
      if (!node) return "";
      var mode = trimStr(extractMode).toLowerCase();
      if (!mode || mode === "html") return node.innerHTML;
      if (mode === "text") return node.textContent || "";
      if (mode === "outerhtml") return node.outerHTML || "";
      if (mode === "attr" && attrName) {
        return node.getAttribute(attrName) || "";
      }
      return node.innerHTML;
    }
    function applyExtractToDrop(drop, value, extractMode) {
      var mode = trimStr(extractMode).toLowerCase();
      if (!mode || mode === "node") return false;
      if (mode === "text") {
        drop.textContent = value;
        return true;
      }
      if (mode === "html" || mode === "outerhtml") {
        drop.innerHTML = value;
        return true;
      }
      if (mode.indexOf("attr:") === 0) {
        var attr = mode.slice(5).trim();
        if (attr) drop.setAttribute(attr, value);
        return true;
      }
      if (mode.indexOf("prop:") === 0) {
        var prop = mode.slice(5).trim();
        if (prop) {
          try {
            drop[prop] = value;
          } catch (e) {
          }
        }
        return true;
      }
      return false;
    }
    function getRootConfig(root) {
      function ga(name) {
        return root.getAttribute(PREFIX + name);
      }
      var allowOrigins = parseList(ga("allow-origins"));
      var cacheMode = trimStr(ga("cache")).toLowerCase();
      if (!cacheMode) cacheMode = "memory";
      if (cacheMode !== "memory" && cacheMode !== "session" && cacheMode !== "none")
        cacheMode = "memory";
      var ttlSec = parseNum(ga("cache-ttl"), 300);
      if (!Number.isFinite(ttlSec) || ttlSec < 0) ttlSec = 300;
      var timeoutMs = parseNum(ga("timeout"), 5e3);
      timeoutMs = clampInt(timeoutMs, 500, 6e4);
      var concurrency = parseNum(ga("concurrency"), 6);
      concurrency = clampInt(concurrency, 1, 32);
      var lazy = parseBool(ga("lazy"), true);
      var rootMargin = trimStr(ga("root-margin"));
      if (!rootMargin) rootMargin = "600px";
      var threshold = parseNum(ga("threshold"), 0);
      if (!Number.isFinite(threshold)) threshold = 0;
      var sanitize = trimStr(ga("sanitize")).toLowerCase();
      if (!sanitize) sanitize = "strip-scripts";
      var removeSel = trimStr(ga("remove"));
      var strip = trimStr(ga("strip")).toLowerCase();
      var rewrite = trimStr(ga("rewrite-links")).toLowerCase();
      if (!rewrite) rewrite = "none";
      var depth = parseNum(ga("depth"), 1);
      depth = clampInt(depth, 1, 5);
      var debug = parseBool(ga("debug"), false);
      var logLevel = trimStr(ga("log")).toLowerCase();
      if (!logLevel) logLevel = debug ? "info" : "warn";
      if (logLevel !== "silent" && logLevel !== "warn" && logLevel !== "info")
        logLevel = "warn";
      var itemSelector = trimStr(ga("item"));
      if (!itemSelector) itemSelector = "[data-rt-cms-nest-item]";
      var linkSelector = trimStr(ga("link"));
      if (!linkSelector) linkSelector = "[data-rt-cms-nest-link]";
      var urlAttr = trimStr(ga("url-attr"));
      if (!urlAttr) urlAttr = "data-rt-cms-nest-url";
      var loadingClass = trimStr(ga("loading-class"));
      var loadedClass = trimStr(ga("loaded-class"));
      var errorClass = trimStr(ga("error-class"));
      var prefetch = trimStr(ga("prefetch")).toLowerCase();
      if (!prefetch) prefetch = "none";
      var webflowReinit = parseBool(ga("webflow-reinit"), false);
      return {
        allowOrigins,
        cacheMode,
        ttlMs: Math.floor(ttlSec * 1e3),
        timeoutMs,
        concurrency,
        lazy,
        rootMargin,
        threshold,
        sanitize,
        strip,
        removeSel,
        rewrite,
        depth,
        debug,
        logLevel,
        itemSelector,
        linkSelector,
        urlAttr,
        loadingClass,
        loadedClass,
        errorClass,
        prefetch,
        webflowReinit
      };
    }
    function log(cfg, level, args) {
      if (!cfg || cfg.logLevel === "silent") return;
      if (level === "info" && cfg.logLevel !== "info") return;
      try {
        var fn = level === "info" ? console.log : level === "warn" ? console.warn : console.error;
        fn.apply(console, args);
      } catch (e) {
      }
    }
    function getItemConfig(item, rootCfg) {
      function ga(name) {
        return item.getAttribute(PREFIX + name);
      }
      var url = trimStr(ga("url"));
      var urlSource = trimStr(ga("url-source")).toLowerCase();
      if (!urlSource) urlSource = "auto";
      var linkSel = trimStr(ga("link-selector"));
      if (!linkSel) linkSel = rootCfg.linkSelector;
      var urlAttr = trimStr(ga("url-attr"));
      if (!urlAttr) urlAttr = rootCfg.urlAttr;
      var maxSlots = parseNum(ga("max"), void 0);
      if (maxSlots !== void 0) maxSlots = clampInt(maxSlots, 1, 100);
      var onError = trimStr(ga("on-error")).toLowerCase();
      if (!onError) onError = "keep";
      var fallbackSel = trimStr(ga("fallback"));
      return {
        url,
        urlSource,
        linkSel,
        urlAttr,
        maxSlots,
        onError,
        fallbackSel
      };
    }
    function getDropConfig(drop, rootCfg) {
      function ga(name) {
        return drop.getAttribute(PREFIX + name);
      }
      var key = trimStr(ga("slot"));
      if (!key) key = trimStr(drop.getAttribute("data-rt-cms-nest-slot")) || "";
      var from = trimStr(ga("from"));
      var mode = trimStr(ga("mode"));
      if (!mode) mode = "replace";
      var clone = parseBool(ga("clone"), true);
      var wrap = trimStr(ga("wrap"));
      var addCls = trimStr(ga("add-class"));
      var placeholder = trimStr(ga("placeholder")).toLowerCase();
      if (!placeholder) placeholder = "keep";
      var skeletonSel = trimStr(ga("skeleton"));
      var extract = trimStr(ga("extract")).toLowerCase();
      if (!extract) extract = "node";
      var strip = trimStr(ga("strip")).toLowerCase();
      var removeSel = trimStr(ga("remove"));
      var rewrite = trimStr(ga("rewrite-links")).toLowerCase();
      var sanitize = trimStr(ga("sanitize")).toLowerCase();
      var loadingClass = trimStr(ga("loading-class")) || rootCfg.loadingClass;
      var loadedClass = trimStr(ga("loaded-class")) || rootCfg.loadedClass;
      var errorClass = trimStr(ga("error-class")) || rootCfg.errorClass;
      return {
        key,
        from,
        mode,
        clone,
        wrap,
        addClass: addCls,
        placeholder,
        skeletonSel,
        extract,
        strip,
        removeSel,
        rewrite,
        sanitize,
        loadingClass,
        loadedClass,
        errorClass
      };
    }
    function resolveUrlForItem(item, itemCfg, rootCfg) {
      if (itemCfg.urlSource === "attr") {
        var raw = item.getAttribute(itemCfg.urlAttr);
        if (!raw) return "";
        return toAbsoluteUrl(raw);
      }
      if (itemCfg.urlSource === "closest") {
        var closestSel = trimStr(item.getAttribute(PREFIX + "url-closest"));
        if (!closestSel) closestSel = "a[href]";
        var found = safeClosest(item, closestSel);
        if (found) {
          var href = found.getAttribute("href");
          if (href) return toAbsoluteUrl(href);
        }
      }
      if (itemCfg.urlSource === "link") {
        var link = item.querySelector(itemCfg.linkSel);
        if (link) {
          var href2 = link.getAttribute("href");
          if (href2) return toAbsoluteUrl(href2);
        }
        return "";
      }
      if (itemCfg.url) return toAbsoluteUrl(itemCfg.url);
      var rawAttr = item.getAttribute(itemCfg.urlAttr);
      if (rawAttr) return toAbsoluteUrl(rawAttr);
      var linkAuto = item.querySelector(itemCfg.linkSel) || item.querySelector("a[href]");
      if (linkAuto) {
        var href3 = linkAuto.getAttribute("href");
        if (href3) return toAbsoluteUrl(href3);
      }
      return "";
    }
    function buildTargetSelectorForDrop(dropCfg) {
      if (dropCfg.from) return dropCfg.from;
      if (dropCfg.key)
        return '[data-rt-cms-nest-target="' + cssEscape(dropCfg.key) + '"]';
      return "";
    }
    function cssEscape(s) {
      if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(s);
      return String(s).replace(/["\\]/g, "\\$&");
    }
    function templateClone(sel) {
      if (!sel) return null;
      var t = document.querySelector(sel);
      if (!t) return null;
      if (t.tagName && t.tagName.toLowerCase() === "template") {
        var frag = t.content ? t.content.cloneNode(true) : null;
        if (!frag) return null;
        var wrap = document.createElement("div");
        wrap.appendChild(frag);
        if (wrap.childNodes.length === 1) return wrap.firstChild;
        return wrap;
      }
      return t.cloneNode(true);
    }
    function applyPlaceholder(drop, dropCfg) {
      if (!drop) return;
      if (dropCfg.placeholder === "clear") {
        while (drop.firstChild) drop.removeChild(drop.firstChild);
        return;
      }
      if (dropCfg.placeholder === "hide") {
        drop.style.display = "none";
        return;
      }
    }
    function showDropIfHidden(drop, dropCfg) {
      if (!drop) return;
      if (dropCfg.placeholder === "hide") {
        drop.style.display = "";
      }
    }
    function applySkeleton(drop, dropCfg) {
      if (!drop || !dropCfg.skeletonSel) return;
      var sk = templateClone(dropCfg.skeletonSel);
      if (!sk) return;
      while (drop.firstChild) drop.removeChild(drop.firstChild);
      drop.appendChild(sk);
    }
    function allowOriginCheck(url, rootCfg) {
      if (!url) return false;
      var pageOrigin = window.location.origin;
      if (sameOrigin(url, window.location.href)) return true;
      if (!rootCfg.allowOrigins || !rootCfg.allowOrigins.length) return false;
      try {
        var u = new URL(url);
        for (var i = 0; i < rootCfg.allowOrigins.length; i++) {
          try {
            var ao = new URL(rootCfg.allowOrigins[i], window.location.href);
            if (u.origin === ao.origin) return true;
          } catch (e) {
          }
        }
      } catch (e) {
      }
      return false;
    }
    function sessionGet(key) {
      try {
        var raw = sessionStorage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    function sessionSet(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
      }
    }
    var memoryCache = /* @__PURE__ */ new Map();
    var inflight = /* @__PURE__ */ new Map();
    function cacheKeyFor(url) {
      return "rtCmsNest::" + normalizeUrl(url);
    }
    function getCached(rootCfg, url) {
      var key = cacheKeyFor(url);
      if (rootCfg.cacheMode === "none") return null;
      if (rootCfg.cacheMode === "session") {
        var obj = sessionGet(key);
        if (!obj || !obj.t || !obj.html) return null;
        if (rootCfg.ttlMs > 0 && Date.now() - obj.t > rootCfg.ttlMs) return null;
        return { html: obj.html, t: obj.t, from: "session" };
      }
      var mem = memoryCache.get(key);
      if (!mem) return null;
      if (rootCfg.ttlMs > 0 && Date.now() - mem.t > rootCfg.ttlMs) {
        memoryCache.delete(key);
        return null;
      }
      return { html: mem.html, t: mem.t, from: "memory" };
    }
    function setCached(rootCfg, url, html) {
      var key = cacheKeyFor(url);
      if (rootCfg.cacheMode === "none") return;
      if (rootCfg.cacheMode === "session") {
        sessionSet(key, { t: Date.now(), html });
        return;
      }
      memoryCache.set(key, { t: Date.now(), html });
    }
    function fetchDoc(rootCfg, url, abortSignal) {
      var nurl = normalizeUrl(url);
      if (!nurl) return Promise.reject(new Error("Invalid URL"));
      if (inflight.has(nurl)) return inflight.get(nurl);
      var cached = getCached(rootCfg, nurl);
      if (cached && cached.html) {
        return Promise.resolve({
          url: nurl,
          html: cached.html,
          fromCache: true,
          cacheFrom: cached.from
        });
      }
      var p = fetchWithTimeout(
        nurl,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: abortSignal,
          headers: { "X-Requested-With": "rt-cms-nest" }
        },
        rootCfg.timeoutMs
      ).then(function(res) {
        if (!res || !("ok" in res)) throw new Error("Fetch failed");
        if (!res.ok) {
          var err = new Error("HTTP " + res.status);
          err.status = res.status;
          throw err;
        }
        return res.text().then(function(txt) {
          return { url: nurl, html: txt, fromCache: false, cacheFrom: "none" };
        });
      }).then(function(out) {
        setCached(rootCfg, nurl, out.html);
        return out;
      }).finally(function() {
        inflight.delete(nurl);
      });
      inflight.set(nurl, p);
      return p;
    }
    function buildTargetsMap(doc) {
      var map = /* @__PURE__ */ new Map();
      if (!doc || !doc.querySelectorAll) return map;
      var nodes = doc.querySelectorAll("[data-rt-cms-nest-target]");
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var k = n.getAttribute("data-rt-cms-nest-target");
        if (!k) continue;
        k = k.trim();
        if (!k) continue;
        if (!map.has(k)) map.set(k, n);
      }
      return map;
    }
    function applyTransforms(node, baseUrl, effective) {
      if (!node || node.nodeType !== 1) return;
      if (effective.sanitize === "strip-scripts") {
        stripScriptsAndStyles(node);
      }
      if (effective.strip) {
        var parts = parseList(effective.strip);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i].toLowerCase();
          if (p === "script") {
            var s = node.querySelectorAll("script");
            for (var j = 0; j < s.length; j++)
              if (s[j].parentNode) s[j].parentNode.removeChild(s[j]);
          } else if (p === "style") {
            var st = node.querySelectorAll("style");
            for (var k = 0; k < st.length; k++)
              if (st[k].parentNode) st[k].parentNode.removeChild(st[k]);
          } else if (p) {
            try {
              var other = node.querySelectorAll(p);
              for (var x = 0; x < other.length; x++)
                if (other[x].parentNode)
                  other[x].parentNode.removeChild(other[x]);
            } catch (e) {
            }
          }
        }
      }
      if (effective.removeSel) removeBySelectors(node, effective.removeSel);
      rewriteLinks(node, effective.rewrite, baseUrl);
    }
    function effectiveConfig(rootCfg, dropCfg) {
      return {
        sanitize: dropCfg.sanitize ? dropCfg.sanitize : rootCfg.sanitize,
        strip: dropCfg.strip ? dropCfg.strip : rootCfg.strip,
        removeSel: dropCfg.removeSel ? dropCfg.removeSel : rootCfg.removeSel,
        rewrite: dropCfg.rewrite ? dropCfg.rewrite : rootCfg.rewrite
      };
    }
    function runWebflowReinitIfNeeded(rootCfg) {
      if (!rootCfg.webflowReinit) return;
      try {
        if (window.Webflow && window.Webflow.require) {
          var ix2 = window.Webflow.require("ix2");
          if (ix2 && ix2.init) ix2.init();
        }
      } catch (e) {
      }
    }
    function Queue(max) {
      this.max = max;
      this.active = 0;
      this.q = [];
      this.stopped = false;
    }
    Queue.prototype.push = function(fn) {
      var self = this;
      return new Promise(function(resolve, reject) {
        self.q.push({ fn, resolve, reject });
        self.pump();
      });
    };
    Queue.prototype.pump = function() {
      var self = this;
      if (self.stopped) return;
      while (self.active < self.max && self.q.length) {
        var t = self.q.shift();
        self.active++;
        Promise.resolve().then(t.fn).then(function(v) {
          self.active--;
          t.resolve(v);
          self.pump();
        }).catch(function(e) {
          self.active--;
          t.reject(e);
          self.pump();
        });
      }
    };
    Queue.prototype.clear = function() {
      this.q = [];
    };
    Queue.prototype.stop = function() {
      this.stopped = true;
      this.clear();
    };
    function collectDrops(item, itemCfg) {
      var drops = Array.from(item.querySelectorAll("[data-rt-cms-nest-slot]"));
      if (itemCfg.maxSlots !== void 0 && itemCfg.maxSlots !== null) {
        drops = drops.slice(0, itemCfg.maxSlots);
      }
      return drops;
    }
    function shouldLazyLoadItem(item, rootCfg) {
      var v = item.getAttribute(PREFIX + "lazy");
      if (v !== null) return parseBool(v, rootCfg.lazy);
      return rootCfg.lazy;
    }
    function createObserver(rootCfg, onEnter) {
      if (typeof IntersectionObserver === "undefined") return null;
      return new IntersectionObserver(
        function(entries) {
          for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            if (e.isIntersecting || e.intersectionRatio > 0) {
              try {
                onEnter(e.target);
              } catch (err) {
              }
            }
          }
        },
        {
          root: null,
          rootMargin: rootCfg.rootMargin,
          threshold: rootCfg.threshold
        }
      );
    }
    var state = {
      instances: {},
      order: []
    };
    function Instance(root, id) {
      this.root = root;
      this.id = id;
      this.cfg = getRootConfig(root);
      this.valid = true;
      this.rootId = assignUID(root, "data-rt-cms-nest-id");
      this.queue = new Queue(this.cfg.concurrency);
      this.items = [];
      this.observer = null;
      this.abortCtrl = new AbortController();
      this.aborted = false;
      this.itemState = /* @__PURE__ */ new WeakMap();
      this.targetsCache = /* @__PURE__ */ new Map();
      this._onPH = null;
      this._onBU = null;
    }
    Instance.prototype.destroy = function() {
      if (this.aborted) return;
      this.aborted = true;
      try {
        this.abortCtrl.abort();
      } catch (e) {
      }
      if (this.queue) this.queue.stop();
      if (this.observer) {
        try {
          this.observer.disconnect();
        } catch (e) {
        }
        this.observer = null;
      }
      if (this._onPH) window.removeEventListener("pagehide", this._onPH);
      if (this._onBU) window.removeEventListener("beforeunload", this._onBU);
      this.items = [];
      this.targetsCache.clear();
    };
    Instance.prototype.bindLifecycle = function() {
      var self = this;
      this._onPH = function() {
        self.destroy();
      };
      window.addEventListener("pagehide", this._onPH);
      this._onBU = function() {
        self.destroy();
      };
      window.addEventListener("beforeunload", this._onBU);
    };
    Instance.prototype.findItems = function() {
      var sel = this.cfg.itemSelector || "[data-rt-cms-nest-item]";
      var nodes = Array.from(this.root.querySelectorAll(sel));
      return nodes.filter(function(n) {
        return n && n.nodeType === 1;
      });
    };
    Instance.prototype.itemKey = function(item) {
      return assignUID(item, "data-rt-cms-nest-item-id");
    };
    Instance.prototype.prefetchPlan = function() {
      var p = this.cfg.prefetch;
      if (!p || p === "none") return { type: "none", n: 0 };
      if (p === "all") return { type: "all", n: 0 };
      if (p === "viewport") return { type: "viewport", n: 0 };
      if (p.indexOf("top:") === 0) {
        var n = parseNum(p.slice(4), 0);
        n = clampInt(n, 0, 200);
        return { type: "top", n };
      }
      return { type: "none", n: 0 };
    };
    Instance.prototype.schedulePrefetch = function(items) {
      var self = this;
      var plan = this.prefetchPlan();
      if (plan.type === "none") return;
      function schedule(fn) {
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(
            function() {
              fn();
            },
            { timeout: 1e3 }
          );
        } else {
          setTimeout(fn, 0);
        }
      }
      var list = items.slice();
      if (plan.type === "top") list = list.slice(0, plan.n);
      if (plan.type === "all") list = list;
      if (plan.type === "viewport") return;
      schedule(function() {
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          if (!item) continue;
          var itemCfg = getItemConfig(item, self.cfg);
          var url = resolveUrlForItem(item, itemCfg, self.cfg);
          if (!url) continue;
          if (!allowOriginCheck(url, self.cfg)) continue;
          self.queue.push(
            /* @__PURE__ */ (function(u) {
              return function() {
                return fetchDoc(self.cfg, u, self.abortCtrl.signal).catch(
                  function() {
                  }
                );
              };
            })(url)
          );
        }
      });
    };
    Instance.prototype.ensureObserver = function() {
      if (this.observer) return;
      var self = this;
      this.observer = createObserver(this.cfg, function(item) {
        if (!item) return;
        if (!self.observer) return;
        try {
          self.observer.unobserve(item);
        } catch (e) {
        }
        self.processItem(item, 1);
      });
    };
    Instance.prototype.init = function() {
      this.bindLifecycle();
      dispatch("rtCmsNest:start", { id: this.id, root: this.root });
      this.items = this.findItems();
      var self = this;
      var plan = this.prefetchPlan();
      if (plan.type !== "none") this.schedulePrefetch(this.items);
      if (this.cfg.lazy && typeof IntersectionObserver !== "undefined") {
        this.ensureObserver();
        for (var i = 0; i < this.items.length; i++) {
          var item = this.items[i];
          if (!item) continue;
          if (!shouldLazyLoadItem(item, this.cfg)) {
            this.processItem(item, 1);
            continue;
          }
          try {
            this.observer.observe(item);
          } catch (e) {
            this.processItem(item, 1);
          }
        }
      } else {
        for (var j = 0; j < this.items.length; j++) {
          this.processItem(this.items[j], 1);
        }
      }
      return this;
    };
    Instance.prototype.processItem = function(item, depth) {
      var self = this;
      if (!item || this.aborted) return;
      var itemId = this.itemKey(item);
      if (this.itemState.get(item) && this.itemState.get(item).done) return;
      var rootCfg = this.cfg;
      var itemCfg = getItemConfig(item, rootCfg);
      var url = resolveUrlForItem(item, itemCfg, rootCfg);
      if (!url) {
        log(rootCfg, "warn", ["rtCmsNest: Missing URL for item", item]);
        this.itemState.set(item, {
          done: true,
          ok: false,
          reason: "missing-url"
        });
        return;
      }
      if (!allowOriginCheck(url, rootCfg)) {
        log(rootCfg, "warn", ["rtCmsNest: URL not allowed (origin)", url, item]);
        this.itemState.set(item, { done: true, ok: false, reason: "origin" });
        return;
      }
      var drops = collectDrops(item, itemCfg);
      if (!drops.length) {
        this.itemState.set(item, { done: true, ok: true, reason: "no-drops" });
        return;
      }
      dispatch("rtCmsNest:itemStart", {
        id: this.id,
        itemId,
        item,
        url
      });
      for (var i = 0; i < drops.length; i++) {
        var drop = drops[i];
        var dCfg = getDropConfig(drop, rootCfg);
        var merged = {
          loadingClass: dCfg.loadingClass,
          loadedClass: dCfg.loadedClass,
          errorClass: dCfg.errorClass
        };
        applyPlaceholder(drop, dCfg);
        applySkeleton(drop, dCfg);
        setLoadingState(drop, merged, true);
      }
      var started = nowMs();
      return this.queue.push(function() {
        return fetchDoc(rootCfg, url, self.abortCtrl.signal);
      }).then(function(res) {
        if (self.aborted) return null;
        var doc = parseHTML(res.html);
        var targetsMap = buildTargetsMap(doc);
        self.targetsCache.set(normalizeUrl(url), {
          doc,
          targets: targetsMap
        });
        var baseUrl = normalizeUrl(url) || url;
        for (var di = 0; di < drops.length; di++) {
          var dropEl = drops[di];
          if (!dropEl || !dropEl.isConnected) continue;
          var dropCfg = getDropConfig(dropEl, rootCfg);
          var mergedStates = {
            loadingClass: dropCfg.loadingClass,
            loadedClass: dropCfg.loadedClass,
            errorClass: dropCfg.errorClass
          };
          var targetSel = buildTargetSelectorForDrop(dropCfg);
          var targetNode = null;
          if (dropCfg.key && targetsMap.has(dropCfg.key)) {
            targetNode = targetsMap.get(dropCfg.key);
          } else if (targetSel) {
            try {
              targetNode = doc.querySelector(targetSel);
            } catch (e) {
              targetNode = null;
            }
          }
          if (!targetNode) {
            setErrorState(dropEl, mergedStates);
            showDropIfHidden(dropEl, dropCfg);
            handleDropError(dropEl, dropCfg, itemCfg, rootCfg, url);
            dispatch("rtCmsNest:itemError", {
              id: self.id,
              itemId,
              item,
              url,
              drop: dropEl,
              slot: dropCfg.key || "",
              reason: "missing-target"
            });
            continue;
          }
          var eff = effectiveConfig(rootCfg, dropCfg);
          var extractMode = dropCfg.extract;
          var attrName = null;
          if (extractMode && extractMode.indexOf("attr:") === 0) {
            attrName = extractMode.slice(5).trim();
            extractMode = "attr";
          }
          if (dropCfg.extract && dropCfg.extract !== "node") {
            var val = getTextOrHtml(targetNode, extractMode, attrName);
            while (dropEl.firstChild) dropEl.removeChild(dropEl.firstChild);
            applyExtractToDrop(dropEl, val, dropCfg.extract);
            showDropIfHidden(dropEl, dropCfg);
            if (dropCfg.addClass) addClass(dropEl, dropCfg.addClass);
            setSuccessState(dropEl, mergedStates);
            dispatch("rtCmsNest:itemSuccess", {
              id: self.id,
              itemId,
              item,
              url,
              drop: dropEl,
              slot: dropCfg.key || "",
              fromCache: !!res.fromCache,
              cacheFrom: res.cacheFrom,
              durationMs: Math.round(nowMs() - started)
            });
            continue;
          }
          var nodeToInsert = dropCfg.clone ? targetNode.cloneNode(true) : targetNode;
          if (nodeToInsert && nodeToInsert.nodeType === 1) {
            applyTransforms(nodeToInsert, baseUrl, eff);
          }
          var wrapper = buildWrapper(dropCfg.wrap);
          if (wrapper) {
            wrapper.appendChild(nodeToInsert);
            nodeToInsert = wrapper;
          }
          insertNode(dropEl, nodeToInsert, dropCfg.mode);
          showDropIfHidden(dropEl, dropCfg);
          if (dropCfg.addClass) addClass(dropEl, dropCfg.addClass);
          setSuccessState(dropEl, mergedStates);
          dispatch("rtCmsNest:itemSuccess", {
            id: self.id,
            itemId,
            item,
            url,
            drop: dropEl,
            slot: dropCfg.key || "",
            fromCache: !!res.fromCache,
            cacheFrom: res.cacheFrom,
            durationMs: Math.round(nowMs() - started)
          });
        }
        if (rootCfg.depth > 1 && depth < rootCfg.depth) {
          try {
            var nestedRoots = Array.from(
              item.querySelectorAll("[data-rt-cms-nest]")
            );
            for (var ni = 0; ni < nestedRoots.length; ni++) {
              var nr = nestedRoots[ni];
              if (!nr || nr === self.root) continue;
              try {
                var tmpId = nr.getAttribute("data-rt-cms-nest-id") || "nested-" + uid();
                if (!nr.getAttribute("data-rt-cms-nest-id"))
                  nr.setAttribute("data-rt-cms-nest-id", tmpId);
              } catch (e) {
              }
            }
          } catch (e) {
          }
        }
        runWebflowReinitIfNeeded(rootCfg);
        self.itemState.set(item, { done: true, ok: true, url });
        return true;
      }).catch(function(err) {
        if (self.aborted) return;
        log(rootCfg, "error", ["rtCmsNest: Fetch error", url, err]);
        for (var di2 = 0; di2 < drops.length; di2++) {
          var drop2 = drops[di2];
          if (!drop2 || !drop2.isConnected) continue;
          var dCfg2 = getDropConfig(drop2, rootCfg);
          var mergedStates2 = {
            loadingClass: dCfg2.loadingClass,
            loadedClass: dCfg2.loadedClass,
            errorClass: dCfg2.errorClass
          };
          setErrorState(drop2, mergedStates2);
          showDropIfHidden(drop2, dCfg2);
          handleDropError(drop2, dCfg2, itemCfg, rootCfg, url);
        }
        dispatch("rtCmsNest:itemError", {
          id: self.id,
          itemId,
          item,
          url,
          reason: "fetch",
          error: err ? String(err.message || err) : "error"
        });
        self.itemState.set(item, {
          done: true,
          ok: false,
          url,
          error: err
        });
        return false;
      }).finally(function() {
        if (self.aborted) return;
        maybeComplete(self);
      });
    };
    function handleDropError(drop, dropCfg, itemCfg, rootCfg, url) {
      var action = (itemCfg.onError || "keep").toLowerCase();
      if (dropCfg && dropCfg.placeholder === "hide") {
        drop.style.display = "";
      }
      if (action === "keep") return;
      if (action === "clear") {
        while (drop.firstChild) drop.removeChild(drop.firstChild);
        return;
      }
      if (action === "hide") {
        drop.style.display = "none";
        return;
      }
      if (action === "fallback") {
        var sel = itemCfg.fallbackSel || "";
        if (!sel) return;
        var fb = templateClone(sel);
        if (!fb) return;
        while (drop.firstChild) drop.removeChild(drop.firstChild);
        drop.appendChild(fb);
        return;
      }
    }
    function maybeComplete(inst) {
      if (!inst || inst.aborted) return;
      var done = 0;
      var total = inst.items.length;
      for (var i = 0; i < inst.items.length; i++) {
        var it = inst.items[i];
        var st = inst.itemState.get(it);
        if (st && st.done) done++;
      }
      if (done >= total) {
        dispatch("rtCmsNest:complete", {
          id: inst.id,
          root: inst.root,
          total
        });
      }
    }
    function init() {
      var roots = document.querySelectorAll("[data-rt-cms-nest]");
      var autoCount = 0;
      for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        var id = root.getAttribute("data-rt-cms-nest-id");
        if (!id) {
          autoCount++;
          id = "cms-nest-" + autoCount;
          root.setAttribute("data-rt-cms-nest-id", id);
        }
        if (state.instances[id]) continue;
        var inst = new Instance(root, id);
        state.instances[id] = inst;
        state.order.push(id);
        inst.init();
      }
    }
    function makeApi() {
      return {
        __initialized: true,
        ids: function() {
          return state.order.slice();
        },
        get: function(id) {
          return state.instances[id] || null;
        },
        refresh: function(id) {
          if (typeof id === "string") {
            var inst = state.instances[id];
            if (!inst) return;
            try {
              inst.destroy();
            } catch (e) {
            }
            delete state.instances[id];
            var idx = state.order.indexOf(id);
            if (idx > -1) state.order.splice(idx, 1);
            var root = document.querySelector(
              '[data-rt-cms-nest-id="' + cssEscape(id) + '"]'
            );
            if (root) {
              var newInst = new Instance(root, id);
              state.instances[id] = newInst;
              state.order.push(id);
              newInst.init();
            }
            return;
          }
          var ids = state.order.slice();
          for (var i = 0; i < ids.length; i++) {
            var k = ids[i];
            var inst2 = state.instances[k];
            if (!inst2) continue;
            try {
              inst2.destroy();
            } catch (e) {
            }
            delete state.instances[k];
          }
          state.instances = {};
          state.order = [];
          init();
        },
        destroy: function(id) {
          if (typeof id === "string") {
            var inst = state.instances[id];
            if (inst) {
              inst.destroy();
              delete state.instances[id];
              var idx = state.order.indexOf(id);
              if (idx > -1) state.order.splice(idx, 1);
            }
            return;
          }
          for (var i = 0; i < state.order.length; i++) {
            var k = state.order[i];
            if (state.instances[k]) state.instances[k].destroy();
          }
          state.instances = {};
          state.order = [];
        },
        clearCache: function() {
          memoryCache.clear();
          try {
            var keys = [];
            for (var i = 0; i < sessionStorage.length; i++) {
              var k = sessionStorage.key(i);
              if (k && k.indexOf("rtCmsNest::") === 0) keys.push(k);
            }
            for (var j = 0; j < keys.length; j++)
              sessionStorage.removeItem(keys[j]);
          } catch (e) {
          }
        }
      };
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
    window[RT_NS] = makeApi();
  })();
})();
//# sourceMappingURL=index.js.map
