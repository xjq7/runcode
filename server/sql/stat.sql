SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for stat
-- ----------------------------
DROP TABLE IF EXISTS `stat`;
CREATE TABLE `stat`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip` varchar(128) NOT NULL DEFAULT '' COMMENT 'ip address',
  `device` varchar(128)  NOT NULL DEFAULT '' COMMENT '设备',
  `country` varchar(128)  NOT NULL DEFAULT '' COMMENT '国家',
  `province` varchar(128)  NOT NULL DEFAULT '' COMMENT '省',
  `city` varchar(128)  NOT NULL DEFAULT '' COMMENT '城市',
  `isp` varchar(128)  NOT NULL DEFAULT '' COMMENT '城市运营商',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id)
) ENGINE = InnoDB AUTO_INCREMENT = 0 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '访问数据';

SET FOREIGN_KEY_CHECKS = 1;
