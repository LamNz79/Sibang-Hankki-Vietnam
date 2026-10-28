# Sibang Hankki — Danh sách tính năng MVP

**Ngày cập nhật:** 22/10/2026  
**Phạm vi:** Customer, Owner/Staff, Restaurant Admin và System Admin  
**Mục tiêu MVP:** Hoàn thành luồng từ tạo nhà hàng, cấu hình khả năng nhận bàn, khách đặt bàn, nhà hàng xử lý yêu cầu, check-in và theo dõi trạng thái toàn hệ thống.

## 1. Tổng quan vai trò

| Khu vực | Người sử dụng | Phạm vi dữ liệu |
| --- | --- | --- |
| Customer | Khách hàng và khách chưa đăng nhập | Nhà hàng công khai và đặt bàn của chính khách |
| Owner | Chủ nhà hàng hoặc nhân viên tiền sảnh | Nhà hàng được gán cho tài khoản |
| Restaurant Admin | Đội ngũ quản lý nhà hàng | Nhà hàng được gán cho tài khoản, giao diện desktop |
| System Admin | Quản trị viên nền tảng | Toàn bộ người dùng, nhà hàng, phân quyền và đặt bàn |

Hệ thống có bộ chuyển khu vực để tài khoản đi đến workspace phù hợp với quyền được cấp.

## 2. Tài khoản, xác thực và phân quyền

Các tính năng đã hoạt động:

- Đăng ký tài khoản khách hàng.
- Đăng nhập và đăng xuất bằng session.
- Xem thông tin phiên đăng nhập hiện tại.
- Đổi mật khẩu của chính tài khoản.
- System Admin đặt lại mật khẩu cho tài khoản khác, ngoại trừ tài khoản ADMIN.
- Chỉnh sửa hồ sơ khách hàng: họ tên, email và số điện thoại.
- Chuyển đổi ngôn ngữ Việt, Anh và Hàn trên các khu vực đã hỗ trợ.
- Bảo vệ route theo vai trò:
  - OWNER/STAFF mới vào được khu vực quản lý nhà hàng;
  - ADMIN mới vào được System Admin;
  - người chưa đăng nhập bị chuyển đến trang đăng nhập khi truy cập trang được bảo vệ.
- Các thao tác ghi dữ liệu được bảo vệ bằng CSRF token.
- Backend lấy danh tính từ session, không tin `userId` hoặc `restaurantId` do trình duyệt tự gửi.
- Tài khoản OWNER/STAFF chỉ thao tác trên nhà hàng được gán.
- System Admin có thể tạm khóa hoặc kích hoạt lại tài khoản.

## 3. Customer — Khám phá và đặt bàn

### 3.1. Khám phá nhà hàng

- Trang chủ và danh sách nhà hàng công khai.
- Chỉ hiển thị nhà hàng đang hoạt động và chưa bị lưu trữ.
- Lọc nhà hàng theo tỉnh/thành phố và phường/xã/đặc khu.
- Danh sách địa giới được lấy qua API backend proxy thay vì gắn cứng vào frontend.
- Trang chi tiết nhà hàng gồm:
  - tên, mô tả, loại ẩm thực và khoảng giá;
  - địa chỉ và thông tin liên hệ;
  - thư viện nhiều ảnh;
  - ảnh chính theo thứ tự hiển thị;
  - danh mục và món ăn đang khả dụng.
- Lưu hoặc bỏ lưu nhà hàng yêu thích đối với khách đã đăng nhập.
- Trang riêng hiển thị các nhà hàng đã lưu.

### 3.2. Tạo đặt bàn

