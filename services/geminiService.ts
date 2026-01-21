
import { GoogleGenAI, Type } from "@google/genai";
import { AppTheme, DailyInsight } from "../types";

// NOTE: API Key must be in process.env.API_KEY
// Only used for Theme Generation now
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// === Local Data for Offline Features ===

const FORTUNES = [
  // 经典名句
  "时机成熟，放手一搏。", "静待花开，莫急于求成。", "今日宜结交新友。",
  "韬光养晦，厚积薄发。", "莫道桑榆晚，为霞尚满天。", "行百里者半九十。",
  "敏而好学，不耻下问。", "君子藏器于身，待时而动。", "流水不腐，户枢不蠹。",
  "知足不辱，知止不殆。", "满招损，谦受益。", "千里之行，始于足下。",
  "己所不欲，勿施于人。", "海纳百川，有容乃大。", "壁立千仞，无欲则刚。",
  "静以修身，俭以养德。", "天道酬勤，宁静致远。", "博观而约取，厚积而薄发。",
  "前事不忘，后事之师。", "不鸣则已，一鸣惊人。", "大智若愚，大巧若拙。",
  "路遥知马力，日久见人心。", "塞翁失马，焉知非福。", "精诚所至，金石为开。",
  "有志者事竟成。", "苦心人天不负。", "在这喧嚣的世界，独守一份宁静。",
  "凡事预则立，不预则废。", "与其临渊羡鱼，不如退而结网。", "长风破浪会有时。",
  "直挂云帆济沧海。", "山重水复疑无路，柳暗花明又一村。", "宝剑锋从磨砺出，梅花香自苦寒来。",
  "沉舟侧畔千帆过，病树前头万木春。", "不畏浮云遮望眼，自缘身在最高层。", "纸上得来终觉浅，绝知此事要躬行。",
  // 现代/生活智慧
  "生活明朗，万物可爱。", "保持热爱，奔赴山海。", "心有山海，静而无边。",
  "温柔半两，从容一生。", "日拱一卒，功不唐捐。", "但行好事，莫问前程。",
  "心中有光，慢食三餐。", "万物皆有裂痕，那是光照进来的地方。", "在这个星球上，你很重要。",
  "与其互为人间，不如自成宇宙。", "慢品人间烟火色，闲观万事岁月长。", "且将新火试新茶，诗酒趁年华。",
  "今日的好运藏在努力里。", "做一个简单的人，看得清世间繁杂却依然温和。", "所有的惊喜，都源于积累。",
  "既然选择了远方，便只顾风雨兼程。", "你若盛开，清风自来。", "不要假装努力，结果不会陪你演戏。",
  "星光不问赶路人，时光不负有心人。", "每一个不曾起舞的日子，都是对生命的辜负。", "生活原本沉闷，但跑起来就有风。",
  "再小的光辉，也能照亮黑暗。", "好心情是治愈一切的良药。", "放下执念，万般自在。",
  "今日宜：给自己一个微笑。", "今日宜：读一本好书。", "今日宜：给家人打个电话。", "今日宜：整理房间，整理心情。",
  "最好的时刻，就是现在。", "心若向阳，无畏悲伤。"
];

