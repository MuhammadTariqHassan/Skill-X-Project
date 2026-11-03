/* SkillX floating features — CONFIG (new feature code, isolated).
   Links below are the site's OWN links, taken from the original
   SkillX codebase (the social row in team.php) — nothing invented. */
export const WHATSAPP_COMMUNITY_URL =
  'https://chat.whatsapp.com/BTY6dTgmjcAB70KYAa9kzL'
export const WHATSAPP_CHANNEL_URL =
  'https://whatsapp.com/channel/0029VbDhClQEAKWKc75YcG3P'

/* Assistant Q&A — a fixed question bank, NOT a real AI.
   The first five answers are the site's own FAQ answers, verbatim
   (Home page "Questions? Answered."). The rest are assembled only
   from facts printed on the site's own pages (modules, tools,
   mentors, dates, support). `link` renders after the answer text. */
export const ASSISTANT_FAQS = [
  {
    q: 'Is the SkillX AI Pro Course really free?',
    a: 'Yes — 100% free. Every live class, every class recording and the achievement certificate cost nothing.',
    keys: ['free', 'cost', 'price', 'fee', 'fees', 'paid', 'charge', 'payment'],
  },
  {
    q: 'When are the classes?',
    a: 'Live classes run 5 Oct to 2 Nov 2026 at 8:30 PM PKT (Asia/Karachi) on Zoom, hosted by Najeeb Ullah and Mian Haroon.',
    link: { label: 'See the schedule page', href: '#/schedule' },
    keys: ['when', 'time', 'timing', 'schedule', 'class', 'classes', 'zoom', 'date', 'dates', 'start'],
  },
  {
    q: 'How do I enroll?',
    a: 'Fill the free enrollment form on the Enroll page. On the live site you receive a reference number like SX-2026-XXXXXX — keep it safe, you need it for your student dashboard.',
    link: { label: 'Go to the Enroll page', href: '#/enroll' },
    keys: ['enroll', 'enrol', 'join', 'register', 'admission', 'apply', 'signup', 'sign up', 'admit'],
  },
  {
    q: 'Do I get a certificate?',
    a: 'Yes. Students who complete at least 75% of assignments earn an achievement certificate. Watching class recordings counts the same as attending live.',
    keys: ['certificate', 'certification', 'degree', 'diploma'],
  },
  {
    q: 'What if I miss a live class?',
    a: 'Classes are added to the Classes page as recordings, so a missed night never slows you down.',
    keys: ['miss', 'missed', 'recording', 'recordings', 'absent', 'late', 'catch up', 'replay'],
  },
  {
    q: 'What will I learn in the AI Pro Course?',
    a: 'Four modules over four weeks — Module 1 · AI Foundations + Design: prompting, AI portraits, thumbnails & design workflows. Module 2 · Advanced AI Production: AI video, avatars, ChatGPT / Claude / Gemini workflows. Module 3 · YouTube + TikTok Automation: faceless channels & short-form content systems. Module 4 · Digital Products, Etsy + Career: Etsy products, AI websites, Python & freelancing.',
    link: { label: 'See the full course', href: '#/course-ai-pro' },
    keys: ['learn', 'course', 'module', 'modules', 'curriculum', 'syllabus', 'topics', 'content', 'teach', 'skills', 'skill'],
  },
  {
    q: 'Which tools will I learn?',
    a: '11 tools you will master in class: ChatGPT, Claude, Gemini, Canva, Canva AI, Muse AI, Google Flow, Python, YouTube, TikTok and Etsy.',
    keys: ['tool', 'tools', 'software', 'chatgpt', 'claude', 'gemini', 'canva', 'python', 'etsy'],
  },
  {
    q: 'Who teaches the course?',
    a: 'Every session is hosted by the founders — Najeeb Ullah · Founder & CEO and Mian Haroon · Co-Founder — and 19 mentors teach the AI Pro Course.',
    link: { label: 'Meet the mentors', href: '#/mentors' },
    keys: ['mentor', 'mentors', 'teacher', 'teachers', 'teach', 'founder', 'founders', 'najeeb', 'haroon', 'instructor'],
  },
  {
    q: 'Is there a WhatsApp community?',
    a: 'Yes — you can join the SkillX WhatsApp Community, and follow the SkillX WhatsApp Channel for updates.',
    link: { label: 'Join the WhatsApp Community', href: WHATSAPP_COMMUNITY_URL, external: true },
    keys: ['whatsapp', 'community', 'group', 'channel', 'chat'],
  },
  {
    q: 'How do I contact support?',
    a: 'Open a ticket on the Support page, or email najeebullah@skillxpk.com.',
    link: { label: 'Go to Support', href: '#/support' },
    keys: ['support', 'help', 'contact', 'email', 'problem', 'issue', 'complaint', 'ticket'],
  },
]

export const ASSISTANT_GREETING =
  "Assalam-o-Alaikum! I am the SkillX Assistant. Ask me anything about SkillX — tap a question below, or type your own and I'll match it to an answer."
export const ASSISTANT_FALLBACK =
  "I can only answer from SkillX's own questions right now. Try one of the questions below — or reach the team on WhatsApp or the Support page."
