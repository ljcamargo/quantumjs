# QuantumJS Bench

A real-time, interactive environment to write quantum circuits using the **QuantumJS DSL**, inspect the compiled **OpenQASM 3.0** output, and simulate live statevector probabilities.

This is a Next.js application built with Tailwind CSS, PrismJS syntax highlighting, and `@ljcamargo/quirkvis-react` for instant circuit diagram drawing.

---

## Getting Started

### Development
Start the dev server locally:

```bash
cd apps/bench
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build
Build the application for production (requires Webpack to support Webpack Node.js polyfills used by the statevector simulator):

```bash
bun run build
```

---

## Deployment on Netlify
The bench is configured for Netlify deployment via the root `netlify.toml` configuration. It leverages Next.js runtime adapters for serverless API operations and static page generation.
