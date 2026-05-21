-- Development seed: 12 posts (paging test) + sample images
-- Re-runnable: truncates posts/post_images first
USE bbs;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE post_images;
TRUNCATE TABLE posts;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO posts (id, author, content, created_at, updated_at) VALUES
  (1,  'alice',   '最新の投稿です（1ページ目・1件目）', '2026-05-21 12:00:00.000', '2026-05-21 12:00:00.000'),
  (2,  'bob',     '2件目の投稿', '2026-05-21 11:00:00.000', '2026-05-21 11:00:00.000'),
  (3,  'carol',   '画像付き投稿の例', '2026-05-21 10:00:00.000', '2026-05-21 10:00:00.000'),
  (4,  'dave',    '4件目', '2026-05-21 09:00:00.000', '2026-05-21 09:00:00.000'),
  (5,  'eve',     '複数画像あり', '2026-05-21 08:00:00.000', '2026-05-21 08:00:00.000'),
  (6,  'frank',   '6件目', '2026-05-21 07:00:00.000', '2026-05-21 07:00:00.000'),
  (7,  'grace',   '7件目', '2026-05-21 06:00:00.000', '2026-05-21 06:00:00.000'),
  (8,  'henry',   '8件目', '2026-05-21 05:00:00.000', '2026-05-21 05:00:00.000'),
  (9,  'iris',    '9件目', '2026-05-21 04:00:00.000', '2026-05-21 04:00:00.000'),
  (10, 'jack',    '10件目（1ページ目の最後）', '2026-05-21 03:00:00.000', '2026-05-21 03:00:00.000'),
  (11, 'kate',    '11件目（2ページ目・1件目）', '2026-05-21 02:00:00.000', '2026-05-21 02:00:00.000'),
  (12, 'leo',     '12件目（2ページ目・2件目）', '2026-05-21 01:00:00.000', '2026-05-21 01:00:00.000');

INSERT INTO post_images (post_id, s3_key, image_url, sort_order) VALUES
  (3, 'posts/3/photo-1.jpg', NULL, 0),
  (3, 'posts/3/photo-2.jpg', 'https://cdn.example.com/posts/3/photo-2.jpg', 1),
  (5, 'posts/5/cover.png', NULL, 0),
  (5, 'posts/5/detail-1.png', NULL, 1),
  (5, 'posts/5/detail-2.png', 'https://cdn.example.com/posts/5/detail-2.png', 2);
