import { Check } from "iconoir-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const CTASection = () => {
  return (
    <section
      style={{
        backgroundImage: "url('https://batremo.tokotema.xyz/wp-content/uploads/2025/03/image-3.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="bg-[#000] font-third"
    >
      <div className="w-[1140px] mx-auto py-[150px]">
        <motion.div 
          className="text-[#87C4FF] uppercase text-[1.2rem] font-[500] mb-[25px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >Tiếp Năng Lượng Cho Xe Của Bạn</motion.div>
        <motion.h2 
          className="text-white text-[5rem] leading-[1.25] mb-[40px] font-[500] w-[770px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >Dịch Vụ Chuyên Nghiệp Giúp Xe Điện Của Bạn Luôn Vận Hành Tốt Nhất</motion.h2>
        <motion.div 
          className="flex items-center gap-[50px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center mb-[20px]">
            <div className="w-[38px] h-[38px] bg-[#87C4FF] rounded-full flex items-center justify-center">
              <Check className="font-[800] text-[#fff]" />
            </div>
            <p className="ml-[10px] text-white text-[1.7rem] font-[500] leading-[1.25]">Kỹ Thuật Viên Chuyên Nghiệp</p>
          </div>
          <div className="flex items-center mb-[20px]">
            <div className="w-[38px] h-[38px] bg-[#87C4FF] rounded-full flex items-center justify-center">
              <Check className="font-[800] text-[#fff]" />
            </div>
            <p className="ml-[10px] text-white text-[1.7rem] font-[500] leading-[1.25]">Dịch Vụ Nhanh Chóng & Hiệu Quả</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/client/service-booking" className="inline-block py-[16px] px-[26px] rounded-[8px] bg-[#FE4C1C] hover:bg-[#080619] transition-colors duration-300 ease-linear cursor-pointer text-[1.4rem] font-[500] uppercase inline-block text-white mt-[20px]">Đặt Lịch Ngay Hôm Nay</Link>
        </motion.div>
      </div>
    </section>
  );
};