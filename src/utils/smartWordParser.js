/**
 * 智能单词解析模块
 * 用于解析混乱格式的Word/Excel文档，智能识别：
 * - 非单词内容（如 day3, day3campus）
 * - 短语动词（如 contribute to, keep track of）
 * - 多词性条目拆分
 */

/**
 * 检测是否为非单词内容（如标题 day3, day3campus 等）
 * @param {string} text - 待检测的文本
 * @returns {boolean} - true 表示是非单词内容，应该排除
 */
export const isNonWordContent = (text) => {
  if (!text || typeof text !== 'string') return true
  
  const trimmed = text.trim()
  
  // 空内容
  if (!trimmed) return true
  
  // 转换为小写进行匹配
  const lower = trimmed.toLowerCase()
  
  // 匹配模式：
  // 1. day + 数字 (day1, day2, day3, day10, etc.)
  // 2. day + 数字 + 字母 (day3campus, day1part, etc.)
  // 3. week + 数字
  // 4. unit + 数字
  // 5. chapter + 数字
  // 6. lesson + 数字
  const nonWordPatterns = [
    /^day\s*\d+[a-z]*$/i,           // day3, day 3, day3campus
    /^week\s*\d+[a-z]*$/i,           // week1, week 1
    /^unit\s*\d+[a-z]*$/i,           // unit1, unit 1
    /^chapter\s*\d+[a-z]*$/i,        // chapter1
    /^lesson\s*\d+[a-z]*$/i,         // lesson1
    /^section\s*\d+[a-z]*$/i,        // section1
    /^part\s*\d+[a-z]*$/i,           // part1
    /^(module|module\s*\d+)$/i,      // module, module 1
    /^(review|test|exam|quiz)$/i,   // 复习、测试
    /^page\s*\d+$/i,                 // page 10
    /^\d+\.$/i,                      // 1., 2., 3. (纯数字编号)
  ]
  
  for (const pattern of nonWordPatterns) {
    if (pattern.test(trimmed)) {
      return true
    }
  }
  
  return false
}

/**
 * 常见短语动词/短语列表
 */
