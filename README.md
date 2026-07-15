# Exploding Dinos

Een eerste speelbare browser-MVP voor een Nederlandse dino-kaartgame geinspireerd door snelle push-your-luck kaartspellen. De kaartbasis volgt nu de Party Pack-structuur: 122 kaarten totaal, met een compacte kaartselectie voor 2-3 spelers.

Speel online: https://timzegveld.github.io/exploding-dinos/

## Starten

Open `index.html` in je browser. Er is geen build-step nodig.

Bij een eerste potje is 1 pc-tegenstander de rustigste keuze om de kaarten en beurtflow te leren. Meer spelers kan direct, maar maakt het spel chaotischer.

Voor lokaal testen op een telefoon kun je de map via een kleine webserver delen op je eigen wifi-netwerk:

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

Open daarna op je telefoon `http://<ip-adres-van-je-pc>:8000/`.

## Multiplayer-lobby

Singleplayer blijft de standaard startflow. Via **Join multiplayer-room** opent een losse online lobby. Deze modus is nog in ontwikkeling en kan daarom veranderen of tijdelijk niet beschikbaar zijn. Je kunt een room maken, de uitnodigingslink delen en met maximaal vijf browsers of tabs deelnemen. De roomcode komt readonly uit de uitnodigingslink; codes hoeven niet handmatig te worden overgetypt. Iedere nieuwe speler krijgt een willekeurige dinonaam en kan die vóór het maken of joinen met de dobbelknop veranderen. In een room staat de naam vast tot de speler de room verlaat. De lobby gebruikt eenvoudige polling en bewaart de spelerssessie per tab, zodat verversen opnieuw verbindt zonder dat twee tabs dezelfde speler worden.

Start de roomserver lokaal in een tweede terminal:

```powershell
npm run start:server
```

Open de website via `http://localhost:8000`; de lokale configuratie verbindt dan automatisch met `http://localhost:3000`. Open een tweede browser of privévenster om de uitnodigingslink te testen.

De multiplayer-API draait op Render via `render.yaml`: `https://exploding-dinos-api.onrender.com`. `src/multiplayer-config.js` gebruikt deze URL automatisch buiten localhost. De Render-service beperkt browsertoegang via `ALLOWED_ORIGIN` tot `https://timzegveld.github.io`. Op het gratis Render-plan kan de eerste aanvraag na inactiviteit langer duren doordat de service opnieuw moet opstarten. Tijdens het maken of joinen van een room toont de lobby daarom een laadindicator en uitleg, blokkeert hij dubbele aanvragen en geeft hij na 90 seconden een duidelijke melding om opnieuw te proberen.

De multiplayerlaag levert roombeheer, joinen, polling, uitnodigingslinks, reconnect en een servergestuurd volledig kaartspel. De host kan met 2-5 mensen starten; iedere speler ontvangt alleen de eigen geheime hand. Alle actiekaarten, aanvallen, `Brul Terug`-ketens, steelkaarten en soortparen zijn online aangesloten. `Wilde Dino` werkt servergestuurd als joker voor ieder soortpaar. Meteorietinslag, geheime terugplaatsing, Schuilgrot, verplichte trekkingen, eliminatie en winst worden eveneens door de server verwerkt. Singleplayer blijft daarnaast volledig speelbaar.

## Testen

De eerste geautomatiseerde testlaag staat in `tests/` en gebruikt Node's ingebouwde test-runner.

```powershell
npm test
```

De snelle tests dekken deck/card helpers, gerichte spelregels en een fake-DOM smoke-test. Daarnaast draaien echte browserchecks de kernflows in Chromium op desktop, een Pixel 5, een klein scherm van 320 x 568 en mobiel landschap:

```powershell
npm run test:browser
```

Installeer bij een nieuwe checkout eerst de ontwikkelafhankelijkheden en Chromium met `npm install` en `npx playwright install chromium`. Met `npm run test:all` draaien beide testlagen achter elkaar.

## Online zetten

De game is geschikt voor statische hosting, omdat alles uit HTML, CSS, JavaScript en assets bestaat. De voorkeursroute is GitHub Pages.

Gebruik deze instellingen in GitHub:

