(() => {
  const bgVideo = document.querySelector(".bg-tunnel-video");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedMotionQuery.matches;

  function syncBackgroundVideo() {
    document.body.classList.toggle("is-page-hidden", document.hidden);
    if (!bgVideo) return;
    if (reducedMotion || document.hidden) {
      bgVideo.pause();
    } else {
      const playPromise = bgVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
  }

  function initBackgroundVideo() {
    document.body.classList.toggle("is-page-hidden", document.hidden);
    if (!bgVideo) return;
    if (reducedMotion) {
      bgVideo.removeAttribute("autoplay");
      bgVideo.pause();
    } else {
      syncBackgroundVideo();
    }
    bgVideo.addEventListener("play", () => {
      if (reducedMotion || document.hidden) {
        bgVideo.pause();
      }
    });
    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", (e) => {
        reducedMotion = e.matches;
        syncBackgroundVideo();
      });
    }
  }

  initBackgroundVideo();
  document.addEventListener("visibilitychange", syncBackgroundVideo);

  const pageKey = document.body.dataset.page || "";
  const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
  const toastEl = document.getElementById("selectionToast");
  let toastTimer = null;
  let currentLang = "th";

  try {
    const saved = localStorage.getItem("bigfather_lang");
    if (saved === "en" || saved === "th") currentLang = saved;
  } catch (_) {}

  function showToast(msg) {
    if (!toastEl || !msg) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2400);
  }

  function applyLanguage(lang) {
    currentLang = lang === "en" ? "en" : "th";
    document.documentElement.lang = currentLang;
    try {
      localStorage.setItem("bigfather_lang", currentLang);
    } catch (_) {}

    langButtons.forEach((btn) => {
      const active = btn.dataset.lang === currentLang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll("[data-th][data-en]").forEach((el) => {
      el.textContent = currentLang === "th" ? el.dataset.th : el.dataset.en;
    });

    document.querySelectorAll("[data-ph-th][data-ph-en]").forEach((el) => {
      el.placeholder = currentLang === "th" ? el.dataset.phTh : el.dataset.phEn;
    });
  }

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });

  applyLanguage(currentLang);

  // ========================================================================
  // PAGE 01: PROFILE
  // ========================================================================
  if (pageKey === "profile") {
    const tabBtns = Array.from(document.querySelectorAll(".tab-btn"));
    const tabPanes = Array.from(document.querySelectorAll(".profile-tab-pane"));

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        tabBtns.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle("is-active", isActive);
          b.setAttribute("aria-selected", String(isActive));
        });
        tabPanes.forEach((p) => p.classList.toggle("is-active", p.dataset.pane === target));
      });
    });

    const filterBtns = Array.from(document.querySelectorAll(".skill-filter-btn"));
    const skillCatGrid = document.getElementById("skillCatGrid");
    const skillCatCards = Array.from(document.querySelectorAll(".skill-cat-card"));

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.cat || "all";
        filterBtns.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle("is-active", isActive);
          b.setAttribute("aria-pressed", String(isActive));
        });

        skillCatCards.forEach((card) => {
          const hide = cat !== "all" && card.dataset.cat !== cat;
          card.classList.toggle("is-hidden", hide);
        });

        if (skillCatGrid) {
          skillCatGrid.classList.toggle("is-single", cat !== "all");
        }
      });
    });
  }

  // ========================================================================
  // PAGE 02: PRODUCT
  // ========================================================================
  if (pageKey === "product") {
    const PROJECTS = [
      {
        id: "asing-asong",
        name: "A Sing A Song Music",
        stageKicker: "A SING A SONG MUSIC",
        tag: "MUSIC",
        categoryLabel: "MUSIC & VENUE",
        version: "v1.11",
        platformBadge: "ANDROID + WEB",
        calloutKicker: {
          th: "MUSIC & VENUE · แอป Host Android + เว็บขอเพลงลูกค้า",
          en: "MUSIC & VENUE · ANDROID HOST + CLIENT WEB APP",
        },
        desktopTag: "HOST",
        desktopTitle: "HOST STAGE · ANDROID TABLET",
        desktopImg: "images/apps/asingasong/screen-1-host.png",
        screens: [
          { label: "ADD MUSIC", img: "images/apps/asingasong/screen-2-request.png", pos: "top center" },
          { label: "MUSIC QUEUE", img: "images/apps/asingasong/screen-3-queue.png", pos: "top center" },
          { label: "VOICE & QR", img: "images/apps/asingasong/promo.jpg", pos: "82% 52%" },
        ],
        summary: {
          th: "ระบบขอเพลงผ่าน QR Code ประจำโต๊ะและจัดการคิวเวทีอัจฉริยะ คุมทั้งร้านได้ด้วยมือถือหรือแท็บเล็ต Android เครื่องเดียว ลูกค้าสแกนขอเพลงผ่านเว็บได้ทันทีไม่ต้องลงแอป",
          en: "Smart Table QR music request & stage queue system. Run an entire venue from one Android phone or tablet—guests scan & request via browser with zero app install.",
        },
        specs: {
          th: ["Android Host APK (10.6 MB)", "เว็บลูกค้าไม่ต้องลงแอป", "Local-First SQLite", "Cloudflare Relay", "2 ภาษา TH / EN"],
          en: ["Android Host APK (10.6 MB)", "Zero-Install Web Client", "Local-First SQLite", "Cloudflare Relay", "Bilingual TH / EN"],
        },
        highlights: [
          {
            num: "01",
            title: {
              th: "สแกน QR ขอเพลงผ่านเว็บ (1 โต๊ะหลายเครื่อง)",
              en: "Table QR Web Request (Multi-Device)",
            },
            desc: {
              th: "ลูกค้าสแกน QR ประจำโต๊ะผ่านเบราว์เซอร์ทันที รองรับ Voice Search และคลัง YouTube Music โดยไม่ต้องลงแอป",
              en: "Guests scan table QR codes right in their mobile browser with Voice Search & YouTube Music—no app install.",
            },
          },
          {
            num: "02",
            title: {
              th: "จัดคิวแฟร์ทุกโต๊ะ (Fair Round-Robin)",
              en: "Fair Round-Robin Queue & Live ETA",
            },
            desc: {
              th: "หมุนเวียนคิวเพลงให้ทุกโต๊ะอย่างเท่าเทียม หมดปัญหาโต๊ะดักคิว พร้อมแจ้งเวลารอเรียลไทม์และไม่ลบเพลงเมื่อลูกค้าปิดแท็บ",
              en: "Balances turns across every table to prevent queue hogging, with real-time wait timers and persistent song queue.",
            },
          },
          {
            num: "03",
            title: {
              th: "เวทีเล่นต่อเนื่องไม่สะดุด (Local SQLite)",
              en: "Uninterrupted Playback (Local SQLite)",
            },
            desc: {
              th: "ข้อมูลเก็บในเครื่อง Host 100% เปิดจัดการโต๊ะ เคลียร์คิว หรือตั้งค่าได้โดยเพลงบนเวทีไม่หยุดเล่นแม้แต่วินาทีเดียว",
              en: "100% embedded SQLite on the Host device—manage tables or settings via overlays while stage audio keeps playing.",
            },
          },
          {
            num: "04",
            title: {
              th: "ไม่จำกัดโต๊ะ & แพ็กเกจยืดหยุ่น (VIP 0–3)",
              en: "Unlimited Tables & Flexible VIP (0–3)",
            },
            desc: {
              th: "เปิดใช้ได้ 1–100 โต๊ะทุกแพ็กเกจ เริ่มจากฟรี (2 เครื่อง) ถึง VIP 30–300 เครื่อง พร้อมชำระเงิน PromptPay / บัตรผ่าน Stripe",
              en: "1–100 tables enabled on every tier—from Free (2 devices) to VIP 30–300 active phones via PromptPay & Stripe.",
            },
          },
        ],
        stats: [
          { label: { th: "สถาปัตยกรรม", en: "ARCHITECTURE" }, value: { th: "SQLite + Relay", en: "SQLite + Relay" } },
          { label: { th: "รองรับโต๊ะ", en: "TABLES" }, value: { th: "1–100 โต๊ะ", en: "1–100 Tables" } },
          { label: { th: "แพ็กเกจ", en: "TIERS" }, value: { th: "ฟรี / เริ่ม ฿49", en: "Free / ฿49+" } },
        ],
      },
      {
        id: "move-as-group",
        name: "MoveAsGroup",
        stageKicker: "MOVEASGROUP",
        tag: "CONVOY",
        categoryLabel: "TRAVEL & CONVOY",
        version: "v1.04",
        platformBadge: "FLUTTER NATIVE",
        calloutKicker: {
          th: "TRAVEL & CONVOY · เรดาร์ขบวน 30 กม. & วิทยุสื่อสาร PTT",
          en: "TRAVEL & CONVOY · TACTICAL CONVOY RADAR & PTT",
        },
        desktopTag: "COCKPIT",
        desktopTitle: "LANDSCAPE COCKPIT · 30KM RADAR",
        desktopImg: "images/apps/moveasgroup/screen-cockpit.png",
        screens: [
          { label: "DETOURS", img: "images/apps/moveasgroup/screen-2-detours.png", pos: "top center" },
          { label: "RADAR 30KM", img: "images/apps/moveasgroup/screen-1-radar.png", pos: "top center" },
          { label: "PTT COMMS", img: "images/apps/moveasgroup/screen-3-comms.png", pos: "top center" },
        ],
        summary: {
          th: "แอปเรดาร์ติดตามขบวนรถและวิทยุสื่อสาร PTT สำหรับทริปมอเตอร์ไซค์และรถยนต์เดินทางไกล เก็บข้อมูลในเครื่อง Local-First SQLite 100% ใช้แผนที่ฟรีไม่ต้องใช้ API Key และรองรับโหมดออฟไลน์เต็มรูปแบบ",
          en: "30-km tactical convoy radar & hands-free PTT voice radio for group road trips. 100% Local-First SQLite with zero cloud storage, free OpenStreetMap routing, and full offline auto-sync.",
        },
        specs: {
          th: ["Flutter Native (60–120 FPS)", "Android APK (50.7 MB)", "SQLite v3 · 0% Cloud DB", "แผนที่ OSM / OSRM ฟรี", "Offline Outbox + Delta Sync"],
          en: ["Flutter Native (60–120 FPS)", "Android APK (50.7 MB)", "SQLite v3 · 0% Cloud DB", "Free OSM / OSRM Maps", "Offline Outbox + Delta Sync"],
        },
        highlights: [
          {
            num: "01",
            title: {
              th: "เรดาร์ขบวน 7 ระดับ (500m – 30km)",
              en: "30-KM 7-Ring Proximity Radar",
            },
            desc: {
              th: "แสดงพิกัด ความเร็ว และระยะห่างสมาชิกแบบเรียลไทม์ พร้อมโหมด Cockpit แนวนอนและ Clean Map View ซ่อนแถบ HUD",
              en: "Tracks convoy positions, speed & Haversine distances live with Landscape Cockpit Mode and Touch-to-Wake HUD.",
            },
          },
          {
            num: "02",
            title: {
              th: "วิทยุเสียง PTT & วิเคราะห์ทางเบี่ยง",
              en: "Hands-Free PTT & Detour Impact",
            },
            desc: {
              th: "กดพูดวอสั้นสูงสุด 20 วิ เล่นเสียงออกบลูทูธอัตโนมัติ พร้อมเพิ่มจุดแวะพักและคำนวณระยะ/เวลาเบี่ยง (+กม. / +นาที)",
              en: "20-sec voice clips with auto-play over helmet Bluetooth, plus waypoint timelines showing added +km and +min.",
            },
          },
          {
            num: "03",
            title: {
              th: "ออฟไลน์สมบูรณ์ & ซิงค์สองทางอัตโนมัติ",
              en: "Offline Outbox & Two-Way Delta Sync",
            },
            desc: {
              th: "ตรวจจับสัญญาณ HUD 3 สี เก็บข้อความ/พิกัดลง FIFO Outbox Queue เมื่ออับสัญญาณ และดึงย้อนหลังผ่าน Two-Way Delta Sync",
              en: "Hybrid link HUD queues messages/waypoints offline (FIFO) and auto-flushes + recovers missed items upon reconnect.",
            },
          },
          {
            num: "04",
            title: {
              th: "ส่วนตัว 100% & ฟรีแผนที่ไม่ใช้ API Key",
              en: "Zero-Cloud Privacy & Free Maps",
            },
            desc: {
              th: "เก็บข้อมูลใน SQLite 7 ตารางบนเครื่องตนเองเท่านั้น ไม่เก็บลงคลาวด์ เข้าร่วมกลุ่มด้วย PIN 6 หลัก และใช้แผนที่ OSM/OSRM ฟรี",
              en: "7-table on-device SQLite with ephemeral WebSocket relay, 6-digit group PINs, and 100% free OSM/OSRM routing.",
            },
          },
        ],
        stats: [
          { label: { th: "สถาปัตยกรรม", en: "ARCHITECTURE" }, value: { th: "SQLite · 0% Cloud", en: "SQLite · 0% Cloud" } },
          { label: { th: "รัศมีเรดาร์", en: "RADAR RANGE" }, value: { th: "500m – 30 km", en: "500m – 30 km" } },
          { label: { th: "แผนที่ & ออฟไลน์", en: "MAPS & SYNC" }, value: { th: "OSM ฟรี + Offline", en: "Free OSM + Offline" } },
        ],
      },
    ];

    let activeProject = PROJECTS[0];
    const projectListEl = document.getElementById("productList");
    const listBtns = Array.from(document.querySelectorAll(".project-item"));
    const filterTags = Array.from(document.querySelectorAll(".cyber-tag[data-filter]"));
    const showcaseStageEl = document.getElementById("productShowcaseStage");
    const stageKickerEl = document.getElementById("productStageKicker");
    const activeBadgeEl = document.getElementById("activeProjectBadge");
    const desktopTagEl = document.getElementById("mockDesktopTag");
    const desktopTitleEl = document.getElementById("mockDesktopTitle");
    const desktopImgEl = document.getElementById("mockDesktopImg");
    const phoneLabels = Array.from(document.querySelectorAll(".phone-label"));
    const phoneImages = Array.from(document.querySelectorAll(".phone-screen-img"));
    const calloutKickerEl = document.getElementById("productCalloutKicker");
    const calloutTitleEl = document.getElementById("productCalloutTitle");
    const calloutSubEl = document.getElementById("productCalloutSub");
    const specChipsEl = document.getElementById("productSpecChips");
    const countBadgeEl = document.getElementById("productCountBadge");
    const platformBadgeEl = document.getElementById("productPlatformBadge");
    const highlightsListEl = document.getElementById("productHighlightsList");
    const metaStripEl = document.getElementById("productMetaStrip");

    function renderSpecChips(specs) {
      if (!specChipsEl) return;
      specChipsEl.replaceChildren(
        ...specs.map((text) => {
          const span = document.createElement("span");
          span.className = "product-spec-chip";
          span.textContent = text;
          return span;
        })
      );
    }

    function renderHighlights(highlights) {
      if (!highlightsListEl) return;
      highlightsListEl.replaceChildren(
        ...highlights.map((item) => {
          const li = document.createElement("li");
          li.className = "product-feature-item";

          const num = document.createElement("span");
          num.className = "pf-num";
          num.textContent = item.num;

          const copy = document.createElement("div");
          copy.className = "pf-copy";

          const strong = document.createElement("strong");
          strong.textContent = item.title[currentLang];

          const desc = document.createElement("span");
          desc.textContent = item.desc[currentLang];

          copy.append(strong, desc);
          li.append(num, copy);
          return li;
        })
      );
    }

    function renderMetaStrip(stats) {
      if (!metaStripEl) return;
      metaStripEl.replaceChildren(
        ...stats.map((st) => {
          const box = document.createElement("div");
          box.className = "pm-stat";

          const lbl = document.createElement("span");
          lbl.className = "pm-label";
          lbl.textContent = st.label[currentLang];

          const val = document.createElement("span");
          val.className = "pm-val";
          val.textContent = st.value[currentLang];

          box.append(lbl, val);
          return box;
        })
      );
    }

    function selectProject(proj) {
      activeProject = proj;
      listBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.project === proj.id));
      if (showcaseStageEl) showcaseStageEl.dataset.activeProject = proj.id;
      if (stageKickerEl) stageKickerEl.textContent = proj.stageKicker;
      if (activeBadgeEl) activeBadgeEl.textContent = `${proj.categoryLabel} · ${proj.version}`;
      if (desktopTagEl) desktopTagEl.textContent = proj.desktopTag;
      if (desktopTitleEl) desktopTitleEl.textContent = proj.desktopTitle;
      if (desktopImgEl) {
        desktopImgEl.src = proj.desktopImg;
        desktopImgEl.alt = `${proj.name} — ${proj.desktopTitle}`;
      }
      phoneLabels.forEach((lbl, idx) => {
        if (proj.screens[idx]) lbl.textContent = proj.screens[idx].label;
      });
      phoneImages.forEach((img, idx) => {
        const scr = proj.screens[idx];
        if (!scr) return;
        img.src = scr.img;
        img.alt = `${proj.name} — ${scr.label}`;
        img.style.objectPosition = scr.pos || "top center";
      });
      if (calloutKickerEl) calloutKickerEl.textContent = proj.calloutKicker[currentLang];
      if (calloutTitleEl) calloutTitleEl.textContent = proj.name;
      if (calloutSubEl) calloutSubEl.textContent = proj.summary[currentLang];
      renderSpecChips(proj.specs[currentLang] || proj.specs.th);
      if (platformBadgeEl) platformBadgeEl.textContent = proj.platformBadge;
      renderHighlights(proj.highlights);
      renderMetaStrip(proj.stats);
    }

    listBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const found = PROJECTS.find((p) => p.id === btn.dataset.project);
        if (found) selectProject(found);
      });
    });

    filterTags.forEach((tagBtn) => {
      tagBtn.addEventListener("click", () => {
        const filter = tagBtn.dataset.filter;
        filterTags.forEach((t) => {
          const isMatch = t === tagBtn;
          t.classList.toggle("is-active", isMatch);
          t.setAttribute("aria-pressed", String(isMatch));
        });
        let visibleCount = 0;
        listBtns.forEach((btn) => {
          const match = filter === "ALL" || btn.dataset.tag === filter;
          btn.style.display = match ? "flex" : "none";
          if (match) visibleCount += 1;
        });
        if (countBadgeEl) {
          countBadgeEl.textContent = `${String(visibleCount).padStart(2, "0")} ${visibleCount === 1 ? "APP" : "APPS"}`;
        }
        if (projectListEl) {
          projectListEl.classList.toggle("is-single", visibleCount === 1);
        }
        const activeBtn = listBtns.find((b) => b.dataset.project === activeProject.id);
        if (!activeBtn || activeBtn.style.display === "none") {
          const firstVisible = listBtns.find((b) => b.style.display !== "none");
          if (firstVisible) {
            const found = PROJECTS.find((p) => p.id === firstVisible.dataset.project);
            if (found) selectProject(found);
          }
        }
      });
    });

    langButtons.forEach((lBtn) => {
      lBtn.addEventListener("click", () => {
        selectProject(activeProject);
      });
    });

    selectProject(activeProject);
  }

  // ========================================================================
  // SHARED CATALOG SHOWCASE (Used by Sample Page & Download Page)
  // ========================================================================
  function initCatalogShowcase({ catalog, defaultAppId, overviewPrefix, ctaBtnId, toastFormatter }) {
    const treeViewEl = document.getElementById("appTreeView");
    const productBtns = Array.from(document.querySelectorAll(".tv-product-btn[data-app]"));
    const cascadeStageEl = document.getElementById("cascadeStage");
    const cardsWinEl = document.getElementById("cardsWin");
    const manualWinEl = document.getElementById("manualWin");
    const overviewWinEl = document.getElementById("overviewWin");
    const shuffleCardsBtn = document.getElementById("shuffleCardsBtn");

    const appManualStepsEl = document.getElementById("appManualSteps");
    const appOverviewTagEl = document.getElementById("appOverviewTag");
    const appVersionBadgeEl = document.getElementById("appVersionBadge");
    const appOverviewTitleEl = document.getElementById("appOverviewTitle");
    const appCategoryPillEl = document.getElementById("appCategoryPill");
    const appOverviewDescEl = document.getElementById("appOverviewDesc");
    const appSpecChipsEl = document.getElementById("appSpecChips");
    const previewCardHandEl = document.getElementById("previewCardHand");
    const activeCardLabelEl = document.getElementById("activeCardLabel");
    const promoViewportEl = document.getElementById("promoViewport");
    const promoOsBadgeEl = document.getElementById("promoOsBadge");
    const promoFooterKickerEl = document.getElementById("promoFooterKicker");
    const promoFooterHeadlineEl = document.getElementById("promoFooterHeadline");
    const promoLiveTagEl = document.getElementById("promoLiveTag");
    const appPromoStageEl = document.getElementById("appPromoStage");

    const dlCategoryKickerEl = document.getElementById("dlCategoryKicker");
    const dlCalloutTitleEl = document.getElementById("dlCalloutTitle");
    const dlVersionLabelEl = document.getElementById("dlVersionLabel");
    const dlSizeLabelEl = document.getElementById("dlSizeLabel");
    const dlPlatformLabelEl = document.getElementById("dlPlatformLabel");
    const dlTiersLabelEl = document.getElementById("dlTiersLabel");
    const dlHostLabelEl = document.getElementById("dlHostLabel");
    const ctaBtnEl = document.getElementById(ctaBtnId);

    const screenLightboxEl = document.getElementById("screenLightbox");
    const screenLightboxDialogEl = document.getElementById("screenLightboxDialog");
    const lightboxImgEl = document.getElementById("lightboxImg");
    const lightboxAppNameEl = document.getElementById("lightboxAppName");
    const lightboxTitleEl = document.getElementById("lightboxTitle");
    const lightboxCounterEl = document.getElementById("lightboxCounter");
    const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");
    const lightboxPrevBtn = document.getElementById("lightboxPrevBtn");
    const lightboxNextBtn = document.getElementById("lightboxNextBtn");

    let activeApp = catalog[defaultAppId] || Object.values(catalog)[0];
    if (!activeApp) return;

    let activeScreenIdx = 0;
    let stageFocus = "overview"; // "overview" | "manual" | "cards"
    let shuffleTimer = null;
    let isLightboxOpen = false;
    let lightboxHistoryPushed = false;

    function renderPromoStage() {
      if (!promoViewportEl || !activeApp.promo) return;
      const app = activeApp;

      promoViewportEl.innerHTML = `
        <div class="promo-ad-banner">
          <img class="promo-hero-img" src="${app.promoImage}" alt="${app.name}" />
          <div class="promo-ad-scrim"></div>
          <div class="promo-ad-content">
            <span class="promo-ad-badge">${app.promo.badge}</span>
            <div class="promo-ad-copy">
              <h3>${app.name}</h3>
              <p>${app.promo.sub[currentLang]}</p>
            </div>
          </div>
        </div>
      `;
      if (promoFooterKickerEl) promoFooterKickerEl.textContent = "PROMO SHOWCASE // " + app.version;
      if (promoFooterHeadlineEl) promoFooterHeadlineEl.textContent = app.promo.headline[currentLang];
      if (promoOsBadgeEl) promoOsBadgeEl.textContent = app.os;
      if (promoLiveTagEl) promoLiveTagEl.textContent = app.shortVer;
    }

    function renderManualBox() {
      if (!appManualStepsEl) return;
      appManualStepsEl.innerHTML = activeApp.manual
        .map(
          (st) => `
          <div class="manual-step-item">
            <span class="manual-step-num">STEP ${st.step}</span>
            <strong class="manual-step-title">${st.title[currentLang]}</strong>
            <span class="manual-step-desc">${st.desc[currentLang]}</span>
          </div>`
        )
        .join("");
    }

    function triggerCardShuffle() {
      if (!previewCardHandEl) return;
      previewCardHandEl.classList.remove("is-shuffling");
      void previewCardHandEl.offsetWidth;
      previewCardHandEl.classList.add("is-shuffling");
      clearTimeout(shuffleTimer);
      shuffleTimer = setTimeout(() => {
        previewCardHandEl.classList.remove("is-shuffling");
      }, 680);
    }

    function setStageFocus(nextFocus, shouldShuffle = false) {
      stageFocus = nextFocus;
      if (cascadeStageEl) {
        cascadeStageEl.classList.toggle("is-cards-focused", nextFocus === "cards");
        cascadeStageEl.classList.toggle("is-manual-focused", nextFocus === "manual");
      }
      if (cardsWinEl) cardsWinEl.classList.toggle("is-focused", nextFocus === "cards");
      if (manualWinEl) manualWinEl.classList.toggle("is-focused", nextFocus === "manual");
      if (overviewWinEl) overviewWinEl.classList.toggle("is-focused", nextFocus === "overview");
      if (nextFocus === "cards" && shouldShuffle) {
        triggerCardShuffle();
      }
    }

    function resetLightboxTransform() {
      if (!screenLightboxDialogEl) return;
      screenLightboxDialogEl.classList.remove("is-dragging");
      screenLightboxDialogEl.style.transform = "";
      screenLightboxDialogEl.style.opacity = "";
    }

    function updateScreenLightbox() {
      const screens = activeApp.screens || [];
      if (!screens.length) return;
      const safeIdx = ((activeScreenIdx % screens.length) + screens.length) % screens.length;
      activeScreenIdx = safeIdx;
      const scr = screens[safeIdx];
      if (lightboxImgEl) {
        lightboxImgEl.src = scr.img;
        lightboxImgEl.alt = `${activeApp.name} - ${scr.title}`;
      }
      if (lightboxAppNameEl) lightboxAppNameEl.textContent = activeApp.name;
      if (lightboxTitleEl) lightboxTitleEl.textContent = scr.title;
      if (lightboxCounterEl) lightboxCounterEl.textContent = `${safeIdx + 1} / ${screens.length}`;
    }

    function openScreenLightbox(idx) {
      if (!screenLightboxEl) return;
      if (typeof idx === "number") activeScreenIdx = idx;
      updateScreenLightbox();
      resetLightboxTransform();

      if (!isLightboxOpen) {
        isLightboxOpen = true;
        screenLightboxEl.classList.add("is-open");
        screenLightboxEl.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        try {
          if (!window.history.state || !window.history.state.bfScreenLightbox) {
            window.history.pushState({ bfScreenLightbox: true }, "", window.location.href);
          }
          lightboxHistoryPushed = true;
        } catch {
          lightboxHistoryPushed = false;
        }
        if (lightboxCloseBtn) {
          lightboxCloseBtn.focus({ preventScroll: true });
        }
      }
    }

    function closeScreenLightbox({ fromPopstate = false } = {}) {
      if (!isLightboxOpen) return;
      isLightboxOpen = false;
      if (screenLightboxEl) {
        screenLightboxEl.classList.remove("is-open");
        screenLightboxEl.setAttribute("aria-hidden", "true");
      }
      resetLightboxTransform();
      document.body.style.overflow = "";

      if (!fromPopstate && lightboxHistoryPushed) {
        lightboxHistoryPushed = false;
        try {
          window.history.back();
        } catch {}
      }
    }

    function stepScreenLightbox(delta) {
      const screens = activeApp.screens || [];
      if (!screens.length) return;
      activeScreenIdx = (activeScreenIdx + delta + screens.length) % screens.length;
      renderPreviewCardHand();
      updateScreenLightbox();
    }

    function renderPreviewCardHand() {
      if (!previewCardHandEl) return;
      const app = activeApp;
      previewCardHandEl.innerHTML = app.screens
        .map(
          (scr, idx) => `
          <button type="button" class="preview-card${idx === activeScreenIdx ? " is-selected" : ""}" data-screen-idx="${idx}" title="${scr.title}">
            <div class="pc-corner">
              <span>${scr.sym}</span>
            </div>
            <div class="pc-screen">
              <img class="pc-screen-img" src="${scr.img}" alt="${app.name} - ${scr.title}" loading="lazy" />
            </div>
            <div class="pc-title">${scr.title}</div>
          </button>`
        )
        .join("");

      const activeScr = app.screens[activeScreenIdx] || app.screens[0];
      if (activeCardLabelEl && activeScr) {
        activeCardLabelEl.textContent = activeScr.title.toUpperCase();
      }

      previewCardHandEl.querySelectorAll(".preview-card").forEach((cardBtn) => {
        cardBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const clickedIdx = Number(cardBtn.dataset.screenIdx) || 0;
          const enteringFocus = stageFocus !== "cards";
          activeScreenIdx = clickedIdx;
          if (enteringFocus) {
            setStageFocus("cards", true);
          }
          renderPreviewCardHand();
          openScreenLightbox(clickedIdx);
        });
      });
    }

    function renderSelectedApp(app) {
      activeApp = app;

      // Tree active state
      productBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.app === app.id));

      // Frame 1 (Top): 5-Card Preview Deck
      renderPreviewCardHand();

      // Frame 2 (Middle): App Manual / Demo Quick Guide
      renderManualBox();

      // Frame 3 (Bottom/Front): App Content / Overview
      if (appOverviewTagEl) appOverviewTagEl.textContent = `${overviewPrefix} // ${app.name.toUpperCase()}`;
      if (appVersionBadgeEl && app.version) appVersionBadgeEl.textContent = app.version;
      if (appOverviewTitleEl) appOverviewTitleEl.textContent = app.name;
      if (appCategoryPillEl) appCategoryPillEl.textContent = app.categoryPill;
      if (appOverviewDescEl) appOverviewDescEl.textContent = app.desc[currentLang];
      if (appSpecChipsEl) {
        const specsList = app.specs[currentLang] || app.specs.th;
        appSpecChipsEl.innerHTML = specsList
          .map((s) => `<span class="app-spec-chip">${s}</span>`)
          .join("");
      }

      // Middle Column: Promotional Showcase (only rendered if promo viewport exists)
      renderPromoStage();

      // Bottom HUD Bar & Direct External Action Link
      if (dlCategoryKickerEl) dlCategoryKickerEl.textContent = app.categoryPath;
      if (dlCalloutTitleEl) dlCalloutTitleEl.textContent = app.name;
      if (dlVersionLabelEl && app.version) dlVersionLabelEl.textContent = app.version;
      if (dlSizeLabelEl && app.size) dlSizeLabelEl.textContent = app.size;
      if (dlPlatformLabelEl && app.platform) dlPlatformLabelEl.textContent = app.platform;
      if (dlTiersLabelEl && app.tiers) dlTiersLabelEl.textContent = app.tiers;
      if (dlHostLabelEl && app.host) dlHostLabelEl.textContent = app.host;

      if (ctaBtnEl) {
        ctaBtnEl.href = app.actionUrl || app.demoUrl || app.downloadUrl || "#";
      }

      if (isLightboxOpen) {
        updateScreenLightbox();
      }
    }

    // Center 3-Box Focus & Card Shuffle Interactions
    if (cardsWinEl) {
      cardsWinEl.addEventListener("click", () => {
        if (stageFocus !== "cards") {
          setStageFocus("cards", true);
        }
      });
    }
    if (manualWinEl) {
      manualWinEl.addEventListener("click", () => {
        if (stageFocus !== "manual") {
          setStageFocus("manual");
        }
      });
    }
    if (overviewWinEl) {
      overviewWinEl.addEventListener("click", () => {
        if (stageFocus !== "overview") {
          setStageFocus("overview");
        }
      });
    }
    if (shuffleCardsBtn) {
      shuffleCardsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        activeScreenIdx = (activeScreenIdx + 1) % activeApp.screens.length;
        renderPreviewCardHand();
        triggerCardShuffle();
      });
    }

    // Hierarchical Tree Expand/Collapse Toggles
    if (treeViewEl) {
      treeViewEl.querySelectorAll(".tv-folder-row").forEach((folderRow) => {
        const branch = folderRow.closest(".tv-branch");
        const toggleBtn = folderRow.querySelector(".tv-toggle");
        const folderBtn = folderRow.querySelector(".tv-folder-btn");

        const toggleBranch = () => {
          if (!branch) return;
          const nextOpen = !branch.classList.contains("is-open");
          branch.classList.toggle("is-open", nextOpen);
          branch.setAttribute("aria-expanded", String(nextOpen));
          if (toggleBtn) toggleBtn.textContent = nextOpen ? "−" : "+";
        };

        if (toggleBtn) toggleBtn.addEventListener("click", toggleBranch);
        if (folderBtn) folderBtn.addEventListener("click", toggleBranch);
      });
    }

    // Product Leaf Selection
    productBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const found = catalog[btn.dataset.app];
        if (!found) return;
        if (isLightboxOpen) {
          closeScreenLightbox();
        }
        activeScreenIdx = 0;
        renderSelectedApp(found);
        if (stageFocus === "cards") {
          triggerCardShuffle();
        }
      });
    });

    // Centered Lightbox Close, Prev/Next, Keyboard, Back Button & Mobile Slide-to-Close
    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener("click", () => closeScreenLightbox());
    }
    if (lightboxPrevBtn) {
      lightboxPrevBtn.addEventListener("click", () => stepScreenLightbox(-1));
    }
    if (lightboxNextBtn) {
      lightboxNextBtn.addEventListener("click", () => stepScreenLightbox(1));
    }
    if (screenLightboxEl) {
      screenLightboxEl.addEventListener("click", (e) => {
        if (e.target === screenLightboxEl) {
          closeScreenLightbox();
        }
      });
    }
    window.addEventListener("keydown", (e) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") {
        closeScreenLightbox();
      } else if (e.key === "ArrowLeft") {
        stepScreenLightbox(-1);
      } else if (e.key === "ArrowRight") {
        stepScreenLightbox(1);
      }
    });
    window.addEventListener("popstate", () => {
      if (isLightboxOpen) {
        lightboxHistoryPushed = false;
        closeScreenLightbox({ fromPopstate: true });
      }
    });

    if (screenLightboxDialogEl) {
      let dragActive = false;
      let dragMoved = false;
      let activePointerId = null;
      let startX = 0;
      let startY = 0;
      let lastDx = 0;
      let lastDy = 0;

      screenLightboxDialogEl.addEventListener("pointerdown", (e) => {
        if (!isLightboxOpen || dragActive) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (e.target && e.target.closest("button")) return;
        activePointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        lastDx = 0;
        lastDy = 0;
        dragActive = true;
        dragMoved = false;
      });

      window.addEventListener("pointermove", (e) => {
        if (!dragActive || e.pointerId !== activePointerId) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragMoved) {
          if (Math.hypot(dx, dy) < 6) return;
          dragMoved = true;
          screenLightboxDialogEl.classList.add("is-dragging");
        }
        lastDx = dx;
        lastDy = dy;
        screenLightboxDialogEl.style.transform = `translate3d(${lastDx}px, ${lastDy}px, 0)`;
        screenLightboxDialogEl.style.opacity = String(
          Math.max(0.35, 1 - Math.hypot(lastDx, lastDy) / 280)
        );
      });

      screenLightboxDialogEl.addEventListener(
        "touchmove",
        (e) => {
          if (dragActive) {
            e.preventDefault();
          }
        },
        { passive: false }
      );

      const finishPointerDrag = (e) => {
        if (!dragActive || e.pointerId !== activePointerId) return;
        const shouldClose =
          isLightboxOpen && dragMoved && (Math.abs(lastDy) > 70 || Math.abs(lastDx) > 95);
        dragActive = false;
        dragMoved = false;
        activePointerId = null;
        if (shouldClose) {
          closeScreenLightbox();
        } else {
          resetLightboxTransform();
        }
      };

      window.addEventListener("pointerup", finishPointerDrag);
      window.addEventListener("pointercancel", finishPointerDrag);
    }

    // Sync dynamic app text when TH/EN language changes
    langButtons.forEach((lBtn) => {
      lBtn.addEventListener("click", () => {
        renderSelectedApp(activeApp);
      });
    });

    // Visual pulse & toast feedback when opening CTA link
    if (ctaBtnEl) {
      ctaBtnEl.addEventListener("click", () => {
        if (appPromoStageEl) appPromoStageEl.classList.add("is-downloading");
        if (typeof toastFormatter === "function") {
          showToast(toastFormatter(activeApp, currentLang));
        }
        setTimeout(() => {
          if (appPromoStageEl) appPromoStageEl.classList.remove("is-downloading");
        }, 900);
      });
    }

    // Initial render
    setStageFocus("overview");
    renderSelectedApp(activeApp);
  }

  // ========================================================================
  // PAGE 03: SAMPLE (Interactive Live Demo Showcase — iLotto)
  // ========================================================================
  if (pageKey === "sample") {
    const SAMPLE_CATALOG = {
      ilotto: {
        id: "ilotto",
        name: "iLotto",
        actionUrl: "https://ilotto.neoitti.workers.dev",
        demoUrl: "https://ilotto.neoitti.workers.dev",
        version: "v1.0",
        platform: "WEB APP (PWA)",
        tiers: "CLIENT · HOST · CENTER",
        host: "CLOUDFLARE WORKERS",
        categoryPath: "FINTECH & WEB APP // LIVE DEMO",
        categoryPill: "FINTECH · 3-TIER",
        desc: {
          th: "แพลตฟอร์มสลากดิจิทัล (หวยไทย–ลาว) และระบบร่วมลงทุน 3 ระดับ (Client · Host · Center) แยกกระเป๋าเงินฝาก–เงินรางวัลเด็ดขาด มีเงินค้ำประกัน Center 100% พร้อมคุมความเสี่ยงเรียลไทม์และโอนจ่ายรางวัลอัตโนมัติ 1-Click",
          en: "3-tier digital lottery (TH/LA) & co-investment FinTech platform (Client · Host · Center) with segregated Deposit/Prize wallets, 100% Center collateral guarantee, real-time Risk Guard & 1-Click Auto-Payout.",
        },
        specs: {
          th: ["3 บทบาท Client·Host·Center", "หวยไทย TH · หวยลาว LA", "แยก 2 กระเป๋า · ค้ำ 100%", "2 ภาษา TH / EN"],
          en: ["3-Tier Client·Host·Center", "Thai TH · Lao LA", "Dual Wallet · 100% Escrow", "Bilingual TH / EN"],
        },
        manual: [
          {
            step: "01",
            title: { th: "กดทดลอง & สลับบทบาท", en: "Launch & Switch Roles" },
            desc: {
              th: 'กดปุ่ม "ทดลอง" เปิดเว็บ iLotto แล้วสลับมุมมองได้ครบ 3 บทบาท (Client / Host / Center)',
              en: 'Click "Try Demo" to open iLotto and switch seamlessly across Client, Host & Center',
            },
          },
          {
            step: "02",
            title: { th: "แทงหวย & จัดการกระเป๋า", en: "Test Betting & Wallets" },
            desc: {
              th: "ลองเลือก Host ค้ำประกัน 100% ใช้แป้น Fast Keypad 3x4 แทงหวยไทย–ลาว และทดสอบเติม–ถอน",
              en: "Pick a 100%-backed Host, try the 3x4 Fast Keypad for TH/LA draws & test wallets",
            },
          },
          {
            step: "03",
            title: { th: "ดูกราฟปันผล & คอนโซลกลาง", en: "Explore ROI & Center" },
            desc: {
              th: "สำรวจกราฟผลตอบแทน 3 เส้น, หลอดคุมความเสี่ยง Host และการกดโอนจ่าย 1-Click ของ Center",
              en: "Inspect 3-line ROI charts, real-time Host Risk Meter & Center 1-Click Auto-Payout",
            },
          },
        ],
        screens: [
          { sym: "◆", title: "Deposit Wallet", img: "images/apps/ilotto/screen-1-deposit.png" },
          { sym: "▲", title: "Prize Withdraw", img: "images/apps/ilotto/screen-2-withdraw.png" },
          { sym: "✦", title: "Host Investment", img: "images/apps/ilotto/screen-3-invest.png" },
          { sym: "●", title: "Host Dashboard", img: "images/apps/ilotto/screen-4-host.png" },
          { sym: "★", title: "Center Console", img: "images/apps/ilotto/screen-5-center.png" },
        ],
      },
    };

    initCatalogShowcase({
      catalog: SAMPLE_CATALOG,
      defaultAppId: "ilotto",
      overviewPrefix: "WEB APP",
      ctaBtnId: "tryDemoBtn",
      toastFormatter: (app, lang) =>
        lang === "th" ? `กำลังเปิดตัวอย่างระบบ ${app.name}` : `Opening live demo for ${app.name}`,
    });
  }

  // ========================================================================
  // PAGE 04: DOWNLOAD (Tree View, 5-Card Deck + Shuffle, Manual, Overview, Promo)
  // ========================================================================
  if (pageKey === "download") {
    const APPS_CATALOG = {
      "asing-asong": {
        id: "asing-asong",
        name: "A Sing A Song Music",
        file: "AsingAsongHost-v1.11.apk",
        downloadUrl: "https://drive.google.com/file/d/1y62Hqb-I5n_cTTv3Y3mLRnDIhx5r_QL_/view?usp=drive_link",
        size: "10.6 MB",
        version: "v1.11",
        shortVer: "v1.11",
        os: "ANDROID APK",
        categoryPath: "MUSIC & VENUE // ANDROID APK",
        categoryPill: "MUSIC REQUEST",
        promoImage: "images/apps/asingasong/promo.jpg",
        desc: {
          th: "แอปคุมคิวเพลงประจำร้าน (Host) ลูกค้าสแกน QR โต๊ะขอเพลงผ่านเว็บได้ทันที ไม่ต้องลงแอป คิวแฟร์ทุกโต๊ะ เพลงเล่นต่อเนื่องไม่มีสะดุด",
          en: "Venue Host app for digital music requests. Guests scan table QR codes via browser—fair round-robin queue & uninterrupted playback.",
        },
        specs: {
          th: ["Android APK", "10.6 MB", "2 ภาษา TH / EN"],
          en: ["Android APK", "10.6 MB", "Bilingual TH / EN"],
        },
        manual: [
          {
            step: "01",
            title: { th: "ดาวน์โหลด APK", en: "Download APK" },
            desc: {
              th: "กดปุ่มดาวน์โหลดเพื่อรับไฟล์จาก Google Drive",
              en: "Click Download to get the APK from Google Drive",
            },
          },
          {
            step: "02",
            title: { th: "ติดตั้งบนเครื่องร้าน", en: "Install on Host" },
            desc: {
              th: 'เปิดไฟล์ APK แล้วเลือก "อนุญาตจากแหล่งนี้"',
              en: 'Open APK & enable "Allow from this source"',
            },
          },
          {
            step: "03",
            title: { th: "ตั้งชื่อร้าน & แชร์ QR", en: "Set Shop & QR" },
            desc: {
              th: "เปิดแอป สร้าง QR ประจำโต๊ะให้ลูกค้าสแกนขอเพลง",
              en: "Name your venue & print table QR codes",
            },
          },
        ],
        screens: [
          { sym: "◆", title: "Host Stage", img: "images/apps/asingasong/screen-1-host.png" },
          { sym: "▲", title: "Add Music", img: "images/apps/asingasong/screen-2-request.png" },
          { sym: "✦", title: "Music Queue", img: "images/apps/asingasong/screen-3-queue.png" },
          { sym: "●", title: "Table QR", img: "images/apps/asingasong/screen-4-qr.jpg" },
          { sym: "★", title: "Live Venue", img: "images/apps/asingasong/screen-5-venue.jpg" },
        ],
        promo: {
          badge: "MUSIC HOST · v1.11",
          headline: {
            th: "ระบบขอเพลงผ่าน QR ประจำโต๊ะ",
            en: "Smart Table QR Music Queue",
          },
          sub: {
            th: "คุมคิวเพลงทั้งร้านผ่านมือถือหรือแท็บเล็ต Android เครื่องเดียว",
            en: "Control your venue's music queue from a single Android device.",
          },
        },
      },
      "move-as-group": {
        id: "move-as-group",
        name: "MoveAsGroup",
        file: "MoveAsGroup_v1.04.apk",
        downloadUrl: "https://drive.google.com/file/d/1FGQvIYJ0aTOZZ9YD5uJBtgaES0Eb2WXP/view?usp=drive_link",
        size: "50.7 MB",
        version: "v1.04",
        shortVer: "v1.04",
        os: "ANDROID APK",
        categoryPath: "TRAVEL & CONVOY // ANDROID APK",
        categoryPill: "CONVOY RADAR",
        promoImage: "images/apps/moveasgroup/promo.jpg",
        desc: {
          th: "แอปเรดาร์ติดตามขบวนรถรัศมี 30 กม. พร้อมวิทยุสื่อสารเสียง PTT และแจ้งจุดแวะพัก ใช้งานฟรี 100% รองรับโหมดออฟไลน์",
          en: "30-km tactical convoy radar & hands-free PTT voice radio for road trips. 100% free maps with offline queue & auto-sync.",
        },
        specs: {
          th: ["Android APK", "50.7 MB", "ฟรี 100% · Offline Ready"],
          en: ["Android APK", "50.7 MB", "100% Free · Offline Ready"],
        },
        manual: [
          {
            step: "01",
            title: { th: "ดาวน์โหลด & ติดตั้ง", en: "Download & Install" },
            desc: {
              th: 'โหลด APK แล้วเลือก "อนุญาตจากแหล่งนี้"',
              en: 'Get APK & allow install from this source',
            },
          },
          {
            step: "02",
            title: { th: "อนุญาต GPS ตลอดเวลา", en: "Allow Always GPS" },
            desc: {
              th: 'ตั้งสิทธิ์ตำแหน่ง "อนุญาตตลอดเวลา" ให้เรดาร์แม่นยำ',
              en: 'Set Location to "Allow all the time"',
            },
          },
          {
            step: "03",
            title: { th: "สร้างหรือเข้ากลุ่ม", en: "Join with 6-Digit PIN" },
            desc: {
              th: "ใช้รหัส PIN 6 หลักเชื่อมต่อขบวนและพูดวิทยุ PTT",
              en: "Create a trip or join convoy via PIN",
            },
          },
        ],
        screens: [
          { sym: "◆", title: "Radar 30km", img: "images/apps/moveasgroup/screen-1-radar.png" },
          { sym: "▲", title: "Detours", img: "images/apps/moveasgroup/screen-2-detours.png" },
          { sym: "✦", title: "PTT Radio", img: "images/apps/moveasgroup/screen-3-comms.png" },
          { sym: "●", title: "Convoy", img: "images/apps/moveasgroup/screen-4-group.png" },
          { sym: "★", title: "Trip Report", img: "images/apps/moveasgroup/screen-5-report.png" },
        ],
        promo: {
          badge: "CONVOY RADAR · v1.04",
          headline: {
            th: "เรดาร์ขบวน 30 กม. + วิทยุ PTT",
            en: "30-KM Convoy Radar & PTT",
          },
          sub: {
            th: "เดินทางเป็นกลุ่มไม่มีหลุดขบวน แจ้งจุดแวะพักและพูดวอได้ทันที",
            en: "Keep your whole convoy connected with live radar, detours & voice.",
          },
        },
      },
    };

    initCatalogShowcase({
      catalog: APPS_CATALOG,
      defaultAppId: "asing-asong",
      overviewPrefix: "APP",
      ctaBtnId: "getAssetsBtn",
      toastFormatter: (app, lang) =>
        lang === "th"
          ? `กำลังเปิด Google Drive สำหรับดาวน์โหลด ${app.name}`
          : `Opening Google Drive download for ${app.name}`,
    });
  }
})();
