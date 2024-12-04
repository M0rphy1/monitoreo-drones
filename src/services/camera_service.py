import os
from flask import Flask, Response
from flask_socketio import SocketIO, emit
import cv2
import numpy as np

# Crear aplicación Flask y habilitar SocketIO
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Obtener la ruta base del archivo actual
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configurar el modelo
prototxt = os.path.join(BASE_DIR, "../models/MobileNetSSD_deploy.prototxt.txt")
model = os.path.join(BASE_DIR, "../models/MobileNetSSD_deploy.caffemodel")
net = cv2.dnn.readNetFromCaffe(prototxt, model)

# Clases del modelo MobileNetSSD
classes = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]

# Colores para las clases detectadas
colors = np.random.uniform(0, 255, size=(len(classes), 3))

# Variable global para la clase configurada por el usuario
user_notified_class = None
already_notified = False  # Variable para controlar las notificaciones


@app.route('/start-camera')
def start_camera():
    def detect_objects():
        global user_notified_class, already_notified
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            return "No se pudo abrir la cámara", 500

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Redimensionar el frame
            frame = cv2.resize(frame, (1280, 720))  # Resolución estándar 16:9
            (h, w) = frame.shape[:2]

            # Preprocesar el frame para la red neuronal
            blob = cv2.dnn.blobFromImage(frame, 0.007843, (300, 300), 127.5)
            net.setInput(blob)
            detections = net.forward()

            # Dibujar las detecciones en el frame
            for i in range(detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                if confidence > 0.2:  # Confianza mínima para mostrar la detección
                    idx = int(detections[0, 0, i, 1])
                    label = classes[idx]
                    color = colors[idx]

                    # Coordenadas de la caja delimitadora
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")

                    # Dibujar la caja y el texto
                    cv2.rectangle(frame, (startX, startY), (endX, endY), color, 2)
                    text = f"{label}: {confidence:.2f}"
                    cv2.putText(frame, text, (startX, startY - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                    # Notificar al cliente si la clase detectada coincide con la configurada
                    if user_notified_class and label == user_notified_class and not already_notified:
                        socketio.emit('notification', {'message': f'{label} detectado'})
                        already_notified = True  # Evitar múltiples notificaciones

            # Codificar el frame para transmitirlo como MJPEG
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        cap.release()

    # Responder con el stream MJPEG
    return Response(detect_objects(), mimetype='multipart/x-mixed-replace; boundary=frame')


@socketio.on('set_notification_class')
def set_notification_class(data):
    global user_notified_class, already_notified
    user_notified_class = data['class']
    already_notified = False  # Resetear la notificación al configurar una nueva clase
    emit('confirmation', {'message': f'Notificaciones configuradas para la clase: {user_notified_class}'})


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
