# Audit van de kaartregels

Deze audit vergelijkt de korte kaarttekst in `src/cards.js`, de regels in `README.md` en het gedrag van singleplayer (`game.js`) en multiplayer (`server/game-engine.js`). Er zijn geen nieuwe spelmechanieken ingevoerd; alleen tekstuele verduidelijkingen en de resterende correctie van Triceratops Blik zijn toegepast.

## Samenvatting

- De kernwerking van alle 17 kaarttypes bestaat in singleplayer en multiplayer.
- Triceratops Blik meldde in singleplayer Meteorietinslag en Schuilgrot nog apart. Die extra waarschuwingen zijn verwijderd; de speler ziet alleen de drie kaarten en hun volgorde.
- Fossielgraaier en Tricera-Tuk hebben duidelijkere korte kaarttekst gekregen zonder hun werking te veranderen.
- Het bereik van Brul Terug is geharmoniseerd: iedere actieve speler mag buiten de eigen beurt reageren op iedere zichtbare actiekaart, maar nooit op Meteorietinslag, Schuilgrot of een soortcombinatie.

## Vergelijking per kaart

| Kaart | Huidige werking | Verschil of onduidelijkheid | Advies |
|---|---|---|---|
| Meteorietinslag | Schakelt uit zonder Schuilgrot en is bij trekken openbaar. | Geen functioneel verschil gevonden. | Behouden. |
| Schuilgrot | Wordt automatisch en openbaar gebruikt; de meteoriet gaat geheim terug. | Geen functioneel verschil gevonden. | Behouden. |
| Raptor Aanval | Valt de volgende actieve speler aan voor twee trekkingen; doorschuiven verhoogt de volledige last met twee. | De korte kaarttekst noemt doorschuiven en stapelen niet. | Toon de volledige reactieregel in kaartdetail of speluitleg. |
| Gerichte Raptorjacht | De speler kiest een actief doelwit; bij doorschuiven wordt opnieuw een doelwit gekozen en stijgt de last met twee. | De korte kaarttekst noemt de doorschuifregel niet. | Toon de reactieregel in uitgebreid kaartdetail. |
| Dino Sprint | Slaat een normale trekbeurt over en vermindert tijdens een aanval de openstaande treklast. | De interne beurtadministratie verschilt tussen de spelmodi en "extra beurt" is onduidelijk. | Voeg een gerichte pariteitstest toe voordat de kaarttekst verandert. |
| Triceratops Blik | Laat alleen de spelende speler de bovenste drie kaarten in volgorde zien. | Singleplayer voegde aparte meteoriet- en grotwaarschuwingen toe. | Opgelost: toon alleen kaarten en volgorde. |
| Tijdlijn Kneden | Laat de bovenste drie kaarten geheim herschikken. | Geen functioneel verschil gevonden. | Behouden. |
| Vulkaan Shuffle | Schudt de stapel en toont alleen de spelende speler de nieuwe bovenste kaart. | Geen functioneel verschil gevonden. | Behouden. |
| Diep Graven | Toont de onderste kaart en laat die nemen of blind van boven trekken; die trek beëindigt de beurt. | Het beurt-einde staat niet expliciet op de korte kaart. | Vermeld het beurt-einde in uitgebreid kaartdetail. |
| Fossielgraaier | Laat een tegenstander en daarna één van diens gesloten kaarten kiezen. | "Van de ander" was onduidelijk bij meer dan twee spelers. | Opgelost in de korte kaarttekst. |
| Brul Terug | Iedere actieve speler mag op een zichtbare actiekaart reageren. Een oneven keten blokkeert; een even keten laat de oorspronkelijke actie doorgaan. | Singleplayer en multiplayer gebruiken dezelfde reactietabel. Multiplayer sluit iedere reactor met expliciet passen of na 30 seconden; geheime effectinformatie volgt pas daarna. | Opgelost in EK-01. |
| Wilde Dino | Werkt als joker naast één soortkaart en activeert de beloning van die soort. | In multiplayer moet de soortkaart worden aangeklikt; Wilde Dino zelf start daar geen paar. | Maak de partnerkeuze in beide modi gelijk. |
| Mini-Raptor | Een paar kiest een doelwit en steelt daar één willekeurige kaart. | Geen functioneel verschil gevonden. | Behouden. |
| Stego Snack | Een paar kiest een niet-meteor die al in de aflegstapel lag; het zojuist gespeelde paar is uitgesloten. | "Oudere" betekent feitelijk: aanwezig vóór het paar werd gespeeld. | Leg deze definitie uit in uitgebreid kaartdetail. |
| Bronto Buik | Een paar bekijkt bovenop en laat de kaart liggen of schuift hem onderop. | Geen functioneel verschil gevonden. | Behouden. |
| Tricera-Tuk | Een paar slaat één trekbeurt over zonder te trekken. | "Open beurt" was intern jargon. | Opgelost in kaarttekst en README. |
| Ptero Pret | Een paar bekijkt de bovenste twee, legt één bovenop en één onderop en beëindigt de beurt. | De huidige kaarttekst en README vermelden het beurt-einde. | Behouden. |

## Aanbevolen verbeteringen

1. **Brul Terug harmoniseren.** Afgerond in EK-01 met een algemeen reactievenster vóór het actie-effect en servergestuurde time-out.
2. **Uitgebreide kaartdetails toevoegen.** Houd kaartfronten kort en toon timing, doelwit, beurt-einde en mogelijke reacties in het bestaande kaartdetail.
3. **Dino Sprint-pariteit vastleggen.** Test een normale beurt en aanvalslasten van twee, vier en zes trekkingen in beide modi.
4. **Wilde Dino-partnerkeuze gelijktrekken.** Laat spelers bewust kiezen welke soortbeloning wordt geactiveerd wanneer meerdere partners mogelijk zijn.
5. **Randgevallen testen.** Voeg tests toe voor lege of bijna lege trekstapels bij Tijdlijn Kneden, Diep Graven, Bronto Buik en Ptero Pret.

## Mogelijke uitbreidingen na balansvalidatie

- Een kaartdetail-tab "Reacties" waarin zichtbaar is of Brul Terug en raptordoorschuiven zijn toegestaan.
- Een zeldzame driedubbele soortcombinatie met een sterkere beloning, pas nadat paarbeloningen goed gebalanceerd zijn.
- Een moeilijkheidsoptie die alleen pc-keuzes verandert en nooit kaartregels of verborgen informatie.
