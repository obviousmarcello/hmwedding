const weddingDate = new Date("2026-10-03T15:00:00+02:00");
const counters = Object.fromEntries(
  [...document.querySelectorAll("[data-count]")].map((element) => [element.dataset.count, element])
);

function updateCountdown() {
  const difference = Math.max(0, weddingDate.getTime() - Date.now());
  const day = 86_400_000;
  counters.days.textContent = Math.floor(difference / day);
  counters.hours.textContent = String(Math.floor((difference % day) / 3_600_000)).padStart(2, "0");
  counters.minutes.textContent = String(Math.floor((difference % 3_600_000) / 60_000)).padStart(2, "0");
  counters.seconds.textContent = String(Math.floor((difference % 60_000) / 1_000)).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const menuButton = document.querySelector(".nav__toggle");
const menu = document.querySelector(".nav__links");

function closeMenu() {
  menu.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.textContent = "Menü";
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.textContent = isOpen ? "Bezárás" : "Menü";
  document.body.classList.toggle("menu-open", isOpen);
});

menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.querySelector("#rsvp-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = new FormData(event.currentTarget).get("name").trim();
  const status = event.currentTarget.querySelector(".form-status");
  status.textContent = `Köszönjük, ${name}! A válaszod rögzítésének végleges módját hamarosan összekötjük az oldallal.`;
  event.currentTarget.reset();
});
