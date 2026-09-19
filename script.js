const INVITATION = {
  couple: { first: "Olivia", second: "Ralph" },
  // Fecha visible en la referencia. Sustituye por la fecha real y conserva el offset de México.
  eventDate: "2025-05-18T14:00:00-06:00",
  maps: {
    ceremony: "",
    reception: ""
  },
  whatsappNumber: "",
  rsvpDeadline: "[fecha por confirmar]"
};

const entry = document.querySelector("#entry");
const openButton = document.querySelector("#openInvitation");
const invitation = document.querySelector("#invitacion");
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4300);
}

function openInvitation() {
  entry.classList.add("is-open");
  document.body.classList.remove("locked");
  window.setTimeout(() => {
    entry.hidden = true;
    invitation.focus({ preventScroll: true });
  }, 900);
}

openButton.addEventListener("click", openInvitation);
entry.addEventListener("keydown", (event) => {
  if (event.key === "Escape") openInvitation();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entryItem) => {
    if (!entryItem.isIntersecting) return;
    entryItem.target.classList.add("is-visible");
    observer.unobserve(entryItem.target);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -7%" });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function updateCountdown() {
  const eventTime = new Date(INVITATION.eventDate).getTime();
  const remaining = Math.max(0, eventTime - Date.now());
  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60)
  };

  Object.entries(values).forEach(([id, value]) => {
    document.querySelector(`#${id}`).textContent = String(value).padStart(id === "days" ? 3 : 2, "0");
  });

  if (remaining === 0) {
    document.querySelector("#countdown").hidden = true;
    document.querySelector("#countdownEnded").hidden = false;
  }
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

document.querySelectorAll("[data-map]").forEach((link) => {
  const url = INVITATION.maps[link.dataset.map];
  if (url) {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.classList.remove("is-pending");
  } else {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showToast("La ubicación todavía está por confirmar. Agrega la URL real en script.js.");
    });
  }
});

document.querySelector("#rsvpButton").addEventListener("click", () => {
  if (!INVITATION.whatsappNumber) {
    showToast("El canal de confirmación aún no está configurado. Agrega el número real en script.js para habilitar WhatsApp.");
    return;
  }

  const message = encodeURIComponent(`Hola ${INVITATION.couple.first} y ${INVITATION.couple.second}. Confirmo mi asistencia a su boda. Mi nombre es:`);
  window.open(`https://wa.me/${INVITATION.whatsappNumber}?text=${message}`, "_blank", "noopener,noreferrer");
});

document.querySelector("#backToTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});

// Vista de control local: index.html?preview=1 omite la portada sin afectar el sitio público.
if (new URLSearchParams(window.location.search).has("preview")) {
  openInvitation();
}
