const AppRouter = require('express').Router();
const busboy = require('busboy');
const express = require('express')
const verifyToken = require('../middlewares/VerifyUser')
const fs = require('fs')
const fileSystem = require('fs').promises
require('dotenv').config(); // Load .env file
const {getDiskUsage, getFileTypesInDirectory} = require('../utils/usage')
const os = require('os')
const path = require('path');
const rootDirectory = process.env.ROOT

const uploadDirectory = path.join(rootDirectory, 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Serve the uploads folder as static files

AppRouter.get('/all-files', verifyToken, async (req, res) => {
    try {
        // Read the contents of the root directory
        const files = await fileSystem.readdir(uploadDirectory, { withFileTypes: true });

        // Format the response with file types (file or directory)
        const fileList = files.map(file => ({
            name: file.name,
            type: file.isDirectory() ? 'directory' : 'file',
            previewUrl: `/uploads/${encodeURIComponent(file.name)}`, // Preview URL for each file
            path: path.join(uploadDirectory, file.name) // Full path for each file
        }));

        res.status(200).json({success : true, files: fileList });
    } catch (error) {
        console.error('Error reading files:', error);
        res.status(500).json({ error: 'Could not retrieve files.' });
    }
});

AppRouter.post('/upload', verifyToken, (req, res) => {
    console.log('control is in /upload route')
    const bb = busboy({ headers: req.headers });

    const uploadedFiles = [];
    let fileCount = 0;

    bb.on('file', (fieldname, file, filename) => {
        console.log(uploadDirectory, filename.filename)
        const savePath = path.join(uploadDirectory, filename.filename);
        const writeStream = fs.createWriteStream(savePath);

        fileCount += 1;

        file.pipe(writeStream);

        let uploadedBytes = 0;


        file.on('data', (chunk) => {
            uploadedBytes += chunk.length;
        
            // Calculate progress only if `file.length` is available
            const totalBytes = file.length || uploadedBytes;
            const progress = (uploadedBytes / totalBytes) * 100;
        
            // Emit the progress to the client using socket.io
            req.io.emit('upload-progress', {
                filename: filename.filename,
                uploadedBytes,
                totalBytes,
                progress
            });
        
            console.log(`Uploading ${filename.filename}: Received ${chunk.length} bytes. : Progress : ${progress}`);
        });
        

        file.on('end', () => {
            console.log(`Upload complete for ${filename}`);
            uploadedFiles.push({ filename, path: savePath });
        });

        file.on('error', (err) => {
            console.error(`Error uploading file ${filename}:`, err);
            writeStream.destroy();
        });

        writeStream.on('error', (err) => {
            console.error(`Error saving file ${filename}:`, err);
        });

        writeStream.on('finish', () => {
            console.log(`File ${filename} written successfully.`);
        });
    });

    // Handle form fields (if any)
    bb.on('field', (fieldname, val) => {
        console.log(`Field ${fieldname}: ${val}`);
    });

    // When all data has been processed
    bb.on('finish', () => {
        if (fileCount === 0) {
            return res.status(400).json({ success: false, message: 'No files were uploaded.' });
        }
        res.status(200).json({
            success: true,
            message: 'Files uploaded successfully.',
            files: uploadedFiles,
        });
    });

    // Handle errors in the stream
    bb.on('error', (err) => {
        console.error('Busboy error:', err);
        res.status(500).json({ success: false, message: 'Error during file upload.' });
    });

    // Pipe the request data into Busboy
    req.pipe(bb);
});

AppRouter.get('/storage-usage',verifyToken, async(req,res) =>{
    const storageData = await getDiskUsage();
    if (storageData) {
        res.json({
            success : true,
            data : storageData
        });
    } else {
        res.status(500).json({ error: 'Failed to retrieve storage usage' });
    }
})

// Route to stream a specific file
AppRouter.get('/stream/:filename', (req, res) => {
    const filename = decodeURIComponent(req.params.filename); // Decode the filename parameter
    const filePath = path.join(uploadDirectory, filename);

    // Check if the file exists
    fs.exists(filePath, (exists) => {
        if (!exists) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Set appropriate headers for streaming
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Create a read stream for the file and pipe it to the response
        const readStream = fs.createReadStream(filePath);

        // Handle errors while reading the file
        readStream.on('error', (err) => {
            console.error('Error streaming file:', err);
            res.status(500).json({ error: 'Error streaming the file' });
        });

        // Pipe the file stream to the response
        readStream.pipe(res);
    });
});

AppRouter.get('/directory-contents', verifyToken, async (req, res) => {
    const { dirPath } = req.body;  // Directory path received in request body
    console.log(dirPath)
    
    // Ensure the dirPath is not empty and contains a valid directory path
    if (!dirPath) {
        return res.status(400).json({ message: 'Directory path is required' });
    }

    try {


        // Read the contents of the directory
        const files = await fileSystem.readdir(dirPath);

        // Send the list of files back in the response
        return res.status(200).json({ success: true, files });
    } catch (error) {
        // Handle errors (e.g., directory not found, permission denied)
        console.error('Error reading directory:', error);
        return res.status(500).json({ success: false, message: 'Error reading directory', error: error.message });
    }
});

// Route to delete multiple files
AppRouter.post('/delete-files', async (req, res) => {
    const { filenames } = req.body; // Array of filenames to delete

    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
        return res.status(400).json({ success: false, message: 'No files specified for deletion.' });
    }

    const deletePromises = filenames.map((filename) => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(uploadDirectory, filename);

            fs.exists(filePath, (exists) => {
                if (!exists) {
                    return reject(`File ${filename} not found.`);
                }

                fs.unlink(filePath, (err) => {
                    if (err) {
                        return reject(`Error deleting ${filename}: ${err.message}`);
                    }
                    resolve(`File ${filename} deleted successfully.`);
                });
            });
        });
    });

    try {
        const results = await Promise.all(deletePromises);
        res.status(200).json({ success: true, message: 'Files deleted successfully.', results });
    } catch (error) {
        res.status(500).json({ success: false, message: `Error deleting files: ${error}` });
    }
});

