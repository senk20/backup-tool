import os
import shutil
from pathlib import Path
import pathspec
from utils.logger import get_logger

logger = get_logger()

class FileHandler:
    def __init__(self):
        self.logger = logger

    def parse_ignore_patterns(self, patterns):
        """Parse ignore patterns from a list or file"""
        if isinstance(patterns, str) and os.path.isfile(patterns):
            with open(patterns, 'r') as f:
                patterns = f.read().splitlines()
        return pathspec.PathSpec.from_lines('gitwildmatch', patterns or [])

    def should_ignore(self, path, ignore_spec):
        """Check if a path should be ignored based on ignore patterns"""
        if ignore_spec is None:
            return False
        return ignore_spec.match_file(path)

    def copy_with_structure(self, source_paths, target_dir, ignore_patterns=None):
        """
        Copy files and directories recursively maintaining structure
        
        Args:
            source_paths (list): List of source paths to backup
            target_dir (str): Target directory for backup
            ignore_patterns (list/str): List of patterns to ignore or path to ignore file
        """
        ignore_spec = self.parse_ignore_patterns(ignore_patterns)
        
        for source_path in source_paths:
            source_path = os.path.abspath(source_path)
            if not os.path.exists(source_path):
                self.logger.warning(f"Source path does not exist: {source_path}")
                continue

            if os.path.isfile(source_path):
                if not self.should_ignore(source_path, ignore_spec):
                    relative_path = os.path.basename(source_path)
                    target_path = os.path.join(target_dir, relative_path)
                    self._copy_file(source_path, target_path)
            else:
                self._copy_directory(source_path, target_dir, ignore_spec)

    def _copy_file(self, source, target):
        """Copy a single file"""
        os.makedirs(os.path.dirname(target), exist_ok=True)
        try:
            shutil.copy2(source, target)
            self.logger.info(f"Copied file: {source} -> {target}")
        except Exception as e:
            self.logger.error(f"Error copying file {source}: {str(e)}")

    def _copy_directory(self, source, target, ignore_spec):
        """Copy a directory recursively"""
        for root, dirs, files in os.walk(source):
            # Filter directories
            dirs[:] = [d for d in dirs if not self.should_ignore(os.path.join(root, d), ignore_spec)]
            
            for file in files:
                src_path = os.path.join(root, file)
                if self.should_ignore(src_path, ignore_spec):
                    continue
                    
                rel_path = os.path.relpath(src_path, source)
                dst_path = os.path.join(target, os.path.basename(source), rel_path)
                
                self._copy_file(src_path, dst_path)