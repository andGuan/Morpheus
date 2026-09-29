const $ = (selector) => document.querySelector(selector);
const selection = { guestName: "", plate: "", cutlery: "", glass: "" };

const catalog = {
  plate: [
    { id: "silver", name: "Champlevé Silver", detail: "Hand-finished charger", art: "plate-silver" },
    { id: "limoges", name: "Limoges Porcelain", detail: "White porcelain", art: "plate-limoges" },
    { id: "diamond", name: "Diamond Crystal", detail: "Lalique crystal", art: "plate-diamond" },
    { id: "royal", name: "Royal Gold", detail: "Gilt-edged porcelain", art: "plate-royal" },
    { id: "ginori", name: "Ginori 1735", detail: "Italian fine china", art: "plate-ginori" },
  ],
  cutlery: [
    { id: "classic", name: "Classic Silver", detail: "Polished sterling", art: "flatware-knife" },
    { id: "modern", name: "Modern Silver", detail: "Contemporary profile", art: "flatware-fork" },
    { id: "ornate", name: "Ornate Silver", detail: "Engraved handles", art: "flatware-salad" },
    { id: "heirloom", name: "Heirloom Gold", detail: "Warm gold finish", art: "flatware-spoon" },
    { id: "louche", name: "Louche", detail: "Refined proportions", art: "flatware-butter" },
  ],
  glass: [
    { id: "water", name: "Water Goblet", detail: "Lalique crystal", art: "glass-water", image: "cup/stemware2.png" },
    { id: "red", name: "Red Wine", detail: "Grand Bourgogne", art: "glass-red", image: "cup/stemware1.png" },
    { id: "white", name: "White Wine", detail: "Fine crystal", art: "glass-white", image: "cup/stemware2.png" },
    { id: "champagne", name: "Champagne Flute", detail: "Crystal flute", art: "glass-champagne", image: "cup/stemware1.png" },
    { id: "liqueur", name: "Liqueur", detail: "After-dinner crystal", art: "glass-liqueur" },
  ],
};

const screens = ["loginView", "atelierView", "selectionView", "confirmationView"];

function showScreen(id) {
  screens.forEach((screenId) => $(`#${screenId}`).classList.toggle("is-hidden", screenId !== id));
  window.scrollTo(0, 0);
}

function selectedItem(type) {
  return catalog[type].find((item) => item.id === selection[type]);
}

function renderOptions(type, containerId) {
  const container = $(`#${containerId}`);
  container.innerHTML = catalog[type].map((item) => `
    <button class="option-card ${selection[type] === item.id ? "is-selected" : ""}" type="button" data-type="${type}" data-id="${item.id}" aria-pressed="${selection[type] === item.id}">
      <span class="item-art ${item.image ? "product-art" : item.art}" aria-hidden="true">${item.image ? `<img src="${item.image}" alt="">` : ""}</span>
      <strong>${item.name}</strong><small>${item.detail}</small>
    </button>`).join("");
}

function renderTable(surfaceId) {
  const plate = selectedItem("plate");
  const cutlery = selectedItem("cutlery");
  const glass = selectedItem("glass");
  const surface = $(`#${surfaceId}`);
  surface.className = `table-surface ${cutlery ? `finish-${cutlery.id}` : ""}`;
  surface.innerHTML = [
    plate && `<span class="table-piece ${plate.art}" title="${plate.name}"></span>`,
    cutlery && `<span class="table-piece flatware-knife"></span><span class="table-piece flatware-fork"></span><span class="table-piece flatware-spoon"></span>`,
    glass && (glass.image
      ? `<img class="table-piece product-piece" src="${glass.image}" alt="${glass.name}" title="${glass.name}">`
      : `<span class="table-piece ${glass.art}" title="${glass.name}"></span>`),
  ].filter(Boolean).join("");
}

function renderSelection() {
  renderOptions("plate", "plateOptions");
  renderOptions("cutlery", "cutleryOptions");
  renderOptions("glass", "glassOptions");
  renderTable("tableSurface");
  const plate = selectedItem("plate");
  const cutlery = selectedItem("cutlery");
  const glass = selectedItem("glass");
  $("#previewPlateName").textContent = plate ? plate.name : "Select a plate to begin";
  $("#previewGuestName").textContent = selection.guestName ? `PREPARED FOR ${selection.guestName.toUpperCase()}` : "";
  $("#summaryPlate").textContent = plate ? plate.name : "Not selected";
  $("#summaryCutlery").textContent = cutlery ? cutlery.name : "Not selected";
  $("#summaryGlass").textContent = glass ? glass.name : "Not selected";
  const ready = Boolean(plate && cutlery && glass);
  $("#reviewButton").disabled = !ready;
  $("#reviewButton").innerHTML = ready ? 'Review your table setting <span>→</span>' : 'Choose all three details <span>→</span>';
  if (selection.guestName) sessionStorage.setItem("lalique-selection", JSON.stringify(selection));
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

$("#loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#guestName").value.trim();
  const accessCode = $("#accessCode").value.trim().toUpperCase();
  if (!name) return;
  if (accessCode !== "ATELIER26" && accessCode !== "123456") {
    showToast("Invalid welcome code. Please check your confirmation email.");
    return;
  }
  selection.guestName = name;
  sessionStorage.setItem("lalique-guest", name);
  showScreen("atelierView");
});

