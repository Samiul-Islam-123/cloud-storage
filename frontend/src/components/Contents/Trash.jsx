import React from 'react';
import { Card, Typography, Space } from 'antd';

const { Text } = Typography;

const files = [
  { id: 1, name: 'Document 1', type: 'file' },
  { id: 2, name: 'Project Folder', type: 'folder' },
  { id: 3, name: 'Presentation', type: 'file' },
  { id: 4, name: 'Pictures', type: 'folder' },
  { id: 5, name: 'Video File', type: 'file' },
  
];

const Trash = () => {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}
    >
      <Typography.Title level={3} style={{ marginBottom: '20px' }}>
        Trash files
      </Typography.Title>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
        }}
      >
        {files.map((file) => (
          <Card
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
              <div
                style={{
                  fontSize: '50px',
                  color: file.type === 'folder' ? '#1890ff' : '#faad14',
                }}
              >
                {file.type === 'folder' ? '📁' : '📄'}
              </div>
              <Text>{file.name}</Text>
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Trash;
