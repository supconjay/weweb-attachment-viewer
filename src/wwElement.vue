<template>
  <div class="pp-root" :class="themeClass" :style="rootStyle">
    <div class="pp-viewer">
      <!-- toolbar -->
      <div class="pp-toolbar">
        <button v-if="content.showDownload !== false" type="button" class="pp-btn pp-btn--primary" @click="downloadCurrent" :disabled="!current">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('download')"></path></svg> {{ content.downloadLabel || 'Download' }}
        </button>
        <button v-if="content.showOpenTab !== false" type="button" class="pp-btn pp-btn--ghost" @click="openCurrent" :disabled="!current">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('plus')"></path></svg> {{ content.openTabLabel || 'Tab' }}
        </button>
        <button v-if="content.showClose !== false" type="button" class="pp-btn pp-btn--ghost" @click="emitClose">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('x')"></path></svg> {{ content.closeLabel || 'Close' }}
        </button>
        <div class="pp-toolbar__spacer"></div>
        <span v-if="content.showCounter !== false && items.length" class="pp-counter">{{ index + 1 }} of {{ items.length }}</span>
      </div>

      <!-- stage -->
      <div class="pp-stage" :style="stageStyle">
        <button v-if="items.length > 1" type="button" class="pp-navbtn pp-navbtn--left" :disabled="!canPrev" @click="go(-1)" aria-label="Previous">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-left')"></path></svg>
        </button>

        <template v-if="current">
          <img v-if="isImage(current)" class="pp-stage__img" :src="current.url" :alt="current.name" />
          <video v-else-if="isVideo(current)" class="pp-stage__img" :src="current.url" controls></video>
          <iframe v-else-if="isPdf(current)" class="pp-stage__pdf" :src="current.url" :title="current.name" loading="lazy"></iframe>
          <button v-else type="button" class="pp-stage__file" @click="openCurrent">
            <svg class="pp-svg pp-stage__fileicon" v-bind="svgAttrs"><path :d="ic('file')"></path></svg>
            <span class="pp-stage__filename">{{ current.name || 'Attachment' }}</span>
            <span class="pp-stage__fileopen">Open in new tab</span>
          </button>
        </template>
        <div v-else class="pp-stage__empty">{{ content.emptyText || 'No attachments' }}</div>

        <button v-if="items.length > 1" type="button" class="pp-navbtn pp-navbtn--right" :disabled="!canNext" @click="go(1)" aria-label="Next">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-right')"></path></svg>
        </button>
      </div>

      <!-- thumbnails -->
      <div v-if="content.showThumbs !== false && items.length > 1" class="pp-thumbs">
        <button type="button" class="pp-thumbnav" :disabled="thumbPage <= 0" @click="thumbPage--" aria-label="Previous thumbnails">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-left')"></path></svg>
        </button>
        <div class="pp-thumbs__row">
          <button
            v-for="t in pagedThumbs" :key="t.i" type="button" class="pp-thumb"
            :class="{ 'pp-thumb--active': t.i === index }" :title="t.item.name"
            @click="setIndex(t.i)"
          >
            <img v-if="isImage(t.item) || t.item.hasThumb" class="pp-thumb__img" :src="t.item.thumb" :alt="t.item.name" loading="lazy" />
            <span v-else class="pp-thumb__file"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic(isVideo(t.item) ? 'play' : 'file')"></path></svg></span>
          </button>
        </div>
        <button type="button" class="pp-thumbnav" :disabled="thumbPage >= thumbPageCount - 1" @click="thumbPage++" aria-label="Next thumbnails">
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-right')"></path></svg>
        </button>
      </div>
      <div v-if="content.showThumbs !== false && thumbPageCount > 1" class="pp-thumbs__pageinfo">{{ thumbPage + 1 }} / {{ thumbPageCount }}</div>

      <!-- hint -->
      <div v-if="content.showHint === true" class="pp-hint">{{ content.hintText || 'Click outside or press Close to dismiss' }}</div>
    </div>
  </div>
