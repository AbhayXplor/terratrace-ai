-- 1. Create Alerts Table
create table if not exists alerts (
  id serial primary key,
  location_name text not null,
  latitude float not null,
  longitude float not null,
  severity text check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  turbidity_prob int,
  detected_at timestamptz default now(),
  ai_analysis text,
  image_url text
);

-- 2. Seed Data (Real Known Mining Locations)
-- These are coordinates of known river mining activity in Peru, Brazil, Ghana, and Indonesia.
insert into alerts (location_name, latitude, longitude, severity, turbidity_prob, ai_analysis) values 
('Madre de Dios, Peru (La Pampa)', -12.97, -70.05, 'CRITICAL', 98, 'Extremely high sediment load detected in La Pampa region. Characteristic of heavy machinery use in riverbeds.'),
('Tapajós River, Brazil', -4.45, -56.15, 'HIGH', 88, 'Significant discoloration observed in Tapajós tributary. Likely illegal garimpo activity.'),
('Pra River, Ghana', 5.55, -1.58, 'CRITICAL', 95, 'River turns opaque brown. Consistent with widespread galamsey operations upstream.'),
('Ropang River, Indonesia', -8.75, 117.35, 'MEDIUM', 72, 'Anomalous turbidity spike detected. Potential small-scale mining operation.'),
('Caroni River, Venezuela', 7.85, -62.85, 'HIGH', 85, 'Sediment plume visible near mining arc. Requires immediate verification.'),
('Mazaruni River, Guyana', 6.15, -60.15, 'MEDIUM', 65, 'Elevated turbidity levels detected. May indicate new mining front.'),
('Suriname River, Suriname', 4.85, -55.15, 'HIGH', 82, 'Turbidity exceeds seasonal baseline by 40%. Likely anthropogenic source.'),
('Bermejo River, Bolivia', -22.15, -64.15, 'LOW', 45, 'Minor sediment increase. Could be natural runoff or early stage activity.');
