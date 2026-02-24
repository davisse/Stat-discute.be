-- NBA Player Stats SQL (generated from local DB)
-- Players: 764

BEGIN;

-- Ensure all active players exist (avoid FK violations)
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (2544, 'LeBron James', 'LeBron', 'James', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (101108, 'Chris Paul', 'Chris', 'Paul', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (200768, 'Kyle Lowry', 'Kyle', 'Lowry', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (200782, 'P.J. Tucker', 'P.J.', 'Tucker', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201142, 'Kevin Durant', 'Kevin', 'Durant', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201143, 'Al Horford', 'Al', 'Horford', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201144, 'Mike Conley', 'Mike', 'Conley', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201145, 'Jeff Green', 'Jeff', 'Green', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201152, 'Thaddeus Young', 'Thaddeus', 'Young', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201565, 'Derrick Rose', 'Derrick', 'Rose', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201566, 'Russell Westbrook', 'Russell', 'Westbrook', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201567, 'Kevin Love', 'Kevin', 'Love', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201568, 'Danilo Gallinari', 'Danilo', 'Gallinari', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201569, 'Eric Gordon', 'Eric', 'Gordon', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201572, 'Brook Lopez', 'Brook', 'Lopez', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201577, 'Robin Lopez', 'Robin', 'Lopez', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201580, 'JaVale McGee', 'JaVale', 'McGee', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201587, 'Nicolas Batum', 'Nicolas', 'Batum', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201599, 'DeAndre Jordan', 'DeAndre', 'Jordan', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201935, 'James Harden', 'James', 'Harden', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201937, 'Ricky Rubio', 'Ricky', 'Rubio', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201939, 'Stephen Curry', 'Stephen', 'Curry', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201942, 'DeMar DeRozan', 'DeMar', 'DeRozan', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201949, 'James Johnson', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201950, 'Jrue Holiday', 'Jrue', 'Holiday', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201959, 'Taj Gibson', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201976, 'Patrick Beverley', 'Patrick', 'Beverley', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201980, 'Danny Green', 'Danny', 'Green', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (201988, 'Patty Mills', 'Patty', 'Mills', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202066, 'Garrett Temple', 'Garrett', 'Temple', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202083, 'Wesley Matthews', 'Wesley', 'Matthews', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202330, 'Gordon Hayward', 'Gordon', 'Hayward', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202331, 'Paul George', 'Paul', 'George', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202397, 'Ish Smith', 'Ish', 'Smith', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202681, 'Kyrie Irving', 'Kyrie', 'Irving', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202684, 'Tristan Thompson', 'Tristan', 'Thompson', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202685, 'Jonas Valanciunas', 'Jonas', 'Valanciunas', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202687, 'Bismack Biyombo', 'Bismack', 'Biyombo', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202691, 'Klay Thompson', 'Klay', 'Thompson', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202692, 'Alec Burks', 'Alec', 'Burks', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202693, 'Markieff Morris', 'Markieff', 'Morris', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202694, 'Marcus Morris Sr.', 'Marcus', 'Morris Sr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202695, 'Kawhi Leonard', 'Kawhi', 'Leonard', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202696, 'Nikola Vucevic', 'Nikola', 'Vucevic', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202699, 'Tobias Harris', 'Tobias', 'Harris', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202704, 'Reggie Jackson', 'Reggie', 'Jackson', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202709, 'Cory Joseph', 'Cory', 'Joseph', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202710, 'Jimmy Butler', 'Jimmy', 'Butler', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202711, 'Bojan Bogdanovic', 'Bojan', 'Bogdanovic', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (202722, 'Davis Bertans', 'Davis', 'Bertans', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203076, 'Anthony Davis', 'Anthony', 'Davis', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203078, 'Bradley Beal', 'Bradley', 'Beal', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203081, 'Damian Lillard', 'Damian', 'Lillard', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203083, 'Andre Drummond', 'Andre', 'Drummond', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203084, 'Harrison Barnes', 'Harrison', 'Barnes', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203095, 'Evan Fournier', 'Evan', 'Fournier', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203109, 'Jae Crowder', 'Jae', 'Crowder', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203110, 'Draymond Green', 'Draymond', 'Green', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203114, 'Khris Middleton', 'Khris', 'Middleton', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203200, 'Justin Holiday', 'Justin', 'Holiday', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203458, 'Alex Len', 'Alex', 'Len', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203468, 'CJ McCollum', 'CJ', 'McCollum', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203469, 'Cody Zeller', 'Cody', 'Zeller', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203471, 'Dennis Schroder', 'Dennis', 'Schroder', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203482, 'Kelly Olynyk', 'Kelly', 'Olynyk', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203484, 'Kentavious Caldwell-Pope', 'Kentavious', 'Caldwell-Pope', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203486, 'Mason Plumlee', 'Mason', 'Plumlee', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203488, 'Mike Muscala', 'Mike', 'Muscala', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203490, 'Otto Porter Jr.', 'Otto', 'Porter Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203493, 'Reggie Bullock Jr.', 'Reggie', 'Bullock Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203496, 'Robert Covington', 'Robert', 'Covington', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203497, 'Rudy Gobert', 'Rudy', 'Gobert', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203500, 'Steven Adams', 'Steven', 'Adams', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203501, 'Tim Hardaway Jr.', 'Tim', 'Hardaway Jr.', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203506, 'Victor Oladipo', 'Victor', 'Oladipo', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203507, 'Giannis Antetokounmpo', 'Giannis', 'Antetokounmpo', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203552, 'Seth Curry', 'Seth', 'Curry', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203648, 'Thanasis Antetokounmpo', 'Thanasis', 'Antetokounmpo', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203897, 'Zach LaVine', 'Zach', 'LaVine', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203901, 'Elfrid Payton', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203903, 'Jordan Clarkson', 'Jordan', 'Clarkson', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203914, 'Gary Harris', 'Gary', 'Harris', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203915, 'Spencer Dinwiddie', 'Spencer', 'Dinwiddie', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203924, 'Jerami Grant', 'Jerami', 'Grant', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203925, 'Joe Harris', 'Joe', 'Harris', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203926, 'Doug McDermott', 'Doug', 'McDermott', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203932, 'Aaron Gordon', 'Aaron', 'Gordon', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203935, 'Marcus Smart', 'Marcus', 'Smart', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203937, 'Kyle Anderson', 'Kyle', 'Anderson', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203939, 'Dwight Powell', 'Dwight', 'Powell', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203944, 'Julius Randle', 'Julius', 'Randle', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203952, 'Andrew Wiggins', 'Andrew', 'Wiggins', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203954, 'Joel Embiid', 'Joel', 'Embiid', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203957, 'Dante Exum', 'Dante', 'Exum', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203967, 'Dario Saric', 'Dario', 'Saric', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203991, 'Clint Capela', 'Clint', 'Capela', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203992, 'Bogdan Bogdanovic', 'Bogdan', 'Bogdanovic', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203994, 'Jusuf Nurkic', 'Jusuf', 'Nurkic', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203995, 'Vasilije Micic', 'Vasilije', 'Micic', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (203999, 'Nikola Jokic', 'Nikola', 'Jokic', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (204001, 'Kristaps Porzingis', 'Kristaps', 'Porzingis', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (204060, 'Joe Ingles', 'Joe', 'Ingles', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (204456, 'T.J. McConnell', 'T.J.', 'McConnell', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626143, 'Jahlil Okafor', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626145, 'Tyus Jones', 'Tyus', 'Jones', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626153, 'Delon Wright', 'Delon', 'Wright', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626156, 'D''Angelo Russell', 'D''Angelo', 'Russell', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626157, 'Karl-Anthony Towns', 'Karl-Anthony', 'Towns', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626158, 'Richaun Holmes', 'Richaun', 'Holmes', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626162, 'Kelly Oubre Jr.', 'Kelly', 'Oubre Jr.', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626164, 'Devin Booker', 'Devin', 'Booker', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626166, 'Cameron Payne', 'Cameron', 'Payne', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626167, 'Myles Turner', 'Myles', 'Turner', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626168, 'Trey Lyles', 'Trey', 'Lyles', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626171, 'Bobby Portis', 'Bobby', 'Portis', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626172, 'Kevon Looney', 'Kevon', 'Looney', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626174, 'Christian Wood', 'Christian', 'Wood', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626179, 'Terry Rozier', 'Terry', 'Rozier', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626181, 'Norman Powell', 'Norman', 'Powell', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626192, 'Pat Connaughton', 'Pat', 'Connaughton', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626196, 'Josh Richardson', 'Josh', 'Richardson', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626204, 'Larry Nance Jr.', 'Larry', 'Nance Jr.', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626220, 'Royce O''Neale', 'Royce', 'O''Neale', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626224, 'Cedi Osman', 'Cedi', 'Osman', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1626246, 'Boban Marjanovic', 'Boban', 'Marjanovic', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627732, 'Ben Simmons', 'Ben', 'Simmons', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627734, 'Domantas Sabonis', 'Domantas', 'Sabonis', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627736, 'Malik Beasley', 'Malik', 'Beasley', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627739, 'Kris Dunn', 'Kris', 'Dunn', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627741, 'Buddy Hield', 'Buddy', 'Hield', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627742, 'Brandon Ingram', 'Brandon', 'Ingram', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627745, 'Damian Jones', 'Damian', 'Jones', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627746, 'Skal Labissiere', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627747, 'Caris LeVert', 'Caris', 'LeVert', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627749, 'Dejounte Murray', 'Dejounte', 'Murray', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627750, 'Jamal Murray', 'Jamal', 'Murray', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627751, 'Jakob Poeltl', 'Jakob', 'Poeltl', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627752, 'Taurean Prince', 'Taurean', 'Prince', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627759, 'Jaylen Brown', 'Jaylen', 'Brown', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627763, 'Malcolm Brogdon', 'Malcolm', 'Brogdon', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627777, 'Georges Niang', 'Georges', 'Niang', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627780, 'Gary Payton II', 'Gary', 'Payton II', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627783, 'Pascal Siakam', 'Pascal', 'Siakam', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627788, 'Furkan Korkmaz', 'Furkan', 'Korkmaz', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627814, 'Damion Lee', 'Damion', 'Lee', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627824, 'Guerschon Yabusele', '', '', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627826, 'Ivica Zubac', 'Ivica', 'Zubac', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627827, 'Dorian Finney-Smith', 'Dorian', 'Finney-Smith', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627832, 'Fred VanVleet', 'Fred', 'VanVleet', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627853, 'Ryan Arcidiacono', 'Ryan', 'Arcidiacono', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627863, 'Danuel House Jr.', 'Danuel', 'House Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627884, 'Derrick Jones Jr.', 'Derrick', 'Jones Jr.', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1627936, 'Alex Caruso', 'Alex', 'Caruso', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628365, 'Markelle Fultz', 'Markelle', 'Fultz', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628366, 'Lonzo Ball', 'Lonzo', 'Ball', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628368, 'De''Aaron Fox', 'De''Aaron', 'Fox', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628369, 'Jayson Tatum', 'Jayson', 'Tatum', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628370, 'Malik Monk', 'Malik', 'Monk', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628371, 'Jonathan Isaac', 'Jonathan', 'Isaac', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628372, 'Dennis Smith Jr.', 'Dennis', 'Smith Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628373, 'Frank Ntilikina', 'Frank', 'Ntilikina', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628374, 'Lauri Markkanen', 'Lauri', 'Markkanen', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628378, 'Donovan Mitchell', 'Donovan', 'Mitchell', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628379, 'Luke Kennard', 'Luke', 'Kennard', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628380, 'Zach Collins', 'Zach', 'Collins', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628381, 'John Collins', 'John', 'Collins', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628384, 'OG Anunoby', 'OG', 'Anunoby', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628385, 'Harry Giles III', 'Harry', 'Giles III', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628386, 'Jarrett Allen', 'Jarrett', 'Allen', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628389, 'Bam Adebayo', 'Bam', 'Adebayo', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628392, 'Isaiah Hartenstein', 'Isaiah', 'Hartenstein', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628396, 'Tony Bradley', '', '', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628398, 'Kyle Kuzma', 'Kyle', 'Kuzma', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628401, 'Derrick White', 'Derrick', 'White', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628404, 'Josh Hart', 'Josh', 'Hart', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628408, 'PJ Dozier', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628415, 'Dillon Brooks', 'Dillon', 'Brooks', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628418, 'Thomas Bryant', 'Thomas', 'Bryant', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628420, 'Monte Morris', 'Monte', 'Morris', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628426, 'Sasha Vezenkov', 'Sasha', 'Vezenkov', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628427, 'Vlatko Cancar', 'Vlatko', 'Cancar', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628436, 'Luke Kornet', 'Luke', 'Kornet', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628449, 'Chris Boucher', 'Chris', 'Boucher', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628464, 'Daniel Theis', 'Daniel', 'Theis', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628467, 'Maxi Kleber', 'Maxi', 'Kleber', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628470, 'Torrey Craig', 'Torrey', 'Craig', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628502, 'Nigel Hayes-Davis', '', '', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628960, 'Grayson Allen', 'Grayson', 'Allen', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628962, 'Udoka Azubuike', 'Udoka', 'Azubuike', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628963, 'Marvin Bagley III', 'Marvin', 'Bagley III', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628964, 'Mo Bamba', 'Mo', 'Bamba', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628966, 'Keita Bates-Diop', 'Keita', 'Bates-Diop', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628969, 'Mikal Bridges', 'Mikal', 'Bridges', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628970, 'Miles Bridges', 'Miles', 'Bridges', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628971, 'Bruce Brown', 'Bruce', 'Brown', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628972, 'Troy Brown Jr.', 'Troy', 'Brown Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628973, 'Jalen Brunson', 'Jalen', 'Brunson', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628975, 'Jevon Carter', 'Jevon', 'Carter', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628976, 'Wendell Carter Jr.', 'Wendell', 'Carter Jr.', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628978, 'Donte DiVincenzo', 'Donte', 'DiVincenzo', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628981, 'Bruno Fernando', 'Bruno', 'Fernando', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628983, 'Shai Gilgeous-Alexander', 'Shai', 'Gilgeous-Alexander', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628984, 'Devonte'' Graham', 'Devonte''', 'Graham', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628988, 'Aaron Holiday', 'Aaron', 'Holiday', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628989, 'Kevin Huerter', 'Kevin', 'Huerter', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628991, 'Jaren Jackson Jr.', 'Jaren', 'Jackson Jr.', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628995, 'Kevin Knox II', 'Kevin', 'Knox II', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628997, 'Caleb Martin', 'Caleb', 'Martin', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1628998, 'Cody Martin', 'Cody', 'Martin', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629001, 'De''Anthony Melton', 'De''Anthony', 'Melton', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629002, 'Chimezie Metu', 'Chimezie', 'Metu', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629003, 'Shake Milton', 'Shake', 'Milton', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629004, 'Svi Mykhailiuk', 'Svi', 'Mykhailiuk', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629006, 'Josh Okogie', 'Josh', 'Okogie', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629008, 'Michael Porter Jr.', 'Michael', 'Porter Jr.', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629010, 'Jerome Robinson', 'Jerome', 'Robinson', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629011, 'Mitchell Robinson', 'Mitchell', 'Robinson', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629012, 'Collin Sexton', 'Collin', 'Sexton', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629013, 'Landry Shamet', 'Landry', 'Shamet', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629014, 'Anfernee Simons', 'Anfernee', 'Simons', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629018, 'Gary Trent Jr.', 'Gary', 'Trent Jr.', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629020, 'Jarred Vanderbilt', 'Jarred', 'Vanderbilt', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629021, 'Moritz Wagner', 'Moritz', 'Wagner', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629022, 'Lonnie Walker IV', 'Lonnie', 'Walker IV', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629023, 'P.J. Washington', 'P.J.', 'Washington', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629026, 'Kenrich Williams', 'Kenrich', 'Williams', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629027, 'Trae Young', 'Trae', 'Young', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629028, 'Deandre Ayton', 'Deandre', 'Ayton', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629029, 'Luka Doncic', 'Luka', 'Doncic', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629048, 'Goga Bitadze', 'Goga', 'Bitadze', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629052, 'Oshae Brissett', 'Oshae', 'Brissett', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629056, 'Terence Davis', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629057, 'Robert Williams III', 'Robert', 'Williams III', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629060, 'Rui Hachimura', 'Rui', 'Hachimura', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629098, 'Jack McVeigh', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629111, 'Jock Landale', 'Jock', 'Landale', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629130, 'Duncan Robinson', 'Duncan', 'Robinson', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629139, 'Yuta Watanabe', 'Yuta', 'Watanabe', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629162, 'Jordan McLaughlin', 'Jordan', 'McLaughlin', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629216, 'Gabe Vincent', 'Gabe', 'Vincent', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629232, 'Kaiser Gates', 'Kaiser', 'Gates', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629234, 'Drew Eubanks', 'Drew', 'Eubanks', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629312, 'Haywood Highsmith', 'Haywood', 'Highsmith', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629599, 'Amir Coffey', 'Amir', 'Coffey', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629610, 'DaQuan Jeffries', 'DaQuan', 'Jeffries', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629611, 'Terance Mann', 'Terance', 'Mann', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629614, 'Andrew Nembhard', 'Andrew', 'Nembhard', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629618, 'Jalen Pickett', 'Jalen', 'Pickett', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629622, 'Max Strus', 'Max', 'Strus', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629623, 'Lindell Wigginton', 'Lindell', 'Wigginton', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629626, 'Bol Bol', 'Bol', 'Bol', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629627, 'Zion Williamson', 'Zion', 'Williamson', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629628, 'RJ Barrett', 'RJ', 'Barrett', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629629, 'Cam Reddish', 'Cam', 'Reddish', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629630, 'Ja Morant', 'Ja', 'Morant', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629631, 'De''Andre Hunter', 'De''Andre', 'Hunter', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629632, 'Coby White', 'Coby', 'White', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629634, 'Brandon Clarke', 'Brandon', 'Clarke', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629636, 'Darius Garland', 'Darius', 'Garland', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629637, 'Jaxson Hayes', 'Jaxson', 'Hayes', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629638, 'Nickeil Alexander-Walker', 'Nickeil', 'Alexander-Walker', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629639, 'Tyler Herro', 'Tyler', 'Herro', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629640, 'Keldon Johnson', 'Keldon', 'Johnson', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629642, 'Nassir Little', 'Nassir', 'Little', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629643, 'Chuma Okeke', 'Chuma', 'Okeke', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629645, 'Kevin Porter Jr.', '', '', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629646, 'Charles Bassey', 'Charles', 'Bassey', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629650, 'Moses Brown', 'Moses', 'Brown', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629651, 'Nic Claxton', 'Nic', 'Claxton', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629652, 'Luguentz Dort', 'Luguentz', 'Dort', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629655, 'Daniel Gafford', 'Daniel', 'Gafford', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629656, 'Quentin Grimes', 'Quentin', 'Grimes', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629659, 'Talen Horton-Tucker', 'Talen', 'Horton-Tucker', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629660, 'Ty Jerome', 'Ty', 'Jerome', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629661, 'Cameron Johnson', 'Cameron', 'Johnson', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629667, 'Jalen McDaniels', 'Jalen', 'McDaniels', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629669, 'Jaylen Nowell', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629670, 'Jordan Nwora', 'Jordan', 'Nwora', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629673, 'Jordan Poole', 'Jordan', 'Poole', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629674, 'Neemias Queta', 'Neemias', 'Queta', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629675, 'Naz Reid', 'Naz', 'Reid', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629677, 'Luka Samanic', 'Luka', 'Samanic', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629678, 'Admiral Schofield', 'Admiral', 'Schofield', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629680, 'Matisse Thybulle', 'Matisse', 'Thybulle', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629684, 'Grant Williams', 'Grant', 'Williams', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629685, 'Dylan Windler', 'Dylan', 'Windler', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629716, 'Marques Bolden', 'Marques', 'Bolden', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629717, 'Armoni Brooks', 'Armoni', 'Brooks', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629718, 'Charlie Brown Jr.', 'Charlie', 'Brown Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629723, 'John Konchar', 'John', 'Konchar', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629726, 'Garrison Mathews', 'Garrison', 'Mathews', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629731, 'Dean Wade', 'Dean', 'Wade', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1629750, 'Javonte Green', '', '', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630162, 'Anthony Edwards', 'Anthony', 'Edwards', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630163, 'LaMelo Ball', 'LaMelo', 'Ball', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630164, 'James Wiseman', 'James', 'Wiseman', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630165, 'Killian Hayes', 'Killian', 'Hayes', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630166, 'Deni Avdija', 'Deni', 'Avdija', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630167, 'Obi Toppin', 'Obi', 'Toppin', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630168, 'Onyeka Okongwu', 'Onyeka', 'Okongwu', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630169, 'Tyrese Haliburton', 'Tyrese', 'Haliburton', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630170, 'Devin Vassell', 'Devin', 'Vassell', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630171, 'Isaac Okoro', 'Isaac', 'Okoro', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630172, 'Patrick Williams', 'Patrick', 'Williams', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630173, 'Precious Achiuwa', 'Precious', 'Achiuwa', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630174, 'Aaron Nesmith', 'Aaron', 'Nesmith', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630175, 'Cole Anthony', 'Cole', 'Anthony', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630177, 'Theo Maledon', 'Theo', 'Maledon', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630178, 'Tyrese Maxey', 'Tyrese', 'Maxey', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630180, 'Saddiq Bey', 'Saddiq', 'Bey', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630181, 'R.J. Hampton', 'R.J.', 'Hampton', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630182, 'Josh Green', 'Josh', 'Green', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630183, 'Jaden McDaniels', 'Jaden', 'McDaniels', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630184, 'Kira Lewis Jr.', 'Kira', 'Lewis Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630188, 'Jalen Smith', 'Jalen', 'Smith', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630191, 'Isaiah Stewart', 'Isaiah', 'Stewart', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630192, 'Zeke Nnaji', 'Zeke', 'Nnaji', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630193, 'Immanuel Quickley', 'Immanuel', 'Quickley', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630194, 'Paul Reed', 'Paul', 'Reed', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630196, 'Filip Petrusev', 'Filip', 'Petrusev', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630197, 'Aleksej Pokusevski', 'Aleksej', 'Pokusevski', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630198, 'Isaiah Joe', 'Isaiah', 'Joe', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630200, 'Tre Jones', 'Tre', 'Jones', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630201, 'Malachi Flynn', 'Malachi', 'Flynn', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630202, 'Payton Pritchard', 'Payton', 'Pritchard', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630205, 'Lamar Stevens', 'Lamar', 'Stevens', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630207, 'Nate Hinton', 'Nate', 'Hinton', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630208, 'Nick Richards', 'Nick', 'Richards', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630209, 'Omer Yurtseven', 'Omer', 'Yurtseven', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630214, 'Xavier Tillman', 'Xavier', 'Tillman', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630215, 'Jared Butler', 'Jared', 'Butler', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630217, 'Desmond Bane', 'Desmond', 'Bane', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630219, 'Skylar Mays', 'Skylar', 'Mays', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630222, 'Mason Jones', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630224, 'Jalen Green', 'Jalen', 'Green', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630227, 'Daishen Nix', 'Daishen', 'Nix', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630228, 'Jonathan Kuminga', 'Jonathan', 'Kuminga', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630230, 'Naji Marshall', 'Naji', 'Marshall', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630231, 'KJ Martin', 'KJ', 'Martin', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630233, 'Nathan Knight', 'Nathan', 'Knight', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630235, 'Trent Forrest', 'Trent', 'Forrest', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630240, 'Saben Lee', 'Saben', 'Lee', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630241, 'Sam Merrill', 'Sam', 'Merrill', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630243, 'Trevelin Queen', 'Trevelin', 'Queen', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630245, 'Ayo Dosunmu', 'Ayo', 'Dosunmu', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630249, 'Vít Krejčí', '', '', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630256, 'Jae''Sean Tate', 'Jae''Sean', 'Tate', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630259, 'Jordan Ford', 'Jordan', 'Ford', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630264, 'Anthony Gill', 'Anthony', 'Gill', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630283, 'Kylor Kelley', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630284, 'Kevon Harris', 'Kevon', 'Harris', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630288, 'Jeff Dowtin Jr.', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630296, 'Braxton Key', 'Braxton', 'Key', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630311, 'Pat Spencer', '', '', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630314, 'Brandon Williams', '', '', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630322, 'Lindy Waters III', 'Lindy', 'Waters III', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630346, 'Matt Ryan', 'Matt', 'Ryan', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630526, 'Jeremiah Robinson-Earl', 'Jeremiah', 'Robinson-Earl', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630527, 'Brandon Boston Jr.', 'Brandon', 'Boston Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630528, 'Josh Christopher', 'Josh', 'Christopher', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630529, 'Herbert Jones', 'Herbert', 'Jones', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630530, 'Trey Murphy III', 'Trey', 'Murphy III', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630531, 'Jaden Springer', 'Jaden', 'Springer', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630532, 'Franz Wagner', 'Franz', 'Wagner', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630533, 'Ziaire Williams', 'Ziaire', 'Williams', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630534, 'Ochai Agbaji', 'Ochai', 'Agbaji', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630535, 'Greg Brown III', 'Greg', 'Brown III', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630536, 'Sharife Cooper', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630537, 'Chris Duarte', 'Chris', 'Duarte', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630538, 'Bones Hyland', 'Bones', 'Hyland', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630539, 'Kai Jones', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630540, 'Miles McBride', 'Miles', 'McBride', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630541, 'Moses Moody', 'Moses', 'Moody', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630542, 'Marcus Bagley', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630543, 'Isaiah Jackson', 'Isaiah', 'Jackson', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630544, 'Tre Mann', 'Tre', 'Mann', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630545, 'Terrence Shannon Jr.', '', '', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630547, 'James Bouknight', 'James', 'Bouknight', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630548, 'Johnny Juzang', 'Johnny', 'Juzang', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630549, 'Day''Ron Sharpe', 'Day''Ron', 'Sharpe', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630550, 'JT Thor', 'JT', 'Thor', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630551, 'Justin Champagnie', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630552, 'Jalen Johnson', 'Jalen', 'Johnson', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630553, 'Keon Johnson', 'Keon', 'Johnson', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630554, 'Jason Preston', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630556, 'Kessler Edwards', 'Kessler', 'Edwards', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630557, 'Corey Kispert', 'Corey', 'Kispert', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630558, 'Davion Mitchell', 'Davion', 'Mitchell', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630559, 'Austin Reaves', 'Austin', 'Reaves', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630560, 'Cam Thomas', 'Cam', 'Thomas', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630561, 'David Duke Jr.', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630563, 'Joshua Primo', 'Joshua', 'Primo', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630567, 'Scottie Barnes', 'Scottie', 'Barnes', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630568, 'Luka Garza', 'Luka', 'Garza', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630570, 'Trendon Watford', 'Trendon', 'Watford', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630572, 'Sandro Mamukelashvili', 'Sandro', 'Mamukelashvili', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630573, 'Sam Hauser', 'Sam', 'Hauser', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630574, 'Ariel Hukporti', '', '', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630577, 'Julian Champagnie', 'Julian', 'Champagnie', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630578, 'Alperen Sengun', 'Alperen', 'Sengun', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630579, 'Jericho Sims', 'Jericho', 'Sims', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630581, 'Josh Giddey', 'Josh', 'Giddey', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630583, 'Santi Aldama', 'Santi', 'Aldama', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630585, 'Marcus Garrett', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630586, 'Usman Garuba', 'Usman', 'Garuba', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630587, 'Isaiah Livers', 'Isaiah', 'Livers', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630590, 'Scotty Pippen Jr.', '', '', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630591, 'Jalen Suggs', 'Jalen', 'Suggs', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630592, 'Jalen Wilson', 'Jalen', 'Wilson', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630595, 'Cade Cunningham', 'Cade', 'Cunningham', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630596, 'Evan Mobley', 'Evan', 'Mobley', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630598, 'Aaron Wiggins', 'Aaron', 'Wiggins', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630600, 'Isaiah Mobley', 'Isaiah', 'Mobley', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630604, 'E.J. Liddell', 'E.J.', 'Liddell', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630606, 'Javonte Smart', 'Javonte', 'Smart', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630608, 'Malcolm Cazalon', 'Malcolm', 'Cazalon', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630611, 'Gui Santos', 'Gui', 'Santos', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630613, 'Duane Washington Jr.', 'Duane', 'Washington Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630618, 'D.J. Carton', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630619, 'Moussa Cisse', '', '', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630621, 'Hunter Dickinson', '', '', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630623, 'Tyson Etienne', '', '', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630625, 'Dalano Banton', 'Dalano', 'Banton', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630631, 'Jose Alvarado', 'Jose', 'Alvarado', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630639, 'A.J. Lawson', 'A.J.', 'Lawson', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630643, 'Jay Huff', 'Jay', 'Huff', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630644, 'Mac McClung', '', '', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630647, 'Eugene Omoruyi', 'Eugene', 'Omoruyi', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630649, 'Stanley Umude', 'Stanley', 'Umude', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630658, 'Colin Castleton', 'Colin', 'Castleton', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630678, 'Terry Taylor', 'Terry', 'Taylor', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630679, 'Ethan Thompson', '', '', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630688, 'Ish Wainright', 'Ish', 'Wainright', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630692, 'Jordan Goodwin', 'Jordan', 'Goodwin', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630695, 'Micah Potter', 'Micah', 'Potter', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630696, 'Dru Smith', 'Dru', 'Smith', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630699, 'MarJon Beauchamp', 'MarJon', 'Beauchamp', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630700, 'Dyson Daniels', 'Dyson', 'Daniels', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630702, 'Jaden Hardy', 'Jaden', 'Hardy', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630703, 'Scoot Henderson', 'Scoot', 'Henderson', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630762, 'Phillip Wheeler', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630811, 'Keaton Wallace', '', '', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630828, 'Alex Antetokounmpo', 'Alex', 'Antetokounmpo', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1630846, 'Olivier Sarr', 'Olivier', 'Sarr', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631093, 'Jaden Ivey', 'Jaden', 'Ivey', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631094, 'Paolo Banchero', 'Paolo', 'Banchero', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631095, 'Jabari Smith Jr.', 'Jabari', 'Smith Jr.', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631096, 'Chet Holmgren', 'Chet', 'Holmgren', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631097, 'Bennedict Mathurin', 'Bennedict', 'Mathurin', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631098, 'Johnny Davis', 'Johnny', 'Davis', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631099, 'Keegan Murray', 'Keegan', 'Murray', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631100, 'AJ Griffin', 'AJ', 'Griffin', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631101, 'Shaedon Sharpe', 'Shaedon', 'Sharpe', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631102, 'TyTy Washington Jr.', 'TyTy', 'Washington Jr.', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631103, 'Malaki Branham', 'Malaki', 'Branham', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631104, 'Blake Wesley', 'Blake', 'Wesley', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631105, 'Jalen Duren', 'Jalen', 'Duren', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631106, 'Tari Eason', 'Tari', 'Eason', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631107, 'Nikola Jovic', 'Nikola', 'Jovic', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631108, 'Max Christie', 'Max', 'Christie', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631109, 'Mark Williams', 'Mark', 'Williams', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631110, 'Jeremy Sochan', 'Jeremy', 'Sochan', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631111, 'Wendell Moore Jr.', 'Wendell', 'Moore Jr.', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631112, 'Kendall Brown', 'Kendall', 'Brown', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631114, 'Jalen Williams', 'Jalen', 'Williams', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631115, 'Orlando Robinson', 'Orlando', 'Robinson', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631116, 'Patrick Baldwin Jr.', 'Patrick', 'Baldwin Jr.', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631117, 'Walker Kessler', 'Walker', 'Kessler', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631119, 'Jaylin Williams', 'Jaylin', 'Williams', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631120, 'JD Davison', 'JD', 'Davison', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631121, 'Bryce McGowens', 'Bryce', 'McGowens', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631123, 'Jamaree Bouyea', '', '', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631124, 'Julian Strawther', 'Julian', 'Strawther', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631126, 'Caleb Love', '', '', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631127, 'Harrison Ingram', '', '', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631128, 'Christian Braun', 'Christian', 'Braun', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631131, 'Oscar Tshiebwe', 'Oscar', 'Tshiebwe', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631132, 'Christian Koloko', 'Christian', 'Koloko', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631133, 'Jabari Walker', 'Jabari', 'Walker', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631157, 'Ryan Rollins', 'Ryan', 'Rollins', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631159, 'Leonard Miller', 'Leonard', 'Miller', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631165, 'Keon Ellis', 'Keon', 'Ellis', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631166, 'Drew Timme', '', '', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631169, 'Josh Minott', 'Josh', 'Minott', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631170, 'Jaime Jaquez Jr.', 'Jaime', 'Jaquez Jr.', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631171, 'Justin Lewis', 'Justin', 'Lewis', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631172, 'Ousmane Dieng', 'Ousmane', 'Dieng', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631173, 'Terquavion Smith', 'Terquavion', 'Smith', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631197, 'Jared Rhoden', 'Jared', 'Rhoden', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631199, 'Ron Harper Jr.', 'Ron', 'Harper Jr.', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631200, 'Kris Murray', 'Kris', 'Murray', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631204, 'Marcus Sasser', 'Marcus', 'Sasser', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631205, 'Buddy Boeheim', 'Buddy', 'Boeheim', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631207, 'Dalen Terry', 'Dalen', 'Terry', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631209, 'Isaiah Wong', 'Isaiah', 'Wong', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631210, 'Jacob Toppin', 'Jacob', 'Toppin', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631211, 'Trevor Keels', 'Trevor', 'Keels', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631212, 'Peyton Watson', 'Peyton', 'Watson', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631213, 'Tyrese Martin', '', '', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631214, 'Alondes Williams', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631216, 'Caleb Houstan', 'Caleb', 'Houstan', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631217, 'Moussa Diabate', 'Moussa', 'Diabate', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631218, 'Trayce Jackson-Davis', 'Trayce', 'Jackson-Davis', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631219, 'John Butler Jr.', 'John', 'Butler Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631220, 'Dereon Seabron', 'Dereon', 'Seabron', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631221, 'Collin Gillespie', 'Collin', 'Gillespie', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631222, 'Jake LaRavia', 'Jake', 'LaRavia', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631223, 'David Roddy', 'David', 'Roddy', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631230, 'Dominick Barlow', 'Dominick', 'Barlow', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631232, 'Keion Brooks Jr.', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631241, 'Javon Freeman-Liberty', 'Javon', 'Freeman-Liberty', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631243, 'Mouhamed Gueye', 'Mouhamed', 'Gueye', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631245, 'Quenton Jackson', '', '', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631246, 'Vince Williams Jr.', 'Vince', 'Williams Jr.', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631247, 'Luke Travers', '', '', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631248, 'Baylor Scheierman', '', '', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631250, 'Pete Nance', '', '', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631254, 'Kenneth Lofton Jr.', 'Kenneth', 'Lofton Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631255, 'Karlo Matković', '', '', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631257, 'Jermaine Samuels Jr.', 'Jermaine', 'Samuels Jr.', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631260, 'AJ Green', 'AJ', 'Green', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631288, 'Jamal Cain', 'Jamal', 'Cain', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631301, 'Jaylen Sims', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631303, 'Justin Minaya', 'Justin', 'Minaya', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631306, 'Cole Swider', 'Cole', 'Swider', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631311, 'Lester Quinones', 'Lester', 'Quinones', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631321, 'Sidy Cissoko', 'Sidy', 'Cissoko', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631323, 'Simone Fontecchio', 'Simone', 'Fontecchio', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631342, 'Daeqwon Plowden', '', '', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631367, 'Jacob Gilyard', 'Jacob', 'Gilyard', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631386, 'Taze Moore', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631451, 'Javonte Cooke', '', '', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631457, 'Alex Morales', 'Alex', 'Morales', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1631466, 'Nate Williams', 'Nate', 'Williams', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641705, 'Victor Wembanyama', 'Victor', 'Wembanyama', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641706, 'Brandon Miller', 'Brandon', 'Miller', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641707, 'Taylor Hendricks', 'Taylor', 'Hendricks', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641708, 'Amen Thompson', 'Amen', 'Thompson', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641709, 'Ausar Thompson', 'Ausar', 'Thompson', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641710, 'Anthony Black', 'Anthony', 'Black', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641711, 'Gradey Dick', 'Gradey', 'Dick', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641712, 'Rayan Rupert', 'Rayan', 'Rupert', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641713, 'GG Jackson', 'GG', 'Jackson', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641715, 'Cam Whitmore', 'Cam', 'Whitmore', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641716, 'Jarace Walker', 'Jarace', 'Walker', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641717, 'Cason Wallace', 'Cason', 'Wallace', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641718, 'Keyonte George', 'Keyonte', 'George', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641720, 'Jalen Hood-Schifino', 'Jalen', 'Hood-Schifino', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641721, 'Maxwell Lewis', 'Maxwell', 'Lewis', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641722, 'Jordan Hawkins', 'Jordan', 'Hawkins', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641723, 'Kobe Bufkin', 'Kobe', 'Bufkin', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641724, 'Jett Howard', 'Jett', 'Howard', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641725, 'Trey Alexander', '', '', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641726, 'Dereck Lively II', 'Dereck', 'Lively II', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641727, 'Dariq Whitehead', 'Dariq', 'Whitehead', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641729, 'Brice Sensabaugh', 'Brice', 'Sensabaugh', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641730, 'Noah Clowney', 'Noah', 'Clowney', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641731, 'Bilal Coulibaly', 'Bilal', 'Coulibaly', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641732, 'Colby Jones', 'Colby', 'Jones', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641733, 'Nick Smith Jr.', 'Nick', 'Smith Jr.', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641734, 'Emoni Bates', 'Emoni', 'Bates', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641735, 'Amari Bailey', 'Amari', 'Bailey', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641736, 'Reece Beekman', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641737, 'Adem Bona', '', '', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641738, 'Kobe Brown', 'Kobe', 'Brown', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641739, 'Toumani Camara', 'Toumani', 'Camara', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641740, 'Jaylen Clark', 'Jaylen', 'Clark', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641741, 'Ricky Council IV', 'Ricky', 'Council IV', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641744, 'Zach Edey', '', '', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641745, 'Adam Flagler', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641747, 'DaRon Holmes II', '', '', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641748, 'Andre Jackson Jr.', 'Andre', 'Jackson Jr.', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641749, 'Keyontae Johnson', 'Keyontae', 'Johnson', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641750, 'Ryan Kalkbrenner', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641752, 'Bobi Klintman', '', '', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641753, 'Chris Livingston', 'Chris', 'Livingston', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641754, 'Seth Lundy', 'Seth', 'Lundy', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641755, 'Kevin McCullar Jr.', '', '', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641757, 'Jordan Miller', 'Jordan', 'Miller', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641763, 'Julian Phillips', 'Julian', 'Phillips', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641764, 'Brandin Podziemski', 'Brandin', 'Podziemski', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641765, 'Olivier-Maxence Prosper', 'Olivier-Maxence', 'Prosper', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641766, 'Adama Sanogo', 'Adama', 'Sanogo', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641767, 'Ben Sheppard', 'Ben', 'Sheppard', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641771, 'Jalen Slawson', 'Jalen', 'Slawson', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641772, 'Nae''Qwan Tomlin', '', '', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641774, 'Tristan Vukcevic', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641775, 'Jordan Walsh', 'Jordan', 'Walsh', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641777, 'Charles Bediako', 'Charles', 'Bediako', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641778, 'Leaky Black', 'Leaky', 'Black', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641779, 'Jalen Bridges', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641780, 'Johni Broome', '', '', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641783, 'Tristan da Silva', '', '', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641787, 'Tosan Evbuomwan', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641788, 'Alex Fudge', 'Alex', 'Fudge', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641789, 'Jazian Gortman', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641790, 'PJ Hall', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641793, 'D''Moi Hodge', 'D''Moi', 'Hodge', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641794, 'Dillon Jones', '', '', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641796, 'Pelle Larsson', '', '', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641798, 'Jaylen Martin', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641801, 'Emanuel Miller', '', '', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641803, 'Tristen Newton', '', '', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641806, 'Markquis Nowell', 'Markquis', 'Nowell', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641807, 'Norchad Omier', 'Norchad', 'Omier', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641809, 'Drew Peterson', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641810, 'Antonio Reeves', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641811, 'Sir''Jabari Rice', 'Sir''Jabari', 'Rice', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641813, 'Mark Sears', '', '', true, 1610612749)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641815, 'Isaiah Stevens', '', '', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641816, 'Hunter Tyson', 'Hunter', 'Tyson', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641817, 'Anton Watson', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641824, 'Matas Buzelis', '', '', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641842, 'Ronald Holland II', '', '', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641854, 'Craig Porter', 'Craig', 'Porter', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641857, 'Liam Robbins', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641871, 'Duop Reath', 'Duop', 'Reath', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641878, 'Damion Baugh', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641879, 'Yuri Collins', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641890, 'Tyler Smith', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641907, 'Erik Stevenson', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641926, 'Dexter Dennis', 'Dexter', 'Dennis', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641931, 'Onuralp Bitim', 'Onuralp', 'Bitim', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641936, 'Miles Norris', 'Miles', 'Norris', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641989, 'Elijah Harkless', '', '', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1641998, 'Trey Jemison III', '', '', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642024, 'Alex Reese', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642050, 'Jackson Rowe', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642066, 'Myron Gardner', '', '', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642258, 'Zaccharie Risacher', '', '', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642259, 'Alex Sarr', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642260, 'Nikola Topić', 'Nikola', 'Topić', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642261, 'Dalton Knecht', '', '', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642262, 'Cody Williams', '', '', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642263, 'Reed Sheppard', '', '', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642264, 'Stephon Castle', '', '', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642265, 'Rob Dillingham', '', '', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642266, 'Ja''Kobe Walter', '', '', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642267, 'Bub Carrington', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642268, 'Isaiah Collier', '', '', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642269, 'Devin Carter', '', '', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642270, 'Donovan Clingan', '', '', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642271, 'Kyle Filipowski', '', '', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642272, 'Jared McCain', '', '', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642273, 'Kyshawn George', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642274, 'Yves Missi', '', '', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642275, 'Tidjane Salaün', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642276, 'Kel''el Ware', '', '', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642277, 'Johnny Furphy', '', '', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642278, 'Tyler Kolek', '', '', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642279, 'Ulrich Chomche', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642280, 'Trentyn Flowers', '', '', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642281, 'Jaylon Tyson', '', '', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642282, 'Hunter Sallis', '', '', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642285, 'Cam Spencer', '', '', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642345, 'Oso Ighodaro', '', '', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642346, 'Ryan Dunn', '', '', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642347, 'Jamal Shead', '', '', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642348, 'Justin Edwards', '', '', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642349, 'Ajay Mitchell', '', '', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642352, 'Keshad Johnson', '', '', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642353, 'Cam Christie', '', '', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642354, 'KJ Simpson', '', '', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642355, 'Bronny James', '', '', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642357, 'David Jones Garcia', '', '', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642358, 'AJ Johnson', '', '', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642359, 'Pacôme Dadiet', '', '', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642363, 'Nique Clifford', '', '', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642364, 'Jamir Watkins', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642366, 'Quinten Post', '', '', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642367, 'Jonathan Mogbo', '', '', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642368, 'N''Faly Dante', '', '', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642377, 'Jaylen Wells', '', '', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642379, 'Taran Armstrong', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642382, 'Branden Carlson', '', '', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642383, 'Walter Clayton Jr.', '', '', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642384, 'Isaiah Crawford', '', '', true, 1610612745)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642385, 'Cui Yongxi', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642389, 'Zyon Pullin', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642396, 'Blake Hinson', 'Blake', 'Hinson', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642399, 'Jesse Edwards', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642400, 'Tristan Enaruna', '', '', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642402, 'Enrique Freeman', '', '', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642403, 'Isaac Jones', '', '', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642404, 'Chaz Lanier', '', '', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642419, 'Jamison Battle', '', '', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642422, 'Armel Traore', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642434, 'Riley Minix', '', '', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642439, 'Quincy Olivari', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642443, 'Jahmir Young', '', '', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642449, 'Tolu Smith', '', '', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642450, 'Daniss Jenkins', '', '', true, 1610612765)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642461, 'Spencer Jones', '', '', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642468, 'Darius Brown', 'Darius', 'Brown', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642484, 'RayJ Dennis', '', '', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642486, 'Boo Buie III', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642502, 'Malevy Leons', '', '', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642505, 'Alex Ducas', '', '', true, NULL)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642530, 'Yuki Kawamura', '', '', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642843, 'Cooper Flagg', '', '', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642844, 'Dylan Harper', '', '', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642845, 'VJ Edgecombe', '', '', true, 1610612755)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642846, 'Ace Bailey', '', '', true, 1610612762)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642847, 'Jeremiah Fears', '', '', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642848, 'Tre Johnson', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642849, 'Nolan Traore', '', '', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642850, 'Thomas Sorber', 'Thomas', 'Sorber', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642851, 'Kon Knueppel', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642852, 'Derik Queen', '', '', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642853, 'Rasheer Fleming', '', '', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642854, 'Asa Newell', '', '', true, 1610612737)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642855, 'Noa Essengue', '', '', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642856, 'Egor Dëmin', '', '', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642857, 'Kasparas Jakučionis', '', '', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642859, 'Jase Richardson', '', '', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642860, 'Will Riley', '', '', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642862, 'Liam McNeeley', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642863, 'Khaman Maluach', '', '', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642864, 'Hugo González', '', '', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642866, 'Joan Beringer', '', '', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642867, 'Collin Murray-Boyles', '', '', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642868, 'Carter Bryant', '', '', true, 1610612759)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642869, 'Noah Penda', '', '', true, 1610612753)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642873, 'Amari Williams', '', '', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642874, 'Danny Wolf', '', '', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642875, 'Maxime Raynaud', '', '', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642876, 'Adou Thiero', '', '', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642877, 'Micah Peavy', '', '', true, 1610612740)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642878, 'Tyrese Proctor', '', '', true, 1610612739)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642879, 'Ben Saraf', '', '', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642880, 'Kam Jones', '', '', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642883, 'Sion James', '', '', true, 1610612766)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642884, 'Vladislav Goldin', '', '', true, 1610612748)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642885, 'Mohamed Diawara', '', '', true, 1610612752)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642886, 'Koby Brea', '', '', true, 1610612756)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642905, 'Yang Hansen', '', '', true, 1610612757)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642907, 'Cedric Coward', '', '', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642910, 'John Tonje', 'John', 'Tonje', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642911, 'Rocco Zikarsky', 'Rocco', 'Zikarsky', true, 1610612750)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642914, 'Javon Small', '', '', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642917, 'Max Shulga', '', '', true, 1610612738)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642918, 'Alijah Martin', '', '', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642920, 'Kobe Sanders', '', '', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642926, 'Tamar Bates', 'Tamar', 'Bates', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642928, 'Dylan Cardwell', '', '', true, 1610612758)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642935, 'Chucky Hepburn', '', '', true, 1610612761)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642938, 'Curtis Jones', '', '', true, 1610612743)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642939, 'Miles Kelly', '', '', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642942, 'Jahmai Mashack', '', '', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642948, 'Ryan Nembhard', '', '', true, 1610612742)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642949, 'Yanic Konan Niederhäuser', '', '', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642950, 'Lachlan Olbrich', '', '', true, 1610612741)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642951, 'Sean Pedulla', 'Sean', 'Pedulla', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642954, 'Will Richard', '', '', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642955, 'Kadary Richmond', 'Kadary', 'Richmond', true, 1610612764)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642959, 'Chris Youngblood', '', '', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642962, 'Drake Powell', '', '', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1642964, 'Brooks Barnhizer', '', '', true, 1610612760)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1643007, 'Taelon Peter', '', '', true, 1610612754)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1643018, 'LJ Cryer', '', '', true, 1610612744)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1643024, 'Chris Mañon', '', '', true, 1610612747)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1643052, 'Chaney Johnson', 'Chaney', 'Johnson', true, 1610612751)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1643133, 'Lawson Lovering', 'Lawson', 'Lovering', true, 1610612763)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();
INSERT INTO players (player_id, full_name, first_name, last_name, is_active, current_team_id)
VALUES (1643141, 'Jahmyl Telfort', '', '', true, 1610612746)
ON CONFLICT (player_id) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = true, current_team_id = EXCLUDED.current_team_id, updated_at = NOW();

