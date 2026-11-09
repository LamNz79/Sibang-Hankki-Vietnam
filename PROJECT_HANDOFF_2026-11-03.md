# Sibang Hankki Project Handoff

## Instruction cho agent tiếp quản

Phần này là chỉ dẫn thực thi bắt buộc cho agent tiếp tục dự án. Không coi trạng thái ghi trong tài liệu là trạng thái hiện tại tuyệt đối; luôn kiểm tra lại repository, code, PR và môi trường trước khi hành động.

### Nhiệm vụ

Tiếp tục Sibang Hankki từ mục **Việc đang dở và bước kế tiếp**, ưu tiên hoàn tất công việc đang dở trước khi mở rộng phạm vi. Kết quả phải dùng được, được kiểm tra bằng bằng chứng phù hợp và không làm mất thay đổi local của người dùng.

### Trình tự bắt đầu bắt buộc

1. Đọc toàn bộ file này trước khi sửa bất kỳ thứ gì.
2. Kiểm tra riêng từng repository:
   - frontend: `C:\Users\Minh Lam\01Work\project\Sibang-Hankki-Vietnam`;
   - backend: `C:\Users\Minh Lam\01Work\project\Sibang-Hankki-Backend`.
3. Trong mỗi repository, chạy ít nhất `git status --short --branch`, xem commit gần nhất và đối chiếu với mục **Trạng thái Git khi bàn giao**.
4. Phân loại thay đổi đang có thành:
   - thay đổi thuộc nhiệm vụ hiện tại;
   - thay đổi local của người dùng cần giữ nguyên;
   - file sinh tạm có thể xóa, nhưng chỉ xóa sau khi đã xác minh đầu ra và đúng điều kiện ghi trong tài liệu.
5. Đọc code, test, cấu hình và tài liệu trực tiếp liên quan trước khi lập kế hoạch. Không suy đoán API, schema, trạng thái nghiệp vụ hoặc quyền truy cập chỉ từ giao diện.
6. Nêu ngắn gọn phạm vi sẽ làm, rủi ro chính và cách xác minh; sau đó tự triển khai đến khi hoàn tất hoặc gặp blocker thật sự.

### Thứ tự ưu tiên công việc

1. Hoàn tất **Google Docs table compatibility** và bàn giao file DOCX đã kiểm tra.
2. Hoàn tất kiểm tra PR frontend `#151`, tích hợp nội dung trang chủ với backend và kiểm thử local.
3. Chỉ merge hoặc deploy khi người dùng yêu cầu hoặc đã xác nhận rõ hành động đó.
4. Sau deploy, chạy smoke test trên server theo checklist trong file này.
5. Các mục **Kế hoạch sau MVP** chỉ được thực hiện khi có yêu cầu riêng; không tự mở rộng MVP.

Nếu trạng thái thực tế cho thấy một mục đã hoàn thành, phải thu thập bằng chứng rồi chuyển sang mục kế tiếp, không làm lại hoặc ghi đè kết quả cũ.

### Quy tắc triển khai

