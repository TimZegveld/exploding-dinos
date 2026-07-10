# Exploding Dinos kaartdesign plan

Dit document legt de ontwerpaanpak vast voor de kaarten. De eerste fase maakt 1 herkenbaar basisdesign per kaarttype. Later kunnen per kaarttype meerdere kaartvarianten worden toegevoegd zonder de visuele samenhang van het spel te verliezen.

## Doel

- Elke kaart moet in een oogopslag herkenbaar zijn op type en functie.
- Alle kaarten delen dezelfde layout, typografie, randstijl en illustratiestijl.
- Per kaarttype komt er eerst 1 basisillustratie en 1 basisdesign.
- Later krijgt elke individuele kaart een variant, met dezelfde kaarttype-identiteit maar andere pose, grap, achtergrond of detail.
- Tekst wordt niet in AI-illustraties gezet. Titels, effecten en iconen blijven in de game/template zelf, zodat ze scherp en aanpasbaar blijven.

## Overkoepelende art direction

Stijl: speelse prehistorische chaos, heldere vormen, dikke outlines, warme kleuren, grappige expressies, bordspelgevoel, leesbaar op kleine kaartgrootte.

Illustratie-afspraken:

- Geen tekst, letters, cijfers of UI-elementen in de illustratie.
- Hoofdonderwerp centraal en duidelijk herkenbaar.
- Eenvoudige achtergrond met genoeg rust achter het onderwerp.
- Consistente lichtval en cartoonachtige schaduwen.
- Vrolijk-chaotisch, niet horrorachtig of realistisch gewelddadig.

Algemene promptbasis:

```text
playful prehistoric cartoon card game illustration, chunky shapes, bold clean outlines, warm colors, expressive dinosaur character, board game art, simple readable background, dynamic composition, high detail but uncluttered, no text, no letters, no numbers, no watermark
```

## Kaarttemplate

Elke kaart krijgt dezelfde basisopbouw:

- Bovenbalk: kaartnaam.
- Type-icoon: linksboven of rechtsboven.
- Illustratievlak: grootste deel van de kaart.
- Effectvlak: korte regel met speleffect.
- Typekleur: rand, hoekaccent of achtergrondband.
- Pootafdruk-marker: optionele markering voor de 2-3 speler set.

Voorgestelde assetstructuur:

```text
assets/
  cards/
    illustrations/
      meteor.png
      shelter.png
      raptor.png
    icons/
      danger.svg
      defuse.svg
      action.svg
      set.svg
      joker.svg
    templates/
      card-template.svg
    exports/
```

## Designfamilies

| Familie | Code `kind` | Rol | Kleurgevoel | Vormtaal |
|---|---|---|---|---|
| Gevaar | `danger` | Verliesrisico | rood, oranje, zwart accent | scherpe impactvormen, rook, barsten |
| Verdediging | `defuse` | Redt speler | groen, mos, grotblauw | ronde veilige vormen, beschutting |
| Actie | `action` | Speelbaar effect | geel, amber, warm oranje | dynamische diagonalen, beweging |
| Soortkaart | `set` | Paren verzamelen | per soort eigen accent | rustigere karakterkaart |
| Joker | `set` + `feral` | Wildcard | meerdere accenten | asymmetrisch, wild, extra energie |

## Kaarttypes