// Route to create a new directory
AppRouter.post('/create-directory', async (req, res) => {
    const { directoryName } = req.body; // Directory name from the request body

    if (!directoryName) {
        return res.status(400).json({ success: false, message: 'Directory name is required.' });
    }

    const newDirectoryPath = path.join(uploadDirectory, directoryName);

    // Check if the directory already exists
    fs.exists(newDirectoryPath, (exists) => {
        if (exists) {
            return res.status(400).json({ success: false, message: `Directory ${directoryName} already exists.` });
        }

        // Create the new directory
        fs.mkdir(newDirectoryPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating directory:', err);
                return res.status(500).json({ success: false, message: 'Error creating directory.' });
            }

            res.status(200).json({ success: true, message: `Directory ${directoryName} created successfully.` });
        });
    });
});

// Function to recursively delete a directory and its contents
const deleteDirectoryRecursively = (dirPath) => {
    // Read the contents of the directory
    const files = fs.readdirSync(dirPath);

    // Loop through the files and delete each one
    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        // If it's a directory, recursively call the function to delete its contents
        if (stat.isDirectory()) {
            deleteDirectoryRecursively(filePath);
        } else {
            fs.unlinkSync(filePath); // Delete the file
        }
    });

    // Finally, delete the empty directory itself
    fs.rmdirSync(dirPath);
};

// Route to delete a folder and its contents
AppRouter.delete('/delete-directory', async (req, res) => {
    const { directoryName } = req.body; // Directory name from the request body

    if (!directoryName) {
        return res.status(400).json({ success: false, message: 'Directory name is required.' });
    }

    const directoryPath = path.join(uploadDirectory, directoryName);

    // Check if the directory exists
    fs.exists(directoryPath, (exists) => {
        if (!exists) {
            return res.status(400).json({ success: false, message: `Directory ${directoryName} does not exist.` });
        }

        // Attempt to delete the directory recursively
        try {
            deleteDirectoryRecursively(directoryPath);
            res.status(200).json({ success: true, message: `Directory ${directoryName} and its contents were deleted successfully.` });
        } catch (err) {
            console.error('Error deleting directory:', err);
            res.status(500).json({ success: false, message: 'Error deleting directory.' });
        }
    });
});


module.exports = AppRouter;