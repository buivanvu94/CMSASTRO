-- ============================================
-- SEED POSTS & PRODUCTS ONLY
-- Chỉ insert Posts và Products (bỏ qua Categories vì đã có sẵn)
-- Sử dụng user_id = 3 làm author
-- ============================================

-- ============================================
-- 1. POSTS (8 items)
-- ============================================

INSERT INTO posts (category_id, author_id, title, slug, content, excerpt, status, is_featured, view_count, seo_title, seo_description, published_at, created_at, updated_at) VALUES
(
  (SELECT id FROM categories WHERE slug = 'tin-tuc' AND type = 'post' LIMIT 1), 
  3, 
  'Khai trương chi nhánh mới tại quận 1', 
  'khai-truong-chi-nhanh-moi-tai-quan-1',
  '<h2>Chào mừng chi nhánh mới</h2><p>Chúng tôi vô cùng hân hoan thông báo về việc khai trương chi nhánh mới tại trung tâm quận 1. Với không gian sang trọng, hiện đại và đội ngũ phục vụ chuyên nghiệp, chúng tôi cam kết mang đến cho quý khách những trải nghiệm ẩm thực tuyệt vời nhất.</p><p>Địa chỉ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM</p><p>Giờ mở cửa: 10:00 - 22:00 hàng ngày</p>',
  'Nhà hàng chúng tôi vui mừng thông báo khai trương chi nhánh mới tại quận 1 với nhiều ưu đãi hấp dẫn.',
  'published',
  1,
  245,
  'Khai trương chi nhánh mới',
  'Khai trương chi nhánh mới tại quận 1 với nhiều ưu đãi đặc biệt',
  NOW(),
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'post' ORDER BY id LIMIT 1 OFFSET 1),
  3,
  'Bí quyết làm món bò bít tết hoàn hảo',
  'bi-quyet-lam-mon-bo-bit-tet-hoan-hao',
  '<h2>Nguyên liệu cần chuẩn bị</h2><ul><li>Thịt bò phi lê: 300g</li><li>Bơ: 50g</li><li>Tỏi: 3 tép</li><li>Muối, tiêu</li></ul><h2>Cách làm</h2><p>Bước 1: Ướp thịt bò với muối, tiêu trong 30 phút</p><p>Bước 2: Làm nóng chảo với bơ và tỏi</p><p>Bước 3: Áp chảo thịt bò mỗi mặt 3-4 phút</p><p>Bước 4: Để nghỉ 5 phút trước khi thưởng thức</p>',
  'Học cách làm món bò bít tết ngon như nhà hàng 5 sao với công thức đơn giản này.',
  'published',
  1,
  532,
  'Cách làm bò bít tết',
  'Bí quyết làm món bò bít tết hoàn hảo tại nhà',
  NOW(),
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'post' ORDER BY id LIMIT 1 OFFSET 2),
  3,
  'Đêm nhạc Jazz cuối tuần tại nhà hàng',
  'dem-nhac-jazz-cuoi-tuan-tai-nha-hang',
  '<h2>Sự kiện đặc biệt</h2><p>Mỗi tối thứ 7 hàng tuần, nhà hàng chúng tôi tổ chức đêm nhạc Jazz với sự tham gia của các nghệ sĩ tài năng. Thưởng thức ẩm thực cao cấp trong không gian âm nhạc sống động và lãng mạn.</p><p>Thời gian: 19:00 - 22:00 mỗi thứ 7</p><p>Đặt bàn trước để có vị trí đẹp nhất!</p>',
  'Tham gia đêm nhạc Jazz cuối tuần với không gian lãng mạn và ẩm thực tuyệt vời.',
  'published',
  0,
  178,
  'Đêm nhạc Jazz',
  'Đêm nhạc Jazz cuối tuần tại nhà hàng - Không gian lãng mạn',
  NOW(),
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'post' ORDER BY id LIMIT 1 OFFSET 3),
  3,
  'Giảm giá 30% cho khách hàng mới',
  'giam-gia-30-cho-khach-hang-moi',
  '<h2>Chương trình khuyến mãi đặc biệt</h2><p>Chào mừng khách hàng mới, chúng tôi dành tặng ưu đãi giảm giá 30% cho hóa đơn đầu tiên. Áp dụng cho tất cả các món ăn trong thực đơn.</p><p>Thời gian: Từ 01/03/2026 đến 31/03/2026</p><p>Điều kiện: Xuất trình mã giảm giá NEWCUSTOMER30</p>',
  'Khách hàng mới nhận ngay ưu đãi giảm giá 30% cho lần đặt bàn đầu tiên.',
  'published',
  1,
  892,
  'Giảm giá 30%',
  'Khuyến mãi giảm giá 30% cho khách hàng mới - Đặt bàn ngay',
  NOW(),
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE slug = 'tin-tuc' AND type = 'post' LIMIT 1),
  3,
  'Nhà hàng đạt chứng nhận vệ sinh an toàn thực phẩm 5 sao',
  'nha-hang-dat-chung-nhan-ve-sinh-an-toan-thuc-pham-5-sao',
  '<h2>Cam kết chất lượng</h2><p>Chúng tôi tự hào thông báo nhà hàng đã đạt chứng nhận vệ sinh an toàn thực phẩm 5 sao từ Sở Y tế. Đây là minh chứng cho cam kết của chúng tôi về chất lượng và an toàn thực phẩm.</p><p>Tất cả nguyên liệu đều được kiểm tra kỹ lưỡng và có nguồn gốc rõ ràng.</p>',
  'Nhà hàng vinh dự nhận chứng nhận vệ sinh an toàn thực phẩm 5 sao.',
  'published',
  0,
  156,
  'Chứng nhận 5 sao',
  'Nhà hàng đạt chứng nhận vệ sinh an toàn thực phẩm 5 sao',
  NOW(),
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'post' ORDER BY id LIMIT 1 OFFSET 1),
  3,
  'Cách làm salad Caesar truyền thống',
  'cach-lam-salad-caesar-truyen-thong',
  '<h2>Nguyên liệu</h2><ul><li>Xà lách romaine</li><li>Phô mai Parmesan</li><li>Bánh mì nướng</li><li>Sốt Caesar</li></ul><h2>Hướng dẫn</h2><p>Rửa sạch xà lách và cắt nhỏ. Trộn đều với sốt Caesar, rắc phô mai và bánh mì nướng lên trên. Đơn giản mà ngon!</p>',
  'Công thức làm salad Caesar truyền thống đơn giản tại nhà.',
  'published',
  0,
  234,
  'Salad Caesar',
  'Cách làm salad Caesar truyền thống ngon như nhà hàng',
  NOW(),
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'post' ORDER BY id LIMIT 1 OFFSET 2),
  3,
  'Workshop nấu ăn cho trẻ em',
  'workshop-nau-an-cho-tre-em',
  '<h2>Sự kiện dành cho gia đình</h2><p>Nhà hàng tổ chức workshop nấu ăn dành cho trẻ em từ 6-12 tuổi. Các bé sẽ được học cách làm pizza, cookies và các món ăn đơn giản khác.</p><p>Thời gian: Chủ nhật hàng tuần, 14:00 - 16:00</p><p>Phí tham gia: 200.000đ/bé</p>',
  'Workshop nấu ăn thú vị dành cho trẻ em vào mỗi chủ nhật.',
  'published',
  0,
  98,
  'Workshop nấu ăn',
  'Workshop nấu ăn cho trẻ em - Hoạt động cuối tuần ý nghĩa',
  NOW(),
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'post' ORDER BY id LIMIT 1 OFFSET 3),
  3,
  'Happy Hour - Giảm 50% đồ uống từ 14h-17h',
  'happy-hour-giam-50-do-uong-tu-14h-17h',
  '<h2>Ưu đãi giờ vàng</h2><p>Từ thứ 2 đến thứ 6 hàng tuần, tất cả đồ uống giảm giá 50% trong khung giờ 14:00 - 17:00. Đây là thời điểm lý tưởng để thư giãn và gặp gỡ bạn bè.</p><p>Áp dụng cho: Cà phê, trà, nước ép, cocktail không cồn</p>',
  'Happy Hour mỗi ngày với ưu đãi giảm 50% tất cả đồ uống.',
  'published',
  0,
  445,
  'Happy Hour',
  'Happy Hour - Giảm 50% đồ uống từ 14h-17h mỗi ngày',
  NOW(),
  NOW(),
  NOW()
);

