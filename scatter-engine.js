
// SCATTER ENGINE


export class ScatterEngine {

    constructor(canvas, options = {}) {

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error(
                "ScatterEngine: Valid canvas required."
            );
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        if (!this.ctx) {
            throw new Error(
                "ScatterEngine: 2D context unavailable."
            );
        }



        // SETTINGS


        this.settings = {

            gap: 4,
            particleRadius: 1.5,

            mouseRadius: 60,
            repulsionStrength: 1.5,

            springStrength: 0.04,
            damping: 0.53,

            shockwave: true,
            shockwaveRadius: 300,
            shockwaveSpeed: 8,
            shockwaveThickness: 20,
            shockwaveStrength: 8,

            morphSpeed: 0.08,

            ...options
        };


        this.particles = [];


        this.mouse = {
            x: -1000,
            y: -1000
        };


        this.shockwave = {
            x: 0,
            y: 0,
            radius: 0,
            active: false
        };


        // Lifecycle
        this.isDestroyed = false;
        this.animationFrameId = null;


        // Bind handlers so destroy()
        // can remove exact same functions
        this.handlePointerMove =
            this.handlePointerMove.bind(this);

        this.handlePointerLeave =
            this.handlePointerLeave.bind(this);

        this.handlePointerDown =
            this.handlePointerDown.bind(this);


        this.createParticles();

        this.setupEvents();

        this.animate();
    }




    // SAMPLE CURRENT CANVAS PIXELS


    samplePixels() {

        const imageData =
            this.ctx.getImageData(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );


        const pixels =
            imageData.data;


        const gap =
            this.settings.gap;


        const targets = [];


        for (
            let y = 0;
            y < this.canvas.height;
            y += gap
        ) {

            for (
                let x = 0;
                x < this.canvas.width;
                x += gap
            ) {

                const index =
                    (
                        y * this.canvas.width +
                        x
                    )
                    * 4;


                const r =
                    pixels[index];

                const g =
                    pixels[index + 1];

                const b =
                    pixels[index + 2];

                const a =
                    pixels[index + 3];


                // Transparent pixels ignore
                if (a > 20) {

                    targets.push({
                        x,
                        y,
                        r,
                        g,
                        b,
                        a
                    });
                }
            }
        }


        return targets;
    }




    // INITIAL PIXELS → PARTICLES


    createParticles() {

        const targets =
            this.samplePixels();


        this.particles.length = 0;


        for (
            const target
            of targets
        ) {

            this.particles.push({

                // Current position
                x: target.x,
                y: target.y,

                // Destination
                homeX: target.x,
                homeY: target.y,

                // Velocity
                vx: 0,
                vy: 0,

                // Color
                r: target.r,
                g: target.g,
                b: target.b,
                a: target.a,

                // Morph visibility
                alpha: 1,
                targetAlpha: 1
            });
        }


        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }




    // MORPH INTO NEW PIXEL TARGETS


    morph(targets) {

        if (this.isDestroyed) {
            return;
        }


        const particles =
            this.particles;


        const oldCount =
            particles.length;


        const targetCount =
            targets.length;


        const sharedCount =
            Math.min(
                oldCount,
                targetCount
            );



        // EXISTING PARTICLES → NEW TARGETS


        for (
            let i = 0;
            i < sharedCount;
            i++
        ) {

            const particle =
                particles[i];


            const target =
                targets[i];


            // New destination
            particle.homeX =
                target.x;

            particle.homeY =
                target.y;


            // New color
            particle.r =
                target.r;

            particle.g =
                target.g;

            particle.b =
                target.b;

            particle.a =
                target.a;


            // Make visible
            particle.targetAlpha = 1;
        }




        // NEED MORE PARTICLES


        if (
            targetCount >
            oldCount
        ) {

            for (
                let i = oldCount;
                i < targetCount;
                i++
            ) {

                const target =
                    targets[i];


                let startX =
                    target.x;


                let startY =
                    target.y;


                // Start new particle from
                // an existing particle
                if (oldCount > 0) {

                    const source =
                        particles[
                        Math.floor(
                            Math.random() *
                            oldCount
                        )
                        ];


                    startX =
                        source.x;

                    startY =
                        source.y;
                }


                particles.push({

                    x: startX,
                    y: startY,

                    homeX:
                        target.x,

                    homeY:
                        target.y,

                    vx: 0,
                    vy: 0,

                    r: target.r,
                    g: target.g,
                    b: target.b,
                    a: target.a,

                    // Fade in
                    alpha: 0,
                    targetAlpha: 1
                });
            }
        }




        // NEED FEWER PARTICLES


        else if (
            targetCount <
            oldCount
        ) {

            for (
                let i = targetCount;
                i < oldCount;
                i++
            ) {

                // Extra particles fade out
                particles[i]
                    .targetAlpha = 0;
            }
        }
    }




