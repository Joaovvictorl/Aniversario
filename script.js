const final = document.getElementById("final");
const memories = document.querySelectorAll(".memory");

/* =========================
   CONTADOR DESDE O NASCIMENTO
========================= */

const timeAlive = document.getElementById("timeAlive");

function updateCounter() {
    if (!timeAlive) return;

    const birthDateText = document.body.dataset.birth;
    const birthDate = new Date(birthDateText);
    const now = new Date();

    const diffTime = now - birthDate;
    const totalSeconds = Math.floor(diffTime / 1000);

    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    timeAlive.textContent =
        `${days.toLocaleString("pt-BR")} dias ` +
        `${hours} horas ` +
        `${minutes} minutos e ` +
        `${seconds} segundos`;
}

updateCounter();
setInterval(updateCounter, 1000);

/* =========================
   ESTRELAS QUE NASCEM NO SCROLL
========================= */

const starsCanvas = document.getElementById("stars");
const starsContext = starsCanvas.getContext("2d");

let stars = [];
let scrollLife = 0;

function getScrollLife() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) {
        return 0;
    }

    return Math.min(window.scrollY / maxScroll, 1);
}

function updateScrollLife() {
    scrollLife = getScrollLife();
    document.body.style.setProperty("--life", scrollLife.toFixed(3));
}

function resizeStarsCanvas() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;

    createStars();
    updateScrollLife();
}

function createStars() {
    stars = [];

    const amount = window.innerWidth < 600 ? 190 : 290;

    for (let i = 0; i < amount; i++) {
        stars.push({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            radius: Math.random() * 1.9 + 0.25,
            baseOpacity: Math.random() * 0.65 + 0.18,
            pulse: Math.random() * 0.018 + 0.004,
            direction: Math.random() > 0.5 ? 1 : -1,
            revealAt: Math.random()
        });
    }
}

function drawStars() {
    starsContext.clearRect(
        0,
        0,
        starsCanvas.width,
        starsCanvas.height
    );

    const visibleLimit = 0.08 + scrollLife * 0.92;

    stars.forEach(star => {
        if (star.revealAt > visibleLimit) {
            return;
        }

        star.baseOpacity += star.pulse * star.direction;

        if (star.baseOpacity >= 0.95 || star.baseOpacity <= 0.15) {
            star.direction *= -1;
        }

        const birthProgress = Math.min(
            Math.max((visibleLimit - star.revealAt) / 0.12, 0),
            1
        );

        const opacity = star.baseOpacity * birthProgress * (0.28 + scrollLife * 0.72);

        starsContext.beginPath();

        starsContext.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );

        starsContext.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        starsContext.fill();
    });

    requestAnimationFrame(drawStars);
}

resizeStarsCanvas();
drawStars();

window.addEventListener("scroll", updateScrollLife, { passive: true });
window.addEventListener("resize", resizeStarsCanvas);

/* =========================
   REVELAR TEXTOS AO ROLAR
========================= */

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.2
});

memories.forEach(memory => observer.observe(memory));

if (final) {
    observer.observe(final);
}

/* =========================
   REVELAR POLAROIDS AO ROLAR
========================= */

const polaroidTitle = document.querySelector(".polaroid-title");
const polaroids = document.querySelectorAll(".polaroid");

const polaroidObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.25
});

if (polaroidTitle) {
    polaroidObserver.observe(polaroidTitle);
}

polaroids.forEach((polaroid, index) => {
    polaroid.style.transitionDelay = `${index * 0.12}s`;
    polaroidObserver.observe(polaroid);
});

/* =========================
   SENHA DO COMEÇO
========================= */

const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const passwordError = document.getElementById("passwordError");

const correctPassword = "27052003";

let passwordUnlocked = false;

function lockPasswordScreen() {
    document.body.classList.add("locked");
    document.documentElement.classList.add("locked");

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.documentElement.style.height = "100vh";

    window.scrollTo(0, 0);
}

function unlockPasswordScreen() {
    passwordUnlocked = true;

    document.body.classList.remove("locked");
    document.documentElement.classList.remove("locked");

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.body.style.height = "";
    document.documentElement.style.height = "";

    if (passwordForm) {
        passwordForm.classList.add("unlocked");

        setTimeout(() => {
            passwordForm.style.display = "none";
        }, 850);
    }
}

