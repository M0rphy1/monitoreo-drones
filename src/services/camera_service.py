from flask import Flask, render_template, Response, jsonify
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import os
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Configuración del modelo MobileNet SSD
prototxt = "../models/MobileNetSSD_deploy.prototxt.txt"
model = "../models/MobileNetSSD_deploy.caffemodel"
net = cv2.dnn.readNetFromCaffe(prototxt, model)

# Lista de clases
classes = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]

# Colores para las clases
colors = np.random.uniform(0, 255, size=(len(classes), 3))

# 📌 Nueva ubicación para guardar los videos
VIDEO_DIR = r"C:\Users\USER\Desktop\Videos-proyecto"
os.makedirs(VIDEO_DIR, exist_ok=True)

# Variables globales
recording = False
video_writer = None
user_notified_class = None
already_notified = False

# 📡 URL del video del dron (reemplaza con la URL real)
video_url = "http://190.63.37.250:8080/hls/dji.m3u8"

def detect_and_stream():
    global recording, video_writer, user_notified_class, already_notified

    cap = cv2.VideoCapture(video_url)

    if not cap.isOpened():
        print("No se pudo abrir la transmisión del dron.")
        return

    while True:
        start_time = time.time()  # 📌 Tiempo antes de capturar el frame

        ret, frame = cap.read()
        if not ret:
            print("No se pudo leer el frame.")
            break

        received_time = time.time()  # 📌 Tiempo después de recibir el frame
        latency_ms = (received_time - start_time) * 1000  # 📌 Calcular latencia en ms
        socketio.emit('latency', {'latency': latency_ms})

        (h, w) = frame.shape[:2]

        # 📌 Mostrar la latencia en el frame de video
        cv2.putText(frame, f"Latency: {latency_ms:.2f} ms", (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Preprocesar el frame para el modelo
        blob = cv2.dnn.blobFromImage(frame, 0.007843, (300, 300), 127.5)
        net.setInput(blob)
        detections = net.forward()

        # Detección de objetos
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence > 0.2:
                idx = int(detections[0, 0, i, 1])
                label = classes[idx]

                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (startX, startY, endX, endY) = box.astype("int")

                color = colors[idx]
                cv2.rectangle(frame, (startX, startY), (endX, endY), color, 2)
                text = f"{label}: {confidence:.2f}"
                cv2.putText(frame, text, (startX, startY - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                # Enviar notificación si se detecta la clase configurada
                if user_notified_class and label == user_notified_class and not already_notified:
                    socketio.emit('notification', {'message': f'{label} detectado'})
                    already_notified = True

        # 📌 Si la grabación está activada, guardar el frame
        if recording:
            if video_writer is None:
                fourcc = cv2.VideoWriter_fourcc(*'XVID')
                timestamp = int(time.time())
                video_path = os.path.join(VIDEO_DIR, f'video_{timestamp}.avi')

                # 🔹 CONFIGURAR FPS (ajusta el valor según sea necesario, prueba con 15 o 30)
                video_writer = cv2.VideoWriter(video_path, fourcc, 15.0, (w, h))

            video_writer.write(frame)

        # Codificar la imagen procesada como JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        # Stream de video
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()
    if video_writer:
        video_writer.release()
        video_writer = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(detect_and_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start-recording', methods=['POST'])
def start_recording():
    global recording
    recording = True
    socketio.emit('recording-status', {'status': 'Grabación iniciada'})
    return jsonify({'message': 'Grabación iniciada'})

@app.route('/stop-recording', methods=['POST'])
def stop_recording():
    global recording, video_writer
    recording = False
    if video_writer:
        video_writer.release()
        video_writer = None
    socketio.emit('recording-status', {'status': 'Grabación detenida'})
    return jsonify({'message': 'Grabación detenida'})

@app.route('/list-videos', methods=['GET'])
def list_videos():
    videos = [f for f in os.listdir(VIDEO_DIR) if f.endswith('.avi')]
    return jsonify(videos)

@app.route('/videos/<filename>')
def get_video(filename):
    return Response(open(os.path.join(VIDEO_DIR, filename), 'rb').read(), mimetype='video/x-msvideo')

@socketio.on('set_notification_class')
def set_notification_class(data):
    global user_notified_class, already_notified
    user_notified_class = data['class']
    already_notified = False
    emit('confirmation', {'message': f'Notificaciones configuradas para la clase: {user_notified_class}'})

if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