- Khách chưa đăng nhập vẫn có thể tạo đặt bàn.
- Khách đã đăng nhập có thể tạo đặt bàn và xem dữ liệu trên nhiều thiết bị.
- Chọn ngày, số khách và giờ còn khả dụng.
- Khung giờ được lấy từ API availability theo nhà hàng, ngày và số khách.
- Hiển thị rõ trường hợp nhà hàng cần xác nhận thủ công.
- Nhập họ tên, số điện thoại, email và yêu cầu đặc biệt.
- Chọn món đặt trước từ menu, nhập số lượng và bổ sung ghi chú đặt món.
- Chống gửi trùng yêu cầu bằng idempotency key.
- Kết quả đặt bàn phụ thuộc cấu hình nhà hàng:
  - **AUTO:** tự động xác nhận;
  - **MANUAL:** chờ nhà hàng xác nhận;
  - **HYBRID:** tự động hoặc thủ công theo số lượng khách.

### 3.3. Quản lý đặt bàn của khách

- Danh sách chỉ hiển thị đặt bàn thuộc tài khoản hiện tại.
- Với khách chưa đăng nhập, trình duyệt chỉ lưu và hiển thị đặt bàn có management token tương ứng.
- Trang chi tiết hiển thị:
  - mã đặt bàn;
  - nhà hàng, ngày giờ và số khách;
  - món đặt trước và yêu cầu đặc biệt;
  - trạng thái đặt bàn và trạng thái chuyến thăm.
- Khách có thể hủy trong thời hạn nhà hàng cho phép.
- Khách có thể gửi yêu cầu đổi ngày/giờ.
- Khi nhà hàng đề xuất giờ khác, khách có thể:
  - chấp nhận;
  - từ chối;
  - yêu cầu một thời gian khác.
- Thông báo đề xuất cũ được ẩn sau khi đã có kết quả mới.
- Đặt bàn đã xác nhận có mã QR check-in.
- Trạng thái phía khách cập nhật theo các bước: đã xác nhận, đã đến, đã xếp chỗ, hoàn thành hoặc không đến.
- Trang chi tiết nhà hàng và ảnh được liên kết từ danh sách/chi tiết đặt bàn.

## 4. Owner/Staff — Vận hành nhà hàng

### 4.1. Bảng điều hành hằng ngày

- Xem đặt bàn của đúng nhà hàng được gán.
- Xem danh sách theo ngày và trạng thái.
- Tìm kiếm đặt bàn theo mã, tên khách hoặc thông tin liên hệ.
- Có phân trang và lựa chọn số bản ghi mỗi trang.
- Hiển thị tổng hợp số lượng đã xác nhận, đã check-in, đã hủy và no-show.
- Tạo khách vãng lai/walk-in trực tiếp tại nhà hàng.

### 4.2. Xử lý yêu cầu đặt bàn

- Xem đầy đủ chi tiết khách và yêu cầu phục vụ.
- Xác nhận yêu cầu đang chờ.
- Từ chối yêu cầu và ghi lý do.
- Đề xuất một ngày/giờ khác kèm lời nhắn.
- Xem phản hồi của khách đối với đề xuất.
- Chấp nhận hoặc từ chối yêu cầu đổi thời gian do khách gửi.
- Hủy đặt bàn đã xác nhận khi nghiệp vụ cho phép.
- Có thao tác gọi khách từ thông tin số điện thoại.
- Các trạng thái terminal hoặc trạng thái chuyến thăm không cho đi ngược nhằm bảo toàn lịch sử.

### 4.3. Nhận khách và check-in

- Quét QR từ điện thoại của khách.
- Check-in thủ công khi không thể quét QR.
- Tìm đặt bàn theo mã, tên khách hoặc số điện thoại.
- Kiểm tra điều kiện thời gian và trạng thái trước khi check-in.
- Cập nhật chuyến thăm theo luồng:
  **EXPECTED → ARRIVED → SEATED → COMPLETED**.
- Đánh dấu **NO_SHOW** sau giờ đặt bàn cộng thời gian chờ đã cấu hình.
- Owner và Customer cùng nhìn thấy trạng thái chuyến thăm mới nhất.

### 4.4. Khách hàng của nhà hàng

