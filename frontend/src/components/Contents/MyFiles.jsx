import React, { useEffect, useState } from 'react';
import { Card, Typography, Space, Spin } from 'antd';  // Import Spin component
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const MyFiles = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);  // Add loading state
  const token = Cookies.get('token');

  const fetchMyFiles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/app/all-files`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Add the Bearer token here
        },
      });

      if (response.data.success === true) {
        console.log(response.data);
        setFiles(response.data.files);
      } else if (response.data.message === 'Invalid token. Access denied') {
        alert(`${response.data.message}\nRedirecting to Login page...`);
        navigate('/auth/login');
      } else {
        console.log(response.data);
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      alert('Error fetching files');
    } finally {
      setLoading(false);  // Set loading to false after fetching files
    }
  };

  useEffect(() => {
    fetchMyFiles();
  }, []);

  const isImageFile = (url) => {
    return url && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif'));
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <Typography.Title level={3} style={{ marginBottom: '20px' }}>
        My Files
      </Typography.Title>

      {/* Show a loader while the files are being fetched */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '20px',
          }}
        >
          {files.map((file) => (
            <Card
              onClick={async () => {
                if (file.type === 'directory') {
                  try {
                    console.log(token);
                    const response = await axios.get(
                      `${import.meta.env.VITE_API_URL}/app/directory-contents`,
                      {
                        dirPath: file.path, // or any other property that represents the directory path
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,  // Add the Bearer token here
                        },
                      }
                    );

                    // Handle the response if needed
                    console.log(response.data);
                  } catch (error) {
                    console.error('Error fetching directory contents:', error);
                    alert('Error fetching directory contents');
                  }
                } else {
                  // For files, open the preview URL
                  const fileUrl = `${import.meta.env.VITE_API_URL}${file.previewUrl}`;
                  window.open(fileUrl);
                }
              }}
              key={file.id}
              hoverable
              style={{
                textAlign: 'center',
                padding: '20px',
                border: file.type === 'folder' ? '1px solid #1890ff' : '1px solid #d9d9d9',
                borderRadius: '8px',
              }}
            >
              <Space direction="vertical">
                {/* Conditionally render the icon or image */}
                {!isImageFile(file.previewUrl) && (
                  <div
                    style={{
                      fontSize: '50px',
                      color: file.type === 'folder' ? '#1890ff' : '#faad14',
                    }}
                  >
                    {file.type === 'directory' ? '📁' : '📄'}
                  </div>
                )}

                {/* Display Image Preview if the file is an image */}
                {file.previewUrl && isImageFile(file.previewUrl) ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${file.previewUrl}`}
                    alt={file.name}
                    style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', marginBottom: '10px' }}
                  />
                ) : null}

                <Text>{file.name}</Text>
              </Space>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFiles;
