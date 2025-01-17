import os
from flask import Flask, Response, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
import cv2
import time
import numpy as np

# Inicializa la aplicación Flask y SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuración del directorio de videos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_DIR = os.path.join(BASE_DIR, "videos")
os.makedirs(VIDEO_DIR, exist_ok=True)  # Crea el directorio de videos si no existe

# Configuración del modelo de detección de objetos
prototxt = os.path.join(BASE_DIR, "../models/MobileNetSSD_deploy.prototxt.txt")
model = os.path.join(BASE_DIR, "../models/MobileNetSSD_deploy.caffemodel")
net = cv2.dnn.readNetFromCaffe(prototxt, model)  # Carga el modelo preentrenado

# Clases y colores para los objetos detectados
classes = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]
colors = np.random.uniform(0, 255, size=(len(classes), 3))

# Variables globales
user_notified_class = None  # Clase configurada para notificaciones
already_notified = False    # Bandera para evitar notificaciones repetidas
recording = False           # Estado de grabación
video_writer = None         # Objeto para escribir videos

# Ruta para iniciar la cámara y detección de objetos
@app.route('/start-camera')
def start_camera():
    def detect_objects():
        global user_notified_class, already_notified, recording, video_writer
        cap = cv2.VideoCapture(0)  # Abre la cámara

        if not cap.isOpened():
            return "No se pudo abrir la cámara", 500

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Preprocesamiento de la imagen
            frame = cv2.resize(frame, (1280, 720))
            (h, w) = frame.shape[:2]
            blob = cv2.dnn.blobFromImage(frame, 0.007843, (300, 300), 127.5)
            net.setInput(blob)
            detections = net.forward()  # Realiza la detección de objetos

            for i in range(detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                if confidence > 0.2:  # Filtra detecciones con confianza menor al 20%
                    idx = int(detections[0, 0, i, 1])
                    label = classes[idx]
                    color = colors[idx]

                    # Dibuja un cuadro delimitador y etiqueta en la imagen
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")
                    cv2.rectangle(frame, (startX, startY), (endX, endY), color, 2)
                    text = f"{label}: {confidence:.2f}"
                    cv2.putText(frame, text, (startX, startY - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                    # Envía una notificación si se detecta la clase configurada
                    if user_notified_class and label == user_notified_class and not already_notified:
                        socketio.emit('notification', {'message': f'{label} detectado'})
                        already_notified = True

            # Graba el video si está habilitada la grabación
            if recording:
                if video_writer is None:
                    fourcc = cv2.VideoWriter_fourcc(*'XVID')
                    timestamp = int(time.time())
                    video_writer = cv2.VideoWriter(os.path.join(VIDEO_DIR, f'video_{timestamp}.avi'), fourcc, 20.0, (w, h))
                video_writer.write(frame)

            # Convierte el frame a bytes para enviar al cliente
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        cap.release()
        if video_writer:
            video_writer.release()
            video_writer = None

    return Response(detect_objects(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Ruta para iniciar la grabación
@app.route('/start-recording', methods=['POST'])
def start_recording():
    global recording
    recording = True
    socketio.emit('recording-status', {'status': 'Grabación iniciada'})
    return jsonify({'message': 'Grabación iniciada'})

# Ruta para detener la grabación
@app.route('/stop-recording', methods=['POST'])
def stop_recording():
    global recording, video_writer
    recording = False
    if video_writer:
        video_writer.release()
        video_writer = None
    socketio.emit('recording-status', {'status': 'Grabación detenida'})
    return jsonify({'message': 'Grabación detenida'})

# Ruta para listar los videos grabados
@app.route('/list-videos', methods=['GET'])
def list_videos():
    videos = [f for f in os.listdir(VIDEO_DIR) if f.endswith('.avi')]
    return jsonify(videos)

# Ruta para descargar un video específico
@app.route('/videos/<filename>')
def get_video(filename):
    return send_from_directory(VIDEO_DIR, filename)

# Evento de socket para configurar la clase de notificación
@socketio.on('set_notification_class')
def set_notification_class(data):
    global user_notified_class, already_notified
    user_notified_class = data['class']
    already_notified = False
    emit('confirmation', {'message': f'Notificaciones configuradas para la clase: {user_notified_class}'})

# Inicia la aplicación Flask con soporte para SocketIO
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
