from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello, Flask is working!"

if __name__ == '__main__':
    print("Starting simple Flask test...")
    print("Access at: http://localhost:5000")
    app.run(host='localhost', port=5000, debug=False) 