/*
 Navicat Premium Data Transfer

 Source Server         : 42
 Source Server Type    : MySQL
 Source Server Version : 80030 (8.0.30)
 Source Host           : 42.193.148.96:3306
 Source Schema         : runcode

 Target Server Type    : MySQL
 Target Server Version : 80030 (8.0.30)
 File Encoding         : 65001

 Date: 24/03/2023 15:36:32
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for question
-- ----------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` int NOT NULL COMMENT '大分类',
  `name` varchar(1280) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '题目名',
  `introduce` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '简述',
  `desc` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '详情',
  `level` int UNSIGNED NOT NULL COMMENT '难度',
  `template` varchar(1280) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT '模板',
  `test` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '测试文件',
  `answermd` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '参考答案',
  `answer` varchar(1280) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT '答案',
  `tag` int UNSIGNED NULL DEFAULT NULL COMMENT '标签',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '题库' ROW_FORMAT = Dynamic;

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
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `channel` int NOT NULL DEFAULT 0 COMMENT '来源渠道: 0: 自来, 1: v2ex, 2: 掘金, 3: tools.fun',
  `source` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '' COMMENT '来源 referrer 字段, 未记录到来源则记录 referrer 用于 数据统计',
  `latestAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5471 CHARACTER SET = utf8mb3 COLLATE = utf8mb3_general_ci COMMENT = '访问数据' ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