const videoDialog = $("#videoDialog");
const introVideo = $("#introVideo");
const videoFallback = $("#videoFallback");

function showVideoFallback() {
  const errorMessages = {
    1: "Video loading was interrupted. Please try again.",
    2: "The introduction video could not be loaded.",
    3: "The introduction video could not be decoded.",
    4: "This browser cannot play the introduction video format."
  };
  videoFallback.textContent = errorMessages[introVideo.error?.code] || "The introduction film will be available soon.";
  introVideo.hidden = true;
  videoFallback.classList.remove("is-hidden");
}

introVideo.addEventListener("error", showVideoFallback);

$("#videoTrigger").addEventListener("click", () => {
  videoDialog.showModal();
  introVideo.hidden = false;
  videoFallback.classList.add("is-hidden");
  if (introVideo.error || introVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    showVideoFallback();
    return;
  }
  introVideo.play().catch((error) => {
    console.error("Introduction video playback failed.", error);
    videoFallback.textContent = "Playback could not start. Use the video controls to try again.";
    videoFallback.classList.remove("is-hidden");
  });
});

function closeVideo() {
  introVideo.pause();
  videoDialog.close();
}

$("#closeVideoButton").addEventListener("click", closeVideo);
videoDialog.addEventListener("click", (event) => {
  if (event.target === videoDialog) closeVideo();
});

$("#continueButton").addEventListener("click", () => {
  renderSelection();
  showScreen("selectionView");
});

document.addEventListener("click", (event) => {
  const option = event.target.closest(".option-card[data-type]");
  if (!option) return;
  selection[option.dataset.type] = option.dataset.id;
  renderSelection();
});

$("#swapPlateButton").addEventListener("click", () => {
  const currentIndex = catalog.plate.findIndex((item) => item.id === selection.plate);
  selection.plate = catalog.plate[(currentIndex + 1) % catalog.plate.length].id;
  renderSelection();
});

$("#reviewButton").addEventListener("click", () => {
  if (!selection.plate || !selection.cutlery || !selection.glass) return;
  const plate = selectedItem("plate");
  const cutlery = selectedItem("cutlery");
  const glass = selectedItem("glass");
  $("#confirmationGuestName").textContent = selection.guestName;
  $("#confirmationPlateName").textContent = plate.name;
  $("#confirmationDetails").textContent = `${cutlery.name} · ${glass.name}`;
  renderTable("confirmationSurface");
  showScreen("confirmationView");
});

$("#editSelectionButton").addEventListener("click", () => showScreen("selectionView"));

$("#confirmSettingButton").addEventListener("click", (event) => {
  event.currentTarget.disabled = true;
  event.currentTarget.textContent = "Table setting confirmed";
  $("#confirmationThanks").textContent = `Thank you, ${selection.guestName}. We look forward to welcoming you.`;
  $("#confirmationThanks").classList.add("is-confirmed");
  sessionStorage.setItem("lalique-selection", JSON.stringify(selection));
});

function logout() {
  closeVideo();
  Object.assign(selection, { guestName: "", plate: "", cutlery: "", glass: "" });
  sessionStorage.removeItem("lalique-guest");
  sessionStorage.removeItem("lalique-selection");
  $("#confirmSettingButton").disabled = false;
  $("#confirmSettingButton").innerHTML = 'Confirm Table Setting <span>→</span>';
  $("#confirmationThanks").textContent = "Thank you for choosing us. We look forward to welcoming you.";
  $("#confirmationThanks").classList.remove("is-confirmed");
  $("#loginForm").reset();
  showScreen("loginView");
}

$("#logoutButton").addEventListener("click", logout);
$("#selectionLogoutButton").addEventListener("click", logout);
$("#confirmLogoutButton").addEventListener("click", logout);

const rememberedGuest = sessionStorage.getItem("lalique-guest");
if (rememberedGuest) {
  selection.guestName = rememberedGuest;
  try {
    const savedSelection = JSON.parse(sessionStorage.getItem("lalique-selection") || "null");
    if (savedSelection && savedSelection.guestName === rememberedGuest) {
      ["plate", "cutlery", "glass"].forEach((type) => {
        if (catalog[type].some((item) => item.id === savedSelection[type])) selection[type] = savedSelection[type];
      });
    }
  } catch {}
  renderSelection();
  showScreen("selectionView");
}