- Chọn thay đổi nhỏ nhất giải quyết đầy đủ yêu cầu và tuân theo pattern sẵn có của repository.
- Không xóa, reset, stash, checkout đè hoặc sửa thay đổi local không thuộc nhiệm vụ nếu chưa được người dùng cho phép.
- Không đưa secret, mật khẩu, cookie, token, nội dung file môi trường hoặc thông tin đăng nhập vào code, log, commit, PR hay tài liệu.
- Frontend và backend là hai repository độc lập: dùng nhánh, commit, kiểm thử và PR riêng.
- Không sửa trực tiếp migration Flyway đã triển khai; thay đổi schema phải có migration mới và tương thích dữ liệu hiện có.
- Backend là nơi quyết định authorization, restaurant scope, transition, capacity, idempotency và validation. Không dựa vào việc ẩn nút ở frontend để bảo vệ nghiệp vụ.
- Dữ liệu thời gian phải được lưu UTC và hiển thị theo IANA timezone của nhà hàng; kiểm tra biên ngày, DST và chuyển đổi local/UTC.
- Giá trị hợp lệ như `0`, chuỗi rỗng có chủ đích hoặc `null` phải được xử lý theo contract; không dùng kiểm tra truthy làm mất dữ liệu.
- Thay đổi contract API phải cập nhật đồng bộ endpoint backend, API client frontend, type, adapter, UI sử dụng và test liên quan.
- Thay đổi nội dung hiển thị phải kiểm tra cả ba locale `vi`, `en`, `ko`; không để key dịch xuất hiện trực tiếp trên UI.
- UI Customer/Owner phải được kiểm tra ở kích thước mobile; UI Restaurant Admin/System Admin phải được kiểm tra ở desktop và trạng thái responsive quan trọng.
- Không tuyên bố màn hình dùng mock data hoặc nghiệp vụ chưa nối backend là tính năng hoàn chỉnh.

### Quy trình cho mỗi hạng mục

1. Xác định tiêu chí hoàn thành và luồng người dùng bị ảnh hưởng.
2. Tìm toàn bộ caller, route, component, test, fixture, translation, API và cấu hình liên quan.
3. Kiểm tra trust boundary: input người dùng, session, role, restaurant scope, trạng thái hiện tại và dữ liệu từ server.
4. Sửa nguyên nhân gốc ở lớp dùng chung phù hợp; tránh vá lặp lại ở nhiều màn hình.
5. Thêm hoặc cập nhật test cho logic không tầm thường, bug regression, authorization và trạng thái biên.
6. Chạy kiểm tra tập trung trước, sau đó chạy quality gate đầy đủ của repository bị thay đổi.
7. Xem lại `git diff` và `git status`; bảo đảm không có file ngoài phạm vi, secret, artifact build hoặc thay đổi format hàng loạt.
8. Kiểm thử luồng UI/API thực tế có liên quan, ghi lại dữ liệu test và kết quả quan sát được.

### Quality gate tối thiểu

Frontend, chạy bằng `pnpm` theo `pnpm-lock.yaml`:

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Backend:

```powershell
./mvnw verify
```

Nếu repository không có Maven Wrapper thì dùng lệnh Maven tương đương đã được cấu hình trên máy. Không bỏ qua lỗi có liên quan đến thay đổi. Nếu một kiểm tra không thể chạy do môi trường, phải ghi rõ lệnh, lỗi, phạm vi chưa xác minh và rủi ro còn lại; không báo là đã pass.

Với thay đổi database hoặc nghiệp vụ reservation, ngoài unit/integration test phải kiểm tra ít nhất:

- migration chạy được trên database phù hợp;
- request lặp lại không gây ghi dữ liệu hoặc trừ/cộng capacity hai lần;
- transition sai bị backend từ chối;
- OWNER/STAFF không truy cập được restaurant khác;
- Customer không đọc hoặc sửa reservation của người khác;
- lỗi giữa transaction không để lại trạng thái hoặc capacity dở dang.

### Điều kiện hoàn thành

Chỉ coi một hạng mục hoàn tất khi:

- tiêu chí nghiệp vụ đã đạt bằng dữ liệu thật hoặc fixture/test đại diện;
- test tập trung và quality gate phù hợp đã pass;
- UI/API liên quan đã được kiểm tra theo vai trò và trạng thái chính;
- không làm mất hoặc trộn thay đổi local ngoài phạm vi;
- tài liệu, translation và API contract liên quan đã đồng bộ;
- `git diff` chỉ chứa thay đổi có chủ đích;
- còn nêu rõ mọi giới hạn hoặc rủi ro chưa thể xác minh.

### Cách báo cáo kết quả

Khi kết thúc một hạng mục, báo cáo ngắn gọn theo cấu trúc:

