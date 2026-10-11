// Decorative hero graphic: ridge lines displaced by two interfering circular waves.
// One source is fixed, the other follows the pointer. Pauses off-screen and in background tabs.
// With prefers-reduced-motion it draws a single static frame.
const canvas = document.querySelector<HTMLCanvasElement>("#wave");
const context = canvas?.getContext("2d") ?? null;

if (canvas && context) start(canvas, context);

function start(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const css = getComputedStyle(document.documentElement);
  const line = css.getPropertyValue("--accent").trim() || "#3B54D9";
  const fill = css.getPropertyValue("--surface").trim() || "#ffffff";
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const home = { x: 0.72, y: 0.4 };
  const src = { ...home };
  const goal = { ...home };
  let w = 0;
  let h = 0;
  let t = 1.2;
  let raf = 0;
  let onScreen = true;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const rows = 34;
    const gap = h / (rows + 2);
    const amp = gap * 1.3;
    const k = 0.045;
    const a = { x: 0.28 * w, y: 0.55 * h };
    const b = { x: src.x * w, y: src.y * h };
    ctx.lineWidth = 1.25;
    ctx.lineJoin = "round";
    ctx.strokeStyle = line;
    ctx.fillStyle = fill;
    for (let i = 0; i < rows; i++) {
      const y0 = gap * (i + 2);
      const curve = new Path2D();
      for (let x = 0; x <= w; x += 6) {
        const d1 = Math.hypot(x - a.x, y0 - a.y);
        const d2 = Math.hypot(x - b.x, y0 - b.y);
        const s = Math.sin(d1 * k - t) / (1 + d1 * 0.006) + Math.sin(d2 * k - t) / (1 + d2 * 0.006);
        const y = y0 - s * amp;
        if (x === 0) curve.moveTo(x, y);
        else curve.lineTo(x, y);
      }
      const area = new Path2D(curve);
      area.lineTo(w, h + 4);
      area.lineTo(0, h + 4);
      area.closePath();
      ctx.fill(area);
      ctx.stroke(curve);
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function frame() {
    t += 0.03;
    src.x += (goal.x - src.x) * 0.05;
    src.y += (goal.y - src.y) * 0.05;
    draw();
    raf = requestAnimationFrame(frame);
  }
  function play() {
    if (!raf && !motion.matches && onScreen && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    goal.x = (e.clientX - r.left) / r.width;
    goal.y = (e.clientY - r.top) / r.height;
  });
  canvas.addEventListener("pointerleave", () => {
    goal.x = home.x;
    goal.y = home.y;
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : play()));
  new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true;
    if (onScreen) play();
    else stop();
  }).observe(canvas);
  motion.addEventListener("change", () => {
    if (motion.matches) {
      stop();
      draw();
    } else play();
  });
  new ResizeObserver(resize).observe(canvas);
  resize();
  play();
}

export {};
