import React, { useEffect, useState } from 'react';
import { Card, Progress, Row, Col, Typography, Statistic, Divider, Spin, message } from 'antd';
import { FileTextOutlined, PictureOutlined, VideoCameraOutlined, FileDoneOutlined } from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';

const { Title } = Typography;

const StorageUsage = () => {
  const [storageData, setStorageData] = useState(null);  // To store fetched data
  const [loading, setLoading] = useState(true);  // To show loading spinner
  const [error, setError] = useState(null);  // To handle errors

  // Fetch the storage data from the API
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/app/storage-usage`, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('token')}`
      }
    })
      .then(response => {
        setStorageData(response.data.data);  // Update state with the fetched data
        setLoading(false);  // Turn off the loading spinner
      })
      .catch(error => {
        console.error('Error fetching storage data:', error);
        setError('Failed to fetch storage data');
        setLoading(false);
        message.error('Failed to fetch storage data');
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
        <Spin size="large" tip="Loading storage data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  const { totalStorage, usedStorage, freeStorage, fileTypes } = storageData;

  // Make sure that usedStorage is not null
  const usedPercentage = usedStorage ? (usedStorage / totalStorage) * 100 : 0;
  const freePercentage = freeStorage ? (freeStorage / totalStorage) * 100 : 0;

  // Calculate total files based on fileTypes
  const totalFiles = Object.values(fileTypes || {}).reduce((acc, count) => acc + count, 0);

  // If fileTypes is an object, convert it to an array
  const fileTypePercentages = Object.keys(fileTypes || {}).map(type => {
    const count = fileTypes[type];
    return {
      type,
      count,
      percentage: totalFiles > 0 ? (count / totalFiles) * 100 : 0,
      icon: getIcon(type),
    };
  });

  // Log the results for demonstration
  console.log('Total Storage:', totalStorage);
  console.log('Used Storage:', usedStorage);
  console.log('Free Storage:', freeStorage);
  console.log('Total Files:', totalFiles);
  console.log('File Type Percentages:', fileTypePercentages);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <Title level={3} style={{ marginBottom: '20px' }}>Storage Usage Overview</Title>

      {/* Storage Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card title="Total Storage" bordered={false} hoverable>
            <Statistic title="Total" value={totalStorage} suffix="GB" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="Used Storage" bordered={false} hoverable>
            <Statistic title="Used" value={usedStorage || 0} suffix="GB" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="Free Storage" bordered={false} hoverable>
            <Statistic title="Free" value={freeStorage || 0} suffix="GB" />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Circular Progress for Used and Free Storage */}
      <Row gutter={[16, 16]} style={{ marginBottom: '30px' }}>
        <Col xs={24} sm={12} style={{ textAlign: 'center' }}>
          <Card bordered={false} hoverable>
            <Title level={4}>Used</Title>
            <Progress
              type="circle"
              percent={usedPercentage}
              status="active"
              strokeColor="#1890ff"
              width={120}
              format={() => `${usedPercentage.toFixed(1)}%`}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} style={{ textAlign: 'center' }}>
          <Card bordered={false} hoverable>
            <Title level={4}>Free</Title>
            <Progress
              type="circle"
              percent={freePercentage}
              status="normal"
              strokeColor="#52c41a"
              width={120}
              format={() => `${freePercentage.toFixed(1)}%`}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* File Type Distribution with Circular Progress */}
      <Title level={4} style={{ marginBottom: '15px' }}>File Type Distribution</Title>
      <Row gutter={[16, 16]}>
        {fileTypePercentages.map((fileType) => (
          <Col xs={12} sm={6} key={fileType.type}>
            <Card
              title={fileType.type}
              bordered={false}
              hoverable
              style={{ textAlign: 'center', borderRadius: '8px' }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px', color: '#1890ff' }}>
                {fileType.icon}
              </div>
              <Progress
                type="circle"
                percent={fileType.percentage}
                strokeColor="#1890ff"
                width={80}
                format={() => `${fileType.percentage.toFixed(1)}%`}
              />
              <p>{fileType.count} Files</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

const getIcon = (type) => {
  switch (type) {
    case 'Documents':
      return <FileTextOutlined />;
    case 'Images':
      return <PictureOutlined />;
    case 'Videos':
      return <VideoCameraOutlined />;
    default:
      return <FileDoneOutlined />;
  }
};

export default StorageUsage;
