import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from "framer-motion";

export const GallerySection = () => {
  return (
    <>
      <section className="w-[1140px] mx-auto py-[150px] flex items-center relative">
        <motion.div 
          className="w-[50%] px-[15px]"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-[1.2rem] text-[#141541] font-[600] uppercase mb-[15px]">Dịch vụ cơ bản</div>
          <div className="text-[5rem] leading-[1.1] text-[#141541] font-secondary mb-[20px]">Chăm sóc xe của bạn và hành tinh chúng ta</div>
          <p className="text-[1.4rem] text-[#4F627A]">Chúng tôi mang đến giải pháp chăm sóc xe điện toàn diện, giúp xe của bạn luôn hoạt động ổn định, tiết kiệm năng lượng và thân thiện với môi trường</p>
          <div className="mr-[63px] mt-[45px] relative mb-[26px]">
            <div className="text-[1.6rem] font-[600] text-[#141541]">Pin</div>
            <div className="absolute top-0 left-[75%] text-[1.6rem] font-[600] text-[#141541]">80%</div>
            <div className="bg-[#D6E4F1] h-[6px] w-full mt-[12px]">
              <div className="bg-[#A8C62E] w-[80%] h-[6px]"></div>
            </div>
          </div>
          <div className="mr-[63px] mt-[25px] relative mb-[26px]">
            <div className="text-[1.6rem] font-[600] text-[#141541]">Động cơ</div>
            <div className="absolute top-0 left-[85%] text-[1.6rem] font-[600] text-[#141541]">90%</div>
            <div className="bg-[#D6E4F1] h-[6px] w-full mt-[12px]">
              <div className="bg-[#A8C62E] w-[90%] h-[6px]"></div>
            </div>
          </div>
        </motion.div>
        <motion.div 
          className="w-[50%] pl-[40px]"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.img 
            className="w-[503px] h-[574px] object-cover ml-[140px]" 
            src="https://greeny.axiomthemes.com/wp-content/uploads/elementor/thumbs/home2-image4-poc0xehrny4pw2kd4f6x7082koqj9pehar77xg10tg.jpg" 
            alt=""
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <motion.img 
            className="w-[409px] h-[409px] object-cover absolute top-[38%]" 
            src="https://greeny.axiomthemes.com/wp-content/uploads/2022/03/home2-image3-370x370.jpg" 
            alt=""
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
        </motion.div>
      </section>
      <div className="bg-[#86bb45]">
        <div className="w-[1300px] mx-auto px-[15px] flex justify-between">
          <div className="w-[41.6%]">
            <div className="py-[60px] text-[2.8rem] font-[600] text-white flex items-center">
              Rất hân hạnh phục vụ bạn
              <PublicIcon className='ml-[15px]' sx={{ fontSize: "3.8rem" }} />
            </div>
          </div>
          <div className='w-[16.8%] flex justify-center items-center border-l-2 border-r-2 border-l-[#ffffff1a] border-r-[#ffffff1a] px-[10px]'>
            <div className='my-[30px] mx-[30px]'>
              <span className='text-white text-[1.7rem] font-[600] flex justify-center'>Gọi tôi theo </span>
              <span className='text-white text-[1.6rem] font-[600] mt-[5px] flex justify-center'>0353 933 459</span>
            </div>
          </div>
          <div className="w-[41.6%]">
            <div className="py-[60px] text-[2.8rem] font-[600] text-white flex items-center justify-end">
              <AccessTimeIcon className='mr-[15px]' sx={{ fontSize: "3.8rem" }} />
              Dịch vụ phục vụ 24/7
            </div>
          </div>
        </div>
      </div>
    </>
  );
};