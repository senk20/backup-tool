# Local Backup Tool

A web-based backup tool for managing local file backups with a modern interface.

## Features

- Multiple source paths backup support
- Maintains source directory structure in backup
- Gitignore-style pattern matching for excluding files
- Real-time backup status and logging
- Modern web interface

## Setup

1. Create virtual Environment
```bash
python3 -m venv myenv
```
2. Activate the environment
```bash
source myenv/bin/activate
```
3. Install the required dependencies:
```bash
python3 -m pip install -r requirements.txt
```
4. Run the application:
```bash
python src/backend/app.py
```
5. Open your browser and navigate to `http://localhost:5000`

## Running as a Service

### macOS Service Setup

1. Create the launch agent configuration:
```bash
mkdir -p ~/Library/LaunchAgents
```

2. Copy the provided plist file:
```bash
cp com.backup-tool.plist ~/Library/LaunchAgents/
```

3. Load the service:
```bash
launchctl load ~/Library/LaunchAgents/com.backup-tool.plist
```

4. Start the service:
```bash
launchctl start com.backup-tool
```

The service will automatically start on login. To stop the service:
```bash
launchctl stop com.backup-tool
```

To unload the service:
```bash
launchctl unload ~/Library/LaunchAgents/com.backup-tool.plist
```

### Ubuntu Service Setup

1. Copy the service file:
```bash
sudo cp backup-tool.service /etc/systemd/system/
```

2. Reload systemd:
```bash
sudo systemctl daemon-reload
```

3. Enable the service to start on boot:
```bash
sudo systemctl enable backup-tool
```

4. Start the service:
```bash
sudo systemctl start backup-tool
```

To check the status:
```bash
sudo systemctl status backup-tool
```

To stop the service:
```bash
sudo systemctl stop backup-tool
```

## Usage

1. Add one or more source paths to backup
2. Specify the target directory where backups will be stored
3. (Optional) Add ignore patterns in gitignore format to exclude files/directories
4. Click "Start Backup" to begin the backup process

## Note

- The backup will maintain the original directory structure
- Each backup is stored in a timestamped folder
- The application logs all operations to `logs/backup.log`
- The service runs on http://localhost:5000