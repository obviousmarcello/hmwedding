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

// Add the recipient address here when it is available.
// The first submission will trigger a FormSubmit confirmation email.
const recipientEmail = "";

document.querySelector("#rsvp-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = formData.get("name").trim();
  const attendance = formData.get("attendance");
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type='submit']");
  const buttonLabel = button.querySelector(".button__label");

  status.className = "form-status";

  if (!recipientEmail) {
    status.textContent = "Az űrlap még nincs email-címhez kapcsolva. Kérjük, próbáld újra később.";
    status.classList.add("is-error");
    return;
  }

  const attendanceLabels = {
    full: "Igen, egész nap",
    ceremony: "Igen, csak a szertartáson",
    no: "Sajnos nem tud részt venni"
  };

  button.disabled = true;
  buttonLabel.textContent = "Küldés…";
  status.textContent = "A válasz küldése folyamatban…";

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        Név: name,
        Részvétel: attendanceLabels[attendance],
        _subject: `Új esküvői visszajelzés — ${name}`,
        _template: "table",
        _honey: formData.get("_honey")
      })
    });

    if (!response.ok) throw new Error("Submission failed");

    status.textContent = `Köszönjük, ${name}! A válaszod sikeresen megérkezett.`;
    status.classList.add("is-success");
    form.reset();
  } catch (error) {
    status.textContent = "A küldés most nem sikerült. Kérjük, próbáld újra néhány perc múlva.";
    status.classList.add("is-error");
  } finally {
    button.disabled = false;
    buttonLabel.textContent = "Válasz elküldése";
  }
});