    // POINTER POSITION


    getPointerPosition(event) {

        const rect =
            this.canvas
                .getBoundingClientRect();


        if (
            rect.width === 0 ||
            rect.height === 0
        ) {

            return {
                x: -1000,
                y: -1000
            };
        }


        const scaleX =
            this.canvas.width /
            rect.width;


        const scaleY =
            this.canvas.height /
            rect.height;


        return {

            x:
                (
                    event.clientX -
                    rect.left
                )
                * scaleX,

            y:
                (
                    event.clientY -
                    rect.top
                )
                * scaleY
        };
    }




    // POINTER HANDLERS


    handlePointerMove(event) {

        const position =
            this.getPointerPosition(
                event
            );


        this.mouse.x =
            position.x;

        this.mouse.y =
            position.y;
    }



    handlePointerLeave() {

        this.mouse.x = -1000;
        this.mouse.y = -1000;
    }



    handlePointerDown(event) {

        if (
            !this.settings.shockwave
        ) {
            return;
        }


        const position =
            this.getPointerPosition(
                event
            );


        this.shockwave.x =
            position.x;

        this.shockwave.y =
            position.y;

        this.shockwave.radius = 0;

        this.shockwave.active = true;
    }




    // EVENTS


    setupEvents() {

        this.canvas.addEventListener(
            "pointermove",
            this.handlePointerMove
        );


        this.canvas.addEventListener(
            "pointerleave",
            this.handlePointerLeave
        );


        this.canvas.addEventListener(
            "pointerdown",
            this.handlePointerDown
        );
    }




    // SHOCKWAVE

    0
    updateShockwave() {

        if (
            !this.shockwave.active
        ) {
            return;
        }


        this.shockwave.radius +=
            this.settings
                .shockwaveSpeed;


        if (
            this.shockwave.radius >=
            this.settings
                .shockwaveRadius
        ) {

            this.shockwave.active =
                false;
        }
    }




    // PARTICLE PHYSICS


    updateParticle(particle) {



        // MOUSE REPULSION

        const dx =
            particle.x -
            this.mouse.x;


        const dy =
            particle.y -
            this.mouse.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <
            this.settings.mouseRadius
            &&
            distance > 0
        ) {

            const directionX =
                dx / distance;


            const directionY =
                dy / distance;


            const force =
                (
                    (
                        this.settings
                            .mouseRadius -
                        distance
                    )
                    /
                    this.settings
                        .mouseRadius
                )
                *
                this.settings
                    .repulsionStrength;


            particle.vx +=
                directionX *
                force;


            particle.vy +=
                directionY *
                force;
        }


        // SHOCKWAVE