-- ============================================
-- 2. PRODUCTS (8 items)
-- ============================================

INSERT INTO products (category_id, name, slug, description, short_description, status, is_featured, sort_order, seo_title, seo_description, created_at, updated_at) VALUES
(
  (SELECT id FROM categories WHERE type = 'product' ORDER BY id LIMIT 1),
  'Gỏi cuốn tôm thịt',
  'goi-cuon-tom-thit',
  '<p>Gỏi cuốn tươi ngon với tôm tươi, thịt heo luộc, bún tươi, rau sống và nước chấm đặc biệt. Món ăn nhẹ nhàng, thanh mát, phù hợp để bắt đầu bữa ăn.</p><p>Nguyên liệu tươi mới mỗi ngày, đảm bảo vệ sinh an toàn thực phẩm.</p>',
  'Gỏi cuốn tươi ngon với tôm, thịt và rau sống',
  'published',
  1,
  1,
  'Gỏi cuốn tôm thịt',
  'Gỏi cuốn tôm thịt tươi ngon - Món khai vị truyền thống',
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'product' ORDER BY id LIMIT 1),
  'Salad hải sản',
  'salad-hai-san',
  '<p>Salad hải sản tươi sống với tôm, mực, sò điệp, cà chua bi, xà lách và sốt mayonnaise đặc biệt. Món ăn giàu dinh dưỡng, ít calo.</p><p>Hải sản tươi sống được nhập khẩu trực tiếp từ vùng biển sạch.</p>',
  'Salad hải sản tươi sống với sốt đặc biệt',
  'published',
  0,
  2,
  'Salad hải sản',
  'Salad hải sản tươi sống - Món khai vị bổ dưỡng',
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'product' ORDER BY id LIMIT 1 OFFSET 1),
  'Bò bít tết Úc',
  'bo-bit-tet-uc',
  '<p>Thịt bò Úc cao cấp, áp chảo hoàn hảo theo yêu cầu (rare, medium, well-done). Phục vụ kèm khoai tây chiên, rau củ nướng và sốt tiêu đen.</p><p>Thịt bò nhập khẩu 100% từ Úc, đạt tiêu chuẩn chất lượng cao nhất.</p>',
  'Bò bít tết Úc cao cấp với sốt tiêu đen',
  'published',
  1,
  1,
  'Bò bít tết Úc',
  'Bò bít tết Úc cao cấp - Món chính đặc biệt',
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'product' ORDER BY id LIMIT 1 OFFSET 1),
  'Cá hồi nướng sốt teriyaki',
  'ca-hoi-nuong-sot-teriyaki',
  '<p>Phi lê cá hồi Na Uy nướng chín vừa, phủ sốt teriyaki đậm đà. Phục vụ kèm cơm trắng, rau củ hấp và súp miso.</p><p>Cá hồi tươi sống, giàu Omega-3, tốt cho sức khỏe tim mạch.</p>',
  'Cá hồi Na Uy nướng với sốt teriyaki',
  'published',
  1,
  2,
  'Cá hồi nướng',
  'Cá hồi nướng sốt teriyaki - Món chính bổ dưỡng',
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'product' ORDER BY id LIMIT 1 OFFSET 1),
  'Mì Ý carbonara hải sản',
  'mi-y-carbonara-hai-san',
  '<p>Mì Ý truyền thống với sốt carbonara béo ngậy, tôm, mực, sò điệp và phô mai Parmesan. Món ăn đậm đà, thơm ngon.</p><p>Sử dụng mì Ý nhập khẩu chính hãng và phô mai Parmesan thật.</p>',
  'Mì Ý carbonara với hải sản tươi ngon',
  'published',
  0,
  3,
  'Mì Ý carbonara',
  'Mì Ý carbonara hải sản - Món Ý truyền thống',
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'product' ORDER BY id LIMIT 1 OFFSET 2),
  'Tiramisu truyền thống',
  'tiramisu-truyen-thong',
  '<p>Bánh Tiramisu Ý truyền thống với lớp kem mascarpone mềm mịn, bánh ladyfinger thấm cà phê espresso và bột ca cao. Vị ngọt vừa phải, thơm mùi cà phê.</p><p>Làm thủ công mỗi ngày theo công thức truyền thống.</p>',
  'Tiramisu Ý truyền thống với kem mascarpone',
  'published',
  1,
  1,
  'Tiramisu',
  'Tiramisu truyền thống - Món tráng miệng Ý đặc biệt',
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'product' ORDER BY id LIMIT 1 OFFSET 2),
  'Panna cotta dâu tây',
  'panna-cotta-dau-tay',
  '<p>Panna cotta mềm mịn với sốt dâu tây tươi. Món tráng miệng nhẹ nhàng, thanh mát, phù hợp kết thúc bữa ăn.</p><p>Sử dụng kem tươi Pháp và dâu tây Đà Lạt tươi ngon.</p>',
  'Panna cotta mềm mịn với sốt dâu tây',
  'published',
  0,
  2,
  'Panna cotta',
  'Panna cotta dâu tây - Món tráng miệng thanh mát',
  NOW(),
  NOW()
),
(
  (SELECT id FROM categories WHERE type = 'product' ORDER BY id LIMIT 1 OFFSET 3),
  'Mojito truyền thống',
  'mojito-truyen-thong',
  '<p>Cocktail không cồn Mojito với bạc hà tươi, chanh, đường và soda. Đồ uống giải khát, sảng khoái, phù hợp cho mọi lứa tuổi.</p><p>Sử dụng bạc hà tươi và chanh tươi mỗi ngày.</p>',
  'Mojito không cồn với bạc hà tươi',
  'published',
  1,
  1,
  'Mojito',
  'Mojito truyền thống - Đồ uống giải khát sảng khoái',
  NOW(),
  NOW()
);

-- ============================================
-- Hoàn thành!
-- Đã insert 8 posts và 8 products
-- ============================================
