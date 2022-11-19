/*
 Navicat Premium Data Transfer

 Source Server         : 107
 Source Server Type    : MySQL
 Source Server Version : 80031
 Source Host           : 107.182.25.135:3306
 Source Schema         : runcode

 Target Server Type    : MySQL
 Target Server Version : 80031
 File Encoding         : 65001

 Date: 02/11/2022 01:02:39
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for stat
-- ----------------------------
DROP TABLE IF EXISTS `stat`;
CREATE TABLE `stat`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT 'ip address',
  `userAgent` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '_utf8mb4\\\'\\\'' COMMENT '设备信息',
  `country` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '国家',
  `province` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '省',
  `city` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '城市',
  `isp` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '城市运营商',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 230 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '访问数据' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question
-- ----------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` int NOT NULL COMMENT '大分类',
  `name` varchar(1280) NOT NULL COMMENT '题目名',
  `introduce` varchar(1280) NOT NULL DEFAULT '' COMMENT '简述',
  `desc` varchar(1280) NOT NULL DEFAULT '' COMMENT '详情',
  `level` int UNSIGNED NOT NULL COMMENT '难度',
  `template` varchar(1280) NOT NULL DEFAULT '' COMMENT '模板',
  `test` varchar(1280) NOT NULL DEFAULT '' COMMENT '测试文件',
  `answermd` varchar(1280) NOT NULL DEFAULT '' COMMENT '参考答案',
  `answer` varchar(1280) NOT NULL DEFAULT '' COMMENT '答案',
  `tag` int UNSIGNED COMMENT '标签',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 0 COMMENT = '题库';

SET FOREIGN_KEY_CHECKS = 1;
