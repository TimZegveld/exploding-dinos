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
| `meteor` | Meteorietinslag | Trek je deze zonder `Schuilgrot`, dan ben je uitgeschakeld. | klaar | Varianten/balans later. |
| `shelter` | Schuilgrot | Wordt automatisch gebruikt tegen `Meteorietinslag`; daarna gaat de meteoriet geheim terug in de stapel. | klaar | Varianten/balans later. |
| `raptor` | Raptor Aanval | Het doelwit moet meteen 2 kaarten trekken; als reactie schuift hij de volledige aanvalslast door. | klaar | Varianten/balans later. |
| `targetedRaptor` | Gerichte Raptorjacht | Kies bewust een doelwit dat meteen 2 kaarten moet trekken; als reactie mag je opnieuw een doelwit kiezen. | klaar | Varianten/balans later. |
| `sprint` | Dino Sprint | Sla je beurt over; bij extra beurten raak je 1 extra pending beurt kwijt. | klaar | Varianten/balans later. |
| `trike` | Triceratops Blik | Bekijk de bovenste 3 kaarten; Meteorietinslag en Schuilgrot worden expliciet gemeld. | klaar | Varianten/balans later. |
| `oracle` | Tijdlijn Kneden | Bekijk de bovenste 3 kaarten en leg ze terug in jouw volgorde. | klaar | Varianten/balans later. |
| `volcano` | Vulkaan Shuffle | Schud de trekstapel zichtbaar en bekijk daarna de nieuwe bovenste kaart. | klaar | Varianten/balans later. |
| `dig` | Diep Graven | Bekijk de onderste kaart; neem hem, of laat hem liggen en trek blind van boven. | klaar | Varianten/balans later. |
| `fossil` | Fossielgraaier | Kies een gesloten kaart van een tegenstander en steel die. | klaar | Varianten/balans later. |
| `nope` | Brul Terug | Reageer op een actiekaart van de ander en blokkeer die. | klaar | Varianten/balans later. |
| `feral` | Wilde Dino | Joker voor een soortpaar; activeert de volledige beloning van de andere soortkaart in het paar. | klaar | Varianten/balans later. |
| `miniRaptor` | Mini-Raptor | Speel een paar om een doelwit te kiezen en snel 1 willekeurige kaart te stelen. | klaar | Eerste soortkaartvariant toegevoegd; meer varianten/balans later. |
| `stegoSnack` | Stego Snack | Speel een paar om 1 oudere niet-meteor kaart uit de aflegstapel terug te nemen. | klaar | Varianten/balans later. |
| `brontoBuik` | Bronto Buik | Speel een paar om de bovenste kaart te bekijken; laat hem liggen of schuif hem onderop. | klaar | Varianten/balans later. |
| `triceraTuk` | Tricera-Tuk | Speel een paar om 1 open beurt weg te dutten zonder te trekken. | klaar | Varianten/balans later. |
| `pteroPret` | Ptero Pret | Speel een paar om de bovenste 2 kaarten te bekijken; leg 1 bovenop en 1 onderop. | klaar | Varianten/balans later. |

## Open kaartwerk

- [x] Bepaal of `trike` bewust simpel blijft of een uniekere informatieflow krijgt.
- [x] Werk `feral` definitief uit: volledige soortbeloning of zwakkere joker-beloning.
- [x] Geef `miniRaptor` een unieke paarbeloning en kaartfront.
- [x] Geef `stegoSnack` een unieke paarbeloning en kaartfront.
- [x] Geef `brontoBuik` een kaartfront en crop/tweak.
- [x] Geef `triceraTuk` een kaartfront en crop/tweak.
- [x] Geef `pteroPret` een unieke paarbeloning.
- [x] Geef `pteroPret` een kaartfront en crop/tweak.
- [x] Voeg kaartfront toe voor `raptor`.
- [x] Geef `meteor` een kaartfront en crop/tweak.
- [x] Voeg resterende basisillustratie toe voor kaarttypes zonder artwork.
- [x] Bereid eerste soortkaartvariant voor: `miniRaptor` wisselt tussen basisart en mossige graai-variant.
- [ ] Bereid later varianten voor veelvoorkomende soortkaarten voor.
- [ ] Doe een balansronde nadat de soortkaartbeloningen helder zijn.

## Persona-portretten

- [x] Houd het NPC-roster op 9 persona's.
- [x] Voeg vaste persona-id's, dinorassen, portretpaden en beeldprompts toe in `src/players.js`.
- [x] Laat spelers bij een nieuw spel 1-4 NPC's uit het roster kiezen.
- [x] Toon spelerportret/initialen bij NPC-stoelen, doelwitkeuzes en kaartmomenten.
- [x] Genereer portret voor Rex de Archeoloog (man): T. rex met monocle en veldhoed tussen fossielen.
- [x] Genereer portret voor Nova de Vulkaanwachter (vrouw): Parasaurolophus met veiligheidsbril en gloeiende lavalantaarn.
- [x] Genereer portret voor Kiki de Bottenfluisteraar (vrouw): Velociraptor met bottenketting en slimme glimlach.
- [x] Genereer portret voor Bram Brulbaard (man): Carnotaurus met nette baard, sjerp en grote operahouding.
- [x] Genereer portret voor Luna de Tijdlijnkundige (vrouw): Triceratops met sterrenmantel en zandloper.
- [x] Genereer portret voor Otto de Kaartkapitein (man): Pteranodon met kapiteinspet en stapel kaarten.
- [x] Genereer portret voor Mira de Mosridder (vrouw): Ankylosaurus met mosmantel en houten schild.
- [x] Genereer portret voor Puck de Pootafdrukker (man): Stegosaurus met inktpot en pootafdrukstempels.
- [x] Genereer portret voor Tara de Trucjager (vrouw): Dilophosaurus met jagershoedje en kaarttrucs.

## Per kaart afronden

- [ ] Regel gekozen.
- [ ] UI-flow gekozen.
- [ ] Implementatie gedaan.
- [ ] PC-gedrag aangepast of bewust ongewijzigd gelaten.
- [ ] Kaartfront/artwork toegevoegd.
- [ ] Hand-, reveal- en miniweergave getweakt.
- [ ] `README.md` en deze checklist bijgewerkt.
- [ ] `node --check game.js` en smoke-test gedraaid.
