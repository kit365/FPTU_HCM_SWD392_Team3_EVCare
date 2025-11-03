export const ClientFooter: React.FC = () => {
  return (
    <footer
      style={{
        backgroundImage: `url('https://equant.like-themes.com/wp-content/uploads/2021/12/footer-bg-1.png')`
      }}
      className="px-[15px] bg-center bg-no-repeat bg-[#152527]">
      <div className="pt-[80px] pb-[20px] flex flex-col items-center">
        <img src="https://i.imgur.com/XAy1f1e.jpeg" alt="EVCare" className="w-[80px] h-[80px] object-cover mb-[40px]" />
        <p className="w-[800px] text-[#FFFFFFD9] text-center text-[1.4rem]">Chúng tôi mang đến dịch vụ bảo dưỡng xe điện toàn diện, giúp chiếc xe của bạn luôn hoạt động êm ái, tiết kiệm và bền bỉ theo thời gian.</p>
        <p className="text-center text-white mt-[120px]">© Group 3 - Dev Mạnh Nhất Thế Giới - 2025</p>
      </div>
    </footer>
  )
};