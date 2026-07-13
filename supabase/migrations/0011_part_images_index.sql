-- AVW Quoting Tool — migration 0011
-- Fixes a real performance bug: part_images.part_number (the FK used by the
-- Items tab's parts picker to embed each part's image) had no index, so
-- Postgres was doing a full scan of part_images for every row of the parts
-- query. Confirmed via a direct REST call: fetching 1000 parts with the
-- embedded part_images took 20+ seconds without this index.

create index if not exists part_images_part_number_idx on part_images (part_number);
