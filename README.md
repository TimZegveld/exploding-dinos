# Exploding Dinos

Een eerste speelbare browser-MVP voor een Nederlandse dino-kaartgame geinspireerd door snelle push-your-luck kaartspellen. De kaartbasis volgt nu de Party Pack-structuur: 120 kaarten totaal, met een compacte dino-pootafdruk set voor 2-3 spelers.

Speel online: https://timzegveld.github.io/exploding-dinos/

## Starten

Open `index.html` in je browser. Er is geen build-step nodig.

Voor lokaal testen op een telefoon kun je de map via een kleine webserver delen op je eigen wifi-netwerk:

```powershell
python -m http.server 8000 --bind 0.0.0.0
```

Open daarna op je telefoon `http://<ip-adres-van-je-pc>:8000/`.

## Testen

De eerste geautomatiseerde testlaag staat in `tests/` en gebruikt Node's ingebouwde test-runner.

```powershell
npm test
```

De huidige tests dekken deck/card helpers en een kleine fake-DOM smoke-test voor spelstart, kaart trekken en de catalogus. Voor publicatie moeten hier nog gerichte regeltests en echte browserchecks bij komen.

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
- `game.js`: huidige spelstate, beurtregels, pc-keuzes, renderlogica en event handlers.
- `styles.css`: tafel, kaartfronts, modals, persona- en eindschermstyling.
- `tests/`: Node-tests en fake-DOM smoke-tests.

De app gebruikt gewone browserscripts zodat `index.html` direct geopend kan blijven worden. Een volgende onderhoudsstap is om renderlogica en spelregels verder te scheiden zodra daar gerichte tests voor staan.

Kaartillustraties ondersteunen per kaarttype optionele varianten via `design.images`; losse kaartkopieën krijgen bij het maken een vaste illustratievariant zodat meerdere exemplaren herkenbaar blijven zonder spelregels te veranderen.

## Project-skill

Deze repo bevat een projectlokale Codex-skill onder `.codex/skills/exploding-dinos-card-designer/` voor het uitwerken van nieuwe kaartfuncties en kaartdesigns.

## Regels in deze iteratie

- Jij speelt tegen 1 tot 4 gekozen pc-tegenspelers uit een roster van 9 persona's met eigen gender, rol, dinoras, kleuraccent, portret-slot en portretprompt.
- Trek je een `Meteorietinslag` zonder `Schuilgrot`, dan verlies je.
- Een `Schuilgrot` wordt automatisch gebruikt en stopt de meteoriet terug in de trekstapel.
- Je kunt je handkaarten altijd aanklikken om ze te bekijken. In het kaartdetail kun je terug, of spelen als de kaart op dat moment speelbaar is.
- Actiekaarten kun je voor het trekken spelen.
- Bij 2-3 spelers gebruikt de game alleen de dino-pootafdruk kaarten. Vanaf 4 spelers gebruikt de game de standaard Party Pack-selectie.
- Iedere speler heeft een eigen kleuraccent. De gloeiende rand laat zien wie aan de beurt is, een kaart trekt of een kaart speelt.
- Trek een kaart om je beurt te eindigen. De kaart verschijnt eerst groot in beeld; klik daarna nog een keer om hem aan je hand toe te voegen.
- Gespeelde kaarten verschijnen eerst groot in beeld met het portret van de speler die de kaart speelt. Het effect gaat pas door nadat je klikt.
- Gestolen kaarten verschijnen groot in beeld als jij erbij betrokken bent. Diefstal tussen twee pc's blijft anoniem.
- Als iemand jou aanvalt, zie je je hand als reactie-keuze. `Brul Terug` blokkeert de aanval; een eigen raptoraanval schuift de aanval door en stapelt de beurten. Bij `Gerichte Raptorjacht` als reactie kies je zelf het nieuwe doelwit.
- Een aanval wordt meteen uitgevochten: het doelwit moet het openstaande aantal kaarten trekken, met ruimte voor acties tussen meerdere trekken. Na de laatste verplichte trek is die beurt voorbij en gaat het spel terug naar de speler die de aanval inzette.
- Als het spel is gewonnen of verloren verschijnt een eindscherm met een nieuw-spelknop; de gekozen rosterselectie blijft beschikbaar voor het volgende potje.
- Trekt iemand een `Meteorietinslag`, dan schudt de kaart zichtbaar. Met `Schuilgrot` kiest de speler geheim waar de meteoriet teruggaat in de stapel; jij kiest daarbij een genummerde positie.

