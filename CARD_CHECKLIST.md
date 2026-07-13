# Exploding Dinos todo's

Doel: alleen open werk bijhouden. Afgeronde kaart-, artwork-, persona-, README- en basispublicatietaken staan niet meer in deze lijst; de huidige kaartregels staan in `README.md` en `src/cards.js`.

## Huidige stand

- `node --test tests/*.test.js` is groen via de gebundelde Node-runtime: 24 tests.
- De risicovolste spelregels hebben gerichte regeltests: setup-aantallen, `Meteorietinslag` met/zonder `Schuilgrot`, raptor-stapeling, `Brul Terug`-ketens en soortpaarbeloningen.
- De eerste testgevoelige spelregels staan in `src/rules.js`: deck/setup-aantallen, meteoriet-afhandeling, aanvalslading/terugkeer, `Brul Terug`-pariteit en soortpaarbeloningstype.
- Alle 17 kaarttypes staan in `README.md` als `klaar`.
- Alle kaarttypes hebben een gekoppelde illustratie; veelvoorkomende soortkaarten hebben extra illustratievarianten.
- De NPC-selectie geeft beginnersadvies: start met 1 tegenstander; meer spelers geeft meer chaos.
- Alle 9 NPC's hebben een eigen speelstijlprofiel dat kaartkeuze, doelwitkeuze, blokkeren, risico en deckcontrole beinvloedt.
- Trekken, afleggen en meteorietmomenten hebben subtiele animatie-polish met reduced-motion fallback.
- De README bevat actuele start-, test- en GitHub Pages-instructies.
- GitHub Pages staat als live URL in de README; publicatie zelf is dus geen open taak meer.
- Een structurele echte-browser testlaag ontbreekt nog; Playwright is niet beschikbaar in de huidige runtime.

## Volgende prioriteit

- [ ] Voeg een kleine echte-browser testlaag toe voor desktop en mobiel.
  - Minimaal: startscherm, handkaarten, kaartdetail openen/sluiten, reveal-overlay, catalogus en eindscherm.
  - Check console errors en layout op een telefoonviewport.
  - Gebruik Playwright of een vergelijkbare browser-runner wanneer die beschikbaar is.

## Gameplay en balans

- [ ] Speel meerdere potjes met 2, 3, 4 en 5 spelers en noteer waar potjes te kort, te lang of te willekeurig voelen.
- [ ] Doe een balansronde op aantallen voor `Meteorietinslag`, `Schuilgrot`, aanvallen, `Brul Terug` en soortkaarten.
- [ ] Check of pc-spelers geen nutteloze acties verspillen vlak voor een ongevaarlijke trek.
- [ ] Speel gericht tegen alle 9 NPC-stijlen en tune de kansprofielen waar gedrag te vlak, te gemeen of te willekeurig voelt.
- [ ] Overweeg moeilijkheidsgraden voor pc-spelers nadat de basisbalans goed voelt.

## Presentatie en mobiele QA

- [ ] Check kaartleesbaarheid op telefoon: handkaarten, reveal-kaarten, catalogus en doelwitkeuzes.
- [ ] Check de gepubliceerde GitHub Pages-versie op telefoonformaat na de volgende inhoudelijke wijziging.

## Later, niet blokkerend

- [ ] Overweeg extra kaarttypes of set-combo's, pas na balans en testdekking.
