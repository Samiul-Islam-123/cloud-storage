import React from 'react';
import { Layout, Menu, Progress, Avatar, Space, Button } from 'antd';
import { UploadOutlined, FileOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Header } = Layout;

const NavBar = () => {
  const storageUsed = 75; // Percentage of storage used

  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', boxShadow: '0 2px 8px #f0f1f2' }}>
      <Menu mode="horizontal" defaultSelectedKeys={['myfiles']} style={{ flex: 1 }}>
        <Menu.Item key="myfiles" icon={<FileOutlined />}>
          <Link to="/myFiles">My Files</Link>
        </Menu.Item>
        <Menu.Item key="upload" icon={<UploadOutlined />}>
          <Link to="/upload">Upload</Link>
        </Menu.Item>
        <Menu.Item key="trash" icon={<DeleteOutlined />}>
          <Link to="/trash">Trash</Link>
        </Menu.Item>
        <Menu.Item key="storage">
        <Link to="/storage"></Link>
          Storage Used:
          <Space>
            <Progress
              style={{
                marginLeft: '10px',
              }}
              type="circle"
              percent={storageUsed}
              width={40}
              format={(percent) => `${percent}%`}
            />
          </Space>
        </Menu.Item>
      </Menu>

      
      <Avatar size="large" icon={<UserOutlined />} style={{ marginLeft: 'auto' }} />
    </Header>
  );
};

export default NavBar;
