export default {
  editor: { label: { en: "Attachment Viewer" } },
  triggerEvents: [
    { name: "change", label: { en: "On attachment change" }, event: { index: 0, url: "", name: "", attachment: {} } },
    { name: "download", label: { en: "On download click" }, event: { index: 0, url: "", name: "" } },
    { name: "openTab", label: { en: "On open-in-tab click" }, event: { index: 0, url: "", name: "" } },
    { name: "close", label: { en: "On close" }, event: { index: 0 } },
  ],
  properties: {
    // ---- data ----
    // Accepts a plain array OR a WeWeb collection { data: [...] }. Items can be
    // URL strings or Airtable-style attachment objects:
    //   { id, url, filename, type, thumbnails: { small, large, full } }
    attachments: {
      label: { en: "Attachments (bind)" }, type: "Array", bindable: true,
      defaultValue: [
        { url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200", filename: "unit-1.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200", filename: "panel.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200", filename: "hvac.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=1200", filename: "bath.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200", filename: "sink.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=1200", filename: "kitchen.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1200", filename: "roof.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=1200", filename: "yard.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200", filename: "interior.jpg", type: "image/jpeg" },
        { url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200", filename: "exterior.jpg", type: "image/jpeg" },
      ],
    },
    startIndex: { label: { en: "Start index" }, type: "Number", defaultValue: 0, bindable: true },

    // ---- toolbar ----
    showDownload: { label: { en: "Show Download button" }, type: "OnOff", defaultValue: true, bindable: true },
    downloadLabel: { label: { en: "Download label" }, type: "Text", defaultValue: "Download", bindable: true },
    showOpenTab: { label: { en: "Show open-in-tab button" }, type: "OnOff", defaultValue: true, bindable: true },
    openTabLabel: { label: { en: "Open-in-tab label" }, type: "Text", defaultValue: "Tab", bindable: true },
    showClose: { label: { en: "Show Close button" }, type: "OnOff", defaultValue: true, bindable: true },
    closeLabel: { label: { en: "Close label" }, type: "Text", defaultValue: "Close", bindable: true },
    showCounter: { label: { en: "Show counter (n of N)" }, type: "OnOff", defaultValue: true, bindable: true },

    // ---- viewer ----
    stageHeight: { label: { en: "Viewer height (px)" }, type: "Number", options: { min: 200, max: 1200, step: 10 }, defaultValue: 480, bindable: true },
    loop: { label: { en: "Loop navigation (wrap ends)" }, type: "OnOff", defaultValue: true, bindable: true },
    keyboardNav: { label: { en: "Arrow-key navigation" }, type: "OnOff", defaultValue: true, bindable: true },
    showHint: { label: { en: "Show bottom hint" }, type: "OnOff", defaultValue: false, bindable: true },
    hintText: { label: { en: "Hint text" }, type: "Text", defaultValue: "Click outside or press Close to dismiss", bindable: true },
    emptyText: { label: { en: "Empty text" }, type: "Text", defaultValue: "No attachments", bindable: true },

    // ---- thumbnails ----
    showThumbs: { label: { en: "Show thumbnail strip" }, type: "OnOff", defaultValue: true, bindable: true },
    thumbsPerPage: { label: { en: "Thumbnails per page" }, type: "Number", options: { min: 2, max: 30, step: 1 }, defaultValue: 8, bindable: true },

    // ---- theme ----
    primaryColor: { label: { en: "Primary color" }, type: "Color", defaultValue: "#2563eb", bindable: true },
    accentColor: { label: { en: "Accent color" }, type: "Color", defaultValue: "#6366f1", bindable: true },
    darkMode: {
      label: { en: "Theme mode" }, type: "TextSelect",
      options: { options: [
        { value: "auto", label: { en: "Auto (system)" } },
        { value: "light", label: { en: "Light" } },
        { value: "dark", label: { en: "Dark" } },
      ] }, defaultValue: "auto", bindable: true,
    },
    radius: { label: { en: "Corner radius (px)" }, type: "Number", options: { min: 0, max: 32, step: 1 }, defaultValue: 16, bindable: true },
  },
};
