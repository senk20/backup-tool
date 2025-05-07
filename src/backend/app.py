from flask import Flask, render_template, request, jsonify
from backup.backup_service import BackupService
from utils.logger import get_logger
import os

app = Flask(__name__, 
           template_folder='../frontend/templates',
           static_folder='../frontend/static')
logger = get_logger()
backup_service = BackupService()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/backup', methods=['POST'])
def create_backup():
    data = request.json
    source_paths = data.get('source_paths', [])
    target_dir = data.get('target_dir')
    ignore_patterns = data.get('ignore_patterns', [])
    
    if not source_paths or not target_dir:
        return jsonify({
            'status': 'error',
            'message': 'Source paths and target directory are required'
        }), 400
        
    result = backup_service.create_backup(source_paths, target_dir, ignore_patterns)
    return jsonify(result)

@app.route('/api/backups', methods=['GET'])
def list_backups():
    target_dir = request.args.get('target_dir')
    if not target_dir or not os.path.exists(target_dir):
        return jsonify({
            'status': 'error',
            'message': 'Valid target directory is required'
        }), 400

    try:
        backups = []
        for entry in os.listdir(target_dir):
            if entry.startswith('backup_'):
                backup_path = os.path.join(target_dir, entry)
                if os.path.isdir(backup_path):
                    timestamp = entry.replace('backup_', '')
                    backups.append({
                        'name': entry,
                        'path': backup_path,
                        'timestamp': timestamp,
                        'size': sum(os.path.getsize(os.path.join(dirpath,filename)) 
                                  for dirpath, dirnames, filenames in os.walk(backup_path)
                                  for filename in filenames)
                    })
        
        return jsonify({
            'status': 'success',
            'backups': sorted(backups, key=lambda x: x['timestamp'], reverse=True)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)