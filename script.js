// ==========================================
// SCATTER ENGINE WEBSITE
// ==========================================

import { Scatter } from "./scatter-engine.js";


// ==========================================
// DOM REFERENCES
// ==========================================

const heroLine1 =
    document.getElementById("heroLine1");

const heroLine2 =
    document.getElementById("heroLine2");

const customizeBtn =
    document.getElementById("customizeBtn");

const viewCodeBtn =
    document.getElementById("viewCodeBtn");

const customizeDrawer =
    document.getElementById("customizeDrawer");

const viewCodeDrawer =
    document.getElementById("viewCodeDrawer");

const navToggle =
    document.getElementById("navToggle");

const navLinks =
    document.getElementById("navLinks");


// ==========================================
// WAIT FOR FONTS → INIT SCATTER
// ==========================================

document.fonts.ready.then(() => {

    updateHeroTypography();

    Scatter.init({
        gap: 4,
        particleRadius: 1.5,
        mouseRadius: 60,
        repulsionStrength: 1.5,
        springStrength: 0.04,
        damping: 0.53,
        shockwave: true
    });

    setupHoverText();
});


// ==========================================
// HELPER — ALL ENGINES
// ==========================================

function forEachEngine(fn) {

    Scatter.instances.forEach(
        (instance) => {
            if (instance.engine) {
                fn(instance.engine, instance);
            }
        }
    );
}


// ==========================================
// REPOSITION CANVASES
// ==========================================

function repositionCanvases() {

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            Scatter.instances.forEach(
                (instance) => {

                    Scatter.positionCanvas(
                        instance.element,
                        instance.canvas
                    );
                }
            );
        });
    });
}


// ==========================================
// TEXT SPLITTING
// ==========================================

function splitText(text) {

    const trimmed =
        (text || "").trim();

    if (!trimmed) {
        return { line1: "", line2: "" };
    }

    const words =
        trimmed.split(/\s+/);

    if (words.length === 1) {
        return {
            line1: words[0],
            line2: ""
        };
    }

    const mid =
        Math.ceil(words.length / 2);

    return {
        line1: words.slice(0, mid).join(" "),
        line2: words.slice(mid).join(" ")
    };
}


// ==========================================
// HERO TYPOGRAPHY
// ==========================================

function updateHeroTypography() {
    const text1 = heroLine1.textContent.trim();
    const text2 = heroLine2.textContent.trim();
    
    const container = document.getElementById("heroTextContainer");
    if (!container || !container.parentElement) return;
    
    const parent = container.parentElement;
    const containerWidth = parent.clientWidth; 
    const containerHeight = parent.clientHeight;
    
    const targetWidth = containerWidth * 0.8;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    const baseSize = 100;
    const style = getComputedStyle(heroLine1);
    ctx.font = `${style.fontWeight} ${baseSize}px ${style.fontFamily}`;
    
    const w1 = ctx.measureText(text1).width;
    const w2 = ctx.measureText(text2).width;
    const maxTextWidth = Math.max(w1, w2);
    
    if (maxTextWidth === 0) return;
    
    let idealSize = (targetWidth / maxTextWidth) * baseSize;
    
    const minSize = 32;
    const maxByWidth = containerWidth * 0.22;
    const maxByHeight = containerHeight * 0.32;
    const maxSize = Math.min(maxByWidth, maxByHeight);
    
    idealSize = Math.max(minSize, Math.min(idealSize, maxSize));
    
    heroLine1.style.fontSize = `${idealSize}px`;
    heroLine2.style.fontSize = `${idealSize}px`;
}

function setHeroText(text) {

    const { line1, line2 } =
        splitText(text);

    heroLine1.textContent = line1;
    heroLine2.textContent = line2;
    
    updateHeroTypography();
}


// ==========================================
// HOVER TEXT
// ==========================================

let defaultText = "SCATTER ENGINE";
let hoverText = "";
let hoverCount = 0;
let hoverTimeout = null;


