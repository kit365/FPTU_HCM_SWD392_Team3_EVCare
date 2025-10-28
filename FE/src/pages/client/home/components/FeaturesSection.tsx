import { Check } from "iconoir-react";

export const FeaturesSection = () => {
  const features = [
    "Dịch vụ đạt tiêu chuẩn cao",
    "Thời gian bảo dưỡng nhanh chóng",
    "Bảng giá minh bạch, không phát sinh chi phí"
  ]

  return (
    <div className="bg-[#EFEFEF] relative">
      <section className="w-[1140px] mx-auto py-[120px] gap-[30px] flex">
        <div className="w-[50%]">
          <div className="text-[#87C4FF] uppercase text-[1.2rem] mb-[25px]">Tại sao chọn chúng tôi</div>
          <div className="font-[500] text-[#080619] tracking-[-2.4px] text-[4.8rem] leading-[1.25]">Người đồng hành đáng tin cậy trong chăm sóc xe điện của bạn</div>
          <p className="mt-[15px] text-[#5A5966] mb-[60px]">Chúng tôi mang đến dịch vụ bảo dưỡng xe điện toàn diện, được thực hiện bởi đội ngũ kỹ thuật viên chuyên nghiệp — giúp chiếc xe của bạn luôn vận hành mạnh mẽ, an toàn và tiết kiệm năng lượng hơn mỗi ngày.</p>
          <div className="pl-[50px]">
            {features.map((item, index) => (
              <div key={index} className="flex items-center mb-[20px]">
                <div className="w-[38px] h-[38px] bg-[#87C4FF] rounded-full flex items-center justify-center">
                  <Check className="font-[800] text-[#080619]" />
                </div>
                <p className="ml-[20px] text-[1.7rem] font-[500] leading-[1.25]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <img className="absolute right-0 top-0 w-[700px] h-[871px] object-cover" src="https://greeny.axiomthemes.com/wp-content/uploads/2022/03/home2-image1.jpg" alt="" />
    </div>

  );
};