// Specific Date Events (Format: "MM-DD")
// Contains significant Chinese history AND major Global events (UN, Wars, Science)
const HISTORY_EVENTS: Record<string, string[]> = {
  "01-01": ["1912年1月1日，孙中山在南京宣誓就任中华民国临时大总统。", "1995年1月1日，世界贸易组织(WTO)正式成立。", "2002年1月1日，欧元正式流通。"],
  "01-08": ["1976年1月8日，周恩来总理逝世。", "1037年1月8日，北宋文学家苏轼出生。"],
  "01-11": ["1851年1月11日，洪秀全在广西金田村发动起义（金田起义）。"],
  "01-15": ["1935年1月15日，遵义会议召开。", "2001年1月15日，维基百科正式上线。"],
  "01-24": ["1601年1月24日，利玛窦来到北京。"],
  "01-27": ["1945年1月27日，苏联红军解放奥斯威辛集中营（国际大屠杀纪念日）。"],
  "01-28": ["1932年1月28日，一·二八事变爆发，十九路军抗战。"],
  "01-31": ["1949年1月31日，北平和平解放。"],
  "02-04": ["2022年2月4日，北京冬奥会开幕。", "1945年2月4日，雅尔塔会议召开，决定战后世界格局。"],
  "02-07": ["1923年2月7日，二七京汉铁路大罢工。"],
  "02-12": ["1912年2月12日，清帝溥仪退位，中国两千多年封建帝制结束。", "1809年2月12日，达尔文和林肯同日出生。"],
  "02-14": ["1946年2月14日，世界上第一台电子计算机ENIAC在美国诞生。"],
  "02-16": ["1932年2月16日，东北全境沦陷。"],
  "02-19": ["1997年2月19日，邓小平逝世。"],
  "02-21": ["1848年2月21日，《共产党宣言》在伦敦发表。"],
  "02-27": ["1957年2月27日，毛泽东发表《关于正确处理人民内部矛盾的问题》。"],
  "03-01": ["1926年3月1日，黄埔军校改名为中央军事政治学校。"],
  "03-05": ["1963年3月5日，毛泽东题词“向雷锋同志学习”。", "1898年3月5日，周恩来出生。"],
  "03-08": ["1917年3月8日，俄国二月革命爆发（妇女节起源）。", "2014年3月8日，MH370失联。"],
  "03-12": ["1925年3月12日，孙中山逝世。", "1989年3月12日，蒂姆·伯纳斯-李提出万维网(WWW)构想。"],
  "03-14": ["1879年3月14日，爱因斯坦出生。", "2018年3月14日，霍金逝世。"],
  "03-18": ["1926年3月18日，三·一八惨案。", "1871年3月18日，巴黎公社革命爆发。"],
  "03-21": ["1927年3月21日，上海工人第三次武装起义胜利。"],
  "03-29": ["1911年3月29日，黄花岗七十二烈士殉难。"],
  "04-01": ["2003年4月1日，张国荣逝世。", "2017年4月1日，中共中央、国务院决定设立河北雄安新区。"],
  "04-04": ["1968年4月4日，马丁·路德·金遇刺身亡。"],
  "04-05": ["1976年4月5日，四五运动。"],
  "04-08": ["1946年4月8日，叶挺等人在空难中牺牲。"],
  "04-12": ["1961年4月12日，加加林乘坐东方1号进入太空，人类首次载人航天。", "1927年4月12日，四一二反革命政变。"],
  "04-17": ["1895年4月17日，清政府与日本签署《马关条约》。"],
  "04-23": ["1949年4月23日，中国人民解放军海军成立。", "1564年4月23日，莎士比亚出生。"],
  "04-24": ["1970年4月24日，中国第一颗人造卫星“东方红一号”发射成功。"],
  "04-25": ["1644年4月25日，崇祯皇帝自缢，明朝灭亡。", "1953年4月25日，DNA双螺旋结构被发现。"],
  "04-27": ["1911年4月27日，黄花岗起义。"],
  "05-01": ["1886年5月1日，芝加哥工人大罢工（五一劳动节起源）。", "2010年5月1日，上海世博会开幕。"],
  "05-04": ["1919年5月4日，五四运动爆发。"],
  "05-05": ["1818年5月5日，卡尔·马克思出生。", "1921年5月5日，孙中山在广州就任非常大总统。"],
  "05-08": ["1945年5月8日，德国签署无条件投降书，欧洲战场胜利。", "1999年5月8日，中国驻南联盟大使馆遭北约轰炸。"],
  "05-12": ["2008年5月12日，汶川大地震。"],
  "05-18": ["1972年5月18日，中国与荷兰建交。"],
  "05-27": ["1949年5月27日，上海解放。"],
  "05-30": ["1925年5月30日，五卅运动爆发。"],
  "06-03": ["1839年6月3日，林则徐虎门销烟。"],
  "06-05": ["1972年6月5日，联合国召开首届人类环境会议。"],
  "06-06": ["1944年6月6日，诺曼底登陆（D-Day），二战欧洲第二战场开辟。", "2019年6月6日，工信部发放5G商用牌照。"],
  "06-08": ["2008年6月8日，中国首个“文化遗产日”。"],
  "06-11": ["1898年6月11日，戊戌变法开始。"],
  "06-15": ["2001年6月15日，上海合作组织成立。", "1215年6月15日，英国《大宪章》签署。"],
  "06-17": ["1967年6月17日，中国第一颗氢弹爆炸成功。"],
  "06-23": ["1894年6月23日，国际奥林匹克委员会成立。"],
  "06-25": ["1950年6月25日，朝鲜战争爆发。"],
  "06-26": ["1945年6月26日，《联合国宪章》在旧金山签署。"],
  "06-28": ["1919年6月28日，《凡尔赛条约》签署，一战结束。"],
  "07-01": ["1921年7月，中国共产党成立。", "1997年7月1日，香港回归。"],
  "07-04": ["1776年7月4日，美国通过《独立宣言》。", "2002年7月4日，西气东输工程全线开工。"],
  "07-07": ["1937年7月7日，卢沟桥事变，抗日战争全面爆发。"],
  "07-13": ["2001年7月13日，北京申奥成功。"],
  "07-14": ["1789年7月14日，巴黎人民攻占巴士底狱，法国大革命爆发。"],
  "07-20": ["1969年7月20日，阿波罗11号登月，阿姆斯特朗迈出人类一大步。", "1973年7月20日，李小龙逝世。"],
  "07-28": ["1914年7月28日，奥匈帝国向塞尔维亚宣战，第一次世界大战爆发。", "1976年7月28日，唐山大地震。"],
  "08-01": ["1927年8月1日，南昌起义（建军节）。", "1894年8月1日，中日甲午战争爆发。"],
  "08-06": ["1945年8月6日，美国向广岛投掷原子弹，人类历史上首次使用核武器。"],
  "08-08": ["2008年8月8日，北京奥运会开幕。"],
  "08-15": ["1945年8月15日，日本宣布无条件投降，二战结束。", "1914年8月15日，巴拿马运河通航。"],
  "08-26": ["1980年8月26日，深圳经济特区成立。", "1789年8月26日，法国通过《人权宣言》。"],
  "08-29": ["1842年8月29日，中英《南京条约》签订。"],
  "09-01": ["1939年9月1日，德国闪击波兰，第二次世界大战爆发。"],
  "09-02": ["1945年9月2日，日本签署投降书，抗日战争暨反法西斯战争胜利结束。", "1969年9月2日，互联网雏形ARPANET诞生。"],
  "09-03": ["中国人民抗日战争胜利纪念日。"],
  "09-09": ["1976年9月9日，毛泽东主席逝世。"],
  "09-10": ["1985年，新中国第一个教师节。"],
  "09-11": ["2001年9月11日，美国“9·11”恐怖袭击事件。"],
  "09-18": ["1931年9月18日，九一八事变，勿忘国耻。"],
  "09-21": ["1898年9月21日，戊戌变法失败。", "1949年9月21日，中国人民政治协商会议第一届全体会议开幕。"],
  "09-25": ["1881年9月25日，鲁迅出生。"],
  "09-28": ["孔子诞辰（祭孔大典）。", "1898年9月28日，戊戌六君子遇害。"],
  "10-01": ["1949年10月1日，中华人民共和国成立。", "1908年10月1日，福特T型车面世，汽车开始普及。"],
  "10-04": ["1957年10月4日，苏联发射第一颗人造地球卫星Sputnik 1。"],
  "10-05": ["1900年10月5日，冰心出生。"],
  "10-10": ["1911年10月10日，辛亥革命武昌起义。", "1945年10月10日，国共签署《双十协定》。"],
  "10-16": ["1964年10月16日，中国第一颗原子弹爆炸成功。"],
  "10-24": ["1945年10月24日，联合国宪章生效，联合国正式成立。", "1860年10月24日，中英签署《北京条约》。"],
  "10-25": ["1971年10月25日，中国恢复联合国合法席位。", "1945年10月25日，台湾光复。"],
  "11-08": ["2002年11月8日，中共十六大召开，“三个代表”重要思想写入党章。", "1895年11月8日，伦琴发现X射线。"],
  "11-09": ["1989年11月9日，柏林墙倒塌，冷战铁幕被打破。", "1898年11月9日，画家丰子恺出生。"],
  "11-11": ["1918年11月11日，德国签署停战协定，第一次世界大战结束。", "1949年11月11日，中国人民解放军空军成立。"],
  "11-12": ["1866年11月12日，孙中山出生。", "1893年11月12日，数学家华罗庚出生。"],
  "11-19": ["1999年11月19日，神舟一号飞船发射成功。"],
  "11-20": ["1999年11月20日，神舟一号飞船着陆。", "1998年11月20日，国际空间站首个组件发射升空。"],
  "11-22": ["1963年11月22日，肯尼迪遇刺。", "1894年11月22日，旅顺大屠杀。"],
  "12-01": ["1948年12月1日，中国人民银行成立，发行第一套人民币。"],
  "12-07": ["1941年12月7日，日本偷袭珍珠港，太平洋战争爆发。", "1949年12月7日，国民政府迁往台北。"],
  "12-10": ["1948年12月10日，联合国通过《世界人权宣言》。", "2001年12月10日，中国正式加入世界贸易组织(WTO)。"],
  "12-11": ["1929年12月11日，百色起义。"],
  "12-12": ["1936年12月12日，西安事变爆发。"],
  "12-13": ["1937年12月13日，南京大屠杀（国家公祭日）。"],
  "12-17": ["1903年12月17日，莱特兄弟发明飞机，人类首次动力飞行。", "2019年12月17日，中国第一艘国产航空母舰山东舰交付海军。"],
  "12-20": ["1999年12月20日，澳门回归。"],
  "12-25": ["1991年12月25日，苏联正式解体，冷战结束。", "1915年12月25日，护国战争爆发。"],
  "12-26": ["1893年12月26日，毛泽东出生。"],
};

