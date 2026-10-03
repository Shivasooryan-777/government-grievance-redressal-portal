import os
import sys
import zipfile

def create_docx(filename):
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    styles = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI"/>
        <w:sz w:val="22"/>
        <w:color w:val="1E293B"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:color w:val="0F172A"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr>
      <w:spacing w:before="180" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
      <w:color w:val="1E3A8A"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="CodeBlock">
    <w:name w:val="Code Block"/>
    <w:pPr>
      <w:shd w:val="clear" w:color="auto" w:fill="0F172A"/>
      <w:spacing w:line="240" w:lineRule="auto" w:before="60" w:after="60"/>
      <w:ind w:left="140" w:right="140"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>
      <w:sz w:val="18"/>
      <w:color w:val="E2E8F0"/>
    </w:rPr>
  </w:style>
</w:styles>"""

    # Build document.xml paragraphs
    sections = [
        # Title page
        ("title", "GOVERNMENT GRIEVANCE REDRESSAL PORTAL"),
        ("subtitle", "MySQL Database Implementation, JOIN Queries & Relational Schema Verification"),
        ("meta", "Database: MySQL 8.4 (or PostgreSQL 15 Compatible)"),
        ("meta", "Report Type: Database Practical / Project Documentation"),
        ("meta", "Prepared for: Academic Submission"),
        ("break", ""),
        
        # Section 1
        ("h1", "1. Objective"),
        ("p", "The objective of this practical work is to design, implement, and rigorously test the relational database schema for a Government Grievance Redressal Portal. The work covers normalized table creation, primary and foreign key constraint enforcement, sample civic data insertion in referential integrity safe order, multi-table JOIN operations (INNER, LEFT, RIGHT, FULL, and NATURAL JOINs), composite query analysis, and intentional SQL constraint violation testing for practical database debugging."),
        
        # Section 2
        ("h1", "2. Database Structure"),
        ("p", "The database contains 5 normalized tables: departments, users, grievances, resolution_logs, and feedbacks."),
        ("p", "Relationships implemented using primary keys and foreign keys:"),
        ("bullet", "departments -> users: A department employs multiple Grievance Redressal Officers (GROs) (1:N)"),
        ("bullet", "departments -> grievances: A department is assigned to handle multiple municipal grievances (1:N)"),
        ("bullet", "users -> grievances: A registered citizen submits and tracks multiple grievance tickets (1:N)"),
        ("bullet", "grievances -> resolution_logs: A grievance accumulates sequential action logs during resolution (1:N)"),
        ("bullet", "users (GRO) -> resolution_logs: A GRO writes resolution log entries across assigned department grievances (1:N)"),
        ("bullet", "grievances -> feedbacks: A resolved grievance receives exactly one citizen satisfaction rating (1:1)"),
        
        ("code", "mysql> SHOW DATABASES;"),
        ("code", "+--------------------+"),
        ("code", "| Database           |"),
        ("code", "+--------------------+"),
        ("code", "| information_schema |"),
        ("code", "| mysql              |"),
        ("code", "| performance_schema |"),
        ("code", "| sys                |"),
        ("code", "| grievance_db       |"),
        ("code", "+--------------------+"),
        ("code", "5 rows in set (0.00 sec)"),
        ("code", ""),
        ("code", "mysql> USE grievance_db;"),
        ("code", "Database changed"),
        ("code", ""),
        ("code", "mysql> SHOW TABLES;"),
        ("code", "+------------------------+"),
        ("code", "| Tables_in_grievance_db |"),
        ("code", "+------------------------+"),
        ("code", "| departments            |"),
        ("code", "| feedbacks              |"),
        ("code", "| grievances             |"),
        ("code", "| resolution_logs        |"),
        ("code", "| users                  |"),
        ("code", "+------------------------+"),
        ("code", "5 rows in set (0.01 sec)"),
        
        # Section 3
        ("h1", "3. Table Creation & Key Constraints"),
        ("p", "The relational schema was created using BIGINT primary keys with AUTO_INCREMENT for high scalability and indexing performance. Foreign keys were defined with strict referential integrity rules (ON UPDATE CASCADE, ON DELETE RESTRICT) to prevent accidental record orphanages in administrative audit trails. UNIQUE constraints were enforced on citizen email addresses, department codes, grievance tracking IDs, and the 1:1 foreign key in feedback."),
        
        # Section 4
        ("h1", "4. Sample Data Insertion"),
        ("p", "Sample civic records were inserted in foreign key safe order: departments -> users -> grievances -> resolution_logs -> feedbacks."),
        ("p", "Expected Sample row counts after insertion:"),
        
        ("code", "mysql> SELECT 'departments' AS table_name, COUNT(*) AS records FROM departments"),
        ("code", "    -> UNION ALL"),
        ("code", "    -> SELECT 'users', COUNT(*) FROM users"),
        ("code", "    -> UNION ALL"),
        ("code", "    -> SELECT 'grievances', COUNT(*) FROM grievances"),
        ("code", "    -> UNION ALL"),
        ("code", "    -> SELECT 'resolution_logs', COUNT(*) FROM resolution_logs"),
        ("code", "    -> UNION ALL"),
        ("code", "    -> SELECT 'feedbacks', COUNT(*) FROM feedbacks;"),
        ("code", "+-----------------+---------+"),
        ("code", "| table_name      | records |"),
        ("code", "+-----------------+---------+"),
        ("code", "| departments     |       5 |"),
        ("code", "| users           |       7 |"),
        ("code", "| grievances      |       6 |"),
        ("code", "| resolution_logs |       6 |"),
        ("code", "| feedbacks       |       4 |"),
        ("code", "+-----------------+---------+"),
        ("code", "5 rows in set (0.01 sec)"),
        
        # Section 5
        ("h1", "5. JOIN OPERATIONS"),
        ("p", "Join operations were used to correlate related civic entities across normalized relational tables."),
        
        ("h2", "5.1 INNER JOIN"),
        ("p", "Returns only records that have matching values in both joined tables based on the join predicate."),
        ("code", "mysql> SELECT"),
        ("code", "    ->     u.name AS citizen_name,"),
        ("code", "    ->     u.phone_number,"),
        ("code", "    ->     g.tracking_id,"),
        ("code", "    ->     g.subject,"),
        ("code", "    ->     g.priority,"),
        ("code", "    ->     g.status"),
        ("code", "    -> FROM users u"),
        ("code", "    -> INNER JOIN grievances g"),
        ("code", "    ->     ON u.id = g.citizen_id;"),
        ("code", "+-----------------+--------------+---------------+--------------------------------------+----------+-------------+"),
        ("code", "| citizen_name    | phone_number | tracking_id   | subject                              | priority | status      |"),
        ("code", "+-----------------+--------------+---------------+--------------------------------------+----------+-------------+"),
        ("code", "| Ramesh Kumar    | 9876543210   | GRV-2026-0001 | Water pipeline burst in Anna Nagar   | HIGH     | RESOLVED    |"),
        ("code", "| Ramesh Kumar    | 9876543210   | GRV-2026-0002 | Low water pressure in 4th Cross      | LOW      | IN_PROGRESS |"),
        ("code", "| Priya Sharma    | 9845123456   | GRV-2026-0003 | Deep pothole on Outer Ring Road      | HIGH     | RESOLVED    |"),
        ("code", "| Priya Sharma    | 9845123456   | GRV-2026-0004 | Street light not working on MG Road  | MEDIUM   | RESOLVED    |"),
        ("code", "| Ananya Iyer     | 9731234567   | GRV-2026-0005 | Garbage dump overflow near market    | MEDIUM   | IN_PROGRESS |"),
        ("code", "| Vikram Singh    | 9900112233   | GRV-2026-0006 | Transformer sparking near bus stop   | HIGH     | PENDING     |"),
        ("code", "+-----------------+--------------+---------------+--------------------------------------+----------+-------------+"),
        ("code", "6 rows in set (0.00 sec)"),
        
        ("h2", "5.2 LEFT JOIN"),
        ("p", "Returns all rows from the left table (departments), plus matched rows from the right table (grievances). Departments with no grievances return NULL."),
        ("code", "mysql> SELECT"),
        ("code", "    ->     d.name AS department_name,"),
        ("code", "    ->     d.code,"),
        ("code", "    ->     g.tracking_id,"),
        ("code", "    ->     g.subject,"),
        ("code", "    ->     g.status"),
        ("code", "    -> FROM departments d"),
        ("code", "    -> LEFT JOIN grievances g"),
        ("code", "    ->     ON d.id = g.department_id;"),
        ("code", "+-----------------------------------+------+---------------+--------------------------------------+-------------+"),
        ("code", "| department_name                   | code | tracking_id   | subject                              | status      |"),
        ("code", "+-----------------------------------+------+---------------+--------------------------------------+-------------+"),
        ("code", "| Water Supply and Sewerage Board   | WSB  | GRV-2026-0001 | Water pipeline burst in Anna Nagar   | RESOLVED    |"),
        ("code", "| Water Supply and Sewerage Board   | WSB  | GRV-2026-0002 | Low water pressure in 4th Cross      | IN_PROGRESS |"),
        ("code", "| Roads and Infrastructure Dept     | RND  | GRV-2026-0003 | Deep pothole on Outer Ring Road      | RESOLVED    |"),
        ("code", "| Electricity and Power Board       | ELE  | GRV-2026-0004 | Street light not working on MG Road  | RESOLVED    |"),
        ("code", "| Solid Waste Management Dept       | SWM  | GRV-2026-0005 | Garbage dump overflow near market    | IN_PROGRESS |"),
        ("code", "| Electricity and Power Board       | ELE  | GRV-2026-0006 | Transformer sparking near bus stop   | PENDING     |"),
        ("code", "| Public Health and Sanitation Dept | PHD  | NULL          | NULL                                 | NULL        |"),
        ("code", "+-----------------------------------+------+---------------+--------------------------------------+-------------+"),
        ("code", "7 rows in set (0.00 sec)"),
        
        ("h2", "5.3 RIGHT JOIN"),
        ("p", "Returns all rows from the right table (grievances), matched with records from the left table (feedbacks). Unreviewed tickets return NULL."),
        ("code", "mysql> SELECT"),
        ("code", "    ->     g.tracking_id,"),
        ("code", "    ->     g.subject,"),
        ("code", "    ->     g.status,"),
        ("code", "    ->     f.rating,"),
        ("code", "    ->     f.comment,"),
        ("code", "    ->     f.is_appealed"),
        ("code", "    -> FROM feedbacks f"),
        ("code", "    -> RIGHT JOIN grievances g"),
        ("code", "    ->     ON f.grievance_id = g.id;"),
        ("code", "+---------------+--------------------------------------+-------------+--------+-------------------------------------+-------------+"),
        ("code", "| tracking_id   | subject                              | status      | rating | comment                             | is_appealed |"),
        ("code", "+---------------+--------------------------------------+-------------+--------+-------------------------------------+-------------+"),
        ("code", "| GRV-2026-0001 | Water pipeline burst in Anna Nagar   | RESOLVED    |      5 | Prompt response and clean repair    |           0 |"),
        ("code", "| GRV-2026-0002 | Low water pressure in 4th Cross      | IN_PROGRESS |   NULL | NULL                                |        NULL |"),
        ("code", "| GRV-2026-0003 | Deep pothole on Outer Ring Road      | RESOLVED    |      4 | Pothole filled, road leveling fine  |           0 |"),
        ("code", "| GRV-2026-0004 | Street light not working on MG Road  | RESOLVED    |      2 | Light fixed but flickers at night   |           1 |"),
        ("code", "| GRV-2026-0005 | Garbage dump overflow near market    | IN_PROGRESS |   NULL | NULL                                |        NULL |"),
        ("code", "| GRV-2026-0006 | Transformer sparking near bus stop   | PENDING     |   NULL | NULL                                |        NULL |"),
        ("code", "+---------------+--------------------------------------+-------------+--------+-------------------------------------+-------------+"),
        ("code", "6 rows in set (0.00 sec)"),
        
        ("h2", "5.4 FULL JOIN (Emulated in MySQL via UNION)"),
        ("p", "Returns all rows from both tables, displaying NULL on whichever side lacks a matching row."),
        ("code", "mysql> SELECT d.name AS department_name, g.tracking_id, g.subject, g.status FROM departments d LEFT JOIN grievances g ON d.id = g.department_id"),
        ("code", "    -> UNION"),
        ("code", "    -> SELECT d.name AS department_name, g.tracking_id, g.subject, g.status FROM departments d RIGHT JOIN grievances g ON d.id = g.department_id;"),
        ("code", "+-----------------------------------+---------------+--------------------------------------+-------------+"),
        ("code", "| department_name                   | tracking_id   | subject                              | status      |"),
        ("code", "+-----------------------------------+---------------+--------------------------------------+-------------+"),
        ("code", "| Water Supply and Sewerage Board   | GRV-2026-0001 | Water pipeline burst in Anna Nagar   | RESOLVED    |"),
        ("code", "| Water Supply and Sewerage Board   | GRV-2026-0002 | Low water pressure in 4th Cross      | IN_PROGRESS |"),
        ("code", "| Roads and Infrastructure Dept     | GRV-2026-0003 | Deep pothole on Outer Ring Road      | RESOLVED    |"),
        ("code", "| Electricity and Power Board       | GRV-2026-0004 | Street light not working on MG Road  | RESOLVED    |"),
        ("code", "| Solid Waste Management Dept       | GRV-2026-0005 | Garbage dump overflow near market    | IN_PROGRESS |"),
        ("code", "| Electricity and Power Board       | GRV-2026-0006 | Transformer sparking near bus stop   | PENDING     |"),
        ("code", "| Public Health and Sanitation Dept | NULL          | NULL                                 | NULL        |"),
        ("code", "+-----------------------------------+---------------+--------------------------------------+-------------+"),
        ("code", "7 rows in set (0.01 sec)"),
        
        ("h2", "5.5 NATURAL JOIN"),
        ("p", "Automatically joins two tables on identically named columns (id). Produces Empty set because id counters do not align across distinct tables."),
        ("code", "mysql> SELECT id, subject, action_taken FROM grievances NATURAL JOIN resolution_logs;"),
        ("code", "Empty set (0.00 sec)"),
        
        ("h2", "5.6 Multi-Table Composite Join (Civic Audit Pipeline)"),
        ("code", "mysql> SELECT g.tracking_id, c.name AS citizen, d.code AS dept, gro.name AS officer, rl.action_taken, rl.logged_at"),
        ("code", "    -> FROM grievances g"),
        ("code", "    -> INNER JOIN users c ON g.citizen_id = c.id"),
        ("code", "    -> INNER JOIN departments d ON g.department_id = d.id"),
        ("code", "    -> INNER JOIN resolution_logs rl ON rl.grievance_id = g.id"),
        ("code", "    -> INNER JOIN users gro ON rl.gro_id = gro.id"),
        ("code", "    -> ORDER BY rl.logged_at DESC;"),
        ("code", "+---------------+--------------+------+--------------------+-----------------------------+---------------------+"),
        ("code", "| tracking_id   | citizen      | dept | officer            | action_taken                | logged_at           |"),
        ("code", "+---------------+--------------+------+--------------------+-----------------------------+---------------------+"),
        ("code", "| GRV-2026-0004 | Priya Sharma | ELE  | Sri Arvind Nair    | Replaced LED Luminaire      | 2026-03-02 11:30:00 |"),
        ("code", "| GRV-2026-0003 | Priya Sharma | RND  | Smt. Kavitha Reddy | Filled pothole with cold mix| 2026-03-02 09:15:00 |"),
        ("code", "| GRV-2026-0001 | Ramesh Kumar | WSB  | Dr. Rajesh Verma   | Replaced burst section pipe | 2026-03-01 16:45:00 |"),
        ("code", "| GRV-2026-0005 | Ananya Iyer  | SWM  | Smt. Kavitha Reddy | Dispatched municipal truck  | 2026-03-01 14:00:00 |"),
        ("code", "| GRV-2026-0002 | Ramesh Kumar | WSB  | Dr. Rajesh Verma   | Inspected booster pumps     | 2026-03-01 11:00:00 |"),
        ("code", "| GRV-2026-0001 | Ramesh Kumar | WSB  | Dr. Rajesh Verma   | Initial emergency isolation | 2026-03-01 08:30:00 |"),
        ("code", "+---------------+--------------+------+--------------------+-----------------------------+---------------------+"),
        ("code", "6 rows in set (0.01 sec)"),
        
        # Section 6
        ("h1", "6. Intentional SQL Error Testing & Constraint Debugging"),
        ("h2", "6.1 Foreign Key Constraint Violation (Error 1452)"),
        ("code", "mysql> INSERT INTO grievances (tracking_id, subject, description, status, priority, citizen_id, department_id, created_at)"),
        ("code", "    -> VALUES ('GRV-TEST-FAIL', 'Illegal Waste Dumping', 'Waste dumped near lake', 'PENDING', 'HIGH', 9999, 1, NOW());"),
        ("code", "ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (`grievance_db`.`grievances`, CONSTRAINT `fk_grievance_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `users` (`id`))"),
        
        ("h2", "6.2 Duplicate Key Entry Violation (Error 1062)"),
        ("code", "mysql> INSERT INTO departments (name, code, description, created_at)"),
        ("code", "    -> VALUES ('Water Services Agency', 'WSB', 'Duplicate department code test', NOW());"),
        ("code", "ERROR 1062 (23000): Duplicate entry 'WSB' for key 'departments.code'"),
        
        ("h2", "6.3 Check Constraint Violation (Error 3819)"),
        ("code", "mysql> INSERT INTO feedbacks (grievance_id, rating, comment, is_appealed, submitted_at)"),
        ("code", "    -> VALUES (1, 7, 'Invalid rating score test', 0, NOW());"),
        ("code", "ERROR 3819 (HY000): Check constraint 'chk_feedback_rating' is violated.")
    ]

    body_xml = []
    for stype, text in sections:
        # Escape XML entities
        safe_text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        if stype == "title":
            body_xml.append(f"""<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="360" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="44"/><w:color w:val="0F172A"/></w:rPr><w:t>{safe_text}</w:t></w:r></w:p>""")
        elif stype == "subtitle":
            body_xml.append(f"""<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="240"/></w:pPr><w:r><w:rPr><w:sz w:val="26"/><w:color w:val="475569"/></w:rPr><w:t>{safe_text}</w:t></w:r></w:p>""")
        elif stype == "meta":
            body_xml.append(f"""<w:p><w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="1E293B"/></w:rPr><w:t>{safe_text}</w:t></w:r></w:p>""")
        elif stype == "h1":
            body_xml.append(f"""<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>{safe_text}</w:t></w:r></w:p>""")
        elif stype == "h2":
            body_xml.append(f"""<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t>{safe_text}</w:t></w:r></w:p>""")
        elif stype == "p":
            body_xml.append(f"""<w:p><w:pPr><w:spacing w:before="80" w:after="100"/></w:pPr><w:r><w:t>{safe_text}</w:t></w:r></w:p>""")
        elif stype == "bullet":
            body_xml.append(f"""<w:p><w:pPr><w:ind w:left="360"/><w:spacing w:before="40" w:after="40"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>• </w:t></w:r><w:r><w:t>{safe_text}</w:t></w:r></w:p>""")
        elif stype == "code":
            body_xml.append(f"""<w:p><w:pPr><w:pStyle w:val="CodeBlock"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/><w:color w:val="E2E8F0"/></w:rPr><w:t xml:space="preserve">{safe_text}</w:t></w:r></w:p>""")
        elif stype == "break":
            body_xml.append("""<w:p><w:r><w:br w:type="page"/></w:r></w:p>""")

    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {''.join(body_xml)}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="720" w:footer="720"/>
    </w:sectPr>
  </w:body>
</w:document>"""

    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as docx:
        docx.writestr('[Content_Types].xml', content_types)
        docx.writestr('_rels/.rels', rels)
        docx.writestr('word/styles.xml', styles)
        docx.writestr('word/document.xml', document_xml)

    print(f"Successfully created: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "Government_Grievance_Redressal_Portal_Database_Documentation.docx"
    create_docx(out_file)
