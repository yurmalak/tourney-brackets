import clone from "rfdc/default"
import anchors from './anchors.json';
import createGame from "../adminParts/createGame";
import { kvMapSorter } from "../../stores";

const streamersTwitch = {
    "HILTYHA": "hiltyha",
    "beZZdar_": "bezzdar_",
    "pup_ok_": "pup_ok_",
    "Enakkin": "enakkin",
    "Pereyaslavsky_": "pereyaslavsky_",
    "YAR_": "yar_",
    "maugli35": "maugli35",
    "turgeneff": "turgeneff",
    "papashkaiz4atika": "papashkaiz4atika",
    "Wukosha": "wukosha",
    "Master_of__mind": "master_of__mind",
    "M_on_t": "m_on_t",
    "duszamonaha": "duszamonaha",
    "Coach_Jekich": "coach_jekich",
    "Weronest": "weronest",
    "akaStinger": "akastinger",
    "HellLighT111": "helllight111",
    "unutcon": "unutcon",
    "heroes3troll": "heroes3troll",
    "newb1kk": "newb1kk",
    "DarkPepego": "darkpepego",
    "Chester_Investor": "chester_investor",
    "yarostnayaKoshka": "yarostnayakoshka",
    "2BISHOP": "2bishop",
    "amieloo": "amieloo",
    "HotaGirl": "hotagirl",
    "Pavllovich": "pavllovich",
    "valerie_rayne": "valerie_rayne",
    "yama_darma": "yama_darma",
    "VovastikMashina": "vovastikmashina",
    "zhoporez_": "zhoporez_",
    "VooDooSh": "voodoosh"
}

const players = [
    "Enakkin",
    "Master_of__mind",
    "HILTYHA",
    "Chester_Investor",
    "HellLighT111",
    "maugli35",
    "newb1kk",
    "yarostnayaKoshka",
    "zhoporez_",
    "papashkaiz4atika",
    "Coach_Jekich",
    "HotaGirl",
    "Pavllovich",
    "heroes3troll",
    "unutcon",
    "YAR_",
    "Weronest",
    "akaStinger",
    "duszamonaha",
    "VooDooSh",
    "2BISHOP",
    "M_on_t",
    "turgeneff",
    "VovastikMashina",
    "amieloo",
    "pup_ok_",
    "DarkPepego",
    "yama_darma",
    "valerie_rayne",
    "Pereyaslavsky_",
    "beZZdar_",
    "Wukosha",
].map((name, i) => ({
    name,
    sIndex: Math.floor(i / 2),
    pIndex: i % 2,
    twitch: streamersTwitch[name]
}))


