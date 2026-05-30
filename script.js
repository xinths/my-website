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
const serviceSelect = document.querySelector("#service-select");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const planMatrix = {
  small: {
    weekly: ["Essential Care", "$300 - $650/mo"],
    multi: ["Business Shine", "$650 - $1,250/mo"],
    nightly: ["Crown Maintenance", "$1,250 - $2,400/mo"],
  },
  medium: {
    weekly: ["Business Shine", "$750 - $1,500/mo"],
    multi: ["Business Shine", "$1,700 - $3,400/mo"],
    nightly: ["Crown Maintenance", "$3,000 - $6,200/mo"],
  },
  large: {
    weekly: ["Crown Maintenance", "Custom walkthrough quote"],
    multi: ["Crown Maintenance", "Custom facility plan"],
    nightly: ["Crown Maintenance", "Priority facility plan"],
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
  const [plan, range] = planMatrix[size][frequency];

  let finalPlan = plan;
  if (addOns.length >= 2 && plan === "Essential Care") {
    finalPlan = "Business Shine";
  }
  if (addOns.length >= 3 || size === "large") {
    finalPlan = "Crown Maintenance";
  }

  estimatePlan.textContent = finalPlan;
  estimateRange.textContent = `Planning range: ${range}`;
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
      formNote.textContent = `${packageName} selected. Add your contact details and facility notes.`;
    }
  });
});

if (shineDemo && shineSlider) {
  shineSlider.addEventListener("input", () => {
    shineDemo.style.setProperty("--reveal", `${shineSlider.value}%`);
  });
}

if (quoteForm && formNote) {
  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formNote.textContent = "Walkthrough request prepared. Add a real form endpoint before launch.";
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