const COMMON_PHRASES = [
  // A
  'account for', 'add up', 'add up to', 'addicted to', 'adequate for', 
  'adjust to', 'admit to', 'advise doing', 'agree on', 'agree to', 
  'agree with', 'ahead of', 'aim at', 'allow for', 'amount to', 
  'angle for', 'answer for', 'apologize for', 'appeal to', 'apply for', 
  'apply to', 'approve of', 'argue about', 'argue against', 'argue with',
  'arise from', 'arrive at', 'ask after', 'ask around', 'ask for',
  'associate with', 'assure of', 'attach to', 'attend to', 'attribute to',
  // B
  'back away', 'back down', 'back off', 'back out', 'back up',
  'bargain for', 'barge in', 'bear down', 'bear out', 'bear with',
  'beat down', 'beat off', 'beat up', 'become of', 'befall of',
  'begin with', 'behave toward', 'believe in', 'belong to', 'benefit from',
  'berate for', 'bestow upon', 'bet on', 'bind over', 'black out',
  'blame for', 'blame on', 'blast off', 'blaze away', 'bleed for',
  'bless with', 'blind to', 'blink at', 'block off', 'block out',
  'blot out', 'blow away', 'blow off', 'blow out', 'blow over',
  'blow up', 'blurt out', 'blush at', 'boast about', 'book in',
  'boost up', 'border on', 'borrow from', 'bottle up', 'bounce back',
  'bow down', 'bow out', 'branch out', 'break away', 'break down',
  'break in', 'break into', 'break off', 'break out', 'break through',
  'break up', 'breathe in', 'breathe out', 'breed in', 'bring about',
  'bring along', 'bring around', 'bring back', 'bring down', 'bring forth',
  'bring forward', 'bring in', 'bring off', 'bring on', 'bring out',
  'bring through', 'bring to', 'bring up', 'bring up against',
  'broaden out', 'brush aside', 'brush away', 'brush off', 'brush up',
  'buck up', 'budget for', 'build around', 'build in', 'build into',
  'build on', 'build out', 'build up', 'bump into', 'bundle up',
  'burn away', 'burn down', 'burn out', 'burn up', 'burst in',
  'burst into', 'burst out', 'bury in', 'bust up', 'buy in',
  'buy into', 'buy off', 'buy out', 'buy up', 'buzz off',
  // C
  'cadge from', 'call back', 'call down', 'call for', 'call in off', 'call',
  'call on', 'call out', 'call up', 'calm down',
  'capitalize on', 'care for', 'carry away', 'carry back', 'carry forward',
  'carry into', 'carry off', 'carry on', 'carry out', 'carry over',
  'carry through', 'carve out', 'cash in', 'cash out', 'cast aside',
  'cast away', 'cast off', 'cast out', 'catch at', 'catch on',
  'catch out', 'catch up', 'categorize as', 'caution against', 'cease to',
  'center on', 'chance on', 'change into', 'change over', 'change to',
  'charge for', 'charge with', 'chase after', 'chase away', 'cheat on',
  'check in', 'check into', 'check off', 'check out', 'check over',
  'check through', 'check up on', 'cheer on', 'cheer up', 'chew over',
  'chip away', 'chip in', 'choke back', 'choke down', 'choke up',
  'chop down', 'chop up', 'chunk up', 'clam up', 'clamp down',
  'clash with', 'clean out', 'clean up', 'clear away', 'clear off',
  'clear out', 'clear up', 'click on', 'climb down', 'climb up',
  'cling to', 'close down', 'close in', 'close off', 'close out',
  'close up', 'clothe in', 'cloud over', 'cluster around', 'clutch at',
  'coach in', 'coast along', 'cock up', 'code as', 'coincide with',
  'collaborate with', 'collapse into', 'collect for', 'collect up',
  'color in', 'come about', 'come across', 'come after', 'come again',
  'come along', 'come apart', 'come around', 'come at', 'come away',
  'come back', 'come before', 'come between', 'come by', 'come down',
  'come down to', 'come down with', 'come for', 'come forth',
  'come forward', 'come from', 'come in', 'come in for', 'come into',
  'come of', 'come off', 'come on', 'come out', 'come out for',
  'come out of', 'come out with', 'come over', 'come round', 'come through',
  'come to', 'come to blows', 'come to grips', 'come to head', 'come to heel',
  'come to it', 'come to mind', 'come to nothing', 'come to terms', 'come to that',
  'come under', 'come up', 'come up against', 'come up for', 'come up to',
  'come up with', 'come upon', 'comment on', 'compare against', 'compare to',
  'compare with', 'compete against', 'compete for', 'compete with', 'complain about',
  'comply with', 'conceive of', 'concentrate on', 'concern with', 'condemn to',
  'condescend to', 'conduct toward', 'confer about', 'confess to', 'confide in',
  'confine to', 'confirm as', 'conform to', 'confront with', 'congratulate on',
  'connect to', 'connect with', 'consent to', 'conserve for', 'consider as',
  'consider to', 'consign to', 'consist in', 'consist of', 'consist with',
  'console oneself', 'conspire against', 'constitute', 'construct as',
  'consult with', 'consume in', 'contain in', 'contemplate on', 'content with',
  'contest against', 'continue as', 'continue in', 'continue with',
  'contribute to', 'control over', 'convene for', 'convert into', 'convert to',
  'convince of', 'cook up', 'cool down', 'cool off', 'cope with',
  'copy down', 'copy out', 'cornered as', 'correct for', 'correspond to',
  'correspond with', 'cost about', 'cotton on', 'cotton to', 'could do with',
  'count against', 'count down', 'count for', 'count in', 'count on',
  'count out', 'count toward', 'count up', 'counteract', 'cover for',
  'cover over', 'cover up', 'crack down', 'crack on', 'crack up',
  'craft as', 'crash into', 'crawl with', 'crazy about', 'creep into',
  'crime to', 'criticize for', 'cross off', 'cross out', 'cross over',
  'crowd into', 'crowd out', 'cry out', 'curl up', 'cut across',
  'cut back', 'cut down', 'cut in', 'cut into', 'cut off',
  'cut out', 'cut through', 'cut up',
  // D
  'dabble in', 'damage as', 'dance around', 'dare to', 'darken up',
  'dash off', 'date back', 'date from', 'dawn on', 'dawn upon',
  'deal in', 'deal with', 'decide against', 'decide on', 'decide to',
  'declare for', 'declare war', 'decline to', 'dedicate to', 'deduct from',
  'deem as', 'deepen in', 'defeat as', 'defend against', 'defend from',
  'define as', 'delay in', 'delight in', 'deliver from', 'deliver over',
  'deliver up', 'demand for', 'demand of', 'demand to', 'depart from',
  'depend on', 'depict as', 'derive from', 'deserve of', 'design as',
  'designate as', 'desire for', 'despair of', 'detach from', 'detail as',
  'detect in', 'determine as', 'determine to', 'detract from', 'develop into',
  'develop out of', 'deviate from', 'devote to', 'diagnose as', 'die down',
  'die for', 'die from', 'die of', 'die out', 'differ from',
  'differ with', 'dig in', 'dig into', 'dig out', 'dig up',
  'dilute with', 'dip into', 'direct at', 'direct to', 'disagree about',
  'disagree with', 'disappear to', 'disappoint at', 'disappoint in', 'disapprove of',
  'disassociate from', 'disbelieve in', 'discharge from', 'disclose to', 'disconnect from',
  'discontented with', 'discourage from', 'discover from', 'discuss with', 'disengage from',
  'disgrace as', 'disguise as', 'disgusted by', 'disgusted with', 'dislike for',
  'dismantle as', 'disparage as', 'dispense with', 'dispose of', 'disprove of',
  'dispute with', 'disregard for', 'disrupt as', 'dissatisfied with', 'distance from',
  'distinguish as', 'distort as', 'distract from', 'distribute over', 'disturb in',
  'dive in', 'divide among', 'divide by', 'divide into', 'divide up',
  'divorce from', 'do about', 'do away with', 'do for', 'do in',
  'do into', 'do out of', 'do over', 'do up', 'do with',
  'do without', 'dock as', 'document as', 'dodge out', 'dominate over',
  'donate to', 'doom to', 'dose up', 'double as', 'double back',
  'double over', 'double up', 'doubt of', 'downgrade as', 'doze off',
  'drag on', 'drag out', 'draw aside', 'draw back', 'draw down',
  'draw in', 'draw into', 'draw off', 'draw on', 'draw out',
  'draw to', 'draw up', 'dream about', 'dream of', 'dream up',
  'dress down', 'dress up', 'drift along', 'drift away', 'drift into',
  'drill into', 'drink in', 'drink to', 'drive at', 'drive away',
  'drive back', 'drive down', 'drive in', 'drive into', 'drive off',
  'drive on', 'drive out', 'drive through', 'drive up', 'drop around',
  'drop away', 'drop back', 'drop behind', 'drop by', 'drop down',
  'drop in','drop into', 'drop off', 'drop out', 'drop over',
  'drop round', 'drop through', 'drop to', 'drown in', 'drown out',
  'drug up', 'drum into', 'drum up', 'dry off', 'dry out',
  'dry up', 'dual as', 'dub as', 'duck out', 'dull down',
  'dumb down', 'dump on', 'dust off', 'dwell in', 'dwell on',
  'dwell upon', // E
  'earn as', 'earn for', 'ease off', 'ease out', 'eat away',
  'eat in', 'eat into', 'eat out', 'eat up', 'edge away',
  'edge in', 'edge out', 'edit out', 'egg on', 'elect as',
  'eliminate from', 'embark on', 'embed in', 'embrace as', 'emerge from',
  'emphasize as', 'employ as', 'employ in', 'empty out', 'enable to',
  'end in', 'end up', 'endure to', 'enforce upon', 'engage in',
  'engage with', 'engross in', 'enjoy doing', 'enjoy from', 'enlarge on',
  'enlighten about', 'enlist in', 'enlist under', 'enlist with', 'enough to',
  'enrich with', 'enroll in', 'ensue from', 'ensure from', 'enter for',
  'enter into', 'enter on', 'enter upon', 'entertain about', 'entertain with',
  'entitle to', 'equal to', 'equip for', 'equip with', 'erase from',
  'erupt into', 'escape from', 'especially as', 'establish as', 'estimate as',
  'evaluate as', 'even if', 'even out', 'even though', 'even up',
  'ever so', 'every now and then', 'every time', 'exact from', 'exaggerate about',
  'examine as', 'excel at', 'excel in', 'except to', 'excess of',
  'exchange for', 'excite about', 'excite at', 'exclude from', 'excuse from',
  'excuse from doing', 'exercise in', 'exhaust from', 'exhibit as', 'exist in',
  'exist on', 'expand in', 'expand into', 'expand on', 'expand to',
  'expect from', 'expect of', 'expend in', 'experience in', 'experiment with',
  'explain away', 'explain for', 'explain to', 'explode in', 'exploit as',
  'explore as', 'expose to', 'express as', 'express in', 'extend to',
  // F
  'face away', 'face down', 'face off', 'face on', 'face onto',
  'face up', 'face up to', 'factor in', 'fade away', 'fade in',
  'fade into', 'fade out', 'fail in', 'fail to', 'faint in',
  'fair as', 'fall about', 'fall apart', 'fall away', 'fall back',
  'fall behind', 'fall down', 'fall for', 'fall from', 'fall in',
  'fall into', 'fall in love', 'fall off', 'fall on', 'fall out',
  'fall over', 'fall through', 'fall to', 'fall under', 'fall within',
  'falsify as', 'familiarize with', 'familiar to', 'famous for', 'fan out',
  'farm out', 'fascinate by', 'fashion after', 'fasten on', 'fasten onto',
  'fasten to', 'fathom out', 'favor with', 'fear for', 'feed back',
  'feed in', 'feed into', 'feed on', 'feed up', 'feel about',
  'feel around', 'feel at', 'feel for', 'feel like', 'feel of',
  'feel out', 'feel through', 'feel to', 'feel up', 'feel up to',
  'feel towards', 'fight back', 'fight down', 'fight off', 'fight out',
  'figure in', 'figure on', 'figure out', 'figure up', 'fill in',
  'fill into', 'fill out', 'fill up', 'filter in', 'filter out',
  'filter through', 'find as', 'find for', 'find out', 'fine-tune',
  'finish off', 'finish up', 'finish with', 'fire away', 'fire off',
  'fire up', 'fit in', 'fit into', 'fit on', 'fit out',
  'fit up', 'fix on', 'fix up', 'flag down', 'flare up',
  'flash back', 'flesh out', 'float around', 'flock to', 'flood in',
  'flood into', 'flood out', 'floor with', 'flounder in', 'flow from',
  'flow in', 'flow into', 'flow out', 'fluctuate between', 'fly about',
  'fly around', 'fly at', 'fly away', 'fly by', 'fly in',
  'fly into', 'fly off', 'fly out', 'fly over', 'fly through',
  'focus on', 'fog up', 'fold up', 'follow after', 'follow in',
  'follow into', 'follow on', 'follow out', 'follow through', 'follow up',
  'force into', 'force on', 'force out', 'forge ahead', 'form from',
  'form into', 'form out of', 'formulate as', 'fortify with', 'fossilize as',
  'foul up', 'frame as', 'frighten away', 'frighten into', 'frighten off',
  'fritter away', 'frogmarch', 'front for', 'frown at', 'froze over',
  'fry up', 'fuck about', 'fuck around', 'fuck off', 'fuck up',
  'fulfill as', 'full up', 'fumble around', 'fume over', 'function as',
  'fund as', 'funnel into', 'fuse together', 'fuss about', 'fuss over',
  // G
  'gain access', 'gain by', 'gain from', 'gain in', 'gain on',
  'gain over', 'gallop through', 'gamble away', 'gamble on', 'gang up',
  'gape at', 'gas up', 'gather in', 'gather up', 'gauge from',
  'gaze at', 'gear to', 'gear towards', 'gear up', 'gel with',
  'generalize about', 'generate as', 'get about', 'get above', 'get across',
  'get after', 'get ahead', 'get along', 'get apart', 'get around',
  'get around to', 'get at', 'get away', 'get away from', 'get away with',
  'get back', 'get behind', 'get between', 'get beyond', 'get by',
  'get down', 'get down to', 'get in', 'get in on', 'get in with',
  'get into', 'get into trouble', 'get it', 'get off', 'get off with',
  'get on', 'get on for', 'get on with', 'get out', 'get out of',
  'get over', 'get over with', 'get past', 'get rid of', 'get round',
  'get through', 'get through to', 'get to', 'get together', 'get up',
  'get up to', 'ghostwrite', 'gird up', 'give about', 'give away',
  'give back', 'give down', 'give forth', 'give in', 'give into',
  'give it to', 'give off', 'give on to', 'give out', 'give over',
  'give up', 'give up on', 'give way to', 'glance at', 'glance off',
  'glare at', 'gleam with', 'glide through', 'glimmer with', 'glint with',
  'glisten with', 'glow with', 'glue together', 'go about', 'go after',
  'go against', 'go ahead', 'go along', 'go along with', 'go around',
  'go away', 'go back', 'go back on', 'go before', 'go behind',
  'go beyond', 'go by', 'go down', 'go down on', 'go for', 'go forth',
  'go forward', 'go from', 'go in', 'go in for', 'go in into',
  'go into', 'go off', 'go off with', 'go on', 'go on about',
  'go on at', 'go on to', 'go on with', 'go out', 'go out for',
  'go out of', 'go out with', 'go over', 'go past', 'go round',
  'go through', 'go through with', 'go to', 'go under', 'go up',
  'go with', 'go without', 'gobble up', 'goof off', 'goof up',
  'grace with', 'grade as', 'graduate from', 'graft on', 'grant to',
  'grasp at', 'grate on', 'gravitate toward', 'graze on', 'grease up',
  'greet with', 'grey out', 'grieve for', 'grieve over', 'grimace at',
  'grind away', 'grind down', 'grind into', 'grind out', 'grind up',
  'grip on', 'grit at', 'gross out', 'ground on', 'grow apart',
  'grow away', 'grow back', 'grow down', 'grow from', 'grow into',
  'grow on', 'grow out', 'grow out of', 'grow over', 'grow through',
  'grow to', 'grow toward', 'grow up', 'grow upon', 'guard against',
  'guess at', 'guide through', 'gulp down', 'gum up', 'gun down',
  'gut out', 'guts out',
  // H
  'hack around', 'hack at', 'hack into', 'hack through', 'hail as',
  'hail from', 'halve as', 'hammer at', 'hammer away', 'hammer in',
  'hammer into', 'hammer out', 'hand down', 'hand in', 'hand off',
  'hand on', 'hand out', 'hand over', 'hand round', 'hand up',
  'handle as', 'hang about', 'hang around', 'hang back', 'hang on',
  'hang onto', 'hang out', 'hang over', 'hang together', 'hang up',
  'hanker after', 'happen along', 'happen to', 'harbor as', 'harden off',
  'harden up', 'harm as', 'harness to', 'harp on', 'hash over',
  'hatch out', 'hate to', 'haul away', 'haul off', 'have a feel for',
  'have around', 'have at', 'have coming', 'have down', 'have for',
  'have in', 'have it', 'have it in for', 'have it out', 'have on',
  'have out', 'have over', 'have round', 'have to do with', 'have up',
  'head for', 'head in', 'head into', 'head off', 'head out',
  'head up', 'heal over', 'heal up', 'heap up', 'hear about',
  'hear from', 'hear of', 'hear out', 'heat up', 'heave to',
  'help along', 'help down', 'help in', 'help off', 'help on',
  'help out', 'help to', 'help up', 'hem in', 'hemp in',
  'hesitate at', 'hew to', 'hibernate in', 'hide away', 'hide out',
  'hike up', 'hinder from', 'hint at', 'hip to', 'hire out',
  'hit back', 'hit for', 'hit it off', 'hit off', 'hit on',
  'hit out', 'hit up', 'hit upon', 'hoard up', 'hoe down',
  'hog up', 'hold against', 'hold back', 'hold down', 'hold forth',
  'hold in', 'hold off', 'hold on', 'hold onto', 'hold out',
  'hold over', 'hold to', 'hold together', 'hold up', 'hole up',
  'hollow out', 'home in', 'hone in', 'hook onto', 'hook up',
  'hoot down', 'hope for', 'hopped up', 'horde in', 'horrify by',
  'horse around', 'hound out', 'hunker down', 'hunt down', 'hunt out',
  'hunt up', 'hurl away', 'hurl down', 'hurry along', 'hurry away',
  'hurry back', 'hurry down', 'hurry in', 'hurry into', 'hurry on',
  'hurry out', 'hurry up', 'hurt for', 'hush up', 'hutch up',
  // I
  'identify as', 'identify with', 'idle away', 'ignite as', 'ignore as',
  'ill treat', 'imagine as', 'imbibe with', 'imitate as', 'immerse in',
  'impact on', 'impair as', 'impart to', 'impeach as', 'impede as',
  'imperil as', 'implement as', 'implicate as', 'impose on', 'impose upon',
  'impress upon', 'imprint on', 'improve in', 'improve on', 'improve upon',
  'improvise on', 'incline to', 'include in', 'include within', 'increase in',
  'increase to', 'incur as', 'indent as', 'index as', 'indicate as',
  'indict as', 'individualize as', 'induce as', 'indulge in', 'infer from',
  'inflate as', 'inflict on', 'influence as', 'inform against', 'inform on',
  'inform of', 'infringe on', 'infuse with', 'ingest as', 'inhibit from',
  'initial as', 'inject into', 'injure as', 'innovate on', 'input as',
  'inscribe on', 'insert into', 'inset as', 'insist on', 'inspire to',
  'install in', 'install as', 'instantiate as', 'instead of', 'institute as',
  'insulate from', 'insure against', 'integrate into', 'integrate with',
  'integrate in', 'intend as', 'intend for', 'intensify as', 'interact with',
  'interbreed as', 'intercalate as', 'interchange between', 'interchange with',
  'interest in', 'interfere in', 'interfere with', 'interject into', 'interlace as',
  'interlay as', 'interlink as', 'interlock as', 'intermix as', 'intern as',
  'interpolate into', 'interpret as', 'interrelate with', 'interrogate as',
  'interrupt as', 'intersect as', 'intersperse as', 'intertwine as', 'interweave as',
  'interview as', 'interweave with', 'introduce into', 'introduce to', 'invade as',
  'invent as', 'inventory as', 'invest in', 'investigate as', 'invite to',
  'involve in', 'involve with', 'iron out', 'isolate as', 'issue as',
  // J
  'jazz up', 'jeopardize as', 'jetison as', 'join in', 'join into',
  'join on', 'join to', 'join together', 'join up', 'joint as',
  'joke about', 'joke with', 'jolly along', 'judge as', 'juggle around',
  'juice up', 'jump at', 'jump in', 'jump into', 'jump off',
  'jump on', 'jump out', 'jump over', 'jump through', 'jump to',
  'jump up', 'justify as', // K
  'keeps on', 'keep about', 'keep after', 'keep apart', 'keep around',
  'keep at', 'keep away', 'keep back', 'keep behind', 'keep between',
  'keep down', 'keep from', 'keep in', 'keep in mind', 'keep in touch',
  'keep off', 'keep on', 'keep on doing', 'keep out', 'keep out of',
  'keep to', 'keep together', 'keep under', 'keep up', 'keep up with',
  'key in', 'key into', 'key on', 'key up', 'kick about',
  'kick around', 'kick back', 'kick down', 'kick in', 'kick off',
  'kick out', 'kick up', 'kid around', 'kill off', 'kill time',
  'kill up', 'kiss away', 'kiss off', 'knit together', 'knock about',
  'knock around', 'knock back', 'knock down', 'knock in', 'knock into',
  'knock off', 'knock on', 'knock out', 'knock over', 'knock through',
  'knock together', 'knock up', 'know about', 'know as', 'know from',
  'know of', 'know apart', // L
  'label as', 'labor under', 'lace into', 'lack for', 'ladder up',
  'lag behind', 'lament for', 'laminate as', 'land in', 'land on',
  'land up', 'lap up', 'large for', 'latch on', 'latch onto',
  'later on', 'laugh about', 'laugh at', 'laugh away', 'laugh off',
  'launch into', 'lawyer up', 'lay about', 'lay aside', 'lay away',
  'lay by', 'lay down', 'lay for', 'lay in', 'lay into',
  'lay off', 'lay on', 'lay out', 'lay over', 'lay to',
  'lay up', 'lead around', 'lead away', 'lead back', 'lead into',
  'lead off', 'lead on', 'lead to', 'lead up', 'lead with',
  'leaf through', 'lean against', 'lean on', 'lean towards', 'lean toward',
  'leap at', 'leap in', 'leap into', 'leap out', 'leap over',
  'leap to', 'learn about', 'learn by', 'learn from', 'learn of',
  'learn off', 'learn up', 'leave about', 'leave alone', 'leave aside',
  'leave at', 'leave behind', 'leave for', 'leave in', 'leave off',
  'leave out', 'leave over', 'leave to', 'leave up', 'ledge out',
  'legalize as', 'lend out', 'lend to', 'lengthen as', 'lessen as',
  'level off', 'level out', 'lever in', 'leverage as', 'libel as',
  'license as', 'lie about', 'lie around', 'lie back', 'lie behind',
  'lie down', 'lie in', 'lie off', 'lie out', 'lie over',
  'lie to', 'lie up', 'lift off', 'light on', 'light up',
  'like to', 'limit to', 'line up', 'linger on', 'linger over',
  'link up', 'liquidate as', 'list as', 'listen for', 'listen in',
  'listen to', 'listen up', 'litigate as', 'live above', 'live across',
  'live among', 'live apart', 'live around', 'live at', 'live beyond',
  'live by', 'live down', 'live for', 'live in', 'live it up',
  'live near', 'live off', 'live on', 'live out', 'live through',
  'live to', 'live together', 'live under', 'live up', 'live up to',
  'live with', 'liven up', 'load down', 'load up', 'loan out',
  'locate in', 'lock away', 'lock in', 'lock onto', 'lock out',
  'lock up', 'log in', 'log into', 'log off', 'log on',
  'log out', 'long for', 'look about', 'look after', 'look ahead',
  'look around', 'look as', 'look at', 'look away', 'look back',
  'look down', 'look for', 'look forward to', 'look in', 'look into',
  'look like', 'look off', 'look on', 'look out', 'look out for',
  'look over', 'look round', 'look through', 'look to', 'look toward',
  'look up', 'look up to', 'look upon', 'look with', 'loop in',
  'loop up', 'loose as', 'loosen up', 'lose at', 'lose in',
  'lose out', 'lose out on', 'lose over', 'lose to', 'love to',
  'low as', 'lower as', 'luck into', 'luck out', 'lug in',
  // M
  'machine as', 'magnify as', 'mail out', 'major in', 'make after',
  'make against', 'make away', 'make away with', 'make for', 'make forward',
  'make from', 'make fun of', 'make heads or tails of', 'make into', 'make it',
  'make light of', 'make love', 'make much of', 'make no bones about', 'make of',
  'make off', 'make off with', 'make out', 'make over', 'make room for',
  'make sure', 'make the most of', 'make through', 'make to', 'make toward',
  'make up', 'make up for', 'make up to', 'make with', 'manage as',
  'mandate as', 'manipulate as', 'manoeuvre as', 'map onto', 'march in',
  'march off', 'mark down', 'mark off', 'mark out', 'mark up',
  'mask as', 'master as', 'match up', 'mate with', 'materialize as',
  'matter to', 'mature as', 'max out', 'maybe as', 'mean as',
  'meant to', 'measure against', 'measure as', 'measure for', 'measure out',
  'measure up', 'mediate as', 'medicate as', 'meet as', 'meet up',
  'meet with', 'melt down', 'memorize as', 'mend as', 'mentor as',
  'merge into', 'merge with', 'mesh with', 'message as', 'metastasize as',
  'meter out', 'midwife as', 'might as well', 'migrate as', 'militarize as',
  'milk as', 'mime as', 'mind as', 'mind you', 'mine as',
  'minimize as', 'minister to', 'minor in', 'mint as', 'mislead as',
  'miss out', 'miss out on', 'mistake for', 'mix in', 'mix into',
  'mix up', 'moan about', 'mob up', 'mock up', 'model after',
  'model as', 'model on', 'modify as', 'modulate as', 'mold as',
  'mold into', 'mold to', 'mold up', 'monopolize as', 'moo as',
  'mood as', 'moon as', 'moonlight as', 'mope about', 'more than',
  'mortgage as', 'mother as', 'motion as', 'motor as', 'mount up',
  'mouth off', 'move about', 'move along', 'move around', 'move aside',
  'move away', 'move back', 'move down', 'move for', 'move forward',
  'move in', 'move in on', 'move into', 'move off', 'move on',
  'move out', 'move over', 'move through', 'move to', 'move toward',
  'move up', 'much as', 'muddy up', 'mull over', 'mumble about',
  'munch on', 'murder as', 'muscle in', 'must as', 'muster up',
  'mythologize as',
  // N
  'narrow down', 'narrow to', 'nationalize as', 'naturalize as', 'near to',
  'nearly as', 'neaten up', 'need to', 'neglect to', 'negotiate as',
  'neigh as', 'neither here nor there', 'nestle in', 'network as',
  'nibble away', 'nickel-and-dime as', 'nickname as', 'nip away',
  'nip in', 'nip into', 'nip off', 'nip out', 'nod off',
  'nominate as', 'norm as', 'normalize as', 'nose about', 'nose around',
  'nose into', 'nose out', 'nudge as', 'number as', 'number off',
  'nurse as', 'nurture as',
  // O
  'object to', 'obligate as', 'obligate to', 'observe as', 'obsess over',
  'obstruct as', 'obtain as', 'occupy as', 'occur to', 'offer as',
  'officiate as', 'ointment as', 'okay as', 'once and for all', 'once in a while',
  'one another', 'one or two', 'operate as', 'opinionate as', 'oppose to',
  'oppose with', 'opt for', 'opt in', 'opt out', 'opt to',
  'orchestrate as', 'order about', 'order around', 'order in', 'order out',
  'orient as', 'orientate as', 'originate as', 'originate in', 'originate from',
  'oscillate as', 'ostracize as', 'ought to', 'outmaneuver as', 'outmatch as',
  'outperform as', 'outrank as', 'outscore as', 'outshine as', 'outsmart as',
  'outspread as', 'outstand as', 'outweigh as', 'over as', 'overdo as',
  'overestimate as', 'overflow as', 'overhaul as', 'overhear as', 'overlap as',
  'overload as', 'overlook as', 'overpower as', 'overprice as', 'overrate as',
  'overreach as', 'override as', 'overrule as', 'overrun as', 'oversee as',
  'oversell as', 'overshoot as', 'oversimplify as', 'oversleep as', 'overspecialize as',
  'overspend as', 'overspread as', 'overstate as', 'overstock as', 'overstudy as',
  'overtake as', 'overthrow as', 'overturn as', 'overweight as', 'overwhelm as',
  'overwinter as', 'overwork as', 'own as', 'own up',
  // P
  'pace off', 'pace out', 'pack as', 'pack away', 'pack in',
  'pack off', 'pack out', 'package as', 'pad out', 'page through',
  'pain for', 'paint as', 'paint in', 'paint out', 'paint over',
  'paint with', 'pair off', 'pair up', 'pal around', 'pan out',
  'pant for', 'paper over', 'parade as', 'parallel as', 'paramount to',
  'parcel out', 'parcel up', 'park as', 'part from', 'part with',
  'participate as', 'participate in', 'particularize as', 'particulate as',
  'partook in', 'partner as', 'party as', 'pass around', 'pass as',
  'pass away', 'pass back', 'pass by', 'pass down', 'pass for',
  'pass in', 'pass into', 'pass off', 'pass on', 'pass out',
  'pass over', 'pass through', 'pass to', 'pass up', 'pass with',
  'paste up', 'pat down', 'patch together', 'patch up', 'pause for',
  'pave over', 'pave the way', 'pay as', 'pay attention to', 'pay back',
  'pay down', 'pay for', 'pay in', 'pay into', 'pay off',
  'pay out', 'pay through the nose', 'pay to', 'pay up', 'peak as',
  'peck at', 'peg away', 'peg down', 'pen in', 'pen up',
  'penalize as', 'penetrate as', 'pension off', 'pepper as', 'pep up',
  'perceive as', 'perch as', 'percolate through', 'perfect as', 'perform as',
  'perhaps as', 'peril as', 'periodize as', 'perish as', 'permit as',
  'perpetuate as', 'persist in', 'personalize as', 'personify as', 'persuade as',
  'persuade into', 'pester as', 'pet as', 'phase in', 'phase out',
  'phone in', 'phone up', 'photocopy as', 'phrase as', 'pick apart',
  'pick at', 'pick off', 'pick on', 'pick out', 'pick over',
  'pick to', 'pick up', 'pick up on', 'picture as', 'piece together',
  'piece out', 'pierce as', 'pig out', 'pile in', 'pile into',
  'pile on', 'pile out', 'pile up', 'pin down', 'pin in',
  'pin on', 'pin out', 'pin up', 'pinch hit', 'pioneer as',
  'pipe down', 'pipe up', 'piss about', 'piss around', 'piss off',
  'pitch in', 'pitch into', 'pitch on', 'pitch out', 'pit against',
  'pivot as', 'place as', 'place at', 'place in', 'place into',
  'place on', 'plague as', 'plan on', 'plane as', 'plant as',
  'play around', 'play as', 'play at', 'play away', 'play back',
  'play down', 'play off', 'play on', 'play out', 'play up',
  'play up to', 'play with', 'plead as', 'please as', 'pledge to',
  'plenty as', 'plot against', 'plot as', 'plot out', 'pluck at',
  'plug away', 'plug in', 'plug into', 'plug up', 'plumb as',
  'plumb the depths', 'plump down', 'plunge into', 'plus as', 'pocket as',
  'poem as', 'point at', 'point away', 'point-blank', 'point down',
  'point in', 'point into', 'point of', 'point off', 'point out',
  'point to', 'point toward', 'point up', 'poise as', 'poison as',
  'poke about', 'poke around', 'poke at', 'poke into', 'poke out',
  'poke through', 'polarize as', 'polish off', 'polish up', 'politicize as',
  'pollute as', 'poor as', 'populate as', 'portray as', 'pose as',
  'position as', 'positive as', 'post as', 'postpone to', 'pouch as',
  'pound out', 'pour down', 'pour into', 'pour out', 'pour over',
  'pout as', 'practice as', 'praise as', 'pray as', 'preach as',
  'precipitate as', 'preclude as', 'preconize as', 'predicate as', 'predict as',
  'predispose as', 'prefer as', 'prefer to', 'prefigure as', 'prefix as',
  'prejudge as', 'prejudice as', 'premiate as', 'prepare as', 'prepone to',
  'prescribe as', 'present as', 'preserve as', 'preside as', 'preside over',
  'press against', 'press as', 'press for', 'press forward', 'press in',
  'press on', 'press out', 'press to', 'pressure as', 'prestige as',
  'presume as', 'presuppose as', 'pretend as', 'pretty up', 'prevail on',
  'prevail upon', 'prevent as', 'prey on', 'prey upon', 'price as',
  'prick up', 'prime as', 'print as', 'prioritize as', 'prize as',
  'probe as', 'probe into', 'proceed as', 'proceed to', 'process as',
  'proclaim as', 'procrastinate as', 'produce as', 'professionalize as', 'profile as',
  'profit as', 'profit by', 'program as', 'programme as', 'progress as',
  'prohibit as', 'project as', 'proliferate as', 'promenade as', 'promise as',
  'promote as', 'prompt as', 'promulgate as', 'propagate as', 'propel as',
  'propose as', 'proposition as', 'propound as', 'prospect as', 'protect as',
  'protest as', 'proud as', 'prove as', 'provide against', 'provide as',
  'provide for', 'provide with', 'provoke as', 'provision as', 'provoke into',
  'psyche out', 'publicize as', 'pucker up', 'puff out', 'puff up',
  'pull about', 'pull apart', 'pull away', 'pull back', 'pull down',
  'pull for', 'pull in', 'pull into', 'pull off', 'pull on',
  'pull out', 'pull over', 'pull through', 'pull to', 'pull toward',
  'pull up', 'pump as', 'pump in', 'pump into', 'pump out',
  'pump up', 'punch in', 'punch out', 'punish as', 'purchase as',
  'pure as', 'purify as', 'pursue as', 'push about', 'push around',
  'push aside', 'push back', 'push down', 'push for', 'push forward',
  'push in', 'push into', 'push off', 'push on', 'push out',
  'push over', 'push through', 'push to', 'push toward', 'push up',
  'put across', 'put aside', 'put away', 'put back', 'put before',
  'put behind', 'put by', 'put down', 'put forth', 'put forward',
  'put in', 'put into', 'put off', 'put on', 'put out',
  'put over', 'put past', 'put through', 'put to', 'put together',
  'put toward', 'put under', 'put up', 'put up with', 'put upon',
  'puzzle out', 'puzzle over',
  // Q
  'qualify as', 'quantify as', 'quarter as', 'query as', 'quest as',
  'question as', 'queue up', 'quick-freeze as', 'quiet as', 'quintessence as',
  'quit as', 'quiz as', // R
  'race against', 'race around', 'race away', 'race into', 'race through',
  'race up', 'rack up', 'raffle as', 'rage as', 'rage against',
  'raid as', 'rail at', 'rail against', 'raise as', 'raise up',
  'rake about', 'rake around', 'rake in', 'rake off', 'rake out',
  'rake over', 'rally around', 'rally to', 'ramble on', 'ranch as',
  'range as', 'rank as', 'rant at', 'rant about', 'rap out',
  'rare as', 'rasp as', 'rate as', 'rather as', 'rather than',
  'rationalize as', 'rattle off', 'rattle on', 'rave about', 'reach as',
  'reach for', 'reach into', 'reach out', 'reach to', 'react as',
  'react against', 'react to', 'read as', 'read back', 'read for',
  'read in', 'read into', 'read off', 'read on', 'read out',
  'read through', 'read up', 'read up on', 'ready as', 'realize as',
  'reappear as', 'rear as', 'rearrange as', 'reason out', 'reassure as',
  'rebuild as', 'recall as', 'recap as', 'recast as', 'receive as',
  'recite as', 'recognize as', 'recommend as', 'reconcile as', 'reconsider as',
  'reconstruct as', 'record as', 'recover as', 'recover from', 'recruit as',
  'rectify as', 'recycle as', 'redesign as', 'reduce as', 'reduce to',
  'reelect as', 'refer as', 'refer to', 'reference as', 'refine as',
  'reflate as', 'reflect as', 'reflect on', 'reflect upon', 'reform as',
  'refound as', 'refrain from', 'refresh as', 'refuel as', 'refurbish as',
  'refuse as', 'refute as', 'regard as', 'regenerate as', 'register as',
  'regret to', 'regulate as', 'rehab as', 'rehash as', 'reign as',
  'reignite as', 'reinforce as', 'reinsert as', 'reinstate as', 'reinterpret as',
  'reintroduce as', 'reinvent as', 'rejoin as', 'relate as', 'relate to',
  'relate with', 'relax as', 'relay as', 'release as', 'relent as',
  'rely on', 'remain as', 'remainder as', 'remand as', 'remark as',
  'remember as', 'remind of', 'remit as', 'remix as', 'remold as',
  'remortgage as', 'remove as', 'rename as', 'render as', 'rendezvous as',
  'renege on', 'renew as', 'renovate as', 'rent as', 'rent out',
  'reoccur as', 'repair as', 'repatriate as', 'repeal as', 'repeat as',
  'repel as', 'repent as', 'replace as', 'replace with', 'replay as',
  'report as', 'represent as', 'repress as', 'reproduce as', 'republicize as',
  'repudiate as', 'request as', 'require as', 'rescue as', 'resemble as',
  'resent as', 'reserve as', 'reset as', 'reshape as', 'reside as',
  'resign as', 'resign to', 'resist as', 'resolve as', 'resort as',
  'respect as', 'respond as', 'respond to', 'rest as', 'rest on',
  'rest upon', 'restore as', 'restrain as', 'restrict as', 'result as',
  'result in', 'resume as', 'retail as', 'retain as', 'retire as',
  'retort as', 'retract as', 'retrieve as', 'retrofit as', 'return as',
  'return to', 'reunite as', 'reveal as', 'revere as', 'review as',
  'revise as', 'revive as', 'revolve as', 'reward as', 'reward with',
  'rhapsodize as', 'rid of', 'riddle as', 'ride as', 'ride away',
  'ride down', 'ride off', 'ride on', 'ride out', 'ride over',
  'ride through', 'ride up', 'ridge as', 'ridicule as', 'right as',
  'right-size as', 'rim as', 'ring around', 'ring as', 'ring back',
  'ring in', 'ring off', 'ring out', 'ring up', 'riot as',
  'rip as', 'rip away', 'rip off', 'rip out', 'rip through',
  'ripe as', 'ripple as', 'rise as', 'rise up', 'risk as',
  'ritualize as', 'rival as', 'roam as', 'roar as', 'roast as',
  'rob as', 'rob from', 'robe as', 'rock as', 'rock the boat',
  'rode as', 'roll as', 'roll around', 'roll away', 'roll back',
  'roll by', 'roll down', 'roll in', 'roll into', 'roll off',
  'roll on', 'roll out', 'roll over', 'roll up', 'romance as',
  'romanticize as', 'room as', 'root as', 'root for', 'root in',
  'root out', 'rope as', 'rope in', 'rope off', 'rot as',
  'rotate as', 'rotten as', 'rough as', 'rough in', 'rough out',
  'rough up', 'round as', 'round down', 'round off', 'round out',
  'round to', 'round up', 'route as', 'routine as', 'row as',
  'rub along', 'rub away', 'rub down', 'rub in', 'rub off',
  'rub out', 'rub through', 'rub up', 'ruck as', 'ruffle as',
  'ruin as', 'rule as', 'rule out', 'rumble as', 'rumple as',
  'run about', 'run across', 'run after', 'run against', 'run ahead',
  'run along', 'run amok', 'run around', 'run as', 'run away',
  'run back', 'run before', 'run behind', 'run down', 'run into',
  'run low', 'run off', 'run on', 'run out', 'run out of',
  'run over', 'run past', 'run through', 'run to', 'run together',
  'run toward', 'run up', 'run up against', 'rupture as', 'rush as',
  'rush away', 'rush in', 'rush into', 'rush off', 'rush out',
  // S
  'sabotage as', 'sacrifice as', 'saddle as', 'saddle up', 'sag as',
  'sail as', 'sail through', 'salary as', 'sanctify as', 'sanction as',
  'sand down', 'sandwich in', 'saturate as', 'saunter as', 'save as',
  'save for', 'save from', 'save on', 'save up', 'savor as',
  'saw as', 'say as', 'scale as', 'scale down', 'scale up',
  'scam as', 'scan as', 'scare as', 'scare away', 'scare off',
  'scatter as', 'scatter to', 'scavenge as', 'scheme as', 'school as',
  'scienc e as', 'scoop as', 'scoop out', 'scoop up', 'scope as',
  'scope out', 'scorn as', 'scout as', 'scout around', 'scout for',
  'scrabble as', 'scramble as', 'scrape along', 'scrape away', 'scrape by',
  'scrape in', 'scrape into', 'scrape off', 'scrape out', 'scrape through',
  'scratch as', 'scratch out', 'scratch up', 'screech as', 'screw as',
  'screw up', 'scribble as', 'scrub as', 'scrub out', 'scrutinize as',
  'sculpt as', 'sculpture as', 'seal as', 'seal in', 'seal off',
  'seal up', 'search as', 'search for', 'search out', 'season as',
  'season with', 'seclude as', 'second as', 'second as', 'secret as',
  'section as', 'secure as', 'see about', 'see as', 'see fit',
  'see off', 'see out', 'see through', 'see to', 'seed as',
  'seek as', 'seek after', 'seek for', 'seek out', 'seem as',
  'segment as', 'segregate as', 'seize as', 'seize on', 'seize upon',
  'select as', 'sell as', 'sell at', 'sell off', 'sell on',
  'sell out', 'sell up', 'send as', 'send away', 'send back',
  'send down', 'send for', 'send forth', 'send in', 'send off',
  'send on', 'send out', 'send over', 'send round', 'send through',
  'send up', 'seniorize as', 'sense as', 'sensitize as', 'sentence as',
  'separate as', 'separate from', 'sequence as', 'sequester as', 'serve as',
  'serve out', 'serve up', 'service as', 'set about', 'set against',
  'set apart', 'set aside', 'set back', 'set before', 'set beside',
  'set by', 'set down', 'set forth', 'set forward', 'set in',
  'set off', 'set on', 'set out', 'set over', 'set straight',
  'set to', 'set up', 'settle as', 'settle down', 'settle in',
  'settle into', 'settle on', 'settle up', 'settle with', 'severalize as',
  'severe as', 'sew as', 'sew up', 'shade as', 'shade from',
  'shadow as', 'shaft as', 'shake as', 'shake down', 'shake off',
  'shake out', 'shake up', 'shall as', 'shallow as', 'shame as',
  'shape as', 'shape into', 'shape up', 'share as', 'share in',
  'share out', 'share with', 'sharpen as', 'shatter as', 'shear as',
  'shed as', 'shed light on', 'sheep as', 'sheer as', 'sheet as',
  'shell as', 'shell out', 'shelter as', 'shelter in', 'shield as',
  'shield from', 'shift as', 'shift for', 'shimmer as', 'shine as',
  'shine on', 'shine through', 'ship as', 'ship off', 'shock as',
  'shoe as', 'shoo as', 'shoot as', 'shoot away', 'shoot down',
  'shoot for', 'shoot in', 'shoot off', 'shoot out', 'shoot through',
  'shoot up', 'shop as', 'shop around', 'shore as', 'shore up',
  'short as', 'short-change', 'shortlist as', 'should as', 'shoulder as',
  'shout at', 'shout down', 'shove as', 'shove off', 'shove over',
  'shove up', 'show as', 'show off', 'show on', 'show out',
  'show through', 'show to', 'show up', 'shower as', 'shred as',
  'shrink as', 'shrink from', 'shrivel as', 'shrug as', 'shrug off',
  'shunt as', 'shut away', 'shut down', 'shut in', 'shut off',
  'shut out', 'shut up', 'shuttle as', 'sicken as', 'side as',
  'side with', 'sift through', 'sigh as', 'sign as', 'sign away',
  'sign for', 'sign in', 'sign into', 'sign off', 'sign on',
  'sign out', 'sign over', 'sign to', 'sign up', 'signal as',
  'signify as', 'silt up', 'simmer down', 'simplify as', 'simulate as',
  'simultaneous as', 'sin as', 'sing as', 'sing away', 'sing out',
  'single as', 'single out', 'sink as', 'sink in', 'sink into',
  'sip as', 'sit around', 'sit as', 'sit at', 'sit back',
  'sit by', 'sit down', 'sit in', 'sit on', 'sit out',
  'sit over', 'sit through', 'sit to', 'sit up', 'sit with',
  'size as', 'size up', 'skein as', 'sketch as', 'sketch in',
  'sketch out', 'ski as', 'skid as', 'skim as', 'skim over',
  'skim through', 'skin as', 'skin as', 'skip as', 'skip off',
  'skip out', 'skip over', 'skirt around', 'skull as', 'slack as',
  'slacken as', 'slander as', 'slap as', 'slash as', 'slate as',
  'slay as', 'sled as', 'sledge as', 'sleek as', 'sleep as',
  'sleep in', 'sleep off', 'sleep on', 'sleep out', 'sleep over',
  'sleep through', 'sleep together', 'sleep with', 'sleet as', 'slice as',
  'slice into', 'slice off', 'slide as', 'slide down', 'slide in',
  'slide into', 'slide off', 'slide over', 'slide through', 'slide up',
  'slim as', 'slim down', 'sling as', 'slink as', 'slip as',
  'slip away', 'slip by', 'slip down', 'slip in', 'slip into',
  'slip off', 'slip out', 'slip over', 'slip past', 'slip through',
  'slip up', 'slit as', 'sliver as', 'slobber as', 'slog as',
  'slop as', 'slop out', 'slope as', 'slope away', 'slope off',
  'slosh as', 'slosh through', 'slot as', 'slow as', 'slow down',
  'slow up', 'slug as', 'slug out', 'slump as', 'slur as',
  'smack as', 'small as', 'smart as', 'smash as', 'smear as',
  'smell as', 'smell out', 'smell up', 'smile as', 'smile at',
  'smile on', 'smoke as', 'smoke out', 'smoke up', 'smooth as',
  'smooth down', 'smooth out', 'smooth over', 'smooth up', 'smother as',
  'snack as', 'snag as', 'snap as', 'snap at', 'snap out',
  'snap up', 'snare as', 'snarl as', 'snatch as', 'snatch at',
  'snatch away', 'sneak as', 'sneak away', 'sneak in', 'sneak out',
  'sneak up', 'sniff as', 'sniff out', 'snip as', 'snippet as',
  'snitch as', 'snivel as', 'snore as', 'snort as', 'snow as',
  'snow under', 'soak as', 'soak in', 'soak into', 'soak through',
  'soak up', 'soap as', 'soar as', 'sober as', 'sober up',
  'socal l as', 'solder as', 'soldier as', 'sole as', 'solemn as',
  'solicit as', 'solidify as', 'solve as', 'some as', 'some time',
  'somewhat as', 'somewhere as', 'sonnet as', 'soon as', 'soothe as',
  'sop up', 'sophisticate as', 'sore as', 'sorrow as', 'sort as',
  'sort out', 'sound as', 'sound off', 'sound out', 'sour as',
  'source as', 'souse as', 'sow as', 'sow in', 'space as',
  'span as', 'spank as', 'spare as', 'spark as', 'sparkle as',
  'speak as', 'speak at', 'speak for', 'speak of', 'speak on',
  'speak out', 'speak to', 'speak up', 'specialize as', 'speculate as',
  'speed as', 'speed up', 'spell as', 'spell out', 'spend as',
  'spend on', 'spice as', 'spice up', 'spill as', 'spill over',
  'spin as', 'spin off', 'spin out', 'spin up', 'spirit as',
  'spit as', 'spit out', 'spite as', 'splash as', 'splash around',
  'splash down', 'splash out', 'splatter as', 'splice as', 'splint as',
  'split as', 'split off', 'split on', 'split open', 'split out',
  'split up', 'spoil as', 'sponge as', 'sponge down', 'sponge off',
  'sponsor as', 'spot as', 'spot-check', 'sprain as', 'spread as',
  'spread around', 'spread out', 'spread over', 'spread through', 'spread up',
  'spring as', 'spring from', 'spring up', 'sprint as', 'sprout as',
  'spruce up', 'sputter as', 'spy as', 'spy on', 'squash as',
  'squat as', 'squeak as', 'squeak by', 'squeak out', 'squeal as',
  'squeeze as', 'squeeze in', 'squeeze into', 'squeeze out', 'squeeze up',
  'squirm as', 'squit as', 'stab as', 'stabilize as', 'stage as',
  'stage-manage', 'stagger as', 'stain as', 'stake as', 'stake out',
  'stall as', 'stall out', 'stamp as', 'stamp down', 'stamp out',
  'stand about', 'stand against', 'stand apart', 'stand around', 'stand as',
  'stand at', 'stand away', 'stand back', 'stand behind', 'stand by',
  'stand down', 'stand for', 'stand in', 'stand in for', 'stand into',
  'stand off', 'stand on', 'stand out', 'stand over', 'stand to',
  'stand under', 'stand up', 'stand up for', 'stand up to', 'stand with',
  'standardize as', 'staple as', 'star as', 'stare as', 'stare at',
  'stare out', 'start as', 'start back', 'start in', 'start off',
  'start on', 'start out', 'start over', 'start to', 'start up',
  'starve as', 'starve for', 'starve out', 'stash as', 'state as',
  'station as', 'statue as', 'status as', 'stay as', 'stay away',
  'stay behind', 'stay down', 'stay in', 'stay on', 'stay out',
  'stay over', 'stay put', 'stay to', 'stay up', 'steady as',
  'steal as', 'steal away', 'steal in', 'steal into', 'steal out',
  'steal over', 'steam as', 'steam up', 'steel as', 'steep as',
  'steer as', 'stem as', 'stem from', 'step as', 'step around',
  'step aside', 'step back', 'step down', 'step in', 'step into',
  'step off', 'step on', 'step out', 'step over', 'step through',
  'step to', 'step up', 'stereotype as', 'stick around', 'stick at',
  'stick by', 'stick down', 'stick from', 'stick in', 'stick into',
  'stick on', 'stick out', 'stick out for', 'stick to', 'stick together',
  'stick up', 'stick up for', 'stick with', 'stiffen as', 'still as',
  'stimulate as', 'sting as', 'sting in', 'sting into', 'stink as',
  'stir as', 'stir into', 'stir up', 'stitch as', 'stock as',
  'stock up', 'stoke up', 'stomp as', 'stone as', 'stonewall as',
  'stoop as', 'stop as', 'stop by', 'stop down', 'stop for',
  'stop in', 'stop off', 'stop on', 'stop out', 'stop over',
  'stop up', 'store as', 'storm as', 'strain as', 'strangle as',
  'strap as', 'strategize as', 'stray as', 'streak as', 'stream as',
  'streamline as', 'strengthen as', 'stress as', 'stretch as', 'stretch out',
  'strew as', 'stride as', 'strike as', 'strike at', 'strike back',
  'strike down', 'strike in', 'strike into', 'strike off', 'strike on',
  'strike out', 'strike through', 'strike up', 'string as', 'string out',
  'strip as', 'strip away', 'strip down', 'strip off', 'strive as',
  'stroke as', 'stroll as', 'struggle as', 'struggle through', 'stub as',
  'stub out', 'study as', 'study up', 'stuff as', 'stuff up',
  'stumble as', 'stumble across', 'stumble into', 'stumble on', 'stumble onto',
  'stumble out', 'stump as', 'stun as', 'stunt as', 'style as',
  'subject as', 'submit as', 'subscribe as', 'subscribe to', 'substitute as',
  'succeed as', 'succeed in', 'succeed to', 'succumb as', 'suck as',
  'suck in', 'suck into', 'suck out', 'suck up', 'suckle as',
  'sue as', 'suffer as', 'suffer from', 'suffice as', 'suffuse as',
  'suggest as', 'suit as', 'sum as', 'sum up', 'summarize as',
  'summer as', 'summon as', 'summon up', 'sung as', 'sunk as',
  'sup as', 'superimpose as', 'supervise as', 'supplant as', 'supplement as',
  'supply as', 'support as', 'suppose as', 'suppose to', 'suppress as',
  'supreme as', 'sure as', 'surface as', 'surge as', 'surrender as',
  'surround as', 'survey as', 'survive as', 'suspect as', 'suspend as',
  'sustain as', 'swallow as', 'swamp as', 'swan as', 'swarm as',
  'swear as', 'swear at', 'swear by', 'swear in', 'swear off',
  'swear to', 'sweat as', 'sweep as', 'sweep along', 'sweep away',
  'sweep down', 'sweep in', 'sweep into', 'sweep off', 'sweep out',
  'sweep over', 'sweep through', 'sweep up', 'sweeten as', 'swell as',
  'swell up', 'swept as', 'swift as', 'swim as', 'swing as',
  'swing by', 'swing into', 'swing past', 'swing round', 'switch as',
  'switch around', 'switch off', 'switch on', 'switch over', 'switch through',
  'switch to', 'symbolize as', 'sympathize as', // T
  'tabulate as', 'tag along', 'tag as', 'tag on', 'tag out',
  'tag up', 'tail as', 'tail back', 'tail off', 'tailgate as',
  'tailor as', 'taint as', 'take a back', 'take about', 'take after',
  'take apart', 'take as', 'take away', 'take back', 'take down',
  'take for', 'take for granted', 'take in', 'take in stride', 'take into',
  'take into account', 'take into consideration', 'take it', 'take it easy',
  'take it out', 'take it out on', 'take off', 'take on', 'take out',
  'take over', 'take part', 'take place', 'take through', 'take to',
  'take to heart', 'take to task', 'take up', 'take up with', 'talk around',
  'talk as', 'talk at', 'talk away', 'talk back', 'talk down',
  'talk into', 'talk of', 'talk out', 'talk out of', 'talk over',
  'talk round', 'talk through', 'talk to', 'talk up', 'talk with',
  'tally as', 'tame as', 'tamp down', 'tangle as', 'tangle up',
  'tank as', 'tank up', 'tap as', 'tap for', 'tap in',
  'tap into', 'tap off', 'tape as', 'tape up', 'taper as',
  'taper off', 'target as', 'tariff as', 'taste as', 'taste of',
  'tastings as', 'tatter as', 'taunt as', 'tax as', 'taxi as',
  'teach as', 'teach for', 'team as', 'team up', 'tear as',
  'tear apart', 'tear at', 'tear away', 'tear down', 'tear into',
  'tear off', 'tear out', 'tear through', 'tear up', 'tease as',
  'tease out', 'technical as', 'technique as', 'tedious as', 'teem as',
  'teem with', 'tell apart', 'tell as', 'tell at', 'tell off',
  'tell on', 'temper as', 'tempt as', 'tend as', 'tend to',
  'tense as', 'tension as', 'tentatively as', 'term as', 'terminate as',
  'terrify as', 'terrorize as', 'test as', 'test out', 'thank as',
  'thank for', 'that as', 'thaw as', 'thaw out', 'theorize as',
  'think about', 'think ahead', 'think as', 'think back', 'think of',
  'think out', 'think over', 'think through', 'think to', 'think up',
  'think with', 'thirst as', 'thirst for', 'this as', 'thorny as',
  'those as', 'though as', 'thought as', 'thrash about', 'thrash around',
  'thrash out', 'threaten as', 'thrill as', 'thrive as', 'thrill to',
  'throb as', 'throw about', 'throw around', 'throw aside', 'throw at',
  'throw away', 'throw back', 'throw down', 'throw in', 'throw into',
  'throw off', 'throw on', 'throw out', 'throw over', 'throw together',
  'throw up', 'thrust as', 'thrust at', 'thumb through', 'thump as',
  'thump out', 'thunder as', 'thwart as', 'tick as', 'tick away',
  'tick by', 'tick off', 'tick out', 'tick over', 'ticket as',
  'tide as', 'tide over', 'tidy up', 'tie as', 'tie back',
  'tie down', 'tie in', 'tie into', 'tie off', 'tie on',
  'tie together', 'tie up', 'tighten as', 'tighten up', 'tile as',
  'tilt as', 'timber as', 'time as', 'time out', 'times as',
  'tingle as', 'tint as', 'tip as', 'tip back', 'tip off',
  'tip out', 'tip over', 'tip up', 'tire as', 'tire out',
  'title as', 'toady as', 'toil as', 'tolerate as', 'toll as',
  'tone as', 'tone down', 'tone in', 'tone up', 'tool as',
  'tool up', 'toot as', 'top as', 'top off', 'top out',
  'top up', 'torch as', 'torn as', 'torment as', 'toss as',
  'toss about', 'toss around', 'toss aside', 'toss away', 'toss off',
  'toss out', 'toss up', 'total as', 'touch a nerve', 'touch as',
  'touch at', 'touch down', 'touch off', 'touch on', 'touch up',
  'toughen as', 'tour as', 'tournament as', 'tout as', 'tow as',
  'towel as', 'tower as', 'tower above', 'tower over', 'toy with',
  'trace as', 'trace back', 'trace to', 'track as', 'track down',
  'track in', 'track out', 'trade as', 'trade down', 'trade in',
  'trade off', 'trade on', 'trade out', 'trade up', 'trade upon',
  'traduce as', 'trail as', 'trail away', 'trail off', 'train as',
  'train on', 'trait as', 'tram as', 'tramp as', 'tranquilize as',
  'tranquillize as', 'transfer as', 'transform as', 'transgress as',
  'transit as', 'translate as', 'transliterate as', 'transmit as', 'transmute as',
  'transparent as', 'transplant as', 'transport as', 'transpose as', 'trap as',
  'trash as', 'traverse as', 'trawl as', 'tread as', 'tread lightly',
  'treat as', 'tremble as', 'trend as', 'triangulate as', 'trick as',
  'trick out', 'trigger as', 'trim as', 'trim down', 'trip as',
  'trip out', 'trip up', 'triumph as', 'trivial as', 'troop as',
  'trot as', 'trot out', 'trouble as', 'trouble about', 'trouble with',
  'troubleshoot as', 'true as', 'trump as', 'trump up', 'trunk as',
  'trust as', 'trust to', 'trust with', 'try as', 'try for',
  'try on', 'try out', 'try up', 'tube as', 'tucker out',
  'tune as', 'tune in', 'tune into', 'tune out', 'tune up',
  'tunnel as', 'tunnel through', 'turn as', 'turn about', 'turn around',
  'turn away', 'turn back', 'turn down', 'turn in', 'turn into',
  'turn off', 'turn on', 'turn out', 'turn over', 'turn to',
  'turn under', 'turn up', 'turn upon', 'tussle as', 'tutor as',
  'type as', 'typecast as', 'typify as', // U
  'ugly as', 'ulcerate as', 'unarm as', 'unbalance as', 'unbar as',
  'unbolt as', 'unbound as', 'unbrace as', 'unbraid as', 'unbuckle as',
  'unburden as', 'unbutton as', 'uncap as', 'uncouple as', 'uncross as',
  'uncurl as', 'underestimate as', 'undergo as', 'underpin as', 'underrate as',
  'underscore as', 'understate as', 'understudy as', 'undertake as', 'undervalue as',
  'underwrite as', 'undo as', 'undock as', 'undress as', 'undue as',
  'unequal as', 'unfair as', 'unfetter as', 'unfit as', 'unfold as',
  'unfreeze as', 'unhinge as', 'unhorse as', 'unify as', 'unionize as',
  'unite as', 'unite in', 'unite with', 'universalize as', 'universe as',
  'unlash as', 'unlatch as', 'unlawful as', 'unlearn as', 'unleash as',
  'unlike as', 'unlikely as', 'unload as', 'unlock as', 'unloose as',
  'unloosen as', 'unman as', 'unmask as', 'unmuzzle as', 'unnerve as',
  'unpack as', 'unpeg as', 'unpen as', 'unpick as', 'unplug as',
  'unravel as', 'unreel as', 'unreeve as', 'unriddle as', 'unrig as',
  'unrip as', 'unroll as', 'unsaddle as', 'unsay as', 'unscathe as',
  'unscrew as', 'unseal as', 'unset as', 'unsettle as', 'unshackle as',
  'unsheathe as', 'unshoe as', 'unsling as', 'unspike as', 'unstaple as',
  'unsteel as', 'unstick as', 'unstop as', 'unstuff as', 'unsuit as',
  'unsure as', 'untack as', 'untangle as', 'untauten as', 'unteach as',
  'untie as', 'until as', 'untrue as', 'unveil as', 'unvoice as',
  'unweave as', 'unwed as', 'unwell as', 'unwhip as', 'unwind as',
  'unwise as', 'unwrap as', 'unzip as', 'up as', 'up the ante',
  'up the stakes', 'uphold as', 'uplift as', 'upper as', 'upset as',
  'upstage as', 'urbanize as', 'urge as', 'use as', 'use up',
  'usher as', 'usual as', // V
  'vacillate as', 'validate as', 'value as', 'vandalize as', 'vanish as',
  'vary as', 'vary between', 'vary from', 'vary in', 'vary with',
  'vault as', 'vector as', 'veil as', 'vend as', 'venture as',
  'verge as', 'verify as', 'verse as', 'version as', 'vest as',
  'vest in', 'vex as', 'vibrate as', 'victimize as', 'view as',
  'vindicate as', 'violate as', 'virtue as', 'vision as', 'visit as',
  'vitalize as', 'vitiate as', 'vitrify as', 'vivify as', 'vocalize as',
  'voice as', 'void as', 'volunteer as', 'vomit as', 'vote as',
  'vote down', 'vote in', 'vote out', 'vote through', 'vouch as',
  'vouchsafe as', 'vow as', 'vulgarize as', // W
  'wade in', 'wade into', 'wade through', 'wager as', 'wail as',
  'wait about', 'wait around', 'wait at', 'wait behind', 'wait for',
  'wait in', 'wait on', 'wait out', 'wait over', 'wait up',
  'wake as', 'wake up', 'walk as', 'walk about', 'walk around',
  'walk away', 'walk away from', 'walk back', 'walk down', 'walk in',
  'walk into', 'walk off', 'walk out', 'walk out on', 'walk over',
  'walk through', 'walk up', 'wander as', 'wander away', 'wander from',
  'wander in', 'wander into', 'wander off', 'wander through', 'wander to',
  'want as', 'want in', 'want out', 'want up', 'war as',
  'ward as', 'ward off', 'warm as', 'warm over', 'warm through',
  'warm to', 'warm up', 'warn as', 'warn off', 'warp as',
  'warrant as', 'wash as', 'wash away', 'wash down', 'wash off',
  'wash out', 'wash over', 'wash up', 'waste as', 'waste away',
  'wastefully as', 'watch as', 'watch for', 'watch out', 'watch over',
  'watch your step', 'water as', 'wave aside', 'wave away', 'wave down',
  'wave off', 'wave on', 'wave through', 'wax as', 'wax lyrical',
  'wax moralistic', 'wax poetic', 'waylay as', 'weaken as', 'weaponize as',
  'wear as', 'wear away', 'wear down', 'wear in', 'wear off',
  'wear on', 'wear out', 'wear through', 'wear up', 'weary as',
  'weather as', 'weave as', 'wed as', 'weed as', 'weed out',
  'weigh as', 'weigh down', 'weigh in', 'weigh on', 'weigh out',
  'weigh up', 'welcome as', 'weld as', 'well as', 'well up',
  'wet as', 'wet down', 'wet up', 'whack as', 'whale as',
  'wharf as', 'wheel as', 'wheel around', 'wheeze as', 'whelk as',
  'whelm as', 'whip as', 'whip in', 'whip into', 'whip off',
  'whip out', 'whip through', 'whip up', 'whir as', 'whirl as',
  'whisk as', 'whisper as', 'whistle as', 'whistle for', 'whistle through',
  'whole as', 'wholesale as', 'wholly as', 'whoop as', 'whoosh as',
  'widen as', 'widen out', 'widow as', 'widthen as', 'wield as',
  'wiggle as', 'wild as', 'will as', 'win as', 'win back',
  'win down', 'win out', 'win over', 'win through', 'wind as',
  'wind around', 'wind away', 'wind back', 'wind down', 'wind in',
  'wind into', 'wind on', 'wind out', 'wind through', 'wind up',
  'wing as', 'wing it', 'wink as', 'winkle as', 'winkle out',
  'winter as', 'wipe as', 'wipe away', 'wipe down', 'wipe off',
  'wipe out', 'wipe up', 'wire as', 'wire in', 'wire up',
  'wise as', 'wish as', 'wit as', 'withdraw as', 'wither as',
  'withhold as', 'withstand as', 'witness as', 'witty as', 'wobble as',
  'wolf as', 'wolf down', 'wonder as', 'wonder about', 'wonder at',
  'woo as', 'word as', 'work as', 'work away', 'work in',
  'work into', 'work off', 'work on', 'work out', 'work over',
  'work through', 'work to', 'work together', 'work up', 'worry as',
  'worry at', 'worse as', 'worsen as', 'worship as', 'worst as',
  'worth as', 'worthwhile as', 'would as', 'would rather', 'wound as',
  'wow as', 'wrap as', 'wrap up', 'wrath as', 'wreak as',
  'wreck as', 'wrest as', 'wring as', 'wrinkle as', 'write as',
  'write away', 'write back', 'write down', 'write in', 'write into',
  'write off', 'write out', 'write through', 'write to', 'write up',
  'wrong as',
  // Y
  'yearn as', 'yell as', 'yelp as', 'yield as', 'yip as',
  'yodel as', 'young as', 'yowp as',
  // Z
  'zap as', 'zeal as', 'zero in', 'zigzag as', 'zinc as',
  'zip as', 'zip around', 'zip by', 'zip into', 'zip past',
  'zip through', 'zip up', 'zipper as', 'zone as', 'zoom as',
  'zoom in', 'zoom out', 'zoom through'
]

