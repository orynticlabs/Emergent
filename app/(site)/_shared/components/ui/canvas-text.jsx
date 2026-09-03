"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@site/lib/utils";

/**
 * Canvas-drawn text filled with an animated multi-color gradient that sweeps
 * left-to-right on a loop, with faint horizontal scan lines (lineGap) laid
 * over the fill. Font size/weight/family are read from a hidden span that
 * carries the real `className` (so Tailwind responsive classes work), and
 * the canvas redraws whenever that span's box size changes.
 */
export function CanvasText({
  text,
  className = "",
  backgroundClassName = "",
  colors = ["#FF5500", "#ff8a3d", "#0066FF", "#38bdf8"],
  lineGap = 6,
  animationDuration = 10,
}) {
  const canvasRef = useRef(null);
  const measureRef = useRef(null);
  const [font, setFont] = useState(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    function measure() {
      if (!measureRef.current) return;
      const style = window.getComputedStyle(measureRef.current);
      setFont({
        fontSize: parseFloat(style.fontSize) || 16,
        fontWeight: style.fontWeight || "400",
        fontFamily: style.fontFamily || "sans-serif",
      });
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (measureRef.current) ro.observe(measureRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!font || !canvasRef.current || !text || !inView) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    const fontString = `${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`;
    ctx.font = fontString;
    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width) + 8;
    const textHeight = Math.ceil(font.fontSize * 1.3);

    canvas.width = textWidth * dpr;
    canvas.height = textHeight * dpr;
    canvas.style.width = `${textWidth}px`;
    canvas.style.height = `${textHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf;
    let start = null;

    function draw(timestamp) {
      if (start === null) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      const progress = (elapsed % animationDuration) / animationDuration;

      ctx.clearRect(0, 0, textWidth, textHeight);
      ctx.font = fontString;
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = "#fff";
      ctx.fillText(text, 4, textHeight / 2);

      ctx.globalCompositeOperation = "source-atop";
      const sweep = progress * textWidth * 2;
      const gradient = ctx.createLinearGradient(sweep - textWidth, 0, sweep, 0);
      colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), color);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, textWidth, textHeight);

      if (lineGap > 0) {
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 1;
        for (let y = 0; y < textHeight; y += lineGap) {
          ctx.beginPath();
          ctx.moveTo(0, y + 0.5);
          ctx.lineTo(textWidth, y + 0.5);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [font, text, colors, lineGap, animationDuration, inView]);

  return (
    <span className={cn("relative inline-block align-baseline", backgroundClassName)}>
      <span ref={measureRef} className={cn(className, "pointer-events-none absolute -z-10 opacity-0")} aria-hidden="true">
        {text}
      </span>
      <canvas ref={canvasRef} role="img" aria-label={text} className="relative -translate-y-[2px]" />
    </span>
  );
}
