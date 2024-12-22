const os = require('os')
const diskusage = require('diskusage');
const fs = require('fs');
const path = require('path')

// Function to get disk usage
async function getDiskUsage() {
    try {
        const root = path.join(process.env.ROOT, 'uploads') // Root directory (Windows: C:, Unix: /)
        const usage = await diskusage.check(root);

        const totalStorage = usage.total / (1024 * 1024 * 1024); // Convert bytes to GB
        const freeStorage = usage.free / (1024 * 1024 * 1024);   // Convert bytes to GB
        const usedStorage = totalStorage - freeStorage;   // Convert bytes to GB
        //console.log(totalStorage - freeStorage)
        // Get file types in the root directory (this could be improved to target specific directories)
        const fileTypes = await getFileTypesInDirectory(root);

        return {
            totalStorage,
            usedStorage,
            freeStorage,
            fileTypes
        };
    } catch (err) {
        console.error('Error retrieving disk usage:', err);
        return null;
    }
}

// Function to scan the root directory for file types
async function getFileTypesInDirectory(directory) {
    try {
        const fileTypes = {
            Documents: 0,
            Images: 0,
            Videos: 0,
            OtherFiles: 0
        };

        const files = await fs.promises.readdir(directory, { withFileTypes: true });

        for (let file of files) {
            if (file.isDirectory()) continue;

            const ext = path.extname(file.name).toLowerCase();
            if (['.pdf', '.doc', '.txt', '.ppt'].includes(ext)) {
                fileTypes.Documents++;
            } else if (['.jpg', '.png', '.gif', '.jpeg'].includes(ext)) {
                fileTypes.Images++;
            } else if (['.mp4', '.mkv', '.avi'].includes(ext)) {
                fileTypes.Videos++;
            } else {
                fileTypes.OtherFiles++;
            }
        }

        return fileTypes;
    } catch (err) {
        console.error('Error reading directory:', err);
        return {
            Documents: 0,
            Images: 0,
            Videos: 0,
            OtherFiles: 0
        };
    }
}

module.exports = {getDiskUsage, getFileTypesInDirectory}