function setupHoverText() {

    Scatter.instances.forEach(
        (instance) => {

            const canvas = instance.canvas;

            canvas.addEventListener(
                "mouseenter",
                () => {

                    hoverCount++;

                    clearTimeout(hoverTimeout);

                    if (
                        hoverText &&
                        hoverText.trim()
                    ) {
                        setHeroText(hoverText);
                    }
                }
            );

            canvas.addEventListener(
                "mouseleave",
                () => {

                    hoverCount--;

                    hoverTimeout = setTimeout(
                        () => {

                            if (
                                hoverCount <= 0
                            ) {
                                hoverCount = 0;
                                setHeroText(
                                    defaultText
                                );
                            }
                        },
                        60
                    );
                }
            );
        }
    );
}


// ==========================================
// TRAILS
// ==========================================

let trailsEnabled = false;
let originalAnimates = new Map();


function enableTrails() {

    forEachEngine((engine) => {

        if (originalAnimates.has(engine)) {
            return;
        }

        originalAnimates.set(
            engine,
            engine.animate.bind(engine)
        );

        engine.animate = function () {

            if (this.isDestroyed) {
                return;
            }

            this.ctx.fillStyle =
                "rgba(5, 5, 5, 0.15)";

            this.ctx.fillRect(
                0, 0,
                this.canvas.width,
                this.canvas.height
            );

            this.updateShockwave();

            for (
                let i =
                    this.particles.length - 1;
                i >= 0;
                i--
            ) {

                const particle =
                    this.particles[i];

                this.updateParticle(
                    particle
                );

                if (
                    particle.targetAlpha === 0
                    &&
                    particle.alpha < 0.01
                ) {
                    this.particles.splice(
                        i, 1
                    );
                    continue;
                }

                this.drawParticle(
                    particle
                );
            }

            this.animationFrameId =
                requestAnimationFrame(
                    () => this.animate()
                );
        };
    });
}


function disableTrails() {

    forEachEngine((engine) => {

        const original =
            originalAnimates.get(engine);

        if (original) {
            engine.animate = original;
            originalAnimates.delete(engine);
        }
    });
}


// ==========================================
// ANIMATION PRESETS
// ==========================================

const PRESETS = {

    soft: {
        gap: 4,
        particleRadius: 1.5,
        mouseRadius: 60,
        repulsionStrength: 1.5,
        springStrength: 0.04,
        damping: 0.53
    },

    liquid: {
        gap: 5,
        particleRadius: 2,
        mouseRadius: 55,
        repulsionStrength: 4,
        springStrength: 0.06,
        damping: 0.51
    },

    elastic: {
        springStrength: 0.12,
        damping: 0.75,
        repulsionStrength: 5
    }
};


// ==========================================
// DRAWERS — SPLIT SCREEN
// ==========================================

function isDrawerOpen() {

    return (
        customizeDrawer.classList.contains("open") ||
        viewCodeDrawer.classList.contains("open")
    );
}


