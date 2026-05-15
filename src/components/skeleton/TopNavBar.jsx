// src/components/TopNavBar.jsx
import { NAV_LINKS, HEADER_TITLE } from '../../constants/navigation';

// Import ICON
import notificationIcon from '../../assets/images/icon_chuong_thong_bao.png';
import chatIcon from '../../assets/images/icon_chat.png';

const TopNavBar = () => {
  return (
    <header className="sticky top-0 z-50 flex h-[56px] w-full items-center justify-between bg-[#0037B0] px-4 shadow-md border-b border-white/20">
      {/* Left side: Title - Fix cứng width 122px */}
      <div className="flex items-center w-[122px]">
        <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.24px] text-white whitespace-nowrap">
          {HEADER_TITLE.TITLE}
        </h1>
      </div>

      {/* Middle: Links - Chuyển justify-center thành justify-start để căn trái */}
      <nav className="flex flex-1 items-center justify-start pl-8">
        <ul className="flex items-center gap-[24px]">
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <a
                href={link.path}
                className="inline-block rounded-[2px] px-2 py-1 text-[12px] font-medium uppercase tracking-[0.6px] text-white opacity-80 hover:opacity-100 transition-all whitespace-nowrap"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Right side: Icons & Avatar */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <button className="flex h-[34px] w-[30px] items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
          <div 
            style={{ maskImage: `url(${notificationIcon})` }}
            className="h-[19px] w-[15px] bg-white [mask-size:contain] [mask-repeat:no-repeat]" 
          />
        </button>
        
        {/* Chat Icon */}
        <button className="flex h-[34px] w-[34px] items-center justify-center rounded-xl hover:bg-white/10 transition-colors">
          <div 
            style={{ maskImage: `url(${chatIcon})` }}
            className="h-[19px] w-[19px] bg-white [mask-size:contain] [mask-repeat:no-repeat]" 
          />
        </button>

        {/* Profile Avatar */}
        <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-white/20 p-[2px]">
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white/30 overflow-hidden">
             <div className="h-2.5 w-2.5 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;