1. **Đã hoàn thành:** hành vi hoặc đầu ra người dùng nhận được.
2. **File/phạm vi đã thay đổi:** frontend, backend, database hoặc tài liệu.
3. **Đã xác minh:** lệnh test/build và luồng UI/API đã chạy, kèm kết quả.
4. **Chưa xác minh hoặc rủi ro còn lại:** chỉ ghi điều thực sự còn tồn tại.
5. **Bước tiếp theo:** một hành động cụ thể, không tự ý merge hoặc deploy nếu chưa được phép.

### Prompt dùng ở chat mới

> Hãy làm việc như agent tiếp quản dự án Sibang Hankki. Đọc toàn bộ `PROJECT_HANDOFF_2026-11-03.md` và tuân thủ mục **Instruction cho agent tiếp quản**. Trước khi sửa, kiểm tra `git status`, commit hiện tại và thay đổi local của cả frontend lẫn backend; không xóa hoặc ghi đè thay đổi của người dùng. Đối chiếu tài liệu với code và test hiện tại, sau đó tiếp tục theo đúng thứ tự trong mục **Việc đang dở và bước kế tiếp**. Triển khai đến kết quả dùng được, chạy quality gate phù hợp, kiểm tra luồng thực tế và báo cáo bằng chứng. Không tự mở rộng MVP, không tự merge hoặc deploy, và không tuyên bố hoàn tất nếu còn kiểm tra liên quan chưa chạy.

## Thời điểm bàn giao

- Ngày: 03/11/2026
- Frontend: `C:\Users\Minh Lam\01Work\project\Sibang-Hankki-Vietnam`
- Backend: `C:\Users\Minh Lam\01Work\project\Sibang-Hankki-Backend`
- Máy chủ thử nghiệm: `http://47.131.234.136/`
- Không lưu mật khẩu hoặc secret vào file này. Tài khoản thử nghiệm và bootstrap được cấu hình bằng biến môi trường trên máy cá nhân hoặc `/etc/sibang-hankki/backend.env` trên Ubuntu.

## Trạng thái Git khi bàn giao

### Frontend

- Nhánh hiện tại: `feat/system-admin-home-content-ui`
- Pull request đang mở: `#151 feat: manage customer homepage content`
- URL: `https://github.com/LamNz79/Sibang-Hankki-Vietnam/pull/151`
- Commit đầu nhánh hiện tại: `1d59f6e update button color`
- Các file tài liệu Word đang untracked; xem mục **Việc đang dở**.

### Backend

- Local hiện đang ở nhánh `feat/system-admin-home-content`.
- PR backend `#71` đã được người dùng xác nhận merge.
- Local backend còn các thay đổi riêng trong `.vscode/settings.json`, `.vscode/launch.json`, `application.properties` và file backup. Đây là thay đổi của người dùng, không được xóa hoặc ghi đè khi chưa được yêu cầu.
- Trước khi làm backend tiếp, fetch và chuyển về `main` hoặc tạo nhánh mới từ `origin/main` sau khi bảo toàn thay đổi local.

## Mục tiêu sản phẩm

Sibang Hankki là tên tạm của nền tảng khám phá nhà hàng, đặt bàn và vận hành nhà hàng. MVP đã bao phủ luồng từ System Admin tạo nhà hàng, gán người vận hành, cấu hình giờ và sức chứa, Customer đặt bàn hoặc đặt món trước, Owner hoặc Staff xử lý yêu cầu, check in bằng QR hoặc thủ công và hoàn tất lượt phục vụ.

## Vai trò chính

