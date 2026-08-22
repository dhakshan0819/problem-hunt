import time
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models import Admin, EventConfiguration, Quest, Team, TeamProgress, ScoreEvent, PhysicalToken
from app.security import hash_password, normalize_and_hash_answer

def seed_database(db: Session):
    # Auto-migrate SQLite schema if new column image_url is missing
    try:
        db.execute(text("ALTER TABLE quests ADD COLUMN image_url TEXT;"))
        db.commit()
    except Exception:
        db.rollback()


    # 1. Event Config
    config = db.query(EventConfiguration).first()
    if not config:
        config = EventConfiguration(
            id=1,
            event_name="CODE HUNT 2026",
            club_name="Programming Club",
            starting_score=1000,
            starting_lives=3,
            hints_per_team=2,
            hint_cost=200,
            wrong_penalty=50,
            completion_points=500,
            final_bonus=1000,
            lockout_seconds=15,
            leaderboard_enabled=True,
            physical_treasure_mode=False,
            final_physical_clue="SEARCH BENEATH DESK 10 IN ROOM D311 (BUILDING D)",
            event_status="WAITING"
        )
        db.add(config)
    else:
        config.lockout_seconds = 15
        db.commit()

    # 2. Admin User
    admin = db.query(Admin).filter_by(username="admin").first()
    if not admin:
        admin = Admin(
            username="admin",
            password_hash=hash_password("admin123")
        )
        db.add(admin)

    # 3. Official 18 Quests (Coding, Pictography, UI/UX, Detective Cases, Graphical Quests)
    quests_data = [
        {
            "order_index": 0,
            "slug": "ancient-gate",
            "title": "AWAKEN THE GATE",
            "location_name": "The Ancient Gate | ST-01",
            "description": "The gate has slept for centuries. Its terminal still remembers one command.",
            "narrative": "You stand before an enormous sealed stone archway. An ancient metallic console hums faintly beside it, flickering with green light.",
            "challenge_type": "NUMBER_KEYPAD",
            "code_language": "c",
            "code_content": "int x = 5;\nint y = 3;\n\nprintf(\"%d\", x * y + 2);",
            "expected_answer": "17",
            "hint_text": "Apply standard operator precedence: multiplication first, then addition.",
            "fragment_char": "C",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 1,
            "slug": "logic-forest",
            "title": "FOLLOW THE MACHINE'S DECISION",
            "location_name": "Logic Forest | ST-02",
            "description": "A dark branching path lies ahead. A luminescent stone inscription guides the worthy.",
            "narrative": "The trees around you pulse with glowing bioluminescent circuits. Two physical pathways branch into the dark fog.",
            "challenge_type": "PATH_SELECTION",
            "code_language": "python",
            "code_content": "energy = 7\n\nif energy > 5:\n    path = \"RIGHT\"\nelse:\n    path = \"LEFT\"",
            "expected_answer": "RIGHT",
            "hint_text": "Evaluate whether the scalar condition energy > 5 holds true.",
            "fragment_char": "Y",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 2,
            "slug": "loop-chamber",
            "title": "RESTORE THE LOOP CORE",
            "location_name": "Loop Chamber | ST-03",
            "description": "A dormant circular machine sits in the center of the chamber surrounded by energy rings.",
            "narrative": "The air crackles with static electricity. The terminal demands the exact accumulated energy sequence.",
            "challenge_type": "NUMBER_KEYPAD",
            "code_language": "python",
            "code_content": "key = 0\n\nfor i in range(1, 5):\n    key += i",
            "expected_answer": "10",
            "hint_text": "Sum the integer series produced by range(1, 5).",
            "fragment_char": "B",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 3,
            "slug": "pictogram-sanctuary",
            "title": "THE PICTOGRAM REBUS",
            "location_name": "Pictograph Sanctuary | ST-04",
            "description": "Ancient hieroglyphs and visual pictograms are etched into glowing marble pillars.",
            "narrative": "Decode the visual rebus puzzle etched on the sanctuary wall to uncover the network barrier term.",
            "challenge_type": "PICTOGRAM",
            "code_language": "pictogram",
            "code_content": "=== ANCIENT PICTOGRAM REBUS ===\n\n  [ 🔥 FIRE ]  +  [ 🧱 WALL ]  -->  ?\n\n  [ 👁️ EYE ]   +  [ 🔑 KEY ]   -->  EYEKEY\n  [ 🌲 TREE ]  +  [ 🏠 HOUSE ] -->  TREEHOUSE\n\nQuestion: Combine the two pictograms above into a single network defense term!",
            "image_url": "/assets/challenges/pictogram_rebus_sanctuary.png",
            "expected_answer": "FIREWALL",
            "hint_text": "Combine the visual flame element with a protective barrier wall term.",
            "fragment_char": "E",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 4,
            "slug": "insider-threat",
            "title": "DETECTIVE CASE: THE INSIDER BREACH",
            "location_name": "Cyber Crime Scene | ST-05",
            "description": "A server breach occurred at 03:00 AM. System access logs contain crucial evidence.",
            "narrative": "Detective, examine the server access logs below and pinpoint which suspect committed the unauthorized deletion.",
            "challenge_type": "DETECTIVE_CASE",
            "code_language": "detective",
            "code_content": "=== CASE FILE #007: SERVER ACCESS AUDIT ===\n\nLOG 02:45 AM - User ALPHA logged in from 192.168.1.10 [Badge Verified at Desk 4]\nLOG 02:50 AM - User BETA failed password 5 times [Security Cam: At Cafeteria]\nLOG 03:01 AM - User GAMMA executed unauthorized root deletion 'rm -rf /var/logs' from gateway 10.0.0.4!\n\nQuestion: Identify the suspect who executed the unauthorized deletion command.",
            "expected_answer": "GAMMA",
            "hint_text": "Identify the suspect tag attached to the rm -rf execution log entry.",
            "fragment_char": "R",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 5,
            "slug": "prism-core",
            "title": "LOGIC CORE: THE TRUTH MATRIX",
            "location_name": "Prism Core | ST-06",
            "description": "A glowing cybernetic circuit diagram feeds binary signals through AND and OR logic operations.",
            "narrative": "Calculate the binary truth result of the logic expression: (1 AND 1) OR (0 AND 1).",
            "challenge_type": "NUMBER_KEYPAD",
            "code_language": "circuit",
            "code_content": "=== LOGIC CORE EVALUATOR ===\n\nCalculate the binary truth result of:\n  (1 AND 1) OR (0 AND 1)\n\nQuestion: Enter the integer result (0 or 1):",
            "expected_answer": "1",
            "hint_text": "(1 AND 1) is 1, and (0 AND 1) is 0. Then 1 OR 0 evaluates to 1.",
            "fragment_char": "D",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 6,
            "slug": "broken-lab",
            "title": "CODE DEBUGGING CONSOLE",
            "location_name": "Broken Laboratory | ST-07",
            "description": "An abandoned lab terminal displays a broken C comparison condition.",
            "narrative": "Inspect broken_laboratory.c. Locate the assignment bug on Line 2 and select the equality comparison operator fix.",
            "challenge_type": "DEBUG_FIX",
            "code_language": "c",
            "code_content": "int secret = 20;\n\n// BUG: Assignment operator '=' used instead of equality operator!\nif (secret = 20)\n{\n    printf(\"UNLOCK SYSTEM\\n\");\n}\n\nQuestion: Select the correct equality comparison operator:",
            "expected_answer": "==",
            "hint_text": "In C, equality comparison uses two equals signs (==).",
            "fragment_char": "E",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 7,
            "slug": "caesar-note",
            "title": "DETECTIVE CASE: THE ENCODED NOTE",
            "location_name": "Shadow Alley | ST-08",
            "description": "A suspect dropped an encrypted handwritten note in the dark alleyway.",
            "narrative": "Detective, the message is encrypted using a Caesar Shift +3 (A->D, B->E). Shift each letter back by 3 positions to decrypt the secret passphrase.",
            "challenge_type": "DETECTIVE_CASE",
            "code_language": "detective",
            "code_content": "=== CASE FILE #012: EVIDENCE ITEM #39 ===\n\n  CIPHERTEXT: \"KHOOR ZRUOG\"\n\n  Shift Rule: Shift each character BACK by 3 positions in the alphabet (e.g. K -> H).\n\nDecrypt the two secret words.",
            "expected_answer": "HELLO WORLD",
            "hint_text": "Shift each letter back 3 positions in the alphabet sequence.",
            "fragment_char": "T",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 8,
            "slug": "ui-ux-wireframe",
            "title": "UI/UX BUG SPOTTER: THE ALIGNMENT FLAW",
            "location_name": "UI/UX Design Studio | ST-09",
            "description": "Inspect the mobile CSS specification to locate the width property that causes container overflow.",
            "narrative": "Examine the mobile navigation CSS properties below and enter the percentage value that breaks layout bounds.",
            "challenge_type": "PASSWORD",
            "code_language": "ui_ux",
            "code_content": "=== MOBILE NAVBAR CSS SPECIFICATION ===\n\n.nav-container {\n  width: 100%;\n  padding: 20px;\n}\n\n.action-btn {\n  /* BUG: Which CSS width percentage causes button to overflow container bounds? */\n  width: 150%;\n  overflow: visible;\n}\n\nQuestion: Enter the CSS width percentage value that causes overflow:",
            "expected_answer": "150%",
            "hint_text": "Check the width percentage set on .action-btn that exceeds 100%.",
            "fragment_char": "E",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 9,
            "slug": "palette-hex",
            "title": "UI BRANDING: PALETTE DISCOVERY",
            "location_name": "Design Lab | ST-10",
            "description": "A UI design palette specification lists brand color swatches.",
            "narrative": "Analyze the color design tokens below. Enter the hex code of the Accent Color.",
            "challenge_type": "PASSWORD",
            "code_language": "hex_design",
            "code_content": "=== UI BRAND DESIGN SYSTEM ===\n\nPrimary Color:    #0F172A\nSecondary Color:  #06B6D4\nAccent Color:     #F59E0B\n\nQuestion: What is the hex code of the Accent Color?",
            "expected_answer": "#F59E0B",
            "hint_text": "Read the hex code listed under the Accent Color label (#F59E0B).",
            "fragment_char": "C",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 10,
            "slug": "stack-vault",
            "title": "STACK OVERFLOW BOUNDS",
            "location_name": "Stack Vault | ST-11",
            "description": "An out-of-bounds array access threatens system memory integrity.",
            "narrative": "An array is declared as int arr[3] = {10, 20, 30}. What is the 0-based array index used to access the third element 30?",
            "challenge_type": "NUMBER_KEYPAD",
            "code_language": "c",
            "code_content": "int arr[3] = {10, 20, 30};\n\n// Index 0 -> 10\n// Index 1 -> 20\n// Index ? -> 30\n\nQuestion: Enter the 0-based index of element 30 on the keypad:",
            "expected_answer": "2",
            "hint_text": "In C 0-indexed arrays, the third element is located at index 2.",
            "fragment_char": "T",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 11,
            "slug": "bitwise-labyrinth",
            "title": "BITWISE AND HARMONY",
            "location_name": "Bitwise Labyrinth | ST-12",
            "description": "Two binary signals intersect at a bitwise AND junction.",
            "narrative": "Compute the integer result of bitwise AND between 6 (0110) and 3 (0011).",
            "challenge_type": "NUMBER_KEYPAD",
            "code_language": "c",
            "code_content": "int a = 6; // 0110\nint b = 3; // 0011\n\nprintf(\"%d\", a & b);",
            "expected_answer": "2",
            "hint_text": "Compare matching binary bits of 0110 and 0011 using AND logic.",
            "fragment_char": "I",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 12,
            "slug": "cipher-vault",
            "title": "BASE64 SECRET CIPHER",
            "location_name": "Cipher Vault | ST-13",
            "description": "A Base64 encoded string locks the cryptographic doorway.",
            "narrative": "Decode the encoded Base64 payload: 'Q09ERSBIVU5U'.",
            "challenge_type": "PASSWORD",
            "code_language": "crypto",
            "code_content": "ENCODED PAYLOAD: Q09ERSBIVU5U\n\nDecode the Base64 payload into plain text ASCII characters.",
            "expected_answer": "CODE HUNT",
            "hint_text": "Convert the Base64 octets back to ASCII text.",
            "fragment_char": "V",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 13,
            "slug": "recursion-mirror",
            "title": "RECURSION FACTORIAL MIRROR",
            "location_name": "Recursion Mirror | ST-14",
            "description": "A recursive function calls itself in an endless mirror chamber.",
            "narrative": "Determine the output of factorial call f(4).",
            "challenge_type": "NUMBER_KEYPAD",
            "code_language": "python",
            "code_content": "def f(n):\n    return 1 if n <= 1 else n * f(n - 1)\n\nprint(f(4))",
            "expected_answer": "24",
            "hint_text": "Calculate 4 * 3 * 2 * 1.",
            "fragment_char": "!",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 14,
            "slug": "memory-citadel",
            "title": "ARRAY LENGTH DISCOVERY",
            "location_name": "Memory Citadel | ST-15",
            "description": "Calculate total number of string elements stored inside a list.",
            "narrative": "A list contains fruits = ['Apple', 'Banana', 'Cherry', 'Dragonfruit', 'Elderberry']. What is len(fruits)?",
            "challenge_type": "NUMBER_KEYPAD",
            "code_language": "python",
            "code_content": "fruits = [\"Apple\", \"Banana\", \"Cherry\", \"Dragonfruit\", \"Elderberry\"]\n\n# Question: What is the integer return value of len(fruits)?",
            "expected_answer": "5",
            "hint_text": "Count the 5 elements in the list.",
            "fragment_char": "R",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 15,
            "slug": "matrix-nexus",
            "title": "2X2 MATRIX DIAGONAL & DETERMINANT",
            "location_name": "Matrix Nexus | ST-16",
            "description": "A 2x2 matrix lock requires two distinct mathematical inputs.",
            "narrative": "Key I = Sum of main diagonal (1 + 4). Key II = Matrix determinant (ad - bc).",
            "challenge_type": "MULTI_KEY",
            "code_language": "c",
            "code_content": "int m[2][2] = {\n    {1, 2},\n    {3, 4}\n};\n// Key I: Main diagonal sum (1 + 4)\n// Key II: Determinant (1*4 - 2*3)",
            "expected_answer": "5",
            "secondary_expected_answer": "-2",
            "hint_text": "Key I: add elements at (0,0) and (1,1). Key II: calculate (1*4) - (2*3).",
            "fragment_char": "!",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 16,
            "slug": "async-void",
            "title": "PROMISE EVENT LOOP ORDER",
            "location_name": "Asynchronous Void | ST-17",
            "description": "Determine the execution output order of JS event loop and microtasks.",
            "narrative": "Select PATH A (1 3 2) or PATH B (1 2 3) for the code execution flow below.",
            "challenge_type": "PATH_SELECTION",
            "code_language": "javascript",
            "code_content": "console.log(1);\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);",
            "expected_answer": "PATH A",
            "hint_text": "Synchronous statements execute before microtask promise callbacks.",
            "fragment_char": "!",
            "completion_points": 500,
            "wrong_attempt_penalty": 50
        },
        {
            "order_index": 17,
            "slug": "threshold-null",
            "title": "THRESHOLD OF NuLL: BREAK THE FINAL SEAL",
            "location_name": "Threshold of NuLL | ST-18",
            "description": "Standing right before the NuLL Master Boss Fortress. Enter the master passphrase to shatter the final seal.",
            "narrative": "Enter the master secret passphrase 'cyberdetective' to break the final seal and unlock the Boss Arena!",
            "challenge_type": "PASSWORD",
            "code_language": "security",
            "code_content": "=== THRESHOLD OF NuLL: ANCIENT SEAL TERMINAL ===\n\n  [ ANCIENT SEAL STATUS: LOCKED 🔒 ]\n  [ ALL EXPEDITION FRAGMENTS: ASSEMBLED -> C Y B E R D E T E C T I V E ]\n\n  Passphrase Hint: Enter the master secret passphrase:\n  C Y B E R D E T E C T I V E\n\nQuestion: Transmit the master secret passphrase to BREAK THE FINAL SEAL:",
            "expected_answer": "cyberdetective",
            "hint_text": "Enter the master passphrase: cyberdetective",
            "fragment_char": "★",
            "completion_points": 1000,
            "wrong_attempt_penalty": 50
        }
    ]

    valid_slugs = {q["slug"] for q in quests_data}
    
    # Clean up obsolete/abandoned quests from older schema versions to prevent unique constraint collisions
    obsolete = db.query(Quest).filter(~Quest.slug.in_(valid_slugs)).all()
    for obs in obsolete:
        db.delete(obs)
    db.flush()

    for q in quests_data:
        existing = db.query(Quest).filter_by(slug=q["slug"]).first()

        answer_hash = normalize_and_hash_answer(q["expected_answer"])
        sec_hash = normalize_and_hash_answer(q.get("secondary_expected_answer", "")) if q.get("secondary_expected_answer") else None

        if existing:
            existing.order_index = q["order_index"]
            existing.title = q["title"]
            existing.location_name = q["location_name"]
            existing.description = q["description"]
            existing.narrative = q["narrative"]
            existing.challenge_type = q["challenge_type"]
            existing.code_language = q["code_language"]
            existing.code_content = q["code_content"]
            existing.image_url = q.get("image_url")
            existing.expected_answer_hash = answer_hash
            existing.secondary_answer_hash = sec_hash
            existing.hint_text = q["hint_text"]
            existing.fragment_char = q["fragment_char"]
            existing.completion_points = q["completion_points"]
            existing.wrong_attempt_penalty = q["wrong_attempt_penalty"]
        else:
            quest = Quest(
                order_index=q["order_index"],
                slug=q["slug"],
                title=q["title"],
                location_name=q["location_name"],
                description=q["description"],
                narrative=q["narrative"],
                challenge_type=q["challenge_type"],
                code_language=q["code_language"],
                code_content=q["code_content"],
                image_url=q.get("image_url"),
                expected_answer_hash=answer_hash,
                secondary_answer_hash=sec_hash,
                hint_text=q["hint_text"],
                fragment_char=q["fragment_char"],
                completion_points=q["completion_points"],
                wrong_attempt_penalty=q["wrong_attempt_penalty"]
            )
            db.add(quest)

    # 4. Physical Token
    token = db.query(PhysicalToken).filter_by(token="HUNT2026GOLDENKEY").first()
    if not token:
        db.add(PhysicalToken(token="HUNT2026GOLDENKEY"))

    db.commit()
    print("Database successfully seeded.")
