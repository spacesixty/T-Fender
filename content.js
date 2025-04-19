// content.js
const DEBUG = true;

function showDebugOverlay(emailData) {
  let existing = document.getElementById("email-debug-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "email-debug-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "20px";
  overlay.style.right = "20px";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.color = "#fff";
  overlay.style.padding = "12px";
  overlay.style.borderRadius = "10px";
  overlay.style.zIndex = "999999";
  overlay.style.maxWidth = "350px";
  overlay.style.fontSize = "12px";
  overlay.style.fontFamily = "monospace";
  overlay.style.whiteSpace = "pre-wrap";
  overlay.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";

  overlay.textContent = `\n🛠 DEBUG - Extracted Email:\nFrom: ${emailData.sender}\nDate: ${emailData.date}\nSubject: ${emailData.subject}\nBody: ${emailData.body.slice(0, 300)}...\n  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 8000);
}

function extractEmailDetails() {
  try {
    const sender = document.querySelector('span.gD')?.innerText || "";
    const subject = document.querySelector('h2.hP')?.innerText || "";
    const date = document.querySelector('span.g3')?.getAttribute('title') || "";
    const body = document.querySelector('div[role="listitem"]')?.innerText || "";

    if (!body || !subject) return null;

    const emailData = { sender, subject, date, body };

    if (DEBUG) {
      console.log("📬 Extracted Email Data:", emailData);
      showDebugOverlay(emailData);
    }

    sendEmailDetailsToBackground(emailData);
    return emailData;

  } catch (err) {
    console.error("❌ Error extracting email:", err);
    return null;
  }
}

function sendEmailDetailsToBackground(emailData) {
  chrome.runtime.sendMessage({
    type: "EMAIL_CONTENT",
    payload: emailData
  }, (response) => {
    if (response && response.status !== undefined) {
      console.log("Prediction status:", response.status);
    } else {
      console.error("Error receiving prediction status");
    }
  });
}

let lastHash = "";
setInterval(() => {
  const email = extractEmailDetails();
  if (!email) return;

  const currentHash = JSON.stringify(email);
  if (currentHash !== lastHash) {
    lastHash = currentHash;
    sendEmailDetailsToBackground(email);
  }
}, 3000);