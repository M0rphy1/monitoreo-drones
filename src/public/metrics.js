const socket = new WebSocket("ws://localhost:8080");

socket.addEventListener("open", () => {
    console.log("🔗 Conectado al servidor WebSocket");
});

socket.addEventListener("message", (event) => {
    console.log("📡 Nueva métrica recibida en tiempo real:", JSON.parse(event.data));
});

// Función para enviar métricas a la API REST
async function sendMetrics() {
    if (!window.performance || !window.performance.timing) return;

    const timing = window.performance.timing;
    const navigationStart = timing.navigationStart;

    // Obtener métricas de tiempo en milisegundos
    const responseEnd = Math.max(0, timing.responseEnd - navigationStart);
    const requestStart = Math.max(0, timing.requestStart - navigationStart);
    const loadEventEnd = Math.max(requestStart, timing.loadEventEnd - navigationStart);
    const domInteractive = Math.max(0, timing.domInteractive - navigationStart);

    const metrics = {
        response_end: responseEnd,
        request_start: requestStart,
        load_event_end: loadEventEnd,
        dom_interactive: domInteractive
    };

    try {
        const response = await fetch("http://localhost:5000/api/metrics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(metrics)
        });

        console.log("✅ Métricas enviadas a la API:", await response.json());
    } catch (error) {
        console.error("❌ Error al enviar métricas:", error);
    }
}

// Enviar métricas cuando la página cargue completamente
window.addEventListener("load", sendMetrics);