- `CUSTOMER`: tìm nhà hàng, xem chi tiết, đặt bàn, đặt món trước, quản lý reservation, phản hồi giờ đề xuất và dùng QR check in.
- `OWNER`: quản lý và vận hành nhà hàng được gán, gồm reservation, khách, menu, hình ảnh và booking settings.
- `STAFF`: vận hành reservation và check in trong phạm vi nhà hàng được gán; quyền quản trị cấu hình phải hạn chế hơn Owner.
- `RESTAURANT_ADMIN`: workspace desktop cho việc quản lý nhà hàng, reservation, khách, menu, media và settings.
- `SYSTEM_ADMIN`: quản trị toàn hệ thống gồm user, restaurant, assignment, reservation, trạng thái nhà hàng, nội dung trang chủ và preference cá nhân.

## Kiến trúc và công nghệ

### Frontend

- TypeScript, React 19, Next.js 16 App Router.
- Mantine và Mantine DataTable cho UI.
- TanStack Query cho server state.
- next-intl cho tiếng Việt, tiếng Anh và tiếng Hàn.
- Day.js cho ngày giờ; QR generation và scanner cho check in.
- Vitest, TypeScript, ESLint và Next build trong CI.
- Cấu trúc theo feature trong `src/features`; API client dùng chung trong `src/lib/api`.

### Backend

- Java 17, eGovFrame Boot 5 và Spring.
- Spring Web, Spring Security, Spring Data JPA, JdbcTemplate và Transaction.
- Modular monolith, module gần với hướng hexagonal architecture.
- Maven, JUnit, Spring Security Test và ArchUnit.
- Session authentication, role authorization, CSRF, BCrypt và giới hạn dữ liệu theo `restaurantId` trong session.

### Database

- PostgreSQL; Flyway là nguồn sự thật của schema triển khai.
- Thời điểm reservation lưu bằng UTC và hiển thị theo IANA timezone của nhà hàng.
- Các nhóm dữ liệu chính: users, restaurants, images, menus, booking settings, business hours, booking slots, reservations, proposals, events, favorites, preferences và nội dung trang chủ.
- Schema tham chiếu: `doc/database/unified-schema.dbml`.

## Những phần MVP đã hoàn thành

### Customer

- Trang chủ, tìm kiếm và lọc nhà hàng theo vị trí, ẩm thực và khoảng giá.
- Danh sách và chi tiết nhà hàng, gallery ảnh, menu và món ăn.
- Đăng ký, đăng nhập, đăng xuất, hồ sơ và đổi mật khẩu.
- Đặt bàn khi đăng nhập hoặc với tư cách khách.
- Chọn slot, số khách, ghi chú và món đặt trước trên màn hình riêng.
- Xem reservation của chính Customer, trạng thái xác nhận, QR và lịch sử chuyến thăm.
- Hủy, yêu cầu đổi giờ và chấp nhận hoặc từ chối đề xuất giờ khác.
- Nhà hàng yêu thích.

### Owner Staff Restaurant Admin

- Danh sách, tìm kiếm và lọc reservation.
- Xác nhận, từ chối, hủy và đề xuất giờ khác.
- QR check in, check in thủ công, ARRIVED, SEATED, COMPLETED và NO SHOW.
- Hồ sơ khách và lịch sử reservation.
- Booking settings, confirmation mode, sức chứa, slot interval, dining duration, booking window, cancellation cutoff và no-show grace period.
- Nhiều khoảng business hours và regenerate future slots.
- CRUD menu category, món ăn và media nhà hàng.
- Dashboard và trang quản lý reservation desktop.

### System Admin

- Dashboard tổng quan.
- CRUD và trạng thái user.
- CRUD restaurant và vòng đời `DRAFT`, `PENDING`, `ACTIVE`, `CHANGES_REQUESTED`, `SUSPENDED`.
- Quản lý restaurant detail, media, menu, giờ hoạt động, booking settings và capacity.
- Gán hoặc gỡ OWNER và STAFF cho restaurant trên menu riêng.
- Xem toàn bộ reservation, lọc theo restaurant, trạng thái, ngày và tìm kiếm.
- Preference cá nhân gồm màu theme bằng hex code, density, page size, date format và locale.
- Tiếng Việt, tiếng Anh và tiếng Hàn cho workspace System Admin.
- Quản lý hero banner và ảnh thành phố trên trang Customer home.

