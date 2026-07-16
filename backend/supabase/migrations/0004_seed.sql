-- TaskBuddy — seed data (BACKEND_SCHEMA.md §12)
-- Category names must match the ML training strings exactly (case-sensitive).

insert into service_categories (name) values
    ('Plumbing'), ('Cleaning'), ('Handyman'), ('Manicure'), ('Pedicure');

insert into urgency_settings (urgency, timeout_minutes) values
    ('urgent', 5), ('normal', 10), ('flexible', 15);
