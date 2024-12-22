import React, { useState, useEffect } from 'react';
import { Upload as AntUpload, Progress, Button, Typography, message } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useSocket } from '../../Contexts/SocketContext';  // Importing the SocketContext

const { Dragger } = AntUpload;
const { Title, Text } = Typography;

const Upload = () => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileList, setFileList] = useState([]);
  const socket = useSocket();  // Access the socket instance

  // Handle file selection
  const handleFileChange = (info) => {
    setFileList(info.fileList);
  };

  // Handle file upload and update progress
  const handleUploadClick = async () => {
    if (fileList.length === 0) {
      message.error('Please select files to upload');
      return;
    }

    // Reset progress
    setUploadProgress({});

    // Handle upload for each file
    for (const file of fileList) {
      try {
        const formData = new FormData();
        formData.append('file', file.originFileObj);

        const token = Cookies.get('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the Bearer token
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);

              // Emit progress to backend through socket (optional)
              socket.emit('upload-progress', {
                filename: file.name,
                progress: percent,
              });

              // Update frontend progress
              setUploadProgress((prev) => ({
                ...prev,
                [file.uid]: percent,
              }));
            }
          },
        };

        // Make the request to upload the file
        await axios.post(`${import.meta.env.VITE_API_URL}/app/upload`, formData, config);

        message.success(`File ${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Error uploading file:', error);
        message.error(`Failed to upload ${file.name}`);
      }
    }
  };

  // Prevent upload for large files (e.g., > 50MB)
  const beforeUpload = (file) => {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB limit
    if (file.size > MAX_SIZE) {
      message.error('File is too large!');
      return false; // Prevent file upload
    }
    return true;
  };

  // Listen to real-time upload progress from the backend
  useEffect(() => {
    if (socket) {
      socket.on('upload-progress', (data) => {
        setUploadProgress((prev) => ({
          ...prev,
          [data.filename]: data.progress,
        }));
      });

      // Clean up the socket listener when the component unmounts
      return () => {
        socket.off('upload-progress');
      };
    }
  }, [socket]);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <Title level={3}>Upload Files</Title>

      {/* File Drag and Drop Area */}
      <Dragger
        multiple
        fileList={fileList}
        onChange={handleFileChange}
        showUploadList={false}
        beforeUpload={beforeUpload} // Prevent automatic upload and check file size
        style={{
          padding: '20px',
          border: '2px dashed #1890ff',
          borderRadius: '8px',
          backgroundColor: '#fff',
          marginBottom: '20px',
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text">Click or drag files here to upload</p>
        <p className="ant-upload-hint">Supports single or bulk upload.</p>
      </Dragger>

      {/* Button to trigger file upload */}
      <Button
        type="primary"
        icon={<UploadOutlined />}
        size="large"
        onClick={handleUploadClick}
        style={{ marginTop: '20px' }}
      >
        Upload
      </Button>

      {/* Display Progress Bar for Each File */}
      {fileList.map((file) => (
        uploadProgress[file.uid] !== undefined && (
          <div key={file.uid} style={{ marginTop: '40px' }}>
            <Text>{file.name}</Text>
            <Progress
              percent={uploadProgress[file.uid]}
              status={uploadProgress[file.uid] === 100 ? 'success' : 'active'}
              style={{ marginTop: '10px' }}
            />
          </div>
        )
      ))}
    </div>
  );
};

export default Upload;