/**
 * 检查文本是否为已知短语
 * @param {string} text - 待检测的文本
 * @returns {boolean} - true 表示是已知短语
 */
export const isKnownPhrase = (text) => {
  if (!text || typeof text !== 'string') return false
  
  const trimmed = text.trim().toLowerCase()
  return COMMON_PHRASES.includes(trimmed)
}

/**
 * 智能识别并解析单词条目
 * @param {string} line - 原始行内容
 * @param {Object} options - 解析选项
 * @param {string} options.defaultCategory - 默认分类
 * @returns {Array} - 解析后的单词对象数组
 */
export const smartParseLine = (line, options = {}) => {
  const { defaultCategory = 'CET-4' } = options
  
  if (!line || typeof line !== 'string') return []
  
  const trimmed = line.trim()
  if (!trimmed) return []
  
  // 1. 排除非单词内容（如 day3, day3campus）
  if (isNonWordContent(trimmed)) {
    return []
  }
  
  // 2. 检查是否为已知短语
  if (isKnownPhrase(trimmed)) {
    // 尝试解析短语及其释义
    return parsePhraseWithMeaning(trimmed, defaultCategory)
  }
  
  // 3. 检查是否包含多个词性（用特殊符号分隔）
  // 常见模式：word (n.&v.) meaning / word (n./v.) meaning
  const multiPOSPattern = /^(.+?)\s*\(n\.\s*[&/]\s*v\.\)\s*(.+)$/i
  const multiPOSMatch = trimmed.match(multiPOSPattern)
  
  if (multiPOSMatch) {
    return splitMultiPOSEntry(
      multiPOSMatch[1].trim(),
      multiPOSMatch[2].trim(),
      defaultCategory
    )
  }
  
  // 4. 标准格式解析（单词|词性|释义）
  if (trimmed.includes('|')) {
    return parseStandardFormat(trimmed, defaultCategory)
  }
  
  // 5. 尝试识别空格分隔的单词（可能是复合词）
  // 如 "solar radiation 太阳辐射"
  return parseWordWithMeaning(trimmed, defaultCategory)
}