- `Settings > Pages`
- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/root`

Voor gratis GitHub Pages met GitHub Free moet de repository publiek zijn. Zie `CARD_CHECKLIST.md` voor de release-checklist.

## Code-indeling

- `src/cards.js`: kaartcatalogus, Party Pack-distributie en deckhelpers.
- `src/players.js`: pc-persona's, portretprompts, spelerkleuren en speler-aanmaak.
- `src/runtime.js`: injecteerbare willekeur en planning voor deterministische tests.
- `src/state.js`: initiële spelstate, interactieregister en state-invarianten.
- `src/rules.js`: pure, DOM-onafhankelijke spelregels.
- `src/multiplayer.js`: losse room-lobby, polling en lokale reconnectsessie.
- `server/`: stateless HTTP-laag en tijdelijk roombeheer voor de multiplayer-lobby.
- `game.js`: beurtworkflows, pc-keuzes, renderlogica en event handlers; nieuwe state- en regellogica hoort waar mogelijk in `src/`.
- `styles.css`: tafel, kaartfronts, responsive bediening, modals, persona- en eindschermstyling.
- `tests/`: Node-tests, fake-DOM smoke-tests en Playwright-browserflows.

De app gebruikt gewone browserscripts zodat `index.html` direct geopend kan blijven worden. Interacties hebben voorlopig nog compatibele `pending*`-velden, maar hun definitie, opschoning en invariantcontrole zijn gecentraliseerd in `src/state.js`. Er mag maximaal één interactieworkflow tegelijk actief zijn.

Gebruik voor nieuwe logica de injecteerbare functies uit `src/runtime.js` in plaats van rechtstreeks `Math.random()` of `window.setTimeout()` aan te roepen. Zo blijven scenario's reproduceerbaar in tests.

Kaartillustraties ondersteunen per kaarttype optionele varianten via `design.images`; losse kaartkopieën krijgen bij het maken een vaste illustratievariant zodat meerdere exemplaren herkenbaar blijven zonder spelregels te veranderen. De veelvoorkomende soortkaarten gebruiken deze variantrotatie nu actief.

## Project-skill

Deze repo bevat een projectlokale Codex-skill onder `.codex/skills/exploding-dinos-card-designer/` voor het uitwerken van nieuwe kaartfuncties en kaartdesigns.

## NPC-profielen

Elke pc-tegenspeler heeft een eigen stijlprofiel. De profielen gebruiken geen LLM: het zijn vaste kansprofielen en kaartvoorkeuren die de bestaande pc-keuzes subtiel sturen.

| NPC | Profielschets | Speelstijl |
|---|---|---|
| Rex de Archeoloog | Nieuwsgierige T. rex die graag graaft, zoekt en waarde uit de aflegstapel haalt. | Onderzoekend: kiest relatief vaak `Fossielgraaier`, `Diep Graven` en kijkkaarten; valt minder blind aan. |
| Nova de Vulkaanwachter | Zelfverzekerde vulkaanwachter die chaos in de stapel niet schuwt. | Vulkanisch: speelt sneller `Vulkaan Shuffle`, neemt iets meer risico en houdt van tempo. |
| Kiki de Bottenfluisteraar | Slimme, sluipende raptor die andermans hand goed in de gaten houdt. | Sluw: gebruikt vaker steelkaarten en `Mini-Raptor`, en kiest eerder doelwitten met veel kaarten. |
| Bram Brulbaard | Luide Carnotaurus die druk zet en graag het initiatief pakt. | Agressief: speelt vaker `Raptor Aanval`, `Gerichte Raptorjacht` en `Brul Terug`; kiest jou vaker als doelwit. |
| Luna de Tijdlijnkundige | Voorzichtige triceratops die liever eerst de toekomst leest. | Zorgvuldig: gebruikt vaker `Tijdlijn Kneden`, `Triceratops Blik`, `Ptero Pret` en andere deckcontrole. |
| Otto de Kaartkapitein | Luchtige kaartkapitein die graag de boven- en onderkant van de stapel bestuurt. | Kapitein: heeft extra voorkeur voor `Ptero Pret`, `Dino Sprint` en gecontroleerd herschikken. |
| Mira de Mosridder | Beschermende Ankylosaurus die liever overleeft dan overhaast aanvalt. | Defensief: bewaart en speelt vaker bescherming, `Brul Terug`, `Dino Sprint` en veilige kijkacties. |
| Puck de Platenmaker | Creatieve Stegosaurus die graag rare combinaties probeert. | Chaotisch: speelt vaker paren, `Vulkaan Shuffle`, `Ptero Pret` en onverwachte speelbare kaarten. |
| Tara de Trucjager | Sluwe Dilophosaurus die graag timing en blokkades gebruikt. | Tricky: combineert stelen, `Brul Terug`, gerichte aanvallen en doelwitkeuze op handgrootte. |

## Regels in deze iteratie

- Jij speelt tegen 1 tot 4 gekozen pc-tegenspelers uit een roster van 9 persona's met eigen gender, rol, dinoras, kleuraccent, portret-slot en portretprompt.
- Iedere pc-tegenspeler heeft een eigen speelstijl die kaartkeuze, doelwitkeuze, blokkeren, risico nemen en deckcontrole subtiel beinvloedt.
- De startselectie adviseert beginners om met 1 tegenstander te beginnen; extra tegenstanders zorgen voor meer chaos.
- Via `Hoe speel je?` opent een korte interactieve oefenronde over actie- en soortkaarten, een beurt beëindigen door te trekken, ontploffen zonder Schuilgrot, automatisch ontmantelen en het geheim terugplaatsen van de Meteorietinslag. De oefening verandert een lopend spel niet.
- Trek je een `Meteorietinslag` zonder `Schuilgrot`, dan verlies je.
- Een `Schuilgrot` wordt automatisch gebruikt en stopt de meteoriet terug in de trekstapel.
- Je kunt je handkaarten altijd aanklikken om ze te bekijken. In het kaartdetail kun je terug, of spelen als de kaart op dat moment speelbaar is.
- Je hand wordt op kaarttype gegroepeerd; kaarten binnen hetzelfde type krijgen bij binnenkomst een willekeurige plek.
- Op telefoon staat de primaire trekactie bovenaan het speelveld en blijft deze tijdens het scrollen bereikbaar.
- Op telefoon staan tegenstanders in een compacte horizontale rij; je hand is een horizontale kaartenrail die open- en dichtgeklapt kan worden.
- Speelbare handkaarten krijgen een duidelijke groene markering en niet-speelbare kaarten worden gedimd. Tikken opent altijd eerst het kaartdetail.
- Op telefoon zitten Kaarten, Nieuw spel en Logboek achter een sluitbaar menu. Dialogen houden de focus vast, blokkeren achtergrondscroll en kunnen waar passend met Escape worden gesloten.
- De interface houdt rekening met schermuitsparingen en de home-indicator via CSS safe-area-insets.
- Actiekaarten kun je voor het trekken spelen.
- Bij 2-3 spelers gebruikt de game een compacte kaartselectie. Vanaf 4 spelers gebruikt de game de standaard Party Pack-selectie.
- De trekstapel start met één Meteorietinslag meer dan het aantal spelers (`aantal spelers + 1`).
- Na afloop maakt de host voor een volgend online potje altijd een nieuwe room met een nieuwe uitnodigingscode.
- Bij ieder nieuw singleplayer- en multiplayerpotje wordt de startspeler willekeurig gekozen.
- Na een online potje ziet iedere speler een duidelijke overwinnings- of verlieskaart; de host kan daar direct een nieuwe room maken.
- Iedere speler heeft een eigen kleuraccent. De gloeiende rand laat zien wie aan de beurt is, een kaart trekt of een kaart speelt.
- Trek een kaart om je beurt te eindigen. De kaart verschijnt eerst groot in beeld; klik daarna nog een keer om hem aan je hand toe te voegen.
- Gespeelde kaarten verschijnen eerst groot in beeld met het portret van de speler die de kaart speelt. Het effect gaat pas door nadat je klikt.
- Gestolen kaarten verschijnen groot in beeld als jij erbij betrokken bent. Diefstal tussen twee pc's blijft anoniem.
- Als iemand jou aanvalt, zie je je hand als reactie-keuze. `Brul Terug` blokkeert de aanval; een eigen raptoraanval schuift de aanval door en stapelt de beurten. Bij `Gerichte Raptorjacht` als reactie kies je zelf het nieuwe doelwit.
- Een aanval sluit de beurt van de aanvaller af en wordt meteen uitgevochten: het doelwit moet het openstaande aantal kaarten trekken, met ruimte voor acties tussen meerdere trekken. Na de laatste verplichte trek gaat het spel verder met de volgende speler.
- Als het spel is gewonnen of verloren verschijnt een eindscherm met een nieuw-spelknop; de gekozen rosterselectie blijft beschikbaar voor het volgende potje.
- Trekt iemand een `Meteorietinslag`, dan schudt de kaart zichtbaar. Met `Schuilgrot` kiest de speler geheim waar de meteoriet teruggaat in de stapel; jij kiest daarbij een genummerde positie.

## Kaarten

Statuslegenda:

- `klaar`: eigen gameplay en eigen kaartfront zijn klaar en getweakt.
- `spel klaar`: gameplay is klaar, maar kaartfront/artwork mist nog.
- `basis`: speelbaar of bruikbaar, maar nog niet uniek genoeg uitgewerkt.

| Type | Kaart | Aantal | Regel in deze iteratie | Status |
|---|---:|---:|---|---|
| `meteor` | Meteorietinslag | 11 | Trek je deze zonder `Schuilgrot`, dan ben je uitgeschakeld. De getrokken meteoriet is voor iedereen zichtbaar. Per potje worden `aantal spelers + 1` exemplaren gebruikt. | klaar |
| `shelter` | Schuilgrot | 10 | Wordt automatisch en voor iedereen zichtbaar gebruikt tegen `Meteorietinslag`; daarna gaat de meteoriet op een geheime positie terug in de stapel. | klaar |
| `raptor` | Raptor Aanval | 5 | De volgende speler moet meteen 2 kaarten trekken; als reactie schuift hij de volledige aanvalslast door. | klaar |
| `targetedRaptor` | Gerichte Raptorjacht | 5 | Kies bewust een doelwit dat meteen 2 kaarten moet trekken; als reactie mag je opnieuw een doelwit kiezen. | klaar |
| `sprint` | Dino Sprint | 10 | Sla je beurt over; bij extra beurten raak je 1 extra pending beurt kwijt. | klaar |
| `trike` | Triceratops Blik | 6 | Bekijk de bovenste 3 kaarten. | klaar |
| `oracle` | Tijdlijn Kneden | 6 | Bekijk de bovenste 3 kaarten en leg ze terug in jouw volgorde. | klaar |
| `volcano` | Vulkaan Shuffle | 6 | Schud de trekstapel zichtbaar en bekijk daarna de nieuwe bovenste kaart. | klaar |
| `dig` | Diep Graven | 7 | Bekijk de onderste kaart; neem hem, of laat hem liggen en trek blind van boven. | klaar |
| `fossil` | Fossielgraaier | 6 | Kies een gesloten kaart van een tegenstander en steel die. | klaar |
| `nope` | Brul Terug | 9 | Reageer op een directe actie tegen jou of op een Brul Terug-keten en blokkeer die. | klaar |
| `feral` | Wilde Dino | 6 | Joker voor een soortpaar; activeert de volledige beloning van de andere soortkaart in het paar. Heeft meerdere illustratievarianten. | klaar |
| `miniRaptor` | Mini-Raptor | 7 | Soortkaart; speel een paar om een doelwit te kiezen en snel 1 willekeurige kaart te stelen. Heeft meerdere illustratievarianten. | klaar |
| `stegoSnack` | Stego Snack | 7 | Soortkaart; speel een paar om 1 oudere niet-meteor kaart uit de aflegstapel terug te nemen. Heeft meerdere illustratievarianten. | klaar |
| `brontoBuik` | Bronto Buik | 7 | Soortkaart; speel een paar om de bovenste kaart te bekijken; laat hem liggen of schuif hem onderop. Heeft meerdere illustratievarianten. | klaar |
| `triceraTuk` | Tricera-Tuk | 7 | Soortkaart; speel een paar om 1 trekbeurt over te slaan zonder te trekken. Heeft meerdere illustratievarianten. | klaar |
| `pteroPret` | Ptero Pret | 7 | Soortkaart; speel een paar om de bovenste 2 kaarten te bekijken; leg 1 bovenop en 1 onderop. Daarna eindigt je beurt. Heeft meerdere illustratievarianten. | klaar |

## Mogelijke volgende iteraties

- Verdere testdekking voor zeldzame kaartreacties en complete potjes.
- Betere kaartbalans na meerdere proefpotjes.
- Moeilijkheidsgraden voor de pc.
- Extra kaartvarianten, meer kaarttypes of set-combo's.
