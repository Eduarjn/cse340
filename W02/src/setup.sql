-- ServiceConnect database setup
-- CSE 340 - W02 Assignment: Database Retrieval
-- Run with: psql "$DATABASE_URL" -f src/setup.sql

DROP TABLE IF EXISTS project_category;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS organization;

-- Organizations that host service projects
CREATE TABLE organization (
    organization_id SERIAL PRIMARY KEY,
    organization_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url VARCHAR(255)
);

-- Service projects, each hosted by one organization
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    schedule VARCHAR(100) NOT NULL,
    organization_id INT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organization (organization_id) ON DELETE CASCADE
);

-- Service project categories
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- A project belongs to one or more categories,
-- and a category can hold one or more projects.
CREATE TABLE project_category (
    project_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (project_id, category_id),
    FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE
);

INSERT INTO organization (organization_name, description, image_url) VALUES
('Green Valley Alliance', 'Environmental restoration and urban tree planting across the valley.', '/images/green-valley-alliance.svg'),
('Readers United', 'Literacy tutoring and book drives for elementary school students.', '/images/readers-united.svg'),
('Neighbors First', 'Food pantry logistics and shelter support for families in transition.', '/images/neighbors-first.svg'),
('Wellness Together', 'Blood drives, health screenings, and mental health awareness events.', '/images/wellness-together.svg');

INSERT INTO project (project_name, description, schedule, organization_id) VALUES
('River Cleanup Day', 'Clear trash from the riverbank and restore native plants.', 'Saturday morning - 4 hours', (SELECT organization_id FROM organization WHERE organization_name = 'Green Valley Alliance')),
('After-School Reading Buddy', 'Read one on one with elementary students after class.', 'Weekday afternoons - 2 hours per week', (SELECT organization_id FROM organization WHERE organization_name = 'Readers United')),
('Food Pantry Sorting', 'Sort and box donated food for weekly family pickups.', 'Flexible shifts - 3 hours', (SELECT organization_id FROM organization WHERE organization_name = 'Neighbors First')),
('Community Blood Drive', 'Greet donors and staff the check-in table at the mobile unit.', 'Monthly - 1 hour', (SELECT organization_id FROM organization WHERE organization_name = 'Wellness Together'));

INSERT INTO category (category_name, description) VALUES
('Environmental', 'Park cleanups, tree planting, and sustainability projects.'),
('Educational', 'Tutoring, reading programs, and school supply drives.'),
('Community Service', 'Food banks, homeless shelters, and neighborhood revitalization.'),
('Health and Wellness', 'Blood drives, fitness events, and mental health awareness campaigns.');

-- Every project gets at least one category; some get two.
INSERT INTO project_category (project_id, category_id) VALUES
((SELECT project_id FROM project WHERE project_name = 'River Cleanup Day'), (SELECT category_id FROM category WHERE category_name = 'Environmental')),
((SELECT project_id FROM project WHERE project_name = 'River Cleanup Day'), (SELECT category_id FROM category WHERE category_name = 'Community Service')),
((SELECT project_id FROM project WHERE project_name = 'After-School Reading Buddy'), (SELECT category_id FROM category WHERE category_name = 'Educational')),
((SELECT project_id FROM project WHERE project_name = 'Food Pantry Sorting'), (SELECT category_id FROM category WHERE category_name = 'Community Service')),
((SELECT project_id FROM project WHERE project_name = 'Community Blood Drive'), (SELECT category_id FROM category WHERE category_name = 'Health and Wellness'));