-- Player stats for last 7 days: 1020 records from 409 games
DELETE FROM player_game_stats WHERE game_id IN ('0022500792', '0022500793', '0022500794', '0022500795', '0022500796', '0022500797', '0022500798', '0022500799', '0022500800', '0022500801', '0022500802', '0022500803', '0022500804', '0022500805', '0022500806', '0022500807', '0022500808', '0022500809', '0022500810', '0022500811', '0022500812', '0022500813', '0022500814', '0022500815', '0022500816', '0022500817', '0022500818', '0022500819', '0022500820', '0022500821', '0022500822', '0022500823', '0022500824', '0022500825', '0022500826', '0022500827', '0022500828', '0022500829', '0022500830', '0022500831', '0022500832', '0022500833', '0022500834', '0022500835', '0022500836', '0022500837', '0022500838', '0022500839', '0022500840', '0022500841', '0022500842', '0022500843', '0022500844', '0022500845', '0022500846', '0022500847', '0022500848', '0022500849', '0022500850', '0022500851', '0022500852', '0022500853', '0022500854', '0022500855', '0022500856', '0022500857', '0022500858', '0022500859', '0022500860', '0022500861', '0022500862', '0022500863', '0022500864', '0022500865', '0022500866', '0022500867', '0022500868', '0022500869', '0022500870', '0022500871', '0022500872', '0022500873', '0022500874', '0022500875', '0022500876', '0022500877', '0022500878', '0022500879', '0022500880', '0022500881', '0022500882', '0022500883', '0022500884', '0022500885', '0022500886', '0022500887', '0022500888', '0022500889', '0022500890', '0022500891', '0022500892', '0022500893', '0022500894', '0022500895', '0022500896', '0022500897', '0022500898', '0022500899', '0022500900', '0022500901', '0022500902', '0022500903', '0022500904', '0022500905', '0022500906', '0022500907', '0022500908', '0022500909', '0022500910', '0022500911', '0022500912', '0022500913', '0022500914', '0022500915', '0022500916', '0022500917', '0022500918', '0022500919', '0022500920', '0022500921', '0022500922', '0022500923', '0022500924', '0022500925', '0022500926', '0022500927', '0022500928', '0022500929', '0022500930', '0022500931', '0022500932', '0022500933', '0022500934', '0022500935', '0022500936', '0022500937', '0022500938', '0022500939', '0022500940', '0022500941', '0022500942', '0022500943', '0022500944', '0022500945', '0022500946', '0022500947', '0022500948', '0022500949', '0022500950', '0022500951', '0022500952', '0022500953', '0022500954', '0022500955', '0022500956', '0022500957', '0022500958', '0022500959', '0022500960', '0022500961', '0022500962', '0022500963', '0022500964', '0022500965', '0022500966', '0022500967', '0022500968', '0022500969', '0022500970', '0022500971', '0022500972', '0022500973', '0022500974', '0022500975', '0022500976', '0022500977', '0022500978', '0022500979', '0022500980', '0022500981', '0022500982', '0022500983', '0022500984', '0022500985', '0022500986', '0022500987', '0022500988', '0022500989', '0022500990', '0022500991', '0022500992', '0022500993', '0022500994', '0022500995', '0022500996', '0022500997', '0022500998', '0022500999', '0022501000', '0022501001', '0022501002', '0022501003', '0022501004', '0022501005', '0022501006', '0022501007', '0022501008', '0022501009', '0022501010', '0022501011', '0022501012', '0022501013', '0022501014', '0022501015', '0022501016', '0022501017', '0022501018', '0022501019', '0022501020', '0022501021', '0022501022', '0022501023', '0022501024', '0022501025', '0022501026', '0022501027', '0022501028', '0022501029', '0022501030', '0022501031', '0022501032', '0022501033', '0022501034', '0022501035', '0022501036', '0022501037', '0022501038', '0022501039', '0022501040', '0022501041', '0022501042', '0022501043', '0022501044', '0022501045', '0022501046', '0022501047', '0022501048', '0022501049', '0022501050', '0022501051', '0022501052', '0022501053', '0022501054', '0022501055', '0022501056', '0022501057', '0022501058', '0022501059', '0022501060', '0022501061', '0022501062', '0022501063', '0022501064', '0022501065', '0022501066', '0022501067', '0022501068', '0022501069', '0022501070', '0022501071', '0022501072', '0022501073', '0022501074', '0022501075', '0022501076', '0022501077', '0022501078', '0022501079', '0022501080', '0022501081', '0022501082', '0022501083', '0022501084', '0022501085', '0022501086', '0022501087', '0022501088', '0022501089', '0022501090', '0022501091', '0022501092', '0022501093', '0022501094', '0022501095', '0022501096', '0022501097', '0022501098', '0022501099', '0022501100', '0022501101', '0022501102', '0022501103', '0022501104', '0022501105', '0022501106', '0022501107', '0022501108', '0022501109', '0022501110', '0022501111', '0022501112', '0022501113', '0022501114', '0022501115', '0022501116', '0022501117', '0022501118', '0022501119', '0022501120', '0022501121', '0022501122', '0022501123', '0022501124', '0022501125', '0022501126', '0022501127', '0022501128', '0022501129', '0022501130', '0022501131', '0022501132', '0022501133', '0022501134', '0022501135', '0022501136', '0022501137', '0022501138', '0022501139', '0022501140', '0022501141', '0022501142', '0022501143', '0022501144', '0022501145', '0022501146', '0022501147', '0022501148', '0022501149', '0022501150', '0022501151', '0022501152', '0022501153', '0022501154', '0022501155', '0022501156', '0022501157', '0022501158', '0022501159', '0022501160', '0022501161', '0022501162', '0022501163', '0022501164', '0022501165', '0022501166', '0022501167', '0022501168', '0022501169', '0022501170', '0022501171', '0022501172', '0022501173', '0022501174', '0022501175', '0022501176', '0022501177', '0022501178', '0022501179', '0022501180', '0022501181', '0022501182', '0022501183', '0022501184', '0022501185', '0022501186', '0022501187', '0022501188', '0022501189', '0022501190', '0022501191', '0022501192', '0022501193', '0022501194', '0022501195', '0022501196', '0022501197', '0022501198', '0022501199', '0022501200');

INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 201142, 1610612745, 35, 35, 8, 4, 1, 3, 1, 14, 20, 0.700, 2, 4, 0.500, 5, 5, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 201145, 1610612745, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 203991, 1610612745, 9, 0, 4, 0, 0, 0, 0, 0, 1, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1627827, 1610612745, 23, 8, 4, 1, 1, 0, 2, 3, 7, 0.429, 2, 6, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1628988, 1610612745, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1629006, 1610612745, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1630256, 1610612745, 15, 7, 0, 1, 1, 0, 0, 3, 4, 0.750, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1630578, 1610612745, 31, 13, 2, 7, 3, 1, 2, 6, 16, 0.375, 0, 3, 0.000, 1, 2, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1631095, 1610612745, 31, 15, 7, 1, 1, 1, 0, 6, 8, 0.750, 2, 3, 0.667, 1, 1, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1631106, 1610612745, 33, 5, 3, 0, 3, 0, 1, 2, 9, 0.222, 1, 6, 0.167, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1641708, 1610612745, 36, 9, 7, 2, 4, 1, 3, 3, 8, 0.375, 0, 3, 0.000, 3, 3, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1642263, 1610612745, 23, 13, 4, 3, 1, 2, 2, 5, 12, 0.417, 1, 5, 0.200, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1642384, 1610612745, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1626192, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1628970, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1629684, 1610612766, 29, 20, 9, 1, 0, 0, 2, 7, 10, 0.700, 4, 5, 0.800, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1630163, 1610612766, 31, 11, 7, 7, 1, 0, 1, 5, 14, 0.357, 1, 6, 0.167, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1630182, 1610612766, 13, 2, 2, 0, 1, 0, 1, 1, 2, 0.500, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1630214, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1630544, 1610612766, 18, 5, 3, 0, 1, 0, 0, 2, 6, 0.333, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1631217, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1641706, 1610612766, 33, 17, 4, 7, 1, 0, 3, 5, 22, 0.227, 1, 12, 0.083, 6, 7, 0.857, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1641750, 1610612766, 29, 12, 4, 4, 0, 1, 2, 5, 6, 0.833, 0, 0, 0.000, 2, 3, 0.667, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1641790, 1610612766, 14, 2, 4, 1, 0, 1, 1, 0, 1, 0.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1641810, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1642275, 1610612766, 19, 9, 4, 0, 2, 0, 1, 3, 5, 0.600, 2, 3, 0.667, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1642851, 1610612766, 30, 15, 5, 4, 1, 0, 5, 5, 11, 0.455, 3, 6, 0.500, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500792', 1642883, 1610612766, 18, 8, 4, 1, 0, 0, 0, 3, 7, 0.429, 2, 5, 0.400, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 201935, 1610612739, 28, 16, 5, 9, 3, 0, 2, 6, 8, 0.750, 3, 5, 0.600, 1, 2, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 203471, 1610612739, 20, 12, 3, 3, 1, 0, 1, 4, 8, 0.500, 1, 1, 1.000, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1626204, 1610612739, 12, 0, 5, 0, 0, 0, 1, 0, 3, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1628378, 1610612739, 20, 17, 3, 5, 0, 0, 2, 7, 12, 0.583, 2, 4, 0.500, 1, 1, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1628386, 1610612739, 23, 15, 10, 1, 1, 2, 0, 5, 8, 0.625, 0, 1, 0.000, 5, 10, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1628418, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1629731, 1610612739, 16, 11, 5, 0, 0, 0, 0, 4, 4, 1.000, 3, 3, 1.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1630241, 1610612739, 22, 3, 3, 3, 0, 0, 0, 1, 4, 0.250, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1630596, 1610612739, 18, 10, 9, 2, 0, 1, 2, 5, 9, 0.556, 0, 1, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1631165, 1610612739, 19, 7, 3, 0, 1, 3, 0, 3, 6, 0.500, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1641854, 1610612739, 16, 2, 2, 2, 0, 0, 2, 1, 5, 0.200, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1642281, 1610612739, 22, 11, 5, 2, 0, 1, 1, 4, 10, 0.400, 1, 4, 0.250, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1642400, 1610612739, 8, 2, 1, 0, 0, 0, 1, 1, 3, 0.333, 0, 1, 0.000, 0, 1, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1642878, 1610612739, 10, 6, 2, 0, 1, 0, 1, 3, 6, 0.500, 0, 3, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1629008, 1610612751, 20, 14, 5, 2, 0, 1, 0, 5, 13, 0.385, 1, 6, 0.167, 3, 3, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1629611, 1610612751, 22, 9, 3, 0, 1, 0, 1, 3, 5, 0.600, 2, 3, 0.667, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1630533, 1610612751, 22, 2, 2, 1, 1, 0, 1, 1, 9, 0.111, 0, 6, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1630534, 1610612751, 28, 13, 3, 3, 0, 1, 0, 5, 8, 0.625, 3, 6, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1630549, 1610612751, 19, 4, 5, 3, 0, 0, 0, 1, 5, 0.200, 0, 1, 0.000, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1630592, 1610612751, 7, 3, 3, 0, 0, 0, 0, 1, 2, 0.500, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1641730, 1610612751, 19, 8, 1, 2, 0, 0, 1, 3, 8, 0.375, 2, 7, 0.286, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1642849, 1610612751, 30, 8, 1, 5, 2, 0, 4, 3, 11, 0.273, 1, 3, 0.333, 1, 2, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1642856, 1610612751, 26, 10, 5, 1, 1, 0, 1, 3, 8, 0.375, 2, 5, 0.400, 2, 3, 0.667, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1642874, 1610612751, 27, 11, 6, 7, 1, 2, 3, 4, 12, 0.333, 2, 6, 0.333, 1, 4, 0.250, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500793', 1642962, 1610612751, 15, 2, 2, 1, 2, 0, 0, 1, 6, 0.167, 0, 4, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 203468, 1610612737, 30, 23, 1, 5, 2, 1, 1, 6, 13, 0.462, 3, 5, 0.600, 8, 10, 0.800, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1627741, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1629111, 1610612737, 21, 10, 7, 2, 0, 1, 0, 3, 6, 0.500, 2, 3, 0.667, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1629216, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1629638, 1610612737, 33, 14, 3, 4, 3, 0, 4, 4, 11, 0.364, 2, 7, 0.286, 4, 5, 0.800, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1630168, 1610612737, 26, 8, 10, 2, 0, 0, 2, 4, 10, 0.400, 0, 3, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1630552, 1610612737, 37, 32, 10, 5, 3, 1, 4, 9, 22, 0.409, 0, 5, 0.000, 14, 16, 0.875, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1630557, 1610612737, 16, 5, 5, 1, 0, 0, 0, 1, 5, 0.200, 1, 3, 0.333, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1630700, 1610612737, 36, 15, 7, 2, 1, 0, 2, 7, 12, 0.583, 0, 2, 0.000, 1, 3, 0.333, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1630811, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1631243, 1610612737, 10, 0, 1, 1, 1, 1, 0, 0, 2, 0.000, 0, 0, 0.000, 0, 2, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1642258, 1610612737, 27, 10, 7, 2, 1, 1, 0, 4, 8, 0.500, 2, 4, 0.500, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1642854, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 200768, 1610612755, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 203083, 1610612755, 27, 10, 14, 3, 0, 2, 0, 4, 6, 0.667, 1, 1, 1.000, 1, 1, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1626162, 1610612755, 32, 17, 3, 3, 3, 1, 2, 4, 13, 0.308, 0, 3, 0.000, 9, 11, 0.818, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1626166, 1610612755, 9, 0, 0, 5, 2, 0, 0, 0, 3, 0.000, 0, 3, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1629656, 1610612755, 28, 14, 2, 1, 0, 1, 2, 5, 9, 0.556, 2, 4, 0.500, 2, 4, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1630178, 1610612755, 38, 28, 3, 3, 1, 1, 2, 8, 23, 0.348, 4, 11, 0.364, 8, 8, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1630570, 1610612755, 16, 4, 2, 0, 0, 0, 1, 1, 6, 0.167, 0, 1, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1631133, 1610612755, 10, 4, 3, 2, 1, 0, 0, 1, 3, 0.333, 1, 2, 0.500, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1631207, 1610612755, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1631230, 1610612755, 22, 1, 3, 0, 1, 3, 1, 0, 3, 0.000, 0, 0, 0.000, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1641737, 1610612755, 19, 9, 7, 0, 0, 4, 1, 3, 5, 0.600, 0, 0, 0.000, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1642348, 1610612755, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500794', 1642845, 1610612755, 33, 20, 9, 0, 1, 1, 6, 7, 15, 0.467, 3, 8, 0.375, 3, 3, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 204456, 1610612754, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1629614, 1610612754, 21, 5, 1, 4, 0, 0, 6, 2, 7, 0.286, 1, 3, 0.333, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1630174, 1610612754, 14, 3, 2, 1, 0, 0, 0, 0, 3, 0.000, 0, 2, 0.000, 3, 3, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1630643, 1610612754, 20, 15, 8, 1, 0, 3, 2, 3, 8, 0.375, 1, 5, 0.200, 8, 8, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1630679, 1610612754, 26, 2, 2, 1, 1, 0, 2, 1, 7, 0.143, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1630695, 1610612754, 27, 14, 6, 1, 0, 0, 2, 5, 10, 0.500, 2, 4, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1641716, 1610612754, 29, 19, 14, 7, 2, 0, 5, 5, 15, 0.333, 1, 7, 0.143, 8, 10, 0.800, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1641738, 1610612754, 33, 12, 9, 1, 0, 1, 2, 5, 11, 0.455, 2, 4, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1641767, 1610612754, 26, 15, 3, 2, 2, 0, 0, 6, 8, 0.750, 3, 4, 0.750, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1642880, 1610612754, 14, 4, 0, 2, 1, 0, 1, 2, 2, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1643007, 1610612754, 25, 16, 5, 2, 1, 0, 3, 5, 12, 0.417, 5, 11, 0.455, 1, 4, 0.250, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1630264, 1610612764, 30, 13, 8, 3, 0, 1, 1, 6, 9, 0.667, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1630536, 1610612764, 24, 8, 5, 7, 2, 0, 3, 3, 10, 0.300, 0, 3, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1630551, 1610612764, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1630702, 1610612764, 18, 13, 1, 0, 1, 0, 1, 5, 13, 0.385, 3, 6, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1631214, 1610612764, 27, 6, 5, 5, 0, 1, 1, 2, 5, 0.400, 1, 4, 0.250, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1641731, 1610612764, 23, 12, 4, 4, 3, 0, 1, 4, 9, 0.444, 1, 3, 0.333, 3, 4, 0.750, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1641774, 1610612764, 17, 12, 5, 2, 5, 1, 0, 4, 7, 0.571, 2, 3, 0.667, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1642267, 1610612764, 27, 13, 4, 3, 2, 0, 2, 5, 14, 0.357, 3, 9, 0.333, 0, 2, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1642273, 1610612764, 18, 6, 3, 1, 0, 2, 1, 3, 10, 0.300, 0, 3, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1642364, 1610612764, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1642848, 1610612764, 19, 10, 6, 2, 0, 0, 0, 4, 12, 0.333, 0, 4, 0.000, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1642860, 1610612764, 3, 6, 0, 0, 0, 0, 0, 2, 2, 1.000, 0, 0, 0.000, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500795', 1642955, 1610612764, 29, 13, 5, 3, 1, 0, 0, 5, 7, 0.714, 0, 1, 0.000, 3, 3, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 203903, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1626157, 1610612752, 30, 21, 11, 4, 1, 0, 2, 7, 14, 0.500, 1, 4, 0.250, 6, 6, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1628384, 1610612752, 31, 8, 0, 0, 0, 4, 0, 3, 13, 0.231, 1, 8, 0.125, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1628404, 1610612752, 27, 11, 4, 3, 0, 0, 1, 5, 8, 0.625, 0, 0, 0.000, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1628969, 1610612752, 25, 8, 3, 0, 1, 0, 1, 4, 9, 0.444, 0, 3, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1628973, 1610612752, 37, 33, 6, 8, 2, 0, 6, 12, 20, 0.600, 3, 7, 0.429, 6, 6, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1629011, 1610612752, 19, 7, 6, 0, 2, 1, 0, 2, 4, 0.500, 0, 0, 0.000, 3, 6, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1629013, 1610612752, 28, 15, 2, 2, 0, 1, 0, 4, 10, 0.400, 3, 8, 0.375, 4, 6, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1630574, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1630631, 1610612752, 20, 6, 4, 5, 1, 0, 2, 3, 8, 0.375, 0, 5, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1631110, 1610612752, 9, 2, 0, 1, 1, 1, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1642278, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1642885, 1610612752, 8, 0, 2, 1, 1, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 202699, 1610612765, 31, 11, 10, 5, 1, 1, 2, 4, 16, 0.250, 1, 5, 0.200, 2, 4, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1627747, 1610612765, 20, 8, 2, 3, 1, 2, 1, 3, 6, 0.500, 2, 3, 0.667, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1628989, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1629130, 1610612765, 20, 9, 1, 0, 0, 0, 0, 3, 6, 0.500, 3, 6, 0.500, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1629750, 1610612765, 20, 9, 5, 0, 2, 0, 2, 2, 4, 0.500, 1, 3, 0.333, 4, 5, 0.800, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1630191, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1630194, 1610612765, 29, 18, 7, 2, 1, 3, 0, 7, 9, 0.778, 0, 1, 0.000, 4, 4, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1630595, 1610612765, 38, 42, 8, 13, 1, 2, 5, 17, 34, 0.500, 5, 11, 0.455, 3, 3, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1631105, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1631204, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1641709, 1610612765, 30, 10, 5, 4, 3, 0, 1, 4, 8, 0.500, 0, 0, 0.000, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1641842, 1610612765, 12, 7, 2, 1, 0, 0, 0, 3, 3, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1642404, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1642449, 1610612765, 18, 4, 2, 0, 0, 0, 0, 2, 3, 0.667, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500796', 1642450, 1610612765, 18, 8, 2, 2, 0, 0, 3, 3, 4, 0.750, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1627824, 1610612741, 16, 8, 5, 1, 0, 0, 0, 2, 5, 0.400, 1, 3, 0.333, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1629012, 1610612741, 14, 11, 1, 2, 1, 1, 3, 4, 7, 0.571, 2, 4, 0.500, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1629014, 1610612741, 31, 20, 1, 1, 0, 0, 2, 7, 18, 0.389, 4, 11, 0.364, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630171, 1610612741, 29, 16, 5, 1, 0, 0, 1, 6, 12, 0.500, 3, 5, 0.600, 1, 1, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630172, 1610612741, 26, 6, 7, 1, 0, 0, 0, 3, 8, 0.375, 0, 4, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630188, 1610612741, 24, 9, 10, 2, 3, 1, 2, 2, 6, 0.333, 1, 3, 0.333, 4, 4, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630200, 1610612741, 21, 12, 1, 6, 0, 1, 0, 5, 8, 0.625, 1, 1, 1.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630208, 1610612741, 12, 6, 5, 0, 0, 1, 1, 2, 2, 1.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630581, 1610612741, 21, 5, 4, 5, 2, 1, 4, 1, 7, 0.143, 0, 2, 0.000, 3, 4, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1631093, 1610612741, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1631159, 1610612741, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1641824, 1610612741, 31, 4, 6, 1, 0, 0, 4, 2, 10, 0.200, 0, 7, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1642265, 1610612741, 9, 4, 1, 2, 0, 0, 3, 2, 3, 0.667, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1642950, 1610612741, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 202066, 1610612761, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1627742, 1610612761, 35, 31, 8, 6, 2, 0, 2, 11, 26, 0.423, 3, 5, 0.600, 6, 7, 0.857, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1627751, 1610612761, 16, 2, 0, 1, 0, 0, 2, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1629628, 1610612761, 24, 13, 6, 3, 1, 0, 0, 3, 10, 0.300, 1, 3, 0.333, 6, 8, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630193, 1610612761, 33, 14, 2, 3, 2, 0, 1, 5, 12, 0.417, 0, 4, 0.000, 4, 5, 0.800, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630567, 1610612761, 33, 14, 9, 5, 2, 1, 6, 5, 14, 0.357, 0, 1, 0.000, 4, 4, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1630572, 1610612761, 15, 7, 3, 0, 0, 1, 0, 3, 5, 0.600, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1631218, 1610612761, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1641711, 1610612761, 9, 0, 5, 0, 1, 0, 1, 0, 3, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1642266, 1610612761, 22, 14, 4, 0, 3, 0, 1, 4, 9, 0.444, 2, 5, 0.400, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1642347, 1610612761, 20, 4, 3, 4, 2, 0, 1, 2, 5, 0.400, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1642367, 1610612761, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1642419, 1610612761, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500797', 1642867, 1610612761, 28, 11, 6, 1, 1, 1, 0, 4, 5, 0.800, 0, 0, 0.000, 3, 3, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1626164, 1610612756, 8, 5, 1, 0, 0, 0, 1, 2, 6, 0.333, 0, 2, 0.000, 1, 2, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1626220, 1610612756, 26, 8, 7, 1, 0, 1, 0, 3, 8, 0.375, 2, 5, 0.400, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1628415, 1610612756, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1629599, 1610612756, 11, 0, 0, 1, 0, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1630224, 1610612756, 26, 26, 3, 2, 3, 0, 3, 11, 23, 0.478, 4, 9, 0.444, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1630587, 1610612756, 9, 0, 1, 1, 0, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1630692, 1610612756, 27, 10, 4, 1, 0, 0, 0, 4, 12, 0.333, 2, 7, 0.286, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1631109, 1610612756, 22, 11, 10, 0, 0, 1, 0, 4, 12, 0.333, 0, 0, 0.000, 3, 4, 0.750, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1631123, 1610612756, 18, 7, 3, 2, 1, 1, 2, 3, 7, 0.429, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1631221, 1610612756, 29, 8, 2, 8, 1, 0, 1, 3, 13, 0.231, 2, 8, 0.250, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1642345, 1610612756, 17, 10, 2, 5, 1, 0, 1, 5, 8, 0.625, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1642346, 1610612756, 21, 2, 4, 1, 0, 2, 0, 1, 4, 0.250, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1642853, 1610612756, 12, 3, 3, 0, 0, 0, 1, 1, 4, 0.250, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1642863, 1610612756, 7, 4, 6, 0, 1, 0, 2, 2, 6, 0.333, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 202687, 1610612759, 9, 2, 1, 1, 1, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 203084, 1610612759, 20, 8, 4, 4, 0, 0, 0, 3, 8, 0.375, 1, 4, 0.250, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 203482, 1610612759, 9, 0, 3, 1, 0, 0, 1, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1628368, 1610612759, 21, 15, 3, 8, 0, 0, 1, 4, 9, 0.444, 2, 5, 0.400, 5, 6, 0.833, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1628436, 1610612759, 16, 10, 9, 2, 0, 1, 0, 5, 5, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1629162, 1610612759, 9, 0, 0, 0, 0, 1, 0, 0, 4, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1629640, 1610612759, 20, 6, 2, 1, 0, 0, 1, 2, 6, 0.333, 0, 2, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1630170, 1610612759, 22, 12, 2, 2, 0, 0, 1, 5, 9, 0.556, 2, 5, 0.400, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1630577, 1610612759, 22, 8, 6, 1, 0, 0, 0, 2, 3, 0.667, 1, 2, 0.500, 3, 3, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1641705, 1610612759, 24, 17, 11, 4, 1, 5, 1, 7, 15, 0.467, 1, 4, 0.250, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1642264, 1610612759, 21, 20, 2, 4, 3, 0, 2, 8, 11, 0.727, 2, 4, 0.500, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1642844, 1610612759, 25, 17, 1, 1, 1, 0, 3, 7, 11, 0.636, 2, 5, 0.400, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500798', 1642868, 1610612759, 15, 6, 6, 1, 0, 0, 1, 2, 6, 0.333, 2, 4, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 202696, 1610612738, 27, 9, 5, 0, 1, 1, 0, 4, 9, 0.444, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1627759, 1610612738, 37, 23, 15, 13, 0, 0, 2, 10, 18, 0.556, 0, 3, 0.000, 3, 3, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1628401, 1610612738, 39, 10, 5, 8, 1, 4, 3, 4, 13, 0.308, 0, 5, 0.000, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1629674, 1610612738, 18, 9, 6, 1, 2, 0, 0, 4, 6, 0.667, 0, 0, 0.000, 1, 2, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1630202, 1610612738, 32, 26, 6, 7, 1, 0, 4, 10, 18, 0.556, 6, 11, 0.545, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1630568, 1610612738, 2, 3, 1, 0, 0, 0, 0, 1, 1, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1630573, 1610612738, 27, 16, 3, 5, 0, 0, 0, 6, 10, 0.600, 4, 5, 0.800, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1630625, 1610612738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1631199, 1610612738, 11, 6, 2, 1, 0, 1, 0, 2, 4, 0.500, 2, 4, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1631248, 1610612738, 24, 7, 5, 1, 1, 0, 2, 3, 9, 0.333, 1, 5, 0.200, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1641775, 1610612738, 7, 5, 2, 0, 0, 0, 2, 2, 2, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1642864, 1610612738, 12, 7, 4, 0, 1, 0, 0, 3, 5, 0.600, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1642873, 1610612738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1642910, 1610612738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 201143, 1610612744, 27, 5, 8, 4, 0, 1, 2, 2, 10, 0.200, 1, 6, 0.167, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 203110, 1610612744, 18, 0, 2, 3, 0, 0, 1, 0, 7, 0.000, 0, 5, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 204001, 1610612744, 17, 12, 1, 1, 0, 1, 2, 5, 9, 0.556, 2, 5, 0.400, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1627780, 1610612744, 18, 14, 3, 2, 1, 0, 0, 6, 8, 0.750, 2, 4, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1629001, 1610612744, 25, 18, 3, 1, 1, 0, 2, 7, 13, 0.538, 2, 6, 0.333, 2, 4, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1630311, 1610612744, 26, 5, 2, 7, 2, 0, 0, 2, 7, 0.286, 1, 3, 0.333, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1630541, 1610612744, 22, 11, 3, 2, 0, 0, 1, 4, 9, 0.444, 3, 7, 0.429, 0, 2, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1630611, 1610612744, 31, 17, 6, 2, 2, 0, 0, 6, 14, 0.429, 5, 9, 0.556, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1631466, 1610612744, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1641764, 1610612744, 27, 11, 7, 6, 1, 1, 0, 5, 8, 0.625, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1642366, 1610612744, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1642502, 1610612744, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500799', 1642954, 1610612744, 24, 17, 5, 2, 1, 1, 0, 6, 11, 0.545, 3, 7, 0.429, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1628371, 1610612753, 13, 0, 7, 1, 1, 0, 1, 0, 3, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1628975, 1610612753, 23, 14, 3, 4, 1, 0, 1, 5, 8, 0.625, 3, 5, 0.600, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1628976, 1610612753, 24, 2, 8, 3, 1, 0, 0, 1, 5, 0.200, 0, 2, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1629021, 1610612753, 18, 11, 2, 3, 2, 0, 1, 2, 7, 0.286, 1, 5, 0.200, 6, 8, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1629048, 1610612753, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1630217, 1610612753, 32, 17, 4, 2, 2, 1, 0, 6, 9, 0.667, 3, 5, 0.600, 2, 3, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1630591, 1610612753, 19, 9, 3, 3, 0, 1, 3, 3, 8, 0.375, 3, 7, 0.429, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1631094, 1610612753, 32, 30, 5, 6, 1, 1, 3, 10, 21, 0.476, 5, 7, 0.714, 5, 5, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1631288, 1610612753, 4, 0, 2, 1, 1, 0, 0, 0, 3, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1641710, 1610612753, 31, 20, 3, 3, 3, 0, 1, 8, 13, 0.615, 4, 6, 0.667, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1641724, 1610612753, 12, 16, 0, 0, 0, 1, 0, 6, 6, 1.000, 4, 4, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1641783, 1610612753, 17, 12, 4, 1, 0, 0, 0, 4, 6, 0.667, 4, 6, 0.667, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1642859, 1610612753, 4, 0, 0, 1, 1, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1642869, 1610612753, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 201566, 1610612758, 16, 5, 0, 1, 1, 0, 3, 2, 8, 0.250, 1, 6, 0.167, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 201942, 1610612758, 19, 13, 3, 6, 0, 0, 0, 3, 11, 0.273, 0, 0, 0.000, 7, 8, 0.875, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 203926, 1610612758, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1628370, 1610612758, 20, 14, 0, 2, 0, 0, 1, 5, 8, 0.625, 3, 6, 0.500, 1, 3, 0.333, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1629234, 1610612758, 11, 0, 5, 1, 0, 0, 0, 0, 2, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1630173, 1610612758, 33, 14, 10, 1, 4, 2, 3, 7, 12, 0.583, 0, 1, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1631099, 1610612758, 31, 15, 8, 2, 0, 1, 3, 6, 13, 0.462, 3, 7, 0.429, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1631342, 1610612758, 9, 0, 1, 0, 0, 0, 0, 0, 2, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1642269, 1610612758, 28, 11, 5, 4, 3, 0, 3, 3, 12, 0.250, 0, 5, 0.000, 5, 6, 0.833, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1642363, 1610612758, 29, 5, 2, 1, 0, 0, 5, 1, 5, 0.200, 1, 1, 1.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1642875, 1610612758, 38, 17, 14, 4, 1, 0, 1, 8, 13, 0.615, 0, 0, 0.000, 1, 1, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500800', 1642928, 1610612758, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 202685, 1610612743, 11, 6, 4, 0, 2, 0, 2, 2, 3, 0.667, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 203501, 1610612743, 20, 2, 2, 0, 0, 0, 0, 1, 5, 0.200, 0, 4, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 203999, 1610612743, 36, 22, 17, 6, 0, 0, 6, 9, 22, 0.409, 0, 6, 0.000, 4, 7, 0.571, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1627750, 1610612743, 34, 20, 8, 8, 2, 1, 4, 5, 15, 0.333, 2, 5, 0.400, 8, 10, 0.800, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1628971, 1610612743, 25, 19, 5, 6, 0, 0, 2, 6, 9, 0.667, 3, 5, 0.600, 4, 7, 0.571, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1629618, 1610612743, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1629661, 1610612743, 35, 18, 4, 3, 0, 0, 1, 6, 12, 0.500, 2, 7, 0.286, 4, 4, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1630192, 1610612743, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1631124, 1610612743, 25, 18, 1, 2, 1, 0, 1, 6, 11, 0.545, 6, 10, 0.600, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1631128, 1610612743, 34, 7, 2, 3, 3, 0, 1, 3, 6, 0.500, 0, 1, 0.000, 1, 1, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1641747, 1610612743, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1642461, 1610612743, 16, 2, 2, 1, 0, 1, 0, 1, 3, 0.333, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 201572, 1610612746, 30, 8, 6, 2, 1, 1, 1, 4, 10, 0.400, 0, 4, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 201587, 1610612746, 17, 6, 2, 0, 0, 0, 0, 2, 3, 0.667, 2, 3, 0.667, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 202695, 1610612746, 32, 23, 4, 3, 0, 0, 2, 8, 18, 0.444, 1, 7, 0.143, 6, 8, 0.750, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 203992, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1627739, 1610612746, 29, 2, 8, 8, 2, 0, 3, 1, 4, 0.250, 0, 0, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1627884, 1610612746, 33, 22, 3, 1, 0, 0, 1, 7, 15, 0.467, 2, 7, 0.286, 6, 7, 0.857, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1628381, 1610612746, 31, 11, 12, 4, 1, 3, 2, 5, 10, 0.500, 1, 4, 0.250, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1630543, 1610612746, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1631097, 1610612746, 33, 38, 5, 4, 3, 0, 3, 12, 22, 0.545, 2, 6, 0.333, 12, 13, 0.923, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1641757, 1610612746, 13, 1, 1, 4, 1, 0, 0, 0, 2, 0.000, 0, 2, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1642353, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1642920, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500801', 1642949, 1610612746, 13, 4, 4, 1, 0, 0, 0, 2, 3, 0.667, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 201935, 1610612739, 34, 18, 4, 8, 1, 0, 2, 6, 14, 0.429, 2, 3, 0.667, 4, 4, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 203471, 1610612739, 20, 8, 0, 3, 3, 0, 2, 2, 4, 0.500, 0, 1, 0.000, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1626204, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1628378, 1610612739, 34, 32, 3, 4, 2, 0, 3, 9, 22, 0.409, 2, 7, 0.286, 12, 13, 0.923, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1628386, 1610612739, 32, 26, 14, 2, 0, 1, 1, 11, 15, 0.733, 0, 0, 0.000, 4, 5, 0.800, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1628418, 1610612739, 15, 2, 5, 1, 1, 2, 2, 1, 4, 0.250, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1629731, 1610612739, 26, 8, 4, 0, 1, 0, 0, 3, 3, 1.000, 2, 2, 1.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1630241, 1610612739, 24, 10, 2, 2, 0, 0, 0, 4, 6, 0.667, 2, 4, 0.500, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1631165, 1610612739, 23, 4, 4, 3, 2, 0, 1, 2, 2, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1641772, 1610612739, 12, 5, 2, 1, 0, 0, 0, 1, 3, 0.333, 1, 2, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1641854, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1642281, 1610612739, 16, 5, 1, 0, 0, 0, 1, 2, 4, 0.500, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1642400, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1642468, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1642878, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1626192, 1610612766, 19, 5, 5, 1, 0, 0, 2, 2, 3, 0.667, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1628970, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1630163, 1610612766, 26, 18, 2, 6, 0, 0, 2, 4, 17, 0.235, 2, 10, 0.200, 8, 8, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1630182, 1610612766, 19, 11, 2, 2, 1, 1, 0, 3, 7, 0.429, 2, 6, 0.333, 3, 3, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1630214, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1630544, 1610612766, 12, 3, 1, 2, 0, 0, 3, 1, 4, 0.250, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1631217, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1641706, 1610612766, 23, 18, 2, 4, 0, 1, 5, 6, 19, 0.316, 4, 12, 0.333, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1641750, 1610612766, 35, 12, 13, 1, 0, 1, 0, 5, 7, 0.714, 0, 0, 0.000, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1641790, 1610612766, 11, 2, 4, 1, 0, 0, 1, 1, 3, 0.333, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1641810, 1610612766, 5, 3, 0, 0, 0, 0, 1, 1, 3, 0.333, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1642275, 1610612766, 16, 3, 4, 0, 0, 0, 0, 1, 7, 0.143, 1, 6, 0.167, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1642851, 1610612766, 37, 33, 6, 2, 1, 0, 0, 11, 20, 0.550, 7, 15, 0.467, 4, 5, 0.800, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500802', 1642883, 1610612766, 29, 5, 6, 7, 3, 1, 0, 1, 2, 0.500, 1, 2, 0.500, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 204456, 1610612754, 14, 9, 2, 2, 1, 0, 2, 4, 8, 0.500, 1, 2, 0.500, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1629614, 1610612754, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1630174, 1610612754, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1630643, 1610612754, 15, 22, 1, 2, 0, 0, 0, 8, 11, 0.727, 5, 8, 0.625, 1, 2, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1630695, 1610612754, 26, 18, 5, 2, 1, 0, 2, 6, 13, 0.462, 4, 9, 0.444, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1631245, 1610612754, 23, 21, 3, 3, 0, 0, 4, 8, 13, 0.615, 1, 4, 0.250, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1641716, 1610612754, 30, 12, 12, 6, 1, 0, 5, 3, 11, 0.273, 3, 9, 0.333, 3, 4, 0.750, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1641738, 1610612754, 33, 12, 5, 0, 2, 0, 0, 4, 9, 0.444, 2, 4, 0.500, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1641767, 1610612754, 19, 8, 5, 3, 1, 0, 0, 3, 5, 0.600, 0, 2, 0.000, 2, 4, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1642880, 1610612754, 38, 4, 5, 11, 2, 0, 6, 2, 9, 0.222, 0, 3, 0.000, 0, 2, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1643007, 1610612754, 37, 12, 2, 3, 4, 0, 2, 5, 11, 0.455, 2, 8, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1630264, 1610612764, 23, 11, 3, 6, 0, 3, 1, 5, 6, 0.833, 0, 0, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1630536, 1610612764, 27, 18, 3, 5, 0, 0, 4, 8, 11, 0.727, 0, 2, 0.000, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1630551, 1610612764, 10, 0, 7, 1, 0, 0, 2, 0, 1, 0.000, 0, 0, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1630702, 1610612764, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1631214, 1610612764, 29, 25, 10, 4, 1, 2, 1, 9, 11, 0.818, 2, 4, 0.500, 5, 5, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1641731, 1610612764, 21, 13, 3, 3, 1, 2, 3, 6, 12, 0.500, 1, 3, 0.333, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1641774, 1610612764, 20, 14, 8, 1, 1, 1, 1, 7, 12, 0.583, 0, 5, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1642267, 1610612764, 21, 6, 5, 7, 1, 0, 2, 3, 8, 0.375, 0, 4, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1642364, 1610612764, 23, 11, 4, 2, 2, 0, 0, 5, 11, 0.455, 1, 5, 0.200, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1642848, 1610612764, 18, 14, 1, 1, 1, 1, 0, 6, 11, 0.545, 1, 3, 0.333, 1, 1, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1642860, 1610612764, 12, 12, 1, 2, 1, 0, 1, 3, 5, 0.600, 0, 1, 0.000, 6, 8, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500803', 1642955, 1610612764, 31, 7, 3, 4, 6, 0, 2, 3, 7, 0.429, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 201567, 1610612762, 5, 6, 1, 2, 0, 0, 0, 2, 2, 1.000, 2, 2, 1.000, 0, 1, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1629004, 1610612762, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1629723, 1610612762, 30, 6, 6, 4, 4, 0, 2, 3, 6, 0.500, 0, 2, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1631131, 1610612762, 14, 2, 6, 0, 0, 0, 0, 1, 2, 0.500, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1631246, 1610612762, 22, 7, 3, 4, 0, 0, 2, 2, 7, 0.286, 2, 4, 0.500, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1641729, 1610612762, 19, 9, 4, 3, 0, 0, 3, 4, 12, 0.333, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1641989, 1610612762, 7, 2, 2, 1, 0, 0, 1, 1, 1, 1.000, 0, 0, 0.000, 0, 1, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642262, 1610612762, 37, 5, 9, 2, 1, 1, 4, 2, 9, 0.222, 0, 3, 0.000, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642268, 1610612762, 24, 24, 2, 5, 4, 2, 4, 9, 16, 0.563, 2, 5, 0.400, 4, 6, 0.667, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642271, 1610612762, 28, 20, 6, 4, 2, 2, 5, 9, 13, 0.692, 1, 2, 0.500, 1, 1, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642396, 1610612762, 16, 13, 4, 0, 0, 0, 0, 5, 6, 0.833, 3, 3, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642846, 1610612762, 32, 20, 6, 3, 0, 1, 3, 8, 19, 0.421, 2, 9, 0.222, 2, 3, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 203937, 1610612763, 18, 10, 1, 0, 1, 0, 1, 3, 4, 0.750, 1, 1, 1.000, 3, 3, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1629660, 1610612763, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1630590, 1610612763, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1641707, 1610612763, 24, 9, 9, 2, 1, 0, 2, 4, 11, 0.364, 1, 4, 0.250, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1641713, 1610612763, 27, 20, 4, 3, 1, 1, 3, 7, 13, 0.538, 2, 5, 0.400, 4, 8, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1641765, 1610612763, 29, 23, 5, 1, 2, 1, 3, 10, 16, 0.625, 0, 3, 0.000, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642285, 1610612763, 20, 10, 3, 10, 1, 0, 0, 3, 5, 0.600, 1, 2, 0.500, 3, 3, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642377, 1610612763, 26, 13, 3, 3, 2, 1, 1, 4, 14, 0.286, 3, 9, 0.333, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642383, 1610612763, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642914, 1610612763, 29, 16, 4, 5, 4, 1, 2, 5, 12, 0.417, 2, 5, 0.400, 4, 6, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1642942, 1610612763, 31, 11, 5, 2, 2, 1, 4, 4, 9, 0.444, 2, 4, 0.500, 1, 4, 0.250, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500804', 1643133, 1610612763, 31, 11, 11, 3, 1, 1, 1, 5, 8, 0.625, 0, 0, 0.000, 1, 3, 0.333, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 203468, 1610612737, 27, 20, 2, 1, 0, 0, 3, 8, 16, 0.500, 4, 8, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1627741, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1629111, 1610612737, 18, 3, 6, 1, 0, 0, 0, 1, 7, 0.143, 0, 4, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1629216, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1629638, 1610612737, 36, 20, 3, 3, 0, 0, 4, 8, 17, 0.471, 4, 9, 0.444, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1630168, 1610612737, 29, 22, 3, 3, 1, 2, 0, 8, 12, 0.667, 4, 5, 0.800, 2, 4, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1630552, 1610612737, 35, 16, 16, 11, 0, 0, 3, 6, 22, 0.273, 2, 5, 0.400, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1630557, 1610612737, 23, 6, 3, 3, 0, 0, 1, 2, 5, 0.400, 1, 3, 0.333, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1630700, 1610612737, 29, 4, 7, 3, 2, 0, 2, 2, 7, 0.286, 0, 1, 0.000, 0, 1, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1630811, 1610612737, 3, 2, 1, 1, 0, 0, 0, 0, 1, 0.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1631243, 1610612737, 12, 0, 1, 0, 1, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1642258, 1610612737, 23, 4, 4, 0, 0, 1, 0, 1, 8, 0.125, 1, 3, 0.333, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1642854, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 203952, 1610612748, 27, 13, 7, 2, 0, 1, 1, 5, 12, 0.417, 3, 6, 0.500, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1626181, 1610612748, 24, 15, 3, 2, 1, 0, 2, 5, 13, 0.385, 2, 8, 0.250, 3, 3, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1628389, 1610612748, 27, 17, 8, 5, 1, 0, 0, 8, 14, 0.571, 1, 4, 0.250, 0, 2, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1629639, 1610612748, 23, 24, 4, 3, 1, 0, 0, 9, 14, 0.643, 2, 4, 0.500, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1630558, 1610612748, 26, 7, 5, 7, 1, 3, 2, 3, 5, 0.600, 1, 3, 0.333, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1630696, 1610612748, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1631107, 1610612748, 2, 1, 0, 1, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1631170, 1610612748, 26, 10, 5, 4, 0, 0, 2, 5, 9, 0.556, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1631323, 1610612748, 2, 3, 0, 1, 0, 0, 0, 1, 1, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1641796, 1610612748, 31, 12, 6, 1, 2, 0, 1, 6, 9, 0.667, 0, 0, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1642066, 1610612748, 7, 3, 2, 1, 0, 0, 0, 1, 1, 1.000, 0, 0, 0.000, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1642276, 1610612748, 18, 14, 12, 1, 0, 0, 0, 6, 15, 0.400, 2, 5, 0.400, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1642352, 1610612748, 2, 5, 1, 0, 0, 0, 0, 2, 3, 0.667, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500805', 1642857, 1610612748, 16, 4, 5, 3, 2, 0, 0, 1, 3, 0.333, 0, 1, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 202691, 1610612742, 27, 11, 0, 2, 1, 0, 1, 4, 12, 0.333, 3, 9, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 203114, 1610612742, 30, 18, 6, 2, 2, 0, 2, 6, 14, 0.429, 1, 3, 0.333, 5, 6, 0.833, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 203939, 1610612742, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1626145, 1610612742, 26, 13, 1, 6, 0, 0, 0, 6, 10, 0.600, 1, 1, 1.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1628963, 1610612742, 24, 15, 13, 0, 0, 1, 1, 5, 9, 0.556, 1, 2, 0.500, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1628997, 1610612742, 14, 4, 2, 1, 2, 0, 1, 1, 2, 0.500, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1629023, 1610612742, 36, 12, 12, 2, 2, 0, 0, 5, 17, 0.294, 2, 5, 0.400, 0, 2, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1629655, 1610612742, 23, 8, 5, 1, 2, 2, 1, 4, 7, 0.571, 0, 0, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1630230, 1610612742, 33, 15, 5, 3, 3, 0, 3, 5, 16, 0.313, 0, 4, 0.000, 5, 7, 0.714, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1630314, 1610612742, 18, 13, 1, 4, 0, 0, 2, 4, 8, 0.500, 0, 1, 0.000, 5, 8, 0.625, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1642358, 1610612742, 4, 2, 0, 0, 0, 0, 1, 1, 2, 0.500, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1642939, 1610612742, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 201144, 1610612750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 203497, 1610612750, 32, 22, 17, 1, 1, 3, 2, 9, 11, 0.818, 0, 1, 0.000, 4, 8, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 203944, 1610612750, 28, 13, 5, 3, 1, 0, 5, 4, 15, 0.267, 1, 4, 0.250, 4, 4, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 204060, 1610612750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1628978, 1610612750, 30, 9, 5, 9, 1, 0, 1, 3, 5, 0.600, 3, 5, 0.600, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1629675, 1610612750, 30, 21, 7, 4, 1, 2, 2, 8, 14, 0.571, 4, 8, 0.500, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1630162, 1610612750, 37, 40, 6, 1, 1, 0, 3, 16, 30, 0.533, 5, 13, 0.385, 3, 4, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1630183, 1610612750, 34, 7, 8, 5, 2, 1, 6, 3, 11, 0.273, 1, 4, 0.250, 0, 1, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1630245, 1610612750, 27, 5, 2, 3, 0, 0, 0, 2, 9, 0.222, 1, 5, 0.200, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1630538, 1610612750, 14, 3, 4, 2, 0, 0, 0, 1, 3, 0.333, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1630545, 1610612750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1641740, 1610612750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1641763, 1610612750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1642402, 1610612750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500806', 1642866, 1610612750, 4, 2, 0, 0, 0, 2, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 201599, 1610612740, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1626172, 1610612740, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1629627, 1610612740, 30, 32, 2, 2, 0, 0, 0, 13, 17, 0.765, 0, 0, 0.000, 6, 8, 0.750, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1629673, 1610612740, 25, 3, 4, 3, 0, 0, 0, 1, 6, 0.167, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1630180, 1610612740, 36, 22, 6, 3, 3, 1, 2, 7, 14, 0.500, 2, 7, 0.286, 6, 6, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1630529, 1610612740, 31, 8, 4, 3, 0, 0, 1, 3, 10, 0.300, 0, 6, 0.000, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1631121, 1610612740, 30, 10, 1, 0, 2, 0, 0, 5, 12, 0.417, 0, 3, 0.000, 0, 1, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1631255, 1610612740, 24, 9, 7, 2, 0, 2, 2, 4, 4, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1641722, 1610612740, 4, 0, 0, 0, 0, 0, 1, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1642847, 1610612740, 28, 16, 4, 5, 2, 0, 3, 7, 13, 0.538, 0, 3, 0.000, 2, 5, 0.400, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1642852, 1610612740, 28, 18, 9, 4, 3, 2, 4, 7, 10, 0.700, 0, 0, 0.000, 4, 6, 0.667, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 203648, 1610612749, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 203914, 1610612749, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1626171, 1610612749, 27, 17, 11, 1, 0, 1, 0, 8, 12, 0.667, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1628398, 1610612749, 25, 14, 3, 4, 1, 0, 1, 6, 11, 0.545, 2, 5, 0.400, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1629018, 1610612749, 2, 3, 0, 0, 0, 0, 0, 1, 2, 0.500, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1629645, 1610612749, 32, 25, 2, 7, 2, 1, 1, 10, 15, 0.667, 0, 1, 0.000, 5, 6, 0.833, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1630560, 1610612749, 20, 27, 3, 1, 0, 0, 2, 11, 17, 0.647, 1, 6, 0.167, 4, 6, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1630579, 1610612749, 18, 4, 6, 1, 0, 2, 2, 2, 2, 1.000, 0, 0, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1631157, 1610612749, 34, 27, 2, 6, 4, 2, 2, 10, 15, 0.667, 7, 10, 0.700, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1631172, 1610612749, 22, 10, 2, 1, 0, 1, 2, 3, 6, 0.500, 1, 1, 1.000, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1631250, 1610612749, 21, 10, 5, 2, 0, 1, 1, 4, 8, 0.500, 2, 4, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1631260, 1610612749, 29, 0, 2, 4, 1, 0, 2, 0, 4, 0.000, 0, 4, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500807', 1641748, 1610612749, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1629008, 1610612751, 37, 22, 9, 5, 2, 0, 2, 6, 16, 0.375, 1, 9, 0.111, 9, 11, 0.818, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1629611, 1610612751, 24, 3, 4, 2, 1, 1, 2, 1, 3, 0.333, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1629651, 1610612751, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1630533, 1610612751, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1630534, 1610612751, 10, 4, 1, 0, 0, 0, 2, 1, 6, 0.167, 1, 3, 0.333, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1630549, 1610612751, 27, 12, 8, 2, 2, 1, 2, 6, 8, 0.750, 0, 0, 0.000, 0, 2, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1630592, 1610612751, 15, 5, 2, 0, 2, 0, 2, 1, 2, 0.500, 1, 2, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1641730, 1610612751, 26, 8, 5, 1, 1, 0, 2, 3, 9, 0.333, 1, 6, 0.167, 1, 1, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1642849, 1610612751, 26, 17, 1, 3, 2, 1, 4, 5, 11, 0.455, 1, 4, 0.250, 6, 6, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1642856, 1610612751, 28, 3, 5, 3, 1, 2, 0, 1, 10, 0.100, 1, 8, 0.125, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1642874, 1610612751, 22, 8, 3, 2, 0, 2, 1, 4, 12, 0.333, 0, 5, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1642962, 1610612751, 20, 4, 2, 1, 0, 0, 3, 1, 2, 0.500, 0, 1, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1627936, 1610612760, 10, 0, 0, 3, 1, 0, 1, 0, 5, 0.000, 0, 3, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1628392, 1610612760, 24, 10, 8, 4, 1, 2, 1, 4, 6, 0.667, 0, 0, 0.000, 2, 4, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1629026, 1610612760, 14, 7, 2, 0, 1, 1, 1, 2, 5, 0.400, 1, 2, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1629652, 1610612760, 28, 10, 2, 2, 0, 1, 0, 3, 9, 0.333, 2, 6, 0.333, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1630198, 1610612760, 21, 11, 7, 1, 2, 0, 1, 3, 6, 0.500, 2, 3, 0.667, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1630598, 1610612760, 27, 7, 4, 0, 1, 0, 1, 3, 11, 0.273, 1, 4, 0.250, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1631096, 1610612760, 25, 15, 7, 2, 0, 0, 4, 3, 6, 0.500, 2, 2, 1.000, 7, 7, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1631119, 1610612760, 18, 7, 4, 2, 0, 0, 1, 2, 4, 0.500, 1, 2, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1631205, 1610612760, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1641717, 1610612760, 29, 8, 4, 6, 4, 0, 4, 4, 13, 0.308, 0, 5, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1642260, 1610612760, 11, 9, 3, 2, 0, 0, 3, 4, 6, 0.667, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1642272, 1610612760, 22, 21, 4, 0, 1, 0, 1, 7, 12, 0.583, 3, 6, 0.500, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500808', 1642964, 1610612760, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 201572, 1610612746, 34, 16, 10, 1, 2, 3, 0, 7, 12, 0.583, 1, 3, 0.333, 1, 1, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 201587, 1610612746, 15, 0, 3, 2, 1, 0, 0, 0, 2, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 202695, 1610612746, 30, 31, 4, 5, 0, 0, 5, 11, 19, 0.579, 4, 6, 0.667, 5, 5, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 203992, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1627739, 1610612746, 34, 8, 5, 8, 0, 0, 2, 4, 4, 1.000, 0, 0, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1627884, 1610612746, 38, 13, 8, 2, 1, 2, 1, 6, 10, 0.600, 1, 3, 0.333, 0, 1, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1628381, 1610612746, 16, 12, 1, 0, 1, 0, 2, 5, 8, 0.625, 1, 2, 0.500, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1630543, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1631097, 1610612746, 31, 26, 7, 2, 0, 0, 3, 7, 16, 0.438, 1, 4, 0.250, 11, 14, 0.786, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1641757, 1610612746, 24, 10, 1, 4, 1, 0, 1, 3, 8, 0.375, 0, 1, 0.000, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1642353, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1642920, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1642949, 1610612746, 13, 6, 3, 1, 1, 0, 2, 2, 3, 0.667, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 2544, 1610612747, 33, 13, 3, 11, 1, 0, 3, 5, 13, 0.385, 1, 3, 0.333, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 203935, 1610612747, 29, 7, 2, 0, 1, 1, 1, 3, 4, 0.750, 1, 2, 0.500, 0, 2, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1628379, 1610612747, 17, 9, 2, 1, 0, 0, 2, 4, 6, 0.667, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1628467, 1610612747, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1629020, 1610612747, 9, 2, 0, 2, 0, 0, 0, 1, 2, 0.500, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1629028, 1610612747, 27, 13, 7, 1, 0, 1, 1, 5, 10, 0.500, 0, 0, 0.000, 3, 3, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1629029, 1610612747, 37, 38, 6, 11, 3, 1, 2, 11, 25, 0.440, 8, 14, 0.571, 8, 11, 0.727, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1629060, 1610612747, 25, 3, 2, 2, 1, 0, 0, 1, 4, 0.250, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1629637, 1610612747, 11, 8, 3, 0, 0, 1, 0, 4, 5, 0.800, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1630559, 1610612747, 32, 29, 6, 2, 2, 0, 3, 9, 15, 0.600, 4, 5, 0.800, 7, 7, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1631222, 1610612747, 14, 3, 1, 1, 0, 0, 0, 1, 1, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1641723, 1610612747, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500809', 1642261, 1610612747, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 202685, 1610612743, 11, 6, 7, 1, 0, 0, 1, 3, 8, 0.375, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 203501, 1610612743, 18, 19, 2, 3, 2, 0, 2, 7, 11, 0.636, 4, 7, 0.571, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 203999, 1610612743, 29, 32, 9, 7, 4, 0, 2, 10, 15, 0.667, 3, 4, 0.750, 9, 11, 0.818, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1627750, 1610612743, 25, 25, 6, 6, 1, 0, 2, 6, 12, 0.500, 6, 12, 0.500, 7, 7, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1628971, 1610612743, 19, 6, 2, 1, 1, 0, 2, 3, 4, 0.750, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1629618, 1610612743, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1629661, 1610612743, 26, 15, 4, 4, 2, 2, 0, 3, 8, 0.375, 2, 5, 0.400, 7, 8, 0.875, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1630192, 1610612743, 8, 2, 2, 1, 1, 0, 1, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1631124, 1610612743, 29, 19, 6, 4, 1, 0, 1, 9, 16, 0.563, 1, 4, 0.250, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1631128, 1610612743, 26, 11, 8, 7, 0, 0, 2, 4, 6, 0.667, 2, 3, 0.667, 1, 2, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1641747, 1610612743, 6, 9, 3, 1, 0, 0, 1, 4, 7, 0.571, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1642354, 1610612743, 7, 3, 1, 4, 0, 0, 0, 1, 2, 0.500, 0, 0, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1642461, 1610612743, 29, 10, 10, 2, 0, 1, 1, 4, 6, 0.667, 2, 2, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 201950, 1610612757, 25, 19, 2, 2, 1, 0, 3, 6, 10, 0.600, 4, 8, 0.500, 3, 3, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 203924, 1610612757, 24, 6, 3, 0, 0, 1, 2, 3, 6, 0.500, 0, 0, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1629057, 1610612757, 11, 2, 3, 1, 0, 1, 0, 1, 2, 0.500, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1629680, 1610612757, 12, 5, 2, 1, 3, 0, 2, 1, 5, 0.200, 1, 4, 0.250, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1630166, 1610612757, 30, 15, 8, 13, 0, 0, 6, 5, 10, 0.500, 0, 4, 0.000, 5, 7, 0.714, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1630249, 1610612757, 17, 11, 1, 0, 0, 0, 1, 4, 7, 0.571, 2, 5, 0.400, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1630703, 1610612757, 20, 11, 1, 3, 0, 0, 0, 3, 11, 0.273, 3, 7, 0.429, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1631104, 1610612757, 12, 4, 1, 1, 1, 0, 0, 1, 3, 0.333, 0, 1, 0.000, 2, 4, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1631200, 1610612757, 9, 1, 1, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1631321, 1610612757, 16, 0, 1, 1, 2, 2, 0, 0, 2, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1631451, 1610612757, 5, 0, 2, 0, 0, 0, 0, 0, 3, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1641739, 1610612757, 26, 10, 1, 1, 1, 0, 3, 4, 11, 0.364, 2, 8, 0.250, 0, 2, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1642270, 1610612757, 18, 15, 9, 2, 0, 0, 0, 6, 12, 0.500, 3, 6, 0.500, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500810', 1642905, 1610612757, 8, 4, 1, 0, 0, 1, 1, 1, 4, 0.250, 0, 1, 0.000, 2, 6, 0.333, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1628371, 1610612753, 8, 2, 2, 0, 0, 1, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 2, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1628975, 1610612753, 33, 15, 2, 2, 2, 2, 3, 6, 14, 0.429, 3, 11, 0.273, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1628976, 1610612753, 34, 7, 11, 1, 0, 0, 2, 2, 4, 0.500, 0, 2, 0.000, 3, 3, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1629021, 1610612753, 12, 7, 2, 1, 0, 0, 0, 2, 4, 0.500, 1, 2, 0.500, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1629048, 1610612753, 8, 4, 3, 0, 0, 1, 1, 2, 2, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1630217, 1610612753, 39, 34, 4, 3, 2, 1, 2, 12, 18, 0.667, 5, 9, 0.556, 5, 5, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1631094, 1610612753, 46, 26, 14, 8, 0, 4, 6, 11, 28, 0.393, 0, 2, 0.000, 4, 4, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1631288, 1610612753, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1641710, 1610612753, 44, 10, 4, 4, 1, 1, 2, 4, 12, 0.333, 0, 5, 0.000, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1641724, 1610612753, 18, 0, 1, 1, 1, 2, 0, 0, 4, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1641783, 1610612753, 37, 5, 9, 3, 0, 3, 0, 2, 10, 0.200, 1, 6, 0.167, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1642859, 1610612753, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1642869, 1610612753, 5, 0, 1, 1, 0, 0, 0, 0, 1, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1626220, 1610612756, 45, 6, 7, 4, 2, 2, 1, 2, 10, 0.200, 2, 9, 0.222, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1628415, 1610612756, 7, 5, 3, 0, 0, 0, 0, 2, 7, 0.286, 1, 3, 0.333, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1628960, 1610612756, 33, 27, 7, 2, 1, 1, 2, 8, 22, 0.364, 4, 14, 0.286, 7, 7, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1629599, 1610612756, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1630224, 1610612756, 36, 16, 7, 5, 3, 0, 1, 6, 26, 0.231, 2, 11, 0.182, 2, 6, 0.333, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1630587, 1610612756, 14, 0, 2, 0, 0, 0, 0, 0, 4, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1630692, 1610612756, 24, 17, 6, 1, 2, 0, 0, 6, 10, 0.600, 3, 4, 0.750, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1631109, 1610612756, 28, 9, 9, 1, 0, 0, 1, 4, 10, 0.400, 0, 0, 0.000, 1, 1, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1631123, 1610612756, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1631221, 1610612756, 44, 19, 5, 6, 1, 0, 1, 6, 17, 0.353, 3, 10, 0.300, 4, 5, 0.800, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1642345, 1610612756, 29, 11, 12, 1, 2, 0, 2, 5, 7, 0.714, 0, 0, 0.000, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1642346, 1610612756, 22, 3, 7, 0, 0, 1, 0, 1, 4, 0.250, 1, 3, 0.333, 0, 2, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1642853, 1610612756, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500811', 1642863, 1610612756, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 201599, 1610612740, 31, 6, 15, 0, 0, 4, 2, 2, 3, 0.667, 0, 0, 0.000, 2, 4, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1626172, 1610612740, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1629627, 1610612740, 32, 21, 6, 8, 3, 1, 1, 7, 14, 0.500, 0, 0, 0.000, 7, 8, 0.875, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1629673, 1610612740, 24, 23, 3, 5, 1, 0, 0, 8, 15, 0.533, 5, 11, 0.455, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1630180, 1610612740, 26, 20, 4, 2, 0, 0, 3, 7, 14, 0.500, 4, 7, 0.571, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1630529, 1610612740, 32, 14, 1, 3, 1, 1, 2, 5, 11, 0.455, 2, 5, 0.400, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1631121, 1610612740, 26, 13, 1, 1, 0, 0, 0, 4, 5, 0.800, 3, 4, 0.750, 2, 4, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1631255, 1610612740, 18, 12, 3, 0, 0, 2, 1, 3, 3, 1.000, 2, 2, 1.000, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1641722, 1610612740, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1642847, 1610612740, 24, 7, 7, 6, 0, 0, 2, 2, 10, 0.200, 0, 3, 0.000, 3, 6, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1642852, 1610612740, 20, 10, 9, 0, 0, 0, 3, 2, 5, 0.400, 1, 1, 1.000, 5, 6, 0.833, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 200768, 1610612755, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 203083, 1610612755, 21, 5, 12, 1, 1, 1, 2, 2, 7, 0.286, 0, 2, 0.000, 1, 2, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1626162, 1610612755, 33, 25, 5, 2, 1, 0, 0, 7, 15, 0.467, 4, 10, 0.400, 7, 8, 0.875, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1626166, 1610612755, 13, 5, 0, 1, 1, 0, 0, 2, 7, 0.286, 1, 6, 0.167, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1629656, 1610612755, 25, 11, 1, 3, 0, 1, 1, 3, 9, 0.333, 2, 7, 0.286, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1630178, 1610612755, 36, 27, 3, 7, 5, 0, 5, 9, 23, 0.391, 2, 11, 0.182, 7, 8, 0.875, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1630570, 1610612755, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1631133, 1610612755, 16, 9, 6, 1, 1, 0, 0, 3, 5, 0.600, 2, 3, 0.667, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1631213, 1610612755, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1631230, 1610612755, 28, 9, 5, 0, 1, 2, 1, 3, 9, 0.333, 0, 1, 0.000, 3, 5, 0.600, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1641737, 1610612755, 21, 4, 10, 1, 0, 1, 0, 1, 2, 0.500, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1642348, 1610612755, 6, 2, 0, 0, 0, 0, 0, 1, 2, 0.500, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500812', 1642845, 1610612755, 35, 14, 5, 3, 0, 0, 1, 5, 14, 0.357, 1, 5, 0.200, 3, 3, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 203952, 1610612748, 28, 28, 7, 3, 1, 0, 1, 9, 10, 0.900, 4, 4, 1.000, 6, 6, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1626181, 1610612748, 26, 25, 2, 6, 2, 1, 2, 10, 16, 0.625, 3, 8, 0.375, 2, 7, 0.286, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1628389, 1610612748, 26, 13, 6, 5, 0, 0, 1, 4, 7, 0.571, 1, 3, 0.333, 4, 5, 0.800, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1629639, 1610612748, 22, 14, 5, 6, 0, 0, 4, 5, 15, 0.333, 1, 4, 0.250, 3, 3, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1630558, 1610612748, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1630696, 1610612748, 21, 4, 6, 2, 1, 2, 1, 1, 4, 0.250, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1631107, 1610612748, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1631170, 1610612748, 22, 12, 5, 2, 1, 0, 1, 5, 12, 0.417, 0, 2, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1631211, 1610612748, 2, 0, 1, 0, 0, 0, 0, 0, 2, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1631323, 1610612748, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1641796, 1610612748, 34, 10, 1, 5, 2, 1, 4, 3, 7, 0.429, 0, 4, 0.000, 4, 6, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642066, 1610612748, 6, 5, 3, 2, 0, 0, 1, 2, 3, 0.667, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642276, 1610612748, 18, 11, 15, 0, 1, 0, 0, 5, 9, 0.556, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642352, 1610612748, 2, 2, 3, 0, 0, 1, 1, 1, 3, 0.333, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642857, 1610612748, 22, 12, 3, 5, 0, 0, 2, 4, 6, 0.667, 2, 3, 0.667, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 203937, 1610612763, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1629660, 1610612763, 22, 17, 6, 4, 2, 0, 2, 6, 16, 0.375, 3, 8, 0.375, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1630590, 1610612763, 20, 18, 3, 6, 2, 1, 3, 7, 15, 0.467, 3, 7, 0.429, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1641707, 1610612763, 24, 4, 2, 0, 1, 1, 1, 1, 4, 0.250, 1, 2, 0.500, 1, 4, 0.250, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1641713, 1610612763, 25, 28, 9, 2, 1, 1, 2, 11, 17, 0.647, 1, 5, 0.200, 5, 8, 0.625, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1641765, 1610612763, 25, 9, 3, 4, 4, 0, 1, 3, 4, 0.750, 1, 2, 0.500, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642285, 1610612763, 20, 0, 2, 5, 0, 1, 0, 0, 5, 0.000, 0, 4, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642377, 1610612763, 27, 25, 2, 2, 2, 0, 2, 10, 13, 0.769, 3, 5, 0.600, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642383, 1610612763, 25, 9, 4, 6, 0, 0, 2, 4, 11, 0.364, 1, 6, 0.167, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642907, 1610612763, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642914, 1610612763, 25, 10, 1, 1, 2, 1, 0, 3, 4, 0.750, 2, 2, 1.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500813', 1642942, 1610612763, 22, 0, 3, 1, 0, 2, 0, 0, 6, 0.000, 0, 3, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1627824, 1610612741, 24, 12, 9, 8, 0, 1, 3, 3, 7, 0.429, 2, 4, 0.500, 4, 5, 0.800, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1629012, 1610612741, 15, 2, 2, 1, 2, 0, 1, 1, 5, 0.200, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1629014, 1610612741, 12, 4, 2, 0, 0, 0, 1, 2, 6, 0.333, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630171, 1610612741, 33, 15, 3, 3, 1, 1, 1, 5, 12, 0.417, 3, 6, 0.500, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630172, 1610612741, 15, 6, 1, 1, 2, 0, 0, 2, 5, 0.400, 2, 4, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630188, 1610612741, 24, 15, 7, 2, 0, 3, 1, 5, 6, 0.833, 3, 4, 0.750, 2, 3, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630200, 1610612741, 25, 7, 2, 6, 2, 0, 1, 3, 7, 0.429, 0, 1, 0.000, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630208, 1610612741, 19, 5, 5, 0, 0, 1, 5, 2, 6, 0.333, 0, 2, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630581, 1610612741, 27, 27, 6, 3, 0, 1, 5, 10, 16, 0.625, 5, 8, 0.625, 2, 5, 0.400, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1631159, 1610612741, 2, 0, 0, 1, 0, 0, 0, 0, 1, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1641824, 1610612741, 30, 15, 6, 3, 2, 6, 4, 5, 10, 0.500, 2, 7, 0.286, 3, 4, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1642265, 1610612741, 8, 2, 1, 1, 1, 0, 1, 0, 3, 0.000, 0, 1, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 202699, 1610612765, 30, 18, 6, 1, 4, 0, 1, 8, 14, 0.571, 2, 5, 0.400, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1627747, 1610612765, 17, 7, 0, 2, 0, 2, 2, 2, 7, 0.286, 1, 2, 0.500, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1628989, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1629130, 1610612765, 23, 17, 3, 2, 0, 0, 1, 5, 12, 0.417, 5, 10, 0.500, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1629750, 1610612765, 16, 2, 3, 1, 0, 0, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630191, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630194, 1610612765, 19, 15, 9, 0, 1, 1, 1, 7, 11, 0.636, 0, 0, 0.000, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1630595, 1610612765, 30, 18, 9, 13, 1, 3, 1, 7, 16, 0.438, 3, 6, 0.500, 1, 1, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1631105, 1610612765, 28, 26, 13, 2, 1, 0, 0, 12, 20, 0.600, 0, 0, 0.000, 2, 5, 0.400, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1631204, 1610612765, 2, 3, 0, 1, 0, 0, 1, 1, 1, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1641709, 1610612765, 32, 8, 3, 8, 3, 0, 2, 4, 12, 0.333, 0, 1, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1641842, 1610612765, 17, 9, 4, 2, 2, 0, 4, 3, 5, 0.600, 0, 2, 0.000, 3, 3, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1642404, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1642449, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500814', 1642450, 1610612765, 21, 3, 0, 2, 0, 0, 1, 1, 6, 0.167, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 201566, 1610612758, 21, 7, 3, 2, 1, 1, 5, 3, 9, 0.333, 1, 4, 0.250, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 201942, 1610612758, 34, 20, 1, 5, 2, 1, 2, 5, 13, 0.385, 0, 1, 0.000, 10, 10, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 203926, 1610612758, 5, 8, 1, 1, 1, 0, 0, 2, 3, 0.667, 2, 3, 0.667, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1628370, 1610612758, 27, 19, 1, 6, 1, 0, 1, 8, 16, 0.500, 3, 9, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1629234, 1610612758, 14, 6, 4, 4, 1, 1, 0, 3, 6, 0.500, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1630173, 1610612758, 21, 14, 3, 4, 1, 0, 0, 6, 9, 0.667, 1, 1, 1.000, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1631099, 1610612758, 35, 20, 2, 2, 1, 1, 1, 7, 16, 0.438, 2, 8, 0.250, 4, 5, 0.800, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1631342, 1610612758, 17, 4, 2, 1, 1, 2, 1, 1, 1, 1.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1642269, 1610612758, 5, 0, 1, 1, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1642363, 1610612758, 29, 8, 5, 4, 2, 0, 1, 4, 9, 0.444, 0, 3, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1642875, 1610612758, 26, 16, 12, 3, 0, 1, 1, 6, 14, 0.429, 0, 2, 0.000, 4, 4, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1642928, 1610612758, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 202687, 1610612759, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 203084, 1610612759, 20, 14, 2, 1, 0, 0, 0, 5, 9, 0.556, 3, 7, 0.429, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 203482, 1610612759, 5, 4, 2, 1, 0, 0, 2, 2, 3, 0.667, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1628368, 1610612759, 27, 18, 2, 5, 1, 0, 5, 7, 11, 0.636, 1, 3, 0.333, 3, 4, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1628436, 1610612759, 12, 4, 5, 3, 1, 1, 0, 1, 1, 1.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1629162, 1610612759, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1629640, 1610612759, 20, 18, 1, 0, 0, 0, 1, 6, 12, 0.500, 3, 4, 0.750, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1630170, 1610612759, 23, 8, 3, 3, 0, 1, 2, 3, 7, 0.429, 2, 3, 0.667, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1630577, 1610612759, 27, 8, 4, 3, 1, 0, 0, 3, 7, 0.429, 2, 6, 0.333, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1630649, 1610612759, 4, 2, 0, 1, 1, 0, 0, 1, 2, 0.500, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1631127, 1610612759, 4, 2, 0, 1, 0, 0, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1641705, 1610612759, 29, 28, 15, 6, 1, 4, 1, 11, 20, 0.550, 1, 5, 0.200, 5, 7, 0.714, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1642264, 1610612759, 24, 18, 8, 3, 0, 1, 2, 6, 9, 0.667, 0, 1, 0.000, 6, 8, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1642844, 1610612759, 23, 12, 5, 5, 0, 0, 2, 5, 9, 0.556, 0, 1, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500815', 1642868, 1610612759, 10, 3, 1, 0, 0, 0, 2, 1, 3, 0.333, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 201142, 1610612745, 38, 30, 6, 3, 0, 0, 4, 10, 26, 0.385, 4, 10, 0.400, 6, 7, 0.857, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 201145, 1610612745, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 203991, 1610612745, 11, 4, 1, 0, 1, 1, 0, 1, 2, 0.500, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1627827, 1610612745, 21, 2, 3, 0, 0, 0, 2, 1, 4, 0.250, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1628988, 1610612745, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1629006, 1610612745, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1630256, 1610612745, 4, 0, 0, 0, 0, 0, 0, 0, 1, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1630578, 1610612745, 31, 16, 6, 6, 0, 3, 6, 6, 12, 0.500, 1, 1, 1.000, 3, 4, 0.750, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1631095, 1610612745, 35, 21, 4, 1, 1, 1, 1, 8, 13, 0.615, 4, 8, 0.500, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1631106, 1610612745, 34, 11, 12, 4, 0, 0, 2, 4, 8, 0.500, 1, 4, 0.250, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1641708, 1610612745, 41, 12, 10, 7, 3, 1, 3, 5, 9, 0.556, 0, 2, 0.000, 2, 4, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1642263, 1610612745, 21, 10, 2, 3, 0, 0, 1, 3, 5, 0.600, 2, 4, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1642384, 1610612745, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 203903, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1626157, 1610612752, 34, 25, 7, 1, 1, 0, 2, 10, 15, 0.667, 3, 3, 1.000, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1628384, 1610612752, 40, 20, 2, 1, 4, 0, 1, 8, 16, 0.500, 2, 7, 0.286, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1628404, 1610612752, 27, 2, 6, 6, 1, 0, 4, 1, 7, 0.143, 0, 3, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1628969, 1610612752, 31, 11, 6, 5, 0, 0, 0, 5, 11, 0.455, 1, 2, 0.500, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1628973, 1610612752, 35, 20, 3, 6, 0, 0, 3, 6, 12, 0.500, 0, 1, 0.000, 8, 9, 0.889, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1629011, 1610612752, 17, 6, 4, 0, 0, 0, 1, 3, 5, 0.600, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1629013, 1610612752, 25, 14, 0, 2, 0, 0, 0, 5, 7, 0.714, 2, 4, 0.500, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1630574, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1630631, 1610612752, 19, 8, 1, 4, 5, 0, 0, 3, 9, 0.333, 2, 5, 0.400, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1631110, 1610612752, 4, 0, 0, 0, 0, 0, 0, 0, 2, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1641755, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1642278, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1642359, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500816', 1642885, 1610612752, 4, 2, 0, 1, 0, 0, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 201935, 1610612739, 33, 20, 5, 9, 1, 1, 5, 8, 14, 0.571, 3, 7, 0.429, 1, 2, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 203471, 1610612739, 22, 11, 4, 7, 1, 1, 2, 3, 9, 0.333, 1, 2, 0.500, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1626204, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1628378, 1610612739, 35, 20, 7, 5, 2, 0, 3, 9, 19, 0.474, 0, 6, 0.000, 2, 3, 0.667, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1628386, 1610612739, 28, 11, 13, 2, 1, 0, 3, 4, 6, 0.667, 0, 0, 0.000, 3, 6, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1628418, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1629731, 1610612739, 17, 0, 3, 1, 0, 1, 1, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1630241, 1610612739, 28, 20, 3, 0, 0, 0, 0, 7, 12, 0.583, 6, 10, 0.600, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1630596, 1610612739, 25, 15, 2, 1, 1, 0, 1, 6, 11, 0.545, 1, 4, 0.250, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1631165, 1610612739, 23, 9, 1, 3, 2, 0, 1, 4, 7, 0.571, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1641772, 1610612739, 9, 0, 2, 0, 0, 0, 0, 0, 3, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1641854, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1642281, 1610612739, 15, 7, 4, 0, 1, 0, 1, 2, 7, 0.286, 1, 4, 0.250, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1642468, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1642878, 1610612739, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1628392, 1610612760, 25, 13, 7, 4, 0, 0, 1, 6, 6, 1.000, 0, 0, 0.000, 1, 4, 0.250, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1629026, 1610612760, 18, 8, 2, 1, 0, 0, 1, 3, 3, 1.000, 2, 2, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1629652, 1610612760, 35, 12, 3, 2, 2, 0, 2, 5, 11, 0.455, 2, 6, 0.333, 0, 2, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1630198, 1610612760, 30, 22, 2, 3, 5, 0, 3, 6, 13, 0.462, 6, 11, 0.545, 4, 4, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1630598, 1610612760, 22, 7, 3, 4, 0, 0, 1, 3, 7, 0.429, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1631096, 1610612760, 34, 17, 15, 4, 1, 3, 2, 5, 14, 0.357, 1, 4, 0.250, 6, 9, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1631119, 1610612760, 16, 10, 3, 0, 0, 1, 1, 3, 6, 0.500, 3, 5, 0.600, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1631205, 1610612760, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1641717, 1610612760, 33, 20, 4, 10, 3, 0, 1, 7, 17, 0.412, 4, 8, 0.500, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1642260, 1610612760, 7, 2, 2, 3, 0, 0, 3, 1, 2, 0.500, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1642272, 1610612760, 15, 10, 3, 1, 1, 0, 1, 3, 7, 0.429, 2, 3, 0.667, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500817', 1642964, 1610612760, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 203468, 1610612737, 31, 16, 8, 4, 1, 0, 3, 5, 12, 0.417, 3, 7, 0.429, 3, 4, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1627741, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1629111, 1610612737, 16, 17, 6, 1, 1, 1, 1, 6, 11, 0.545, 3, 3, 1.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1629216, 1610612737, 11, 3, 1, 3, 1, 0, 1, 1, 2, 0.500, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1629638, 1610612737, 35, 17, 3, 6, 2, 0, 1, 4, 12, 0.333, 3, 9, 0.333, 6, 6, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1630168, 1610612737, 31, 13, 11, 1, 0, 2, 2, 5, 7, 0.714, 1, 2, 0.500, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1630552, 1610612737, 37, 26, 12, 4, 0, 1, 4, 11, 22, 0.500, 0, 3, 0.000, 4, 5, 0.800, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1630557, 1610612737, 12, 9, 0, 0, 0, 0, 1, 4, 5, 0.800, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1630700, 1610612737, 33, 7, 10, 8, 3, 0, 0, 3, 8, 0.375, 0, 2, 0.000, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1630811, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1631243, 1610612737, 10, 0, 0, 1, 1, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1642258, 1610612737, 19, 7, 1, 0, 1, 0, 2, 3, 7, 0.429, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1642854, 1610612737, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1629008, 1610612751, 34, 18, 7, 6, 0, 0, 0, 8, 19, 0.421, 1, 8, 0.125, 1, 1, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1629611, 1610612751, 17, 6, 1, 0, 0, 0, 1, 2, 3, 0.667, 2, 3, 0.667, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1629651, 1610612751, 30, 15, 8, 5, 1, 0, 1, 6, 11, 0.545, 0, 1, 0.000, 3, 5, 0.600, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1630534, 1610612751, 14, 6, 1, 1, 0, 1, 1, 2, 4, 0.500, 2, 3, 0.667, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1630549, 1610612751, 17, 11, 5, 2, 2, 1, 3, 4, 6, 0.667, 0, 0, 0.000, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1630592, 1610612751, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1641730, 1610612751, 31, 12, 5, 1, 2, 0, 0, 3, 8, 0.375, 2, 6, 0.333, 4, 4, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1642849, 1610612751, 34, 11, 1, 5, 2, 0, 5, 4, 14, 0.286, 1, 3, 0.333, 2, 4, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1642856, 1610612751, 28, 13, 1, 4, 1, 1, 1, 5, 11, 0.455, 2, 5, 0.400, 1, 2, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1642874, 1610612751, 18, 5, 4, 4, 1, 1, 1, 2, 4, 0.500, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500818', 1642962, 1610612751, 13, 7, 1, 1, 0, 0, 0, 2, 5, 0.400, 1, 2, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 203648, 1610612749, 4, 3, 1, 0, 0, 0, 0, 1, 1, 1.000, 0, 0, 0.000, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 203914, 1610612749, 6, 2, 0, 0, 0, 0, 0, 1, 3, 0.333, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1626167, 1610612749, 24, 14, 4, 1, 0, 2, 2, 6, 11, 0.545, 2, 7, 0.286, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1626171, 1610612749, 17, 6, 7, 1, 0, 0, 0, 3, 8, 0.375, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1628398, 1610612749, 18, 3, 4, 1, 0, 0, 1, 1, 3, 0.333, 0, 2, 0.000, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1629018, 1610612749, 6, 0, 0, 0, 0, 0, 0, 0, 3, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1629645, 1610612749, 30, 21, 2, 10, 3, 0, 1, 8, 11, 0.727, 1, 1, 1.000, 4, 6, 0.667, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1630560, 1610612749, 21, 15, 3, 1, 0, 0, 2, 5, 9, 0.556, 1, 2, 0.500, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1630579, 1610612749, 23, 4, 7, 2, 0, 1, 2, 2, 3, 0.667, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1631157, 1610612749, 33, 21, 9, 1, 1, 1, 5, 6, 17, 0.353, 4, 7, 0.571, 5, 6, 0.833, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1631172, 1610612749, 14, 0, 5, 0, 0, 0, 3, 0, 4, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1631250, 1610612749, 5, 0, 0, 0, 0, 0, 0, 0, 2, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1631260, 1610612749, 25, 3, 1, 1, 0, 0, 0, 1, 6, 0.167, 1, 4, 0.250, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1641748, 1610612749, 6, 2, 3, 0, 0, 0, 1, 1, 4, 0.250, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 202066, 1610612761, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1627742, 1610612761, 31, 22, 2, 6, 0, 2, 2, 8, 17, 0.471, 2, 6, 0.333, 4, 6, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1627751, 1610612761, 25, 6, 8, 2, 2, 0, 0, 3, 4, 0.750, 0, 0, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1629628, 1610612761, 26, 7, 6, 3, 2, 0, 1, 2, 10, 0.200, 0, 3, 0.000, 3, 4, 0.750, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1630193, 1610612761, 30, 32, 3, 9, 1, 0, 1, 11, 19, 0.579, 5, 11, 0.455, 5, 5, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1630572, 1610612761, 22, 15, 4, 4, 1, 0, 0, 6, 12, 0.500, 3, 8, 0.375, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1631218, 1610612761, 2, 2, 1, 0, 0, 1, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1641711, 1610612761, 16, 4, 2, 1, 1, 0, 1, 1, 6, 0.167, 0, 2, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1642266, 1610612761, 30, 9, 6, 3, 0, 0, 0, 3, 10, 0.300, 3, 8, 0.375, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1642347, 1610612761, 22, 12, 6, 6, 2, 0, 0, 4, 9, 0.444, 2, 6, 0.333, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1642419, 1610612761, 8, 5, 3, 0, 0, 0, 0, 2, 2, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500819', 1642867, 1610612761, 19, 8, 4, 0, 2, 0, 1, 3, 4, 0.750, 0, 1, 0.000, 2, 4, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 202685, 1610612743, 12, 6, 3, 2, 1, 0, 0, 3, 7, 0.429, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 203501, 1610612743, 24, 8, 1, 0, 1, 0, 2, 3, 9, 0.333, 1, 6, 0.167, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 203999, 1610612743, 35, 35, 20, 12, 3, 2, 5, 11, 21, 0.524, 3, 4, 0.750, 10, 11, 0.909, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1627750, 1610612743, 33, 21, 2, 2, 1, 0, 5, 9, 17, 0.529, 1, 6, 0.167, 2, 3, 0.667, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1628971, 1610612743, 29, 12, 5, 2, 3, 0, 2, 5, 10, 0.500, 2, 3, 0.667, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1629661, 1610612743, 37, 9, 3, 2, 0, 0, 0, 1, 7, 0.143, 0, 4, 0.000, 7, 7, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1630192, 1610612743, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1631124, 1610612743, 18, 6, 3, 2, 1, 1, 0, 2, 7, 0.286, 0, 3, 0.000, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1631128, 1610612743, 35, 18, 5, 2, 2, 0, 3, 7, 11, 0.636, 1, 4, 0.250, 3, 4, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1641747, 1610612743, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1642354, 1610612743, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1642461, 1610612743, 12, 2, 2, 1, 1, 0, 0, 1, 2, 0.500, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 201143, 1610612744, 26, 22, 1, 7, 3, 2, 2, 8, 11, 0.727, 6, 7, 0.857, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 203110, 1610612744, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 203552, 1610612744, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 204001, 1610612744, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1627780, 1610612744, 19, 15, 3, 0, 2, 0, 3, 6, 11, 0.545, 3, 8, 0.375, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1629001, 1610612744, 24, 20, 4, 2, 4, 0, 0, 7, 18, 0.389, 2, 10, 0.200, 4, 4, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1630311, 1610612744, 18, 2, 0, 5, 1, 0, 2, 1, 3, 0.333, 0, 2, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1630541, 1610612744, 35, 23, 7, 5, 1, 0, 2, 9, 16, 0.563, 4, 9, 0.444, 1, 1, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1630611, 1610612744, 27, 17, 5, 7, 1, 0, 2, 6, 7, 0.857, 2, 3, 0.667, 3, 4, 0.750, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1641764, 1610612744, 36, 18, 15, 9, 1, 0, 3, 7, 16, 0.438, 3, 7, 0.429, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1642366, 1610612744, 20, 0, 7, 4, 0, 0, 1, 0, 3, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500820', 1642954, 1610612744, 29, 11, 2, 3, 1, 0, 0, 4, 9, 0.444, 1, 4, 0.250, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 202691, 1610612742, 18, 9, 3, 0, 1, 0, 0, 3, 11, 0.273, 3, 7, 0.429, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 203114, 1610612742, 29, 25, 7, 7, 1, 0, 2, 11, 15, 0.733, 3, 5, 0.600, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 203939, 1610612742, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1626145, 1610612742, 11, 2, 0, 3, 0, 0, 0, 1, 4, 0.250, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1628963, 1610612742, 26, 12, 11, 1, 1, 0, 0, 5, 9, 0.556, 0, 0, 0.000, 2, 4, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1628997, 1610612742, 17, 7, 4, 1, 1, 0, 1, 3, 5, 0.600, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1629023, 1610612742, 36, 23, 9, 2, 1, 1, 1, 8, 14, 0.571, 1, 4, 0.250, 6, 8, 0.750, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1629655, 1610612742, 21, 8, 6, 2, 1, 0, 0, 3, 7, 0.429, 0, 0, 0.000, 2, 4, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1630230, 1610612742, 25, 17, 2, 2, 1, 0, 2, 7, 10, 0.700, 0, 1, 0.000, 3, 6, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1630314, 1610612742, 21, 15, 1, 7, 2, 1, 2, 4, 8, 0.500, 1, 3, 0.333, 6, 8, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1631108, 1610612742, 30, 16, 2, 4, 0, 0, 3, 6, 11, 0.545, 2, 4, 0.500, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1642358, 1610612742, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1642939, 1610612742, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 204456, 1610612754, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1627783, 1610612754, 29, 30, 8, 3, 0, 0, 5, 12, 19, 0.632, 2, 3, 0.667, 4, 5, 0.800, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1629614, 1610612754, 29, 22, 1, 11, 1, 0, 1, 7, 14, 0.500, 3, 6, 0.500, 5, 5, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1630174, 1610612754, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1630643, 1610612754, 26, 9, 1, 1, 1, 3, 0, 4, 10, 0.400, 0, 6, 0.000, 1, 1, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1630695, 1610612754, 21, 2, 6, 5, 2, 0, 4, 1, 7, 0.143, 0, 4, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1631245, 1610612754, 22, 11, 4, 6, 0, 0, 1, 4, 9, 0.444, 3, 4, 0.750, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1641716, 1610612754, 34, 18, 9, 6, 2, 0, 2, 6, 13, 0.462, 4, 7, 0.571, 2, 5, 0.400, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1641738, 1610612754, 18, 15, 7, 0, 1, 0, 1, 5, 9, 0.556, 3, 4, 0.750, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1641767, 1610612754, 27, 13, 3, 2, 0, 0, 0, 4, 9, 0.444, 3, 6, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500821', 1642880, 1610612754, 30, 10, 0, 3, 1, 0, 1, 4, 4, 1.000, 2, 2, 1.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1630264, 1610612764, 30, 8, 5, 4, 1, 0, 2, 4, 5, 0.800, 0, 1, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1630536, 1610612764, 22, 9, 3, 3, 1, 0, 1, 3, 5, 0.600, 1, 2, 0.500, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1630551, 1610612764, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1630702, 1610612764, 21, 16, 4, 1, 0, 1, 0, 5, 10, 0.500, 4, 8, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1631214, 1610612764, 34, 8, 7, 3, 1, 0, 2, 3, 5, 0.600, 2, 3, 0.667, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1641731, 1610612764, 17, 17, 2, 2, 1, 2, 0, 6, 9, 0.667, 3, 4, 0.750, 2, 4, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1641774, 1610612764, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1642267, 1610612764, 30, 6, 3, 2, 0, 0, 3, 2, 10, 0.200, 1, 6, 0.167, 1, 2, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1642273, 1610612764, 17, 13, 2, 1, 1, 1, 0, 4, 9, 0.444, 2, 4, 0.500, 3, 3, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1642364, 1610612764, 16, 13, 4, 1, 0, 1, 0, 5, 10, 0.500, 3, 7, 0.429, 0, 1, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1642848, 1610612764, 19, 11, 1, 3, 0, 0, 3, 5, 10, 0.500, 1, 3, 0.333, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1642860, 1610612764, 30, 11, 6, 4, 1, 0, 0, 4, 11, 0.364, 1, 4, 0.250, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1626192, 1610612766, 11, 2, 3, 0, 0, 0, 0, 1, 3, 0.333, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1628970, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1629684, 1610612766, 25, 5, 4, 5, 0, 2, 2, 1, 4, 0.250, 1, 3, 0.333, 2, 3, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1630163, 1610612766, 27, 37, 8, 7, 1, 0, 0, 12, 20, 0.600, 10, 15, 0.667, 3, 3, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1630182, 1610612766, 23, 12, 4, 1, 2, 0, 0, 4, 6, 0.667, 2, 4, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1630214, 1610612766, 3, 0, 1, 0, 0, 0, 1, 0, 1, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1630544, 1610612766, 20, 6, 0, 3, 2, 0, 0, 2, 8, 0.250, 0, 3, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1631217, 1610612766, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1641706, 1610612766, 26, 22, 4, 3, 1, 0, 2, 8, 14, 0.571, 5, 7, 0.714, 1, 2, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1641750, 1610612766, 15, 6, 9, 2, 0, 3, 0, 2, 3, 0.667, 0, 0, 0.000, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1641790, 1610612766, 16, 2, 5, 1, 1, 0, 2, 0, 4, 0.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1642275, 1610612766, 20, 9, 2, 1, 1, 0, 0, 3, 3, 1.000, 2, 2, 1.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1642851, 1610612766, 28, 28, 7, 4, 1, 0, 3, 10, 18, 0.556, 5, 9, 0.556, 3, 5, 0.600, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500822', 1642883, 1610612766, 21, 0, 6, 0, 0, 0, 2, 0, 3, 0.000, 0, 2, 0.000, 0, 2, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 202696, 1610612738, 20, 9, 8, 0, 1, 0, 0, 4, 6, 0.667, 0, 0, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1627759, 1610612738, 36, 32, 8, 7, 3, 0, 5, 10, 28, 0.357, 3, 9, 0.333, 9, 12, 0.750, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1628401, 1610612738, 35, 12, 5, 8, 1, 1, 1, 5, 13, 0.385, 2, 6, 0.333, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1629674, 1610612738, 25, 10, 12, 1, 0, 3, 2, 4, 5, 0.800, 0, 0, 0.000, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1630202, 1610612738, 37, 30, 4, 8, 0, 0, 4, 10, 14, 0.714, 6, 9, 0.667, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1630568, 1610612738, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1630573, 1610612738, 28, 7, 6, 2, 0, 0, 0, 2, 6, 0.333, 2, 6, 0.333, 1, 1, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1630625, 1610612738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1631199, 1610612738, 1, 2, 0, 0, 0, 0, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1631248, 1610612738, 28, 5, 2, 2, 0, 0, 0, 2, 6, 0.333, 1, 4, 0.250, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1641775, 1610612738, 7, 0, 1, 0, 0, 1, 2, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1642864, 1610612738, 14, 4, 3, 1, 1, 0, 0, 2, 3, 0.667, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1642873, 1610612738, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1642910, 1610612738, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 2544, 1610612747, 34, 20, 4, 5, 2, 1, 1, 9, 21, 0.429, 1, 5, 0.200, 1, 1, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 203935, 1610612747, 22, 0, 1, 4, 0, 0, 0, 0, 7, 0.000, 0, 5, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1628379, 1610612747, 21, 9, 3, 0, 1, 0, 1, 3, 4, 0.750, 1, 2, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1628467, 1610612747, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 2, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1629020, 1610612747, 11, 3, 5, 0, 0, 0, 1, 1, 3, 0.333, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1629028, 1610612747, 24, 4, 7, 1, 1, 1, 1, 2, 6, 0.333, 0, 0, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1629029, 1610612747, 32, 25, 5, 3, 0, 1, 2, 9, 22, 0.409, 4, 7, 0.571, 3, 6, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1629060, 1610612747, 21, 5, 2, 0, 0, 0, 0, 2, 7, 0.286, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1629637, 1610612747, 5, 2, 1, 0, 0, 0, 0, 1, 2, 0.500, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1630559, 1610612747, 32, 15, 7, 2, 2, 1, 1, 4, 10, 0.400, 1, 4, 0.250, 6, 7, 0.857, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1631222, 1610612747, 24, 4, 3, 2, 1, 1, 1, 2, 2, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1641723, 1610612747, 3, 2, 0, 0, 0, 0, 0, 1, 2, 0.500, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500823', 1642261, 1610612747, 3, 0, 1, 0, 0, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 201144, 1610612750, 15, 0, 1, 4, 0, 1, 0, 0, 2, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 203497, 1610612750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 203944, 1610612750, 31, 18, 3, 3, 1, 1, 2, 5, 10, 0.500, 1, 5, 0.200, 7, 10, 0.700, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 204060, 1610612750, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1628978, 1610612750, 27, 11, 6, 3, 0, 0, 4, 4, 6, 0.667, 3, 5, 0.600, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1629675, 1610612750, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1630162, 1610612750, 34, 28, 9, 3, 2, 2, 7, 11, 19, 0.579, 3, 8, 0.375, 3, 5, 0.600, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1630183, 1610612750, 34, 19, 6, 2, 1, 3, 3, 5, 12, 0.417, 0, 4, 0.000, 9, 9, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1630245, 1610612750, 28, 12, 5, 4, 0, 0, 1, 4, 8, 0.500, 2, 3, 0.667, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1630538, 1610612750, 14, 3, 4, 2, 2, 1, 1, 1, 5, 0.200, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1630545, 1610612750, 18, 6, 0, 0, 0, 0, 0, 1, 4, 0.250, 0, 1, 0.000, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1641740, 1610612750, 8, 2, 1, 0, 0, 0, 1, 1, 3, 0.333, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1641763, 1610612750, 3, 2, 0, 0, 1, 0, 1, 0, 0, 0.000, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1642866, 1610612750, 16, 7, 3, 0, 0, 0, 0, 2, 2, 1.000, 0, 0, 0.000, 3, 4, 0.750, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1642911, 1610612750, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 200768, 1610612755, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 203083, 1610612755, 21, 6, 9, 2, 1, 0, 1, 2, 3, 0.667, 0, 0, 0.000, 2, 4, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1626162, 1610612755, 35, 18, 5, 2, 4, 0, 2, 5, 13, 0.385, 3, 7, 0.429, 5, 7, 0.714, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1626166, 1610612755, 11, 3, 2, 3, 2, 0, 0, 1, 5, 0.200, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1629656, 1610612755, 27, 19, 3, 7, 1, 0, 1, 7, 12, 0.583, 5, 8, 0.625, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1630178, 1610612755, 35, 39, 3, 8, 2, 1, 5, 16, 28, 0.571, 4, 7, 0.571, 3, 5, 0.600, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1630570, 1610612755, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1631133, 1610612755, 11, 0, 1, 0, 0, 0, 0, 0, 2, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1631207, 1610612755, 3, 3, 1, 0, 1, 0, 0, 1, 1, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1631213, 1610612755, 3, 2, 0, 1, 0, 0, 0, 1, 1, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1631230, 1610612755, 27, 8, 3, 3, 1, 0, 0, 3, 7, 0.429, 0, 1, 0.000, 2, 3, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1641737, 1610612755, 19, 8, 5, 2, 0, 0, 0, 4, 4, 1.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1642348, 1610612755, 3, 5, 0, 0, 0, 0, 0, 2, 3, 0.667, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500824', 1642845, 1610612755, 36, 24, 7, 1, 2, 0, 1, 8, 18, 0.444, 6, 7, 0.857, 2, 2, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1627824, 1610612741, 29, 11, 13, 1, 0, 0, 1, 4, 8, 0.500, 3, 6, 0.500, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1629012, 1610612741, 12, 8, 1, 0, 2, 0, 1, 2, 5, 0.400, 2, 4, 0.500, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630171, 1610612741, 33, 12, 6, 1, 0, 0, 2, 4, 10, 0.400, 3, 7, 0.429, 1, 1, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630172, 1610612741, 27, 10, 1, 8, 0, 1, 1, 3, 8, 0.375, 2, 7, 0.286, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630188, 1610612741, 18, 12, 5, 1, 1, 0, 2, 5, 11, 0.455, 2, 6, 0.333, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630200, 1610612741, 22, 8, 1, 3, 1, 0, 1, 4, 9, 0.444, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630208, 1610612741, 23, 9, 13, 0, 0, 1, 3, 3, 6, 0.500, 0, 1, 0.000, 3, 5, 0.600, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630581, 1610612741, 22, 6, 2, 6, 2, 0, 2, 2, 10, 0.200, 0, 3, 0.000, 2, 3, 0.667, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630644, 1610612741, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1631159, 1610612741, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1641824, 1610612741, 25, 15, 4, 0, 0, 0, 3, 4, 12, 0.333, 3, 9, 0.333, 4, 5, 0.800, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1642265, 1610612741, 24, 8, 4, 4, 2, 0, 1, 3, 7, 0.429, 1, 2, 0.500, 1, 3, 0.333, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1642530, 1610612741, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1642950, 1610612741, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 203903, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1626157, 1610612752, 32, 28, 11, 2, 3, 0, 3, 10, 17, 0.588, 5, 9, 0.556, 3, 4, 0.750, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1628384, 1610612752, 33, 9, 9, 2, 2, 1, 1, 4, 11, 0.364, 0, 4, 0.000, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1628404, 1610612752, 32, 11, 9, 5, 0, 0, 2, 4, 5, 0.800, 1, 1, 1.000, 2, 4, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1628969, 1610612752, 30, 11, 2, 5, 2, 1, 3, 4, 10, 0.400, 3, 8, 0.375, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1628973, 1610612752, 36, 19, 5, 9, 0, 1, 2, 7, 19, 0.368, 1, 6, 0.167, 4, 6, 0.667, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1629013, 1610612752, 23, 16, 2, 0, 0, 0, 2, 5, 9, 0.556, 4, 8, 0.500, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630574, 1610612752, 15, 4, 5, 0, 2, 1, 0, 1, 3, 0.333, 0, 0, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1630631, 1610612752, 25, 5, 4, 2, 0, 0, 0, 2, 8, 0.250, 1, 6, 0.167, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1631110, 1610612752, 11, 2, 3, 2, 0, 0, 0, 1, 2, 0.500, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1641794, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1641998, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1642278, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500825', 1642885, 1610612752, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1626220, 1610612756, 24, 0, 7, 0, 1, 1, 2, 0, 5, 0.000, 0, 4, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1629599, 1610612756, 23, 8, 4, 4, 2, 0, 0, 3, 7, 0.429, 0, 2, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1630224, 1610612756, 22, 13, 3, 1, 3, 0, 1, 6, 16, 0.375, 1, 7, 0.143, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1630587, 1610612756, 12, 2, 1, 0, 0, 0, 0, 0, 4, 0.000, 0, 2, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1631109, 1610612756, 15, 6, 5, 0, 1, 0, 1, 3, 8, 0.375, 0, 0, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1631123, 1610612756, 21, 8, 2, 3, 2, 1, 1, 3, 8, 0.375, 0, 1, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1631221, 1610612756, 33, 18, 3, 3, 1, 0, 6, 7, 14, 0.500, 4, 8, 0.500, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1642345, 1610612756, 17, 4, 2, 3, 1, 1, 4, 2, 3, 0.667, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1642346, 1610612756, 30, 2, 6, 2, 1, 0, 1, 1, 9, 0.111, 0, 4, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1642853, 1610612756, 21, 6, 1, 0, 2, 0, 2, 2, 4, 0.500, 2, 4, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1642863, 1610612756, 16, 7, 7, 0, 0, 0, 1, 3, 5, 0.600, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1642886, 1610612756, 1, 3, 0, 0, 0, 0, 0, 1, 2, 0.500, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 201950, 1610612757, 28, 6, 5, 7, 1, 0, 6, 3, 12, 0.250, 0, 4, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 203924, 1610612757, 30, 23, 2, 1, 1, 1, 0, 9, 13, 0.692, 3, 6, 0.500, 2, 3, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1629057, 1610612757, 15, 4, 5, 0, 1, 2, 1, 2, 3, 0.667, 0, 1, 0.000, 0, 2, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1629680, 1610612757, 11, 3, 3, 0, 1, 0, 2, 1, 2, 0.500, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1630166, 1610612757, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1630249, 1610612757, 17, 0, 3, 1, 0, 2, 1, 0, 5, 0.000, 0, 4, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1630703, 1610612757, 29, 11, 4, 6, 0, 1, 4, 4, 14, 0.286, 1, 6, 0.167, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1631101, 1610612757, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1631104, 1610612757, 1, 2, 0, 0, 0, 0, 0, 1, 2, 0.500, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1631200, 1610612757, 22, 6, 2, 1, 2, 0, 1, 3, 5, 0.600, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1631321, 1610612757, 15, 2, 0, 2, 2, 0, 1, 1, 3, 0.333, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1641739, 1610612757, 34, 12, 10, 2, 1, 1, 0, 5, 9, 0.556, 2, 6, 0.333, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500826', 1642270, 1610612757, 31, 23, 13, 3, 1, 4, 5, 9, 13, 0.692, 3, 6, 0.500, 2, 4, 0.500, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 201572, 1610612746, 22, 10, 4, 1, 1, 0, 0, 3, 6, 0.500, 1, 1, 1.000, 3, 3, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 201587, 1610612746, 13, 0, 3, 2, 1, 1, 0, 0, 2, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 202695, 1610612746, 32, 37, 8, 4, 3, 2, 3, 14, 25, 0.560, 2, 7, 0.286, 7, 9, 0.778, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 203992, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1627739, 1610612746, 33, 7, 5, 0, 2, 0, 1, 2, 2, 1.000, 0, 0, 0.000, 3, 4, 0.750, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1627884, 1610612746, 32, 6, 3, 3, 1, 1, 1, 3, 12, 0.250, 0, 5, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1630543, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1631097, 1610612746, 30, 21, 9, 5, 0, 0, 2, 7, 16, 0.438, 1, 5, 0.200, 6, 7, 0.857, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1631102, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1641757, 1610612746, 23, 14, 1, 1, 0, 1, 1, 5, 7, 0.714, 0, 0, 0.000, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1642353, 1610612746, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1642920, 1610612746, 26, 7, 2, 2, 1, 0, 0, 3, 6, 0.500, 0, 1, 0.000, 1, 1, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1642949, 1610612746, 26, 7, 8, 0, 0, 4, 1, 3, 7, 0.429, 1, 2, 0.500, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1628371, 1610612753, 14, 5, 4, 1, 0, 2, 0, 2, 4, 0.500, 0, 0, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1628975, 1610612753, 18, 0, 2, 4, 1, 1, 0, 0, 1, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1628976, 1610612753, 33, 15, 14, 3, 0, 0, 5, 6, 14, 0.429, 0, 1, 0.000, 3, 3, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1629021, 1610612753, 10, 9, 2, 1, 2, 0, 1, 4, 7, 0.571, 0, 0, 0.000, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1629048, 1610612753, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1630217, 1610612753, 32, 36, 5, 1, 2, 0, 1, 13, 19, 0.684, 4, 6, 0.667, 6, 10, 0.600, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1631094, 1610612753, 37, 16, 7, 8, 0, 0, 2, 6, 16, 0.375, 0, 1, 0.000, 4, 5, 0.800, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1631288, 1610612753, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1641710, 1610612753, 36, 11, 2, 1, 1, 0, 2, 4, 9, 0.444, 1, 4, 0.250, 2, 4, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1641724, 1610612753, 17, 2, 4, 2, 0, 0, 1, 0, 4, 0.000, 0, 4, 0.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1641783, 1610612753, 29, 13, 2, 2, 1, 0, 0, 3, 6, 0.500, 3, 6, 0.500, 4, 4, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1642859, 1610612753, 9, 4, 1, 2, 0, 0, 0, 2, 3, 0.667, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500827', 1642869, 1610612753, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 202687, 1610612759, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 203084, 1610612759, 15, 3, 2, 1, 0, 0, 0, 1, 4, 0.250, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 203482, 1610612759, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1628368, 1610612759, 33, 10, 7, 7, 2, 0, 2, 4, 17, 0.235, 0, 5, 0.000, 2, 4, 0.500, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1628436, 1610612759, 8, 2, 4, 0, 1, 0, 0, 1, 3, 0.333, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1629162, 1610612759, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1629640, 1610612759, 22, 9, 4, 0, 1, 0, 0, 4, 11, 0.364, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1630170, 1610612759, 36, 28, 2, 4, 0, 1, 1, 10, 14, 0.714, 7, 11, 0.636, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1630322, 1610612759, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1630577, 1610612759, 36, 17, 6, 1, 1, 2, 1, 6, 12, 0.500, 5, 8, 0.625, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1641705, 1610612759, 35, 21, 17, 4, 1, 6, 3, 6, 16, 0.375, 2, 5, 0.400, 7, 8, 0.875, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1642264, 1610612759, 30, 16, 4, 11, 1, 1, 4, 7, 16, 0.438, 1, 1, 1.000, 1, 3, 0.333, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1642844, 1610612759, 17, 5, 2, 3, 1, 0, 0, 2, 7, 0.286, 0, 1, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1642868, 1610612759, 4, 3, 2, 1, 0, 1, 1, 1, 1, 1.000, 1, 1, 1.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 202699, 1610612765, 29, 4, 8, 2, 0, 0, 2, 1, 6, 0.167, 0, 1, 0.000, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1627747, 1610612765, 21, 5, 1, 1, 1, 1, 4, 2, 4, 0.500, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1628989, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1629130, 1610612765, 26, 13, 3, 5, 0, 0, 0, 5, 15, 0.333, 3, 11, 0.273, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1629750, 1610612765, 13, 0, 0, 0, 0, 1, 0, 0, 5, 0.000, 0, 3, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1630191, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1630194, 1610612765, 19, 10, 5, 0, 1, 2, 1, 5, 8, 0.625, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1630595, 1610612765, 34, 16, 6, 10, 2, 3, 3, 5, 26, 0.192, 2, 9, 0.222, 4, 5, 0.800, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1631105, 1610612765, 29, 25, 14, 1, 2, 0, 3, 10, 13, 0.769, 0, 0, 0.000, 5, 6, 0.833, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1631204, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1641709, 1610612765, 17, 8, 4, 2, 0, 0, 2, 4, 6, 0.667, 0, 0, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1641842, 1610612765, 26, 15, 11, 0, 1, 1, 0, 5, 13, 0.385, 1, 6, 0.167, 4, 4, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1642404, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1642449, 1610612765, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500828', 1642450, 1610612765, 21, 7, 3, 0, 0, 0, 0, 3, 10, 0.300, 0, 2, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 201566, 1610612758, 32, 25, 2, 7, 1, 0, 4, 8, 17, 0.471, 3, 7, 0.429, 6, 7, 0.857, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 201942, 1610612758, 28, 19, 2, 4, 2, 2, 0, 7, 9, 0.778, 0, 0, 0.000, 5, 6, 0.833, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 203926, 1610612758, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1628370, 1610612758, 19, 10, 0, 2, 2, 1, 5, 4, 10, 0.400, 1, 4, 0.250, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1629234, 1610612758, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1630165, 1610612758, 10, 0, 0, 4, 0, 0, 0, 0, 4, 0.000, 0, 4, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1630173, 1610612758, 32, 22, 12, 0, 1, 1, 2, 10, 15, 0.667, 0, 0, 0.000, 2, 3, 0.667, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1631099, 1610612758, 34, 6, 5, 5, 0, 3, 1, 2, 10, 0.200, 1, 4, 0.250, 1, 3, 0.333, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1631342, 1610612758, 25, 19, 5, 1, 0, 0, 1, 6, 12, 0.500, 4, 9, 0.444, 3, 4, 0.750, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642363, 1610612758, 28, 12, 6, 5, 6, 0, 2, 5, 8, 0.625, 1, 1, 1.000, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642875, 1610612758, 27, 10, 13, 2, 0, 0, 0, 5, 9, 0.556, 0, 0, 0.000, 0, 0, 0.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642928, 1610612758, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 203937, 1610612763, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1630590, 1610612763, 21, 6, 2, 8, 5, 0, 7, 0, 8, 0.000, 0, 4, 0.000, 6, 6, 1.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1641707, 1610612763, 25, 12, 3, 1, 1, 1, 1, 5, 10, 0.500, 2, 5, 0.400, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1641712, 1610612763, 26, 10, 9, 1, 3, 0, 1, 5, 9, 0.556, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1641713, 1610612763, 25, 16, 6, 1, 0, 1, 2, 6, 12, 0.500, 3, 4, 0.750, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1641765, 1610612763, 25, 17, 3, 1, 0, 1, 0, 7, 9, 0.778, 0, 1, 0.000, 3, 3, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642285, 1610612763, 21, 7, 3, 3, 1, 0, 0, 3, 7, 0.429, 1, 3, 0.333, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642377, 1610612763, 25, 12, 3, 2, 1, 0, 2, 5, 11, 0.455, 0, 4, 0.000, 2, 2, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642383, 1610612763, 20, 9, 1, 6, 1, 0, 2, 3, 7, 0.429, 2, 5, 0.400, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642907, 1610612763, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642914, 1610612763, 25, 21, 6, 9, 0, 0, 1, 6, 8, 0.750, 4, 5, 0.800, 5, 6, 0.833, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500829', 1642942, 1610612763, 22, 4, 1, 1, 1, 0, 1, 2, 6, 0.333, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 201142, 1610612745, 34, 18, 5, 12, 1, 1, 4, 7, 13, 0.538, 4, 6, 0.667, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 201145, 1610612745, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0.000, 0, 1, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 203991, 1610612745, 10, 2, 3, 1, 0, 0, 1, 1, 3, 0.333, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1627827, 1610612745, 20, 3, 4, 0, 0, 0, 1, 1, 4, 0.250, 1, 4, 0.250, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1628988, 1610612745, 5, 7, 2, 0, 0, 0, 0, 2, 2, 1.000, 1, 1, 1.000, 2, 2, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1629006, 1610612745, 12, 2, 1, 1, 1, 0, 1, 1, 4, 0.250, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1630578, 1610612745, 35, 16, 9, 9, 1, 2, 3, 7, 12, 0.583, 0, 1, 0.000, 2, 2, 1.000, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1631095, 1610612745, 32, 31, 9, 0, 3, 3, 4, 12, 17, 0.706, 6, 11, 0.545, 1, 2, 0.500, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1631106, 1610612745, 31, 11, 10, 4, 1, 1, 3, 5, 12, 0.417, 1, 5, 0.200, 0, 0, 0.000, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1641708, 1610612745, 29, 20, 7, 3, 2, 1, 6, 8, 9, 0.889, 0, 0, 0.000, 4, 5, 0.800, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1642263, 1610612745, 23, 15, 3, 4, 1, 0, 3, 5, 9, 0.556, 5, 9, 0.556, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1642384, 1610612745, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 201567, 1610612762, 24, 5, 9, 5, 0, 1, 0, 2, 8, 0.250, 1, 6, 0.167, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1628374, 1610612762, 32, 29, 3, 2, 2, 0, 2, 10, 23, 0.435, 1, 10, 0.100, 8, 8, 1.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1629004, 1610612762, 10, 3, 0, 1, 0, 0, 0, 1, 3, 0.333, 0, 2, 0.000, 1, 1, 1.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1629723, 1610612762, 24, 5, 4, 2, 3, 0, 1, 2, 4, 0.500, 1, 3, 0.333, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1631131, 1610612762, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1631246, 1610612762, 7, 1, 3, 1, 1, 0, 1, 0, 4, 0.000, 0, 4, 0.000, 1, 2, 0.500, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1641729, 1610612762, 31, 26, 3, 1, 0, 1, 1, 10, 15, 0.667, 4, 8, 0.500, 2, 3, 0.667, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1641989, 1610612762, 14, 0, 0, 4, 2, 0, 0, 0, 3, 0.000, 0, 2, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1642262, 1610612762, 14, 2, 0, 0, 0, 0, 0, 1, 3, 0.333, 0, 0, 0.000, 0, 0, 0.000, 'F', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1642268, 1610612762, 29, 17, 1, 3, 2, 0, 0, 4, 16, 0.250, 0, 5, 0.000, 9, 10, 0.900, 'G', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1642271, 1610612762, 23, 13, 5, 4, 5, 1, 6, 4, 10, 0.400, 1, 2, 0.500, 4, 6, 0.667, 'C', NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1642396, 1610612762, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.000, 0, 0, 0.000, 0, 0, 0.000, NULL, NOW());
INSERT INTO player_game_stats (game_id, player_id, team_id, minutes, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted, fg_pct, fg3_made, fg3_attempted, fg3_pct, ft_made, ft_attempted, ft_pct, start_position, created_at)
VALUES ('0022500830', 1642846, 1610612762, 27, 4, 8, 0, 2, 0, 0, 2, 9, 0.222, 0, 2, 0.000, 0, 0, 0.000, 'G', NOW());

COMMIT;
-- Total: 764 players, 1020 stat records
