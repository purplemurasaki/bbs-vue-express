-- Database bootstrap (utf8mb4). `bbs` may already exist via MYSQL_DATABASE in docker-compose.
CREATE DATABASE IF NOT EXISTS bbs
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bbs;
