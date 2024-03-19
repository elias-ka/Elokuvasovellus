-- user is a reserved keyword in Postgres, double quotes are required
create table "user"
(
    user_id       uuid primary key default uuid_generate_v4(),
    username      varchar(32) unique not null,
    password_hash text not null,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz
);

select trigger_updated_at('"user"');
