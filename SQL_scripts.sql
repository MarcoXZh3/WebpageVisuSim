/* Create new database
 *   (Linux) sqlite3 colorTest.db
 *   (Window) .open colorTest.db
*/

-- Create tables
CREATE TABLE colors000 (idx int primary key, Green smallint, Blue smallint, L real, a real, b real);

-- Check the table structure
.schema colors000
/*  CREATE TABLE colors000 (idx int primary key, Green smallint, Blue smallint, L real, a real, b real);  */

-- Insert records into table
INSERT INTO colors000 VALUES (0, 0, 0, 0.0, 0.0, 0.0);
INSERT INTO colors000 VALUES (1, 0, 1, 0.0197886473319961, 0.139055989270789, -0.378457534537618);
-- ... ...

-- Count the number of records
SELECT COUNT(*) FROM colors000;
/*  65536  */

-- Get records
.header on
.mode column
SELECT * FROM colors000 WHERE idx <= 65536;

-- Check tables of the database
.tables

-------------------------------------------------------------------------------
/* Create new database
 *   (Linux) sqlite3 webpages.db
 *   (Window) .open webpages.db
*/

-- Create tables
CREATE TABLE pages0_150327 (number int primary key, name text, url text, duplicate int);
CREATE TABLE pages1_150328 (number int primary key, url text);
CREATE TABLE pages2_150330 (number int primary key, url text);

-- Check the table structure
.schema pages0_150327
/*  CREATE TABLE pages0_150327 (number int primary key, name text, url text, duplicate int);  */

-- Insert records into table
INSERT INTO pages0_150327 VALUES(0,'163.com','http://www.163.com/',0);
INSERT INTO pages0_150327 VALUES(1,'360.cn','http://360.cn',0);
INSERT INTO pages0_150327 VALUES(4,'58.com','http://58.com',0);
-- ... ...

-- Count the number of records
SELECT COUNT(*) FROM pages0_150327;
/*  467  */

-- Get the SQL scripts of inserting records
.mode insert pages0_150327
SELECT * FROM pages0_150327 WHERE number < 5;
/*
INSERT INTO pages0_150327 VALUES(1,'163.com','http://www.163.com/',0);
INSERT INTO pages0_150327 VALUES(2,'360.cn','http://360.cn',0);
INSERT INTO pages0_150327 VALUES(3,'58.com','http://58.com',0);
INSERT INTO pages0_150327 VALUES(4,'6pm.com','http://www.6pm.com/',0);
INSERT INTO pages0_150327 VALUES(5,'9gag.com','http://9gag.com',0);
*/

-- Get records
.header on
.mode column
SELECT * FROM pages0_150327 WHERE number < 5;
/*
number      name        url                  duplicate
----------  ----------  -------------------  ----------
1           163.com     http://www.163.com/  0
2           360.cn      http://360.cn        0
3           58.com      http://58.com        0
4           6pm.com     http://www.6pm.com/  0
5           9gag.com    http://9gag.com      0
*/

-- Check tables of the database
.tables
/*  pages0_150327  pages1_150328  pages2_150330  */

-- Copy tables from another database
.open webpages.db
attach 'webpages1.db' as wp;
.tables
/*
pages0_150327     pages2_150330     wp.pages1_150328
pages1_150328     wp.pages0_150327  wp.pages2_150330
*/
INSERT INTO pages0_150327 SELECT * FROM wp.pages0_150327;
INSERT INTO pages1_150328 SELECT * FROM wp.pages1_150328;
INSERT INTO pages2_150330 SELECT * FROM wp.pages2_150330;


-- Improper websites:
DELETE FROM pages0_150327 WHERE url LIKE '%chaturbate%';
DELETE FROM pages1_150328 WHERE url LIKE '%chaturbate%';
DELETE FROM pages2_150330 WHERE url LIKE '%chaturbate%';
DELETE FROM pages0_150327 WHERE url LIKE '%privatehomeclips%';
DELETE FROM pages1_150328 WHERE url LIKE '%privatehomeclips%';
DELETE FROM pages2_150330 WHERE url LIKE '%privatehomeclips%';
