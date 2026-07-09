# Exploding Dinos kaarttype-speelwijze checklist

Doel: elk kaarttype moet een eigen speelgevoel krijgen. Dit document is bedoeld als losse project-checklist, zodat we per sessie 1 of meer kaarttypes kunnen oppakken zonder de draad kwijt te raken.

## Huidige kaarttypes

| Type | Naam | Huidige rol | Huidige status |
|---|---|---|---|
| `meteor` | Meteorietinslag | Gevaar bij trekken | Heeft eigen flow met verlies of Schuilgrot. |
| `shelter` | Schuilgrot | Automatische redding | Heeft eigen flow met terugplaatsen van meteoriet. |
| `raptor` | Raptor Aanval | Extra beurt voor tegenstander | Werkt, maar deelt effect met `targetedRaptor`. |
| `targetedRaptor` | Gerichte Raptorjacht | Kies speler voor extra beurt | Werkt technisch, maar is in 2 spelers bijna hetzelfde als `raptor`. |
| `sprint` | Dino Sprint | Beurt overslaan | Werkt als simpele skip. |
| `trike` | Triceratops Blik | Bovenste kaarten bekijken | Werkt als informatiekaart. |
| `oracle` | Tijdlijn Kneden | Bovenste kaarten manipuleren | Werkt automatisch; speler kiest nog niet zelf. |
| `volcano` | Vulkaan Shuffle | Stapel schudden | Werkt als simpele reset. |
| `dig` | Diep Graven | Onderste kaart trekken | Werkt met eigen trekbron. |
| `fossil` | Fossielgraaier | Kaart stelen | Werkt willekeurig. |
| `nope` | Brul Terug | Actie blokkeren | Werkt als vooraf gespeelde schildkaart. |
| `feral` | Wilde Dino | Joker voor soortkaarten | Werkt als paar-joker. |
| `miniRaptor` | Mini-Raptor | Soortkaart | Deelt nu hetzelfde paar-effect met alle soortkaarten. |
| `stegoSnack` | Stego Snack | Soortkaart | Deelt nu hetzelfde paar-effect met alle soortkaarten. |
| `brontoBuik` | Bronto Buik | Soortkaart | Deelt nu hetzelfde paar-effect met alle soortkaarten. |
| `triceraTuk` | Tricera-Tuk | Soortkaart | Deelt nu hetzelfde paar-effect met alle soortkaarten. |
| `pteroPret` | Ptero Pret | Soortkaart | Deelt nu hetzelfde paar-effect met alle soortkaarten. |

## Uitwerkstappen

- [ ] Stap 1: Kies de ontwerpregel voor kaarttypes.
  - Beslis of elk individueel type echt uniek moet zijn, of dat sommige types binnen dezelfde familie mogen lijken maar een andere nuance krijgen.
  - Voorstel: elke actiekaart krijgt een uniek effect; elke soortkaart krijgt een unieke paar-beloning.

- [ ] Stap 2: Maak de effectmatrix definitief.
  - Vul per kaarttype in: wanneer speelbaar, doelwit, keuze van speler, effect, eindigt de beurt wel/niet, kan `Brul Terug` blokkeren.
  - Output: een tabel in dit document of in `README.md`.

- [ ] Stap 3: Splits `raptor` en `targetedRaptor`.
  - `Raptor Aanval`: vaste aanval op de volgende speler, direct 2 beurten.
  - `Gerichte Raptorjacht`: speler kiest doelwit zodra multiplayer of extra spelers bestaan; voor 2 spelers alvast tonen als aparte keuze-flow.
  - Check: beide voelen anders in UI en logtekst.

- [x] Stap 4: Maak `oracle` interactief.
  - Laat de speler de bovenste 3 kaarten zelf ordenen.
  - PC gebruikt een simpele strategie, bijvoorbeeld meteorieten verder weg leggen.
  - Check: `Tijdlijn Kneden` voelt anders dan alleen kijken met `Triceratops Blik`.

- [ ] Stap 5: Geef `volcano` een spannender shuffle-flow.
  - Voeg een zichtbaar shuffle-moment toe.
  - Overweeg een klein gevolg, zoals daarna 1 kaart mogen bekijken of juist verplicht trekken.
  - Check: kaart voelt niet als alleen een technische reset.

- [ ] Stap 6: Maak `fossil` minder willekeurig of duidelijker bewust.
  - Optie A: kies een kaartpositie uit de hand van de ander.
  - Optie B: steel willekeurig, maar toon eerst hoeveel kaarten elke speler heeft per familie.
  - Check: speler heeft een herkenbare beslissing of duidelijke spanning.

