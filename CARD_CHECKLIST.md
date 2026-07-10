# Exploding Dinos kaartchecklist

Doel: kaartregels, kaartfronts en voortgang op 1 plek bijhouden. Een kaart is pas `klaar` wanneer gameplay, pc-gedrag, kaartfront, crop/tweak en documentatie samen kloppen.

## Statuslegenda

- `klaar`: eigen gameplay en eigen kaartfront zijn klaar en getweakt.
- `spel klaar`: gameplay is klaar, maar kaartfront/artwork mist nog.
- `basis`: speelbaar of bruikbaar, maar nog niet uniek genoeg uitgewerkt.
- `te doen`: nog niet uitgewerkt.

## Kaartstatus

| Type | Naam | Regel in deze iteratie | Status | Volgende stap |
|---|---|---|---|---|
| `meteor` | Meteorietinslag | Trek je deze zonder `Schuilgrot`, dan ben je uitgeschakeld. | spel klaar | Eigen kaartfront/artwork toevoegen. |
| `shelter` | Schuilgrot | Wordt automatisch gebruikt tegen `Meteorietinslag`; daarna gaat de meteoriet geheim terug in de stapel. | spel klaar | Eigen kaartfront/artwork toevoegen. |
| `raptor` | Raptor Aanval | Eindig je beurt; de volgende speler neemt straks 2 beurten. Als reactie op een aanval schuift hij de aanval door. | spel klaar | Eigen kaartfront/artwork toevoegen. |
| `targetedRaptor` | Gerichte Raptorjacht | Kies bewust een doelwit voor 2 beurten. In 2 spelers is dat de ander. | klaar | Varianten/balans later. |
| `sprint` | Dino Sprint | Sla je beurt over; bij extra beurten raak je 1 extra pending beurt kwijt. | klaar | Varianten/balans later. |
| `trike` | Triceratops Blik | Bekijk de bovenste 3 kaarten van de trekstapel. | basis | Unieker effect of bewust als simpele informatiekaart vastleggen; artwork toevoegen. |
| `oracle` | Tijdlijn Kneden | Bekijk de bovenste 3 kaarten en leg ze terug in jouw volgorde. | klaar | Varianten/balans later. |
| `volcano` | Vulkaan Shuffle | Schud de trekstapel zichtbaar en bekijk daarna de nieuwe bovenste kaart. | klaar | Varianten/balans later. |
| `dig` | Diep Graven | Bekijk de onderste kaart; neem hem, of laat hem liggen en trek blind van boven. | klaar | Varianten/balans later. |
| `fossil` | Fossielgraaier | Kies een gesloten kaart van een tegenstander en steel die. | klaar | Varianten/balans later. |
| `nope` | Brul Terug | Reageer op een actiekaart van de ander en blokkeer die. | klaar | Varianten/balans later. |
| `feral` | Wilde Dino | Joker voor dino-soortkaarten; activeert de beloning van de andere soortkaart in het paar. | basis | Jokerrol definitief vastleggen en kaartfront/artwork toevoegen. |
| `miniRaptor` | Mini-Raptor | Speel een paar om een doelwit te kiezen en snel 1 willekeurige kaart te stelen. | klaar | Varianten/balans later. |
| `stegoSnack` | Stego Snack | Speel een paar om 1 oudere niet-meteor kaart uit de aflegstapel terug te nemen. | klaar | Varianten/balans later. |
| `brontoBuik` | Bronto Buik | Soortkaart; unieke paarbeloning staat nog open. | basis | Unieke paarbeloning en kaartfront/artwork uitwerken. |
| `triceraTuk` | Tricera-Tuk | Soortkaart; unieke paarbeloning staat nog open. | basis | Unieke paarbeloning en kaartfront/artwork uitwerken. |
| `pteroPret` | Ptero Pret | Soortkaart; unieke paarbeloning staat nog open. | basis | Unieke paarbeloning en kaartfront/artwork uitwerken. |

## Open kaartwerk

- [ ] Bepaal of `trike` bewust simpel blijft of een uniekere informatieflow krijgt.
- [ ] Werk `feral` definitief uit: volledige soortbeloning of zwakkere joker-beloning.
- [x] Geef `miniRaptor` een unieke paarbeloning en kaartfront.
- [x] Geef `stegoSnack` een unieke paarbeloning en kaartfront.
- [ ] Geef `brontoBuik` een unieke paarbeloning en kaartfront.
- [ ] Geef `triceraTuk` een unieke paarbeloning en kaartfront.
- [ ] Geef `pteroPret` een unieke paarbeloning en kaartfront.
- [ ] Voeg kaartfronts toe voor `meteor`, `shelter`, `raptor`, `trike` en `feral`.
- [ ] Voeg resterende basisillustraties toe voor kaarttypes zonder artwork.
- [ ] Bereid later varianten voor veelvoorkomende soortkaarten voor.
- [ ] Doe een balansronde nadat de soortkaartbeloningen helder zijn.

## Per kaart afronden

- [ ] Regel gekozen.
- [ ] UI-flow gekozen.
- [ ] Implementatie gedaan.
- [ ] PC-gedrag aangepast of bewust ongewijzigd gelaten.
- [ ] Kaartfront/artwork toegevoegd.
- [ ] Hand-, reveal- en miniweergave getweakt.
- [ ] `README.md` en deze checklist bijgewerkt.
- [ ] `node --check game.js` en smoke-test gedraaid.
