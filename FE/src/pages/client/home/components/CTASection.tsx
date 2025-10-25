import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/src/assets/vin2.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      ></div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/85 to-black/90"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-white">Đặt lịch ngay - Nhận ưu đãi 20%</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
          Sẵn Sàng Chăm Sóc
          <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mt-2">Xe Điện Của Bạn?</span>
        </h2>

        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-200 leading-relaxed">
          Đặt lịch bảo dưỡng ngay hôm nay để xe điện của bạn luôn hoạt động tốt nhất
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={() => { navigate('/service-booking') }}
            className="group relative bg-white text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white font-bold py-5 px-12 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            <span className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Đặt Lịch Bảo Dưỡng
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <button className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white font-bold py-5 px-12 rounded-full text-lg transition-all duration-300 shadow-xl">
            <span className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Gọi Hotline: 1900-764-372
            </span>
          </button>

        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/80">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">Miễn phí kiểm tra</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">Bảo hành 12 tháng</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold">Linh kiện chính hãng</span>
          </div>
        </div>
      </div>
    </section>
  );
};