/**
 * 解析标准格式（用|分隔）
 */
const parseStandardFormat = (line, defaultCategory) => {
  const parts = line.split('|')
  
  if (parts.length >= 3) {
    return [{
      spelling: parts[0].trim(),
      part_of_speech: parts[1].trim(),
      meaning: parts.slice(2).join('|').trim(),
      phonetic: '',
      example_sentence: '',
      category: defaultCategory
    }]
  } else if (parts.length === 2) {
    return [{
      spelling: parts[0].trim(),
      part_of_speech: '',
      meaning: parts[1].trim(),
      phonetic: '',
      example_sentence: '',
      category: defaultCategory
    }]
  }
  
  return []
}

/**
 * 解析带释义的短语
 */
const parsePhraseWithMeaning = (phrase, defaultCategory) => {
  // 检查是否有释义（用|分隔）
  const parts = phrase.split('|')
  
  if (parts.length >= 2) {
    return [{
      spelling: parts[0].trim(),
      part_of_speech: '',
      meaning: parts.slice(1).join('|').trim(),
      phonetic: '',
      example_sentence: '',
      category: defaultCategory
    }]
  }
  
  // 没有释义，返回单词本身
  return [{
    spelling: phrase,
    part_of_speech: 'phr.',
    meaning: '',
    phonetic: '',
    example_sentence: '',
    category: defaultCategory
  }]
}

