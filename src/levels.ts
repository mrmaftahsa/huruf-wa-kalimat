import key from './assets/key.png'
import sun from './assets/sun.png'
import bike from './assets/bike.png'

type Clue = { kind: 'phrase' } | { kind: 'picture'; image: string }

export type Entry = {
  id: string
  answer: string
  x: number
  y: number
  direction: 'across' | 'down'
  prompt: string
  clue: Clue
}

export type Level = {
  id: string
  title: string
  subtitle: string
  entries: Entry[]
}

const phrase = { kind: 'phrase' } as const

export const levels: Level[] = [
  {
    id: 'study',
    title: 'على المكتب',
    subtitle: 'أشياء نستخدمها كل يوم',
    entries: [
      { id: 'book', answer: 'كتاب', x: 6, y: 2, direction: 'across', prompt: 'على طاولتي ___ أقرؤه كل مساء.', clue: phrase },
      { id: 'key', answer: 'مفتاح', x: 5, y: 0, direction: 'down', prompt: 'أداة صغيرة تفتح القفل', clue: { kind: 'picture', image: key } },
      { id: 'ink', answer: 'حبر', x: 5, y: 4, direction: 'across', prompt: 'نفد الـ___ من قلم الكتابة.', clue: phrase },
      { id: 'feather', answer: 'ريشة', x: 3, y: 4, direction: 'down', prompt: 'وجدت ___ سقطت من جناح طائر.', clue: phrase },
    ],
  },
  {
    id: 'nature',
    title: 'في الطبيعة',
    subtitle: 'من السماء إلى البحر',
    entries: [
      { id: 'grass', answer: 'عشب', x: 6, y: 2, direction: 'across', prompt: 'في الحديقة ___ أخضر يغطي الأرض.', clue: phrase },
      { id: 'sun', answer: 'شمس', x: 5, y: 2, direction: 'down', prompt: 'نجم يضيء الأرض نهارًا', clue: { kind: 'picture', image: sun } },
      { id: 'cloud', answer: 'سحاب', x: 5, y: 4, direction: 'across', prompt: 'تجمّع ___ رمادي قبل هطول المطر.', clue: phrase },
      { id: 'sea', answer: 'بحر', x: 2, y: 4, direction: 'down', prompt: 'بين الشاطئين ___ واسع مالح.', clue: phrase },
    ],
  },
  {
    id: 'journey',
    title: 'في الطريق',
    subtitle: 'كلمات من رحلة قصيرة',
    entries: [
      { id: 'road', answer: 'طريق', x: 6, y: 1, direction: 'across', prompt: 'هذا ___ يمرّ بين الأشجار.', clue: phrase },
      { id: 'bike', answer: 'دراجة', x: 5, y: 0, direction: 'down', prompt: 'مركبة بعجلتين تتحرك بالدواسات', clue: { kind: 'picture', image: bike } },
      { id: 'bridge', answer: 'جسر', x: 5, y: 3, direction: 'across', prompt: 'عبرنا النهر فوق ___.', clue: phrase },
      { id: 'trip', answer: 'رحلة', x: 3, y: 3, direction: 'down', prompt: 'كانت ___ ممتعة إلى الجبال.', clue: phrase },
    ],
  },
]
