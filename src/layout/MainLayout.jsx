import TopNavBar from '../components/skeleton/TopNavBar'; //

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#F8F9FA]">
      {/* Luôn ở trên cùng */}
      <TopNavBar /> 
      
      {/* Nội dung trang sẽ nằm dưới TopNavBar */}
      <main className="mx-auto max-w-[1440px] px-8 py-8 flex flex-col gap-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;