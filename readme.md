# Scatter Engine

> **Interactive particle text engine for the web.**

Scatter Engine transforms ordinary text into thousands of interactive particles that respond to user input in real time. Built with performance, simplicity, and developer experience in mind, it allows you to create beautiful particle-based typography with only a few lines of code.

The official website is designed around one philosophy: > **The engine is the product. The website is simply the stage.**
https://aayyuusshh11.github.io/ScatterEngine/
---

## Preview

* Interactive particle text
* Mouse repulsion
* Smooth text morphing
* Live customization
* Responsive rendering
* Lightweight
* Zero dependencies

---

## Features

* Interactive particle-based text rendering
* Mouse repulsion and attraction effects
* Smooth particle spring physics
* Text morphing between multiple strings
* Adjustable particle density
* Configurable particle size
* Configurable mouse radius
* Spring and damping physics
* Multiple animation presets
* Optional particle trails
* Optional shockwave effect
* Responsive canvas positioning
* Multiple independent Scatter instances
* Simple JavaScript API

---

## Installation

```bash
npm install scatter-engine
```

---

## Import

```javascript
import { Scatter } from "scatter-engine";
```

---

## Basic Usage

```html
<h1 id="heroText">
    SCATTER ENGINE
</h1>
```

```javascript
import { Scatter } from "scatter-engine";

Scatter.init({

    target: "#heroText",

    gap: 4,

    particleRadius: 1.5,

    mouseRadius: 60,

    repulsionStrength: 1.5,

    springStrength: 0.04,

    damping: 0.53,

    shockwave: true

});
```

---

# Configuration

| Option              | Type      | Default  | Description                |
| ------------------- | --------- | -------- | -------------------------- |
| `target`            | `string`  | Required | Target text element        |
| `gap`               | `number`  | `4`      | Distance between particles |
| `particleRadius`    | `number`  | `1.5`    | Radius of each particle    |
| `mouseRadius`       | `number`  | `60`     | Mouse interaction radius   |
| `repulsionStrength` | `number`  | `1.5`    | Repulsion force            |
| `springStrength`    | `number`  | `0.04`   | Particle return speed      |
| `damping`           | `number`  | `0.53`   | Motion damping             |
| `shockwave`         | `boolean` | `true`   | Enable click shockwave     |

---

# Animation Presets

Scatter Engine includes three built-in presets.

### Soft

```javascript
Scatter.setPreset("soft");
```

Balanced movement suitable for most websites.

---

### Liquid

```javascript
Scatter.setPreset("liquid");
```

Fluid motion with stronger interaction.

---

### Elastic

```javascript
Scatter.setPreset("elastic");
```

High spring force with bouncy particle movement.

---

# Live Customization

The official website demonstrates every configurable property in real time.

Available controls include:

* Default Text
* Hover Text
* Gap
* Particle Radius
* Mouse Radius
* Repulsion Strength
* Spring Strength
* Damping
* Animation Style
* Trails
* Shockwave

Every control updates the engine instantly.

---

# Why Scatter Engine?

Most particle text libraries focus on visual effects.

Scatter Engine focuses on:

* Clean API
* Smooth physics
* Real-time interaction
* Minimal setup
* Developer-first experience
* High performance

---

# Browser Support

Supports all modern browsers that implement:

* Canvas API
* ES Modules
* requestAnimationFrame

---

# Performance

Scatter Engine is designed for smooth rendering while keeping configuration simple.

Performance depends on:

* Particle density (`gap`)
* Particle radius
* Screen resolution
* Amount of rendered text

For the best balance between quality and performance:

```javascript
gap: 4
particleRadius: 1.5
```

---

# Roadmap

### Planned

* Interactive playground
* Dedicated documentation
* Configuration export
* Plugin system
* Additional animation modes
* Expanded API documentation

---

# Contributing

Contributions, bug reports, feature requests, and suggestions are welcome.

If you discover an issue, please open an Issue before submitting a Pull Request so the proposed changes can be discussed first.

---

# License

MIT License

---

# Author

**Aayush**

---

# Philosophy

Scatter Engine was built with one simple idea:

> **Typography should feel alive.**

Instead of decorating text with animations, Scatter Engine turns the text itself into the animation, allowing users to interact directly with words through responsive particle physics.

---

## Star the Repository

If you found Scatter Engine useful or interesting, consider giving the repository a ⭐.

It helps more developers discover the project and supports future development.

---

**Scatter Engine** • *Interactive particle typography for the modern web.*
