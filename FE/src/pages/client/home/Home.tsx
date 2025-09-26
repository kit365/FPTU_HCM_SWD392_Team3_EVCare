import { useNavigate } from "react-router-dom"

export const HomePage = () => {
const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-[#aca9bb] to-[#434050] text-white">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            Dịch Vụ Bảo Dưỡng
                            <span className="block text-[#a39cff]">Xe Điện Chuyên Nghiệp</span>
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                            Chăm sóc xe điện của bạn với đội ngũ kỹ thuật viên giàu kinh nghiệm và công nghệ hiện đại
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={()=> {navigate('/service-booking')}} className="bg-[#8b84ee] hover:bg-[#6f66e7] text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105">
                                Đặt Lịch Ngay
                            </button>

                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Dịch Vụ Bảo Dưỡng Toàn Diện
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Chúng tôi cung cấp đầy đủ các dịch vụ bảo dưỡng cho xe điện với chất lượng cao và giá cả hợp lý
                        </p>
                    </div>

                    <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Service 1 */}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 border border-gray-100">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Kiểm Tra Pin</h3>
                            <p className="text-gray-600 mb-4">
                                Kiểm tra tình trạng pin, dung lượng và hiệu suất sạc để đảm bảo xe hoạt động tối ưu
                            </p>
                            <div className="text-blue-600 font-semibold">Từ 200.000đ</div>
                        </div>

                        {/* Service 2 */}
                        <div className=" bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 border border-gray-100">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Bảo Dưỡng Định Kỳ</h3>
                            <p className="text-gray-600 mb-4">
                                Kiểm tra tổng thể hệ thống điện, phanh, lốp và các bộ phận quan trọng khác
                            </p>
                            <div className="text-blue-600 font-semibold">Từ 500.000đ</div>
                        </div>

                        {/* Service 3 */}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 border border-gray-100">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Sửa Chữa Chuyên Sâu</h3>
                            <p className="text-gray-600 mb-4">
                                Sửa chữa các lỗi phức tạp về hệ thống điện, động cơ và các bộ phận kỹ thuật cao
                            </p>
                            <div className="text-blue-600 font-semibold">Liên hệ</div>
                        </div>

                        {/* Service 4 */}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 border border-gray-100">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Dịch Vụ Khẩn Cấp</h3>
                            <p className="text-gray-600 mb-4">
                                Hỗ trợ 24/7 cho các trường hợp khẩn cấp, cứu hộ và sửa chữa tại chỗ
                            </p>
                            <div className="text-blue-600 font-semibold">Hotline: 1900-xxx</div>
                        </div>

                        {/* Service 5 */}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 border border-gray-100">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Bảo Hành Mở Rộng</h3>
                            <p className="text-gray-600 mb-4">
                                Gói bảo hành mở rộng với nhiều ưu đãi và dịch vụ chăm sóc khách hàng tốt nhất
                            </p>
                            <div className="text-blue-600 font-semibold">Liên hệ</div>
                        </div>

                        {/* Service 6 */}
                        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 p-6 border border-gray-100">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tư Vấn Kỹ Thuật</h3>
                            <p className="text-gray-600 mb-4">
                                Tư vấn miễn phí về cách sử dụng, bảo dưỡng và nâng cấp xe điện
                            </p>
                            <div className="text-blue-600 font-semibold">Miễn phí</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Tại Sao Chọn Chúng Tôi?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Với hơn 10 năm kinh nghiệm trong lĩnh vực xe điện, chúng tôi cam kết mang đến dịch vụ tốt nhất
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chất Lượng Cao</h3>
                            <p className="text-gray-600">Sử dụng linh kiện chính hãng và công nghệ tiên tiến</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nhanh Chóng</h3>
                            <p className="text-gray-600">Thời gian bảo dưỡng nhanh, không làm gián đoạn công việc</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Giá Cả Hợp Lý</h3>
                            <p className="text-gray-600">Bảng giá minh bạch, không phát sinh chi phí</p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Hỗ Trợ 24/7</h3>
                            <p className="text-gray-600">Đội ngũ kỹ thuật sẵn sàng hỗ trợ mọi lúc</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Gallery Section */}
            <section className="py-20 bg-white">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Hình Ảnh Dịch Vụ
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Khám phá quy trình bảo dưỡng xe điện chuyên nghiệp tại trung tâm của chúng tôi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/*Feature 1*/}
                        <article className="overflow-hidden h-[400px] rounded-lg shadow-sm transition hover:shadow-lg">
                            <img
                                alt=""
                                src="https://images.cars.com/cldstatic/wp-content/uploads/img-1831663977-1487717719857.jpg"
                                className="h-[220px] w-full object-cover"
                            />

                            <div className="bg-white p-4 sm:p-6">
                                <h3 className="mt-0.5  text-4xl text-gray-900">Thay - đổi linh kiện hỏng hóc miễn phí.</h3>
                                <p className="mt-2 line-clamp-3 text-lg/relaxed text-gray-500">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                                    pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                                    mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                                    dignissimos. Molestias explicabo corporis voluptatem?
                                </p>
                            </div>
                        </article>
                        {/*Feature 2*/}
                        <article className="overflow-hidden h-[400px] rounded-lg shadow-sm transition hover:shadow-lg">
                            <img
                                alt=""
                                src="https://cdn.cartipsdaily.com/wp-content/uploads/2025/09/WX20250920-134745@2x.webp"
                                className="h-[220px] w-full object-cover"
                            />

                            <div className="bg-white p-4 sm:p-6">
                                <h3 className="mt-0.5  text-4xl text-gray-900">Sửa nhanh – chuẩn xác – tiết kiệm chi phí.</h3>
                                <p className="mt-2 line-clamp-3 text-lg/relaxed text-gray-500">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                                    pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                                    mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                                    dignissimos. Molestias explicabo corporis voluptatem?
                                </p>
                            </div>
                        </article>
                        {/*Feature 3*/}
                        <article className="overflow-hidden h-[400px] rounded-lg shadow-sm transition hover:shadow-lg">
                            <img
                                alt=""
                                src="https://tse2.mm.bing.net/th/id/OIP.8WDbSmIP_X9kyrWfwp4dwwHaE7?rs=1&pid=ImgDetMain&o=7&rm=3"
                                className="h-[220px] w-full object-cover"
                            />

                            <div className="bg-white p-4 sm:p-6">
                                <h3 className="mt-0.5  text-4xl text-gray-900">Vệ sinh sạch sâu - sáng không tì vết.</h3>
                                <p className="mt-2 line-clamp-3 text-lg/relaxed text-gray-500">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                                    pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                                    mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                                    dignissimos. Molestias explicabo corporis voluptatem?
                                </p>
                            </div>
                        </article>
                        {/*Feature 4*/}
                        <article className="overflow-hidden h-[400px] rounded-lg shadow-sm transition hover:shadow-lg">
                            <img
                                alt=""
                                src="https://bizflyportal.mediacdn.vn/thumb_wm/1000,100/bizflyportal/images/cac16402471994585.jpeg"
                                className="h-[220px] w-full object-cover"
                            />
                            <div className="bg-white p-4 sm:p-6">
                                <h3 className="mt-0.5  text-4xl text-gray-900">Phục vụ tận tâm, khởi hành an toàn.</h3>
                                <p className="mt-2 line-clamp-3 text-lg/relaxed text-gray-500">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                                    pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                                    mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                                    dignissimos. Molestias explicabo corporis voluptatem?
                                </p>
                            </div>
                        </article>
                        {/*Feature 5*/}
                        <article className="overflow-hidden h-[400px] rounded-lg shadow-sm transition hover:shadow-lg">
                            <img
                                alt=""
                                src="https://hondagiaiphong.net/images/2019/Tintuc/khi-nao-nen-thay-nhot-xe-oto.jpg"
                                className="h-[220px] w-full object-cover"
                            />
                            <div className="bg-white p-4 sm:p-6">
                                <h3 className="mt-0.5  text-4xl text-gray-900">Chăm sóc xế yêu – an tâm mọi nẻo đường.</h3>
                                <p className="mt-2 line-clamp-3 text-lg/relaxed text-gray-500">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                                    pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                                    mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                                    dignissimos. Molestias explicabo corporis voluptatem?
                                </p>
                            </div>
                        </article>
                        {/*Feature 6*/}
                        <article className="overflow-hidden h-[400px] rounded-lg shadow-sm transition hover:shadow-lg">
                            <img
                                alt=""
                                src="https://static-images.vnncdn.net/files/publish/2022/11/16/htmv2-4-1416.jpg"
                                className="h-[220px] w-full object-cover"
                            />
                            <div className="bg-white p-4 sm:p-6">
                                <h3 className="mt-0.5  text-4xl text-gray-900">Khám chữa - bảo hành xe toàn diện. </h3>
                                <p className="mt-2 line-clamp-3 text-lg/relaxed text-gray-500">
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae dolores, possimus
                                    pariatur animi temporibus nesciunt praesentium dolore sed nulla ipsum eveniet corporis quidem,
                                    mollitia itaque minus soluta, voluptates neque explicabo tempora nisi culpa eius atque
                                    dignissimos. Molestias explicabo corporis voluptatem?
                                </p>
                            </div>
                        </article>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-16 text-center">
                        <div className="bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Trung Tâm Bảo Dưỡng Hiện Đại
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Với trang thiết bị hiện đại và đội ngũ kỹ thuật viên được đào tạo chuyên sâu,
                                chúng tôi cam kết mang đến dịch vụ bảo dưỡng xe điện chất lượng cao nhất.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Thiết Bị Hiện Đại</h4>
                                    <p className="text-sm text-gray-600">Máy móc chuyên dụng cho xe điện</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Kỹ Thuật Viên Chuyên Nghiệp</h4>
                                    <p className="text-sm text-gray-600">Được đào tạo chuyên sâu về xe điện</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Bảo Hành Toàn Diện</h4>
                                    <p className="text-sm text-gray-600">Cam kết chất lượng dịch vụ</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-[#aca9bb] to-[#434050] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Sẵn Sàng Chăm Sóc Xe Điện Của Bạn?
                    </h2>
                    <p className="text-xl mb-8 max-w-3xl mx-auto">
                        Đặt lịch bảo dưỡng ngay hôm nay để xe điện của bạn luôn hoạt động tHow to position your furniture for positiốt nhất
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={()=> {navigate('/service-booking')}} className="bg-[#a39cff] hover:bg-[#6f66e7] text-white font-semibold py-3 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105">
                            Đặt Lịch Bảo Dưỡng
                        </button>
                        <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg text-lg transition duration-300">
                            Gọi Hotline: 1900-xxx
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact Info Section */}
            {/* <section className="py-16 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Địa Chỉ</h3>
                            <p className="text-gray-300">
                                123 Đường ABC, Quận 1<br />
                                TP. Hồ Chí Minh
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Hotline</h3>
                            <p className="text-gray-300">
                                1900-xxx-xxx<br />
                                Hỗ trợ 24/7
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Giờ Làm Việc</h3>
                            <p className="text-gray-300">
                                Thứ 2 - Chủ Nhật<br />
                                7:00 - 22:00
                            </p>
                        </div>
                    </div>
                </div>
            </section> */}
        </div>
    )
}
