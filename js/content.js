/*
  YONI KATZ PORTFOLIO: ALL CONTENT LIVES IN THIS FILE.

  To add a video to an existing project:
    1. Put three files in /media:  <id>.mp4 (full video), <id>-loop.mp4 (4 second muted preview), <id>.jpg (poster frame)
    2. Add an entry to that project's "items" list below, using the same <id>.
    3. Add the <id> to "strip" if it should appear in the strip on the home page.

  To add a project: copy one of the blocks in "projects", give it a new id, and pick a "theme".
  A theme is the look taken from the video itself (colors and title style). They are defined in css/site.css.

  Text styles inside titles and labels:
    "thin"   light line          "heavy"  heavy white
    "mid"    medium weight       "accent" the video's accent color
    "box"    word inside a colored box
  A third value of 1 means "line break after this piece".
*/
window.SITE = {
  whatsapp: "972556621091",
  whatsappDisplay: "+972 55-662-1091",

  // Order of the tiles in the strip on the home page.
  strip: ["g05", "b01", "g01", "b03", "g04", "b02", "g02"],

  projects: [
    {
      id: "goappie",
      theme: "goappie",
      ratio: "9/16",
      name: { en: "goappie", he: "goappie" },
      title: {
        en: [["5 Meta ads for", "thin", 1], ["GoAppie", "accent"]],
        he: [["5 מודעות מטא בשביל", "thin", 1], ["GoAppie", "accent"]]
      },
      blurb: {
        en: "An app for barbers. A barber talks to camera while captions, app screens and motion graphics carry the pitch. I did the edit.",
        he: "אפליקציה לספרים. ספר מדבר למצלמה, והכתוביות, מסכי האפליקציה והמושן גרפיקס עושים את השאר. העריכה שלי."
      },
      specs: {
        en: [["Client", "goappie"], ["Role", "Edit"], ["Format", "9:16, paid social on Meta"], ["Year", "2026"]],
        he: [["לקוח", "goappie"], ["תפקיד", "עריכה"], ["פורמט", "9:16, ממומן במטא"], ["שנה", "2026"]]
      },
      items: [
        { id: "g05", dur: "0:42", meta: { en: "Meta ad", he: "מודעת מטא" }, label: { en: [["GoAppie ", "heavy"], ["05", "accent"]], he: [["GoAppie ", "heavy"], ["05", "accent"]] } },
        { id: "g01", dur: "0:36", meta: { en: "Meta ad", he: "מודעת מטא" }, label: { en: [["GoAppie ", "heavy"], ["01", "accent"]], he: [["GoAppie ", "heavy"], ["01", "accent"]] } },
        { id: "g02", dur: "0:29", meta: { en: "Meta ad", he: "מודעת מטא" }, label: { en: [["GoAppie ", "heavy"], ["02", "accent"]], he: [["GoAppie ", "heavy"], ["02", "accent"]] } },
        { id: "g04", dur: "0:32", meta: { en: "Meta ad", he: "מודעת מטא" }, label: { en: [["GoAppie ", "heavy"], ["04", "accent"]], he: [["GoAppie ", "heavy"], ["04", "accent"]] } }
      ]
    },
    {
      id: "business-lessons",
      theme: "lessons",
      ratio: "9/16",
      name: { en: "Business Lessons", he: "Business Lessons" },
      title: {
        en: [["Business", "heavy", 1], ["Lessons", "accent"]],
        he: [["דברים שהלוואי והייתי יודע", "heavy", 1], ["לפני שפתחתי עסק", "accent"]]
      },
      titleSize: { he: "sm" },
      tag: {
        en: [["Concept, script, camera ", "heavy"], ["and edit", "box"]],
        he: [["רעיון, תסריט, צילום ", "heavy"], ["ועריכה", "box"]]
      },
      blurb: {
        en: "A four-part series: things I wish I'd known before I started a business. From the idea to the final file, it is all mine.",
        he: "סדרה בארבעה פרקים. מהרעיון ועד הקובץ הסופי הכול שלי: תסריט, צילום ועריכה."
      },
      specs: {
        en: [["Role", "Concept, script, camera, edit"], ["Format", "9:16 series"], ["Year", "2026"]],
        he: [["תפקיד", "רעיון, תסריט, צילום, עריכה"], ["פורמט", "סדרה, 9:16"], ["שנה", "2026"]]
      },
      items: [
        { id: "b01", dur: "1:08", meta: { en: "Business Lessons 01", he: "Business Lessons 01" }, label: { en: [["Sell ", "heavy"], ["early", "box"]], he: [["Sell ", "heavy"], ["early", "box"]] } },
        { id: "b02", dur: "0:33", meta: { en: "Business Lessons 02", he: "Business Lessons 02" }, label: { en: [["Health ", "heavy"], ["first", "box"]], he: [["Health ", "heavy"], ["first", "box"]] } },
        { id: "b03", dur: "0:39", meta: { en: "Business Lessons 03", he: "Business Lessons 03" }, label: { en: [["Deep ", "heavy"], ["focus", "box"]], he: [["Deep ", "heavy"], ["focus", "box"]] } }
      ]
    },
    {
      id: "promo",
      theme: "promo",
      ratio: "16/9",
      name: { en: "My promo", he: "הפרומו שלי" },
      title: {
        en: [["your raw clip", "mid", 1], ["as an ", "mid"], ["ad", "accent"]],
        he: [["הקליפ הגולמי שלך", "mid", 1], ["כ", "mid"], ["מודעה", "accent"]]
      },
      blurb: {
        en: "A 22-second motion-graphics ad for my own editing service. No presenter, no shoot.",
        he: "מודעת מושן גרפיקס של 22 שניות לשירות העריכה שלי. בלי פרזנטור ובלי יום צילום."
      },
      specs: {
        en: [["Client", "Self-promo"], ["Role", "Motion graphics, edit"], ["Format", "16:9"], ["Year", "2026"]],
        he: [["לקוח", "פרומו עצמי"], ["תפקיד", "מושן גרפיקס, עריכה"], ["פורמט", "16:9"], ["שנה", "2026"]]
      },
      items: [
        { id: "promo", dur: "0:22", meta: { en: "Motion graphics", he: "מושן גרפיקס" }, label: { en: [["your raw clip as an ", "mid"], ["ad", "accent"]], he: [["הקליפ הגולמי שלך כ", "mid"], ["מודעה", "accent"]] } }
      ]
    }
  ],

  // Websites. Each card takes the look of the site it links to ("theme" is defined in css/site.css)
  // and opens the live site in a new tab. "shot" is a screenshot of the site.
  web: [
    {
      theme: "ella",
      name: { en: "Ella Healing Space", he: "Ella Healing Space" },
      shot: "media/web-ella.jpg",
      url: "https://www.ellahealingspace.com/",
      status: { en: "Live", he: "באוויר" },
      cta: { en: "Visit the site", he: "לאתר" },
      text: { en: "Website for a retreat space. Designed and directed by me, built with AI coding tools.", he: "אתר למתחם ריטריט. עיצוב והכוונה שלי, בנייה עם כלי AI." }
    },
    {
      theme: "eyal",
      name: { en: "Eyal Greenworks", he: "אייל אוחיון, גינות בוטיק" },
      shot: "media/web-eyal.jpg",
      url: "https://eyalgreenworks.com/",
      status: { en: "In progress", he: "בתהליך" },
      cta: { en: "Visit the site", he: "לאתר" },
      text: { en: "Website for a gardener. Designed and directed by me, built with AI coding tools.", he: "אתר לגנן. עיצוב והכוונה שלי, בנייה עם כלי AI." }
    }
  ],

  // Services list ("What I do"). Hovering a row slides in a band with these preview images.
  services: [
    { href: "#work", en: ["Meta ads", "Paid social that stops the scroll"], he: ["מודעות מטא", "מודעות ממומנות שעוצרות את הגלילה"], imgs: ["media/g05.jpg", "media/g04.jpg", "media/g01.jpg"] },
    { href: "#work", en: ["Short-form", "Reels, TikToks and Shorts"], he: ["סרטונים קצרים", "רילס, טיקטוק ושורטס"], imgs: ["media/b01.jpg", "media/b03.jpg", "media/g02.jpg"] },
    { href: "#work", en: ["Full production", "Script, shoot and edit"], he: ["הפקה מלאה", "תסריט, צילום ועריכה"], imgs: ["media/b02.jpg", "media/b01.jpg", "media/b03.jpg"] },
    { href: "#more", en: ["Motion graphics", "Ads with no presenter and no shoot"], he: ["מושן גרפיקס", "מודעות בלי פרזנטור ובלי יום צילום"], imgs: ["media/promo.jpg", "media/promo.jpg"] },
    { href: "#more", en: ["Websites", "Designed and directed by me"], he: ["אתרים", "עיצוב והכוונה שלי"], imgs: ["media/web-ella.jpg", "media/web-eyal.jpg"] }
  ]
};
