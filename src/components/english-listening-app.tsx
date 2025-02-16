"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  SkipForward,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  List,
  Grid,
} from "lucide-react";
import _ from "lodash";

interface AudioFile {
  filename: string;
  filePath: string;
  index: number;
  word: string;
  meaning: string;
}

// 샘플 단어 데이터베이스 (실제 영어 단어에 대한 한글 의미)
const wordDatabase: Record<string, string> = {
  lunch: "점심 식사",
  wear: "입다, 신다, 쓰다",
  child: "아이, 어린이",
  run: "달리다",
  call: "전화하다; 부르다",
  bowl: "(우묵한) 그릇",
  day: "날, 하루",
  slow: "느린",
  fun: "재미; 재미 있는",
  bicycle: "자전거",
  loud: "(소리가) 큰, 시끄러운",
  shelf: "선반",
  soft: "부드러운, 푹신한",
  clock: "시계",
  many: "많은",
  dream: "꿈꾸다; 꿈, 이상",
  have: "가지다",
  puppy: "강아지",
  family: "가족",
  store: "가게",
  teach: "가르치다",
  eat: "먹다",
  fine: "좋은, 괜찮은",
  bath: "목욕",
  like: "좋아하다; ~처럼",
  old: "오래된; 나이가 든",
  kitchen: "부엌, 주방",
  go: "가다",
  snack: "간식, 과자",
  cute: "귀여운",
  sit: "앉다",
  student: "학생",
  name: "이름",
  closet: "옷장",
  ready: "준비된",
  say: "말하다",
  friend: "친구",
  wood: "나무, 목재",
  dinner: "저녁 식사",
  school: "학교",
  talk: "말하다, 이야기하다",
  new: "새로운",
  together: "함께",
  meal: "식사",
  home: "집; 집에, 집으로",
  same: "같은, 비슷한",
  read: "읽다",
  week: "주, 일주일",
  basket: "바구니",
  meet: "만나다",
  easy: "쉬운",
  elephant: "코끼리",
  do: "하다",
  late: "늦은; 늦게",
  fire: "불",
  salt: "소금",
  class: "학급, 반; 수업",
  teacher: "선생님",
  bread: "빵",
  look: "보다",
  sick: "아픈",
  goat: "염소",
  notebook: "공책",
  garden: "정원",
  back: "뒤의; 뒤로; 뒤",
  wash: "씻다",
  bottle: "병",
  funny: "웃기는, 재미있는",
  walk: "걷다",
  rainbow: "무지개",
  flower: "꽃",
  camp: "야영하다",
  body: "몸, 신체",
  sad: "슬픈",
  smile: "미소 짓다; 미소",
  give: "주다",
  hair: "머리카락, 털",
  in: "~의 안에; 안으로",
  use: "사용하다",
  market: "시장",
  kite: "연",
  farm: "농장",
  catch: "잡다",
  sea: "바다",
  full: "가득 찬",
  different: "다른",
  morning: "아침, 오전",
  sleep: "자다",
  build: "(건물ㆍ도로를) 짓다",
  button: "단추; 버튼",
  know: "알다, 이해하다",
  stair: "계단",
  art: "미술(품), 예술",
  make: "만들다",
  house: "집",
  only: "유일한, 단 하나의",
  "living room": "거실",
  ride: "타다; 타기, 탈 것",
  long: "긴; 오랜",
  jungle: "밀림, 정글",
  race: "경주, 경기",
  brave: "용감한",
  bedroom: "침실",
  hand: "손",
  mountain: "산",
  buy: "사다",
  see: "보다",
  before: "~앞에, ~전에",
  clean: "깨끗한; 청소하다",
  uncle: "삼촌, 고모부, 이모부",
  tell: "말하다",
  deep: "깊은",
  excited: "흥분한, 신이 난",
  find: "찾다",
  night: "밤",
  farmer: "농부",
  bake: "굽다",
  get: "받다, 얻다",
  work: "일하다; 일, 작업",
  dolphin: "돌고래",
  hot: "뜨거운, 더운",
  fast: "빠른; 빨리",
  building: "건물, 건축",
  trip: "여행",
  act: "행동하다",
  fly: "날다",
  photo: "사진",
  hole: "구멍",
  towel: "수건",
  break: "깨(지다), 부수다",
  watch: "보다",
  weather: "날씨",
  hospital: "병원",
  after: "~뒤에, ~후에",
  king: "왕",
  leaf: "잎",
  kid: "아이, 어린이",
  cheese: "치즈",
  octopus: "문어",
  people: "사람들",
  backpack: "배낭",
  on: "~의 위에",
  sunflower: "해바라기",
  hard: "단단한, 굳은; 어려운",
  giraffe: "기린",
  animal: "동물",
  smell: "냄새를 맡다",
  sugar: "설탕",
  number: "수, 숫자; 번호",
  dry: "마른, 건조한",
  stand: "서다",
  grow: "자라다; 기르다",
  aunt: "이모, 고모, 숙모",
  safe: "안전한",
  rose: "장미",
  want: "원하다",
  camera: "사진기",
  climb: "오르다, 등반하다",
  pea: "완두콩",
  restaurant: "식당",
  butter: "버터",
  large: "큰, 많은",
  rainy: "비가 오는",
  help: "돕다, 도와주다; 도움",
  worm: "(기어 다니는) 벌레",
  study: "공부하다",
  mouth: "입",
  quick: "빠른, 신속한",
  clothes: "옷, 의복",
  send: "보내다",
  near: "가까운; ~가까이에",
  dress: "원피스; 옷을 입다",
  onion: "양파",
  taste: "~한 맛이 나다; 맛",
  fill: "채우다",
  cook: "요리하다",
  river: "강, 하천",
  draw: "그리다",
  afternoon: "오후",
  glue: "풀, 접착제",
  become: "~이 되다, ~해지다",
  high: "높은; 높이, 위로",
  short: "짧은, 키가 작은",
  pond: "연못",
  show: "보여주다",
  cut: "자르다",
  sport: "스포츠, 운동",
  young: "(나이가) 어린",
  playground: "놀이터, 운동장",
  next: "다음의; 다음에",
  evening: "저녁",
  helmet: "헬멧",
  sunny: "화창한",
  start: "시작하다",
  hear: "듣다, 들리다",
  tent: "텐트",
  butterfly: "나비",
  map: "지도",
  elbow: "팔꿈치",
  sell: "팔다",
  face: "얼굴",
  swim: "수영하다",
  season: "계절",
  cloudy: "흐린, 구름이 낀",
  drink: "마시다",
  learn: "배우다",
  strong: "강한, 힘이 센",
  lady: "여성, 숙녀",
  close: "닫다; 가까운",
  put: "놓다, 두다",
  story: "이야기, 소설",
  push: "밀다",
  think: "생각하다",
  orange: "오렌지",
  under: "~ 아래에",
  bakery: "빵집, 제과점",
  sorry: "미안한",
  road: "도로, 길",
  first: "처음의; 우선",
  tall: "키가 큰",
  out: "밖으로, 밖에",
  time: "시간",
  end: "끝나다",
  circle: "동그라미, 원",
  thank: "고마워하다",
  letter: "편지",
  from: "~부터, ~에서",
  scary: "무서운, 두려운",
  trumpet: "트럼펫",
  yummy: "맛있는",
  open: "열려 있는; 열다",
  sky: "하늘",
  tower: "탑",
  fall: "떨어지다; 가을",
  bridge: "다리",
  visit: "방문하다",
  spider: "거미",
  listen: "듣다",
  vegetable: "채소",
  queen: "여왕, 왕비",
  window: "창문",
  train: "기차, 열차",
  fix: "고치다; 고정시키다",
  every: "모든; 매, 마다",
  hippo: "하마",
  tooth: "이, 치아",
  shout: "외치다",
  beautiful: "아름다운",
  strawberry: "딸기",
  take: "가지고 가다",
  pan: "납작한 냄비",
  alone: "혼자인; 혼자, 홀로",
  winter: "겨울",
  write: "(글을) 쓰다",
  pilot: "비행 조종사",
  live: "살다",
  light: "가벼운; 빛",
  feel: "(기분ㆍ감정이) 들다",
  warm: "따뜻한",
  sandwich: "샌드위치",
  life: "생명; 삶, 생활",
  barn: "헛간",
  hit: "때리다, 치다",
  hungry: "배고픈",
  soccer: "축구",
  weak: "약한",
  bubble: "거품, 비눗방울",
  shake: "흔들(리)다",
  mop: "대걸레",
  sure: "확신하는",
  wet: "젖은",
  enjoy: "즐기다",
  water: "물; 물을 주다",
  summer: "여름",
  into: "~ 안으로, ~ 안에",
  dinosaur: "공룡",
  top: "맨 위; 맨 위의",
  month: "달, 월",
  quiet: "조용한",
  claw: "(동물의) 발톱",
  heavy: "무거운",
  color: "색깔",
  love: "사랑하다",
  stone: "돌",
  low: "낮은; 적은",
  ocean: "바다, 해양",
  paw: "(동물의) 발",
  snowy: "눈이 오는",
  baker: "제빵사",
  gas: "기체, 가스",
  wait: "기다리다",
  again: "다시, 한 번 더",
  spring: "봄",
  stop: "멈추다, 그만하다",
  paint: "페인트칠하다",
  chick: "병아리",
  park: "공원",
  mix: "섞다, 혼합하다",
  cookie: "쿠키",
  scarf: "스카프, 목도리",
  shoe: "신발",
  inside: "안, 내부 안으로,안에",
  umbrella: "우산",
  lazy: "게으른",
  police: "경찰",
  wide: "(폭이) 넓은",
  hose: "호스",
  weekend: "주말",
  foot: "발",
  drive: "운전하다",
  bank: "은행",
  wake: "(잠에서) 깨다, 깨우다",
  blow: "불다",
  tennis: "테니스",
  speak: "말하다",
  crab: "게",
  drawing: "그림",
  fry: "(기름에) 튀기다",
  cousin: "사촌",
  man: "남자",
  fan: "선풍기; 팬",
  year: "해, 연(年); 나이",
  soup: "수프",
  nut: "견과",
  idea: "생각",
  outside: "바깥(쪽); 밖에",
  forest: "숲",
  chef: "요리사",
  guitar: "기타",
  shine: "빛나다",
  ask: "묻다, 질문하다",
  touch: "만지다",
  shape: "모양, 형태",
  sing: "노래하다",
  dark: "어두운",
  everyday: "매일의, 일상의",
  mixture: "혼합, 혼합물",
  picture: "그림, 사진",
  dirty: "더러운",
  broom: "빗자루",
  noon: "정오, 낮 12시",
  slide: "미끄러지다",
  windy: "바람이 부는",
  hop: "(깡충) 뛰다",
  deer: "사슴",
  sink: "가라앉다, 빠지다",
  present: "선물",
  round: "둥근, 원형의",
  pull: "끌다, 당기다",
  smart: "똑똑한, 영리한",
  well: "잘, 훌륭하게",
  cold: "추운, 차가운; 감기",
  money: "돈",
  test: "시험, 검사",
  pianist: "피아노 연주가",
  bring: "가져오다",
  ruler: "자",
  bean: "콩",
  win: "이기다, 우승하다",
  front: "앞, 정면; 앞쪽의",
  question: "질문",
  turtle: "거북이",
  drop: "떨어뜨리다",
  homework: "숙제, 과제",
  crayon: "크레용",
  town: "마을, 동네",
  over: "~의 위에, ~너머로",
  pipe: "관, 파이프",
  enter: "들어가다, 들어오다",
  music: "음악",
  meat: "고기",
  birthday: "생일",
  street: "길, 거리",
  colorful: "알록달록한",
  much: "(양이) 많은; 많이",
  hip: "엉덩이",
  news: "뉴스, 소식",
  dig: "파다",
  plant: "식물; 심다",
  feeling: "느낌, 감정",
  answer: "대답하다; 대답",
  wing: "날개",
  bright: "밝은, 빛나는",
  cafe: "카페",
  heavily: "많이, 몹시, 심하게",
  pour: "붓다, 따르다",
  wink: "윙크하다",
  keep: "두다; 유지하다",
  here: "여기에(서), 이곳으로",
  goose: "거위",
  beach: "해변",
  paper: "종이",
  fat: "살찐, 뚱뚱한",
  team: "(경기 등의) 팀, 조",
  sunglasses: "선글라스",
  singer: "가수",
  sweater: "스웨터",
  violin: "바이올린",
  hold: "들다, 잡다",
  lose: "잃다; 지다",
  fool: "어리석은 사람, 바보",
  slice: "조각; (얇게) 썰다",
  change: "변화시키다, 변하다",
  everybody: "모든 사람",
  doctor: "의사",
  moon: "달",
  dance: "춤추다",
  movie: "영화",
  bookshelf: "책장, 책꽂이",
  angry: "화난",
  oil: "기름",
  person: "사람, 개인",
  arrive: "도착하다",
  place: "장소; 두다",
  classroom: "교실",
  whale: "고래",
  difficult: "어려운, 힘든",
  hurt: "다치게 하다; 아프다",
  garlic: "마늘",
  kind: "친절한, 착한",
  fresh: "신선한",
  join: "가입하다, 함께 하다",
  add: "더하다, 추가하다",
  salty: "(맛이) 짠",
  lake: "호수",
  early: "일찍; 이른",
  floor: "바닥; 층",
  board: "판자, 널빤지; 타다",
  move: "움직이다",
  salad: "샐러드",
  shoulder: "어깨",
  vase: "꽃병",
  busy: "바쁜",
  sandal: "샌들 한 짝",
  breakfast: "아침 식사",
  nurse: "간호사",
  glove: "장갑 한 쪽",
  pick: "고르다; 꺾다, 따다",
  math: "수학",
  there: "저기에(서), 그곳으로",
  tonight: "오늘 밤",
  hate: "싫어하다",
  word: "단어, 말",
  land: "땅, 육지; 착륙하다",
  woman: "여성",
  trash: "쓰레기",
  museum: "박물관",
  penguin: "펭귄",
  leave: "떠나다; 남기다",
  boil: "끓다, 끓이다",
  sweet: "달콤한",
  plate: "접시",
  library: "도서관",
  fruit: "과일",
  share: "함께 쓰다, 공유하다",
  behind: "~ 뒤에",
  choose: "고르다, 선택하다",
  star: "별",
  album: "앨범",
  blanket: "담요",
  seed: "씨앗",
  scissors: "가위",
  messy: "지저분한, 엉망인",
  worry: "걱정하다",
  mug: "머그컵",
  laugh: "(소리 내어) 웃다",
  clay: "점토, 찰흙",
  pay: "지불하다",
  favorite: "가장 좋아하는",
  line: "선, 줄",
  space: "공간; 우주",
  jump: "뛰다, 뛰어오르다",
  everyone: "모든 사람, 모두",
  habit: "습관, 버릇",
  job: "일, 직업",
  fishbowl: "어항",
  last: "마지막의; 지난",
  tongue: "혀",
  lizard: "도마뱀",
  fight: "싸우다; 싸움",
  wall: "벽, 담",
  invite: "초대하다",
  coin: "동전",
  winner: "우승자",
  honey: "꿀",
  roof: "지붕",
  cheer: "응원하다, 환호하다",
  classmate: "반 친구",
  order: "순서; 주문하다",
  glass: "유리, 유리잔",
  really: "실제로; 아주, 정말",
  skin: "피부",
  throw: "던지다",
  storm: "폭풍",
  bite: "(이로) 물다, 물어뜯다",
  sour: "신맛이 나는",
  bookstore: "서점",
  quiz: "퀴즈, 시험",
  telephone: "전화, 전화기",
  key: "열쇠",
  pretty: "예쁜",
  free: "자유로운; 무료의",
  candle: "초, 양초",
  thin: "얇은; 마른",
  snail: "달팽이",
  sound: "소리",
  rich: "부유한, 부자인",
  scream: "비명을 지르다",
  dragon: "(전설에 나오는 동물) 용",
  begin: "시작하다",
  hug: "포옹하다",
  side: "측면, 면",
  gray: "회색의",
  interested: "관심 있는, 흥미 있는",
  across: "가로질러, 건너편에",
  happily: "행복하게",
  bead: "구슬",
  lie: "거짓말하다; 눕다",
  mask: "가면",
  restroom: "화장실",
  carry: "나르다, 싣다",
  postcard: "엽서",
  tired: "피곤한, 지친",
  player: "선수",
  club: "클럽, 동아리",
  wonderful: "멋진, 훌륭한",
  noisy: "시끄러운, 떠들썩한",
  kick: "(발로) 차다",
  hunt: "사냥하다",
  head: "머리; 가다, 향하다",
  wolf: "늑대",
  hundred: "100, 백",
  cross: "건너다, 가로지르다",
  television: "텔레비전",
  painting: "그림",
  block: "구역; 막다, 방해하다",
  corner: "모퉁이",
  seat: "자리, 좌석",
  right: "맞는; 오른쪽의",
  stay: "지내다, 머무르다",
  cave: "동굴",
  thing: "물건, 것",
  mirror: "거울",
  hill: "언덕",
  scared: "겁먹은, 무서워하는",
  jacket: "외투, 재킷",
  tear: "눈물",
  please: "제발; 기쁘게 하다",
  bark: "(개가) 짖다",
  step: "단계; 걸음",
  ring: "(소리가) 울리다",
  hurry: "서두르다",
  firefighter: "소방관",
  easily: "쉽게",
  ankle: "발목",
  hive: "벌집",
  sharp: "날카로운, 뾰족한",
  brush: "붓, 빗; 빗질하다",
  eagle: "독수리",
  puzzle: "퍼즐, 수수께끼",
  try: "노력하다, 시도하다",
  ladybug: "무당벌레",
  count: "세다, 계산하다",
  poor: "가난한; 불쌍한",
  all: "모든, 전체의; 모두",
  left: "왼쪽의",
  die: "죽다",
  mud: "진흙",
  turn: "돌다; 차례, 순서",
  narrow: "좁은",
  lucky: "운이 좋은, 행운의",
  wild: "야생의",
  save: "구하다; 모으다",
  tail: "꼬리",
  driver: "운전자",
  grass: "풀, 잔디",
  bored: "지루한, 싫증난",
  rice: "쌀, 밥",
  cheek: "뺨, 볼",
  computer: "컴퓨터",
  robot: "로봇",
  purple: "자줏빛의",
  magic: "마술, 마법",
  follow: "따라가다; 따르다",
  climber: "등반가",
  quickly: "빨리, 빠르게",
  flag: "국기, 깃발",
  sleepy: "졸리는",
  plan: "계획; 계획하다",
  erase: "지우다",
  ink: "잉크",
  pack: "싸다, 포장하다",
  tin: "양철로 만든",
  need: "~를 필요로 하다",
  miss: "그리워하다; 놓치다",
  tasty: "맛있는",
  watermelon: "수박",
  dirt: "흙, 토양",
  crocodile: "악어",
  shiny: "빛나는",
  cane: "지팡이",
};

