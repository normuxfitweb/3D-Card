(function () {
    let width, height;

    // set initial sizing
    height = window.innerHeight;
    width = window.innerWidth;

    // For the devs who like to mess with the screen ;)
    window.addEventListener("resize", () => {
    height = window.innerHeight;
    width = window.innerWidth;
    });

    // In this example, we just grab the mouse for some animation fun
    let screenX, screenY;
    let endDelta = {x: 0, y: 0};
    let startDelta = {x: 0, y: 0};
    document.addEventListener("mousemove", (e) => {
    const { x, y } = e;
    screenY = y / height;
    screenX = x / width;
    });

    // Adding some touch events for mobile functionality... comming soon, need to get my head around it. :/
    window.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const { clientX: x, clientY: y } = touch;
    screenY = y / height;
    screenX = x / width;
    });
    
    window.addEventListener("touchstart", (e) => {
    const touch = e.touches[0];
    const {clientX: x, clientY: y} = touch
    startDelta = {x, y};
    })
    
    window.addEventListener("touchend", (e) => {
    const touch = e.touches[0];
    const {clientX: x, clientY: y} = touch
    endDelta = {x, y};
    })

    const containerHandle = document.querySelector(".container");
    const cardHandle = document.querySelector(".threedee-container");

    // Little helper to register and set css properties for html element styles
    function cssPropertyModifier(element) {
    const propertyControllers = [];

    function registerProperties(...propsTuple) {
        propsTuple.forEach((propTuple) => propertyControllers.push(propTuple));
    }
    function setProperties(t) {
        const styleString = propertyControllers.reduce((str, controller) => {
        return (str += `${controller[0]}:${controller[1](t)};`);
        }, "");
        element.style = styleString;
    }
    return {
        registerProperties,
        setProperties
    };
    }

    // Helper to set some sensible boundaries, assumes 0 <= t <= 1
    const boundaries = (min = 0, max = 1, t = 0) => {
    return min + t * (max - min);
    };

    // Lots of secret nunbers – this is the creative bit. Animate all the things!
    // Property Modifier Tuple – [css-property-name, frame-number => do fun stuff here...]
    // Make sure the units returned by the modifier function make sense to css

    const onMouseMoveColorCycle = cssPropertyModifier(containerHandle);
    onMouseMoveColorCycle.registerProperties(
    [
        "--bg-gradient-angle",
        (t) => `${boundaries(-60, 167, Math.sin(t / 500))}deg`
    ],
    [
        "--bg-gradient-hue-start",
        (t) =>
        `${boundaries(279, 330 + 45 * Math.cos(t / 300), screenX * screenY)}`
    ],
    [
        "--bg-gradient-hue-end",
        (t) => `${boundaries(10 + 30 * Math.sin(t / 400), 70, screenX * screenY)}`
    ]
    );

    const onMouseMoveRotate = cssPropertyModifier(cardHandle);
    onMouseMoveRotate.registerProperties(
    ["--x-rotate", () => `${boundaries(-35, 35, screenY)}deg`],
    ["--y-rotate", () => `${boundaries(35, -35, screenX)}deg`],
    ["--blur", () => `${boundaries(0, 0.6, Math.pow(2 * screenX - 1, 2))}px`],
    [
        "--glass-rotation",
        (t) =>
        `${boundaries(
            -12,
            95 - 22 * Math.sin(t / 120),
            Math.pow(2 * screenX - 1, 3)
        )}deg`
    ],
    [
        "--glass-alpha-low",
        () => `${boundaries(0, 0.03, Math.pow(2 * screenX - 1, 2))}`
    ],
    [
        "--glass-alpha-high",
        () => `${boundaries(0.1, 0.04, Math.pow(2 * screenX - 1, 2))}`
    ],
    [
        "--glass-stop-start",
        () => `${boundaries(4, 20, Math.pow(2 * screenX - 1, 2))}%`
    ],
    [
        "--glass-stop-middle",
        () => `${boundaries(20, 90, Math.pow(2 * screenX - 1, 2))}%`
    ],
    [
        "--glass-stop-end",
        () => `${boundaries(8, 110, Math.pow(2 * screenX - 1, 2))}%`
    ]
    );

    // Build Animator initalised with functions to animate then returns an updater
    // update takes a frame limit (perf maybe?) and returns an animation cancel (reduce motion?)

    function buildAnimator(...fns) {
    let frame = 0;
    return function update(frameLimit = 1) {
        if (frame % frameLimit === 0) {
        fns.forEach((fn) => {
            fn(frame);
        });
        }
        frame = requestAnimationFrame(() => update(frameLimit));
        return function cancel(
        cleanUp = ({ frame, fns }) =>
            console.info("animation cancelled", { frame, fns })
        ) {
        // pass in some clean up actions
        cancelAnimationFrame(frame);
        cleanUp({ frame, fns });
        };
    };
    }

    // Animate the things!
    const update = buildAnimator(
    onMouseMoveRotate.setProperties,
    onMouseMoveColorCycle.setProperties
    );

    // Set frame limiting, run animator fns every "n" RAF's
    const cancel = update(4);
})();
