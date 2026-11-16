(() => {
  const CARD_DATA = [
    {
      key: "profile",
      index: "01",
      title: "Profile",
      desc: "ข้อมูลตัวตน แนวคิดการทำงาน และเบื้องหลังการสร้างสรรค์ผลงาน",
    },
    {
      key: "product",
      index: "02",
      title: "Product",
      desc: "รวมผลิตภัณฑ์ โซลูชัน และงานออกแบบที่พัฒนาอย่างพิถีพิถัน",
    },
    {
      key: "test",
      index: "03",
      title: "Test",
      desc: "ห้องทดลอง ทดสอบประสิทธิภาพ และตรวจสอบมาตรฐานระบบแบบเรียลไทม์",
    },
    {
      key: "download",
      index: "04",
      title: "Download",
      desc: "ดาวน์โหลดไฟล์ติดตั้ง เอกสารคู่มือ และแพ็กเกจเวอร์ชันล่าสุด",
    },
    {
      key: "contact",
      index: "05",
      title: "Contact",
      desc: "ช่องทางติดต่อ สอบถามข้อมูล นัดหมาย และเริ่มต้นโปรเจกต์ร่วมกัน",
    },
  ];

  const scrollTrack = document.getElementById("scrollTrack");
  const handViewport = document.querySelector(".hand-viewport");
  const cards = Array.from(document.querySelectorAll(".playing-card"));
  const pills = Array.from(document.querySelectorAll(".pill"));
  const tunnelCanvas = document.getElementById("tunnelCanvas");
  const progressFill = document.getElementById("progressFill");
  const activeCounter = document.getElementById("activeCounter");
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
  let lastClosestIndex = -1;
  let toastTimer = null;

  // --- Unified Single-Image Smooth Tunnel Background Engine ---
  const ctx = tunnelCanvas ? tunnelCanvas.getContext("2d", { alpha: false }) : null;
  const bgImg = new Image();
  let imgReady = false;
  let canvasW = 0;
  let canvasH = 0;
  let canvasDpr = 1;
  let needsCanvasResize = true;

  // Deterministic radial data sparks that glide smoothly outward along the corridor walls
  const TUNNEL_SPARKS = Array.from({ length: 18 }, (_, idx) => {
    const angle = ((idx * 137.5) % 360) * (Math.PI / 180);
    return {
      phase: idx / 18,
      cos: Math.cos(angle),
      sin: Math.sin(angle),
      size: idx % 3 === 0 ? 3 : 2,
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

  function updateHeaderAndPills(closestIdx) {
    if (closestIdx === lastClosestIndex) return;
    lastClosestIndex = closestIdx;

    const item = CARD_DATA[closestIdx];
    activeCounter.textContent = `${item.index} / 0${CARD_COUNT}`;

    pills.forEach((pill, i) => {
      const isActive = i === closestIdx;
      pill.classList.toggle("is-active", isActive);
      pill.setAttribute("aria-selected", String(isActive));
    });

    cards.forEach((card, i) => {
      card.classList.toggle("is-active", i === closestIdx);
    });
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

    // Subtle radial data sparks gliding smoothly forward (no hard top/bottom rectangle lines)
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const maxRadius = Math.hypot(canvasW, canvasH) * 0.58;
    for (let i = 0; i < TUNNEL_SPARKS.length; i++) {
      const s = TUNNEL_SPARKS[i];
      const sp = (s.phase + tunnelClock * 1.8) % 1;
      const dist = 16 + Math.pow(sp, 2.1) * maxRadius;
      const sOp = smoothstep(0.05, 0.28, sp) * (1 - smoothstep(0.76, 1.0, sp)) * 0.42;
      if (sOp <= 0.01) continue;

      const sx = cx + s.cos * dist;
      const sy = cy + s.sin * dist;
      const len = s.size + sp * 10;
      ctx.strokeStyle = `rgba(125, 243, 255, ${sOp.toFixed(3)})`;
      ctx.lineWidth = s.size * 0.75;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + s.cos * len, sy + s.sin * len);
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

    requestAnimationFrame(tick);
  }

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
      if (index !== lastClosestIndex) {
        scrollToCardIndex(index);
      } else {
        card.classList.remove("is-selected");
        void card.offsetWidth;
        card.classList.add("is-selected");
        const item = CARD_DATA[index];
        showToast(`เลือกการ์ด ${item.index}: ${item.title}`);
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

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
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

  // Horizontal-only touch swipe support (never fights native vertical scroll)
  let touchStartX = null;
  let touchStartY = null;
  let touchStartScroll = 0;
  let swipeLocked = false;

  handViewport.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
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
      const nextTop = touchStartScroll + dx * sensitivity;
      const maxScroll = getMaxScroll();

      if (nextTop >= maxScroll - 3) {
        window.scrollTo({ top: 4, behavior: "instant" });
        touchStartScroll = 4 - dx * sensitivity;
        currentProgress -= 1;
        lastRenderedProgress -= 1;
      } else if (nextTop <= 2 && dx < 0) {
        window.scrollTo({ top: maxScroll - 6, behavior: "instant" });
        touchStartScroll = maxScroll - 6 - dx * sensitivity;
        currentProgress += 1;
        lastRenderedProgress += 1;
      } else {
        window.scrollTo({
          top: clamp(nextTop, 0, maxScroll),
          behavior: "auto",
        });
      }
    },
    { passive: true }
  );

  handViewport.addEventListener(
    "touchend",
    () => {
      touchStartX = null;
      touchStartY = null;
      swipeLocked = false;
    },
    { passive: true }
  );

  // Initialize
  if (bgImg.complete && bgImg.naturalWidth) imgReady = true;
  syncCanvasSize();
  readScrollProgress();
  currentProgress = targetProgress;
  renderHand(currentProgress);
  lastRenderedProgress = currentProgress;
  forceHandRender = false;
  requestAnimationFrame(tick);
})();
