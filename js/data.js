/* TáncRuha Stúdió – adatok, opciók, stílusok, hangulatok */
window.TR = window.TR || {};

TR.data = {
  skins: ['#f7dcc8', '#ecc3a3', '#d9a27c', '#b87b56', '#8c5a3c', '#5b3826'],

  hairs: {
    konty: 'Konty',
    copf: 'Lófarok',
    hosszu: 'Hosszú, kibontott',
    rovid: 'Rövid',
    nincs: 'Kopasz / sapka'
  },

  topLength: {
    crop: 'Crop (mell alatt)',
    waist: 'Derékig',
    tunic: 'Tunika (csípőig)',
    leotard: 'Body / dressz'
  },

  necklines: {
    kerek: 'Kerek',
    v: 'V-kivágás',
    kare: 'Karé (szögletes)',
    garbo: 'Garbó',
    halter: 'Nyakba kötős',
    pantnelkuli: 'Pánt nélküli',
    spagetti: 'Spagettipántos',
    egyvallas: 'Egyvállas'
  },

  sleeves: {
    nincs: 'Ujjatlan',
    kis: 'Vállujj',
    rovid: 'Rövid ujj',
    haromnegyed: 'Háromnegyedes',
    hosszu: 'Hosszú ujj',
    harang: 'Harangujj',
    puff: 'Puffos ujj'
  },

  topDetails: {
    nincs: 'Nincs',
    kozepbetet: 'Középső betét',
    kivagas: 'Oldalsó kivágás',
    fuzes: 'Fűzés elöl',
    atlos: 'Átlós csík',
    colorblock: 'Kétszínű (colorblock)',
    halo: 'Hálós vállrész'
  },

  bottoms: {
    nincs: { name: 'Nincs', kind: 'none' },
    leggings: { name: 'Leggings', kind: 'pants' },
    short: { name: 'Rövidnadrág', kind: 'pants' },
    palazzo: { name: 'Bő szárú (palazzo)', kind: 'pants' },
    trapez: { name: 'Trapéz nadrág', kind: 'pants' },
    buggyos: { name: 'Buggyos (háremnadrág)', kind: 'pants' },
    mini: { name: 'Mini körszoknya', kind: 'skirt' },
    midi: { name: 'Midi A-vonalú', kind: 'skirt' },
    maxi: { name: 'Földig érő maxi', kind: 'skirt' },
    asym: { name: 'Aszimmetrikus', kind: 'skirt' },
    zsebkendo: { name: 'Zsebkendő-szoknya', kind: 'skirt' },
    retegelt: { name: 'Rétegelt fodros', kind: 'skirt' },
    sliccelt: { name: 'Sliccelt maxi', kind: 'skirt' },
    tutu: { name: 'Tütü', kind: 'skirt' }
  },

  waists: {
    magas: 'Magas derék',
    derek: 'Derékon',
    csipo: 'Csípőn ülő'
  },

  extras: {
    ov: 'Öv / derékpánt',
    rojt: 'Rojtok',
    fodor: 'Fodor a szegélyen',
    kopeny: 'Szárnyköpeny',
    szalag: 'Lobogó szalag',
    kesztyu: 'Hosszú kesztyű',
    fejdisz: 'Fejdísz',
    nyakpant: 'Nyakpánt',
    flitter: 'Flitteres felső'
  },

  fabrics: {
    lycra: { name: 'Lycra / elasztikus', opacity: 1, sway: 0.3, sheen: 'satin', weight: 1, desc: 'Testre simuló, négyirányban nyúló – teljes mozgásszabadság.' },
    jersey: { name: 'Jersey', opacity: 1, sway: 0.6, sheen: 'matt', weight: 2, desc: 'Puha, esése jó, kényelmes padlómunkához is.' },
    sifon: { name: 'Sifon / georgette', opacity: 0.8, sway: 1, sheen: 'matt', weight: 1, desc: 'Könnyű, lebegő, áttetsző – forgásoknál gyönyörűen száll.' },
    szatén: { name: 'Szatén / selyem', opacity: 1, sway: 0.85, sheen: 'gloss', weight: 2, desc: 'Fényes, folyós esésű, színpadi fényben csillog.' },
    tull: { name: 'Tüll', opacity: 0.72, sway: 0.45, sheen: 'matt', weight: 1, desc: 'Merevített hálós anyag – térfogatot ad, tütühöz, rétegekhez.' },
    barsony: { name: 'Bársony', opacity: 1, sway: 0.35, sheen: 'velvet', weight: 3, desc: 'Nehéz, mély színű, elnyeli a fényt – drámai hatás.' },
    halo: { name: 'Háló / mesh', opacity: 0.55, sway: 0.4, sheen: 'matt', weight: 1, desc: 'Áttetsző, rétegezhető, modern hatású.' },
    lame: { name: 'Fémes lamé', opacity: 1, sway: 0.55, sheen: 'metal', weight: 2, desc: 'Fémesen csillogó, látványos showelemekhez.' }
  },

  patterns: {
    egyszinu: 'Egyszínű',
    ombre: 'Színátmenet',
    csikos: 'Csíkos',
    pottyos: 'Pöttyös',
    kockas: 'Kockás',
    cikcakk: 'Cikcakk',
    hullam: 'Hullám',
    haromszog: 'Háromszögek',
    rombusz: 'Rombusz',
    nepi: 'Népi virág',
    allat: 'Állatminta',
    marvany: 'Márvány',
    batik: 'Batikolt',
    pikkely: 'Pikkely',
    konfetti: 'Konfetti',
    mozaik: 'Mozaik / glitch',
    galaxis: 'Galaxis'
  },

  poses: {
    alap: { name: 'Alapállás', arm: { L: [12, 6], R: [12, 6] }, leg: { L: [3, 1], R: [3, 1] } },
    vkar: { name: 'V-kar', arm: { L: [150, 160], R: [150, 160] }, leg: { L: [3, 1], R: [9, 12] } },
    kitaras: { name: 'Kitárás (á la seconde)', arm: { L: [92, 106], R: [92, 106] }, leg: { L: [3, 1], R: [75, 82] } },
    passe: { name: 'Passé', arm: { L: [95, 112], R: [165, 172] }, leg: { L: [3, 1], R: [72, -62] } },
    plie: { name: 'Plié (II. pozíció)', arm: { L: [62, 96], R: [62, 96] }, leg: { L: [24, -6], R: [24, -6] } },
    ugras: { name: 'Ugrás', arm: { L: [128, 140], R: [128, 140] }, leg: { L: [52, 58], R: [52, 58] }, air: -55 },
    kontrakcio: { name: 'Kontrakció', arm: { L: [32, -48], R: [26, -58] }, leg: { L: [6, 2], R: [20, 30] } }
  },
  choreo: ['alap', 'vkar', 'kitaras', 'passe', 'plie', 'ugras', 'kontrakcio'],

  backgrounds: { studio: 'Stúdió', szinpad: 'Színpad', papir: 'Tervlap papír' },

  lights: {
    feher: { name: 'Fehér', color: null },
    meleg: { name: 'Meleg borostyán', color: '#ffb766' },
    hideg: { name: 'Hideg kék', color: '#7fb2ff' },
    lila: { name: 'Lila', color: '#c08bff' },
    piros: { name: 'Vörös', color: '#ff6b6b' },
    zold: { name: 'Zöld', color: '#86f0a6' },
    uv: { name: 'UV (feketefény)', color: 'uv' }
  },

  drawStyles: { tiszta: 'Tiszta', vazlat: 'Vázlat', akvarell: 'Akvarell' },

  danceStyles: {
    kortars: {
      name: 'Kortárs',
      lengths: ['crop', 'waist', 'leotard', 'tunic'], necklines: ['kerek', 'v', 'egyvallas', 'garbo', 'halter'],
      sleeves: ['nincs', 'hosszu', 'harang', 'haromnegyed'], details: ['nincs', 'atlos', 'colorblock', 'halo', 'kivagas'],
      bottoms: ['palazzo', 'midi', 'asym', 'zsebkendo', 'leggings', 'buggyos'],
      patterns: ['egyszinu', 'ombre', 'marvany', 'batik', 'hullam', 'egyszinu'],
      fabrics: ['jersey', 'sifon', 'halo', 'lycra'],
      extras: ['kopeny', 'szalag', 'kesztyu'],
      desc: 'Szabad, a mozdulatot követő formák, organikus felületek.'
    },
    lirai: {
      name: 'Lírai',
      lengths: ['leotard', 'waist', 'crop'], necklines: ['v', 'kerek', 'spagetti', 'halter', 'egyvallas'],
      sleeves: ['nincs', 'harang', 'hosszu', 'kis'], details: ['nincs', 'halo', 'kozepbetet'],
      bottoms: ['midi', 'maxi', 'asym', 'zsebkendo', 'sliccelt'],
      patterns: ['ombre', 'egyszinu', 'batik', 'marvany'],
      fabrics: ['sifon', 'szatén', 'halo'],
      extras: ['kopeny', 'szalag', 'fejdisz'],
      desc: 'Lebegő, áttetsző rétegek, puha színátmenetek.'
    },
    jazz: {
      name: 'Jazz',
      lengths: ['crop', 'leotard', 'waist'], necklines: ['halter', 'v', 'kare', 'egyvallas', 'spagetti'],
      sleeves: ['nincs', 'hosszu', 'kis'], details: ['nincs', 'kivagas', 'colorblock', 'atlos'],
      bottoms: ['trapez', 'short', 'mini', 'leggings', 'palazzo'],
      patterns: ['egyszinu', 'csikos', 'pottyos', 'cikcakk', 'allat'],
      fabrics: ['lycra', 'lame', 'szatén'],
      extras: ['rojt', 'ov', 'kesztyu', 'flitter', 'nyakpant'],
      desc: 'Éles vonalak, csillogás, erős kontrasztok.'
    },
    hiphop: {
      name: 'Hip-hop / street',
      lengths: ['crop', 'tunic', 'waist'], necklines: ['kerek', 'garbo', 'kare'],
      sleeves: ['rovid', 'hosszu', 'nincs', 'haromnegyed'], details: ['colorblock', 'atlos', 'nincs', 'kozepbetet'],
      bottoms: ['buggyos', 'palazzo', 'short', 'leggings'],
      patterns: ['mozaik', 'kockas', 'konfetti', 'csikos', 'haromszog', 'egyszinu'],
      fabrics: ['jersey', 'lycra'],
      extras: ['ov', 'nyakpant', 'kesztyu'],
      desc: 'Laza szabás, grafikus minták, utcai attitűd.'
    },
    latin: {
      name: 'Latin / show',
      lengths: ['crop', 'leotard'], necklines: ['halter', 'v', 'egyvallas', 'pantnelkuli', 'spagetti'],
      sleeves: ['nincs', 'puff', 'harang'], details: ['kivagas', 'nincs', 'fuzes'],
      bottoms: ['mini', 'asym', 'retegelt', 'sliccelt', 'zsebkendo'],
      patterns: ['egyszinu', 'allat', 'pikkely', 'ombre'],
      fabrics: ['lycra', 'szatén', 'lame'],
      extras: ['rojt', 'fodor', 'flitter', 'nyakpant'],
      desc: 'Rojtok, fodrok, testet kiemelő szabás, sok csillogás.'
    },
    neptanc: {
      name: 'Modern néptánc',
      lengths: ['waist', 'crop', 'tunic'], necklines: ['kerek', 'kare', 'v'],
      sleeves: ['puff', 'rovid', 'haromnegyed', 'harang'], details: ['fuzes', 'kozepbetet', 'nincs'],
      bottoms: ['retegelt', 'midi', 'mini', 'palazzo'],
      patterns: ['nepi', 'nepi', 'csikos', 'rombusz', 'kockas'],
      fabrics: ['jersey', 'szatén', 'barsony'],
      extras: ['ov', 'fodor', 'szalag', 'fejdisz'],
      desc: 'Hagyományos motívumok újragondolva, erős színek.'
    },
    balett: {
      name: 'Neoklasszikus balett',
      lengths: ['leotard'], necklines: ['kerek', 'v', 'spagetti', 'kare', 'pantnelkuli'],
      sleeves: ['nincs', 'kis', 'hosszu'], details: ['nincs', 'halo', 'kozepbetet'],
      bottoms: ['tutu', 'midi', 'nincs', 'mini'],
      patterns: ['egyszinu', 'ombre', 'marvany'],
      fabrics: ['lycra', 'tull', 'sifon'],
      extras: ['fejdisz', 'flitter', 'nyakpant'],
      desc: 'Tiszta vonalak, tüll, finom díszítés.'
    },
    futur: {
      name: 'Futurisztikus / experimentális',
      lengths: ['leotard', 'crop', 'tunic'], necklines: ['garbo', 'egyvallas', 'halter', 'kare'],
      sleeves: ['hosszu', 'nincs', 'harang', 'puff'], details: ['colorblock', 'atlos', 'halo', 'kivagas'],
      bottoms: ['leggings', 'asym', 'palazzo', 'trapez', 'zsebkendo'],
      patterns: ['galaxis', 'mozaik', 'haromszog', 'ombre', 'pikkely'],
      fabrics: ['lame', 'lycra', 'halo'],
      extras: ['kopeny', 'kesztyu', 'nyakpant', 'fejdisz'],
      desc: 'Fémes felületek, geometria, váratlan sziluettek.'
    }
  },

  moods: {
    energikus: {
      name: 'Energikus',
      palettes: [['#ff3d6e', '#ffd23f', '#1a1a2e'], ['#ff6b00', '#00c2d1', '#ffffff'], ['#e6ff00', '#ff2e93', '#20124d']],
      light: 'feher', adj: ['Lüktető', 'Izzó', 'Szikrázó', 'Robbanó', 'Villámló'],
      desc: 'feszes ritmus és robbanékony energia'
    },
    melankolikus: {
      name: 'Melankolikus',
      palettes: [['#3d5a80', '#98c1d9', '#e0fbfc'], ['#5c5470', '#b9b4c7', '#352f44'], ['#4a5759', '#b0c4b1', '#dedbd2']],
      light: 'hideg', adj: ['Csendes', 'Halványuló', 'Esős', 'Elcsukló', 'Ködös'],
      desc: 'elnyújtott, befelé forduló mozdulatok és csend'
    },
    misztikus: {
      name: 'Misztikus',
      palettes: [['#240046', '#9d4edd', '#e0aaff'], ['#03045e', '#00b4d8', '#caf0f8'], ['#1b1b3a', '#693668', '#d3a588']],
      light: 'lila', adj: ['Éjféli', 'Rejtett', 'Holdfényes', 'Álombeli', 'Varázsos'],
      desc: 'titokzatos, lassan kibomló képek'
    },
    jatekos: {
      name: 'Játékos',
      palettes: [['#ffbe0b', '#fb5607', '#3a86ff'], ['#ff99c8', '#fcf6bd', '#a9def9'], ['#06d6a0', '#ffd166', '#ef476f']],
      light: 'meleg', adj: ['Pattogó', 'Vidám', 'Cukorka', 'Bolondos', 'Napsütéses'],
      desc: 'könnyed humor és pattogó lépések'
    },
    elegans: {
      name: 'Elegáns',
      palettes: [['#111111', '#c9a227', '#f5f0e6'], ['#0b1d3a', '#e8e8e8', '#b08d57'], ['#5a0f1e', '#e9d8a6', '#1c1c1c']],
      light: 'meleg', adj: ['Arany', 'Bársonyos', 'Királyi', 'Éjszakai', 'Kifinomult'],
      desc: 'letisztult vonalak és visszafogott luxus'
    },
    vad: {
      name: 'Vad',
      palettes: [['#d00000', '#1b1b1b', '#ffba08'], ['#6a040f', '#e85d04', '#faa307'], ['#283618', '#bc6c25', '#dda15e']],
      light: 'piros', adj: ['Lángoló', 'Vad', 'Törzsi', 'Perzselő', 'Ösztönös'],
      desc: 'ösztönös, földközeli, nyers erő'
    },
    romantikus: {
      name: 'Romantikus',
      palettes: [['#ffc8dd', '#cdb4db', '#ffffff'], ['#f4acb7', '#9d8189', '#ffe5d9'], ['#e5989b', '#ffcdb2', '#6d6875']],
      light: 'meleg', adj: ['Rózsaszín', 'Hajnali', 'Szerelmes', 'Virágzó', 'Gyengéd'],
      desc: 'gyengédség, kapcsolódás, áramló duettek'
    },
    futurisztikus: {
      name: 'Futurisztikus',
      palettes: [['#0d0d0d', '#00f5d4', '#f15bb5'], ['#c0c0c0', '#3a0ca3', '#4cc9f0'], ['#10002b', '#c77dff', '#80ffdb']],
      light: 'uv', adj: ['Neon', 'Digitális', 'Kozmikus', 'Fémes', 'Holografikus'],
      desc: 'gépies precizitás és kozmikus távlatok'
    }
  },

  nouns: ['Hullám', 'Szél', 'Láng', 'Árnyék', 'Hajnal', 'Visszhang', 'Lélegzet', 'Spirál', 'Fátyol', 'Szikra',
    'Áramlat', 'Pillanat', 'Örvény', 'Kristály', 'Délibáb', 'Ritmus', 'Tükör', 'Ösvény', 'Rezgés', 'Csillagpor'],

  phrases: {
    bottom: {
      nincs: 'a szabadon hagyott láb a vonalakat hangsúlyozza',
      leggings: 'a testre simuló leggings tisztán megmutatja a lábmunkát',
      short: 'a rövidnadrág teljes szabadságot ad az ugrásokhoz',
      palazzo: 'a bő szárú nadrág minden lépésnél hullámzik',
      trapez: 'a trapéz szár a lábfej mozdulatait keretezi',
      buggyos: 'a buggyos nadrág laza, földközeli mozgást enged',
      mini: 'a mini körszoknya forgásnál korongként nyílik ki',
      midi: 'a midi szoknya puhán követi a súlyáthelyezéseket',
      maxi: 'a földig érő szoknya minden fordulatot uszályként kísér',
      asym: 'az aszimmetrikus szegély dinamikus átlót rajzol',
      zsebkendo: 'a zsebkendő-szoknya csúcsai a mozdulat végén is lebegnek',
      retegelt: 'a rétegelt fodrok egymás után lendülnek ki',
      sliccelt: 'a slicc a lábkiemeléseknél látványosan kinyílik',
      tutu: 'a tütü klasszikus, ragyogó sziluettet ad'
    },
    pattern: {
      egyszinu: 'tiszta egyszínű felületekkel', ombre: 'lágy színátmenettel', csikos: 'ritmikus csíkokkal',
      pottyos: 'játékos pöttyökkel', kockas: 'grafikus kockákkal', cikcakk: 'energikus cikcakkokkal',
      hullam: 'hullámzó vonalakkal', haromszog: 'éles háromszögekkel', rombusz: 'rombusz-motívumokkal',
      nepi: 'újragondolt népi virágmotívumokkal', allat: 'vad állatmintával', marvany: 'márványos erezettel',
      batik: 'batikolt foltokkal', pikkely: 'csillogó pikkelyekkel', konfetti: 'konfettiszerű szórással',
      mozaik: 'digitális mozaikkal', galaxis: 'csillagködös galaxismintával'
    }
  },

  defaultDesign() {
    return {
      name: 'Új tervem',
      figure: { skin: '#ecc3a3', hair: 'konty', hairColor: '#3b2a20' },
      top: {
        length: 'leotard', neckline: 'v', sleeve: 'harang', detail: 'nincs', fabric: 'lycra',
        fill: { pattern: 'ombre', colors: ['#3a0ca3', '#7209b7', '#f72585'], scale: 1, rotation: 0 }
      },
      bottom: {
        type: 'asym', waist: 'derek', flare: 0.55, fabric: 'sifon', matchTop: false,
        fill: { pattern: 'ombre', colors: ['#7209b7', '#f72585', '#ffd6ea'], scale: 1, rotation: 0 }
      },
      accent: { fill: { pattern: 'egyszinu', colors: ['#ffd166', '#ffffff', '#f72585'], scale: 1, rotation: 0 } },
      extras: { ov: false, rojt: false, fodor: false, kopeny: false, szalag: true, kesztyu: false, fejdisz: false, nyakpant: false, flitter: false },
      sketch: null,
      notes: ''
    };
  }
};
