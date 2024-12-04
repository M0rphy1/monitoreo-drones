import os
from flask import Flask, Response
import cv2
import numpy as np

# Crear aplicación Flask
app = Flask(__name__)

# Obtener la ruta base del archivo actual
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configurar el modelo
prototxt = os.path.join(BASE_DIR, "../models/MobileNetSSD_deploy.prototxt.txt")
model = os.path.join(BASE_DIR, "../models/MobileNetSSD_deploy.caffemodel")
net = cv2.dnn.readNetFromCaffe(prototxt, model)

classes = ["background", "aeroplane", "bicycle", "bird", "boat",
           "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
           "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
           "sofa", "train", "tvmonitor"]

colors = np.random.uniform(0, 255, size=(len(classes), 3))

# Ruta para iniciar la detección
@app.route('/start-camera')
def start_camera():
    def detect_objects():
        cap = cv2.VideoCapture(0)  # Cámara principal
        if not cap.isOpened():
            return "No se pudo abrir la cámara", 500

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            (h, w) = frame.shape[:2]
            blob = cv2.dnn.blobFromImage(frame, 0.007843, (300, 300), 127.5)
            net.setInput(blob)
            detections = net.forward()

            for i in range(detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                if confidence > 0.2:
                    idx = int(detections[0, 0, i, 1])
                    label = classes[idx]
                    color = colors[idx]

                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")
                    cv2.rectangle(frame, (startX, startY), (endX, endY), color, 2)
                    text = f"{label}: {confidence:.2f}"
                    cv2.putText(frame, text, (startX, startY - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            # Codificar el frame para transmisión
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        cap.release()

    return Response(detect_objects(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Iniciar el servidor
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

