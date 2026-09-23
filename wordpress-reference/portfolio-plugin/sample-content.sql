-- Three demo projects as they would sit in wp_posts + wp_postmeta, and the Profile options.
-- Port these to apps/cms/src/seed.ts. The projects are placeholders: replace them with
-- three things YOU have actually built (WordPress sites count) as soon as the shape works.

INSERT INTO wp_posts (post_title, post_name, post_type, post_status, post_excerpt) VALUES
('Maltese Artisan Marketplace', 'maltese-artisan-marketplace', 'project', 'publish',
 'A headless storefront for 60 local makers, replacing a WooCommerce site that took 9s to load.'),
('Harbour Ferries Booking', 'harbour-ferries-booking', 'project', 'publish',
 'Real-time timetable and ticketing for a ferry operator, rebuilt from a brittle WordPress plugin.'),
('Valletta Arts Festival', 'valletta-arts-festival', 'project', 'publish',
 'Programme, venues and ticket links for a 3-week festival, edited by a non-technical team.');

-- postmeta for post 1 (ACF stores repeaters as indexed keys)
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES
(1, 'client', 'Malta Crafts Council'),
(1, 'role', 'Lead developer'),
(1, 'summary', 'A headless storefront for 60 local makers, replacing a WooCommerce site that took 9s to load.'),
(1, 'project_url', 'https://example.com/artisans'),
(1, 'repo_url', 'https://github.com/example/artisans'),
(1, 'completed_on', '2026-03-14'),
(1, 'stack', '3'),
(1, 'stack_0_name', 'Astro'), (1, 'stack_1_name', 'Payload'), (1, 'stack_2_name', 'Stripe'),
(1, 'highlights', '3'),
(1, 'highlights_0_value', '0.9s'), (1, 'highlights_0_label', 'Largest Contentful Paint'),
(1, 'highlights_1_value', '+38%'), (1, 'highlights_1_label', 'Conversion rate'),
(1, 'highlights_2_value', '60'),   (1, 'highlights_2_label', 'Makers onboarded'),
(1, 'services', 'a:2:{i:0;i:3;i:1;i:1;}'); -- STRETCH A: e-commerce, web-development

-- post 2
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES
(2, 'client', 'Grand Harbour Ferries'),
(2, 'role', 'Backend developer'),
(2, 'summary', 'Real-time timetable and ticketing for a ferry operator, rebuilt from a brittle WordPress plugin.'),
(2, 'project_url', 'https://example.com/ferries'),
(2, 'completed_on', '2026-06-02'),
(2, 'stack', '2'),
(2, 'stack_0_name', 'Payload'), (2, 'stack_1_name', 'PostgreSQL'),
(2, 'highlights', '2'),
(2, 'highlights_0_value', '12k'),  (2, 'highlights_0_label', 'Tickets sold in month one'),
(2, 'highlights_1_value', '-70%'), (2, 'highlights_1_label', 'Support emails'),
(2, 'services', 'a:1:{i:0;i:1;}'); -- STRETCH A: web-development

-- post 3
INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES
(3, 'client', 'Valletta Cultural Agency'),
(3, 'role', 'Front-end developer'),
(3, 'summary', 'Programme, venues and ticket links for a 3-week festival, edited by a non-technical team.'),
(3, 'completed_on', '2026-08-20'),
(3, 'stack', '2'),
(3, 'stack_0_name', 'Astro'), (3, 'stack_1_name', 'Payload'),
(3, 'highlights', '2'),
(3, 'highlights_0_value', '140'),    (3, 'highlights_0_label', 'Events published'),
(3, 'highlights_1_value', '4 days'), (3, 'highlights_1_label', 'From brief to launch'),
(3, 'services', 'a:2:{i:0;i:2;i:1;i:4;}'); -- STRETCH A: brand-ui-design, growth-seo

-- The Profile options page. ACF stores options as `options_<field>` rows in wp_options.
-- Port to the `profile` global in seed.ts (STEP 5). Replace every value with your own.
INSERT INTO wp_options (option_name, option_value) VALUES
('options_name', 'Sam Borg'),
('options_headline', 'WordPress developer moving to Astro + Payload'),
('options_bio', 'I have built WordPress sites for small businesses in Malta since 2022. I am now learning to model content in code and to ship fast, accessible front-ends with Astro. I want my next project to be typed end to end.'),
('options_email', 'sam@example.com'),
('options_location', 'Valletta, Malta'),
('options_links', '2'),
('options_links_0_label', 'GitHub'), ('options_links_0_url', 'https://github.com/example'),
('options_links_1_label', 'LinkedIn'), ('options_links_1_url', 'https://www.linkedin.com/in/example');