if (passwordForm && passwordInput && passwordError) {
    lockPasswordScreen();

    passwordForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const typedPassword = passwordInput.value.trim();

        if (typedPassword === correctPassword) {
            passwordError.classList.remove("show");
            unlockPasswordScreen();
            return;
        }

        passwordError.classList.add("show");
        passwordInput.value = "";
        passwordInput.focus();

        passwordForm.animate(
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-6px)" },
                { transform: "translateX(6px)" },
                { transform: "translateX(0)" }
            ],
            {
                duration: 260,
                easing: "ease"
            }
        );
    });
}

/* =========================
   CONSTELAÇÃO COM SWIPE
========================= */

const constellationGate = document.getElementById("constellationGate");
const skyMap = document.getElementById("skyMap");
const constellationLines = document.getElementById("constellationLines");
const constellationMessage = document.getElementById("constellationMessage");
const constellationSuccess = document.getElementById("constellationSuccess");
const starPoints = document.querySelectorAll(".star-point");
const hintButton = document.getElementById("hintButton");
const hintText = document.getElementById("hintText");

const requiredStars = ["s3", "e6", "s5", "s6"];

const wrongMessages = {
    e1: "quase... mas não é essa",
    e2: "essa não parece certa",
    e3: "tenta outra",
    e4: "essa não faz parte",
    e5: "você está perto",
    e6: "essa não",
    e7: "quase acertou",
    e8: "não é essa",
    e9: "olha melhor",
    e10: "essa ficou fora",
    e11: "tenta outro caminho",
    e12: "essa não entra"
};

let constellationStarted = false;
let constellationCompleted = false;
let isDrawingConstellation = false;
let selectedStarIds = [];
let selectedStarElements = [];
let errorTimeout = null;
let previewLine = null;


function lockConstellation() {
    if (!passwordUnlocked) return;
    if (constellationCompleted || constellationStarted) return;
    if (!constellationGate) return;

    constellationStarted = true;

    document.body.classList.add("constellation-locked");
    document.documentElement.classList.add("constellation-locked");

    constellationGate.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function unlockConstellation() {
    constellationCompleted = true;
    isDrawingConstellation = false;

    document.body.classList.remove("constellation-locked");
    document.documentElement.classList.remove("constellation-locked");

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    document.body.style.height = "";
    document.documentElement.style.height = "";

    if (constellationMessage) {
        constellationMessage.classList.remove("error");
        constellationMessage.textContent = "agora você pode continuar";
    }

    if (constellationSuccess) {
        constellationSuccess.classList.add("show");
    }

    setTimeout(() => {
        window.scrollTo({
            top: constellationGate.offsetTop + constellationGate.offsetHeight,
            behavior: "smooth"
        });
    }, 650);
}

const constellationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (
            entry.isIntersecting &&
            passwordUnlocked &&
            !constellationCompleted &&
            !constellationStarted
        ) {
            lockConstellation();
        }
    });
}, {
    threshold: 0.65
});

if (constellationGate) {
    constellationObserver.observe(constellationGate);
}

function getStarCenter(star) {
    const mapRect = skyMap.getBoundingClientRect();
    const starRect = star.getBoundingClientRect();

    return {
        x: starRect.left + starRect.width / 2 - mapRect.left,
        y: starRect.top + starRect.height / 2 - mapRect.top
    };
}

function getPointerPosition(event) {
    const mapRect = skyMap.getBoundingClientRect();

    return {
        x: event.clientX - mapRect.left,
        y: event.clientY - mapRect.top
    };
}

function createLightningLine(firstStar, secondStar) {
    const first = getStarCenter(firstStar);
    const second = getStarCenter(secondStar);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    line.setAttribute("x1", first.x);
    line.setAttribute("y1", first.y);
    line.setAttribute("x2", second.x);
    line.setAttribute("y2", second.y);

    constellationLines.appendChild(line);
}

function createPreviewLine(fromStar, pointer) {
    if (!fromStar) return;

    const from = getStarCenter(fromStar);

    previewLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    previewLine.classList.add("preview-line");

    previewLine.setAttribute("x1", from.x);
    previewLine.setAttribute("y1", from.y);
    previewLine.setAttribute("x2", pointer.x);
    previewLine.setAttribute("y2", pointer.y);

    constellationLines.appendChild(previewLine);
}

function updatePreviewLine(pointer) {
    if (!previewLine) return;

    previewLine.setAttribute("x2", pointer.x);
    previewLine.setAttribute("y2", pointer.y);
}

