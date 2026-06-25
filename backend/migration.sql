-- Run these commands in your Neon SQL Editor to update your existing tables without dropping data!

CREATE TYPE course_type_enum AS ENUM ('MOCK_EXAM', 'PRACTICE_SECTION', 'MATERIAL');

ALTER TABLE Courses 
ADD COLUMN course_type course_type_enum DEFAULT 'MOCK_EXAM';

ALTER TABLE Tasks
ADD COLUMN alert_time_seconds INT;
