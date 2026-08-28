const $ = (id) => document.getElementById(id);

const elements = {
  cameraState: $("camera-state"),
  placeholder: $("video-placeholder"),
  video: $("video-feed"),
  caption: $("feed-caption"),
  start: $("start-button"),
  stop: $("stop-button"),
  index: $("camera-index"),
  anpr: $("enable-anpr"),
  message: $("message"),
  frames: $("frames"),
  fps: $("fps"),
  failures: $("read-failures"),
  count: $("detection-count"),
  detections: $("detections"),
};

let feedStarted = false;

function setMessage(text, kind = "") {
  elements.message.textContent = text;
  elements.message.className = `message ${kind}`;
}

function setRunning(running) {
  elements.cameraState.textContent = running ? "Live" : "Idle";
  elements.cameraState.className = `state-badge ${running ? "live" : "idle"}`;
  elements.start.disabled = running;
  elements.stop.disabled = !running;
  elements.index.disabled = running;
  elements.anpr.disabled = running;
  if (running) {
    elements.placeholder.hidden = true;
    elements.video.hidden = false;
    elements.caption.textContent = "LIVE · INFERENCE ONLY";
  } else {
    elements.placeholder.hidden = false;
    elements.video.hidden = true;
    elements.caption.textContent = "NO SIGNAL";
    feedStarted = false;
  }
}

function renderDetections(detections) {
  elements.count.textContent = detections.length;
  if (!detections.length) {
    elements.detections.className = "detections empty-state";
    elements.detections.textContent = "No detections in the latest frame.";
    return;
  }
  elements.detections.className = "detections";
  elements.detections.innerHTML = detections.map((detection) => {
    const label = detection.label.replaceAll("_", " ");
    const detail = detection.attributes?.plate_number || (detection.track_id ? `Track #${detection.track_id}` : "Box detected");
    return `<div class="detection-row"><span class="detection-icon ${detection.label}"></span><div><strong>${label}</strong><small>${detail}</small></div><b>${Math.round(detection.confidence * 100)}%</b></div>`;
  }).join("");
}

async function refreshStatus() {
  try {
    const response = await fetch("/api/status/", { cache: "no-store" });
    const state = await response.json();
    setRunning(Boolean(state.running));
    elements.frames.textContent = state.frames ?? 0;
    elements.fps.textContent = Number(state.fps ?? 0).toFixed(2);
    elements.failures.textContent = state.read_failures ?? 0;
    renderDetections(state.last_detections ?? []);
    if (state.last_error) {
      setMessage(state.last_error, "error");
    } else if (state.running) {
      setMessage("Camera is running. Results are held in memory only.", "success");
    }
  } catch (error) {
    setMessage("Django debug server is not reachable.", "error");
  }
}

async function startCamera() {
  setMessage("Starting camera and loading models…");
  elements.start.disabled = true;
  try {
    const response = await fetch("/api/camera/start/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        camera_index: Number(elements.index.value || 0),
        enable_anpr: elements.anpr.checked,
      }),
    });
    const state = await response.json();
    if (!response.ok) throw new Error(state.error || "Could not start camera");
    if (!feedStarted) {
      elements.video.src = `/api/video/?started=${Date.now()}`;
      feedStarted = true;
    }
    setMessage("Camera requested. The first frame may take longer while models load.");
    await refreshStatus();
  } catch (error) {
    setMessage(error.message, "error");
    elements.start.disabled = false;
  }
}

async function stopCamera() {
  setMessage("Stopping camera…");
  try {
    await fetch("/api/camera/stop/", { method: "POST" });
    await refreshStatus();
    setMessage("Camera stopped. No frames were saved or uploaded.");
  } catch (error) {
    setMessage(error.message, "error");
  }
}

elements.start.addEventListener("click", startCamera);
elements.stop.addEventListener("click", stopCamera);
elements.video.addEventListener("error", () => setMessage("Video stream disconnected; check the camera index.", "error"));

refreshStatus();
