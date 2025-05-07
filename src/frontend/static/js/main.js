document.addEventListener('DOMContentLoaded', function() {
    const backupForm = document.getElementById('backupForm');
    const sourcePathsContainer = document.getElementById('sourcePathsContainer');
    const addSourcePathBtn = document.getElementById('addSourcePath');
    const startBackupBtn = document.getElementById('startBackup');
    const backupStatus = document.getElementById('backupStatus');
    const backupLog = document.getElementById('backupLog');
    const refreshBackupsBtn = document.getElementById('refreshBackups');
    const backupsList = document.getElementById('backupsList');
    
    // Add new source path input
    addSourcePathBtn.addEventListener('click', function() {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group mb-2';
        inputGroup.innerHTML = `
            <input type="text" class="form-control source-path" placeholder="Enter source path" required>
            <button type="button" class="btn btn-outline-secondary remove-path">
                <i class="bi bi-dash-circle"></i> Remove
            </button>
        `;
        
        sourcePathsContainer.appendChild(inputGroup);
        
        // Show remove buttons if there's more than one source path
        const removeBtns = sourcePathsContainer.querySelectorAll('.remove-path');
        removeBtns.forEach(btn => btn.style.display = 'block');
    });
    
    // Remove source path input
    sourcePathsContainer.addEventListener('click', function(e) {
        if (e.target.closest('.remove-path')) {
            const inputGroup = e.target.closest('.input-group');
            inputGroup.remove();
            
            // Hide remove button if only one source path remains
            const removeBtns = sourcePathsContainer.querySelectorAll('.remove-path');
            if (removeBtns.length === 1) {
                removeBtns[0].style.display = 'none';
            }
        }
    });
    
    // Handle form submission
    backupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Collect form data
        const sourcePaths = Array.from(document.querySelectorAll('.source-path'))
            .map(input => input.value.trim())
            .filter(path => path !== '');
            
        const targetDir = document.getElementById('targetDir').value.trim();
        const ignorePatterns = document.getElementById('ignorePatterns').value
            .split('\n')
            .map(pattern => pattern.trim())
            .filter(pattern => pattern !== '');
        
        // Validate inputs
        if (sourcePaths.length === 0 || !targetDir) {
            showStatus('Please fill in all required fields', 'error');
            return;
        }
        
        // Show loading state
        startBackupBtn.disabled = true;
        startBackupBtn.querySelector('.spinner-border').classList.remove('d-none');
        showStatus('Starting backup...', 'info');
        
        try {
            const response = await fetch('/api/backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_paths: sourcePaths,
                    target_dir: targetDir,
                    ignore_patterns: ignorePatterns
                })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                showStatus('Backup completed successfully!', 'success');
                appendToLog(`Backup created at: ${result.backup_dir}`);
                // Refresh the backup list after successful backup
                refreshBackupsBtn.click();
            } else {
                showStatus(`Backup failed: ${result.error}`, 'error');
                appendToLog(`Error: ${result.error}`);
            }
        } catch (error) {
            showStatus('An error occurred while performing the backup', 'error');
            appendToLog(`Error: ${error.message}`);
        } finally {
            // Reset loading state
            startBackupBtn.disabled = false;
            startBackupBtn.querySelector('.spinner-border').classList.add('d-none');
        }
    });

    // Refresh backups list
    refreshBackupsBtn.addEventListener('click', async function() {
        const targetDir = document.getElementById('targetDir').value.trim();
        if (!targetDir) {
            showStatus('Please enter a target directory first', 'error');
            return;
        }

        // Show loading state
        refreshBackupsBtn.disabled = true;
        refreshBackupsBtn.querySelector('.spinner-border').classList.remove('d-none');

        try {
            const response = await fetch(`/api/backups?target_dir=${encodeURIComponent(targetDir)}`);
            const result = await response.json();

            if (result.status === 'success') {
                displayBackups(result.backups);
            } else {
                showStatus(`Failed to list backups: ${result.message}`, 'error');
            }
        } catch (error) {
            showStatus('An error occurred while listing backups', 'error');
        } finally {
            // Reset loading state
            refreshBackupsBtn.disabled = false;
            refreshBackupsBtn.querySelector('.spinner-border').classList.add('d-none');
        }
    });

    function displayBackups(backups) {
        if (!backups || backups.length === 0) {
            backupsList.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted">
                        No backups found in the target directory.
                    </td>
                </tr>
            `;
            return;
        }

        backupsList.innerHTML = backups.map(backup => `
            <tr>
                <td>${formatTimestamp(backup.timestamp)}</td>
                <td>${backup.path}</td>
                <td>${formatSize(backup.size)}</td>
            </tr>
        `).join('');
    }

    function formatTimestamp(timestamp) {
        // Convert YYYYMMDD_HHMMSS to a readable format
        const year = timestamp.slice(0, 4);
        const month = timestamp.slice(4, 6);
        const day = timestamp.slice(6, 8);
        const hour = timestamp.slice(9, 11);
        const minute = timestamp.slice(11, 13);
        const second = timestamp.slice(13, 15);
        
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }

    function formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    
    function showStatus(message, type) {
        backupStatus.textContent = message;
        backupStatus.className = `alert alert-${type === 'error' ? 'danger' : type}`;
        backupStatus.classList.remove('d-none');
    }
    
    function appendToLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.textContent = `[${timestamp}] ${message}`;
        backupLog.appendChild(logEntry);
        backupLog.scrollTop = backupLog.scrollHeight;
    }
});