        if (
            this.shockwave.active
        ) {

            const waveDx =
                particle.x -
                this.shockwave.x;


            const waveDy =
                particle.y -
                this.shockwave.y;


            const waveDistance =
                Math.sqrt(
                    waveDx * waveDx +
                    waveDy * waveDy
                );


            const distanceFromWave =
                Math.abs(
                    waveDistance -
                    this.shockwave.radius
                );


            if (
                distanceFromWave <
                this.settings
                    .shockwaveThickness
                &&
                waveDistance > 0
            ) {

                const directionX =
                    waveDx /
                    waveDistance;


                const directionY =
                    waveDy /
                    waveDistance;


                const force =
                    (
                        1 -
                        (
                            distanceFromWave /
                            this.settings
                                .shockwaveThickness
                        )
                    )
                    *
                    this.settings
                        .shockwaveStrength;


                particle.vx +=
                    directionX *
                    force;


                particle.vy +=
                    directionY *
                    force;
            }
        }


        // SPRING TO HOME POSITION

        const springX =
            particle.homeX -
            particle.x;


        const springY =
            particle.homeY -
            particle.y;


        particle.vx +=
            springX *
            this.settings
                .springStrength;


        particle.vy +=
            springY *
            this.settings
                .springStrength;



        // DAMPING


        particle.vx *=
            this.settings.damping;


        particle.vy *=
            this.settings.damping;



        // MORPH FADE


        particle.alpha +=
            (
                particle.targetAlpha -
                particle.alpha
            )
            *
            this.settings.morphSpeed;



        // POSITION


        particle.x +=
            particle.vx;


