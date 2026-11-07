# TáncRuha Stúdió

Jelmeztervező alkalmazás táncosoknak: formák, minták, színek, mozgás és színpadi fény gyors kipróbálása látványtervvel.

Nincs szükség telepítésre vagy szerverre: nyisd meg az `index.html` fájlt egy böngészőben
(vagy tedd közzé GitHub Pages-en). Minden adat a böngészőben marad.

## Mit tud?

**Tervező**
- **Forma** – felsőrész hossza (crop, derékig, tunika, body), 8 nyakkivágás, 7 ujjtípus, részletek
  (középső betét, oldalsó kivágás, fűzés, átlós csík, colorblock, hálós vállrész), 14 alsórész
  (leggings, palazzo, trapéz, háremnadrág, mini/midi/maxi, aszimmetrikus, zsebkendő, rétegelt, sliccelt, tütü),
  derékmagasság, bőség, egybeszabott ruha.
- **Anyagok** – lycra, jersey, sifon, szatén, tüll, bársony, háló, lamé. Az anyag hat a látványra
  (áttetszőség, fényesség) és arra is, mennyire lebben a szoknya mozgás közben.
- **Minta & szín** – 17 minta (színátmenet, csíkos, pöttyös, kockás, cikcakk, hullám, háromszög, rombusz,
  népi virág, állatminta, márvány, batikolt, pikkely, konfetti, mozaik, galaxis…) külön a felsőre, alsóra
  és a díszítésre; állítható méret, elforgatás, 3 szín. Színharmónia-generátor (komplementer, analóg, triád…).
- **Kiegészítők** – öv, rojtok, fodor, szárnyköpeny, lobogó szalag, kesztyű, fejdísz, nyakpánt, flitter.
- **Pózok és mozgás** – 7 tánc-póz, *Forgás* (kinyíló szoknya, lebbenő rojt és szalag) és *Koreográfia*
  mód, amely pózról pózra animálja az alakot.
- **Színpad** – stúdió, színpad (fényvetővel) vagy tervlap-papír háttér; színes és UV (feketefény) világítás.
- **Rajzstílus** – tiszta, vázlat, akvarell.
- **Rajzolás** – szabadkézzel rajzolhatsz a tervre (díszítés, varrásvonal, ötlet).
- **Inspiráció** – táncstílus + hangulat alapján új ötletet generál névvel és koncepcióval;
  a formát, a színeket vagy a mintát zárolhatod.
- **Táncolhatóság** – mozgásszabadság, színpadi hatás és praktikum pontszám, gyakorlati tanácsokkal
  (pl. ráléphetsz-e a szoknyára, lecsúszhat-e a pánt nélküli felső, látszik-e a jelmez sötét színpadon).
- Visszavonás / újra (Ctrl+Z / Ctrl+Y), PNG és SVG letöltés, automatikus mentés.

**Csoportkép** – a terv 1–9 táncoson, különböző alakzatokban (V, sor, két sor, ív, ék, szórt),
színvariációkkal, kiemelt szólistával vagy a galéria terveivel; unisono, kánon vagy vegyes pózokkal.

**Galéria** – tervek mentése, megnyitása, másolása, JSON export/import (megosztáshoz, mentéshez).

**Tervlap** – nyomtatható (PDF-be menthető) összefoglaló: látványterv, mozgásban és színpadi fényben,
színkódok, anyag- és szabásjavaslatok, táncolhatósági megjegyzések, saját jegyzetek.

## Felépítés

```
index.html        – a felület
css/style.css     – stílusok (világos/sötét mód, mobil, nyomtatás)
js/data.js        – opciók, pózok, anyagok, táncstílusok, hangulatok
js/utils.js       – szín- és geometriai segédfüggvények
js/patterns.js    – SVG mintázatok
js/render.js      – az alak és a jelmez kirajzolása (SVG)
js/advisor.js     – táncolhatósági elemzés, inspiráció, anyagjavaslatok
js/app.js         – alkalmazáslogika, animáció, galéria, export
```
