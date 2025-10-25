import React from 'react';

const ServiceCard = ({ 
  icon, 
  title, 
  description, 
  bgColor 
}: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  bgColor: string 
}) => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-purple-200 overflow-hidden">
      {/* Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Animated Corner Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
      
      <div className="relative z-10">
        <div className={`w-20 h-20 ${bgColor} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export const ServicesSection = () => {
  const services = [
    {
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Kiểm Tra Pin",
      description: "Kiểm tra tình trạng pin, dung lượng và hiệu suất sạc để đảm bảo xe hoạt động tối ưu",
      bgColor: "bg-blue-100"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Bảo Dưỡng Định Kỳ",
      description: "Kiểm tra tổng thể hệ thống điện, phanh, lốp và các bộ phận quan trọng khác",
      bgColor: "bg-green-100"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Sửa Chữa Chuyên Sâu",
      description: "Sửa chữa các lỗi phức tạp về hệ thống điện, động cơ và các bộ phận kỹ thuật cao",
      bgColor: "bg-purple-100"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Dịch Vụ Khẩn Cấp",
      description: "Hỗ trợ 24/7 cho các trường hợp khẩn cấp, cứu hộ và sửa chữa tại chỗ",
      bgColor: "bg-red-100"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Bảo Hành Mở Rộng",
      description: "Gói bảo hành mở rộng với nhiều ưu đãi và dịch vụ chăm sóc khách hàng tốt nhất",
      bgColor: "bg-yellow-100"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      title: "Tư Vấn Kỹ Thuật",
      description: "Tư vấn miễn phí về cách sử dụng, bảo dưỡng và nâng cấp xe điện",
      bgColor: "bg-indigo-100"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-6 font-semibold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Dịch Vứ Của Chúng Tôi
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Dịch Vụ Bảo Dưỡng</span>
            <span className="block mt-2">Toàn Diện</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chúng tôi cung cấp đầy đủ các dịch vụ bảo dưỡng cho xe điện với chất lượng cao và giá cả hợp lý
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              bgColor={service.bgColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
};