function removePreviewLine() {
    if (!previewLine) return;

    previewLine.remove();
    previewLine = null;
}

function resetConstellation() {
    selectedStarIds = [];
    selectedStarElements = [];
    removePreviewLine();

    if (constellationLines) {
        constellationLines.innerHTML = "";
    }

    starPoints.forEach((star) => {
        star.classList.remove("selected");
        star.classList.remove("wrong");
    });
}

function showConstellationError(starId, starElement) {
    clearTimeout(errorTimeout);

    const message = wrongMessages[starId] || "essa estrela não faz parte do caminho.";

    isDrawingConstellation = false;

    if (constellationMessage) {
        constellationMessage.classList.add("error");
        constellationMessage.textContent = message;
    }

    starElement.classList.add("wrong");
    removePreviewLine();

    errorTimeout = setTimeout(() => {
        resetConstellation();

        if (constellationMessage) {
            constellationMessage.classList.remove("error");
            constellationMessage.textContent = "tente de novo";
        }
    }, 1900);
}

function checkIfCompleted() {
    const completed = requiredStars.every((starId) => selectedStarIds.includes(starId));

    if (completed) {
        unlockConstellation();
    }
}

function selectStar(star) {
    const starId = star.dataset.star;

    if (constellationCompleted) return;

    if (!requiredStars.includes(starId)) {
        showConstellationError(starId, star);
        return;
    }

    if (selectedStarIds.includes(starId)) return;

    const previousStar = selectedStarElements[selectedStarElements.length - 1];

    star.classList.add("selected");
    selectedStarIds.push(starId);
    selectedStarElements.push(star);

    removePreviewLine();

    if (previousStar) {
        createLightningLine(previousStar, star);
    }

    if (constellationMessage) {
        constellationMessage.classList.remove("error");
        constellationMessage.textContent = "continua ligando...";
    }

    checkIfCompleted();
}

function getStarTouchedByPointer(event) {
    const pointerX = event.clientX;
    const pointerY = event.clientY;

    let touchedStar = null;

    starPoints.forEach((star) => {
        const rect = star.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = Math.hypot(pointerX - centerX, pointerY - centerY);

        if (distance <= 30) {
            touchedStar = star;
        }
    });

    return touchedStar;
}

if (skyMap) {
    skyMap.addEventListener("pointerdown", (event) => {
        if (constellationCompleted) return;

        event.preventDefault();

        isDrawingConstellation = true;
        skyMap.setPointerCapture(event.pointerId);

        const touchedStar = getStarTouchedByPointer(event);

        if (touchedStar) {
            selectStar(touchedStar);
        }
    });

    skyMap.addEventListener("pointermove", (event) => {
        if (!isDrawingConstellation || constellationCompleted) return;

        event.preventDefault();

        const pointer = getPointerPosition(event);
        const lastStar = selectedStarElements[selectedStarElements.length - 1];

        if (lastStar && !previewLine) {
            createPreviewLine(lastStar, pointer);
        }

        updatePreviewLine(pointer);

        const touchedStar = getStarTouchedByPointer(event);

        if (touchedStar) {
            selectStar(touchedStar);
        }
    });

    skyMap.addEventListener("pointerup", (event) => {
        if (!isDrawingConstellation) return;

        isDrawingConstellation = false;
        removePreviewLine();

        try {
            skyMap.releasePointerCapture(event.pointerId);
        } catch {
            /* nada */
        }
    });

    skyMap.addEventListener("pointercancel", () => {
        isDrawingConstellation = false;
        removePreviewLine();
    });
}

function isConstellationLocked() {
    return document.body.classList.contains("constellation-locked");
}

window.addEventListener("wheel", (event) => {
    if (isConstellationLocked() && !constellationCompleted) {
        event.preventDefault();
    }
}, { passive: false });

window.addEventListener("touchmove", (event) => {
    if (isConstellationLocked() && !constellationCompleted) {
        event.preventDefault();
    }
}, { passive: false });

window.addEventListener("keydown", (event) => {
    const blockedKeys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " "
    ];

    if (
        isConstellationLocked() &&
        !constellationCompleted &&
        blockedKeys.includes(event.key)
    ) {
        event.preventDefault();
    }
});

if (hintButton && hintText) {
    hintButton.addEventListener("click", () => {
        hintButton.style.display = "none";
        hintText.classList.remove("hidden");
    });
}
