import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%), url(https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
    }}
      className="pt-[160px] mt-[-160px]"
    >
      <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto', padding: '140px 40px 60px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left: Title & Description */}
          <div>
            <h1 style={{
              fontSize: 84,
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 24
            }}>Bảo Dưỡng Xe Điện</h1>
            <p style={{
              color: '#ffffff',
              marginTop: 0,
              marginBottom: 40,
              fontSize: 18,
              lineHeight: 1.6,
              fontWeight: 400
            }}>Bên cạnh dịch vụ tuyệt vời, bạn còn được tận hưởng nhiều giá trị đặc biệt khác</p>
            <Link to="/client/service-booking" style={{
              background: '#a3e635',
              color: '#0b0b0c',
              padding: '16px 36px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              transition: 'all 0.3s',
              boxShadow: '0 4px 16px rgba(163, 230, 53, 0.4)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.background = '#bef264';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(163, 230, 53, 0.6)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.background = '#a3e635';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(163, 230, 53, 0.4)';
            }}>Đặt lịch ngay</Link>
          </div>

          {/* Right: 3 Icon Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(255,255,255,0.1)' }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              padding: '40px 24px',
              textAlign: 'center',
              transition: 'all 0.3s',
              borderRight: '1px solid rgba(255,255,255,0.1)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
            }}>
              <div style={{ marginBottom: 20 }}>
                <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 24h24M16 32h32M16 40h32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <rect x="12" y="20" width="40" height="28" rx="3" stroke="#ffffff" strokeWidth="2" />
                  <path d="M24 16v4M40 16v4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: '#ffffff' }}>Nhắn tin<br />Trực tiếp</h4>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              padding: '40px 24px',
              textAlign: 'center',
              transition: 'all 0.3s',
              borderRight: '1px solid rgba(255,255,255,0.1)'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
            }}>
              <div style={{ marginBottom: 20 }}>
                <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="20" stroke="#ffffff" strokeWidth="2" />
                  <path d="M25 32l5 5 9-10" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: '#ffffff' }}>Bảo hành<br />3 tháng</h4>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              padding: '40px 24px',
              textAlign: 'center',
              transition: 'all 0.3s'
            }} onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
            }}>
              <div style={{ marginBottom: 20 }}>
                <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="32" r="20" stroke="#ffffff" strokeWidth="2" />
                  <path d="M32 16v16l8 8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="32" cy="32" r="2" fill="#ffffff" />
                </svg>
              </div>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.3, color: '#ffffff' }}>Lưu lại<br />Hồ sơ</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};