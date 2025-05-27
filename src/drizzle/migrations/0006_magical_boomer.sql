ALTER TABLE "casting"
    DROP CONSTRAINT IF EXISTS casting_pkey;

ALTER TABLE "casting"
    ADD PRIMARY KEY (role_id, actor_id, performance_id);

