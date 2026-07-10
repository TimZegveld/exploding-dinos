# Exploding Dinos kaartdesign TODO

Gebruik deze lijst om het kaartdesign stap voor stap uit te werken. Elke stap is bedoeld als kleine, losse commit. Zo blijft het project makkelijk te volgen en kun je per onderdeel terugkijken wat er is veranderd.

## Werkwijze per stap

1. Werk alleen aan de bestanden die bij die stap horen.
2. Test kort in de browser.
3. Commit met de voorgestelde commit-message of een kleine variatie daarop.
4. Push na elke commit als de stap goed voelt.

## Stap 1: kaartbasis vastleggen

Status: klaar

Doel:

- Kaarten hebben een normale verticale speelkaartratio.
- Trekstapel, aflegstapel, handkaarten en reveal-kaarten gebruiken dezelfde ratio.

Bestanden:

- `styles.css`

Acceptatiecheck:

- Handkaarten zijn verticaal, niet vierkant.
- Trekstapel en aflegstapel hebben dezelfde kaartvorm.
- Reveal-kaarten voelen als dezelfde kaartfamilie.

Commit:

```text
Add card ratio styling
```

## Stap 2: kaartachterkant ontwerpen

Status: klaar

Doel:

- Alle gesloten kaarten gebruiken dezelfde Exploding Dinos achterkant.
- De achterkant werkt op kleine handkaarten en grotere deck/reveal-kaarten.

Bestanden:

- `assets/cards/card-back.svg`
- `styles.css`

Acceptatiecheck:

- PC-hand toont de nieuwe kaartachterkant.
- Trekstapel toont dezelfde kaartachterkant.
- Gesloten reveal-kaarten tonen dezelfde kaartachterkant.
- Deck-aantal en knoptekst blijven leesbaar.

Commit:

```text
Add card back design
```

## Stap 3: assetmappen voorbereiden

Status: te doen

Doel:

- De projectstructuur klaarzetten voor voorkanten, iconen, templates en exports.
- Nog geen definitieve kaartillustraties toevoegen.

Bestanden:

- `assets/cards/illustrations/.gitkeep`
- `assets/cards/icons/.gitkeep`
- `assets/cards/templates/.gitkeep`
- `assets/cards/exports/.gitkeep`

Acceptatiecheck:

- Alle assetmappen bestaan.
- De mappen zijn leeg behalve `.gitkeep`.
- `rg --files assets/cards` toont de verwachte structuur.

Commit:

```text
Add card asset folders
```

## Stap 4: designmetadata toevoegen aan kaartcatalogus

Status: te doen

Doel:

- Elk kaarttype krijgt designvelden zonder de gameflow te veranderen.
- De code weet straks welke familie, kleur, icoon en illustratie bij een kaart horen.

Bestanden:

- `game.js`

Voorgestelde velden per kaart:

```js
design: {
  family: "action",
  color: "#d79b32",
  icon: "assets/cards/icons/action.svg",
  image: "assets/cards/illustrations/sprint.png"
}
```

Acceptatiecheck:

- Alle types in `cardCatalog` hebben een `design` object.
- De game start nog steeds.
- Er is nog geen visuele verandering nodig in deze stap.

Commit:

```text
Add card design metadata
```

## Stap 5: familie-iconen maken

Status: te doen

Doel:

- Basisiconen toevoegen voor de globale kaartfamilies.
- Iconen moeten simpel en leesbaar zijn op kleine kaarten.

Bestanden:

- `assets/cards/icons/danger.svg`
- `assets/cards/icons/defuse.svg`
- `assets/cards/icons/action.svg`
- `assets/cards/icons/set.svg`
- `assets/cards/icons/joker.svg`

Acceptatiecheck:

- Iconen zijn SVG.
- Iconen gebruiken geen externe assets.
- Iconen zijn herkenbaar op ongeveer 20-28px.

Commit:

```text
Add card family icons
```

## Stap 6: kaartfront-template bouwen

Status: te doen

Doel:

- De HTML/CSS voor kaartvoorkanten uitbreiden met vaste zones:
  titel, icoon, illustratievlak, effecttekst en pootafdruk-marker.

Bestanden:

- `game.js`
- `styles.css`

Acceptatiecheck:

- Spelerhand toont gestructureerde kaartfronts.
- Kaarten blijven speelbaar als knoppen.
- Tekst blijft leesbaar op desktop en mobiel.
- Er is een nette placeholder als een illustratie nog ontbreekt.

Commit:

```text
Add card front layout
```

## Stap 7: proefset van 5 kaartillustraties maken

Status: te doen

Doel:

- Eerst 5 representatieve kaarttypes visueel testen voordat alle 17 types worden gemaakt.

Kaarten:

- `meteor`
- `shelter`
- `sprint`
- `feral`
- `miniRaptor` - klaar als `assets/cards/illustrations/mini-raptor-quick-steal.png`

Bestanden:

- `assets/cards/illustrations/meteor.svg` of `.png`
- `assets/cards/illustrations/shelter.svg` of `.png`
- `assets/cards/illustrations/sprint.svg` of `.png`
- `assets/cards/illustrations/feral.svg` of `.png`
- `assets/cards/illustrations/mini-raptor.svg` of `.png`
- eventueel `game.js` als bestandsnamen afwijken van de designmetadata

