-- Increase GraphQL max_rows so workout_session_adjustments can return 500+ records
-- (hold-to-increment creates many adjustments per exercise; default 30 was truncating)
-- Affects all tables in public schema; 500 is reasonable for typical queries
comment on schema public is e'@graphql({"max_rows": 500})';
