from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os

from routes.generate import bp as generate_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(generate_bp)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')

    # Simple response logic
    if 'hello' in message.lower() or 'hi' in message.lower():
        response = "Hello! How can I help you today?"
    elif 'bye' in message.lower() or 'goodbye' in message.lower():
        response = "Goodbye! Have a great day!"
    elif 'how are you' in message.lower():
        response = "I'm doing well, thank you for asking!"
    else:
        response = f"I received your message: {message}"

    return jsonify({'response': response})

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')