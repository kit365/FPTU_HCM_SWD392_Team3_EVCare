import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section 
      className="relative text-white min-h-[90vh] flex items-center" 
      style={{ 
        backgroundImage: "url('/src/assets/vin3.jpg')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-black/70"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium">Dịch vụ chuyên nghiệp • Uy tín hàng đầu</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Dịch Vụ Bảo Dưỡng</span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mt-2 animate-pulse">Xe Điện Chuyên Nghiệp</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200 leading-relaxed">
            Chăm sóc xe điện của bạn với đội ngũ kỹ thuật viên giàu kinh nghiệm và công nghệ hiện đại
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => { navigate('/service-booking') }} 
              className="group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-purple-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                Đặt Lịch Ngay
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-sm text-gray-300">Năm Kinh Nghiệm</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">5000+</div>
              <div className="text-sm text-gray-300">Khách Hàng</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-sm text-gray-300">Kỹ Thuật Viên</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-sm text-gray-300">Hỗ Trợ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};