</template>

<script>
const ICONS = {
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  "chevron-left": "M15 18l-6-6 6-6",
  "chevron-right": "M9 18l6-6-6-6",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  play: "M5 3l14 9-14 9V3z",
};

const IMG_RE = /\.(png|jpe?g|gif|webp|svg|avif|bmp|heic)(\?|#|$)/i;
const VID_RE = /\.(mp4|mov|webm|m4v|ogv)(\?|#|$)/i;
const PDF_RE = /\.pdf(\?|#|$)/i;

export default {
  props: { content: { type: Object, required: true }, uid: { type: String, required: false } },
  emits: ["trigger-event"],
  data() {
    return { index: 0, thumbPage: 0, _onKeydown: null };
  },
  created() {
    this.index = this.clampIndex(Number(this.content.startIndex) || 0);
  },
  mounted() {
    this._onKeydown = (e) => {
      if (this.content.keyboardNav === false) return;
      // Don't hijack arrows while the user is typing somewhere.
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); this.go(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); this.go(1); }
      else if (e.key === "Escape") this.emitClose();
    };
    document.addEventListener("keydown", this._onKeydown);
  },
  beforeUnmount() {
    if (this._onKeydown) document.removeEventListener("keydown", this._onKeydown);
  },
  watch: {
    "content.attachments"() { this.index = this.clampIndex(this.index); this.thumbPage = this.pageOf(this.index); },
    "content.startIndex"(v) { this.setIndex(this.clampIndex(Number(v) || 0), true); },
    index(v) { this.thumbPage = this.pageOf(v); },
    thumbsPerPage() { this.thumbPage = this.pageOf(this.index); },
  },
  computed: {
    svgAttrs() {
      return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" };
    },
    items() {
      let src = this.content.attachments;
      if (src && !Array.isArray(src) && Array.isArray(src.data)) src = src.data;
      if (!Array.isArray(src)) return [];
      return src
        .map((a, i) => this.normalize(a, i))
        .filter((a) => a && a.url);
    },
    current() { return this.items[this.index] || null; },
    loop() { return this.content.loop !== false; },
    canPrev() { return this.loop || this.index > 0; },
    canNext() { return this.loop || this.index < this.items.length - 1; },
    thumbsPerPage() {
      const n = Number(this.content.thumbsPerPage);
      return n > 0 ? n : 8;
    },
    thumbPageCount() { return Math.max(1, Math.ceil(this.items.length / this.thumbsPerPage)); },
    pagedThumbs() {
      const start = this.thumbPage * this.thumbsPerPage;
      return this.items.slice(start, start + this.thumbsPerPage).map((item, k) => ({ item, i: start + k }));
    },
    stageStyle() {
      const h = Number(this.content.stageHeight);
      return { "--pp-stage-h": (h > 0 ? h : 480) + "px" };
    },
    themeClass() {
      const m = this.content.darkMode || "auto";
      return { "pp-auto": m === "auto", "pp-dark": m === "dark", "pp-light": m === "light" };
    },
    rootStyle() {
      return {
        "--pp-primary": this.content.primaryColor || "#2563eb",
        "--pp-accent": this.content.accentColor || "#6366f1",
        "--pp-radius": (this.content.radius != null ? this.content.radius : 16) + "px",
      };
    },
  },
  methods: {
    ic(name) { return ICONS[name] || ""; },
    // Normalizes a URL string or Airtable attachment object into { url, name, type, thumb, raw }.
    normalize(a, i) {
      if (a == null) return null;
      if (typeof a === "string") return { url: a, name: this.nameFromUrl(a), type: "", thumb: a, hasThumb: false, raw: a, i };
      const url = a.url || a.src || a.href || "";
      const th = a.thumbnails || {};
      const thumbUrl = (th.large && th.large.url) || (th.small && th.small.url) || "";
      const rawName = a.filename || a.name || this.nameFromUrl(url);
      return { url, name: this.decodeName(rawName), type: a.type || "", thumb: thumbUrl || url, hasThumb: !!thumbUrl, raw: a, i };
    },
    decodeName(n) {
      try { return decodeURIComponent(String(n)); } catch (e) { return String(n); }
    },
    nameFromUrl(u) {
      try { return decodeURIComponent(String(u).split("?")[0].split("/").pop() || ""); } catch (e) { return String(u); }
    },
    isImage(a) { return /^image\//i.test(a.type) || IMG_RE.test(a.url); },
    isVideo(a) { return /^video\//i.test(a.type) || VID_RE.test(a.url); },
    isPdf(a) { return /pdf/i.test(a.type) || PDF_RE.test(a.url) || PDF_RE.test(a.name || ""); },
    clampIndex(i) { return Math.max(0, Math.min(this.items.length ? this.items.length - 1 : 0, i)); },
    pageOf(i) { return Math.floor(this.clampIndex(i) / this.thumbsPerPage); },
    setIndex(i, silent) {
      const next = this.clampIndex(i);
      if (next === this.index && !silent) return;
      this.index = next;
      const c = this.current;
      if (!silent && c) this.$emit("trigger-event", { name: "change", event: { index: next, url: c.url, name: c.name, attachment: c.raw } });
    },
    go(delta) {
      if (!this.items.length) return;
      let next = this.index + delta;
      if (this.loop) next = (next + this.items.length) % this.items.length;
      else next = this.clampIndex(next);
      this.setIndex(next);
    },
    downloadCurrent() {
      const c = this.current;
      if (!c) return;
      // Best-effort browser download; cross-origin files usually open in a tab instead.
      const a = document.createElement("a");
      a.href = c.url;
      a.download = c.name || "";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.$emit("trigger-event", { name: "download", event: { index: this.index, url: c.url, name: c.name } });
    },
    openCurrent() {
      const c = this.current;
      if (!c) return;
      window.open(c.url, "_blank", "noopener,noreferrer");
      this.$emit("trigger-event", { name: "openTab", event: { index: this.index, url: c.url, name: c.name } });
    },
    emitClose() { this.$emit("trigger-event", { name: "close", event: { index: this.index } }); },
  },
};
</script>

<style lang="scss" scoped>
.pp-root {
  --surface: #ffffff; --surface-2: #f7f9fc; --surface-3: #eef2f7; --border: #e4e9f0; --border-strong: #d4dbe6;
  --text: #1f2a37; --text-muted: #64748b; --text-subtle: #94a3b8;
  --shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06);
  --stage-bg: #0b0d10;
  --primary: var(--pp-primary, #2563eb); --accent: var(--pp-accent, #6366f1); --radius: var(--pp-radius, 16px);
  box-sizing: border-box; width: 100%; max-width: 100%; container-type: inline-size; color: var(--text);
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.45;
}
.pp-root *, .pp-root *::before, .pp-root *::after { box-sizing: border-box; }
@mixin dark {
  --surface: #161f30; --surface-2: #1b2638; --surface-3: #202c40; --border: #28344a; --border-strong: #34425c;
  --text: #e8eef7; --text-muted: #94a3b8; --text-subtle: #64748b;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 28px rgba(0, 0, 0, 0.35);
}
.pp-root.pp-dark { @include dark; }
@media (prefers-color-scheme: dark) { .pp-root.pp-auto { @include dark; } }

.pp-viewer { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }

/* toolbar */
.pp-toolbar { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: var(--surface); border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.pp-toolbar__spacer { flex: 1 1 auto; }
.pp-counter { font-size: 12.5px; font-weight: 700; color: var(--text-muted); white-space: nowrap; }
.pp-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 8px; border: 1px solid transparent; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: inherit; transition: filter .15s, background .15s, border-color .15s; }
.pp-btn:disabled { opacity: .45; cursor: not-allowed; }
.pp-btn .pp-svg { width: 15px; height: 15px; }
.pp-btn--primary { background: var(--primary); color: #fff; }
.pp-btn--primary:hover:not(:disabled) { filter: brightness(1.08); }
.pp-btn--ghost { background: var(--surface); color: var(--text); border-color: var(--border-strong); }
.pp-btn--ghost:hover:not(:disabled) { background: var(--surface-2); }

/* stage */
.pp-stage { position: relative; display: flex; align-items: center; justify-content: center; height: var(--pp-stage-h, 480px); background: var(--stage-bg); overflow: hidden; }
.pp-stage__img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
.pp-stage__pdf { width: 100%; height: 100%; border: 0; display: block; background: #fff; }
.pp-stage__empty { color: #8b93a1; font-size: 14px; font-weight: 600; }
.pp-stage__file { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 34px; border: 1px dashed rgba(255, 255, 255, .3); border-radius: 14px; background: rgba(255, 255, 255, .05); color: #e6e9ef; cursor: pointer; font-family: inherit; transition: background .15s; }
.pp-stage__file:hover { background: rgba(255, 255, 255, .1); }
.pp-stage__fileicon { width: 42px; height: 42px; }
.pp-stage__filename { font-size: 13.5px; font-weight: 700; max-width: 340px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pp-stage__fileopen { font-size: 12px; color: #9fc1ff; font-weight: 600; }

.pp-navbtn { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; border: none; background: rgba(255, 255, 255, .12); color: #fff; cursor: pointer; backdrop-filter: blur(3px); transition: background .15s, opacity .15s; }
.pp-navbtn:hover:not(:disabled) { background: rgba(255, 255, 255, .26); }
.pp-navbtn:disabled { opacity: .25; cursor: not-allowed; }
.pp-navbtn .pp-svg { width: 20px; height: 20px; }
.pp-navbtn--left { left: 12px; }
.pp-navbtn--right { right: 12px; }

/* thumbnails */
.pp-thumbs { display: flex; align-items: center; gap: 8px; padding: 12px 14px 6px; background: var(--surface); }
.pp-thumbs__row { display: flex; align-items: center; gap: 8px; flex: 1 1 auto; min-width: 0; overflow: hidden; justify-content: center; }
.pp-thumb { flex: none; width: 62px; height: 62px; padding: 0; border-radius: 10px; border: 2px solid transparent; background: var(--surface-3); cursor: pointer; overflow: hidden; transition: border-color .15s, transform .12s, opacity .15s; opacity: .75; }
.pp-thumb:hover { opacity: 1; }
.pp-thumb--active { border-color: var(--primary); opacity: 1; transform: translateY(-1px); box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent); }
.pp-thumb__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pp-thumb__file { display: grid; place-items: center; width: 100%; height: 100%; color: var(--text-muted); }
.pp-thumb__file .pp-svg { width: 22px; height: 22px; }
.pp-thumbnav { flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-muted); cursor: pointer; transition: background .15s, color .15s; }
.pp-thumbnav:hover:not(:disabled) { background: var(--surface-2); color: var(--text); }
.pp-thumbnav:disabled { opacity: .35; cursor: not-allowed; }
.pp-thumbnav .pp-svg { width: 16px; height: 16px; }
.pp-thumbs__pageinfo { text-align: center; font-size: 11.5px; font-weight: 700; color: var(--text-subtle); padding: 0 0 10px; }
.pp-thumbs + .pp-hint, .pp-thumbs__pageinfo + .pp-hint { border-top: 1px solid var(--border); }

/* hint */
.pp-hint { padding: 10px 14px; background: var(--surface-2); color: var(--text-muted); font-size: 12.5px; }

.pp-svg { display: block; }

/* responsive */
@container (max-width: 560px) {
  .pp-stage { height: clamp(220px, 60cqw, 360px); }
  .pp-thumb { width: 48px; height: 48px; border-radius: 8px; }
  .pp-navbtn { width: 36px; height: 36px; }
  .pp-btn { padding: 7px 11px; font-size: 12.5px; }
}
</style>
