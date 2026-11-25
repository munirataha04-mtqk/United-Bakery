"use client";

import { createElement, useEffect, useRef, useState } from "react";
import { products, drawings } from "./products";
import { startBiscuitScene } from "./biscuitScene";

const AUTO_SCROLL_DELAY = 2500; // ms after the name lands before the page slides to the products
const CAROUSEL_DELAY = 3000; // ms between product slides

export default function BakeryLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const replayRef = useRef<() => void>(() => {});
  const userMoved = useRef(false);
  const paused = useRef(false);
  const [titled, setTitled] = useState(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const goToMenu = () => menuRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // 3D biscuit, then slide down to the products by itself
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stopAuto = () => { userMoved.current = true; };
    window.addEventListener("wheel", stopAuto, { passive: true });
    window.addEventListener("touchmove", stopAuto, { passive: true });
    window.addEventListener("keydown", stopAuto);
    const scene = startBiscuitScene(canvas, {
      onTitle: (on) => {
        setTitled(on);
        clearTimeout(timer);
        if (on) timer = setTimeout(() => { if (!userMoved.current && window.scrollY < 50) goToMenu(); }, AUTO_SCROLL_DELAY);
      },
    });
    replayRef.current = () => { userMoved.current = true; scene.replay(); };
    return () => {
      clearTimeout(timer);
      scene.stop();
      window.removeEventListener("wheel", stopAuto);
      window.removeEventListener("touchmove", stopAuto);
      window.removeEventListener("keydown", stopAuto);
    };
  }, []);

  // product carousel: slides on its own, pauses while you hover or touch it
  const slideTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.children;
    const n = (i + products.length) % products.length;
    const card = cards[n] as HTMLElement;
    const maxLeft = track.scrollWidth - track.clientWidth;
    track.scrollTo({ left: Math.min(card.offsetLeft - track.offsetLeft, maxLeft) });
    activeRef.current = n;
    setActive(n);
  };
  useEffect(() => {
    const id = setInterval(() => {
      const track = trackRef.current;
      if (paused.current || !track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      slideTo(atEnd ? 0 : activeRef.current + 1);
    }, CAROUSEL_DELAY);
    return () => clearInterval(id);
  }, []);

  const hold = { onMouseEnter: () => (paused.current = true), onMouseLeave: () => (paused.current = false), onTouchStart: () => (paused.current = true), onTouchEnd: () => (paused.current = false) };

  return (
    <div className={`ub${titled ? " titled" : ""}`}>
      <div className="hero" id="top">
        <nav className="pad">
          <a className="logo" href="#top">United Bakery</a>
          <div className="links">
            <a href="#menu">Menu</a>
            <a href="#visit">Story</a>
            <a href="#visit">Visit</a>
            <a href="#visit">Contact</a>
          </div>
          <a className="order" href="#visit">Order</a>
        </nav>

        <div className="word"><h1>United Bakery</h1></div>

        {/* the 3D biscuit is drawn here */}
        {createElement("canvas", {
          ref: canvasRef,
          className: "scene",
          "aria-label": "A biscuit cracks in two and crumbs fall. Tap to replay.",
          onClick: () => replayRef.current(),
        })}

        <div className="foot pad">
          <span className="l">Baked fresh every morning<br />in our own ovens</span>
          <span><button className="cue" type="button" onClick={goToMenu}>The menu →</button></span>
          <span className="r">Butter, flour and time<br />tap the biscuit to break it again</span>
        </div>
      </div>

      <section className="pad" id="menu" ref={menuRef}>
        <div className="wrap">
          <div className="head">
            <div>
              <h2>Today’s bakes</h2>
              <p className="note">Sample products and prices for the preview.</p>
            </div>
            <div className="arrows">
              <button className="arrow" type="button" aria-label="Previous" onClick={() => slideTo(active - 1)}>←</button>
              <button className="arrow" type="button" aria-label="Next" onClick={() => slideTo(active + 1)}>→</button>
            </div>
          </div>
          <div className="track" ref={trackRef} {...hold}>
            {products.map((p) => (
              <article className="card" key={p.name}>
                {createElement("svg", { viewBox: "0 0 200 140", role: "img", "aria-label": p.name, dangerouslySetInnerHTML: { __html: drawings[p.picture] } })}
                <div className="row">
                  <h3>{p.name}</h3>
                  <span className="price">{p.price}</span>
                </div>
                <p>{p.description}</p>
              </article>
            ))}
          </div>
          <div className="dots">
            {products.map((p, i) => (
              <button key={p.name} type="button" className={`dot${i === active ? " on" : ""}`} aria-label={`Show ${p.name}`} onClick={() => slideTo(i)} />
            ))}
          </div>
        </div>
      </section>

      <section className="pad" id="visit">
        <div className="wrap visit">
          <div>
            <h2>Come by, or order ahead</h2>
            <p>Pick up warm bread on your way to work, or order a box for the table. Sample details below.</p>
            <a className="order cta" href="#visit">Order for pickup</a>
          </div>
          <dl>
            <dt>Hours</dt><dd>Every day, 7:00 to 19:00</dd>
            <dt>Address</dt><dd>12 Baker Street (sample)</dd>
            <dt>Phone</dt><dd>555 0142</dd>
            <dt>Email</dt><dd>hello@unitedbakery.example</dd>
          </dl>
        </div>
      </section>

      <footer className="pad">
        <span>United Bakery</span>
        <span>Preview page with sample content</span>
      </footer>
    </div>
  );
}