const games = [
    { sIndex: 0, players: ["Enakkin", "Master_of__mind"], winner: 1, kvMap: [["достижение", "Enakkin, Истинный ролевик", "Пробить ГО юнитами спецы героя"], ["рулетка", "Сложность 200%"], ["рулетка", "Запрет на захват замков в Треже"]], data: { starters: ["Wystan", "Caitlin"], towns: ["Fortress", "Castle"], blue: 1 } },
    { sIndex: 1, players: ["HILTYHA", "Chester_Investor"], winner: 0, data: { starters: ["Tazar", "Ignatius"], towns: ["Fortress", "Inferno"], blue: 0 }, kvMap: [["челлендж", "HILTYHA", "Выйти с респа на 115"], ["челлендж", "HILTYHA", "Пробить ГО без книги"], ["челлендж", "HILTYHA", "Взять утопу на 116"], ["рулетка", "Нельзя использовать внешний рынок"], ["рулетка", "У игроков есть по рестарту"]] },
    { sIndex: 2, players: ["HellLighT111", "maugli35"], winner: 0, kvMap: [["рулетка", "Нельзя использовать магию воздуха"], ["рулетка", "Нельзя в родном замке грейдить Т3-Т4 юнитов"]], data: { towns: ["Necropolis", "Inferno"], starters: ["Xsi", "Octavia"], blue: 0 } },
    { sIndex: 3, players: ["newb1kk", "yarostnayaKoshka"], winner: 0, data: { blue: 1, towns: ["Castle", "Conflux"], starters: ["Adelaide", "Pasis"] }, kvMap: [["рулетка", "Запрет на использование сборных артов"], ["рулетка", "Запрет на использование магии Огня"]] },
    { sIndex: 4, players: ["zhoporez_", "papashkaiz4atika"], winner: 1, data: { towns: ["Conflux", "Cove"], starters: ["Gelare", "Zilare"], blue: 0 }, kvMap: [["рулетка", "Запрет на захват замков в Треже"]] },
    { sIndex: 5, players: ["Coach_Jekich", "HotaGirl"], winner: 1, kvMap: [], data: { blue: 1, towns: ["Dungeon", "Tower"], starters: ["Deemer", "Cyra"] } },
    { sIndex: 6, players: ["Pavllovich", "heroes3troll"], winner: 0, kvMap: [], data: { towns: ["Tower", "Cove"], starters: ["Torosar", "Leena"], blue: 0 } },
    { sIndex: 10, players: ["2BISHOP", "M_on_t"], winner: 1, kvMap: [["рулетка", "Всегда выбирать правый навык"]], data: { towns: ["Necropolis", "Rampart"], starters: ["Tamika", "Giselle"], blue: 0 } },
    { sIndex: 11, players: ["turgeneff", "VovastikMashina"], winner: 1, kvMap: [["рулетка", "Всегда выбирать правый навык"], ["рулетка", "Нельзя захватывать золотые шахты"]], data: { starters: ["Rissa", "Tiva"], towns: ["Tower", "Fortress"], blue: 0 } },
    { sIndex: 12, players: ["amieloo", "pup_ok_"], winner: 0, kvMap: [["replay", "youtube.com/watch?v=m8DpgsIKOfg"], ["рулетка", "Запрет на артефакты которые дают ТОЛЬКО Атаку"]], data: { blue: 1, towns: ["Fortress", "Tower"], starters: ["Kyrre", "Aine"] } },
    { sIndex: 13, players: ["DarkPepego", "yama_darma"], winner: 0, data: { blue: 1, towns: ["Inferno", "Necropolis"], starters: ["Olema", "Sandro"] }, kvMap: [["челлендж", "yama_darma", "Поставить Грааль до 116 включительно"], ["рулетка", "Нельзя использовать внешний рынок"], ["рулетка", "У игроков есть по рестарту"]] },
].map(g => ({ ...createGame({ round: 0, index: 0 }), ...g, kvMap: g.kvMap.sort(kvMapSorter) }))


const kvMaps = []

// hide text on nodes if it's already on the image
// temp solution before I get blank one
for (let i = 0; i < 16; i++) {
    kvMaps.push({ sIndex: i, round: 0, players: players.slice(i * 2, i * 2 + 2).map(p => p.name), kvMap: [["hide", ""]] })
}
kvMaps.push(
    { sIndex: 1, round: 1, players: ["HellLighT111", "newb1kk"], kvMap: [["hide", ""]] },
    { sIndex: 2, round: 1, players: ["papashkaiz4atika", "HotaGirl"], kvMap: [["hide", ""]] },
    { sIndex: 6, round: 1, players: ["amieloo", "DarkPepego"], kvMap: [["hide", "amieloo"]] }
)

// add clock icons for each of these
kvMaps[6].kvMap.push(["начало", "19.05 в 22:00"])
kvMaps[8].kvMap.push(["начало", "21.05 в 22:00"])
kvMaps[15].kvMap.push(["начало", "23.05 в 22:00"])
kvMaps[14].kvMap.push(["начало", "24.05 в 22:00"])


export default clone({
    anchors,
    data: {
        templateCode: "powersOf2",  // defines bracket generated in Admin
        playersTotal: 32,
        withTop3: true,
        players,
        games,
        kvMaps
    }
});