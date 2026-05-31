const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.querySelector("#year");
const quoteForm = document.querySelector("#quote-form");
const formNote = document.querySelector("#form-note");
const estimateWidget = document.querySelector("#estimate-widget");
const estimatePlan = document.querySelector("#estimate-plan");
const estimateRange = document.querySelector("#estimate-range");
const shineDemo = document.querySelector(".shine-demo");
const shineSlider = document.querySelector("#shine-slider");
const demoStage = document.querySelector(".demo-stage");
const serviceSelect = document.querySelector("#service-select");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js-enabled");

const officeSliderStyles = "slider.css?v=20260531-1";

const planMatrix = {
  small: {
    weekly: ["Essential Care", "Scope summary: weekly reset for offices and suites."],
    multi: ["Business Shine", "Scope summary: recurring cleaning with floor care included."],
    nightly: ["Crown Maintenance", "Scope summary: high-frequency care for busy spaces."],
  },
  medium: {
    weekly: ["Business Shine", "Scope summary: larger weekly plan with priority zones."],
    multi: ["Business Shine", "Scope summary: multi-day cleaning plus floor refreshes."],
    nightly: ["Crown Maintenance", "Scope summary: nightly service for high-traffic areas."],
  },
  large: {
    weekly: ["Crown Maintenance", "Scope summary: custom facility plan after walkthrough."],
    multi: ["Crown Maintenance", "Scope summary: recurring facility plan with add-ons."],
    nightly: ["Crown Maintenance", "Scope summary: priority facility plan for heavy use."],
  },
};

const loadOfficeSliderStyles = () => {
  if (document.querySelector(`link[href="${officeSliderStyles}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = officeSliderStyles;
  document.head.appendChild(link);
};

const enhanceOfficeSlider = () => {
  if (!shineDemo || !shineSlider || !demoStage) return;

  loadOfficeSliderStyles();
  shineDemo.style.setProperty("--clean", "58%");
  shineSlider.value = "58";
  shineSlider.setAttribute("aria-label", "Adjust dirty-to-clean office preview");
  demoStage.setAttribute("role", "img");
  demoStage.setAttribute("aria-label", "Office lobby before and after cleaning comparison");
  demoStage.removeAttribute("aria-hidden");

  const sliderLabel = document.querySelector(".slider-label");
  if (sliderLabel?.firstChild) {
    sliderLabel.firstChild.textContent = "Drag to compare before and after ";
  }

  demoStage.innerHTML = `
    <div class="demo-layer demo-before" aria-hidden="true">
      <div class="office-scene">
        <div class="office-wall">
          <div class="office-window window-left"><span></span><span></span></div>
          <div class="office-window window-right"><span></span><span></span></div>
          <i class="smudge smudge-one"></i>
          <i class="smudge smudge-two"></i>
          <i class="smudge smudge-three"></i>
        </div>
        <div class="reception-desk"><span></span><i></i></div>
        <div class="lounge-chair"></div>
        <div class="trash-bin"><span></span></div>
        <i class="floor-mark mark-one"></i>
        <i class="floor-mark mark-two"></i>
        <i class="floor-mark mark-three"></i>
        <i class="floor-mark mark-four"></i>
      </div>
      <span class="demo-label">Before</span>
    </div>
    <div class="demo-layer demo-after" aria-hidden="true">
      <div class="office-scene">
        <div class="office-wall">
          <div class="office-window window-left"><span></span><span></span></div>
          <div class="office-window window-right"><span></span><span></span></div>
        </div>
        <div class="reception-desk"><span></span><i></i></div>
        <div class="lounge-chair"></div>
        <div class="trash-bin"><span></span></div>
        <i class="floor-shine shine-one"></i>
        <i class="floor-shine shine-two"></i>
        <i class="floor-shine shine-three"></i>
        <i class="floor-shine shine-four"></i>
      </div>
      <span class="demo-label">After</span>
    </div>
    <div class="demo-handle"><span>Drag</span></div>
  `;
};

enhanceOfficeSlider();

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

const updateEstimate = () => {
  if (!estimateWidget || !estimatePlan || !estimateRange) return;

  const formData = new FormData(estimateWidget);
  const size = formData.get("size") || "small";
  const frequency = formData.get("frequency") || "weekly";
  const addOns = formData.getAll("addon");
  const [plan, summary] = planMatrix[size][frequency];

  let finalPlan = plan;
  if (addOns.length >= 2 && plan === "Essential Care") {
    finalPlan = "Business Shine";
  }
  if (addOns.length >= 3 || size === "large") {
    finalPlan = "Crown Maintenance";
  }

  estimatePlan.textContent = finalPlan;
  estimateRange.textContent = summary;
};

if (estimateWidget) {
  estimateWidget.addEventListener("input", updateEstimate);
  updateEstimate();
}

document.querySelectorAll(".package-select").forEach((button) => {
  button.addEventListener("click", () => {
    const packageName = button.closest(".package-card")?.dataset.package;
    if (!packageName) return;

    if (serviceSelect) {
      const matchingOption = Array.from(serviceSelect.options).find((option) =>
        option.textContent.includes(packageName)
      );
      if (matchingOption) serviceSelect.value = matchingOption.value;
    }

    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (formNote) {
      formNote.textContent = `${packageName} selected. Complete the form with facility notes.`;
    }
  });
});

if (shineDemo && shineSlider) {
  const updateShine = (value) => {
    const cleanValue = Math.max(15, Math.min(85, Number(value)));
    shineSlider.value = String(cleanValue);
    shineDemo.style.setProperty("--clean", `${cleanValue}%`);
  };

  shineSlider.addEventListener("input", () => {
    updateShine(shineSlider.value);
  });

  if (demoStage) {
    const updateFromPointer = (event) => {
      const bounds = demoStage.getBoundingClientRect();
      const percent = ((event.clientX - bounds.left) / bounds.width) * 100;
      updateShine(percent);
    };

    demoStage.addEventListener("pointerdown", (event) => {
      demoStage.setPointerCapture(event.pointerId);
      updateFromPointer(event);
    });

    demoStage.addEventListener("pointermove", (event) => {
      if (demoStage.hasPointerCapture(event.pointerId)) {
        updateFromPointer(event);
      }
    });

    demoStage.addEventListener("pointerup", (event) => {
      if (demoStage.hasPointerCapture(event.pointerId)) {
        demoStage.releasePointerCapture(event.pointerId);
      }
    });
  }

  updateShine(shineSlider.value);
}

if (quoteForm && formNote) {
  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formNote.textContent = "Thanks. Your quote follow-up details are ready.";
  });
}

if (prefersReducedMotion) {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 55, 220)}ms`;
    revealObserver.observe(element);
  });
}

const animateCount = (element) => {
  const target = Number(element.dataset.count || 0);
  let current = 0;
  const step = () => {
    current += 1;
    element.textContent = String(current);
    if (current < target) window.requestAnimationFrame(step);
  };
  step();
};

document.querySelectorAll("[data-count]").forEach((element) => {
  if (prefersReducedMotion) {
    element.textContent = element.dataset.count;
    return;
  }

  const countObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        animateCount(element);
        countObserver.disconnect();
      }
    },
    { threshold: 0.5 }
  );

  countObserver.observe(element);
});
