# Ta'amim (טעמים) – אפליקציית מובייל ללימוד טעמי המקרא בנוסח מרוקו

פלטפורמה אינטראקטיבית בסגנון **Duolingo** ללימוד ותרגול טעמי המקרא במסורת יהדות מרוקו (קזבלנקה, מקנס, מרקש ופאס), המשלבת זיהוי גובה צליל בזמן אמת ב-60FPS, אלגוריתם Dynamic Time Warping (DTW) להשוואת סלסולים מול הקלטות חזנים, ומערכת גיימיפיקציה (ליגות שבועיות, רצף ימים ולבבות).

---

## 🏗️ מבנה ה-Monorepo

```plaintext
projectThirdYear/
├── apps/
│   ├── mobile/            # אפליקציית מובייל (React Native / Expo + TypeScript)
│   │   ├── src/
│   │   │   ├── components/PitchContourVisualizer.tsx  # הדמיית 60FPS עם Skia + Reanimated
│   │   │   ├── components/HebrewVerseText.tsx        # רינדור פסוקים ב-NFC וגופני טעמים
│   │   │   └── constants/fonts.ts
│   │   ├── App.tsx
│   │   └── package.json
│   │
│   ├── api/               # ליבת השרת (NestJS + TypeScript)
│   │   ├── prisma/
│   │   │   └── schema.prisma  # מודל הנתונים: משתמשים, טעמים, הקלטות חזנים, DTW
│   │   ├── src/
│   │   │   ├── modules/taamim/         # ניהול טעמי המקרא
│   │   │   ├── modules/gamification/   # ליגות (Redis ZSET), רצפים ולבבות (Postgres)
│   │   │   └── modules/audio/          # פרוקסי והערכת ביצועי שמע מול ה-DSP
│   │   └── package.json
│   │
│   └── audio-engine/      # מנוע עיבוד האותות (Python FastAPI + DSP)
│       ├── dsp/
│       │   ├── pitch_extractor.py  # חילוץ F0 באמצעות librosa pYIN
│       │   ├── normalizer.py       # נרמול חציוני לחצאי טונים (Semitones) לפי טוניקה
│       │   └── dtw_matcher.py      # השוואת סלסולים ומקצבים ב-FastDTW ומשוב פדגוגי
│       ├── main.py
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   └── shared-types/      # מודלים, טיפוסים ו-DTOs משותפים ל-Mobile ול-NestJS
│       ├── src/
│       │   ├── cantillation.ts     # הגדרות טעמים ומסורות מרוקו
│       │   ├── audio.ts            # קווי מלודיה ופרמטרי DTW
│       │   ├── gamification.ts     # ליגות, רצפים ולבבות
│       │   └── user.ts
│       └── package.json
│
├── docker-compose.yml     # תשתית PostgreSQL 16 + Redis 7
├── PROJECT_RULES.md       # קובץ חוקי וארכיטקטורת הפרויקט
├── GEMINI.md              # חוקי הפרויקט עבור סביבת הסוכן
└── package.json           # ניהול ה-Workspaces של המונורפו
```

---

## 🚀 הפעלה והרצה מקומית

### 1. הפעלת מסד הנתונים וה-Cache (Docker)
```bash
docker-compose up -d
```
הפקודה תפעיל:
- **PostgreSQL 16**: על פורט `5432` (בסיס נתונים: `taamim_db`, משתמש: `taamim`)
- **Redis 7**: על פורט `6379` (עבור ליגות שבועיות בזמן אמת וניהול ביצועים)

### 2. הקמת ה-API (NestJS)
```bash
cd backend/api
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```
השרת יעלה בכתובת: `http://localhost:4000`

### 3. הקמת מנוע עיבוד הקול (Python DSP Engine)
```bash
cd backend/audio-engine
py -3.11 -m venv venv
# ב-Windows:
.\venv\Scripts\activate
# התקנת תלויות:
pip install -r requirements.txt
# הרצת השרת:
uvicorn main:app --reload --port 8000
```
מנוע ה-DSP יעלה בכתובת: `http://localhost:8000`

### 4. הרצת אפליקציית המובייל (Expo)
```bash
cd frontend/mobile
npm install
npm run start
```
סרוק את קוד ה-QR באמצעות אפליקציית **Expo Go** במכשיר שלך או הרץ באמולטור.

---

## 🎵 דגשי הליבה של הפרויקט
1. **דיוק מוזיקלי במסורת מרוקו**: נרמול גובה הצליל מתבצע ביחס לטוניקה החציונית (Median F0) של המשתמש. כך גברים, נשים וילדים נמדדים בצורה הוגנת על פי יחסי הצלילים והסלסולים הייחודיים לנוסח מרוקו, ולא לפי גובה קולם האבסולוטי.
2. **ביצועי 60FPS במובייל**: שימוש ב-`@shopify/react-native-skia` וב-`react-native-reanimated` (`SharedValue`) על מנת למנוע רינדורים חוזרים של React במהלך ניטור הקול בזמן אמת.
3. **תמיכה קפדנית ב-NFC ובטעמי המקרא**: כל טקסט מקראי מנורמל בפורמט `NFC` ומוצג באמצעות גופן תומך מיקום טעמים מדויק ובכיווניות RTL מלאה.
