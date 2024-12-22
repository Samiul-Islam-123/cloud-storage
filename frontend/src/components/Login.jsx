import { Form, Input, Button, Card, Typography } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';
const { Title } = Typography;
import Cookies from "js-cookie"

export default function Login() {
  
  const navigate = useNavigate();
  
  const onFinish =async (values) => {
    console.log('Success:', values);
    // Handle login logic here
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`,{
      email : values.email,
      password : values.password
    })

    if(response.data.success === true){
      Cookies.set('token', response.data.token);//storing jwt token into cookie
        navigate('/myFiles')
    }

    else
    alert(response.data.message)
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4169E1] p-4">
      <Card className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Title level={2}>Login</Title>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
              size="large"
            />
          </Form.Item>

          {/* <div className="flex justify-end mb-4">
            <Link to="/forgot-password" className="text-blue-600">
              Forgot password?
            </Link>
          </div> */}

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large">
              Login
            </Button>
          </Form.Item>

          <div className="text-center">
            Don&apos;t have an account?{' '}
            <Link to="/auth/signup" className="text-blue-600">
              Sign up now
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
