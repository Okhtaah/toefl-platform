-- PostgreSQL Schema for TOEFL Platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'STUDENT');
CREATE TYPE task_category AS ENUM ('COMPLETE_WORDS', 'MCQ', 'ACADEMIC_PASSAGE', 'SHORT_LISTENING', 'CONVERSATION', 'BUILD_SENTENCE', 'WRITE_EMAIL', 'ACADEMIC_DISCUSSION', 'REPEAT', 'INTERVIEW');
CREATE TYPE target_type_enum AS ENUM ('COURSE', 'SECTION', 'TASK', 'MATERIAL');
CREATE TYPE material_type_enum AS ENUM ('PDF', 'TEXT');
CREATE TYPE attempt_status AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED');
CREATE TYPE review_status_enum AS ENUM ('AUTO_GRADED', 'PENDING_REVIEW', 'MANUALLY_GRADED');

CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_published BOOLEAN DEFAULT FALSE
);

CREATE TABLE Sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES Courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    section_order INT NOT NULL,
    is_locked BOOLEAN DEFAULT TRUE
);

CREATE TABLE Tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES Sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    task_type task_category NOT NULL,
    instructions TEXT,
    time_limit_seconds INT,
    task_order INT NOT NULL
);

CREATE TABLE Questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES Tasks(id) ON DELETE CASCADE,
    prompt TEXT,
    text_content TEXT,
    media_url VARCHAR(255),
    question_order INT NOT NULL
);

CREATE TABLE AnswerOptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES Questions(id) ON DELETE CASCADE,
    content VARCHAR(255) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_order INT NOT NULL
);

CREATE TABLE AccessCodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    target_type target_type_enum NOT NULL,
    target_id UUID NOT NULL,
    max_uses INT DEFAULT 1,
    current_uses INT DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserAccess (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    access_code_id UUID NOT NULL REFERENCES AccessCodes(id) ON DELETE CASCADE,
    target_type target_type_enum NOT NULL,
    target_id UUID NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

CREATE TABLE Materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES Courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    material_type material_type_enum NOT NULL,
    is_free BOOLEAN DEFAULT FALSE
);

CREATE TABLE TestAttempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES Courses(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    status attempt_status DEFAULT 'IN_PROGRESS',
    total_score NUMERIC(5,2)
);

CREATE TABLE Submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES TestAttempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES Questions(id) ON DELETE CASCADE,
    text_response TEXT,
    audio_response_url VARCHAR(255),
    auto_score NUMERIC(5,2),
    manual_score NUMERIC(5,2),
    review_status review_status_enum DEFAULT 'PENDING_REVIEW',
    admin_feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
