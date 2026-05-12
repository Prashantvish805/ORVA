# 3D animation webiste assignment

A scroll-driven 3D storytelling experience built with Next.js and Three.js. The animation takes the viewer on a journey from a rotating DNA double helix through a particle burst to a wireframe human form, narrating the story of regenerative science.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | 16.2.6 |
| Language | [TypeScript](https://www.typescriptlang.org) | 5.x |
| UI / Styling | [Tailwind CSS](https://tailwindcss.com) | 4.x |
| 3D Renderer | [Three.js](https://threejs.org) | 0.184 |
| React ↔ Three | [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) | 9.x |
| 3D Helpers | [Drei](https://github.com/pmndrs/drei) | 10.x |
| Post-processing | [@react-three/postprocessing](https://github.com/pmndrs/react-three-postprocessing) (Bloom) | 3.x |
| Smooth Scroll | [Lenis](https://github.com/darkroomengineering/lenis) | 1.x |
| Animation | [GSAP](https://gsap.com) | 3.x |
| Fonts | [Playfair Display](https://fonts.google.com/specimen/Playfair+Display), [Geist](https://vercel.com/font) (via `next/font`) | — |

## 3D Model Resources

Both GLB models were sourced from **Sketchfab** and loaded with `useGLTF` from Drei. Boilerplate was generated with [gltfjsx](https://github.com/pmndrs/gltfjsx).

| Model | Author | License | Source |
|---|---|---|---|
| Cell Shaded Double Helix (DNA) | [sucholudek](https://sketchfab.com/sucholudek) | [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/) | [Sketchfab](https://sketchfab.com/3d-models/cell-shaded-double-helix-fc666762303f465fa6e82233552de89c) |
| 3D Human Body Wireframe Model | — | — | [Sketchfab](https://sketchfab.com) |

## Animation Breakdown

1. **DNA Helix** — A wireframe double-helix model rotates and rises with eased vertical motion (`easeOutQuart` / `easeInQuad`).
2. **Particle Storm** — 2,700 GPU-driven particles (primary + secondary layers) swirl around the model with additive blending, burst outward, and then rain downward under simulated gravity.
3. **Bloom Effect** — A dynamic post-processing bloom pass intensifies during the particle burst phase for a glowing transition.
4. **Human Form** — A wireframe human body model rises from below the viewport with `easeOutCubic` easing, completing the DNA → Human narrative.
5. **Scroll-linked Sections** — Five full-screen text sections fade in/out based on scroll progress, driven by a custom `useScrollProgress` hook and Lenis smooth scrolling.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the experience.

## Deploy on Vercel

The easiest way to deploy is via the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
