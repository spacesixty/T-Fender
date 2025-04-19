let session;

async function loadModel() {
  if (!session) {
    session = await ort.InferenceSession.create(
      chrome.runtime.getURL("email_classification_pipeline.onnx")
    );
  }
  return session;
}

function preprocessInput(inputString) {
  const inputTensor = new ort.Tensor("string", [inputString], [1]);
  return { input: inputTensor };
}

// Attach to window so content.js can use it
window.predictEmailString = async function(text) {
  const model = await loadModel();
  const feeds = preprocessInput(text);
  const results = await model.run(feeds);
  const output = results[Object.keys(results)[0]];
  const prediction = Array.isArray(output.data) ? output.data[0] : output.data;
  return prediction >= 0.5 ? 1 : 0;
};