## Các vấn đề quan trọng đã xử lý

- Reservation list Customer chỉ trả dữ liệu của đúng user thay vì toàn hệ thống.
- Đồng bộ status giữa Owner và Customer sau confirm, QR check in và các chuyển trạng thái.
- Chuẩn hóa lưu UTC và hiển thị theo timezone của nhà hàng; tránh dùng nhầm cột local time cũ.
- Backend kiểm tra transition, capacity và idempotency thay vì tin client.
- Location dùng API địa giới Việt Nam qua backend proxy; dữ liệu hiện dùng đơn vị hành chính mới như Diên Hồng, Vườn Lài và Đức Nhuận.
- Cải thiện responsive, phân trang, page size, date format và tránh Reservation ID làm vỡ layout.
- Thêm Frontend CI chạy audit, typecheck, lint, test và build.
- Đã có audit kiến trúc, NFR và security trong thư mục `doc`.

## Nội dung trang chủ và ảnh mẫu

- Ảnh mẫu được đặt dưới `public/images/sample` và có thể phục vụ qua `/images/sample/...` sau khi frontend được build và deploy đúng phiên bản.
- Restaurant media hiện lưu URL, chưa upload file trực tiếp lên object storage.
- Backend PR `#71` bổ sung dữ liệu hero banner và city images do System Admin quản lý.
- Frontend PR `#151` bổ sung màn hình quản lý nội dung trang chủ và Customer home đọc nội dung này.
- Các lỗi input React do đọc `event.currentTarget.value` bên trong callback state đã được sửa bằng cách chụp giá trị trước khi gọi setter.
- Hydration warning từ browser extension cursor được bỏ qua có kiểm soát tại root layout.

## Việc đang dở và bước kế tiếp

### 1 Google Docs table compatibility

Người dùng đã tải tài liệu dự án lên Google Docs và các bảng bị co thành ba cột cực hẹp.

Nguyên nhân đã xác định:

- Trong DOCX gốc, `w:tcW` của cell có chiều rộng đúng.
- Nhưng `w:tblGrid` do thư viện sinh ra chứa `w:gridCol w:w="100"` cho mọi cột.
- Word và LibreOffice ưu tiên `w:tcW`, còn Google Docs ưu tiên `w:tblGrid`, nên bảng bị co lại.

Trạng thái hiện tại:

- File gốc: `doc/DE_AN_DU_AN_SIBANG_HANKKI_VI.docx`.
- Bản dành cho Google Docs: `doc/DE_AN_DU_AN_SIBANG_HANKKI_GOOGLE_DOCS_VI.docx`.
- Script tạm: `doc/.fix_google_docs_tables.ps1`.
- Script đã sửa `w:tblGrid` của 8 bảng theo độ rộng `w:tcW` trong hàng đầu tiên.
- Lệnh đã chạy thành công và báo `Patched table grids: 8`.

Việc chat mới cần làm trước tiên:

1. Kiểm tra cấu trúc toàn bộ 8 bảng trong bản Google Docs và xác nhận `w:tblGrid` khớp độ rộng cell.
2. Render bản mới ra PDF và PNG bằng LibreOffice, kiểm tra trực quan tất cả các trang.
3. Nếu render sạch, xóa script tạm `doc/.fix_google_docs_tables.ps1`.
4. Giao file `doc/DE_AN_DU_AN_SIBANG_HANKKI_GOOGLE_DOCS_VI.docx` để người dùng tải lại lên Drive và chọn **Mở bằng Google Tài liệu**.
5. Nếu Google Docs vẫn co bảng, đổi `w:tblW` sang `pct 5000` và giữ grid column đúng tỉ lệ, rồi kiểm tra lại.

