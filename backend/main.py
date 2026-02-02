from app import create_app
import os

app = create_app()  # Create Flask application instance

if __name__ == '__main__':
    # Ensure upload folder exists before starting the app
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
        
    app.run(host='0.0.0.0', port=5000, debug=True)  # Run app on all interfaces
