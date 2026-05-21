# Top 5 Web Animation Techniques (+ Bonuses)

> Source: YouTube — "My Top 5 Techniques for Web Animation"  
> Author: Web agency developer specializing in award-winning creative animations

## Context

The 80/20 rule (Pareto Principle) applies to web animations: **80% of impressive animations are built with the same 20% of techniques**. These are the repeating patterns found across virtually every award-winning website.

---

## The 5 Core Techniques

### 1. Scroll Tracking

Track scroll progress over a page section — typically returns a value **between 0 and 1** that drives animation parameters.

**Tools:**
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `useScroll` hook — Framer Motion

**Problem:** Mouse wheel scroll is jerky → animations become jerky.  
**Solution:** Use a **smooth scroll library** to decouple scroll events from the browser's native behavior.

| Library | Notes |
|---|---|
| [Lenis](https://lenis.darkroom.engineering/) | Most popular |
| [Locomotive Scroll](https://locomotivemtl.github.io/locomotive-scroll/) | Built on Lenis, adds animation layer |

---

### 2. Viewport Detection

Trigger an animation when an element **enters the viewport**. Present on essentially every award-winning site.

**Native API:** `IntersectionObserver`  
**Preferred abstractions (both wrap IntersectionObserver internally):**
- GSAP ScrollTrigger
- `useInView` hook — Framer Motion

> Accounts for ~50% of all web animations. Non-negotiable skill.

---

### 3. CSS Sticky Position

`position: sticky` — native CSS, zero dependencies, no bugs, universal browser support.

**Why it's powerful:**
- Simple to set up
- No edge-case quirks (it's native)
- Enables scroll-linked pinning effects without JS

**Caveat:** Requires creative thinking — the technique should be invisible to the viewer. If it looks obviously "sticky", the animation design needs work.

> Verdict: top-tier. Countless animations would break or become unfixable without it.

---

### 4. Easing

Not just a parameter — **easing defines the personality of a website**.

- Slow ease → elegant, luxury feel
- Fast ease → energetic, modern
- Bouncy ease → playful, dynamic

**Why it matters now:**  
Motion design is becoming a core part of web development. The gap between amateur and professional sites is increasingly visible in how easings are applied — it's a craft that must be mastered.

**Key insight:** Mastering easing = mastering the *feel* of a site, not just the movement.

---

### 5. Text Splitting

Deconstruct text into **lines → words → characters** to animate each unit independently.

```
"Hello World" 
→ ["Hello", "World"]          // words
→ ["H","e","l","l","o", ...]  // characters
```

**Tools:**
- GSAP `SplitText` plugin (paid, part of GSAP Club)
- [`split-type`](https://github.com/lukePeavey/SplitType) (free alternative)

**Warnings:**
- Accessibility: splitting text can break screen readers — handle ARIA attributes carefully
- Resize events: re-split on window resize or lines will misalign on reflow

> Present on virtually every award-winning website. Opens enormous typographic animation possibilities.

---

## Bonus Techniques

### B1. The `map` Function (Mathematical)

Transforms a value from one range to another range.

```js
// Conceptual: map(value, inMin, inMax, outMin, outMax)
map(scrollProgress, 0, 1, 0, 500)   // scroll → translateX pixels
map(mouseX, 0, window.width, -1, 1) // pixels → Cartesian space (WebGL)
```

**Available in:**
- Vanilla JS (one-liner implementation)
- GSAP — `gsap.utils.mapRange()`
- Framer Motion — `useTransform` hook
- CSS — `calc()` + custom properties

Use case: converting scroll progress, mouse coordinates, pointer values into animation-ready numbers.

---

### B2. Lerp (Linear Interpolation)

Smoothly interpolate between a current value and a target value each frame.

```js
// Each frame: current = lerp(current, target, factor)
current += (target - current) * 0.1
```

**Primary use cases:**
- Custom cursor / pointer animations
- Canvas API animations (`requestAnimationFrame` loop)
- Smooth color transitions, shape morphing

One-liner. Pairs with `requestAnimationFrame`. Essential for anything canvas-based.

---

### B3. Shaders (GLSL)

Low-level GPU programs for pixel-level visual effects.

**Two types:**
| Type | Use |
|---|---|
| Vertex shaders | Deform 3D geometry |
| Fragment shaders | Per-pixel color/texture effects |

**When to use:**
- Experimental / artistic websites
- 3D scenes (Three.js / WebGL) needing extra visual detail
- Effects impossible with CSS or canvas 2D

**Reality check:**
- Overkill for most commercial projects
- Few high-level libraries abstract GLSL (yet)
- Steep learning curve

**Why learn it anyway:** Shaders are an open field. Mastering them enables animations no one else has built — a genuine competitive advantage for creative developers.

---

## Summary Table

| # | Technique | Difficulty | Usage |
|---|---|---|---|
| 1 | Scroll Tracking | Medium | Every scroll-linked animation |
| 2 | Viewport Detection | Easy | ~50% of all animations |
| 3 | CSS Sticky | Easy | Pinning / scroll-linked layouts |
| 4 | Easing | Medium | Every single animation |
| 5 | Text Splitting | Medium | Typography animations |
| B1 | Map Function | Easy | Value range conversion |
| B2 | Lerp | Easy | Smooth cursor / canvas |
| B3 | Shaders | Hard | Experimental / 3D work |

---

## Key Takeaway

> Master these 5 techniques + the bonus tools and you cover the vast majority of what award-winning web animation studios use daily. The differentiator isn't exotic tools — it's depth of execution on these fundamentals.