## Kaarten

Statuslegenda:

- `klaar`: eigen gameplay en eigen kaartfront zijn klaar en getweakt.
- `spel klaar`: gameplay is klaar, maar kaartfront/artwork mist nog.
- `basis`: speelbaar of bruikbaar, maar nog niet uniek genoeg uitgewerkt.

| Type | Kaart | Aantal | Regel in deze iteratie | Status |
|---|---:|---:|---|---|
| `meteor` | Meteorietinslag | 9 | Trek je deze zonder `Schuilgrot`, dan ben je uitgeschakeld. | klaar |
| `shelter` | Schuilgrot | 10 | Wordt automatisch gebruikt tegen `Meteorietinslag`; daarna gaat de meteoriet geheim terug in de stapel. | klaar |
| `raptor` | Raptor Aanval | 5 | Het doelwit moet meteen 2 kaarten trekken; als reactie schuift hij de volledige aanvalslast door. | klaar |
| `targetedRaptor` | Gerichte Raptorjacht | 5 | Kies bewust een doelwit dat meteen 2 kaarten moet trekken; als reactie mag je opnieuw een doelwit kiezen. | klaar |
| `sprint` | Dino Sprint | 10 | Sla je beurt over; bij extra beurten raak je 1 extra pending beurt kwijt. | klaar |
| `trike` | Triceratops Blik | 6 | Bekijk de bovenste 3 kaarten; Meteorietinslag en Schuilgrot worden expliciet gemeld. | klaar |
| `oracle` | Tijdlijn Kneden | 6 | Bekijk de bovenste 3 kaarten en leg ze terug in jouw volgorde. | klaar |
| `volcano` | Vulkaan Shuffle | 6 | Schud de trekstapel zichtbaar en bekijk daarna de nieuwe bovenste kaart. | klaar |
| `dig` | Diep Graven | 7 | Bekijk de onderste kaart; neem hem, of laat hem liggen en trek blind van boven. | klaar |
| `fossil` | Fossielgraaier | 6 | Kies een gesloten kaart van een tegenstander en steel die. | klaar |
| `nope` | Brul Terug | 9 | Reageer op een actiekaart van de ander en blokkeer die. | klaar |
| `feral` | Wilde Dino | 6 | Joker voor een soortpaar; activeert de volledige beloning van de andere soortkaart in het paar. | klaar |
| `miniRaptor` | Mini-Raptor | 7 | Soortkaart; speel een paar om een doelwit te kiezen en snel 1 willekeurige kaart te stelen. Heeft als eerste soortkaart een extra illustratievariant. | klaar |
| `stegoSnack` | Stego Snack | 7 | Soortkaart; speel een paar om 1 oudere niet-meteor kaart uit de aflegstapel terug te nemen. | klaar |
| `brontoBuik` | Bronto Buik | 7 | Soortkaart; speel een paar om de bovenste kaart te bekijken; laat hem liggen of schuif hem onderop. | klaar |
| `triceraTuk` | Tricera-Tuk | 7 | Soortkaart; speel een paar om 1 open beurt weg te dutten zonder te trekken. | klaar |
| `pteroPret` | Ptero Pret | 7 | Soortkaart; speel een paar om de bovenste 2 kaarten te bekijken; leg 1 bovenop en 1 onderop. | klaar |

## Mogelijke volgende iteraties

- Verdere testdekking voor spelregels en browserflows.
- GitHub Pages-publicatie na test- en mobiele releasecheck.
- Betere kaartbalans na meerdere proefpotjes.
- Moeilijkheidsgraden voor de pc.
- Extra kaartvarianten, meer kaarttypes of set-combo's.
