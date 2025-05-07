import os
from datetime import datetime
from backup.file_handler import FileHandler
from utils.logger import get_logger

logger = get_logger()

class BackupService:
    def __init__(self):
        self.file_handler = FileHandler()
        self.logger = logger

    def create_backup(self, source_paths, target_dir, ignore_patterns=None):
        """
        Create a backup of the specified sources to the target directory
        
        Args:
            source_paths (list): List of paths to backup
            target_dir (str): Target directory for the backup
            ignore_patterns (list/str): List of patterns to ignore or path to ignore file
        """
        try:
            # Create timestamp-based backup directory
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = os.path.join(target_dir, f"backup_{timestamp}")
            os.makedirs(backup_dir, exist_ok=True)
            
            self.logger.info(f"Starting backup to {backup_dir}")
            self.file_handler.copy_with_structure(source_paths, backup_dir, ignore_patterns)
            self.logger.info("Backup completed successfully")
            
            return {
                "status": "success",
                "backup_dir": backup_dir,
                "timestamp": timestamp
            }
            
        except Exception as e:
            self.logger.error(f"Backup failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e)
            }