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