Không cần sửa file TypeScript được @mention trong yêu cầu vừa rồi; đó chỉ là file đang mở trong editor và không liên quan đến lỗi Word.

### 2 Hoàn tất PR nội dung trang chủ

- Kiểm tra PR frontend `#151` sau khi document task kết thúc.
- Xác nhận route proxy `/api/home-content` hoặc endpoint tương ứng hoạt động ở local và server.
- Test System Admin cập nhật banner, city image và Customer home nhận nội dung mới.
- Sau khi merge, deploy cả backend và frontend rồi smoke test trên server.

### 3 Kế hoạch sau MVP

Các mục đã thống nhất để phiên bản sau:

- Payment hoặc deposit, webhook, idempotency, refund và reconciliation. SePay là ứng viên cho chuyển khoản Việt Nam nhưng chưa quyết định cuối cùng.
- Customer chỉnh sửa hoặc bổ sung preorder sau khi reservation đã tạo.
- Online store; trước mắt chỉ cần chừa không gian trong kiến trúc và giao diện.
- Upload ảnh trực tiếp lên object storage thay vì chỉ lưu URL.
- Email, SMS hoặc push notification thật.
- Revenue, commission, settlement và báo cáo tài chính.
- Sơ đồ bàn vật lý và gán bàn cụ thể.

## Triển khai Ubuntu AWS

- Frontend và backend chạy sau Nginx trên AWS EC2 Ubuntu.
- Backend chạy bằng `systemd` service `sibang-hankki-backend`.
- Backend đọc biến môi trường từ `/etc/sibang-hankki/backend.env`.
- Backend được build bằng Maven và Flyway tự chạy migration khi ứng dụng khởi động.
- Frontend phải chứa đầy đủ file trong `public` trước khi build để URL `/images/...` tồn tại trên server.
- Sau deploy cần kiểm tra `/api/health`, đăng nhập từng vai trò và chạy full reservation flow.

## Quy tắc làm việc quan trọng

- Luôn xem `git status` trước khi sửa; không xóa thay đổi local của người dùng.
- Frontend và backend là hai repository riêng, PR riêng.
- Với backend thay đổi schema, luôn dùng Flyway migration mới; không sửa migration đã deploy.
- Quyền OWNER hoặc STAFF và restaurant scope phải lấy từ session ở backend, không nhận tùy ý từ client.
- PUT settings phải gửi lại đầy đủ field có thể là `0` hoặc `null`; không dùng kiểm tra truthy làm mất giá trị hợp lệ.
- Mọi logic thời gian phải kiểm tra timezone nhà hàng, UTC persistence, DST và biên ngày.
- Sau sửa frontend chạy typecheck, lint, test và build theo phạm vi hợp lý.
- Sau sửa backend chạy Maven verify và test API nghiệp vụ liên quan.
- Khi tạo PR, mô tả rõ scope, test đã chạy và luồng test UI cho người dùng.

## Smoke test tối thiểu trước demo

1. System Admin đăng nhập, tạo hoặc mở restaurant test và đưa về ACTIVE.
2. Gán OWNER hoặc STAFF cho restaurant.
3. Cấu hình timezone, business hours, capacity, booking policy và regenerate slots.
4. Thêm media, menu category và món.
5. Customer tìm restaurant, tạo reservation và chọn preorder.
6. Owner xác nhận hoặc đề xuất giờ khác; Customer phản hồi.
7. Customer mở QR; Owner scan hoặc check in thủ công.
8. Chuyển ARRIVED → SEATED → COMPLETED và kiểm tra cả hai giao diện.
9. Test cancellation cutoff và NO SHOW grace period.
10. System Admin lọc reservation theo restaurant, ngày và trạng thái.
11. Kiểm tra cả ba locale vi, en, ko và responsive mobile hoặc desktop tương ứng.
12. Kiểm tra banner và city images trên Customer home sau khi System Admin chỉnh sửa.