- Tổng hợp danh sách khách từ lịch sử đặt bàn thật.
- Tìm theo tên, số điện thoại hoặc email.
- Hiển thị số lần đặt, số lần đến, số lần no-show và lần đặt gần nhất.

### 4.5. Cài đặt nhận bàn

- Chỉnh sửa thông tin hồ sơ nhà hàng.
- Cấu hình chế độ xác nhận AUTO, MANUAL hoặc HYBRID.
- Cấu hình ngưỡng số khách cần xác nhận thủ công.
- Cấu hình:
  - sức chứa;
  - thời hạn cho phép đặt trước;
  - khoảng cách giữa các slot;
  - thời lượng dùng bữa;
  - số khách tối thiểu và tối đa khi đặt online;
  - ngưỡng nhóm đông;
  - hạn chót hủy;
  - thời gian chờ trước khi đánh dấu no-show.
- Cấu hình nhiều khoảng giờ hoạt động cho từng ngày trong tuần.
- Lưu giờ hoạt động và tự động tạo lại slot tương lai.
- Chủ động tạo lại slot sau khi thay đổi các thông số ảnh hưởng đến availability.
- Việc tạo lại slot giữ nguyên các đặt bàn hiện có.
- Có phần hướng dẫn giải thích thuật toán tạo slot cho người dùng mới.

## 5. Restaurant Admin — Quản lý nhà hàng trên desktop

Khu vực này dùng cùng phạm vi nhà hàng với Owner/Staff nhưng tối ưu cho màn hình desktop.

### 5.1. Dashboard và reservations

- Dashboard tính toán từ dữ liệu đặt bàn thật của nhà hàng:
  - đặt bàn hôm nay;
  - khách đã đến;
  - yêu cầu đang chờ;
  - no-show;
  - xu hướng bảy ngày;
  - các yêu cầu cần xử lý sớm.
- Danh sách đặt bàn có tìm kiếm, bộ lọc trạng thái, khoảng thời gian và phân trang.
- Trang chi tiết hỗ trợ các thao tác phù hợp với trạng thái:
  xác nhận, check-in, xếp chỗ, hoàn thành, hủy và no-show.

### 5.2. Khách hàng

- Danh sách khách được tổng hợp từ đặt bàn thật.
- Tìm kiếm và phân trang.
- Xem số lượt đặt, lượt đến, no-show và lần đặt gần nhất.

### 5.3. Menu

- Xem menu theo danh mục.
- Tạo, sửa và xóa danh mục.
- Cấu hình thứ tự hiển thị danh mục.
- Tạo, sửa và xóa món ăn.
- Quản lý tên, mô tả, giá, tiền tệ và URL ảnh món.
- Bật/tắt trạng thái món đang phục vụ.
- Món không khả dụng vẫn tồn tại trong trang quản lý nhưng không xuất hiện với khách.
- Không cho xóa danh mục khi vẫn còn món thuộc danh mục đó.

### 5.4. Hình ảnh nhà hàng

- Thêm, sửa và xóa hình ảnh bằng URL.
- Quản lý alt text hỗ trợ khả năng truy cập.
- Quản lý thứ tự hiển thị.
- Ảnh có thứ tự nhỏ nhất được dùng làm ảnh đại diện.
- Customer có thể xem toàn bộ gallery ảnh nhà hàng.

### 5.5. Cài đặt

- Dùng chung cấu hình hồ sơ, chính sách đặt bàn và giờ hoạt động với Owner.
- Có thể tạo lại slot tương lai từ giao diện desktop.

## 6. System Admin — Quản trị toàn hệ thống

### 6.1. Tổng quan

- Hiển thị tổng số người dùng, nhà hàng, nhà hàng đang hoạt động và phân quyền.
- Hiển thị các nhà hàng đang chờ duyệt.
- Có liên kết nhanh tới các khu vực quản lý chính.

### 6.2. Quản lý người dùng