const LUCKY_COLORS = [
  "中国红", "琉璃黄", "青花蓝", "翡翠绿", "月白", 
  "黛蓝", "朱砂", "玄黑", "紫气", "琥珀", 
  "胭脂", "天青", "曙红", "竹青", "赤金",
  "秋香色", "石青", "苍绿", "海棠红", "藕荷"
];

// Offline Pool (Simplified - just general insights)
// Used ONLY when AI fails.
const OFFLINE_INSIGHTS = [
    "静水流深，今日宜沉淀内心，不随波逐流。",
    "星光不问赶路人，你的努力终将被看见。",
    "保持开放的心态，意外的惊喜往往藏在转角处。",
    "今日适合做减法，清理杂念，专注当下。",
    "与人为善，福虽未至，祸已远离。",
    "相信直觉，内心的声音会指引正确的方向。",
    "哪怕是微小的进步，也是通向成功的阶梯。",
    "温柔地对待世界，世界也会温柔地回馈你。",
    "今日宜静思，从喧嚣中找回内心的平衡。",
    "每一个当下，都是未来最好的伏笔。"
];

// Simple Seeded Random Number Generator
const createSeededRandom = (seedStr: string) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
};

// === PUBLIC API ===

export const generateTheme = async (prompt: string): Promise<AppTheme | null> => {
  if (!ai) {
    console.error("Gemini API Key not found. Cannot generate theme.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a color theme for a calendar app based on this description: "${prompt}". 
      Return valid 6-digit hex codes.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING, description: "Main brand color, distinct and strong" },
                secondary: { type: Type.STRING, description: "Light background tint compatible with primary" },
                accent: { type: Type.STRING, description: "Highlight color for special events" },
                surface: { type: Type.STRING, description: "Card/Container background (usually white or very light)" },
                text: { type: Type.STRING, description: "Main text color (usually dark)" },
                background: { type: Type.STRING, description: "Global body background color" },
              },
              required: ["primary", "secondary", "accent", "surface", "text", "background"]
            }
          },
          required: ["name", "colors"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AppTheme;
    }
    return null;
  } catch (error) {
    console.error("Theme generation failed:", error);
    return null;
  }
};

