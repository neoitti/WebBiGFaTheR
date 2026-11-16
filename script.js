(() => {
  const CARD_DATA = [
    {
      key: "profile",
      index: "01",
      title: "Profile",
      desc: {
        th: "ทำความรู้จักตัวตน วิสัยทัศน์ และผลงาน",
        en: "Explore identity, vision, and creative works",
      },
    },
    {
      key: "product",
      index: "02",
      title: "Product",
      desc: {
        th: "รวมผลิตภัณฑ์และงานออกแบบคุณภาพสูง",
        en: "Curated products and crafted solutions",
      },
    },
    {
      key: "test",
      index: "03",
      title: "Test",
      desc: {
        th: "ทดสอบประสิทธิภาพและมาตรฐานระบบจริง",
        en: "Benchmark performance and system quality",
      },
    },
    {
      key: "download",
      index: "04",
      title: "Download",
      desc: {
        th: "ดาวน์โหลดไฟล์ติดตั้งและคู่มือล่าสุด",
        en: "Get installers, guides, and latest releases",
      },
    },
    {
      key: "contact",
      index: "05",
      title: "Contact",
      desc: {
        th: "ติดต่อสอบถาม นัดหมาย และร่วมงานกับเรา",
        en: "Reach out, schedule, or start a project",
      },
    },
  ];

  const UI_COPY = {
    th: {
      statusLabel: "กำลังดู",
      scrollHint: "เลื่อน Scroll หรือลากเมาส์เพื่อสลับไพ่ในมือ",
      openAction: "เปิดเมนู",
      focusAction: "ดูการ์ด",
      selectAria: (item) => `เลือกการ์ด ${item.index}: ${item.title}`,
      toastSelected: (item) => `เลือกการ์ด ${item.index}: ${item.title}`,
    },
    en: {
      statusLabel: "ACTIVE CARD",
      scrollHint: "Scroll or drag to cycle cards in your hand",
      openAction: "OPEN MENU",
      focusAction: "FOCUS",
      selectAria: (item) => `Select card ${item.index}: ${item.title}`,
      toastSelected: (item) => `Selected card ${item.index}: ${item.title}`,
    },
  };

  const scrollTrack = document.getElementById("scrollTrack");
  const handViewport = document.querySelector(".hand-viewport");
  const handPivot = document.getElementById("handPivot");
  const cards = Array.from(document.querySelectorAll(".playing-card"));
  const pills = Array.from(document.querySelectorAll(".pill"));
  const langButtons = Array.from(document.querySelectorAll(".lang-btn"));
  const tunnelCanvas = document.getElementById("tunnelCanvas");
  const progressFill = document.getElementById("progressFill");
  const statusLabel = document.getElementById("statusLabel");
  const activeCounter = document.getElementById("activeCounter");
  const scrollHintText = document.getElementById("scrollHintText");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const selectionToast = document.getElementById("selectionToast");

  const CARD_COUNT = cards.length;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchOnly = window.matchMedia("(hover: none)").matches;

  let targetProgress = 0;
  let currentProgress = 0;
  let lastRenderedProgress = -1;
  let forceHandRender = true;
  let targetBgX = 0;
  let targetBgY = 0;
  let currentBgX = 0;
  let currentBgY = 0;
  let tunnelClock = 0;
  let lastFrameTime = performance.now();
  let rafId = null;
  let lastClosestIndex = -1;
  let currentLang = "th";
  try {
    const saved = localStorage.getItem("bigfather_lang");
    if (saved === "en" || saved === "th") currentLang = saved;
  } catch (_) {}
  let toastTimer = null;
  let snapTimer = null;
  let ignoreSnapUntil = 0;
  let isPointerDown = false;
  let suppressCardClick = false;

  // --- Unified Single-Image Smooth Tunnel Background Engine ---
  const ctx = tunnelCanvas ? tunnelCanvas.getContext("2d", { alpha: false }) : null;
  const bgImg = new Image();
  let imgReady = false;
  let canvasW = 0;
  let canvasH = 0;
  let canvasDpr = 1;
  let needsCanvasResize = true;

  // Deterministic short radial cyan/blue sparks streaming from back portal to front
  const STREAK_COUNT = isTouchOnly ? 45 : 80;
  const TUNNEL_SPARKS = Array.from({ length: STREAK_COUNT }, (_, idx) => {
    const angle = ((idx * 137.508) % 360) * (Math.PI / 180);
    return {
      phase: idx / STREAK_COUNT,
      cos: Math.cos(angle),
      sin: Math.sin(angle),
      speed: 0.78 + ((idx * 37) % 10) * 0.08,
      size: idx % 3 === 0 ? 3 : 2,
      hue: idx % 3 === 0 ? "56, 226, 255" : idx % 3 === 1 ? "34, 211, 238" : "96, 195, 255",
    };
  });

  bgImg.onload = () => {
    imgReady = true;
  };
  bgImg.src = "images/bg-tunnel.jpg";

  function syncCanvasSize() {
    if (!tunnelCanvas || !ctx) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Use 0.78x internal canvas resolution on mobile/touch for silky 60fps fill rate
    canvasDpr = isTouchOnly ? 0.78 : vw <= 768 ? 0.9 : Math.min(window.devicePixelRatio || 1, 1.5);
    canvasW = vw;
    canvasH = vh;
    tunnelCanvas.width = Math.max(1, Math.round(vw * canvasDpr));
    tunnelCanvas.height = Math.max(1, Math.round(vh * canvasDpr));
    ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
    needsCanvasResize = false;
  }

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function getMaxScroll() {
    return Math.max(1, scrollTrack.offsetHeight - window.innerHeight);
  }

  function readScrollProgress() {
    const maxScroll = getMaxScroll();
    let scrollTop = window.scrollY || window.pageYOffset || 0;

    // Infinite scroll loop: when scrolled all the way to the end (5.0 == 0.0),
    // seamlessly wrap back to the top without any visual jump
    if (scrollTop >= maxScroll - 3) {
      const wrapTop = 4;
      window.scrollTo({ top: wrapTop, behavior: "instant" });
      scrollTop = wrapTop;
      currentProgress -= 1;
      lastRenderedProgress -= 1;
    }

    targetProgress = clamp(scrollTop / maxScroll, 0, 1);
  }

  function scrollToStep(stepDelta) {
    const maxScroll = getMaxScroll();
    const currentStep = Math.round(currentProgress * CARD_COUNT);
    let desiredStep = currentStep + stepDelta;

    if (desiredStep < 0) {
      const wrapTop = maxScroll - 6;
      window.scrollTo({ top: wrapTop, behavior: "instant" });
      currentProgress += 1;
      lastRenderedProgress += 1;
      desiredStep += CARD_COUNT;
    } else if (desiredStep > CARD_COUNT) {
      const wrapTop = 4;
      window.scrollTo({ top: wrapTop, behavior: "instant" });
      currentProgress -= 1;
      lastRenderedProgress -= 1;
      desiredStep -= CARD_COUNT;
    }

    const targetY = clamp((desiredStep / CARD_COUNT) * maxScroll, 0, maxScroll);
    ignoreSnapUntil = Date.now() + 600;
    clearTimeout(snapTimer);
    window.scrollTo({
      top: targetY,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  function scrollToCardIndex(targetIndex) {
    const safeIdx = ((targetIndex % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
    const currentStep = ((Math.round(currentProgress * CARD_COUNT) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;

    let delta = safeIdx - currentStep;
    if (delta > CARD_COUNT / 2) delta -= CARD_COUNT;
    if (delta < -CARD_COUNT / 2) delta += CARD_COUNT;

    if (delta === 0) return;
    scrollToStep(delta);
  }

  function showToast(message) {
    selectionToast.textContent = message;
    selectionToast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      selectionToast.classList.remove("is-visible");
    }, 2200);
  }

  function applyLanguage(lang) {
    currentLang = lang === "en" ? "en" : "th";
    document.documentElement.lang = currentLang;

    try {
      localStorage.setItem("bigfather_lang", currentLang);
    } catch (_) {}

    const copy = UI_COPY[currentLang];
    if (statusLabel) statusLabel.textContent = copy.statusLabel;
    if (scrollHintText) scrollHintText.textContent = copy.scrollHint;

    langButtons.forEach((btn) => {
      const isActive = btn.dataset.lang === currentLang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    cards.forEach((card, i) => {
      const item = CARD_DATA[i];
      const descEl = card.querySelector(".card-desc");
      if (descEl && item) {
        descEl.textContent = item.desc[currentLang];
      }
      const hitbox = card.querySelector(".card-hitbox");
      if (hitbox && item) {
        hitbox.setAttribute("aria-label", copy.selectAria(item));
      }
      const actionEl = card.querySelector(".card-action");
      if (actionEl) {
        actionEl.textContent = i === lastClosestIndex ? copy.openAction : copy.focusAction;
      }
    });
  }

  function updateHeaderAndPills(closestIdx) {
    if (closestIdx === lastClosestIndex) return;
    lastClosestIndex = closestIdx;

    const item = CARD_DATA[closestIdx];
    const copy = UI_COPY[currentLang];
    activeCounter.textContent = `${item.index} / 0${CARD_COUNT}`;

    pills.forEach((pill, i) => {
      const isActive = i === closestIdx;
      pill.classList.toggle("is-active", isActive);
      pill.setAttribute("aria-pressed", String(isActive));
    });

    cards.forEach((card, i) => {
      const isCardActive = i === closestIdx;
      card.classList.toggle("is-active", isCardActive);
      const actionEl = card.querySelector(".card-action");
      if (actionEl) {
        actionEl.textContent = isCardActive ? copy.openAction : copy.focusAction;
      }
    });
  }

  function scheduleGentleSnap() {
    clearTimeout(snapTimer);
    if (Date.now() < ignoreSnapUntil || isPointerDown) return;

    snapTimer = setTimeout(() => {
      if (isPointerDown || Date.now() < ignoreSnapUntil) return;
      const maxScroll = getMaxScroll();
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const exactStep = (scrollTop / maxScroll) * CARD_COUNT;
      const nearestStep = Math.round(exactStep);
      if (Math.abs(exactStep - nearestStep) < 0.03) return;

      ignoreSnapUntil = Date.now() + 500;
      const snapY = clamp((nearestStep / CARD_COUNT) * maxScroll, 0, maxScroll);
      window.scrollTo({
        top: snapY,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }, 190);
  }

  function renderTunnelCanvas(dt) {
    if (reducedMotion || !ctx || !imgReady || !bgImg.naturalWidth) return;
    if (needsCanvasResize) syncCanvasSize();

    // Steady constant pace completely independent of scroll
    tunnelClock = (tunnelClock + dt * 0.085) % 1000;

    const imgW = bgImg.naturalWidth;
    const imgH = bgImg.naturalHeight;
    const coverScale = Math.max(canvasW / imgW, canvasH / imgH);

    // Smooth single-image breathing zoom & gentle camera float (1.08x overscan prevents top/bottom edge reveal)
    const breath = 0.5 - 0.5 * Math.cos(tunnelClock * Math.PI * 2);
    const scale = coverScale * (1.08 + 0.1 * breath);
    const swayX = Math.sin(tunnelClock * Math.PI * 2) * (canvasW * 0.01);
    const swayY = Math.sin(tunnelClock * Math.PI * 4) * (canvasH * 0.006);
    const rot = Math.sin(tunnelClock * Math.PI * 2) * 0.006;

    const cx = canvasW * 0.5 + swayX + currentBgX * 0.45;
    const cy = canvasH * 0.5 + swayY + currentBgY * 0.45;
    const dw = imgW * scale;
    const dh = imgH * scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.drawImage(bgImg, -dw * 0.5, -dh * 0.5, dw, dh);
    ctx.restore();

    // Glowing cyan/blue light beams streaming from the back portal toward the viewer
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    // Soft pulsing cyan aura at the deep portal center
    const pulse = 0.5 + 0.5 * Math.sin(tunnelClock * Math.PI * 6);
    const coreR = Math.min(canvasW, canvasH) * (0.24 + 0.05 * pulse);
    const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, coreR);
    coreGrad.addColorStop(0, `rgba(125, 243, 255, ${(0.24 + 0.1 * pulse).toFixed(3)})`);
    coreGrad.addColorStop(0.45, `rgba(34, 211, 238, ${(0.1 + 0.05 * pulse).toFixed(3)})`);
    coreGrad.addColorStop(1, "rgba(34, 211, 238, 0)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();

    const maxRadius = Math.hypot(canvasW, canvasH) * 0.62;
    for (let i = 0; i < TUNNEL_SPARKS.length; i++) {
      const s = TUNNEL_SPARKS[i];
      const sp = (s.phase + tunnelClock * 2.15 * s.speed) % 1;
      const dist = 12 + Math.pow(sp, 2.45) * maxRadius;
      const sOp = smoothstep(0.03, 0.24, sp) * (1 - smoothstep(0.76, 1.0, sp)) * 0.72;
      if (sOp <= 0.01) continue;

      const len = s.size + sp * 10;
      const sx = cx + s.cos * dist;
      const sy = cy + s.sin * dist;
      const ex = cx + s.cos * (dist + len);
      const ey = cy + s.sin * (dist + len);
      const lw = s.size * (0.65 + sp * 0.45);

      // Short electric-cyan spark trail
      ctx.strokeStyle = `rgba(${s.hue}, ${sOp.toFixed(3)})`;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Bright white-cyan spark head
      const tipX = sx + s.cos * (len * 0.55);
      const tipY = sy + s.sin * (len * 0.55);
      ctx.strokeStyle = `rgba(224, 252, 255, ${(sOp * 0.85).toFixed(3)})`;
      ctx.lineWidth = Math.max(0.9, lw * 0.52);
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    ctx.restore();
  }

  function renderHand(progress) {
    const wrappedProgress = ((progress % 1) + 1) % 1;
    progressFill.style.transform = `scaleX(${wrappedProgress.toFixed(4)})`;

    // Full 5-card cycle: 0..5 where 5 wraps seamlessly back to 0 (Profile)
    const activePos = progress * CARD_COUNT;
    const closestIdx = ((Math.round(activePos) % CARD_COUNT) + CARD_COUNT) % CARD_COUNT;
    updateHeaderAndPills(closestIdx);

    const cardWidth = cards[0] ? cards[0].offsetWidth : 240;
    const viewportW = window.innerWidth;
    const isNarrow = viewportW < 640;
    const maxRot = isNarrow ? 11 : 22;
    const maxRy = isNarrow ? 0 : 10;
    // Bound horizontal spread by viewport half-width so outer fanned cards never clip at edges
    const maxSafeSpread = Math.max(48, (viewportW * 0.5 - 16 - cardWidth * 0.56) / 0.946);
    const spread = clamp(maxSafeSpread, 48, cardWidth * 1.18);

    cards.forEach((card, i) => {
      let offset = i - activePos;
      offset =
        ((((offset % CARD_COUNT) + CARD_COUNT + CARD_COUNT / 2) % CARD_COUNT) -
          CARD_COUNT / 2);

      const theta = (offset / CARD_COUNT) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const depth = (cosT + 1) * 0.5;

      const fanCurve = 0.72 * Math.sin(theta) - 0.55 * Math.sin(2 * theta);

      const tx = fanCurve * spread;
      const ty = 26 * (1 - cosT) - 22 * Math.pow(Math.max(0, cosT), 3);
      const rot = fanCurve * maxRot;
      const ry = -fanCurve * maxRy;
      const scale = 0.76 + 0.28 * Math.pow(depth, 1.35);
      const zIndex = Math.round(depth * 100);
      const dim = (1 - Math.pow(depth, 0.85)) * 0.34;
      const activeStrength = Math.pow(clamp(1 - Math.abs(offset) * 1.35, 0, 1), 1.5);

      card.style.setProperty("--tx", `${tx.toFixed(2)}px`);
      card.style.setProperty("--ty", `${ty.toFixed(2)}px`);
      card.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
      card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      card.style.setProperty("--scale", scale.toFixed(4));
      card.style.setProperty("--z", String(zIndex));
      card.style.setProperty("--dim", dim.toFixed(3));
      card.style.setProperty("--active-strength", activeStrength.toFixed(3));
    });
  }

  function tick(now) {
    if (document.hidden) {
      rafId = null;
      return;
    }

    const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
    lastFrameTime = now;

    readScrollProgress();

    if (reducedMotion) {
      currentProgress = targetProgress;
    } else {
      const diff = targetProgress - currentProgress;
      const lerpFactor = isTouchOnly ? 0.45 : 0.16;
      if (Math.abs(diff) < 0.0002) {
        currentProgress = targetProgress;
      } else {
        currentProgress += diff * lerpFactor;
      }
      if (!isTouchOnly) {
        currentBgX += (targetBgX - currentBgX) * 0.08;
        currentBgY += (targetBgY - currentBgY) * 0.08;
      }
    }

    renderTunnelCanvas(dt);

    if (forceHandRender || Math.abs(currentProgress - lastRenderedProgress) > 0.00005) {
      renderHand(currentProgress);
      lastRenderedProgress = currentProgress;
      forceHandRender = false;
    }

    rafId = requestAnimationFrame(tick);
  }

  // Pause animation loop when tab is hidden to save battery & CPU
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (rafId === null) {
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  });

  window.addEventListener(
    "resize",
    () => {
      needsCanvasResize = true;
      forceHandRender = true;
      readScrollProgress();
    },
    { passive: true }
  );

  // Allow seamless reverse loop when scrolling UP past the very top
  window.addEventListener(
    "wheel",
    (e) => {
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      if (scrollTop <= 3 && e.deltaY < 0) {
        const maxScroll = getMaxScroll();
        const wrapTop = maxScroll - 6;
        window.scrollTo({ top: wrapTop, behavior: "instant" });
        currentProgress += 1;
        lastRenderedProgress += 1;
      }
    },
    { passive: true }
  );

  // Subtle Pointer Parallax on Desktop Mouse Only
  if (!isTouchOnly) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (reducedMotion || e.pointerType !== "mouse") return;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        targetBgX = -nx * 24;
        targetBgY = -ny * 14;
      },
      { passive: true }
    );
  }

  function enhanceCardEffects(card) {
    const cardInner = card.querySelector(".card-inner");
    if (cardInner) {
      const dimOverlay = document.createElement("div");
      dimOverlay.className = "card-dim";
      dimOverlay.setAttribute("aria-hidden", "true");
      cardInner.appendChild(dimOverlay);
    }

    if (isTouchOnly) return;

    const rimBeam = document.createElement("div");
    rimBeam.className = "card-rim-beam";
    rimBeam.setAttribute("aria-hidden", "true");
    card.prepend(rimBeam);

    if (cardInner) {
      const holo = document.createElement("div");
      holo.className = "card-holo";
      holo.setAttribute("aria-hidden", "true");
      cardInner.prepend(holo);
    }

    const cardArt = card.querySelector(".card-art");
    if (cardArt) {
      const corners = document.createElement("div");
      corners.className = "art-corners";
      corners.setAttribute("aria-hidden", "true");
      ["tl", "tr", "bl", "br"].forEach((pos) => {
        const bracket = document.createElement("span");
        bracket.className = `art-bracket ${pos}`;
        corners.appendChild(bracket);
      });
      cardArt.appendChild(corners);
    }
  }

  // Card Hover Spectacle & Click Handling
  cards.forEach((card, index) => {
    enhanceCardEffects(card);

    card.addEventListener("click", () => {
      if (suppressCardClick) return;
      if (index !== lastClosestIndex) {
        scrollToCardIndex(index);
      } else {
        card.classList.remove("is-selected");
        void card.offsetWidth;
        card.classList.add("is-selected");
        const item = CARD_DATA[index];
        showToast(UI_COPY[currentLang].toastSelected(item));
      }
    });

    if (!isTouchOnly) {
      card.addEventListener("pointerenter", (e) => {
        if (reducedMotion || e.pointerType !== "mouse") return;
        card.classList.add("is-tilting");
      });

      card.addEventListener("pointermove", (e) => {
        if (reducedMotion || e.pointerType !== "mouse") return;
        const rect = card.getBoundingClientRect();
        const px = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        const py = clamp((e.clientY - rect.top) / rect.height, 0, 1);

        const tiltY = (px - 0.5) * 14;
        const tiltX = (0.5 - py) * 14;
        const imgPx = (0.5 - px) * 16;
        const imgPy = (0.5 - py) * 12;

        card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
        card.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
        card.style.setProperty("--holo-x", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--holo-y", `${(py * 100).toFixed(1)}%`);
        card.style.setProperty("--img-px", `${imgPx.toFixed(2)}px`);
        card.style.setProperty("--img-py", `${imgPy.toFixed(2)}px`);
      });

      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--glare-x", "50%");
        card.style.setProperty("--glare-y", "30%");
        card.style.setProperty("--holo-x", "50%");
        card.style.setProperty("--holo-y", "50%");
        card.style.setProperty("--img-px", "0px");
        card.style.setProperty("--img-py", "0px");
      });
    }
  });

  // Language switcher
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.dataset.lang);
    });
  });

  // Pill navigation
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetIdx = Number(pill.dataset.target);
      scrollToCardIndex(targetIdx);
    });
  });

  // Prev / Next step buttons (loop seamlessly in both directions)
  prevBtn.addEventListener("click", () => {
    scrollToStep(-1);
  });

  nextBtn.addEventListener("click", () => {
    scrollToStep(1);
  });

  // Keyboard arrow navigation
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      scrollToStep(1);
    } else if (e.key === "ArrowLeft") {
      scrollToStep(-1);
    }
  });

  // Shared horizontal slide helper for both Mouse Drag and Touch Swipe
  function applyHorizontalSlideScroll(dx, baseScrollTop, sensitivity) {
    const nextTop = baseScrollTop + dx * sensitivity;
    const maxScroll = getMaxScroll();

    if (nextTop >= maxScroll - 3) {
      window.scrollTo({ top: 4, behavior: "instant" });
      currentProgress -= 1;
      lastRenderedProgress -= 1;
      return 4 - dx * sensitivity;
    }
    if (nextTop <= 2 && dx < 0) {
      window.scrollTo({ top: maxScroll - 6, behavior: "instant" });
      currentProgress += 1;
      lastRenderedProgress += 1;
      return maxScroll - 6 - dx * sensitivity;
    }

    window.scrollTo({
      top: clamp(nextTop, 0, maxScroll),
      behavior: "auto",
    });
    return baseScrollTop;
  }

  // Mouse Drag-to-Slide support on the card hand stage
  let isMouseDown = false;
  let isMouseDragging = false;
  let mouseDragStartX = 0;
  let mouseDragStartScroll = 0;

  handViewport.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    isMouseDown = true;
    isMouseDragging = false;
    suppressCardClick = false;
    isPointerDown = true;
    clearTimeout(snapTimer);
    mouseDragStartX = e.clientX;
    mouseDragStartScroll = window.scrollY || window.pageYOffset || 0;
  });

  window.addEventListener(
    "pointermove",
    (e) => {
      if (!isMouseDown || e.pointerType !== "mouse") return;
      const dx = mouseDragStartX - e.clientX;

      if (!isMouseDragging) {
        if (Math.abs(dx) <= 6) return;
        isMouseDragging = true;
        suppressCardClick = true;
        handViewport.classList.add("is-dragging");
      }

      const sensitivity = getMaxScroll() / (window.innerWidth * 1.1);
      mouseDragStartScroll = applyHorizontalSlideScroll(dx, mouseDragStartScroll, sensitivity);
    },
    { passive: true }
  );

  function endMouseDrag() {
    if (!isMouseDown) return;
    isMouseDown = false;
    isPointerDown = false;

    if (isMouseDragging) {
      isMouseDragging = false;
      handViewport.classList.remove("is-dragging");
      scheduleGentleSnap();
      setTimeout(() => {
        suppressCardClick = false;
      }, 0);
    }
  }

  window.addEventListener("pointerup", endMouseDrag);
  window.addEventListener("pointercancel", endMouseDrag);

  // Horizontal-only touch swipe support (never fights native vertical scroll)
  let touchStartX = null;
  let touchStartY = null;
  let touchStartScroll = 0;
  let swipeLocked = false;

  window.addEventListener("scroll", scheduleGentleSnap, { passive: true });

  handViewport.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      isPointerDown = true;
      clearTimeout(snapTimer);
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartScroll = window.scrollY;
      swipeLocked = false;
    },
    { passive: true }
  );

  handViewport.addEventListener(
    "touchmove",
    (e) => {
      if (touchStartX === null || e.touches.length !== 1) return;
      const dx = touchStartX - e.touches[0].clientX;
      const dy = touchStartY - e.touches[0].clientY;

      if (!swipeLocked) {
        if (Math.abs(dx) > Math.abs(dy) * 1.4 && Math.abs(dx) > 10) {
          swipeLocked = true;
        } else {
          return;
        }
      }

      const sensitivity = getMaxScroll() / (window.innerWidth * 1.4);
      touchStartScroll = applyHorizontalSlideScroll(dx, touchStartScroll, sensitivity);
    },
    { passive: true }
  );

  handViewport.addEventListener(
    "touchend",
    () => {
      isPointerDown = false;
      touchStartX = null;
      touchStartY = null;
      swipeLocked = false;
      scheduleGentleSnap();
    },
    { passive: true }
  );

  // Initialize (with smooth first-load card deal spread)
  applyLanguage(currentLang);
  if (bgImg.complete && bgImg.naturalWidth) imgReady = true;
  syncCanvasSize();
  readScrollProgress();
  currentProgress = targetProgress;
  lastRenderedProgress = currentProgress;
  forceHandRender = false;

  if (!reducedMotion && handPivot) {
    handPivot.classList.add("is-dealing");
    cards.forEach((card) => {
      card.style.setProperty("--tx", "0px");
      card.style.setProperty("--ty", "26px");
      card.style.setProperty("--rot", "0deg");
      card.style.setProperty("--scale", "0.86");
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        renderHand(currentProgress);
      });
    });
    setTimeout(() => {
      handPivot.classList.remove("is-dealing");
    }, 720);
  } else {
    renderHand(currentProgress);
  }

  if (!document.hidden) {
    rafId = requestAnimationFrame(tick);
  }
})();