- Tìm kiếm và lọc theo vai trò/trạng thái.
- Phân trang và chọn số bản ghi hiển thị.
- Tạo tài khoản khách hàng mới.
- Sửa tên, email và số điện thoại.
- Đặt lại mật khẩu tài khoản không phải ADMIN.
- Tạm khóa và kích hoạt lại tài khoản.
- Tài khoản bị khóa mất phiên đăng nhập hiện tại và không thể đăng nhập lại đến khi được kích hoạt.

### 6.3. Quản lý nhà hàng

- Tìm kiếm và lọc nhà hàng theo trạng thái, tỉnh/thành phố.
- Tạo nhà hàng ở trạng thái bản nháp.
- Sửa toàn bộ thông tin hồ sơ nhà hàng.
- Chọn loại ẩm thực từ danh sách thay vì nhập mã kỹ thuật.
- Chọn tỉnh/thành phố và phường/xã từ API địa giới.
- Quản lý địa chỉ, liên hệ, timezone và khoảng giá.
- Luồng duyệt nhà hàng:
  **DRAFT → PENDING → ACTIVE**.
- Yêu cầu chỉnh sửa và gửi duyệt lại.
- Tạm ngưng và kích hoạt lại nhà hàng.
- Lưu trữ nhà hàng bản nháp khi chưa có liên kết người dùng hoặc đặt bàn.
- Từ trang chi tiết nhà hàng, System Admin có thể quản lý:
  - hồ sơ;
  - booking settings;
  - giờ hoạt động;
  - menu;
  - hình ảnh;
  - tạo lại slot.

### 6.4. Phân quyền nhà hàng

- Trang riêng để liên kết tài khoản và nhà hàng.
- Gán vai trò OWNER hoặc STAFF.
- Tìm kiếm và lọc danh sách phân quyền.
- Sửa vai trò hoặc chuyển nhà hàng được gán.
- Gỡ phân quyền và đưa tài khoản trở lại vai trò CUSTOMER.
- Mỗi tài khoản quản lý nhà hàng chỉ được liên kết với một nhà hàng trong MVP.

### 6.5. Theo dõi reservations toàn hệ thống

- Xem đặt bàn của tất cả nhà hàng.
- Lọc theo nhà hàng, trạng thái và khoảng ngày.
- Tìm theo mã đặt bàn, khách, số điện thoại hoặc email.
- Phân trang và chọn số bản ghi.
- Xem chi tiết khách, nhà hàng, thời gian, yêu cầu, proposal và trạng thái chuyến thăm.
- Mã đặt bàn dài được xử lý responsive, không làm vỡ bố cục.
- Owner/Staff vẫn chỉ quản lý đặt bàn thuộc nhà hàng được gán.

### 6.6. Cài đặt cá nhân System Admin

- Preference được lưu riêng theo tài khoản.
- Chọn màu chủ đề bằng preset hoặc mã HEX `#RRGGBB`.
- Preview màu trước khi lưu và tự chọn màu chữ có độ tương phản phù hợp.
- Chọn mật độ hiển thị Comfortable hoặc Compact.
- Chọn số dòng mặc định 10, 20 hoặc 50.
- Chọn định dạng ngày DD/MM/YYYY hoặc MM/DD/YYYY.
- Chọn ngôn ngữ Việt hoặc Anh và đồng bộ theo tài khoản.
- Khôi phục toàn bộ về mặc định.

## 7. Vòng đời reservation trong MVP

### Trạng thái yêu cầu đặt bàn

```text
PENDING
  ├─ CONFIRMED
  ├─ ALTERNATIVE_PROPOSED → CONFIRMED / PENDING / DECLINED
  ├─ DECLINED
  ├─ CANCELLED
  └─ EXPIRED
```

### Trạng thái chuyến thăm

```text
EXPECTED → ARRIVED → SEATED → COMPLETED
    └────→ NO_SHOW
```

Mỗi thay đổi quan trọng được backend kiểm tra transition hợp lệ. Trạng thái đã hoàn thành hoặc kết thúc không được tùy ý chuyển ngược.

