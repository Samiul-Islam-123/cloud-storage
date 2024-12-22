
import { Form, Input, Button, Card, Typography } from 'antd'
import { useState } from 'react'
import axios from 'axios'
const { Title, Text } = Typography
import Cookies from "js-cookie"
import { useNavigate } from 'react-router-dom'

export default function OTP() {
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const onFinish =async (values) => {
    console.log('Success:', values)
    // Handle OTP verification logic here
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-otp`,{
      email : localStorage.getItem('email'),
      otp : values.otp
    })

    if(response.data.success === true){
      alert(response.data.message);
      Cookies.set('token', response.data.token);//saving jwt token to cookie
    }
    else
    {
      alert(response.data.message)
      console.log(response.data)
      navigate('/myfiles')
    }
  }

  const resendOTP = () => {
    setLoading(true)
    // Handle resend OTP logic here
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4169E1] p-4">
      <Card className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <Title level={2}>Verify OTP</Title>
          <Text type="secondary">
            Please enter the verification code sent to your email
          </Text>
        </div>

        <Form
          name="verify-otp"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="otp"
            rules={[
              { required: true, message: 'Please input the OTP!' },
              { len: 6, message: 'OTP must be exactly 6 digits!' }
            ]}
          >
            <Input
              size="large"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" size="large">
              Verify OTP
            </Button>
          </Form.Item>

          <div className="text-center">
            Didn&apos;t receive the code?{' '}
            <Button 
              type="link" 
              onClick={resendOTP} 
              loading={loading}
              className="p-0"
            >
              Resend OTP
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

