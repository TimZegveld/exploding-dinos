# Exploding Dinos todo's

Doel: alleen open werk bijhouden. Afgeronde kaart-, artwork-, persona-, README- en basispublicatietaken staan niet meer in deze lijst; de huidige kaartregels staan in `README.md` en `src/cards.js`.

## Huidige stand

- `npm test` is groen via de gebundelde Node-runtime: 15 tests.
- Alle 17 kaarttypes staan in `README.md` als `klaar`.
- Alle kaarttypes hebben een gekoppelde illustratie; veelvoorkomende soortkaarten hebben extra illustratievarianten.
- De NPC-selectie geeft beginnersadvies: start met 1 tegenstander; meer spelers geeft meer chaos.
- De README bevat actuele start-, test- en GitHub Pages-instructies.
- GitHub Pages staat als live URL in de README; publicatie zelf is dus geen open taak meer.
- Een structurele echte-browser testlaag ontbreekt nog; Playwright is niet beschikbaar in de huidige runtime.

## Volgende prioriteit

- [ ] Voeg gerichte regeltests toe voor de risicovolste spelregels.
  - `Meteorietinslag` met en zonder `Schuilgrot`.
  - `Raptor Aanval`, `Gerichte Raptorjacht`, `Brul Terug` en gestapelde beurten.
  - Paarbeloningen: `Mini-Raptor`, `Stego Snack`, `Bronto Buik`, `Tricera-Tuk`, `Ptero Pret` en `Wilde Dino`.
- [ ] Haal de meest testgevoelige spelregels stap voor stap uit `game.js`.
  - Begin met deck/setup, beurtwissel, meteoriet-afhandeling en aanval-afhandeling.
  - Maak randomness injecteerbaar, zodat pc-keuzes, deckvolgorde en meteorietplaatsing deterministisch getest kunnen worden.
- [ ] Voeg een kleine echte-browser testlaag toe voor desktop en mobiel.
  - Minimaal: startscherm, handkaarten, kaartdetail openen/sluiten, reveal-overlay, catalogus en eindscherm.
  - Check console errors en layout op een telefoonviewport.
  - Gebruik Playwright of een vergelijkbare browser-runner wanneer die beschikbaar is.

## Gameplay en balans

- [ ] Speel meerdere potjes met 2, 3, 4 en 5 spelers en noteer waar potjes te kort, te lang of te willekeurig voelen.
- [ ] Doe een balansronde op aantallen voor `Meteorietinslag`, `Schuilgrot`, aanvallen, `Brul Terug` en soortkaarten.
- [ ] Check of pc-spelers geen nutteloze acties verspillen vlak voor een ongevaarlijke trek.
- [ ] Overweeg moeilijkheidsgraden voor pc-spelers nadat de basisbalans goed voelt.

## Presentatie en mobiele QA

- [ ] Check kaartleesbaarheid op telefoon: handkaarten, reveal-kaarten, catalogus en doelwitkeuzes.
- [ ] Voeg kleine animatie-polish toe waar het spelverloop er duidelijker van wordt, bijvoorbeeld trekken, afleggen en meteorietmomenten.
- [ ] Check de gepubliceerde GitHub Pages-versie op telefoonformaat na de volgende inhoudelijke wijziging.

## Later, niet blokkerend

- [ ] Overweeg extra kaarttypes of set-combo's, pas na balans en testdekking.
