import { Form, Input, Button, Checkbox, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom'; 
const { Title } = Typography;
import axios from 'axios'

export default function SignUp() {

    const navigate = useNavigate();

  const onFinish =async (values) => {
    console.log('Success:', values);
    localStorage.setItem('email', values.email);
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
      username : values.name,
      email : values.email,
      password : values.password
    })

    if(response.data.success === true){
      navigate('/auth/otp')
    }

    else{
      console.log(response.data)
      alert(response.data.message)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4169E1] p-4">
      <Card className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Title level={2}>Registration</Title>
        </div>

        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your name"
              size="large"
            />
          </Form.Item>

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
              placeholder="Create password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Passwords do not match!');
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject('Please accept the terms and conditions'),
              },
            ]}
          >
            <Checkbox>I accept all terms & conditions</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large">
              Register Now
            </Button>
          </Form.Item>

          <div className="text-center">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-blue-600">
              Login now
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