## 8. Dữ liệu, độ tin cậy và triển khai

- PostgreSQL lưu người dùng, nhà hàng, cấu hình, slot, reservation, event, menu, ảnh và preference.
- Flyway tự động áp migration khi backend khởi động hoặc deploy phiên bản mới.
- Dữ liệu reservation và visit status được đọc lại từ backend, không chỉ giữ ở frontend.
- Có kiểm soát trùng lịch, capacity và giới hạn đặt bàn tại backend.
- Có optimistic locking/idempotency cho các thao tác reservation quan trọng.
- API danh sách lớn có pagination và bộ lọc phía backend.
- Frontend có responsive layout cho mobile Customer/Owner và desktop Admin.
- Có unit/integration test cho API adapters, business rules, reservation transitions, CRUD và các helper giao diện quan trọng.
- Backend và frontend đã có script build/deploy, systemd service và health check trên Ubuntu/AWS.

## 9. Luồng demo end-to-end đã hỗ trợ

1. System Admin tạo nhà hàng.
2. System Admin hoàn thiện thông tin, menu, ảnh, booking settings và giờ hoạt động.
3. System Admin gửi duyệt và kích hoạt nhà hàng.
4. System Admin tạo/gán OWNER hoặc STAFF cho nhà hàng.
5. Owner tạo slot tương lai từ cấu hình.
6. Customer tìm nhà hàng, chọn món và tạo đặt bàn.
7. Owner xác nhận hoặc đề xuất giờ khác khi cần.
8. Customer phản hồi đề xuất và nhận QR sau khi xác nhận.
9. Owner quét QR hoặc check-in thủ công.
10. Owner chuyển trạng thái sang Seated và Completed.
11. Customer và System Admin cùng xem được trạng thái cuối.

## 10. Các màn hình chưa được xem là tính năng MVP hoàn chỉnh

Các màn hình sau đã có giao diện để định hướng sản phẩm nhưng hiện dùng dữ liệu demo hoặc chưa có nghiệp vụ backend đầy đủ:

- Owner Marketing và tạo campaign.
- Restaurant Admin Campaigns.
- Restaurant Admin Stores dạng danh sách nhiều chi nhánh.
- Revenue, commission, settlement và tải báo cáo doanh thu.
- Dining map trong tài khoản Customer.
- Xếp bàn vật lý/table assignment cho reservation.
- Thanh toán online, hoàn tiền và đối soát.
- Chỉnh sửa món đặt trước sau khi đã tạo reservation: Customer có thể thêm, xóa hoặc đổi món về sau. Tính năng ở phiên bản sau này cần thay `preOrderNote` dạng văn bản hiện tại bằng danh sách món có cấu trúc, lưu lịch sử thay đổi, thông báo cho nhà hàng, áp dụng thời hạn chỉnh sửa và được thiết kế cùng luồng payment/deposit, thanh toán phần chênh lệch và hoàn tiền khi payment được triển khai.
- Gửi email/SMS/push notification thật.
- Upload file ảnh trực tiếp lên object storage; MVP hiện quản lý ảnh bằng URL.
- Dark mode và tùy biến theme cho Owner/Customer; preference cá nhân hiện chỉ có UI trong System Admin.

Các mục trên không nên được trình bày là đã hoàn thành khi nghiệm thu MVP hiện tại.

## 11. Tiêu chí hoàn thành MVP hiện tại

MVP được xem là đạt mục tiêu khi một nhà hàng thử nghiệm có thể đi trọn luồng sau bằng dữ liệu thật:

- tạo và kích hoạt nhà hàng;
- gán tài khoản quản lý;
- cấu hình giờ/slot/menu/ảnh;
- nhận một đặt bàn từ Customer;
- xử lý xác nhận hoặc đề xuất thời gian;
- phát hành và quét QR;
- hoàn tất chuyến thăm;
- kiểm tra lại lịch sử từ Customer, Owner và System Admin.

