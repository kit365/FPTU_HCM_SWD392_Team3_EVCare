type GalleryItemProps = {
  imageUrl: string;
  title: string;
};

const GalleryItem = ({ imageUrl, title }: GalleryItemProps) => (
  <article className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
    <div className="relative h-[320px] overflow-hidden">
      <img
        alt={title}
        src={imageUrl}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <h3 className="text-2xl font-bold mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{title}</h3>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      
      {/* Corner Badge */}
      <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        Mới
      </div>
    </div>
  </article>
);

export const GallerySection = () => {
  const galleryItems = [
    {
      imageUrl: "https://images.cars.com/cldstatic/wp-content/uploads/img-1831663977-1487717719857.jpg",
      title: "Thay - đổi linh kiện hỏng hóc miễn phí."
    },
    {
      imageUrl: "https://cdn.cartipsdaily.com/wp-content/uploads/2025/09/WX20250920-134745@2x.webp",
      title: "Sửa nhanh – chuẩn xác – tiết kiệm chi phí."
    },
    {
      imageUrl: "https://tse2.mm.bing.net/th/id/OIP.8WDbSmIP_X9kyrWfwp4dwwHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
      title: "Vệ sinh sạch sâu - sáng không tì vết."
    },
    {
      imageUrl: "https://bizflyportal.mediacdn.vn/thumb_wm/1000,100/bizflyportal/images/cac16402471994585.jpeg",
      title: "Phục vụ tận tâm, khởi hành an toàn."
    },
    {
      imageUrl: "https://hondagiaiphong.net/images/2019/Tintuc/khi-nao-nen-thay-nhot-xe-oto.jpg",
      title: "Chăm sóc xế yêu – an tâm mọi nẻo đường."
    },
    {
      imageUrl: "https://static-images.vnncdn.net/files/publish/2022/11/16/htmv2-4-1416.jpg",
      title: "Khám chữa - bảo hành xe toàn diện."
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full px-4 py-2 mb-6 font-semibold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Thư Viện Hình Ảnh
          </div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Hình Ảnh</span>
            <span className="block mt-2">Dịch Vụ</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá quy trình bảo dưỡng xe điện chuyên nghiệp tại trung tâm của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <GalleryItem key={index} imageUrl={item.imageUrl} title={item.title} />
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-20 text-center">
          <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 max-w-5xl mx-auto shadow-2xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px'}}></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Trung Tâm Bảo Dưỡng Hiện Đại
              </h3>
              <p className="text-white/90 mb-10 text-lg max-w-3xl mx-auto">
                Với trang thiết bị hiện đại và đội ngũ kỹ thuật viên được đào tạo chuyên sâu,
                chúng tôi cam kết mang đến dịch vụ bảo dưỡng xe điện chất lượng cao nhất.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-xl mb-2">Thiết Bị Hiện Đại</h4>
                  <p className="text-white/80">Máy móc chuyên dụng cho xe điện</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-xl mb-2">Kỹ Thuật Viên Chuyên Nghiệp</h4>
                  <p className="text-white/80">Được đào tạo chuyên sâu về xe điện</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-xl mb-2">Bảo Hành Toàn Diện</h4>
                  <p className="text-white/80">Cam kết chất lượng dịch vụ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};