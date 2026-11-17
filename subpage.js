(() => {
  if (window.BigFatherTunnel) {
    window.BigFatherTunnel.startStandaloneLoop();
  }

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
  }

  // ========================================================================
  // PAGE 02: PRODUCT
  // ========================================================================
  if (pageKey === "product") {
    const PROJECTS = [
      {
        id: "cyber-deck",
        name: "Futuristic Project",
        tag: "UI/UX",
        version: "v3.2",
        desktopTitle: "DECK ENGINE",
        screens: ["CARD HAND", "HUD CORE", "TUNNEL FX"],
        summary: {
          th: "ระบบเมนูการ์ดไพ่ 3 มิติพร้อมแอนิเมชัน Scroll-Driven และฟอยล์โฮโลแกรมความลื่นไหล 60fps",
          en: "Scroll-driven 3D playing-card navigation deck with holographic foil and 60fps tunnel FX.",
        },
      },
      {
        id: "spatial-ui",
        name: "3D Futuristic UI",
        tag: "3D",
        version: "v2.8",
        desktopTitle: "SPATIAL HUD",
        screens: ["MESH VIEW", "LAYER 3D", "CALIBRATE"],
        summary: {
          th: "ชุดอินเทอร์เฟซมิติเชิงลึกพร้อมขอบแสงสีทองและระบบจัดวางแบบโมดูลาร์",
          en: "Modular spatial interface kit featuring golden rim lighting and perspective glass panels.",
        },
      },
      {
        id: "holo-mockup",
        name: "Futuristic Mockup",
        tag: "UI/UX",
        version: "v2.4",
        desktopTitle: "DEVICE STUDIO",
        screens: ["MOBILE UI", "GRID OS", "TOKENS"],
        summary: {
          th: "ชุดต้นแบบ Multi-Device สำหรับพรีเซนต์งานแอปพลิเคชันทั้ง Desktop และ Mobile",
          en: "Multi-device showcase templates built for responsive web and mobile product presentations.",
        },
      },
      {
        id: "proto-core",
        name: "Futuristic Prototype",
        tag: "SYSTEM",
        version: "v4.0",
        desktopTitle: "SYSTEM CORE",
        screens: ["TELEMETRY", "API BUS", "DEPLOY"],
        summary: {
          th: "โครงสร้างต้นแบบระบบเรียลไทม์ที่เชื่อมต่อข้อมูล Telemetry และระบบทดสอบอัตโนมัติ",
          en: "Real-time prototype architecture integrating live telemetry pipelines and automated QA.",
        },
      },
    ];

    let activeProject = PROJECTS[0];
    const listBtns = Array.from(document.querySelectorAll(".project-item"));
    const filterTags = Array.from(document.querySelectorAll(".cyber-tag[data-filter]"));
    const showcaseStageEl = document.getElementById("productShowcaseStage");
    const desktopTitleEl = document.getElementById("mockDesktopTitle");
    const phoneLabels = Array.from(document.querySelectorAll(".phone-label"));
    const activeBadgeEl = document.getElementById("activeProjectBadge");

    function selectProject(proj) {
      activeProject = proj;
      listBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.project === proj.id));
      if (showcaseStageEl) showcaseStageEl.dataset.activeProject = proj.id;
      if (desktopTitleEl) desktopTitleEl.textContent = proj.desktopTitle;
      if (activeBadgeEl) activeBadgeEl.textContent = `${proj.tag} · ${proj.version}`;
      phoneLabels.forEach((lbl, idx) => {
        if (proj.screens[idx]) lbl.textContent = proj.screens[idx];
      });
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
        listBtns.forEach((btn) => {
          const match = filter === "ALL" || btn.dataset.tag === filter;
          btn.style.display = match ? "flex" : "none";
        });
        const firstVisible = listBtns.find((b) => b.style.display !== "none");
        if (firstVisible) {
          const found = PROJECTS.find((p) => p.id === firstVisible.dataset.project);
          if (found) selectProject(found);
        }
      });
    });
  }

  // ========================================================================
  // PAGE 03: SAMPLE (Binary Matrix, Exploded 3D Calibration Cube, Wireframe & Telemetry)
  // ========================================================================
  if (pageKey === "sample") {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cubeCanvas = document.getElementById("cubeCoreCanvas");
    const wireCanvas = document.getElementById("wireCubeCanvas");
    const coreCardEl = document.getElementById("calibrationCore");
    const gaugeEl = document.getElementById("telemetryGauge");
    const gaugeArcEl = document.getElementById("telemetryArc");
    const gaugeValEl = document.getElementById("telemetryPct");
    const gaugeStateEl = document.getElementById("telemetryState");
    const segCols = Array.from(document.querySelectorAll("#telemetrySegEq .seg-col"));
    const hBarFills = Array.from(document.querySelectorAll(".h-bar-fill"));
    const specBars = Array.from(document.querySelectorAll("#telemetrySpectrum span"));
    const consoleBtns = Array.from(document.querySelectorAll(".console-btn[data-console-cmd]"));
    const testNowBtn = document.getElementById("testNowBtn");

    let activeMode = "PLAY";
    let boostEnergy = 0;
    let scanSweep = -1;

    function syncCanvasSize(canvas, fallbackW, fallbackH) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || fallbackW;
      const h = canvas.clientHeight || fallbackH;
      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, w, h };
    }

    // ----------------------------------------------------------------------
    // 1. Center Stage: 3D Exploded Mechanical Calibration Cube + Optical Lenses
    // ----------------------------------------------------------------------
    let dragRotX = 0;
    let dragRotY = 0;
    let isDragging = false;
    let lastPtrX = 0;
    let lastPtrY = 0;

    if (cubeCanvas) {
      cubeCanvas.addEventListener("pointerdown", (e) => {
        isDragging = true;
        lastPtrX = e.clientX;
        lastPtrY = e.clientY;
        cubeCanvas.setPointerCapture(e.pointerId);
      });
      cubeCanvas.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPtrX;
        const dy = e.clientY - lastPtrY;
        lastPtrX = e.clientX;
        lastPtrY = e.clientY;
        dragRotY += dx * 0.008;
        dragRotX = Math.max(-0.9, Math.min(0.9, dragRotX + dy * 0.008));
      });
      const stopDrag = () => { isDragging = false; };
      cubeCanvas.addEventListener("pointerup", stopDrag);
      cubeCanvas.addEventListener("pointercancel", stopDrag);
    }

    const cubeVerts = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
    ];
    const cubeFaces = [
      { idx: [0, 1, 2, 3], n: [0, 0, -1] },
      { idx: [4, 5, 6, 7], n: [0, 0, 1] },
      { idx: [0, 4, 7, 3], n: [-1, 0, 0] },
      { idx: [1, 5, 6, 2], n: [1, 0, 0] },
      { idx: [3, 2, 6, 7], n: [0, 1, 0] },
      { idx: [0, 1, 5, 4], n: [0, -1, 0] },
    ];
    const lensAxes = [
      { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1], rings: [1.55, 2.02, 2.52, 2.98] },
      { n: [0, 1, 0],  u: [1, 0, 0], v: [0, 0, 1], rings: [1.55, 2.02, 2.52, 2.98] },
      { n: [-1, 0, 0], u: [0, 1, 0], v: [0, 0, 1], rings: [1.55, 2.05, 2.58] },
      { n: [1, 0, 0],  u: [0, 1, 0], v: [0, 0, 1], rings: [1.55, 2.05, 2.58] },
    ];
    const motes = Array.from({ length: 24 }, (_, i) => ({
      angle: (i / 24) * Math.PI * 2,
      dist: 0.22 + (i % 5) * 0.14,
      speed: 0.4 + (i % 4) * 0.25,
      size: 1 + (i % 3) * 0.7,
    }));

    function rotVec([x, y, z], rx, ry) {
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      return [x1, y2, z2];
    }

    function projVec([x, y, z], cx, cy, scale) {
      const p = scale / (6.4 + z);
      return [cx + x * p, cy + y * p, z, p];
    }

    function drawCalibrationCore(timeSec) {
      if (!cubeCanvas) return;
      const { ctx, w, h } = syncCanvasSize(cubeCanvas, 420, 410);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.48;
      const baseScale = Math.min(w, h) * 0.9;

      // Dark architectural test chamber backdrop
      const chamberBg = ctx.createRadialGradient(cx, cy, 18, cx, cy, Math.max(w, h) * 0.65);
      chamberBg.addColorStop(0, `rgba(42, 46, 58, ${0.42 + boostEnergy * 0.2})`);
      chamberBg.addColorStop(0.45, "rgba(16, 19, 27, 0.78)");
      chamberBg.addColorStop(1, "rgba(7, 9, 14, 0.96)");
      ctx.fillStyle = chamberBg;
      ctx.fillRect(0, 0, w, h);

      // Subtle architectural vertical chamber pillars
      ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
      ctx.lineWidth = 1;
      for (const px of [0.14, 0.26, 0.74, 0.86]) {
        ctx.beginPath();
        ctx.moveTo(w * px, 0);
        ctx.lineTo(w * px, h);
        ctx.stroke();
      }

      // Warm golden core aura behind the cube
      const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, baseScale * 0.56);
      aura.addColorStop(0, `rgba(254, 240, 138, ${0.34 + boostEnergy * 0.28})`);
      aura.addColorStop(0.35, `rgba(250, 204, 21, ${0.14 + boostEnergy * 0.14})`);
      aura.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, w, h);

      const rx = 0.5 + Math.sin(timeSec * 0.55) * 0.04 + dragRotX;
      const ry = 0.74 + (activeMode === "TEST" ? timeSec * 0.35 : Math.sin(timeSec * 0.4) * 0.12) + dragRotY + boostEnergy * 0.9;
      const explodeFactor = activeMode === "INSTALL"
        ? 0.86 + Math.sin(timeSec * 3.2) * 0.04
        : 1 + Math.sin(timeSec * 1.4) * 0.03 + boostEnergy * 0.1;

      // Radiating Golden Laser Beams aligned directly along the 6 face/lens axes
      const beamDirs = [
        [0, -1, 0], [0, 1, 0],
        [-1, 0, 0], [1, 0, 0],
        [0, 0, -1], [0, 0, 1],
      ];
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      beamDirs.forEach((dir) => {
        const rd = rotVec(dir, rx, ry);
        const end = projVec([rd[0] * 5.2, rd[1] * 5.2, rd[2] * 5.2], cx, cy, baseScale);
        const beamGrad = ctx.createLinearGradient(cx, cy, end[0], end[1]);
        beamGrad.addColorStop(0, `rgba(254, 249, 195, ${0.9 + boostEnergy * 0.1})`);
        beamGrad.addColorStop(0.38, `rgba(250, 204, 21, ${0.65 + boostEnergy * 0.2})`);
        beamGrad.addColorStop(1, "rgba(250, 204, 21, 0)");

        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 4.2 + boostEnergy * 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(end[0], end[1]);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 251, 235, ${0.88 + boostEnergy * 0.12})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(end[0], end[1]);
        ctx.stroke();
      });
      ctx.restore();

      // Build depth-sorted draw queue (cube faces + exploded optical lens discs)
      const drawItems = [];
      const rotatedVerts = cubeVerts.map((v) => rotVec(v, rx, ry));

      cubeFaces.forEach((face) => {
        const rn = rotVec(face.n, rx, ry);
        const pts = face.idx.map((i) => projVec(rotatedVerts[i], cx, cy, baseScale));
        const avgZ = pts.reduce((sum, p) => sum + p[2], 0) / 4;
        drawItems.push({ kind: "face", z: avgZ, pts, rn, faceIdx: face.idx });
      });

      lensAxes.forEach((axis) => {
        const rn = rotVec(axis.n, rx, ry);
        const ru = rotVec(axis.u, rx, ry);
        const rv = rotVec(axis.v, rx, ry);
        axis.rings.forEach((dist, rIdx) => {
          const d = dist * explodeFactor;
          const center3 = [rn[0] * d, rn[1] * d, rn[2] * d];
          const center2 = projVec(center3, cx, cy, baseScale);
          const radius = Math.max(0.38, 0.8 - rIdx * 0.12);
          drawItems.push({
            kind: "lens",
            z: center3[2],
            center3,
            center2,
            ru,
            rv,
            radius,
            rIdx,
          });
        });
      });

      // Back-to-front painter sort (larger z = farther away)
      drawItems.sort((a, b) => b.z - a.z);

      drawItems.forEach((item) => {
        if (item.kind === "face") {
          const { pts, rn } = item;
          if (rn[2] > 0.12) return;

          const light = Math.max(0.15, Math.min(1, 0.48 - rn[1] * 0.42 - rn[0] * 0.25));
          const shade = Math.round(28 + light * 48);

          // Outer dark metallic face plate
          ctx.beginPath();
          pts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
          ctx.closePath();
          ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 12})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(235, 242, 250, ${0.46 + light * 0.4})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Recessed inner mechanical plate + cross-slits + pinpoint golden emitter
          const faceCx = pts.reduce((s, p) => s + p[0], 0) / 4;
          const faceCy = pts.reduce((s, p) => s + p[1], 0) / 4;
          const innerPts = pts.map(([px, py]) => [
            faceCx + (px - faceCx) * 0.64,
            faceCy + (py - faceCy) * 0.64,
          ]);
          ctx.beginPath();
          innerPts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
          ctx.closePath();
          ctx.fillStyle = "rgba(10, 13, 20, 0.92)";
          ctx.fill();
          ctx.strokeStyle = "rgba(250, 204, 21, 0.58)";
          ctx.lineWidth = 1.1;
          ctx.stroke();

          // Mechanical aperture cross-lines
          ctx.strokeStyle = "rgba(253, 224, 71, 0.35)";
          ctx.lineWidth = 1;
          for (let k = 0; k < 2; k++) {
            const m1x = (pts[k][0] + pts[k + 1][0]) * 0.5;
            const m1y = (pts[k][1] + pts[k + 1][1]) * 0.5;
            const m2x = (pts[k + 2][0] + pts[(k + 3) % 4][0]) * 0.5;
            const m2y = (pts[k + 2][1] + pts[(k + 3) % 4][1]) * 0.5;
            ctx.beginPath();
            ctx.moveTo(m1x, m1y);
            ctx.lineTo(m2x, m2y);
            ctx.stroke();
          }

          // Sharp glowing core pinpoint on each visible face
          const coreGlow = ctx.createRadialGradient(faceCx, faceCy, 0.5, faceCx, faceCy, 12);
          coreGlow.addColorStop(0, "rgba(255, 253, 232, 1)");
          coreGlow.addColorStop(0.3, "rgba(253, 224, 71, 0.8)");
          coreGlow.addColorStop(1, "rgba(250, 204, 21, 0)");
          ctx.fillStyle = coreGlow;
          ctx.beginPath();
          ctx.arc(faceCx, faceCy, 12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const { center3, ru, rv, radius, rIdx } = item;
          const segs = 28;
          ctx.beginPath();
          for (let i = 0; i <= segs; i++) {
            const a = (i / segs) * Math.PI * 2;
            const ca = Math.cos(a) * radius;
            const sa = Math.sin(a) * radius;
            const p3 = [
              center3[0] + ru[0] * ca + rv[0] * sa,
              center3[1] + ru[1] * ca + rv[1] * sa,
              center3[2] + ru[2] * ca + rv[2] * sa,
            ];
            const p2 = projVec(p3, cx, cy, baseScale);
            if (i === 0) ctx.moveTo(p2[0], p2[1]);
            else ctx.lineTo(p2[0], p2[1]);
          }
          ctx.closePath();
          ctx.fillStyle = rIdx % 2 === 0 ? "rgba(186, 230, 253, 0.08)" : "rgba(250, 204, 21, 0.05)";
          ctx.fill();
          ctx.strokeStyle = rIdx === 0 ? "rgba(253, 224, 71, 0.62)" : "rgba(210, 230, 245, 0.56)";
          ctx.lineWidth = rIdx === 0 ? 1.5 : 1.15;
          ctx.stroke();

          // Inner optical aperture ring
          const innerR = radius * 0.56;
          ctx.beginPath();
          for (let i = 0; i <= segs; i++) {
            const a = (i / segs) * Math.PI * 2;
            const ca = Math.cos(a) * innerR;
            const sa = Math.sin(a) * innerR;
            const p3 = [
              center3[0] + ru[0] * ca + rv[0] * sa,
              center3[1] + ru[1] * ca + rv[1] * sa,
              center3[2] + ru[2] * ca + rv[2] * sa,
            ];
            const p2 = projVec(p3, cx, cy, baseScale);
            if (i === 0) ctx.moveTo(p2[0], p2[1]);
            else ctx.lineTo(p2[0], p2[1]);
          }
          ctx.closePath();
          ctx.strokeStyle = "rgba(250, 204, 21, 0.36)";
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      });

      // Floating golden calibration motes
      motes.forEach((m) => {
        const a = m.angle + timeSec * m.speed * 0.3;
        const r = baseScale * m.dist;
        const mx = cx + Math.cos(a) * r;
        const my = cy + Math.sin(a * 1.15) * r * 0.72;
        ctx.fillStyle = `rgba(254, 240, 138, ${0.38 + 0.32 * Math.sin(timeSec * 3 + m.angle)})`;
        ctx.beginPath();
        ctx.arc(mx, my, m.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ----------------------------------------------------------------------
    // 3. Top-Right Panel: 3D Nested Golden Wireframe Cube + Blueprint Code
    // ----------------------------------------------------------------------
    const blueprintLines = [
      "SYS_CALIB // CORE",
      "MESH_LOD : 4.2",
      "AXIS_LOCK: TRUE",
      "OPTICS_V : 3.2.8",
      "QA_SYNC  : PASS",
      "LATENCY  : 4.1ms",
      "CORE_HEX : FACC15",
    ];
    const outerVerts = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
    ];
    const innerVerts = outerVerts.map(([x, y, z]) => [x * 0.54, y * 0.54, z * 0.54]);
    const boxEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    function drawWireframeBlueprint(timeSec) {
      if (!wireCanvas) return;
      const { ctx, w, h } = syncCanvasSize(wireCanvas, 320, 200);
      ctx.clearRect(0, 0, w, h);

      // Faint cyan/slate blueprint code on left side
      ctx.font = '600 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      blueprintLines.forEach((txt, i) => {
        ctx.fillStyle = i === 0 ? "rgba(253, 224, 71, 0.72)" : "rgba(165, 232, 250, 0.48)";
        ctx.fillText(txt, 14, 18 + i * 18);
      });

      const cubeCx = w * 0.56;
      const cubeCy = h * 0.54;
      const scale = Math.min(w, h) * 1.24;

      // Warm golden radial glow behind wireframe cube
      const glow = ctx.createRadialGradient(cubeCx, cubeCy, 6, cubeCx, cubeCy, scale * 0.58);
      glow.addColorStop(0, `rgba(250, 204, 21, ${0.3 + boostEnergy * 0.2})`);
      glow.addColorStop(0.55, "rgba(250, 204, 21, 0.08)");
      glow.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const rx = 0.52 + Math.sin(timeSec * 0.5) * 0.07;
      const ry = 0.68 + timeSec * 0.35 + boostEnergy * 0.7;

      const pOuter = outerVerts.map((v) => projVec(rotVec(v, rx, ry), cubeCx, cubeCy, scale));
      const pInner = innerVerts.map((v) => projVec(rotVec(v, rx, ry), cubeCx, cubeCy, scale));

      // Subdivided face cross-grid lines on outer cube
      ctx.strokeStyle = "rgba(250, 204, 21, 0.25)";
      ctx.lineWidth = 0.85;
      cubeFaces.forEach((f) => {
        const [a, b, c, d] = f.idx.map((idx) => pOuter[idx]);
        ctx.beginPath();
        ctx.moveTo((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5);
        ctx.lineTo((c[0] + d[0]) * 0.5, (c[1] + d[1]) * 0.5);
        ctx.moveTo((b[0] + c[0]) * 0.5, (b[1] + c[1]) * 0.5);
        ctx.lineTo((d[0] + a[0]) * 0.5, (d[1] + a[1]) * 0.5);
        ctx.stroke();
      });

      // Diagonal struts connecting outer & inner cubes
      ctx.strokeStyle = "rgba(250, 204, 21, 0.32)";
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(pOuter[i][0], pOuter[i][1]);
        ctx.lineTo(pInner[i][0], pInner[i][1]);
        ctx.stroke();
      }

      // Inner nested cube
      ctx.strokeStyle = "rgba(253, 224, 71, 0.55)";
      ctx.lineWidth = 1.1;
      boxEdges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(pInner[a][0], pInner[a][1]);
        ctx.lineTo(pInner[b][0], pInner[b][1]);
        ctx.stroke();
      });

      // Outer golden glowing cube + subdivision mid-lines
      ctx.save();
      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(250, 204, 21, 0.7)";
      ctx.shadowBlur = 7;
      boxEdges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(pOuter[a][0], pOuter[a][1]);
        ctx.lineTo(pOuter[b][0], pOuter[b][1]);
        ctx.stroke();
      });
      ctx.restore();

      // Callout leader line to top-rightmost vertex
      let targetPt = pOuter[0];
      pOuter.forEach((pt) => {
        if (pt[0] - pt[1] > targetPt[0] - targetPt[1]) targetPt = pt;
      });
      const labelX = Math.min(w - 14, targetPt[0] + 38);
      const labelY = Math.max(18, targetPt[1] - 18);
      ctx.strokeStyle = "rgba(253, 224, 71, 0.72)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(targetPt[0], targetPt[1]);
      ctx.lineTo(targetPt[0] + 14, labelY);
      ctx.lineTo(labelX, labelY);
      ctx.stroke();

      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(targetPt[0], targetPt[1], 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '700 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
      ctx.fillText("NODE // CORE", labelX, labelY - 3);
    }

    // ----------------------------------------------------------------------
    // 4. Telemetry HUD Updater & Animation Loop
    // ----------------------------------------------------------------------
    function applySegLevels(levels) {
      segCols.forEach((col, cIdx) => {
        const lvl = levels[cIdx] ?? Number(col.dataset.level || 5);
        const spans = col.querySelectorAll(".seg-stack span");
        spans.forEach((sp, sIdx) => {
          sp.classList.toggle("is-lit", sIdx < lvl);
        });
      });
    }
    applySegLevels([4, 6, 8, 7, 5]);

    function runSimulation(mode) {
      activeMode = mode;
      boostEnergy = 1;
      scanSweep = 0;

      if (coreCardEl) coreCardEl.classList.add("is-running");

      const nextLevels = segCols.map(() => 3 + Math.floor(Math.random() * 7));
      applySegLevels(nextLevels);

      hBarFills.forEach((fill) => {
        fill.style.width = `${52 + Math.floor(Math.random() * 45)}%`;
      });

      specBars.forEach((bar) => {
        bar.style.height = `${30 + Math.floor(Math.random() * 68)}%`;
      });

      const pct = mode === "TEST" ? 99 : mode === "INSTALL" ? 96 : 98;
      if (gaugeEl) gaugeEl.style.setProperty("--pct", String(pct));
      if (gaugeArcEl) gaugeArcEl.style.setProperty("--pct", String(pct));
      if (gaugeValEl) gaugeValEl.textContent = `${pct}%`;
      if (gaugeStateEl) gaugeStateEl.textContent = mode === "TEST" ? "PASS" : mode === "INSTALL" ? "SYNC" : "READY";

      setTimeout(() => {
        if (coreCardEl) coreCardEl.classList.remove("is-running");
      }, 1100);
    }

    consoleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        consoleBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        runSimulation(btn.dataset.consoleCmd);
      });
    });

    if (testNowBtn) {
      testNowBtn.addEventListener("click", () => {
        consoleBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.consoleCmd === "TEST"));
        runSimulation("TEST");
        showToast(currentLang === "th" ? "รันการทดสอบ QA เต็มรูปแบบแล้ว (99%)" : "Full QA Benchmark complete (99%)");
      });
    }

    function renderTestFrame(nowMs) {
      const timeSec = nowMs * 0.001;
      if (boostEnergy > 0.005) {
        boostEnergy *= 0.955;
      } else {
        boostEnergy = 0;
      }
      if (scanSweep >= 0) {
        scanSweep += 0.024;
        if (scanSweep > 1.05) scanSweep = -1;
      }

      drawCalibrationCore(timeSec);
      drawWireframeBlueprint(timeSec);

      if (!reducedMotion && !document.hidden) {
        requestAnimationFrame(renderTestFrame);
      }
    }

    requestAnimationFrame(renderTestFrame);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !reducedMotion) {
        requestAnimationFrame(renderTestFrame);
      }
    });
  }

  // ========================================================================
  // PAGE 04: DOWNLOAD (Tree View, 5-Card Deck + Shuffle, Manual, Overview, Promo)
  // ========================================================================
  if (pageKey === "download") {
    const APPS_CATALOG = {
      "deck-engine": {
        id: "deck-engine",
        name: "Deck Engine Pro",
        file: "BIGFATHER-Deck-Engine-Pro.zip",
        size: "32.00 MB",
        version: "v3.2.0",
        shortVer: "v3.2",
        downloads: 1488,
        os: "WIN / MAC",
        categoryPath: "CREATIVE & UI APPS // DESKTOP SUITES",
        categoryPill: "DESKTOP SUITE",
        promoBg: "images/card-product.jpg",
        desc: {
          th: "เอนจินเมนูการ์ดไพ่ 3 มิติพร้อมแอนิเมชัน Tunnel FX 60fps และตัวจัดการธีมเทา-ทองแบบเรียลไทม์",
          en: "3D playing-card navigation engine with 60fps Tunnel FX and real-time gray-gold HUD theming.",
        },
        specs: ["WIN 11 / macOS", "60FPS GPU", "SHA256 VERIFIED"],
        manual: [
          { step: "01", title: { th: "แตกไฟล์ติดตั้ง", en: "Unpack Suite" }, desc: { th: "แตก ZIP แล้วเปิด DeckEngine.exe", en: "Extract ZIP & launch DeckEngine" } },
          { step: "02", title: { th: "เลือกเด็คการ์ด", en: "Pick Card Deck" }, desc: { th: "กำหนดจำนวนไพ่และมุมพัด 3D", en: "Set card count & fan spread" } },
          { step: "03", title: { th: "ส่งออก HUD", en: "Export Build" }, desc: { th: "Export เป็น HTML/CSS ออฟไลน์", en: "Export offline HTML/CSS bundle" } },
        ],
        screens: [
          { idx: "01", sym: "◆", title: "Card Stage", kind: "cards" },
          { idx: "02", sym: "▲", title: "Tunnel FX", kind: "tunnel" },
          { idx: "03", sym: "✦", title: "Theme Core", kind: "tokens" },
          { idx: "04", sym: "●", title: "Foil Beam", kind: "wave" },
          { idx: "05", sym: "★", title: "Live Grid", kind: "grid" },
        ],
        promo: {
          badge: "FLAGSHIP RELEASE",
          headline: "Interactive 3D Card Engine",
          sub: {
            th: "สร้างหน้าเว็บสไตล์เด็คไพ่ 3 มิติพร้อมเอฟเฟกต์ฟอยล์และอุโมงค์แสงไซอัน",
            en: "Build scroll-driven 3D playing-card interfaces with holographic foil FX.",
          },
          metrics: [
            { k: "FRAME RATE", v: "60 FPS" },
            { k: "FOOTPRINT", v: "32 MB" },
            { k: "GPU LOAD", v: "LOW" },
          ],
        },
      },
      "holo-mockup": {
        id: "holo-mockup",
        name: "Holo Mockup Studio",
        file: "BIGFATHER-Holo-Mockup-Studio.zip",
        size: "24.50 MB",
        version: "v2.4.1",
        shortVer: "v2.4",
        downloads: 942,
        os: "WIN / WEB",
        categoryPath: "CREATIVE & UI APPS // DESKTOP SUITES",
        categoryPill: "MOCKUP KIT",
        promoBg: "images/card-profile.jpg",
        desc: {
          th: "สตูดิโอจัดวางหน้าจอ Multi-Device ทั้งเดสก์ท็อปและมือถือบนแท่นแสงโฮโลแกรมสำหรับการพรีเซนต์งาน",
          en: "Multi-device showcase studio for angled desktop and mobile screens over holo pedestals.",
        },
        specs: ["DESKTOP + MOBILE", "SVG / PNG EXPORT", "4K READY"],
        manual: [
          { step: "01", title: { th: "นำเข้าหน้าจอ", en: "Drop Screens" }, desc: { th: "วางภาพ UI ลงกรอบ Desktop/Phone", en: "Drop UI images into device frames" } },
          { step: "02", title: { th: "จัดมุมแสงทอง", en: "Tune Pedestal" }, desc: { th: "ปรับแสงฐานโฮโลแกรมและมุมเอียง", en: "Adjust holo glow & perspective" } },
          { step: "03", title: { th: "เรนเดอร์ 4K", en: "Render 4K" }, desc: { th: "ส่งออก PNG พื้นใสหรือ SVG ทันที", en: "Export crisp 4K PNG or SVG" } },
        ],
        screens: [
          { idx: "01", sym: "◆", title: "Device Trio", kind: "devices" },
          { idx: "02", sym: "▲", title: "Pedestal FX", kind: "cube" },
          { idx: "03", sym: "✦", title: "Export Grid", kind: "grid" },
          { idx: "04", sym: "●", title: "Card Frame", kind: "cards" },
          { idx: "05", sym: "★", title: "Color Kit", kind: "tokens" },
        ],
        promo: {
          badge: "STUDIO EDITION",
          headline: "Multi-Device Holo Showcase",
          sub: {
            th: "พรีเซนต์ผลงานแอปและเว็บแบบ 3 มุมมองพร้อมแสงโฮโลแกรมสีทองอัตโนมัติ",
            en: "Present web and mobile prototypes in dramatic 3D golden holo framing.",
          },
          metrics: [
            { k: "TEMPLATES", v: "24+" },
            { k: "EXPORT", v: "4K PNG" },
            { k: "PRESETS", v: "18" },
          ],
        },
      },
      "spatial-ui": {
        id: "spatial-ui",
        name: "Spatial UI Builder",
        file: "BIGFATHER-Spatial-UI-Builder.zip",
        size: "38.20 MB",
        version: "v2.8.0",
        shortVer: "v2.8",
        downloads: 1120,
        os: "WIN / MAC",
        categoryPath: "CREATIVE & UI APPS // 3D & SPATIAL",
        categoryPill: "3D SPATIAL",
        promoBg: "images/card-test.jpg",
        desc: {
          th: "เครื่องมือประกอบอินเทอร์เฟซเชิงลึก 3 มิติ พร้อมคิวบ์แสงสีทองและระบบจัดเรียงเลเยอร์แบบ Perspective",
          en: "Spatial 3D interface composer featuring golden wireframe cubes and perspective layers.",
        },
        specs: ["WEBGL2 / GLB", "LAYER STACK", "REALTIME LIGHT"],
        manual: [
          { step: "01", title: { th: "สร้างฉาก 3D", en: "Init Scene" }, desc: { th: "เปิด SpatialCanvas และเลือก Mesh", en: "Open SpatialCanvas & pick mesh" } },
          { step: "02", title: { th: "ซ้อนเลเยอร์ HUD", en: "Stack Layers" }, desc: { th: "กำหนดค่าแกน Z และแสงขอบทอง", en: "Configure Z-depth & rim light" } },
          { step: "03", title: { th: "บันทึก GLB", en: "Export GLB" }, desc: { th: "บันทึกเป็น .glb หรือสคริปต์เว็บ", en: "Export .glb or web runtime" } },
        ],
        screens: [
          { idx: "01", sym: "◆", title: "Mesh View", kind: "cube" },
          { idx: "02", sym: "▲", title: "Layer Stack", kind: "cards" },
          { idx: "03", sym: "✦", title: "GLB Export", kind: "grid" },
          { idx: "04", sym: "●", title: "Depth Tunnel", kind: "tunnel" },
          { idx: "05", sym: "★", title: "Light Wave", kind: "wave" },
        ],
        promo: {
          badge: "SPATIAL 3D KIT",
          headline: "Depth-Driven HUD Composer",
          sub: {
            th: "ออกแบบหน้าต่าง HUD ซ้อนมิติและโมเดล Wireframe สีทองได้ทันทีในหน้าเดียว",
            en: "Compose layered spatial panels and interactive wireframe scenes in seconds.",
          },
          metrics: [
            { k: "ENGINE", v: "WEBGL2" },
            { k: "SHADERS", v: "PBR" },
            { k: "LATENCY", v: "3.8ms" },
          ],
        },
      },
      "cyber-shader": {
        id: "cyber-shader",
        name: "Cyber Shader Lab",
        file: "BIGFATHER-Cyber-Shader-Lab.zip",
        size: "19.40 MB",
        version: "v1.9.4",
        shortVer: "v1.9",
        downloads: 765,
        os: "CROSS-PLATFORM",
        categoryPath: "CREATIVE & UI APPS // 3D & SPATIAL",
        categoryPill: "SHADER LAB",
        promoBg: "images/card-download.jpg",
        desc: {
          th: "ห้องทดลอง Shader แสงฟอยล์โฮโลแกรมและพาร์ติเคิลอุโมงค์แสงไซอันที่ปรับแต่งพารามิเตอร์ได้สด",
          en: "Live shader sandbox for holographic foil beams, rim glow, and cyan tunnel particle fields.",
        },
        specs: ["GLSL SNIPPETS", "LIVE UNIFORMS", "ZERO DEPS"],
        manual: [
          { step: "01", title: { th: "เลือก Preset", en: "Load Shader" }, desc: { th: "เลือก Foil, Rim หรือ Spark Trail", en: "Pick Foil, Rim, or Spark shader" } },
          { step: "02", title: { th: "ปรับ Uniforms", en: "Tune Values" }, desc: { th: "เลื่อนสไลเดอร์ความเร็วและความฟุ้ง", en: "Adjust speed & glow intensity" } },
          { step: "03", title: { th: "คัดลอก GLSL", en: "Copy GLSL" }, desc: { th: "คัดลอกโค้ดเข้าสู่โปรเจกต์ทันที", en: "Copy ready-to-use GLSL code" } },
        ],
        screens: [
          { idx: "01", sym: "◆", title: "Foil Beam", kind: "wave" },
          { idx: "02", sym: "▲", title: "Spark Field", kind: "tunnel" },
          { idx: "03", sym: "✦", title: "Node Graph", kind: "tokens" },
          { idx: "04", sym: "●", title: "Rim Cube", kind: "cube" },
          { idx: "05", sym: "★", title: "Perf Grid", kind: "grid" },
        ],
        promo: {
          badge: "SHADER SANDBOX",
          headline: "Holographic Foil & Glow FX",
          sub: {
            th: "จูนความเข้มแสงและสปีดอนุภาคให้เข้ากับหน้าจอเดสก์ท็อปและมือถือทุกรุ่น",
            en: "Fine-tune rim orbit beams and GPU-safe particle trails across any device.",
          },
          metrics: [
            { k: "SHADERS", v: "32" },
            { k: "MOBILE", v: "SAFE" },
            { k: "FPS CAP", v: "120" },
          ],
        },
      },
      "system-core": {
        id: "system-core",
        name: "System Core CLI",
        file: "BIGFATHER-System-Core-CLI.zip",
        size: "16.00 MB",
        version: "v4.0.2",
        shortVer: "v4.0",
        downloads: 2310,
        os: "WIN / LINUX",
        categoryPath: "SYSTEM & AUTOMATION // CORE ENGINES",
        categoryPill: "CORE ENGINE",
        promoBg: "images/card-contact.jpg",
        desc: {
          th: "คอมมานด์ไลน์หลักสำหรับเชื่อมต่อ API Bus, ซิงค์ Telemetry และ Deploy โปรเจกต์อัตโนมัติ",
          en: "Core CLI runtime for API bus orchestration, telemetry sync, and automated builds.",
        },
        specs: ["NODE 24+", "ZERO CONFIG", "AUTO DEPLOY"],
        manual: [
          { step: "01", title: { th: "ติดตั้ง CLI", en: "Install CLI" }, desc: { th: "รัน bf-core init ในโฟลเดอร์งาน", en: "Run bf-core init in workspace" } },
          { step: "02", title: { th: "ตั้งค่า Bus", en: "Config Bus" }, desc: { th: "ระบุ endpoint และคีย์ SHA256", en: "Set endpoint & SHA256 token" } },
          { step: "03", title: { th: "สั่ง Deploy", en: "Run Deploy" }, desc: { th: "พิมพ์ bf-core build --verify", en: "Execute bf-core build --verify" } },
        ],
        screens: [
          { idx: "01", sym: "◆", title: "CLI Shell", kind: "grid" },
          { idx: "02", sym: "▲", title: "API Bus", kind: "wave" },
          { idx: "03", sym: "✦", title: "Health Log", kind: "tokens" },
          { idx: "04", sym: "●", title: "Node Mesh", kind: "cube" },
          { idx: "05", sym: "★", title: "Multi-Host", kind: "devices" },
        ],
        promo: {
          badge: "CORE RUNTIME",
          headline: "Zero-Latency Build Pipeline",
          sub: {
            th: "สั่ง Build, ตรวจสอบแพ็กเกจ และทดสอบ Integrity ของไฟล์ทั้งหมดในคำสั่งเดียว",
            en: "Run automated package checks, checksums, and instant deployment scripts.",
          },
          metrics: [
            { k: "BUILD", v: "1.2s" },
            { k: "CHECKSUM", v: "SHA256" },
            { k: "UPTIME", v: "99.9%" },
          ],
        },
      },
      "signal-hud": {
        id: "signal-hud",
        name: "Signal Telemetry HUD",
        file: "BIGFATHER-Signal-Telemetry-HUD.zip",
        size: "22.80 MB",
        version: "v2.1.5",
        shortVer: "v2.1",
        downloads: 884,
        os: "WIN / WEB",
        categoryPath: "SYSTEM & AUTOMATION // CORE ENGINES",
        categoryPill: "TELEMETRY",
        promoBg: "images/card-contact.jpg",
        desc: {
          th: "หน้าปัดมอนิเตอร์สัญญาณ Oscilloscope และกราฟ Telemetry แบบเรียลไทม์สำหรับตรวจสอบสถานะระบบ",
          en: "Real-time oscilloscope waveform monitor and multi-channel system telemetry dashboard.",
        },
        specs: ["LIVE CANVAS", "WAVEFORM FX", "JSON STREAM"],
        manual: [
          { step: "01", title: { th: "เชื่อมสตรีม", en: "Bind Stream" }, desc: { th: "ชี้แหล่งข้อมูล WebSocket หรือ JSON", en: "Connect WebSocket or JSON feed" } },
          { step: "02", title: { th: "เลือกช่องสัญญาณ", en: "Select Ch" }, desc: { th: "เปิดแสดงกราฟคลื่นคู่และ Matrix", en: "Toggle dual wave & dot matrix" } },
          { step: "03", title: { th: "บันทึก CSV", en: "Save Logs" }, desc: { th: "ส่งออกค่า Latency เพื่อวิเคราะห์", en: "Export latency traces to CSV" } },
        ],
        screens: [
          { idx: "01", sym: "◆", title: "Oscilloscope", kind: "wave" },
          { idx: "02", sym: "▲", title: "Matrix Dots", kind: "grid" },
          { idx: "03", sym: "✦", title: "Uplink Core", kind: "cube" },
          { idx: "04", sym: "●", title: "Tunnel Ping", kind: "tunnel" },
          { idx: "05", sym: "★", title: "Signal Deck", kind: "cards" },
        ],
        promo: {
          badge: "TELEMETRY SUITE",
          headline: "Real-Time Signal Monitor",
          sub: {
            th: "ติดตามคลื่นสัญญาณและสเปกตรัมการทำงานของระบบได้คมชัดทุกรายละเอียด",
            en: "Visualize carrier harmonics, latency spikes, and uplink health in real time.",
          },
          metrics: [
            { k: "CHANNELS", v: "16" },
            { k: "REFRESH", v: "60Hz" },
            { k: "EXPORT", v: "CSV" },
          ],
        },
      },
      "qa-runner": {
        id: "qa-runner",
        name: "QA Runner Pro",
        file: "BIGFATHER-QA-Runner-Pro.zip",
        size: "28.60 MB",
        version: "v3.1.0",
        shortVer: "v3.1",
        downloads: 1045,
        os: "WIN / MAC",
        categoryPath: "SYSTEM & AUTOMATION // QA & UTILITIES",
        categoryPill: "QA SUITE",
        promoBg: "images/card-test.jpg",
        desc: {
          th: "ชุดทดสอบความเสถียรระบบอัตโนมัติ พร้อม Calibration Cube และรายงานผล Benchmark แบบทันที",
          en: "Automated QA test suite featuring Calibration Core sweeps and instant benchmark scoring.",
        },
        specs: ["AUTO SWEEP", "99% ACCURACY", "REPORT PDF"],
        manual: [
          { step: "01", title: { th: "โหลดโปรไฟล์", en: "Load Suite" }, desc: { th: "เลือกชุดตรวจ PLAY / INSTALL / TEST", en: "Pick PLAY, INSTALL, or TEST" } },
          { step: "02", title: { th: "สแกนคิวบ์", en: "Run Sweep" }, desc: { th: "เริ่มทดสอบเฟรมเรตและ Responsive", en: "Sweep FPS & viewport breakpoints" } },
          { step: "03", title: { th: "ออกรายงาน", en: "Export PDF" }, desc: { th: "ดาวน์โหลดคะแนนและ Log สรุปผล", en: "Download pass score & QA log" } },
        ],
        screens: [
          { idx: "01", sym: "◆", title: "Calibrate", kind: "cube" },
          { idx: "02", sym: "▲", title: "Binary Log", kind: "grid" },
          { idx: "03", sym: "✦", title: "Score Gauge", kind: "wave" },
          { idx: "04", sym: "●", title: "Device Check", kind: "devices" },
          { idx: "05", sym: "★", title: "Sweep FX", kind: "tunnel" },
        ],
        promo: {
          badge: "QA BENCHMARK",
          headline: "Automated Quality Lab",
          sub: {
            th: "รันชุดทดสอบประสิทธิภาพ UI, เฟรมเรต และ Responsive layout อัตโนมัติ",
            en: "Verify frame pacing, responsive layouts, and asset integrity automatically.",
          },
          metrics: [
            { k: "PASS RATE", v: "99.4%" },
            { k: "SUITES", v: "48" },
            { k: "MODE", v: "AUTO" },
          ],
        },
      },
      "theme-tokens": {
        id: "theme-tokens",
        name: "Theme Token Pack",
        file: "BIGFATHER-Theme-Token-Pack.zip",
        size: "12.06 MB",
        version: "v1.5.0",
        shortVer: "v1.5",
        downloads: 1890,
        os: "CSS / FIGMA",
        categoryPath: "SYSTEM & AUTOMATION // QA & UTILITIES",
        categoryPill: "DESIGN TOKENS",
        promoBg: "images/card-download.jpg",
        desc: {
          th: "ชุดโทเค็นสี เทา-เหลือง ฟอนต์ Self-hosted และคอมโพเนนต์ HUD พร้อมใช้งานร่วมกับทุกโปรเจกต์",
          en: "Complete Gray & Gold design tokens, local woff2 font pack, and reusable HUD primitives.",
        },
        specs: ["100% OFFLINE", "CSS VARIABLES", "TH / EN READY"],
        manual: [
          { step: "01", title: { th: "คัดลอกฟอนต์", en: "Copy Fonts" }, desc: { th: "วางโฟลเดอร์ fonts/ ลงรูทเว็บ", en: "Place fonts/ into project root" } },
          { step: "02", title: { th: "นำเข้า tokens", en: "Link CSS" }, desc: { th: "เรียกใช้ styles.css และ subpage.css", en: "Import styles.css & tokens" } },
          { step: "03", title: { th: "ต่อยอดหน้าใหม่", en: "Build Pages" }, desc: { th: "ใช้คลาสการ์ดและสีมาตรฐานได้เลย", en: "Reuse card & HUD classes" } },
        ],
        screens: [
          { idx: "01", sym: "◆", title: "Color Grid", kind: "tokens" },
          { idx: "02", sym: "▲", title: "Card Specs", kind: "cards" },
          { idx: "03", sym: "✦", title: "HUD Kit", kind: "devices" },
          { idx: "04", sym: "●", title: "Layout Map", kind: "grid" },
          { idx: "05", sym: "★", title: "Glow FX", kind: "tunnel" },
        ],
        promo: {
          badge: "DESIGN SYSTEM",
          headline: "Gray & Gold Cyber Tokens",
          sub: {
            th: "รวมโทเค็นสี ฟอนต์ออฟไลน์ และคอมโพเนนต์การ์ดไพ่มาตรฐาน BIGFATHER",
            en: "Drop-in CSS variables, self-hosted fonts, and modular HUD card tokens.",
          },
          metrics: [
            { k: "TOKENS", v: "64" },
            { k: "FONTS", v: "LOCAL" },
            { k: "SIZE", v: "12 MB" },
          ],
        },
      },
    };

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
    const dlBuildCodeEl = document.getElementById("dlBuildCode");
    const dlFillEl = document.getElementById("dlProgressFill");
    const dlFillSubEl = document.getElementById("dlProgressFillSub");
    const dlSizeLabelEl = document.getElementById("dlSizeLabel");
    const dlCountLabelEl = document.getElementById("dlCountLabel");
    const downloadNowBtn = document.getElementById("downloadNowBtn");
    const downloadQuickBtn = document.getElementById("downloadQuickBtn");
    const getAssetsBtn = document.getElementById("getAssetsBtn");

    let activeApp = APPS_CATALOG["deck-engine"];
    let activeScreenIdx = 0;
    let stageFocus = "overview"; // "overview" | "manual" | "cards"
    let shuffleTimer = null;

    function renderMiniGraphicSvg(kind) {
      if (kind === "cards") {
        return `<svg viewBox="0 0 80 56" width="64" height="44" fill="none">
          <rect x="10" y="12" width="22" height="32" rx="4" transform="rotate(-10 21 28)" fill="rgba(250,204,21,0.12)" stroke="#facc15" stroke-width="1.3"/>
          <rect x="29" y="8" width="22" height="34" rx="4" fill="rgba(250,204,21,0.22)" stroke="#fde047" stroke-width="1.5"/>
          <rect x="48" y="12" width="22" height="32" rx="4" transform="rotate(10 59 28)" fill="rgba(56,226,255,0.12)" stroke="#38e2ff" stroke-width="1.3"/>
        </svg>`;
      }
      if (kind === "tunnel") {
        return `<svg viewBox="0 0 80 56" width="64" height="44" fill="none">
          <rect x="8" y="6" width="64" height="44" rx="4" stroke="#38e2ff" stroke-width="1.2" opacity="0.6"/>
          <rect x="18" y="13" width="44" height="30" rx="3" stroke="#facc15" stroke-width="1.2" opacity="0.8"/>
          <rect x="28" y="20" width="24" height="16" rx="2" fill="rgba(250,204,21,0.2)" stroke="#fde047" stroke-width="1.3"/>
          <circle cx="40" cy="28" r="3" fill="#fef08a"/>
        </svg>`;
      }
      if (kind === "cube") {
        return `<svg viewBox="0 0 80 56" width="64" height="44" fill="none">
          <polygon points="40,6 60,17 60,39 40,50 20,39 20,17" fill="rgba(250,204,21,0.14)" stroke="#fde047" stroke-width="1.5"/>
          <path d="M20 17L40 28L60 17M40 28V50" stroke="#facc15" stroke-width="1.3"/>
          <circle cx="40" cy="28" r="3.5" fill="#38e2ff"/>
        </svg>`;
      }
      if (kind === "wave") {
        return `<svg viewBox="0 0 80 56" width="64" height="44" fill="none">
          <line x1="6" y1="28" x2="74" y2="28" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
          <path d="M8 28 Q 20 8, 32 28 T 56 28 T 74 28" stroke="#38e2ff" stroke-width="2" fill="none"/>
          <path d="M8 28 Q 22 44, 36 28 T 64 28 T 74 28" stroke="#fde047" stroke-width="1.6" fill="none"/>
        </svg>`;
      }
      if (kind === "devices") {
        return `<svg viewBox="0 0 80 56" width="64" height="44" fill="none">
          <rect x="8" y="12" width="38" height="28" rx="4" fill="rgba(56,226,255,0.1)" stroke="#38e2ff" stroke-width="1.3"/>
          <rect x="44" y="10" width="22" height="36" rx="4" fill="rgba(250,204,21,0.18)" stroke="#fde047" stroke-width="1.5"/>
          <ellipse cx="40" cy="48" rx="28" ry="4" fill="rgba(250,204,21,0.28)"/>
        </svg>`;
      }
      if (kind === "tokens") {
        return `<svg viewBox="0 0 80 56" width="64" height="44" fill="none">
          <circle cx="24" cy="22" r="10" fill="#facc15"/>
          <circle cx="42" cy="22" r="10" fill="#272b34" stroke="#d1d5db" stroke-width="1.3"/>
          <circle cx="58" cy="22" r="10" fill="#38e2ff" opacity="0.8"/>
          <rect x="14" y="38" width="52" height="6" rx="3" fill="rgba(250,204,21,0.4)"/>
        </svg>`;
      }
      return `<svg viewBox="0 0 80 56" width="64" height="44" fill="none">
        <rect x="10" y="10" width="26" height="16" rx="3" fill="rgba(250,204,21,0.2)" stroke="#fde047" stroke-width="1.2"/>
        <rect x="42" y="10" width="28" height="16" rx="3" fill="rgba(56,226,255,0.15)" stroke="#38e2ff" stroke-width="1.2"/>
        <rect x="10" y="32" width="60" height="14" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.28)" stroke-width="1.1"/>
      </svg>`;
    }

    function renderHeroStageSvg(app, screen) {
      const kind = screen ? screen.kind : app.screens[0].kind;
      if (kind === "cube") {
        return `<svg class="promo-ui-hero-svg" viewBox="0 0 220 98" fill="none">
          <ellipse cx="110" cy="84" rx="68" ry="9" fill="rgba(250,204,21,0.2)" stroke="#facc15" stroke-width="1.1" stroke-dasharray="5 4"/>
          <polygon points="110,12 150,33 150,70 110,88 70,70 70,33" fill="rgba(250,204,21,0.14)" stroke="#fde047" stroke-width="1.8"/>
          <path d="M70 33L110 52L150 33M110 52V88" stroke="#facc15" stroke-width="1.4"/>
          <circle cx="110" cy="52" r="7" fill="rgba(56,226,255,0.35)" stroke="#7df3ff" stroke-width="1.4"/>
        </svg>`;
      }
      if (kind === "wave") {
        return `<svg class="promo-ui-hero-svg" viewBox="0 0 220 98" fill="none">
          <line x1="12" y1="50" x2="208" y2="50" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
          <path d="M12 50 Q 45 12, 78 50 T 144 50 T 208 50" stroke="#38e2ff" stroke-width="2.4" fill="none"/>
          <path d="M12 50 Q 48 82, 84 50 T 156 50 T 208 50" stroke="#fde047" stroke-width="2" fill="none"/>
        </svg>`;
      }
      if (kind === "devices") {
        return `<svg class="promo-ui-hero-svg" viewBox="0 0 220 98" fill="none">
          <ellipse cx="110" cy="86" rx="78" ry="8" fill="rgba(250,204,21,0.22)" stroke="#facc15" stroke-width="1.2"/>
          <rect x="30" y="14" width="90" height="58" rx="6" fill="rgba(16,24,38,0.92)" stroke="#7df3ff" stroke-width="1.5"/>
          <rect x="136" y="10" width="44" height="70" rx="7" fill="rgba(20,24,33,0.96)" stroke="#fde047" stroke-width="1.8"/>
        </svg>`;
      }
      if (kind === "tunnel") {
        return `<svg class="promo-ui-hero-svg" viewBox="0 0 220 98" fill="none">
          <rect x="22" y="8" width="176" height="82" rx="7" stroke="#38e2ff" stroke-width="1.2" opacity="0.55"/>
          <rect x="48" y="20" width="124" height="58" rx="5" stroke="#facc15" stroke-width="1.3" opacity="0.78"/>
          <rect x="74" y="32" width="72" height="34" rx="4" fill="rgba(250,204,21,0.14)" stroke="#fde047" stroke-width="1.5"/>
          <circle cx="110" cy="49" r="8" fill="#fef08a" opacity="0.9"/>
        </svg>`;
      }
      return `<svg class="promo-ui-hero-svg" viewBox="0 0 220 98" fill="none">
        <ellipse cx="110" cy="86" rx="74" ry="8" fill="rgba(250,204,21,0.22)"/>
        <rect x="48" y="18" width="42" height="58" rx="6" transform="rotate(-11 69 47)" fill="rgba(26,30,40,0.95)" stroke="#38e2ff" stroke-width="1.4"/>
        <rect x="86" y="10" width="48" height="64" rx="7" fill="rgba(30,34,44,0.98)" stroke="#fde047" stroke-width="2"/>
        <rect x="130" y="18" width="42" height="58" rx="6" transform="rotate(11 151 47)" fill="rgba(26,30,40,0.95)" stroke="#facc15" stroke-width="1.4"/>
        <circle cx="110" cy="40" r="8" fill="rgba(250,204,21,0.28)" stroke="#fef08a" stroke-width="1.5"/>
      </svg>`;
    }

    function renderPromoStage() {
      if (!promoViewportEl) return;
      const app = activeApp;
      const activeScreen = app.screens[activeScreenIdx] || app.screens[0];
      const metricsHtml = app.promo.metrics
        .map(
          (m) =>
            `<div class="promo-ui-metric"><span>${m.k}</span><strong>${m.v}</strong></div>`
        )
        .join("");

      promoViewportEl.innerHTML = `
        <div class="promo-ad-banner" style="background-image:url('${app.promoBg}')">
          <div class="promo-ad-scrim"></div>
          <div class="promo-ad-content">
            <span class="promo-ad-badge">${app.promo.badge}</span>
            <div class="promo-ad-visual">
              ${renderHeroStageSvg(app, activeScreen)}
            </div>
            <div class="promo-ad-copy">
              <h3>${app.name}</h3>
              <p>${app.promo.sub[currentLang]}</p>
            </div>
            <div class="promo-ad-metrics">${metricsHtml}</div>
          </div>
        </div>
      `;
      if (promoFooterKickerEl) promoFooterKickerEl.textContent = "PROMO SHOWCASE // " + app.version;
      if (promoFooterHeadlineEl) promoFooterHeadlineEl.textContent = app.promo.headline;
      if (promoOsBadgeEl) promoOsBadgeEl.textContent = app.os;
      if (promoLiveTagEl) promoLiveTagEl.textContent = app.shortVer;
    }

    function renderManualBox() {
      if (!appManualStepsEl) return;
      appManualStepsEl.innerHTML = activeApp.manual
        .map(
          (st) => `
          <div class="manual-step-item">
            <span class="manual-step-num">STEP</span>
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
              <div class="pc-screen-bar"><i></i><i></i></div>
              <div class="pc-screen-visual">${renderMiniGraphicSvg(scr.kind)}</div>
              <div class="pc-screen-lines">
                <span style="width:82%;"></span>
                <span style="width:54%;"></span>
              </div>
            </div>
            <div class="pc-title">${scr.title}</div>
          </button>`
        )
        .join("");

      const activeScr = app.screens[activeScreenIdx] || app.screens[0];
      if (activeCardLabelEl) {
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
          renderPromoStage();
        });
      });
    }

    function renderSelectedApp(app) {
      activeApp = app;

      // Tree active state
      productBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.app === app.id));

      // Frame 1 (Top): 5-Card Preview Deck
      renderPreviewCardHand();

      // Frame 2 (Middle): App Manual
      renderManualBox();

      // Frame 3 (Bottom/Front): App Content / Overview
      if (appOverviewTagEl) appOverviewTagEl.textContent = `APP // ${app.name.toUpperCase()}`;
      if (appVersionBadgeEl) appVersionBadgeEl.textContent = app.version;
      if (appOverviewTitleEl) appOverviewTitleEl.textContent = app.name;
      if (appCategoryPillEl) appCategoryPillEl.textContent = app.categoryPill;
      if (appOverviewDescEl) appOverviewDescEl.textContent = app.desc[currentLang];
      if (appSpecChipsEl) {
        appSpecChipsEl.innerHTML = app.specs
          .map((s) => `<span class="app-spec-chip">${s}</span>`)
          .join("");
      }

      // Right Column: Promotional Showcase Only
      renderPromoStage();

      // Bottom HUD Bar
      if (dlCategoryKickerEl) dlCategoryKickerEl.textContent = app.categoryPath;
      if (dlCalloutTitleEl) dlCalloutTitleEl.textContent = app.name;
      if (dlBuildCodeEl) dlBuildCodeEl.textContent = app.shortVer;
      if (dlSizeLabelEl) dlSizeLabelEl.textContent = app.size;
      if (dlCountLabelEl) dlCountLabelEl.textContent = app.downloads.toLocaleString("en-US");

      const numericMb = parseFloat(app.size) || 24;
      const ratioMain = Math.min(0.94, Math.max(0.36, numericMb / 42));
      const ratioSub = Math.min(0.86, Math.max(0.26, ratioMain * 0.78));
      if (dlFillEl) dlFillEl.style.transform = `scaleX(${ratioMain.toFixed(2)})`;
      if (dlFillSubEl) dlFillSubEl.style.transform = `scaleX(${ratioSub.toFixed(2)})`;
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
        renderPromoStage();
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
        const found = APPS_CATALOG[btn.dataset.app];
        if (!found) return;
        activeScreenIdx = 0;
        renderSelectedApp(found);
        if (stageFocus === "cards") {
          triggerCardShuffle();
        }
      });
    });

    // Sync dynamic app text when TH/EN language changes
    langButtons.forEach((lBtn) => {
      lBtn.addEventListener("click", () => {
        renderSelectedApp(activeApp);
      });
    });

    // Package Download Trigger
    function triggerPackageDownload() {
      if (appPromoStageEl) appPromoStageEl.classList.add("is-downloading");
      if (dlFillEl) dlFillEl.style.transform = "scaleX(1)";
      if (dlFillSubEl) dlFillSubEl.style.transform = "scaleX(1)";

      activeApp.downloads += 1;
      if (dlCountLabelEl) dlCountLabelEl.textContent = activeApp.downloads.toLocaleString("en-US");

      const manifest = [
        "BIGFATHER // RESOURCES & APP CATALOG",
        "=====================================",
        `App: ${activeApp.name}`,
        `Package: ${activeApp.file}`,
        `Version: ${activeApp.version}`,
        `Category: ${activeApp.categoryPath}`,
        `Platform: ${activeApp.os}`,
        `Size: ${activeApp.size}`,
        "Checksum: SHA256-BF-994A-CYBER-GOLD",
      ].join("\n");

      const manifestName = `${activeApp.file.replace(/\.[^.]+$/, "")}-manifest.txt`;
      const blob = new Blob([manifest], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = manifestName;
      a.click();
      URL.revokeObjectURL(url);

      showToast(
        currentLang === "th"
          ? `กำลังดาวน์โหลดข้อมูลแพ็กเกจ ${manifestName}`
          : `Downloading manifest ${manifestName}`
      );

      setTimeout(() => {
        if (appPromoStageEl) appPromoStageEl.classList.remove("is-downloading");
      }, 900);
    }

    if (downloadNowBtn) downloadNowBtn.addEventListener("click", triggerPackageDownload);
    if (downloadQuickBtn) downloadQuickBtn.addEventListener("click", triggerPackageDownload);
    if (getAssetsBtn) getAssetsBtn.addEventListener("click", triggerPackageDownload);

    // Initial render
    setStageFocus("overview");
    renderSelectedApp(activeApp);
  }

  // ========================================================================
  // PAGE: CONTACT (3D Holo Beacon Hub, Contact Info, Clean Form)
  // ========================================================================
  if (pageKey === "contact") {
    const hubCanvas = document.getElementById("holoBeaconCanvas");
    const hubCard = document.getElementById("contactHubCard");
    const networkCol = document.getElementById("contactNetworkCol");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pulseEnergy = 0;
    let ringWave = -1;

    function syncContactCanvas(canvas, fallbackW, fallbackH) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || fallbackW;
      const h = canvas.clientHeight || fallbackH;
      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, w, h };
    }

    // ----------------------------------------------------------------------
    // 1. Left Panel: 3D Holographic Cube + Golden Core Orb + Projector Pad
    // ----------------------------------------------------------------------
    let hubDragX = 0;
    let hubDragY = 0;
    let isHubDragging = false;
    let lastHubX = 0;
    let lastHubY = 0;

    if (hubCanvas) {
      hubCanvas.addEventListener("pointerdown", (e) => {
        isHubDragging = true;
        lastHubX = e.clientX;
        lastHubY = e.clientY;
        hubCanvas.setPointerCapture(e.pointerId);
      });
      hubCanvas.addEventListener("pointermove", (e) => {
        if (!isHubDragging) return;
        const dx = e.clientX - lastHubX;
        const dy = e.clientY - lastHubY;
        lastHubX = e.clientX;
        lastHubY = e.clientY;
        hubDragY += dx * 0.01;
        hubDragX = Math.max(-0.85, Math.min(0.85, hubDragX + dy * 0.01));
      });
      const stopHubDrag = () => { isHubDragging = false; };
      hubCanvas.addEventListener("pointerup", stopHubDrag);
      hubCanvas.addEventListener("pointercancel", stopHubDrag);
    }

    const holoVerts = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
    ];
    const holoEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];
    const coreParticles = Array.from({ length: 34 }, (_, i) => ({
      theta: (i / 34) * Math.PI * 2,
      phi: ((i * 1.618) % 1) * Math.PI - Math.PI * 0.5,
      rad: 0.24 + (i % 5) * 0.08,
      speed: 0.55 + (i % 4) * 0.25,
      size: 1.1 + (i % 3) * 0.65,
    }));

    function rot3D([x, y, z], rx, ry) {
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx;
      return [x1, y2, z2];
    }

    function proj3D([x, y, z], cx, cy, scale) {
      const p = scale / (5.6 + z);
      return [cx + x * p, cy + y * p, z];
    }

    function drawHoloBeacon(timeSec) {
      if (!hubCanvas) return;
      const { ctx, w, h } = syncContactCanvas(hubCanvas, 340, 270);
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const padY = h * 0.82;
      const cubeY = h * 0.42 + Math.sin(timeSec * 1.7) * 4;
      const scale = Math.min(w, h) * 0.86;

      // Subtle micro-HUD headers & telemetry flanking lines
      ctx.font = '700 8px "JetBrains Mono", monospace';
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(253, 224, 71, 0.72)";
      ctx.fillText("COMMUNICATION HUB", 8, 6);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(229, 231, 235, 0.5)";
      ctx.fillText("LINK // LIVE", w - 8, 6);

      // Left & right micro-telemetry ticks flanking the cube
      ctx.fillStyle = "rgba(253, 224, 71, 0.26)";
      for (let i = 0; i < 6; i++) {
        const ty = h * 0.24 + i * 13;
        const lw = 14 + ((i * 11) % 18);
        ctx.fillRect(10, ty, lw, 2.2);
        ctx.fillRect(w - 10 - lw, ty + 5, lw, 2.2);
      }

      // Floor Emitter Glow & Volumetric Light Cone
      const floorGlow = ctx.createRadialGradient(cx, padY, 4, cx, padY, w * 0.34);
      floorGlow.addColorStop(0, `rgba(254, 240, 138, ${0.46 + pulseEnergy * 0.28})`);
      floorGlow.addColorStop(0.45, `rgba(250, 204, 21, ${0.18 + pulseEnergy * 0.14})`);
      floorGlow.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = floorGlow;
      ctx.beginPath();
      ctx.ellipse(cx, padY, w * 0.34, h * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();

      const coneGrad = ctx.createLinearGradient(cx, padY, cx, cubeY - scale * 0.26);
      coneGrad.addColorStop(0, `rgba(254, 240, 138, ${0.28 + pulseEnergy * 0.22})`);
      coneGrad.addColorStop(0.55, `rgba(250, 204, 21, ${0.1 + pulseEnergy * 0.1})`);
      coneGrad.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 42, padY);
      ctx.lineTo(cx + 42, padY);
      ctx.lineTo(cx + scale * 0.26, cubeY - scale * 0.22);
      ctx.lineTo(cx - scale * 0.26, cubeY - scale * 0.22);
      ctx.closePath();
      ctx.fill();

      // Concentric Golden Pedestal Rings
      ctx.save();
      ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, padY, 74, 17, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = "#fde047";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(cx, padY, 52, 12, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "rgba(254, 240, 138, 0.36)";
      ctx.strokeStyle = "#fef08a";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, padY, 28, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rising signal pulse ring when triggered
      if (ringWave >= 0) {
        const ry = padY - ringWave * (padY - cubeY + 24);
        const rr = 34 + ringWave * 38;
        ctx.strokeStyle = `rgba(254, 240, 138, ${(1 - ringWave).toFixed(2)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, ry, rr, rr * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Inner Glowing Golden Core Orb
      const orbR = scale * (0.14 + pulseEnergy * 0.04);
      const orbGlow = ctx.createRadialGradient(cx, cubeY, 1, cx, cubeY, orbR * 2.2);
      orbGlow.addColorStop(0, "rgba(255, 252, 230, 0.98)");
      orbGlow.addColorStop(0.28, `rgba(253, 224, 71, ${0.78 + pulseEnergy * 0.2})`);
      orbGlow.addColorStop(0.65, "rgba(250, 204, 21, 0.22)");
      orbGlow.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = orbGlow;
      ctx.beginPath();
      ctx.arc(cx, cubeY, orbR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Rotating 3D Wireframe Cube + Swirling Core Particles
      const rx = 0.44 + Math.sin(timeSec * 0.6) * 0.08 + hubDragX;
      const ry = timeSec * 0.48 + hubDragY + pulseEnergy * 1.4;
      const projVerts = holoVerts.map((v) => proj3D(rot3D(v, rx, ry), cx, cubeY, scale));

      // Orbiting 3D particles inside the cube
      coreParticles.forEach((p) => {
        const a = p.theta + timeSec * p.speed;
        const px = Math.cos(a) * Math.cos(p.phi) * p.rad;
        const py = Math.sin(p.phi) * p.rad;
        const pz = Math.sin(a) * Math.cos(p.phi) * p.rad;
        const pt = proj3D(rot3D([px, py, pz], rx, ry), cx, cubeY, scale);
        const alpha = Math.max(0.3, Math.min(1, 0.72 - pt[2] * 0.35 + pulseEnergy * 0.3));
        ctx.fillStyle = `rgba(254, 240, 138, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cube wireframe edges (depth-shaded)
      ctx.save();
      ctx.shadowColor = "rgba(250, 204, 21, 0.72)";
      ctx.shadowBlur = 7;
      holoEdges.forEach(([a, b]) => {
        const pa = projVerts[a];
        const pb = projVerts[b];
        const avgZ = (pa[2] + pb[2]) * 0.5;
        const alpha = Math.max(0.32, Math.min(0.98, 0.75 - avgZ * 0.28 + pulseEnergy * 0.25));
        ctx.strokeStyle = `rgba(254, 240, 138, ${alpha.toFixed(2)})`;
        ctx.lineWidth = avgZ < 0 ? 1.55 : 1.05;
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.stroke();
      });
      ctx.restore();

      // Subtle wireframe cross-lattice + corner node dots
      ctx.strokeStyle = "rgba(250, 204, 21, 0.22)";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2.5, 3.5]);
      [
        [0, 2], [1, 3], [4, 6], [5, 7],
      ].forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(projVerts[a][0], projVerts[a][1]);
        ctx.lineTo(projVerts[b][0], projVerts[b][1]);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      projVerts.forEach((pt) => {
        ctx.fillStyle = pt[2] < 0 ? "#fef9c3" : "rgba(253, 224, 71, 0.65)";
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], pt[2] < 0 ? 2.2 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function triggerSignalBurst() {
      pulseEnergy = 1;
      ringWave = 0;

      if (hubCard) hubCard.classList.add("is-pulsing");
      if (networkCol) networkCol.classList.add("is-firing");

      setTimeout(() => {
        if (hubCard) hubCard.classList.remove("is-pulsing");
        if (networkCol) networkCol.classList.remove("is-firing");
      }, 950);
    }

    function renderContactFrame(nowMs) {
      const timeSec = nowMs * 0.001;
      if (pulseEnergy > 0.004) {
        pulseEnergy *= 0.95;
      } else {
        pulseEnergy = 0;
      }
      if (ringWave >= 0) {
        ringWave += 0.026;
        if (ringWave > 1) ringWave = -1;
      }

      drawHoloBeacon(timeSec);

      if (!reducedMotion && !document.hidden) {
        requestAnimationFrame(renderContactFrame);
      }
    }

    requestAnimationFrame(renderContactFrame);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && !reducedMotion) {
        requestAnimationFrame(renderContactFrame);
      }
    });

    const sendSignalBtn = document.getElementById("sendSignalBtn");
    if (sendSignalBtn) {
      sendSignalBtn.addEventListener("click", () => {
        triggerSignalBurst();
        showToast(currentLang === "th" ? "ส่งสัญญาณ Uplink สำเร็จ!" : "Signal uplink pinged!");
      });
    }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        triggerSignalBurst();
        contactForm.reset();
        showToast(
          currentLang === "th"
            ? "ส่งข้อความเรียบร้อยแล้ว ขอบคุณที่ติดต่อ!"
            : "Message transmitted! Thank you for reaching out."
        );
      });
    }
  }
})();
