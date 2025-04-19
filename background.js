importScripts('ort.min.js'); // Load ONNX runtime

let model = null;

// Load the ONNX model
async function loadModel() {
  try {
    model = await ort.InferenceSession.create('email_classification_pipeline.onnx');
    console.log('✅ ONNX model loaded successfully!');
  } catch (err) {
    console.error('❌ Error loading ONNX model:', err);
  }
}

// Run prediction
async function predictEmailString(inputString) {
  if (!model) {
    throw new Error('Model not loaded yet!');
  }

  console.log("🧠 Running prediction with input:", inputString);

  const tensor = new ort.Tensor('string', [inputString], [1]);
  const feeds = { input: tensor }; // 'input' must match the model's input name

  const output = await model.run(feeds);
  console.log("📦 Model raw output:", output);

  const firstKey = Object.keys(output)[0];
  const result = output[firstKey].data[0];

  console.log("✅ Prediction result:", result);

  return result >= 0.5 ? 1 : 0; // Assume binary classification (0=safe, 1=malicious)
}

// Load the model on install
chrome.runtime.onInstalled.addListener(() => {
  loadModel();
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EMAIL_CONTENT") {
    const { sender, subject, date, body } = message.payload;
    const inputString = `${sender} ${date} ${subject} ${body}`;

    predictEmailString(inputString)
      .then(prediction => {
        console.log("🧠 Final prediction:", prediction);

        // Store the email details and prediction
        chrome.storage.local.set({
          emailDetails: message.payload,
          emailSafetyStatus: prediction
        });

        sendResponse({ status: prediction });
      })
      .catch(err => {
        console.error("❌ Prediction error:", err);
        sendResponse({ status: 0 }); // Default to "safe" on failure
      });

    return true; // Keep the message channel open for async response
  }
});
