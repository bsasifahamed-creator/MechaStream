import socketio
import time

# Test WebSocket execution
sio = socketio.Client()

@sio.event
def connect():
    print("Connected to WebSocket")

@sio.event
def disconnect():
    print("Disconnected from WebSocket")

@sio.on('execution_start')
def on_execution_start(data):
    print(f"Execution started: {data}")

@sio.on('execution_output')
def on_execution_output(data):
    print(f"Output: {data}")

@sio.on('execution_complete')
def on_execution_complete(data):
    print(f"Execution complete: {data}")
    sio.disconnect()

@sio.on('execution_error')
def on_execution_error(data):
    print(f"Execution error: {data}")
    sio.disconnect()

# Connect and test
sio.connect('http://localhost:5000')
sio.emit('execute_code', {'code': 'print("WebSocket test successful!")', 'language': 'python'})

# Wait for completion
time.sleep(5)