/**
 * 解析单词和释义（空格分隔）
 */
const parseWordWithMeaning = (text, defaultCategory) => {
  // 尝试找到中英文分界点
  // 策略：找到第一个中文字符的位置
  const chineseMatch = text.match(/[\u4e00-\u9fa5]/)
  
  if (!chineseMatch) {
    // 没有中文，可能是纯英文
    return []
  }
  
  const chineseIndex = text.indexOf(chineseMatch[0])
  const englishPart = text.substring(0, chineseIndex).trim()
  const chinesePart = text.substring(chineseIndex).trim()
  
  if (!englishPart || !chinesePart) return []
  
  // 尝试分离单词和词性
  // 常见模式：word n. 含义 / word (n.) 含义
  const posPattern = /^(.+?)\s*\(?([nvtadjadvpronnumconjpreprint\.]+)\.?\)?$/
  const posMatch = englishPart.match(posPattern)
  
  if (posMatch) {
    return [{
      spelling: posMatch[1].trim(),
      part_of_speech: posMatch[2].trim() + '.',
      meaning: chinesePart,
      phonetic: '',
      example_sentence: '',
      category: defaultCategory
    }]
  }
  
  // 没有词性
  return [{
    spelling: englishPart,
    part_of_speech: '',
    meaning: chinesePart,
    phonetic: '',
    example_sentence: '',
    category: defaultCategory
  }]
}

