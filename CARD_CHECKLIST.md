# Exploding Dinos todo's

Doel: overdracht en open werk bijhouden, zodat een nieuwe chat direct verder kan. De actuele kaartregels staan in `README.md` en `src/cards.js`.

## Start hier in een nieuwe chat

- De volledige playthrough-backlog met 13 punten staat in PR #6 en is klaar voor review.
- Werkbranch: `codex/playthrough-backlog`.
- Laatste functionele commit vóór deze documentatie-update: `13aad5c` (`Stabilize browser and public smoke tests`).
- Render Blueprint: `render.yaml`; service: `https://exploding-dinos-api.onrender.com`.
- Healthcheck: `https://exploding-dinos-api.onrender.com/api/health` retourneert `200` met `{"ok":true}`.
- De frontend gebruikt lokaal `http://localhost:3000` en online automatisch de Render-URL via `src/multiplayer-config.js`.
- De multiplayerfrontend wordt nu vanaf `main` via GitHub Pages gepubliceerd.
- De roomlobby toont tijdens een Render-cold-start een laadindicator met uitleg, blokkeert dubbele aanvragen en heeft een begrijpelijke timeoutmelding.
- De spelersnaam en dobbelknop worden vergrendeld zodra een room actief is en komen pas na verlaten weer vrij.
- De primaire multiplayeracties `Deelnemen` en `Start multiplayer` gebruiken dezelfde knopstijl en interactiestates als de primaire spelacties.
- De verouderde disclaimer over multiplayer in ontwikkeling is uit de interface en documentatie verwijderd.
- De dinonaamgenerator bevat 24 begin- en 24 einddelen, bewaakt 576 unieke combinaties van maximaal 24 tekens en probeert automatisch opnieuw bij een conflict met een gegenereerde naam.
- Het logboek staat op desktop en mobiel standaard verborgen achter het menu, toont eerst de laatste 5 acties en kan naar het volledige bewaarde log schakelen.
- Lokale web- en API-logs worden via `.gitignore` genegeerd; de tijdelijke map `pet-runs/` is verwijderd.

## Huidige stand

- `node --test tests/*.test.js` is groen via de gebundelde Node-runtime: 78 tests.
- De volledige Playwright-matrix is groen: 65 tests geslaagd en 3 desktopvarianten van mobiel-specifieke tests bewust overgeslagen.
- De risicovolste spelregels hebben gerichte regeltests: setup-aantallen, `Meteorietinslag` met/zonder `Schuilgrot`, raptor-stapeling, `Brul Terug`-ketens en soortpaarbeloningen.
- De beurt-effecten van alle kaarttypes zijn vastgelegd in een regressietest; `Ptero Pret` eindigt na het herschikken de beurt.
- `CARD_RULES_AUDIT.md` vergelijkt kaarttekst, README en singleplayer-/multiplayergedrag en legt open regelbesluiten vast.
- De eerste testgevoelige spelregels staan in `src/rules.js`: deck/setup-aantallen, meteoriet-afhandeling, aanvalslading/terugkeer, `Brul Terug`-pariteit en soortpaarbeloningstype.
- Alle 17 kaarttypes staan in `README.md` als `klaar`.
- Alle kaarttypes hebben een gekoppelde illustratie; veelvoorkomende soortkaarten hebben extra illustratievarianten.
- Alle kaartformaten gebruiken een beeldvullende illustratie met leesbare titel- en regeloverlays; de focus is data-gestuurd en ondersteunt een override per illustratie.
- De NPC-selectie geeft beginnersadvies: start met 1 tegenstander; meer spelers geeft meer chaos.
- Alle 9 NPC's hebben een eigen speelstijlprofiel dat kaartkeuze, doelwitkeuze, blokkeren, risico en deckcontrole beinvloedt.
- Trekken, afleggen en meteorietmomenten hebben subtiele animatie-polish met reduced-motion fallback.
- In multiplayer zien alle spelers zowel de getrokken `Meteorietinslag` als de ingezette `Schuilgrot`; alleen de terugplaatsingspositie blijft geheim.
- Het Party Pack bevat 11 Meteorietinslagen; elk potje gebruikt daarvan `aantal spelers + 1` exemplaren.
- Elk nieuw spel stopt standaard `aantal spelers + 1` Meteorietinslagen in de trekstapel.
- De README bevat actuele start-, test- en GitHub Pages-instructies.
- Singleplayer en multiplayer staan live via GitHub Pages.
- De mobiele layout heeft een compacte sticky header, een bereikbare trekactie, horizontale tegenstander- en handrails, leesbare kaarttekst, touchfeedback en safe-area-ondersteuning.
- Tegenstanderhanden gebruiken op desktop en mobiel maximaal vier overlappende kaartruggen en een badge met het volledige kaartenaantal; ook een lege hand toont expliciet `0`.
- Dialogen beheren focus, blokkeren achtergrondscroll en ondersteunen Escape waar sluiten veilig is.
- Menu, uitleg en multiplayer delen één schaalbaar SVG-sluiticoon met een toegankelijk label en consistente interactiestijlen.
- De Playwright-matrix bevat desktop, Pixel 5, 320 x 568 en mobiel landschap.
- De smokeharness van de projectskill volgt automatisch de scriptvolgorde uit `index.html`; een regressietest bewaakt runtime-initialisatie, eventbinding en de eerste render.

## Volgende prioriteit

- [ ] Review en merge PR #6 van `codex/playthrough-backlog` naar `main`.
- [ ] Test na de merge de nieuwe GitHub Pages-deployment met `npm run test:public`.
- [ ] Werk na de merge de machinegerichte vervolgstappen uit `NEXT_STEPS_BACKLOG.md` af op een nieuwe branch; start met de regelbesluiten in fase A.
- [ ] Controleer in Render dat `ALLOWED_ORIGIN=https://timzegveld.github.io` actief is en de laatste deployment groen blijft.
  - Live gecontroleerd op 15 juli 2026: `/api/health` retourneert `ok: true` en de CORS-header is exact `https://timzegveld.github.io`; alleen de visuele bevestiging in het Render-dashboard blijft handmatig.
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

## Technische aandachtspunten

- [ ] Maak de willekeurige room-servertest deterministisch; `spelacties vereisen de actuele roomversie` kan incidenteel een Meteorietinslag trekken terwijl de test een gewone `DRAW_REVEAL` verwacht.
- [ ] Bepaal of rooms voor productie persistent moeten worden. Ze staan nu alleen in het geheugen en verdwijnen bij een Render-restart of nieuwe deployment.
- [x] Houd rekening met de cold start van het gratis Render-plan met zichtbare wachtstatus, geblokkeerde dubbele acties en een timeoutmelding.

## Later, niet blokkerend

- [ ] Overweeg extra kaarttypes of set-combo's, pas na balans en testdekking.