- [ ] Stap 7: Herwerk `nope` naar een echte reactie.
  - Nu moet `Brul Terug` vooraf worden gespeeld; onderzoek of hij tijdens een actie als reactie kan verschijnen.
  - Bouw een interrupt-flow: tegenstander speelt actie, speler mag `Brul Terug` inzetten.
  - Check: kaart voelt als timing/reactie, niet als schild dat je vooraf neerlegt.

- [ ] Stap 8: Geef `sprint` een eigen tactische keuze.
  - Basis blijft: beurt eindigen zonder trekken.
  - Overweeg extra nuance: ook 1 pending extra beurt verwijderen, of alleen bruikbaar als je moet trekken.
  - Check: kaart is duidelijk defensief en niet hetzelfde als een aanvalskaart.

- [ ] Stap 9: Geef `dig` een risico-beloning.
  - Basis blijft: onderste kaart trekken.
  - Overweeg dat de onderste kaart open of gesloten wordt onthuld, of dat `dig` niet alle beurt-effecten hetzelfde consumeert.
  - Check: onderste kaart trekken voelt als een andere gok dan normale trek.

- [ ] Stap 10: Ontwerp unieke soortkaart-paarbeloningen.
  - `miniRaptor`: snel stelen, bijvoorbeeld willekeurig 1 kaart.
  - `stegoSnack`: neem 1 kaart terug uit aflegstapel of bescherm tegen stelen.
  - `brontoBuik`: trek 1 extra kaart en houd hem veilig als hij geen meteoriet is.
  - `triceraTuk`: laat tegenstander volgende beurt minder keuze hebben of verplicht trekken.
  - `pteroPret`: bekijk/verwissel bovenste en onderste kaart.
  - Check: paren zijn niet langer allemaal "steel willekeurig".

- [ ] Stap 11: Bepaal rol van `feral`.
  - Blijft joker voor elk paar.
  - Leg vast of `feral + soortkaart` de beloning van die soort activeert, of een zwakkere joker-beloning.
  - Check: joker is nuttig, maar maakt echte paren niet overbodig.

- [ ] Stap 12: Werk `cardCatalog` bij met speelmetadata.
  - Voeg velden toe zoals `playStyle`, `timing`, `targeting`, `endsTurn`, `blockedByNope`.
  - Gebruik deze metadata later voor UI-hints en PC-keuzes.

- [ ] Stap 13: Update de speler-UI per speelwijze.
  - Toon alleen relevante controls: kiezen, ordenen, reageren, kaartpositie aanwijzen.
  - Zorg dat kaartteksten kort blijven en de flow zelf uitlegt wat er gebeurt.

- [ ] Stap 14: Update de PC-logica.
  - Geef elke kaarttype een eenvoudige beslisregel.
  - Test vooral `oracle`, `fossil`, `nope`, soortparen en extra beurten.

- [ ] Stap 15: Balansronde.
  - Speel meerdere korte potjes.
  - Noteer kaarten die te sterk, te zwak of te verwarrend voelen.
  - Pas aantallen in `partyPackDistribution` pas aan nadat de effecten helder zijn.

- [ ] Stap 16: Documenteer de definitieve regels.
  - Update `README.md` met de nieuwe kaartlijst.
  - Houd dit checklistbestand daarna als voortgangslog, niet als eindregelboek.

## Aanbevolen volgorde per kaarttype

- [x] `oracle`: grootste winst, omdat deze nu automatisch speelt terwijl de tekst een keuze suggereert.
- [ ] `fossil`: snel voelbaar beter als de speler bewuster steelt.
- [ ] `nope`: belangrijk voor interactie en timing.
- [ ] `raptor` en `targetedRaptor`: voorkomen dat twee kaarten hetzelfde voelen.
- [ ] Soortkaarten: grootste ontwerpblok, daarom pas doen als de actieflow stevig staat.
- [ ] `volcano`, `sprint`, `dig`: daarna aanscherpen voor extra tactische kleur.
- [ ] `meteor`, `shelter`, `feral`: bestaande basis behouden en finetunen rond de nieuwe flows.

## Per sessie afvinken

Gebruik per kaarttype deze mini-checklist:

- [ ] Regel gekozen.
- [ ] UI-flow gekozen.
- [ ] Implementatie gedaan.
- [ ] PC-gedrag aangepast.
- [ ] Handmatig getest.
- [ ] README of regels bijgewerkt.
