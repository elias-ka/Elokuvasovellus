ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE reviews ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE groups ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE group_members ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE group_contents ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE favorites ALTER COLUMN created_at SET DEFAULT now();
