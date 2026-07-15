# Next steps na vergelijking met Exploding Kittens Party Pack

Doel van dit bestand: uitvoerbare overdracht voor een volgende LLM-chat. Bron van de vergelijking was de officiële Nederlandse Exploding Kittens Party Pack-speluitleg (2 pagina's, copyright 2020). De bron-PDF is niet onderdeel van de repository; alle relevante observaties staan hieronder.

## Werkprotocol

- Werk op een nieuwe `codex/`-branch vanaf de gemergede `main` van PR #6.
- Behandel ieder ID als één onderwerp en één commit. Combineer IDs alleen na expliciete toestemming.
- Begin ieder onderwerp met inspectie van singleplayer (`game.js`), multiplayer (`server/game-engine.js`, `src/multiplayer.js`), kaartdata (`src/cards.js`) en bestaande tests.
- Houd singleplayer en multiplayer functioneel gelijk, tenzij een afwijking hieronder expliciet gewenst is.
- Update per onderwerp bestaande tests en voeg minimaal één regressietest toe. Draai relevante Node- en Playwright-tests voor afvinken.
- Werk na de laatste functionele commit `README.md`, `CARD_RULES_AUDIT.md`, deze backlog en andere geraakte documentatie bij in een aparte documentatiecommit.
- Verander nog geen balansmechaniek wanneer een taak expliciet een gebruikersbesluit vereist.

## Vastgestelde uitgangspunten

- Startspel blijft 8 handkaarten per speler: 1 gegarandeerde Schuilgrot plus 7 gedeelde kaarten. Dit komt overeen met de officiële opzet.
- Schuilgrot blijft automatisch gebruikt worden. Digitaal bestaat er geen zinvolle keuze om hem niet te gebruiken. Presentatie blijft openbaar; alleen de gekozen terugplaatsingspositie van de meteoriet is geheim.
- Vulkaan Shuffle blijft voorlopig de huidige kracht houden: schudden plus alleen voor de speler de nieuwe bovenste kaart tonen. Dit is bewust sterker dan de officiële Schud-kaart.
- Soortparen behouden hun unieke Dinos-beloningen. Ze worden niet vervangen door de generieke officiële paarregel.
- Het huidige standaardspel gebruikt `aantal spelers + 1` Meteorietinslagen. Dit is bewust gevaarlijker dan de officiële `aantal spelers - 1`; verander de bestaande default niet stilzwijgend.

## Fase A - regelpariteit en duidelijkheid

- [ ] **EK-01 Brul Terug-regelbesluit en pariteit**
  - Huidig: singleplayer laat Brul Terug bij bijna alle actiekaarten reageren; multiplayer vooral bij aanvallen en Brul Terug-ketens.
  - Aanbevolen regel: blokkeer iedere zichtbare actiekaart, maar nooit Meteorietinslag, Schuilgrot of een soortcombinatie. Iedere speler mag buiten de eigen beurt reageren. Oneven keten blokkeert; even keten laat de oorspronkelijke actie doorgaan.
  - Eerst aan gebruiker tonen: technische impact van een algemeen multiplayer-reactievenster, vooral bij geheime kijk-, herschik- en doelwitacties. Geen implementatie zonder bevestiging van het bereik.
  - Implementatie na akkoord: één gedeeld reactiemodel/protocol; actie-effect pas uitvoeren na gesloten reactievenster; voorkom lekken van geheime kaartinformatie; time-out of expliciet passen voor online spelers.
  - Acceptatie: identieke toegestane/verboden reacties in beide modi; ketens van 0-4 Brul Terug-kaarten correct; uitgeschakelde spelers kunnen niet reageren; geen dubbele actie-uitvoering na polling/reconnect.
  - Tests: pure pariteitstabel per kaarttype, multiplayerketens, reconnect tijdens reactievenster, browserflow met twee spelers.

- [ ] **EK-02 Raptoraanvallen als volledige beurten modelleren en uitleggen**
  - Officiële referentie: Aanval beëindigt de beurt zonder trekken; slachtoffer voert 2 volledige beurten uit; tegenaanval schuift de volledige last door en telt 2 op.
  - Gewenste Dinos-regel: behoud dit model voor Raptor Aanval. Gerichte Raptorjacht gebruikt hetzelfde lastmodel maar kiest een doelwit; bij doorschuiven wordt opnieuw geldig doelwit gekozen.
  - Vervang misleidende korte tekst `moet 2 kaarten trekken` door `moet 2 beurten uitvoeren`. Maak expliciet dat binnen iedere beurt actiekaarten gespeeld mogen worden en normaal getrokken wordt om die beurt af te sluiten.
  - UI: permanente badge bij actuele speler, bijvoorbeeld `3 beurten resterend`; log benoemt toevoegen, doorschuiven en verbruik van lasten.
  - Acceptatie: lasten 2, 4 en 6; eliminatie midden in last; doelwit valt uit; laatste speler wint; singleplayer/multiplayer gelijk.
  - Tests: regels + serverengine + DOM/Playwright voor badge en stapeling.

- [ ] **EK-03 Dino Sprint als precies één beurt laten afhandelen**
  - Gewenste tekst: `Beëindig 1 beurt zonder een kaart te trekken. Tijdens een aanval vervalt hiermee 1 openstaande beurt.`
  - Afhankelijk van EK-02; implementeer pas nadat het aanvalslastmodel expliciet is vastgelegd.
  - Acceptatie: normale beurt eindigt; bij lasten 2/4/6 daalt de last exact met 1; twee Sprint-kaarten handelen twee lasten af; beurt gaat pas naar volgende speler als geen last resteert.
  - Tests: dezelfde scenario's in pure regels, singleplayer en multiplayer.

- [ ] **EK-04 Steelmechanieken onderscheidend documenteren en gelijktrekken**
  - Gewenste identiteit: Mini-Raptorpaar steelt willekeurig van gekozen doelwit; Fossielgraaier laat een gesloten kaartpositie kiezen zonder kaartinformatie te lekken.
  - Inspecteer eerst of huidige UI/server werkelijk dezelfde kansverdeling en geheimhouding gebruiken. Corrigeer alleen pariteitsfouten; verander nog niet naar de officiële `slachtoffer kiest kaart`-Favor-regel.
  - Acceptatie: doelwitkeuze geldig, kaart blijft verborgen tot overdracht, lege handen uitgesloten, polling/reconnect herhaalt de diefstal niet.

## Fase B - onboarding en visuele regels

- [ ] **EK-05 Visuele snelstart bovenaan `Hoe speel je?`**
  - Bouw een compacte drie-stappenlus: `Speel 0 of meer kaarten` -> `Trek 1 kaart om je beurt te beëindigen` -> `Meteoriet: Schuilgrot of uitschakeling`.
  - Voeg voorbereiding toe: 1 Schuilgrot + 7 kaarten per speler; meteorieten en extra grotten daarna toevoegen; stapel schudden.
  - Gebruik bestaande gamestijl, illustraties en responsive patronen; geen kopie van artwork/layout uit de officiële handleiding.
  - Acceptatie: begrijpelijk zonder scrollen op desktop en binnen compacte mobiele sectie; toetsenbord/focus/reduced-motion correct.
  - Tests: Playwright desktop, Pixel 5, 320x568 en mobiel landschap.

- [ ] **EK-06 Interactieve voorbeeldbeurt uitbreiden**
  - Scenario: Triceratops Blik ziet een Meteorietinslag bovenop; Raptor Aanval wordt geprobeerd; Brul Terug reageert; Vulkaan Shuffle wijzigt de situatie; speler trekt veilig.
  - Tutorial gebruikt geïsoleerde demonstratiestate en mag lopend spel, room of sessie niet wijzigen.
  - Afhankelijk van definitieve EK-01/EK-02-regels.
  - Acceptatie: terug/vooruit/herstart; heldere private versus publieke informatie; mobiel leesbaar; tutorial kan veilig gesloten worden.

- [ ] **EK-07 Permanente beurt- en reactiestatus rond trekstapel**
  - Normaal: `Speel kaarten of trek om je beurt te beëindigen`.
  - Aanval: toon resterende volledige beurten.
  - Reactie: toon wie handelt en of de lokale speler Brul Terug kan spelen of passen.
  - Wachten: toon actor en geen misleidende actieve bediening.
  - Acceptatie: status volgt state na actie, trek, Sprint, aanval, Brul Terug, reconnect en eliminatie; screenreader-live-regio zonder dubbele aankondigingen.

- [ ] **EK-08 Kaartreferentie uitbreiden met machine-afgeleide metadata**
  - Voeg per kaart toe: timing, doelwit, `beurt gaat door/eindigt`, reacteerbaar, informatie openbaar/geheim en aantal in gekozen deckmodus.
  - Sla metadata centraal op in `src/cards.js` of een gedeelde regelmodule; vermijd losse duplicaten in README/UI.
  - Laat catalogus, kaartdetail en eventuele tutorial dezelfde metadata gebruiken.
  - Acceptatie: alle 17 kaarttypes compleet; compacte kaartfronten blijven kort; details toegankelijk op mobiel en met toetsenbord.

- [ ] **EK-09 Consistente regeliconen ontwerpen**
  - Pas na EK-08. Ontwerp eigen Dinos-iconen voor: beurt gaat door, beurt eindigt, trekken vereist, reactie mogelijk, geheim en openbaar.
  - Gebruik repo-native SVG/CSS en de bestaande visuele taal; geen emoji als definitieve iconen en geen officiële Exploding Kittens-symbolen kopiëren.
  - Toon altijd tekst/tooltip naast of achter iconen; betekenis mag niet uitsluitend van kleur afhangen.
  - Acceptatie: handkaart, grote reveal, kaartcatalogus en high-contrast/reduced-motion layouts gecontroleerd.

## Fase C - optionele balansuitbreidingen

- [ ] **EK-10 Meteoriet-risicostanden ontwerpen**
  - Voorstel: `Rustig = spelers - 1`, `Standaard = spelers`, `Vulkanisch = spelers + 1`.
  - Aanbevolen compatibiliteit: huidige default blijft Vulkanisch totdat playtests een andere default rechtvaardigen.
  - Eerst gebruiker laten kiezen: namen, default, beschikbaarheid in singleplayer/multiplayer en of hostinstelling zichtbaar is in lobby.
  - Acceptatie na akkoord: server is autoritatief; gekozen modus in roomstate/log/uitleg; nooit meer meteorieten gebruiken dan de 11 in het Party Pack; deterministische setup-tests voor 2-5 spelers.

- [ ] **EK-11 Driedubbele soortcombinaties ontwerpen**
  - Niet implementeren zonder aparte balansbeslissing per soort. Basisvoorstel: versterkte versie van de bestaande paarbeloning, geen generieke diefstal voor alle soorten.
  - Wilde Dino: eerst beslissen of maximaal één joker een drietal mag aanvullen.
  - Vereist UI voor selectie van 3 kaarten, servervalidatie, NPC-strategie en tests tegen dubbele consumptie.

- [ ] **EK-12 Vijf verschillende soorten-combinatie ontwerpen**
  - Voorstel uit officiële inspiratie: neem één niet-Meteorietinslag uit de aflegstapel. Alleen soortnamen tellen; iedere naam moet verschillend zijn.
  - Eerst beslissen: mag Schuilgrot worden teruggenomen, mag Wilde Dino meetellen, en wordt het gekozen resultaat openbaar.
  - Niet tegelijk met EK-11 implementeren; eerst afzonderlijk balanceren en playtesten.

## Release gate voor deze vervolgbacklog

- Alle gekozen IDs hebben één onderwerp per commit en bijgewerkte regressietests.
- `npm test` en `npm run test:browser` zijn groen; bewuste skips zijn gedocumenteerd.
- Voor multiplayerwijzigingen: lokale tweebrowsertest via `http://localhost:8000` plus gerichte servertests.
- Voor visuele wijzigingen: desktop, Pixel 5, 320x568 en mobiel landschap visueel gecontroleerd.
- `npm run test:public` pas na merge/deployment uitvoeren omdat dit echte GitHub Pages en Render gebruikt.
- README, `CARD_RULES_AUDIT.md`, `CARD_CHECKLIST.md` en deze backlog beschrijven uiteindelijk exact het geïmplementeerde gedrag.