export const getDailyInsight = async (dateStr: string, lunarDateStr: string): Promise<DailyInsight | null> => {
  // OFFLINE IMPLEMENTATION
  // dateStr is expected to be "YYYY-MM-DD"
  const seed = `${dateStr}-${lunarDateStr}`;
  const rng = createSeededRandom(seed);

  const fortune = FORTUNES[Math.floor(rng() * FORTUNES.length)];
  
  // Try to find historical event for this specific day (MM-DD)
  let history = "";
  try {
    const [, month, day] = dateStr.split('-'); // 2023-10-01 -> 10, 01
    const mmdd = `${month}-${day}`;
    
    if (HISTORY_EVENTS[mmdd]) {
        // Pick one event from today's list using the seed
        const events = HISTORY_EVENTS[mmdd];
        const event = events[Math.floor(rng() * events.length)];
        // Add label to make it clear it's today in history
        history = `【历史上的今天】${event}`;
    }
  } catch(e) { /* ignore parse error */ }
  
  // Note: No fallback to cultural facts anymore, as requested.
  // If no history event exists, 'history' stays empty.

  const luckyColor = LUCKY_COLORS[Math.floor(rng() * LUCKY_COLORS.length)];
  const luckyNumber = Math.floor(rng() * 99 + 1).toString();

  // Simulate a brief calculation delay for better UX (feels like "revealing")
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    date: dateStr,
    fortune,
    history,
    luckyColor,
    luckyNumber
  };
};

export const getHoroscope = async (signName: string, dateStr: string): Promise<string | null> => {
  // 1. Try Gemini API First (Natural, AI-Generated)
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `你是一位神秘而智慧的占星师。请为${signName}写一段${dateStr}的今日运势指引。
        
        要求：
        1. 不要分段，写成一段优美、连贯的话（约60-80字）。
        2. 语气要神秘、治愈且富有启发性。
        3. 重点给出一条核心建议或心理暗示。
        4. 不要使用任何【】符号或小标题。`,
        config: {
          temperature: 1.0, // Creative
        }
      });

      if (response.text) {
         return response.text.trim();
      }
    } catch (error) {
      console.warn("Gemini Horoscope API failed, falling back to local database.", error);
    }
  }

  // 2. OFFLINE FALLBACK - Minimalist
  // Used if API Key is missing OR if API call fails/times out
  const seed = `${dateStr}-${signName}`;
  const rng = createSeededRandom(seed);
  
  // Select one profound sentence
  const insight = OFFLINE_INSIGHTS[Math.floor(rng() * OFFLINE_INSIGHTS.length)];

  // Simulate delay only if falling back (to match async feel)
  if (!ai) await new Promise(resolve => setTimeout(resolve, 600));
  
  return `星启：${insight}`;
};
