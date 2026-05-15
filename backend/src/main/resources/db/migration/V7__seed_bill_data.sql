-- V7: Seed bill data
-- Populate initial bill types available in the system

INSERT INTO bills (name, category, icon_code, fixed_amount) VALUES
('PLN Electricity', 'ELECTRICITY', 'bolt', NULL),
('PDAM Water', 'WATER', 'water_drop', NULL),
('Indihome Internet', 'INTERNET', 'wifi', 150000),
('BPJS Kesehatan', 'INSURANCE', 'health_and_safety', 150000),
('Telkomsel Pulsa', 'MOBILE', 'smartphone', NULL),
('XL Axiata Pulsa', 'MOBILE', 'smartphone', NULL),
('Tri Indonesia Pulsa', 'MOBILE', 'smartphone', NULL),
('IndiHome TV', 'TV', 'tv', 280000),
('Netflix Subscription', 'STREAMING', 'movie', 186000),
('Spotify Premium', 'MUSIC', 'music_note', 54990);