const EnglishListeningApp: React.FC = () => {
  const [startNumber, setStartNumber] = useState<string>("");
  const [endNumber, setEndNumber] = useState<string>("");
  const [playlist, setPlaylist] = useState<AudioFile[]>([]);
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showMeanings, setShowMeanings] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadAvailableFiles = async () => {
      try {
        const response = await fetch("/api/files");
        const files = await response.json();
        setAvailableFiles(files);
      } catch (error) {
        console.error("Failed to load files:", error);
        alert("파일 목록을 불러오는데 실패했습니다.");
      }
    };

    loadAvailableFiles();
  }, []);

  // 파일명에서 단어 추출 (예: "001_child.mp3" -> "child")
  const extractWord = (filename: string): string => {
    const match = filename.match(/\d+_(.+)\.mp3$/);
    return match ? match[1] : "";
  };

  // 재생 목록 생성
  const generateRandomPlaylist = (): void => {
    const start = parseInt(startNumber);
    const end = parseInt(endNumber);

    if (
      isNaN(start) ||
      isNaN(end) ||
      start < 1 ||
      end > 600 ||
      start > end
    ) {
      alert(
        "시작 번호는 1-600 사이, 끝 번호는 시작 번호보다 크고 600 이하여야 합니다."
      );
      return;
    }

    // 선택된 범위의 파일들만 필터링
    const selectedFiles = availableFiles.filter((filename) => {
      const fileNumber = parseInt(filename.split("_")[0]);
      return fileNumber >= start && fileNumber <= end;
    });

    if (selectedFiles.length === 0) {
      alert("선택한 범위에 사용 가능한 파일이 없습니다.");
      return;
    }

    const files: AudioFile[] = selectedFiles.map((filename) => {
      const index = parseInt(filename.split("_")[0]);
      const word = extractWord(filename);

      return {
        filename,
        filePath: `/audio/${filename}`,
        index,
        word,
        meaning:
          wordDatabase[word.toLowerCase()] || "의미 데이터 없음",
      };
    });

    setPlaylist(_.shuffle(files));
    setCurrentTrack(0);
    stopAndReset();
  };

  // 초기화
  const resetApp = (): void => {
    setStartNumber("");
    setEndNumber("");
    setPlaylist([]);
    setCurrentTrack(0);
    stopAndReset();
  };

  // 재생 중지 및 초기화
  const stopAndReset = (): void => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 재생/일시정지 토글
  const togglePlay = (): void => {
    if (!playlist.length) return;

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 다음 트랙으로 이동
  const nextTrack = (): void => {
    if (currentTrack < playlist.length - 1) {
      stopAndReset();
      setCurrentTrack((prev) => prev + 1);
    }
  };

  // 오디오 종료 시 처리
  const handleEnded = (): void => {
    stopAndReset();
  };

  // 트랙 선택 및 재생 처리
  const selectTrack = (index: number): void => {
    if (index === currentTrack) {
      // 현재 트랙을 다시 클릭한 경우 재생/일시정지 토글
      togglePlay();
    } else {
      // 다른 트랙을 선택한 경우
      stopAndReset();
      setCurrentTrack(index);
    }
  };

  // 오디오 로딩 에러 처리
  const handleError = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>
  ) => {
    console.error("Audio loading error:", e);
    alert("오디오 파일을 로드하는데 문제가 발생했습니다.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center shadow-lg mb-3 mx-auto">
              <Volume2 size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">
            English Listening Practice
          </h1>
          <p className="text-gray-600 text-lg">
            Listen and learn English words with pronunciation
          </p>
        </div>

        {/* 컨트롤 카드 */}
        <Card className="bg-white/80 backdrop-blur shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* 입력 섹션 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  학습할 단어 범위 선택:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Input
                      type="number"
                      min="1"
                      max="600"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                      className="w-full sm:w-24 shadow-sm"
                      placeholder="시작"
                    />
                    <span className="text-gray-500">~</span>
                    <Input
                      type="number"
                      min="1"
                      max="600"
                      value={endNumber}
                      onChange={(e) => setEndNumber(e.target.value)}
                      className="w-full sm:w-24 shadow-sm"
                      placeholder="끝"
                    />
                  </div>
                  <Button
                    onClick={generateRandomPlaylist}
                    className="w-full sm:w-auto sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    <Play size={18} className="mr-2" />
                    랜덤 생성
                  </Button>
                </div>
              </div>

              {/* 현재 재생 중인 단어 섹션 */}
              {playlist.length > 0 && (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium mb-3">
                      {currentTrack + 1} / {playlist.length}
                    </p>
                    <div className="space-y-2">
                      <p className="text-3xl font-bold text-blue-800">
                        {playlist[currentTrack].word}
                      </p>
                      {showMeanings && (
                        <p className="text-xl text-gray-600">
                          {playlist[currentTrack].meaning}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Volume2 size={16} />
                      <span>{playlist[currentTrack].filename}</span>
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    src={playlist[currentTrack].filePath}
                    onEnded={handleEnded}
                    onError={handleError}
                    className="hidden"
                  />

                  {/* 컨트롤 버튼 */}
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className={`w-full sm:w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105 ${
                        isPlaying ? "bg-purple-600" : "bg-blue-600"
                      }`}
                    >
                      {isPlaying ? (
                        <Pause size={24} />
                      ) : (
                        <Play size={24} />
                      )}
                    </Button>
                    <Button
                      onClick={nextTrack}
                      size="lg"
                      className="w-full sm:w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105 bg-blue-600"
                      disabled={currentTrack >= playlist.length - 1}
                    >
                      <SkipForward size={24} />
                    </Button>
                    <Button
                      onClick={resetApp}
                      size="lg"
                      className="w-full sm:w-16 h-16 rounded-full shadow-lg transition-transform hover:scale-105"
                      variant="outline"
                    >
                      <RefreshCw size={24} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 단어 목록 카드 */}
        {playlist.length > 0 && (
          <Card className="bg-white/80 backdrop-blur shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* 단어 목록 헤더 */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">
                    학습 단어 목록
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        setViewMode(
                          viewMode === "grid" ? "list" : "grid"
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                    >
                      {viewMode === "grid" ? (
                        <List size={16} />
                      ) : (
                        <Grid size={16} />
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowMeanings(!showMeanings)}
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                    >
                      {showMeanings ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 단어 목록 그리드/리스트 */}
                <div
                  className={`
                  ${
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-2"
                  }
                `}
                >
                  {playlist.map((file, index) => (
                    <div
                      key={file.index}
                      onClick={() => selectTrack(index)}
                      className={`
                        ${
                          viewMode === "grid"
                            ? "p-4 rounded-lg border transition-all duration-200"
                            : "p-3 rounded-lg border flex justify-between items-center"
                        }
                        ${
                          index === currentTrack
                            ? "bg-blue-50 border-blue-300 shadow-md"
                            : "border-gray-200 hover:border-blue-200 hover:shadow-sm"
                        }
                        cursor-pointer hover:bg-blue-50
                      `}
                    >
                      {viewMode === "grid" ? (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-lg font-medium text-gray-800">
                              {file.word}
                            </span>
                            <span className="text-sm text-gray-500">
                              #{file.index}
                            </span>
                          </div>
                          {showMeanings && (
                            <p className="text-gray-600">
                              {file.meaning}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                              #{file.index}
                            </span>
                            <span className="text-lg font-medium text-gray-800">
                              {file.word}
                            </span>
                          </div>
                          {showMeanings && (
                            <p className="text-gray-600">
                              {file.meaning}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnglishListeningApp;
