export interface DiscoveryQuestion {
  id: string;
  category: 'identity' | 'rhythm' | 'nexusos' | 'discipline' | 'life';
  question: string;
  contextHint: string;
}

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  {
    id: 'disc-01',
    category: 'identity',
    question: 'ما هو المبدأ القيادي الصارم الذي لا تساوم عليه أبداً في حياتك ومشاريعك؟',
    contextHint: 'سيساعد المستشار في توجيه كل قراراتك المستقبلية وفقاً لهذا المبدأ.',
  },
  {
    id: 'disc-02',
    category: 'rhythm',
    question: 'في أي وقت تشعر بأن عقلك في قمة صفائه وإبداعه الهندسي؟ (الفجر، الصباح الباكر، أم هدوء الليل)؟',
    contextHint: 'سيرتب المستشار مهامك الصعبة في هذه الساعات الذهبية تلقائياً.',
  },
  {
    id: 'disc-03',
    category: 'nexusos',
    question: 'لو لخصت جوهر مشروع NexusOS في جملة واحدة حاسمة للعالم، ماذا ستكون؟',
    contextHint: 'تثبيت الرؤية المحورية للمشروع وتوجيه أولوياته التقنية.',
  },
  {
    id: 'disc-04',
    category: 'discipline',
    question: 'ما هو الشيء الأكثر استنزافاً لطاقتك وتركيزك اليومي، وتريد من المنظومة حمايتك منه؟',
    contextHint: 'سيساعد المستشار في تنبيهك فوراً إذا بدأت بالانزلاق نحو هذا المشتت.',
  },
  {
    id: 'disc-05',
    category: 'life',
    question: 'ما الذي يجعل هذا الأسبوع أسبوعاً استثنائياً وناجحاً بكل المقاييس لو تحقق شيء واحد فقط؟',
    contextHint: 'تحديد الهدف المحوري الأسبوعي (One Thing) لتفادي التشتت.',
  },
  {
    id: 'disc-06',
    category: 'identity',
    question: 'ما هو النموذج أو الشخصية التاريخية/الريادية التي تلهمك في قيادة الأزمات والصمود؟',
    contextHint: 'استيعاب البنية الفكرية والقدوة التي تصنع بها قراراتك.',
  },
  {
    id: 'disc-07',
    category: 'rhythm',
    question: 'كيف تكافئ نفسك وتستعيد طاقتك النفسية بعد يوم عمل شاق وماراثون برمجي طويل؟',
    contextHint: 'مراعاة توازن الطاقة والراحة للقائد لضمان الاستمرارية وعدم الاحتراق.',
  },
];

export function getTodayDiscoveryQuestion(answeredCount: number = 0): DiscoveryQuestion {
  const index = answeredCount % DISCOVERY_QUESTIONS.length;
  return DISCOVERY_QUESTIONS[index];
}
