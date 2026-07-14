# Exploding Dinos todo's

Doel: alleen open werk bijhouden. Afgeronde kaart-, artwork-, persona-, README- en basispublicatietaken staan niet meer in deze lijst; de huidige kaartregels staan in `README.md` en `src/cards.js`.

## Huidige stand

- `node --test tests/*.test.js` is groen via de gebundelde Node-runtime: 28 tests.
- De risicovolste spelregels hebben gerichte regeltests: setup-aantallen, `Meteorietinslag` met/zonder `Schuilgrot`, raptor-stapeling, `Brul Terug`-ketens en soortpaarbeloningen.
- De beurt-effecten van alle kaarttypes zijn vastgelegd in een regressietest; `Ptero Pret` eindigt na het herschikken de beurt.
- De eerste testgevoelige spelregels staan in `src/rules.js`: deck/setup-aantallen, meteoriet-afhandeling, aanvalslading/terugkeer, `Brul Terug`-pariteit en soortpaarbeloningstype.
- Alle 17 kaarttypes staan in `README.md` als `klaar`.
- Alle kaarttypes hebben een gekoppelde illustratie; veelvoorkomende soortkaarten hebben extra illustratievarianten.
- De NPC-selectie geeft beginnersadvies: start met 1 tegenstander; meer spelers geeft meer chaos.
- Alle 9 NPC's hebben een eigen speelstijlprofiel dat kaartkeuze, doelwitkeuze, blokkeren, risico en deckcontrole beinvloedt.
- Trekken, afleggen en meteorietmomenten hebben subtiele animatie-polish met reduced-motion fallback.
- In multiplayer zien alle spelers zowel de getrokken `Meteorietinslag` als de ingezette `Schuilgrot`; alleen de terugplaatsingspositie blijft geheim.
- De README bevat actuele start-, test- en GitHub Pages-instructies.
- GitHub Pages staat als live URL in de README; publicatie zelf is dus geen open taak meer.
- De mobiele layout heeft een compacte sticky header, een bereikbare trekactie, horizontale tegenstander- en handrails, leesbare kaarttekst, touchfeedback en safe-area-ondersteuning.
- Dialogen beheren focus, blokkeren achtergrondscroll en ondersteunen Escape waar sluiten veilig is.
- De Playwright-browserlaag is groen: 29 tests slagen en 3 niet-relevante desktopvarianten worden overgeslagen. De matrix bevat desktop, Pixel 5, 320 x 568 en mobiel landschap.

## Volgende prioriteit

- [ ] Test complete potjes handmatig op echte iOS- en Android-apparaten, inclusief vier tegenstanders en lange handen.
  - Controleer Safari safe areas, adresbalk-resize, scrollgedrag van beide rails en mobiel landschap.
  - Noteer alleen problemen die niet door de huidige Chromium-browsermatrix worden gevangen.

## Gameplay en balans

- [ ] Speel meerdere potjes met 2, 3, 4 en 5 spelers en noteer waar potjes te kort, te lang of te willekeurig voelen.
- [ ] Doe een balansronde op aantallen voor `Meteorietinslag`, `Schuilgrot`, aanvallen, `Brul Terug` en soortkaarten.
- [ ] Check of pc-spelers geen nutteloze acties verspillen vlak voor een ongevaarlijke trek.
- [ ] Speel gericht tegen alle 9 NPC-stijlen en tune de kansprofielen waar gedrag te vlak, te gemeen of te willekeurig voelt.
- [ ] Overweeg moeilijkheidsgraden voor pc-spelers nadat de basisbalans goed voelt.

## Presentatie en mobiele QA

- [x] Maak de primaire trekactie mobiel direct bereikbaar en houd de header compact.
- [x] Zet tegenstanders en handkaarten om naar compacte horizontale rails.
- [x] Verhoog de kleinste kaarttekst en markeer speelbare/niet-speelbare handkaarten.
- [x] Voeg focusbeheer, Escape-afhandeling, achtergrondscrollblokkering en zichtbare focusstijlen toe.
- [x] Test handkaarten, reveal-kaarten, catalogus, vier tegenstanders, overflow en dialogen op meerdere mobiele Chromium-viewports.
- [ ] Controleer kaartleesbaarheid en duimbereik op minstens één echte iPhone en één echt Android-toestel.
- [ ] Check de gepubliceerde GitHub Pages-versie op telefoonformaat na de volgende inhoudelijke wijziging.

## Testdekking

- [ ] Voeg browserflows toe voor zeldzame reactieketens: meerdere `Brul Terug`-kaarten, doorgeschoven raptoraanvallen en meteorietplaatsing.
- [ ] Voeg een langere gesimuleerde browserflow toe die meerdere opeenvolgende beurten doorloopt.
- [ ] Overweeg een automatische toegankelijkheidscheck zodra daarvoor een kleine, stabiele dependency gewenst is.

## Later, niet blokkerend

- [ ] Overweeg extra kaarttypes of set-combo's, pas na balans en testdekking.