/**
 * 拆分多词性条目
 * 例如：look (n.&v.) 看，样子 -> look (n.) 看 | look (v.) 看
 */
const splitMultiPOSEntry = (word, meaning, defaultCategory) => {
  const results = []
  
  // 提取词性组合
  // n.&v. 或 n./v. 或 n. and v.
  const posPattern = /\((n\.|noun)\s*[&/]\s*(v\.|verb)\)/i
  const posMatch = meaning.match(posPattern)
  
  if (posMatch) {
    // 提取名词部分
    const nounMeaning = meaning.replace(posPattern, '').trim()
    results.push({
      spelling: word,
      part_of_speech: 'n.',
      meaning: nounMeaning,
      phonetic: '',
      example_sentence: '',
      category: defaultCategory
    })
    
    // 提取动词部分
    results.push({
      spelling: word,
      part_of_speech: 'v.',
      meaning: nounMeaning,
      phonetic: '',
      example_sentence: '',
      category: defaultCategory
    })
  } else {
    // 其他多词性模式，返回原样
    results.push({
      spelling: word,
      part_of_speech: '',
      meaning: meaning,
      phonetic: '',
      example_sentence: '',
      category: defaultCategory
    })
  }
  
  return results
}

/**
 * 智能解析整个文件内容
 * @param {string} content - 文件内容
 * @param {Object} options - 解析选项
 * @returns {Array} - 解析后的单词数组
 */