        particle.y +=
            particle.vy;
    }



    // DRAW PARTICLE

    drawParticle(particle) {

        const alpha =
            (
                particle.a / 255
            )
            *
            particle.alpha;


        if (alpha <= 0) {
            return;
        }


        this.ctx.beginPath();


        this.ctx.arc(
            particle.x,
            particle.y,

            this.settings
                .particleRadius,

            0,
            Math.PI * 2
        );


        this.ctx.fillStyle =
            `rgba(
                ${particle.r},
                ${particle.g},
                ${particle.b},
                ${alpha}
            )`;


        this.ctx.fill();
    }




    // ANIMATION


    animate() {

        if (
            this.isDestroyed
        ) {
            return;
        }


        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        this.updateShockwave();


        // Backwards because dead
        // particles may be removed
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


            // Completely faded extra particle
            if (
                particle.targetAlpha === 0
                &&
                particle.alpha < 0.01
            ) {

                this.particles.splice(
                    i,
                    1
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
    }



    // DESTROY ONE ENGINE


    destroy() {

        if (
            this.isDestroyed
        ) {
            return;
        }


        this.isDestroyed = true;


        if (
            this.animationFrameId !== null
        ) {

            cancelAnimationFrame(
                this.animationFrameId
            );

            this.animationFrameId =
                null;
        }


        this.canvas.removeEventListener(
            "pointermove",
            this.handlePointerMove
        );


        this.canvas.removeEventListener(
            "pointerleave",
            this.handlePointerLeave
        );


        this.canvas.removeEventListener(
            "pointerdown",
            this.handlePointerDown
        );


        this.particles.length = 0;


        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }
}





// HIGH LEVEL SCATTER API

export class Scatter {

    static instances = [];



    // INIT

    static init(
        globalOptions = {}
    ) {

        const elements =
            document.querySelectorAll(
                "[data-scatter]"
            );


        elements.forEach(
            (element) => {

                if (
                    element.dataset
                        .scatterInitialized ===
                    "true"
                ) {
                    return;
                }


                const options =
                    Scatter
                        .getElementOptions(
                            element,
                            globalOptions
                        );


                if (
                    element.tagName ===
                    "IMG"
                ) {

                    Scatter
                        .createFromImage(
                            element,
                            options
                        );
                }

                else {

                    Scatter
                        .createFromText(
                            element,
                            options
                        );
                }
            }
        );
    }



    // ELEMENT OPTIONS


    static getElementOptions(
        element,
        globalOptions = {}
    ) {

        const elementOptions = {};


        const numberSettings = {

            scatterGap:
                "gap",

            scatterParticleRadius:
                "particleRadius",

            scatterMouseRadius:
                "mouseRadius",

            scatterRepulsionStrength:
                "repulsionStrength",

            scatterSpringStrength:
                "springStrength",

            scatterDamping:
                "damping",

            scatterShockwaveRadius:
                "shockwaveRadius",

            scatterShockwaveSpeed:
                "shockwaveSpeed",

            scatterShockwaveThickness:
                "shockwaveThickness",

            scatterShockwaveStrength:
                "shockwaveStrength",

            scatterMorphSpeed:
                "morphSpeed"
        };


        for (
            const datasetKey
            in numberSettings
        ) {

            if (
                element.dataset[
                datasetKey
                ] === undefined
            ) {
                continue;
            }


            const value =
                Number(
                    element.dataset[
                    datasetKey
                    ]
                );


            if (
                !Number.isNaN(value)
            ) {

                elementOptions[
                    numberSettings[
                    datasetKey
                    ]
                ] = value;
            }
        }


        if (
            element.dataset
                .scatterShockwave
            !== undefined
        ) {

            elementOptions.shockwave =
                element.dataset
                    .scatterShockwave
                    .toLowerCase()
                !== "false";
        }


        return {

            ...globalOptions,
            ...elementOptions
        };
    }



    // POSITION CANVAS OVER SOURCE

    static positionCanvas(
        element,
        canvas
    ) {

        const rect =
            element
                .getBoundingClientRect();


        canvas.style.position =
            "absolute";


        canvas.style.left =
            `${rect.left +
            window.scrollX
            }px`;


        canvas.style.top =
            `${rect.top +
            window.scrollY
            }px`;


        canvas.style.width =
            `${rect.width}px`;


        canvas.style.height =
            `${rect.height}px`;


        canvas.style.margin = "0";
        canvas.style.padding = "0";

        canvas.style.pointerEvents =
            "auto";

        canvas.style.zIndex =
            "1";
    }



    // RENDER TEXT ONTO CANVAS

    static renderText(
        element,
        canvas,
        renderColor
    ) {

        const text =
            element
                .textContent
                .trim();


        const ctx =
            canvas.getContext(
                "2d"
            );


        if (!ctx) {
            return;
        }


        const style =
            getComputedStyle(
                element
            );


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        if (!text) {
            return;
        }


        ctx.font =
            `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;


        // IMPORTANT:
        // source element is transparent,
        // so use saved original color.
        ctx.fillStyle =
            renderColor;


        ctx.textAlign =
            style.textAlign;


        ctx.textBaseline =
            "alphabetic";


        const metrics =
            ctx.measureText(
                text
            );


        const ascent =
            metrics
                .actualBoundingBoxAscent;


        const descent =
            metrics
                .actualBoundingBoxDescent;


        const textHeight =
            ascent +
            descent;


        const y =
            (
                canvas.height -
                textHeight
            )
            / 2
            +
            ascent;


        let x = 0;


        if (
            style.textAlign ===
            "center"
        ) {

            x =
                canvas.width /
                2;
        }

        else if (
            style.textAlign ===
            "right"
            ||
            style.textAlign ===
            "end"
        ) {

            x =
                canvas.width;
        }


        ctx.fillText(
            text,
            x,
            y
        );
    }



    // CREATE TEXT SCATTER

    static createFromText(
        element,
        options
    ) {

        const text =
            element
                .textContent
                .trim();


        if (!text) {
            return;
        }


        const rect =
            element
                .getBoundingClientRect();


        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }


        const style =
            getComputedStyle(
                element
            );


        // Save original inline color
        const originalInlineColor =
            element.style.color;


        // Save actual rendered color
        // BEFORE making element transparent
        const renderColor =
            style.color;



        // CREATE CANVAS

        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            Math.ceil(
                rect.width
            );


        canvas.height =
            Math.ceil(
                rect.height
            );


        // Initial text render
        Scatter.renderText(
            element,
            canvas,
            renderColor
        );



        // OVERLAY CANVAS

        document.body.appendChild(
            canvas
        );


        Scatter.positionCanvas(
            element,
            canvas
        );



        // HIDE ORIGINAL TEXT

        element.style.color =
            "transparent";


        element.dataset
            .scatterInitialized =
            "true";



        // START ENGINE

        const engine =
            new ScatterEngine(
                canvas,
                options
            );



        // INSTANCE

        const instance = {

            type: "text",

            element,
            canvas,
            engine,
            options,

            originalInlineColor,
            renderColor,

            mutationObserver: null
        };



        // WATCH TEXT CHANGES

        const observer =
            new MutationObserver(
                () => {

                    Scatter
                        .updateTextInstance(
                            instance
                        );
                }
            );


        observer.observe(
            element,
            {
                childList: true,
                characterData: true,
                subtree: true
            }
        );


        instance.mutationObserver =
            observer;


        Scatter.instances.push(
            instance
        );
    }



    // TEXT CHANGED → MORPH

    static updateTextInstance(
        instance
    ) {

        const {
            element,
            canvas,
            engine,
            renderColor
        } = instance;


        if (
            engine.isDestroyed
        ) {
            return;
        }

        // Check if element size changed (due to font-size updates)
        const rect =
            element.getBoundingClientRect();

        if (
            rect.width > 0 &&
            rect.height > 0
        ) {
            const newWidth = Math.ceil(rect.width);
            const newHeight = Math.ceil(rect.height);

            if (canvas.width !== newWidth || canvas.height !== newHeight) {
                canvas.width = newWidth;
                canvas.height = newHeight;
                Scatter.positionCanvas(element, canvas);
            }
        }


        // Render new text temporarily
        Scatter.renderText(
            element,
            canvas,
            renderColor
        );


        // Read new text pixels
        const targets =
            engine.samplePixels();


        // Remove temporary text.
        // Animation loop will draw particles.
        engine.ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // Existing particles morph
        engine.morph(
            targets
        );
    }



    // IMAGE

    static createFromImage(
        element,
        options
    ) {

        if (
            element.complete &&
            element.naturalWidth > 0
        ) {

            Scatter
                .drawImageToCanvas(
                    element,
                    options
                );
        }

        else {

            element.addEventListener(
                "load",

                () => {

                    Scatter
                        .drawImageToCanvas(
                            element,
                            options
                        );
                },

                {
                    once: true
                }
            );
        }
    }



    // IMAGE → CANVAS

    static drawImageToCanvas(
        element,
        options
    ) {

        if (
            element.dataset
                .scatterInitialized ===
            "true"
        ) {
            return;
        }


        const rect =
            element
                .getBoundingClientRect();


        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            Math.ceil(
                rect.width
            );


        canvas.height =
            Math.ceil(
                rect.height
            );


        const ctx =
            canvas.getContext(
                "2d"
            );


        if (!ctx) {
            return;
        }


        ctx.drawImage(
            element,

            0,
            0,

            canvas.width,
            canvas.height
        );


        document.body.appendChild(
            canvas
        );


        Scatter.positionCanvas(
            element,
            canvas
        );


        const originalInlineOpacity =
            element.style.opacity;


        element.style.opacity =
            "0";


        element.dataset
            .scatterInitialized =
            "true";


        const engine =
            new ScatterEngine(
                canvas,
                options
            );


        Scatter.instances.push({

            type: "image",

            element,
            canvas,
            engine,
            options,

            originalInlineOpacity,

            mutationObserver: null
        });
    }



    // DESTROY ALL

    static destroy() {

        for (
            const instance
            of Scatter.instances
        ) {

            // Stop MutationObserver
            if (
                instance
                    .mutationObserver
            ) {

                instance
                    .mutationObserver
                    .disconnect();
            }


            // Stop engine
            instance.engine.destroy();


            // Remove overlay
            instance.canvas.remove();



            if (
                instance.type ===
                "image"
            ) {

                instance.element
                    .style.opacity =
                    instance
                        .originalInlineOpacity;
            }

            else {

                instance.element
                    .style.color =
                    instance
                        .originalInlineColor;
            }


            delete instance
                .element
                .dataset
                .scatterInitialized;
        }

        Scatter.instances.length = 0;
    }
}