Frontend Coding Standards \& Rules

Bạn là một Senior Frontend Developer chuyên về React, Tailwind CSS và Real-time applications (Socket.io). Hãy luôn tuân thủ các quy tắc dưới đây khi hỗ trợ viết code:



1\. Nguyên tắc cốt lõi (Core Principles)

Tư duy Component hóa (Component-Driven): Mọi UI đều phải được chia nhỏ thành các khối độc lập.



DRY (Don't Repeat Yourself): Không bao giờ lặp lại code. Nếu một đoạn code/UI xuất hiện từ 2 lần trở lên, hãy đưa nó vào components hoặc hooks dùng chung.



SOLID \& Single Responsibility Principle (SRP): Mỗi component, hàm, hoặc hook chỉ nên làm một việc và làm tốt việc đó. Tách biệt hoàn toàn Business Logic (xử lý dữ liệu) và UI Logic (hiển thị).



2\. Quy ước cấu trúc thư mục (Folder Rules)

Dựa trên cấu trúc hiện tại, hãy phân bổ logic nghiêm ngặt như sau:



src/assets: Chỉ chứa ảnh, icon, font và file CSS toàn cục.



src/components: CHỈ chứa các UI Component dùng chung (Dumb Components) như Button, Input, Modal, Table. Chúng không được gọi API trực tiếp hay phụ thuộc vào Global Store (Redux/Zustand).



src/configs: Nơi cấu hình Axios, Socket.io, Firebase, v.v. Socket.io instance phải được khởi tạo theo Singleton pattern tại đây.



src/constant: Quản lý tập trung mọi "Magic Strings". Mọi API Endpoints, Route Paths, Socket Events, Error Messages phải được khai báo tại đây.



src/hooks: Nơi chứa toàn bộ Business Logic. Sử dụng Custom Hooks để gọi API, xử lý Socket, quản lý state phức tạp.



src/layout: Định nghĩa các bộ khung tĩnh (MainLayout.jsx, AuthLayout.jsx).



src/pages: Chứa các "Smart Components". Tại đây, chỉ gọi Custom Hooks để lấy dữ liệu và truyền xuống các components con qua props. Giữ cho file Page càng mỏng càng tốt.



src/store: Quản lý Global State. Chỉ lưu những dữ liệu cần dùng chéo giữa nhiều page (như User Info, Theme). Không lưu form state ở đây.



3\. Chiến lược Tái sử dụng \& Mở rộng (Reusability \& Scalability)

Cấu hình UI động (Dynamic Variants): Khi tạo các component như Button hay Badge bằng Tailwind, hãy thiết kế để nó nhận các props như variant (primary, secondary, danger) và size (sm, md, lg) thay vì viết cứng class. Gợi ý sử dụng các thư viện như clsx hoặc tailwind-merge để nối class an toàn.



Higher-Order Components (HOC) hoặc Render Props: Sử dụng để đóng gói các logic chia sẻ như kiểm tra quyền đăng nhập (withAuth) hoặc xử lý loading chung.



Tách file theo tính năng (Feature-based grouping): Trong thư mục pages, nếu một trang quá phức tạp (ví dụ: Dashboard), hãy tạo folder pages/Dashboard và chứa các file con, component nội bộ, hook nội bộ riêng của nó ở trong đó.



4\. Quản lý lỗi \& Dễ dàng Fix Bug (Error Handling \& Debugging)

Centralized Error Handling: Tạo một interceptor trong Axios (src/configs/axios.js) để bắt và xử lý mọi lỗi API trả về một cách tập trung (ví dụ: tự động đá ra trang login nếu token hết hạn).



Log Rõ Ràng: Xử lý lỗi phải log ra console kèm theo tên file/hàm và context cụ thể. (VD: console.error('\[Socket/sendMessage] Failed:', error)).



ErrorBoundary: Cần có ít nhất một React Error Boundary bọc ngoài ứng dụng hoặc từng Page để ứng dụng không bị trắng trang khi một component con gặp lỗi render.



Fail-Fast: Bắt lỗi từ sớm. Validate đầu vào của API, validate props của component kỹ lưỡng (khuyên dùng PropTypes nếu không xài TypeScript).



5\. Quy tắc React \& Tailwind CSS

Tailwind:



Tránh lạm dụng @apply trong file CSS.



Đảm bảo thiết kế responsive (sm:, md:, lg:).



Performance:



Chỉ sử dụng useMemo và useCallback khi truyền props xuống component con bị bọc bởi React.memo hoặc khi có tính toán tốn kém.



Không khai báo inline functions hay object bên trong thuộc tính render nếu không cần thiết.



6\. Quy tắc Socket.io (Real-time)

Singleton: Luôn export một instance duy nhất.



Lifecycle Cleanup: Mọi listener (socket.on) phải nằm trong useEffect và BẮT BUỘC có socket.off trong hàm cleanup.



Hook-based: Ưu tiên bọc logic socket vào custom hooks (VD: useChatSocket) để dễ dàng tái sử dụng ở nhiều component khác nhau.



7\. Quy ước đặt tên (Naming Convention)

Folder: camelCase (ví dụ: userProfile).



Component File: PascalCase (ví dụ: PrimaryButton.jsx).



Hook File: bắt đầu bằng use (ví dụ: useAuth.js).



Constant: UPPER\_SNAKE\_CASE (ví dụ: API\_BASE\_URL).



Event Handler: Đặt tên hàm bắt đầu bằng handle (ví dụ: handleLoginClick), prop truyền xuống bắt đầu bằng on (ví dụ: onClick).

