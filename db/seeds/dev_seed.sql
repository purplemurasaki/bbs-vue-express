-- Development seed: 12 posts (paging test) + sample images
-- Re-runnable: truncates posts/post_images first
-- Note: content is ASCII-only to avoid encoding issues when piping on Windows PowerShell.
USE bbs;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE post_images;
TRUNCATE TABLE posts;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO posts (id, author, content, created_at, updated_at) VALUES
  (1,  'alice',   'Newest post (page 1, item 1)', '2026-05-21 12:00:00.000', '2026-05-21 12:00:00.000'),
  (2,  'bob',     'Post 2', '2026-05-21 11:00:00.000', '2026-05-21 11:00:00.000'),
  (3,  'carol',   'Post with images', '2026-05-21 10:00:00.000', '2026-05-21 10:00:00.000'),
  (4,  'dave',    'Post 4', '2026-05-21 09:00:00.000', '2026-05-21 09:00:00.000'),
  (5,  'eve',     'Post with multiple images', '2026-05-21 08:00:00.000', '2026-05-21 08:00:00.000'),
  (6,  'frank',   'Post 6', '2026-05-21 07:00:00.000', '2026-05-21 07:00:00.000'),
  (7,  'grace',   'Post 7', '2026-05-21 06:00:00.000', '2026-05-21 06:00:00.000'),
  (8,  'henry',   'Post 8', '2026-05-21 05:00:00.000', '2026-05-21 05:00:00.000'),
  (9,  'iris',    'Post 9', '2026-05-21 04:00:00.000', '2026-05-21 04:00:00.000'),
  (10, 'jack',    'Post 10 (last on page 1)', '2026-05-21 03:00:00.000', '2026-05-21 03:00:00.000'),
  (11, 'kate',    'Post 11 (page 2, item 1)', '2026-05-21 02:00:00.000', '2026-05-21 02:00:00.000'),
  (12, 'leo',     'Post 12 (page 2, item 2)', '2026-05-21 01:00:00.000', '2026-05-21 01:00:00.000');

INSERT INTO post_images (post_id, s3_key, image_url, sort_order) VALUES
  (3, 'posts/3/photo-1.jpg', NULL, 0),
  (3, 'posts/3/photo-2.jpg', 'https://cdn.example.com/posts/3/photo-2.jpg', 1),
  (5, 'posts/5/cover.png', NULL, 0),
  (5, 'posts/5/detail-1.png', NULL, 1),
  (5, 'posts/5/detail-2.png', 'https://cdn.example.com/posts/5/detail-2.png', 2);