Acceptatiecheck:

- De vijf kaarten voelen als dezelfde set.
- Elke familie is herkenbaar.
- Geen tekst in de illustraties zelf.
- Kaarten blijven leesbaar in de hand.

Commit:

```text
Add first card illustration set
```

## Stap 8: proefset in de game valideren

Status: te doen

Doel:

- Controleren of de gekozen stijl in echte gameplay werkt.
- Kleine CSS-tweaks doen voordat de rest van de set wordt gemaakt.

Bestanden:

- `styles.css`
- eventueel `game.js`

Acceptatiecheck:

- De 5 proefkaarten zijn duidelijk op normale schermgrootte.
- De kaarttekst valt niet weg.
- De kleurfamilies zijn direct herkenbaar.
- Deck/reveal/discard blijven visueel rustig.

Commit:

```text
Tune card illustration layout
```

## Stap 9: overige 12 basisillustraties toevoegen

Status: te doen

Doel:

- Alle resterende kaarttypes krijgen 1 basisillustratie.
- `volcano` is inmiddels toegevoegd als `assets/cards/illustrations/volcano-shuffle.png`.

Kaarten:

- `raptor`
- `targetedRaptor`
- `trike`
- `oracle`
- `dig`
- `fossil`
- `nope`
- `stegoSnack`
- `brontoBuik`
- `triceraTuk`
- `pteroPret`

Bestanden:

- `assets/cards/illustrations/*`
- eventueel `game.js` als bestandsnamen afwijken van de designmetadata

Acceptatiecheck:

- Alle 17 kaarttypes hebben een illustratie.
- Alle illustraties delen dezelfde art direction.
- Geen kaarttype lijkt per ongeluk op een ander type.

Commit:

```text
Add remaining card illustrations
```

## Stap 10: pootafdruk-marker ontwerpen

Status: te doen

Doel:

- Kaarten uit de 2-3 speler set krijgen een subtiele maar duidelijke marker.

Bestanden:

- `styles.css`
- eventueel `assets/cards/icons/paw.svg`
- eventueel `game.js`

Acceptatiecheck:

- Kaarten met `hasPaw` tonen een pootafdruk-marker.
- De marker stoort niet bij kaartnaam of effecttekst.
- Kaarten zonder `hasPaw` tonen geen marker.

Commit:

```text
Add paw marker to cards
```

## Stap 11: aflegstapel visueel verbeteren

Status: te doen

Doel:

- De aflegstapel toont niet alleen tekst, maar voelt ook als een kaartplek.
- Optioneel: bovenste afgelegde kaart als mini-front tonen.

Bestanden:

- `game.js`
- `styles.css`

Acceptatiecheck:

- Als de aflegstapel leeg is, is dat duidelijk.
- Als er een kaart ligt, is de bovenste kaart herkenbaar.
- De layout blijft stabiel tijdens spelen.

Commit:

```text
Improve discard pile display
```

## Stap 12: print/export-template voorbereiden

Status: te doen

Doel:

- Een eerste exportstructuur maken voor printbare kaartbeelden.
- Nog geen volledige printproductie nodig.

Bestanden:

- `assets/cards/templates/card-template.svg`
- eventueel `CARD_DESIGN_PLAN.md`

Acceptatiecheck:

- Template heeft dezelfde ratio als de gamekaarten.
- Zones voor titel, illustratie en effecttekst zijn duidelijk.
- Template is bruikbaar als basis voor latere exports.

Commit:

```text
Add printable card template
```

## Stap 13: variantenmodel voorbereiden

Status: te doen

Doel:

- De code voorbereiden op meerdere illustraties per kaarttype.
- Nog niet alle varianten hoeven te bestaan.

Bestanden:

- `game.js`

Voorbeeld:

```js
variants: [
  "assets/cards/illustrations/mini-raptor-01.png",
  "assets/cards/illustrations/mini-raptor-02.png"
]
```

Acceptatiecheck:

- Kaarten kunnen een basisimage of een variantimage gebruiken.
- Ontbrekende varianten breken de game niet.
- Het blijft mogelijk om 1 design per kaarttype te gebruiken.

Commit:

```text
Prepare card illustration variants
```

## Stap 14: eerste individuele varianten toevoegen

Status: te doen

Doel:

- Per gekozen kaarttype 2-3 subtiele varianten toevoegen.
- Begin met soortkaarten, omdat die vaker voorkomen en visuele variatie daar het meeste oplevert.

Aanbevolen start:

- `miniRaptor`
- `stegoSnack`
- `brontoBuik`

Bestanden:

- `assets/cards/illustrations/*-01.*`
- `assets/cards/illustrations/*-02.*`
- `assets/cards/illustrations/*-03.*`
- `game.js`

Acceptatiecheck:

- Varianten zijn duidelijk familie van elkaar.
- Spelers zien geen nieuwe kaarttypes door de variatie.
- Duplicaten in de hand voelen minder repetitief.

Commit:

```text
Add first card art variants
```

## Huidige afgeronde commits

- `a34c031 Add card design plan`
- `810f529 Add card back design and card ratio`