export const smartParseContent = (content, options = {}) => {
  if (!content || typeof content !== 'string') return []
  
  const lines = content.split('\n').filter(line => line.trim())
  const results = []
  
  for (const line of lines) {
    const parsed = smartParseLine(line, options)
    results.push(...parsed)
  }
  
  return results
}

/**
 * 从Excel行数据智能解析
 * @param {Array} row - Excel行数据
 * @param {Object} options - 解析选项
 * @returns {Object|null} - 解析后的单词对象
 */
export const smartParseExcelRow = (row, options = {}) => {
  if (!Array.isArray(row) || row.length === 0) return null
  
  const { defaultCategory = 'CET-4' } = options
  
  // 假设格式：[单词, 词性, 释义, 音标, 例句]
  const spelling = String(row[0] || '').trim()
  const partOfSpeech = String(row[1] || '').trim()
  const meaning = String(row[2] || '').trim()
  const phonetic = String(row[3] || '').trim()
  const exampleSentence = String(row[4] || '').trim()
  
  if (!spelling) return null
  
  // 排除非单词内容
  if (isNonWordContent(spelling)) {
    return null
  }
  
  return {
    spelling,
    part_of_speech: partOfSpeech,
    meaning,
    phonetic,
    example_sentence: exampleSentence,
    category: defaultCategory
  }
}

export default {
  isNonWordContent,
  isKnownPhrase,
  smartParseLine,
  smartParseContent,
  smartParseExcelRow
}