| Type | Naam | Familie | Basisdesign | Illustratieprompt |
|---|---|---|---|---|
| `meteor` | Meteorietinslag | Gevaar | Grote meteoriet die in prehistorisch landschap inslaat, rode rand, barst-icoon. | `massive flaming meteor crashing into a prehistoric valley, shocked cartoon dinosaurs in the distance, fiery orange smoke, dramatic but playful, no text` |
| `shelter` | Schuilgrot | Verdediging | Dino veilig in grot terwijl licht/puin buiten blijft, groene rand, grot-icoon. | `small dinosaur hiding safely inside a cozy cave while glowing meteor light shines outside, mossy rocks, protective feeling, no text` |
| `raptor` | Raptor Aanval | Actie | Raptor springt naar voren, actieband, klauw-icoon. | `fast cartoon raptor leaping forward with dust clouds and playful intensity, prehistoric plants, dynamic action pose, no text` |
| `targetedRaptor` | Gerichte Raptorjacht | Actie | Raptor met focus/target-compositie, scherper kader dan Raptor Aanval. | `cartoon raptor tracking a target through prehistoric bushes, focused eyes, playful hunter pose, circular target-like composition without actual symbols or text` |
| `sprint` | Dino Sprint | Actie | Dino rent uit beeld met stofspoor, snelheidslijnen. | `small dinosaur sprinting extremely fast across sandy prehistoric ground, dust trail, motion lines, funny determined expression, no text` |
| `trike` | Triceratops Blik | Actie | Triceratops kijkt vooruit naar drie zwevende kaarten/silhouetten zonder tekst. | `wise cartoon triceratops peeking ahead with curious eyes, three blank stone tablets or card shapes floating subtly, jungle background, no text` |
| `oracle` | Tijdlijn Kneden | Actie | Dino kneedt gloeiende tijdlijn of fossielspoor, mystieke amberkleur. | `cartoon dinosaur bending a glowing prehistoric timeline like soft clay, amber light, fossils and footprints swirling, magical but playful, no text` |
| `volcano` | Vulkaan Shuffle | Actie | Vrolijke eruptie die kaarten/stenen door elkaar schudt. | `cartoon volcano erupting with swirling rocks and leaves like a shuffle, playful lava splash, dinosaurs surprised but safe, no text` |
| `dig` | Diep Graven | Actie | Dino graaft naar de onderste laag en ontdekt een verborgen kaartvorm/fossiel, keuzegevoel tussen veilig boven en spannend onder. | `cartoon dinosaur digging deep through layered soil toward a glowing buried card-shaped fossil at the very bottom, curious risky expression, cross section of earth, warm earthy colors, playful suspense, no text` |
| `fossil` | Fossielgraaier | Actie | Dino grijpt fossiel uit iemands voorraad, ondeugend maar vriendelijk. | `mischievous cartoon dinosaur grabbing a shiny fossil from a dig site, playful sneaky expression, bones and tools nearby, no text` |
| `nope` | Brul Terug | Actie/reactie | Dino brult een geluidsgolf die actie wegduwt, sterk silhouet. | `cartoon dinosaur roaring a visible sound wave that pushes back dust and leaves, bold expressive pose, defensive playful energy, no text` |
| `feral` | Wilde Dino | Joker | Chaotische wilde dino met meerdere kleuraccenten, jokergevoel. | `wild unpredictable cartoon dinosaur with playful chaotic energy, mixed colorful accents, feathers and leaves flying, expressive grin, no text` |
| `miniRaptor` | Mini-Raptor | Soortkaart | Kleine snelle raptor graait een kaart en stuift weg, groene rand, klauw-icoon. | `tiny cute cartoon raptor darting away with a blank card-shaped object, dust trail, oversized curious eyes, playful quick-steal energy, simple prehistoric background, no text` |
| `stegoSnack` | Stego Snack | Soortkaart | Stegosaurus snackt een bruikbare kaart terug uit een rommelige aflegstapel, groen/blad-accent. | `friendly cartoon stegosaurus happily snacking a blank card-shaped fossil from a small discard pile of leaves and stone cards, chunky plates, warm cheerful colors, no text` |
| `brontoBuik` | Bronto Buik | Soortkaart | Brontosaurus met grote buik, zacht en grappig. | `round-bellied cartoon brontosaurus smiling gently, long neck, cozy prehistoric clearing, funny soft character design, no text` |
| `triceraTuk` | Tricera-Tuk | Soortkaart | Slaperige triceratops, knikkend/half slapend. | `sleepy cartoon triceratops nodding off with relaxed expression, cozy plants, calm warm light, no text` |
| `pteroPret` | Ptero Pret | Soortkaart | Pterodactylus in speelse vlucht, luchtig blauw accent. | `playful cartoon pterodactyl gliding through the sky with joyful expression, clouds and prehistoric cliffs, bright airy colors, no text` |

## Fase 1: basisdesign per kaarttype

1. Maak definitieve kaartafmetingen voor digitaal en print.
2. Maak een herbruikbare kaarttemplate.
3. Kies definitieve familie-iconen en kleuren.
4. Genereer of ontwerp 17 basisillustraties, 1 per kaarttype.
5. Exporteer illustraties naar `assets/cards/illustrations/`.
6. Voeg per kaarttype assetvelden toe aan `cardCatalog`.
7. Update de kaart-rendering zodat typekleur, icoon en illustratie zichtbaar zijn.
8. Test leesbaarheid in handkaarten, aflegstapel en trekstapel.

## Fase 2: varianten per individuele kaart

Varianten moeten verschillen zonder de kaartfunctie te veranderen. Houd daarom deze lagen gescheiden:

- Vast per kaarttype: naam, effect, familie, kleur, icoon, basiscompositie.
- Variabel per exemplaar: pose, gezichtsuitdrukking, achtergrondgrap, kleine props, weersomstandigheid, camerahoek.

Voorbeeld voor `miniRaptor`:

```js
miniRaptor: {
  name: "Mini-Raptor",
  kind: "set",
  image: "assets/cards/illustrations/mini-raptor-01.png",
  variants: [
    "assets/cards/illustrations/mini-raptor-01.png",
    "assets/cards/illustrations/mini-raptor-02.png",
    "assets/cards/illustrations/mini-raptor-03.png"
  ]
}
```

Variantregels:

- Gebruik dezelfde randkleur en hetzelfde icoon.
- Laat de hoofdvorm van de dino herkenbaar hetzelfde blijven.
- Verander geen speleffect via beeldtaal.
- Maak varianten subtiel genoeg dat spelers niet denken dat het een nieuw kaarttype is.

## Implementatie-notities

De huidige game gebruikt `card.kind` al voor globale styling. De volgende stap is om `cardCatalog` uit te breiden met designmetadata:

```js
design: {
  family: "action",
  color: "#d79b32",
  icon: "assets/cards/icons/action.svg",
  image: "assets/cards/illustrations/sprint.png"
}
```

Daarna kan `renderPlayerHand()` de kaartknop uitbreiden met een illustratievlak en CSS-variabelen per kaart.

## Aanbevolen volgende stap

Begin met een visuele proefset van 5 kaarten:

- `meteor` voor gevaar.
- `shelter` voor verdediging.
- `sprint` voor actie.
- `feral` voor joker.
- `miniRaptor` voor soortkaart.

Als deze vijf samen goed voelen, kan de stijl veilig worden doorgetrokken naar de volledige set.
