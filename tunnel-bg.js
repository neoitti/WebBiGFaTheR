(() => {
  const DEFAULT_IMAGE_SRC = "images/bg-tunnel.jpg";

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function smoothstep(edge0, edge1, x) {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /**
   * Shared GPU-balanced deep-sinking cyan tunnel background engine.
   * Identical pacing, single-image overscan breathing, and radial cyan sparks across all pages.
   */
  function createTunnelEngine(options = {}) {
    const canvas = document.getElementById(options.canvasId || "tunnelCanvas");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchOnly = window.matchMedia("(hover: none)").matches;
    const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;

    const bgImg = new Image();
    let imgReady = false;
    let canvasW = 0;
    let canvasH = 0;
    let canvasDpr = 1;
    let needsCanvasResize = true;
    let tunnelClock = 0;

    let targetBgX = 0;
    let targetBgY = 0;
    let currentBgX = 0;
    let currentBgY = 0;

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
    bgImg.src = options.imageSrc || DEFAULT_IMAGE_SRC;
    if (bgImg.complete && bgImg.naturalWidth) imgReady = true;

    function syncSize() {
      if (!canvas || !ctx) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvasDpr = isTouchOnly ? 0.78 : vw <= 768 ? 0.9 : Math.min(window.devicePixelRatio || 1, 1.5);
      canvasW = vw;
      canvasH = vh;
      canvas.width = Math.max(1, Math.round(vw * canvasDpr));
      canvas.height = Math.max(1, Math.round(vh * canvasDpr));
      ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
      needsCanvasResize = false;
    }

    function markResize() {
      needsCanvasResize = true;
    }

    if (!isTouchOnly && options.enableParallax !== false) {
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

    function render(dt) {
      if (reducedMotion || !ctx || !imgReady || !bgImg.naturalWidth) return;
      if (needsCanvasResize) syncSize();

      if (!isTouchOnly) {
        currentBgX += (targetBgX - currentBgX) * 0.08;
        currentBgY += (targetBgY - currentBgY) * 0.08;
      }

      // Steady constant pace completely independent of scroll
      tunnelClock = (tunnelClock + dt * 0.085) % 1000;

      const imgW = bgImg.naturalWidth;
      const imgH = bgImg.naturalHeight;
      const coverScale = Math.max(canvasW / imgW, canvasH / imgH);

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

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

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

        ctx.strokeStyle = `rgba(${s.hue}, ${sOp.toFixed(3)})`;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

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

    syncSize();
    return {
      render,
      syncSize,
      markResize,
      reducedMotion,
      isTouchOnly,
    };
  }

  /**
   * Standalone loop helper for subpages that do not have a card-hand animation loop.
   */
  function startStandaloneLoop(options = {}) {
    const engine = createTunnelEngine(options);
    let lastFrameTime = performance.now();
    let rafId = null;

    function loop(now) {
      if (document.hidden) {
        rafId = null;
        return;
      }
      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;
      engine.render(dt);
      rafId = requestAnimationFrame(loop);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (rafId === null && !engine.reducedMotion) {
        lastFrameTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    });

    window.addEventListener(
      "resize",
      () => {
        engine.markResize();
      },
      { passive: true }
    );

    if (!document.hidden && !engine.reducedMotion) {
      rafId = requestAnimationFrame(loop);
    }

    return engine;
  }

  window.BigFatherTunnel = {
    createEngine: createTunnelEngine,
    startStandaloneLoop,
  };
})();
