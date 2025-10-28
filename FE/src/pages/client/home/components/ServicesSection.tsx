export const ServicesSection = () => {
  const services = [
    {
      title: "Bảo Dưỡng Định Kỳ",
      description: "Kiểm tra tổng thể hệ thống điện, phanh, lốp và các bộ phận quan trọng khác",
      background: "https://greeny.axiomthemes.com/wp-content/uploads/2022/03/home3-image1-840x700.jpg"
    },
    {
      title: "Bảo Hành Mở Rộng",
      description: "Gói bảo hành mở rộng với nhiều ưu đãi và dịch vụ chăm sóc khách hàng tốt nhất",
      background: "https://greeny.axiomthemes.com/wp-content/uploads/2022/02/home1-image3-840x700.jpg"
    },
    {
      title: "Tư Vấn Kỹ Thuật",
      description: "Tư vấn miễn phí về cách sử dụng, bảo dưỡng và nâng cấp xe điện",
      background: "https://greeny.axiomthemes.com/wp-content/uploads/2022/03/home1-image2.jpg"
    }

  ]

  return (
    <section className='px-[130px] py-[120px]'>
      <div className='uppercase text-[#141541] text-[1.4rem] font-[500] tracking-[0.8px] mb-[21px] text-center'>Những gì chúng tôi cung cấp</div>
      <h2 className='text-[#141541] text-[5.7rem] font-[600] text-center tracking-[-1.7px] mb-[45px]'>Lái xe an toàn, vận hành tối ưu.</h2>
      <div className='grid grid-cols-3 gap-[50px]'>
        {services.map((item, index) => (
          <div key={index}>
            <div className='mx-[82px] mb-[32px] w-[60%] aspect-square relative group'>
              <span
                style={{ backgroundImage: `url(${item.background})` }}
                className='absolute inset-0 w-full h-full block rounded-full z-20 group-hover:scale-[1.05] will-change-transform transition-all duration-300 overflow-hidden bg-no-repeat bg-cover bg-center'></span>
              <div className='absolute inset-0 z-10'>
                <span className="group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 opacity-0 absolute top-0 right-0 translate-x-[-40px] translate-y-[40px] inline-block will-change-transform transition-all duration-300"><svg className='w-[100px] h-[100px] fill-[#141541] opacity-[0.1]' viewBox="0 0 130 130">   <g transform="translate(-1670 -542)">     <circle cx="5" cy="5" r="5" transform="translate(1670 542)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1690 542)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1710 542)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1730 542)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1750 542)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1770 542)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1790 542)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1670 562)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1690 562)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1710 562)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1730 562)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1750 562)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1770 562)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1790 562)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1670 582)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1690 582)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1710 582)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1730 582)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1750 582)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1770 582)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1790 582)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1670 602)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1690 602)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1710 602)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1730 602)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1750 602)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1770 602)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1790 602)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1670 622)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1690 622)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1710 622)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1730 622)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1750 622)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1770 622)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1790 622)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1670 642)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1690 642)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1710 642)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1730 642)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1750 642)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1770 642)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1790 642)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1670 662)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1690 662)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1710 662)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1730 662)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1750 662)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1770 662)"></circle>     <circle cx="5" cy="5" r="5" transform="translate(1790 662)"></circle>   </g> </svg></span>
                <span className="group-hover:translate-x-[-20px] group-hover:translate-y-[5px] group-hover:opacity-100 opacity-0 absolute left-0 bottom-0 translate-x-[25px] translate-y-[-25px] inline-block will-change-transform transition-all duration-300"><svg className='w-[88px] h-[88px] fill-transparent stroke-[#A8C62E] stroke-[12px]' viewBox="0 0 97 97">   <g>     <circle cx="48.5" cy="48.5" r="48.5" stroke="none"></circle>     <circle cx="48.5" cy="48.5" r="38" fill="none"></circle>   </g> </svg></span>
              </div>
            </div>
            <div className='text-center text-[#4F627A] mb-[12px]'>Lợi ích</div>
            <div className='text-[#141541] font-[600] text-[2.5rem] text-center'>{item.title}</div>
            <div className='text-center text-[#4f627a] mt-[13px]'>{item.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
};