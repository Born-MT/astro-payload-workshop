-- Three demo case studies as they would sit in wp_posts + wp_postmeta.
-- Port these to apps/cms/src/seed.ts.

INSERT INTO wp_posts (post_title, post_name, post_type, post_status, post_excerpt) VALUES
('Maltese Artisan Marketplace', 'maltese-artisan-marketplace', 'case_study', 'publish',
 'A headless storefront for 60 local makers, replacing a WooCommerce site that took 9s to load.'),
('Harbour Ferries Booking', 'harbour-ferries-booking', 'case_study', 'publish',
 'Real-time timetable and ticketing for a ferry operator, rebuilt from a brittle WordPress plugin.'),
('Valletta Arts Festival', 'valletta-arts-festival', 'case_study', 'publish',
 'Programme, venues and ticket links for a 3-week festival, edited by a non-technical team.');

-- postmeta for post 1 (ACF stores repeaters as indexed keys)
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES
(1, 'client', 'Malta Crafts Council'),
(1, 'summary', 'A headless storefront for 60 local makers, replacing a WooCommerce site that took 9s to load.'),
(1, 'project_url', 'https://example.com/artisans'),
(1, 'completed_on', '2026-03-14'),
(1, 'results', '3'),
(1, 'results_0_value', '0.9s'), (1, 'results_0_label', 'Largest Contentful Paint'),
(1, 'results_1_value', '+38%'), (1, 'results_1_label', 'Conversion rate'),
(1, 'results_2_value', '60'),   (1, 'results_2_label', 'Makers onboarded'),
(1, 'services', 'a:2:{i:0;i:3;i:1;i:1;}'); -- e-commerce, web-development

-- post 2
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES
(2, 'client', 'Grand Harbour Ferries'),
(2, 'summary', 'Real-time timetable and ticketing for a ferry operator, rebuilt from a brittle WordPress plugin.'),
(2, 'project_url', 'https://example.com/ferries'),
(2, 'completed_on', '2026-06-02'),
(2, 'results', '2'),
(2, 'results_0_value', '12k'),  (2, 'results_0_label', 'Tickets sold in month one'),
(2, 'results_1_value', '-70%'), (2, 'results_1_label', 'Support emails'),
(2, 'services', 'a:1:{i:0;i:1;}'); -- web-development

-- post 3
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES
(3, 'client', 'Valletta Cultural Agency'),
(3, 'summary', 'Programme, venues and ticket links for a 3-week festival, edited by a non-technical team.'),
(3, 'completed_on', '2026-08-20'),
(3, 'results', '2'),
(3, 'results_0_value', '140'),  (3, 'results_0_label', 'Events published'),
(3, 'results_1_value', '4 days'), (3, 'results_1_label', 'From brief to launch'),
(3, 'services', 'a:2:{i:0;i:2;i:1;i:4;}'); -- brand-ui-design, growth-seo
