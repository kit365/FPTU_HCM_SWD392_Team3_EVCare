import React from 'react';
import { Layout, Row, Col, Typography, Input, Button, Space } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  SendOutlined,
  FacebookFilled,
  TwitterSquareFilled,
  InstagramFilled,
  YoutubeFilled,
} from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const ClientFooter: React.FC = () => {
  const footerStyle: React.CSSProperties = {
    backgroundColor: '#1a1a1a',
    color: '#cccccc',
    padding: '40px 0',
  };

  const copyrightStyle: React.CSSProperties = {
    backgroundColor: '#262626',
    color: '#cccccc',
    textAlign: 'center',
    padding: '20px 0',
  };

  const headingStyle: React.CSSProperties = {
    color: '#ffffff',
    marginBottom: '20px',
    position: 'relative',
    paddingBottom: '10px',
  };

  const underlineStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '50px',
    height: '3px',
    backgroundColor: '#ff9900',
  };

  const linkStyle: React.CSSProperties = {
    color: '#cccccc',
    display: 'block',
    marginBottom: '10px',
    transition: 'color 0.3s',
    textDecoration: 'none',
  };

  const contactIconBoxStyle: React.CSSProperties = {
    backgroundColor: '#ff9900',
    padding: '8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
  };

  const socialIconStyle: React.CSSProperties = {
    fontSize: '24px',
    color: '#ffffff',
  };

  return (
    <Footer style={{ padding: 0 }}>
      <div style={footerStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Row gutter={[32, 32]}>
            {/* Column 1: About Us */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={headingStyle}>
                About Us
                <span style={underlineStyle}></span>
              </Title>
              <Link href="#" style={linkStyle}>Our Company</Link>
              <Link href="#" style={linkStyle}>Shop Toyota</Link>
              <Link href="#" style={linkStyle}>Dreamsrentals USA</Link>
              <Link href="#" style={linkStyle}>Dreamsrentals Worldwide</Link>
              <Link href="#" style={linkStyle}>Dreamsrentals Racing</Link>
              <Link href="#" style={linkStyle}>Virtual Auto Show</Link>
            </Col>

            {/* Column 2: Vehicles Type */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={headingStyle}>
                Vehicles Type
                <span style={underlineStyle}></span>
              </Title>
              <Link href="#" style={linkStyle}>Rental List</Link>
              <Link href="#" style={linkStyle}>Rental Grid</Link>
              <Link href="#" style={linkStyle}>Blog List</Link>
              <Link href="#" style={linkStyle}>Blog Grid</Link>
              <Link href="#" style={linkStyle}>Contact Us</Link>
              <Link href="#" style={linkStyle}>About Us</Link>
              <Link href="#" style={linkStyle}>Testimonials</Link>
            </Col>

            {/* Column 3: Quick Links */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={headingStyle}>
                Quick Links
                <span style={underlineStyle}></span>
              </Title>
              <Link href="#" style={linkStyle}>About Us</Link>
              <Link href="#" style={linkStyle}>Contact Us</Link>
              <Link href="#" style={linkStyle}>Gallery</Link>
              <Link href="#" style={linkStyle}>Our Team</Link>
              <Link href="#" style={linkStyle}>FAQ</Link>
              <Link href="#" style={linkStyle}>Privacy Policy</Link>
              <Link href="#" style={linkStyle}>Terms & Conditions</Link>
            </Col>

            {/* Column 4: Contact Info & Connect with us */}
            <Col xs={24} sm={12} md={6}>
              <Title level={4} style={headingStyle}>
                Contact Info
                <span style={underlineStyle}></span>
              </Title>
              <Space direction="vertical" size={15} style={{ width: '100%', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={contactIconBoxStyle}>
                    <PhoneOutlined style={{ color: '#ffffff', fontSize: '18px' }} />
                  </div>
                  <Text style={{ color: '#cccccc' }}>(+1) 88888 88888</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={contactIconBoxStyle}>
                    <MailOutlined style={{ color: '#ffffff', fontSize: '18px' }} />
                  </div>
                  <Text style={{ color: '#cccccc' }}>demo@example.com</Text>
                </div>
              </Space>

              <Input
                placeholder="Enter Your Email Here"
                prefix={<MailOutlined style={{ color: '#cccccc' }} />}
                suffix={
                  <Button type="primary" style={{ backgroundColor: '#ff9900', borderColor: '#ff9900' }}>
                    <SendOutlined />
                  </Button>
                }
                style={{ marginBottom: '30px', borderRadius: '4px' }}
              />

              <Title level={5} style={{ color: '#ffffff', marginBottom: '15px' }}>
                Connect with us
              </Title>
              <Space size="middle">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<FacebookFilled style={socialIconStyle} />}
                  style={{ backgroundColor: '#3b5998', borderColor: '#3b5998' }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<TwitterSquareFilled style={socialIconStyle} />}
                  style={{ backgroundColor: '#00acee', borderColor: '#00acee' }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<InstagramFilled style={socialIconStyle} />}
                  style={{ backgroundColor: '#E4405F', borderColor: '#E4405F' }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<YoutubeFilled style={socialIconStyle} />}
                  style={{ backgroundColor: '#FF0000', borderColor: '#FF0000' }}
                />
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Copyright Section */}
      <div style={copyrightStyle}>
        <Text style={{ color: '#cccccc' }}>
          Copyright 2025 © Theme Created By Dreams Rent, All Rights Reserved.
        </Text>
      </div>
    </Footer>
  );
};

export default ClientFooter;