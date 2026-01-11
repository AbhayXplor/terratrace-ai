-- 1. Enable PostGIS Extension
create extension if not exists postgis;

-- 2. Create Rivers Table
create table if not exists rivers (
  id serial primary key,
  name text,
  geom geometry(LineString, 4326)
);

-- 3. Insert Demo River Data (Madre de Dios, Peru)
-- This represents a segment of the river for the hackathon demo
insert into rivers (name, geom) values 
('Madre de Dios River', ST_GeomFromText('LINESTRING(-70.38 -12.85, -70.30 -12.80, -70.20 -12.70, -70.10 -12.60, -70.00 -12.55)', 4326)),
('Inambari River (Tributary)', ST_GeomFromText('LINESTRING(-70.40 -13.00, -70.38 -12.85)', 4326));

-- 4. Create Upstream Tracing Function
-- Finds the river segment closest to the detected anomaly
create or replace function find_affected_river(anomaly_point geometry)
returns table (river_id int, river_name text, distance_meters float) as $$
begin
  return query
  select id, name, ST_Distance(geom::geography, anomaly_point::geography) as distance_meters
  from rivers
  order by geom <-> anomaly_point
  limit 1;
end;
$$ language plpgsql;