function animateCanvasReposition() {
    const startTime = performance.now();
    const duration = 350; // matches CSS transition time

    function step(now) {
        repositionCanvases();
        if (now - startTime < duration) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
}

function openDrawer(drawer) {

    // Close all first
    customizeDrawer.classList.remove("open");
    viewCodeDrawer.classList.remove("open");
    customizeBtn.classList.remove("active");
    viewCodeBtn.classList.remove("active");

    // Open the requested one
    drawer.classList.add("open");
    document.body.classList.add("drawer-active");

    // Mark the nav button active
    if (drawer === customizeDrawer) {
        customizeBtn.classList.add("active");
    } else {
        viewCodeBtn.classList.add("active");
    }

    // Reposition particle canvases smoothly
    // during the CSS transition
    animateCanvasReposition();
}


function closeAllDrawers() {

    customizeDrawer.classList.remove("open");
    viewCodeDrawer.classList.remove("open");
    customizeBtn.classList.remove("active");
    viewCodeBtn.classList.remove("active");

    document.body.classList.remove(
        "drawer-active"
    );

    animateCanvasReposition();
}


// Toggle behavior — click again to close
customizeBtn.addEventListener(
    "click",
    () => {

        if (
            customizeDrawer.classList
                .contains("open")
        ) {
            closeAllDrawers();
        } else {
            openDrawer(customizeDrawer);
        }
    }
);


viewCodeBtn.addEventListener(
    "click",
    () => {

        if (
            viewCodeDrawer.classList
                .contains("open")
        ) {
            closeAllDrawers();
        } else {
            openDrawer(viewCodeDrawer);
        }
    }
);


// Close buttons inside drawers
document.querySelectorAll(
    ".close-drawer"
).forEach(
    (btn) => {
        btn.addEventListener(
            "click",
            closeAllDrawers
        );
    }
);


// Escape key
document.addEventListener(
    "keydown",
    (e) => {
        if (e.key === "Escape") {
            closeAllDrawers();
        }
    }
);


// ==========================================
// MOBILE NAV
// ==========================================

navToggle.addEventListener(
    "click",
    () => {

        const isOpen =
            navLinks.classList.toggle("open");

        navToggle.classList.toggle("active");

        navToggle.setAttribute(
            "aria-expanded",
            isOpen
        );
    }
);


navLinks.querySelectorAll("a").forEach(
    (link) => {

        link.addEventListener(
            "click",
            () => {

                navLinks.classList.remove("open");

                navToggle.classList.remove(
                    "active"
                );

                navToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        );
    }
);


// ==========================================
// COPY BUTTONS
// ==========================================

document.querySelectorAll(
    ".copy-btn"
).forEach(
    (btn) => {

        btn.addEventListener(
            "click",
            () => {

                const text =
                    btn.dataset.copy;

                if (!text) {
                    return;
                }

                navigator.clipboard
                    .writeText(text)
                    .then(() => {

                        btn.classList.add(
                            "copied"
                        );

                        setTimeout(
                            () => {
                                btn.classList.remove(
                                    "copied"
                                );
                            },
                            800
                        );
                    });
            }
        );
    }
);


// ==========================================
// CUSTOMIZE — TEXT CONTROLS
// ==========================================

const ctrlDefaultText =
    document.getElementById("ctrlDefaultText");

const ctrlHoverText =
    document.getElementById("ctrlHoverText");


ctrlDefaultText.addEventListener(
    "input",
    (e) => {
        let val = e.target.value;
        let words = val.split(/\s+/);
        if (words.length > 2) {
            words = words.slice(0, 2);
        }
        val = words.map(w => w.slice(0, 7)).join(' ');

        if (e.target.value !== val) {
            e.target.value = val;
        }

        defaultText =
            val || "SCATTER ENGINE";

        if (hoverCount <= 0) {
            setHeroText(defaultText);
        }
    }
);


ctrlHoverText.addEventListener(
    "input",
    (e) => {
        let val = e.target.value;
        let words = val.split(/\s+/);
        if (words.length > 2) {
            words = words.slice(0, 2);
        }
        val = words.map(w => w.slice(0, 7)).join(' ');

        if (e.target.value !== val) {
            e.target.value = val;
        }

        hoverText = val;
    }
);


// ==========================================
// CUSTOMIZE — RANGE CONTROLS
// ==========================================

const rangeControls = [

    {
        id: "ctrlGap",
        valId: "valGap",
        setting: "gap",
        reinit: true
    },

    {
        id: "ctrlParticleRadius",
        valId: "valParticleRadius",
        setting: "particleRadius",
        reinit: false
    },

    {
        id: "ctrlMouseRadius",
        valId: "valMouseRadius",
        setting: "mouseRadius",
        reinit: false
    },

    {
        id: "ctrlRepulsionStrength",
        valId: "valRepulsionStrength",
        setting: "repulsionStrength",
        reinit: false
    },

    {
        id: "ctrlSpringStrength",
        valId: "valSpringStrength",
        setting: "springStrength",
        reinit: false
    },

    {
        id: "ctrlDamping",
        valId: "valDamping",
        setting: "damping",
        reinit: false
    }
];


rangeControls.forEach(
    (ctrl) => {

        const input =
            document.getElementById(ctrl.id);

        const valueDisplay =
            document.getElementById(ctrl.valId);

        input.addEventListener(
            "input",
            () => {

                const value =
                    parseFloat(input.value);

                valueDisplay.textContent =
                    input.value;

                forEachEngine(
                    (engine, instance) => {

                        engine.settings[
                            ctrl.setting
                        ] = value;

                        if (ctrl.reinit) {
                            Scatter
                                .updateTextInstance(
                                    instance
                                );
                        }
                    }
                );
            }
        );
    }
);


// ==========================================
// CUSTOMIZE — ANIMATION STYLE
// ==========================================

const ctrlAnimationStyle =
    document.getElementById("ctrlAnimationStyle");

ctrlAnimationStyle.addEventListener(
    "change",
    (e) => {

        const preset =
            PRESETS[e.target.value];

        if (!preset) {
            return;
        }

        let needsReinit = false;

        // Apply to all engines
        forEachEngine((engine, instance) => {
            if (preset.gap !== undefined && engine.settings.gap !== preset.gap) {
                engine.settings.gap = preset.gap;
                needsReinit = true;
            }
            if (preset.particleRadius !== undefined) engine.settings.particleRadius = preset.particleRadius;
            if (preset.mouseRadius !== undefined) engine.settings.mouseRadius = preset.mouseRadius;
            if (preset.repulsionStrength !== undefined) engine.settings.repulsionStrength = preset.repulsionStrength;
            if (preset.springStrength !== undefined) engine.settings.springStrength = preset.springStrength;
            if (preset.damping !== undefined) engine.settings.damping = preset.damping;
        });

        if (needsReinit) {
            forEachEngine((engine, instance) => {
                Scatter.updateTextInstance(instance);
            });
        }

        // Sync slider UI
        const syncUI = (key, id, valId) => {
            if (preset[key] !== undefined) {
                document.getElementById(id).value = preset[key];
                document.getElementById(valId).textContent = preset[key];
            }
        };

        syncUI('gap', 'ctrlGap', 'valGap');
        syncUI('particleRadius', 'ctrlParticleRadius', 'valParticleRadius');
        syncUI('mouseRadius', 'ctrlMouseRadius', 'valMouseRadius');
        syncUI('repulsionStrength', 'ctrlRepulsionStrength', 'valRepulsionStrength');
        syncUI('springStrength', 'ctrlSpringStrength', 'valSpringStrength');
        syncUI('damping', 'ctrlDamping', 'valDamping');
    }
);


// ==========================================
// CUSTOMIZE — TRAILS TOGGLE
// ==========================================

const ctrlTrails =
    document.getElementById("ctrlTrails");

ctrlTrails.addEventListener(
    "change",
    (e) => {

        trailsEnabled = e.target.checked;

        if (trailsEnabled) {
            enableTrails();
        } else {
            disableTrails();
        }
    }
);


// ==========================================
// CUSTOMIZE — SHOCKWAVE TOGGLE
// ==========================================

const ctrlShockwave =
    document.getElementById("ctrlShockwave");

ctrlShockwave.addEventListener(
    "change",
    (e) => {

        forEachEngine((engine) => {

            engine.settings.shockwave =
                e.target.checked;
        });
    }
);


// ==========================================
// RESIZE — REPOSITION CANVASES
// ==========================================

let resizeTimeout = null;

window.addEventListener(
    "resize",
    () => {

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(
            () => {
                updateHeroTypography();
                forEachEngine((engine, instance) => {
                    Scatter.updateTextInstance(instance);
                });
                repositionCanvases();
            },
            150
        );
    }
);