document.addEventListener("DOMContentLoaded", () => {
  const statusDiv = document.getElementById("status");
  const emailDetailsDiv = document.getElementById("email-details");

  function updatePopup(emailDetails, emailSafetyStatus) {
    if (!emailDetails) {
      statusDiv.textContent = "No email data available.";
      return;
    }

    const isMalicious = emailSafetyStatus === 1;
    statusDiv.textContent = isMalicious ? "⚠️ Malicious Email Detected" : "✅ Safe Email";
    statusDiv.className = `status ${isMalicious ? "Malicious" : "Safe"}`;

    emailDetailsDiv.innerHTML = `
      <strong>From:</strong> ${emailDetails.sender}<br>
      <strong>Date:</strong> ${emailDetails.date}<br>
      <strong>Subject:</strong> ${emailDetails.subject}<br><br>
      <div><strong>Body:</strong><br>${emailDetails.body.slice(0, 500)}...</div>
    `;
  }

  // Initial load
  chrome.storage.local.get(["emailDetails", "emailSafetyStatus"], (data) => {
    updatePopup(data.emailDetails, data.emailSafetyStatus);
  });

  // Listen for changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.emailDetails || changes.emailSafetyStatus) {
      chrome.storage.local.get(["emailDetails", "emailSafetyStatus"], (data) => {
        updatePopup(data.emailDetails, data.emailSafetyStatus);
      });
    }
  });
});
