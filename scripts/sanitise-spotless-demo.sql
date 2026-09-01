-- Replaces every personal identifier in the spotless_demo copy with invented
-- stand-ins, so the dashboard can be screenshotted for a public portfolio
-- without publishing a real person's name, photo, government ID or salary
-- attribution. The production database is untouched.

SET @first := 'Abel,Bethlehem,Dawit,Eyerusalem,Fikru,Genet,Habtamu,Iman,Kalkidan,Lemlem,Mekdes,Nardos,Obang,Rahel,Samuel,Tigist,Yonas,Zewditu,Amanuel,Birtukan,Chala,Dagmawit,Elias,Feven,Girma,Hanna,Israel,Kidist,Liya,Mahlet';
SET @father := 'Abera,Bekele,Chane,Desta,Endale,Fantahun,Gebre,Haile,Kebede,Lemma,Mengistu,Negash,Olana,Petros,Regassa,Solomon,Tadesse,Wolde,Yimer,Zeleke';
SET @grand := 'Alemu,Berhanu,Damte,Emiru,Fekadu,Getachew,Hailu,Jemal,Kassa,Mamo,Nigussie,Oljira,Retta,Shiferaw,Teshome,Worku,Yohannes,Zerihun';

-- Names: picked deterministically from the lists by row id, so the same
-- employee keeps the same invented name everywhere it is displayed.
UPDATE employee
SET name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@first, ',', 1 + (id % 30)), ',', -1)),
    father_name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@father, ',', 1 + (id % 20)), ',', -1)),
    grand_father_name = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@grand, ',', 1 + (id % 18)), ',', -1)),
    -- Photographs and scanned government IDs are the worst of it: they render
    -- straight into the employee screens as real faces and real documents.
    photo = '',
    govt_id = '',
    signiture = '',
    pension_card = '',
    tin_no = CONCAT('000', LPAD(id, 6, '0')),
    id_no = CONCAT('SP', LPAD(id, 3, '0')),
    birth_date = DATE_SUB(birth_date, INTERVAL (id % 400) DAY);

UPDATE employee_guarantor
SET name = CONCAT(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@first, ',', 1 + (id % 30)), ',', -1)), ' ',
                  TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@father, ',', 1 + (id % 20)), ',', -1)))
WHERE name IS NOT NULL;

-- Client companies and the sites they contract for.
UPDATE customers
SET name = CONCAT(ELT(1 + (id % 10), 'Abyssinia', 'Bishoftu', 'Chercher', 'Danakil', 'Entoto',
                                     'Fincha', 'Gojjam', 'Harar', 'Jimma', 'Kaffa'),
                  ' ', ELT(1 + (id % 6), 'Trading PLC', 'Manufacturing PLC', 'Hotels PLC',
                                          'Logistics PLC', 'Real Estate PLC', 'Industries PLC')),
    phone = CONCAT('+2519', LPAD(10000000 + (id * 7919) % 89999999, 8, '0')),
    email = CONCAT('office', id, '@example.com'),
    tin_no = CONCAT('000', LPAD(id, 6, '0'));

UPDATE site
SET name = CONCAT(ELT(1 + (id % 8), 'Bole', 'Kazanchis', 'Piassa', 'Megenagna', 'Gerji',
                                     'Summit', 'Lebu', 'Ayat'), ' ', ELT(1 + (id % 4), 'Branch', 'Tower', 'Campus', 'Warehouse')),
    phone = CONCAT('+2519', LPAD(10000000 + (id * 6271) % 89999999, 8, '0'));

-- Free-text contact details: phone numbers and email addresses.
UPDATE staff_contacts SET contact_detail = CONCAT('+2519', LPAD(10000000 + (id * 5471) % 89999999, 8, '0'));
UPDATE customer_contacts SET contact_detail = CONCAT('+2519', LPAD(10000000 + (id * 4231) % 89999999, 8, '0'));
UPDATE site_contacts SET contact_detail = CONCAT('+2519', LPAD(10000000 + (id * 3739) % 89999999, 8, '0'));

UPDATE staff_families
SET name = CONCAT(TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@first, ',', 1 + (id % 30)), ',', -1)), ' ',
                  TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(@father, ',', 1 + (id % 20)), ',', -1)))
WHERE name IS NOT NULL;

SELECT 'employees' AS what, COUNT(*) AS n FROM employee
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'sites', COUNT(*) FROM site
UNION ALL SELECT 'photos left', COUNT(*) FROM employee WHERE photo <> '';
