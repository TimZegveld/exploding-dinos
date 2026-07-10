# Exploding Dinos playtest TODO

Notities uit het gespeelde potje, omgezet naar implementeerbare stappen. Doel: de speler moet altijd begrijpen wat er gebeurt, altijd eigen keuzes kunnen zien, en pc-acties moeten voelen als observeerbare gebeurtenissen in plaats van knoppen die namens de pc bediend worden.

## Fase 1: kaart bekijken en actieknoppen

- [x] Spelerhand altijd aanklikbaar maken.
  - Klik op een kaart opent een kaartdetail/reveal, ook als de kaart nu niet speelbaar is.
  - Detail krijgt twee knoppen: `Terug` en `Spelen`.
  - `Spelen` is disabled als de kaart op dat moment niet speelbaar is.
  - Paar-kaarten blijven speelbaar als er een geldig paar in de hand zit.
- [x] Knoppen in reveal-modals naast elkaar tonen als er twee acties zijn.
  - Bijvoorbeeld `OK` + `Speel Brul Terug`.
  - Dit geldt ook voor toekomstige reactieknoppen.

## Fase 2: namen en tekstkwaliteit

- [x] Pc-spelers echte namen geven in plaats van `PC 1`, `PC 2`, enzovoort.
  - Voeg een vaste namenlijst toe bij spelstart.
  - Bewaar de player-id technisch als `pc1`, `pc2`, maar toon overal de naam.
  - Houd ruimte in de datastructuur voor later: profiel, speelstijl, voorkeuren.
- [x] Taalcorrecties doorvoeren.
  - `PC 1 speelt Raptor Aanval op Jij.` wordt `Naam speelt Raptor Aanval op jou.`
  - Controleer alle teksten waarin `label(target)` grammaticaal verkeerd uitpakt.
- [x] Alle observer-teksten nalopen.
  - Als een pc een kaart speelt, moet de speler meestal alleen `OK` zien.
  - Vermijd knoppen als `Pak kaart` of `Leg in hand` wanneer de pc degene is die handelt.
  - Paartekst moet noemen van wie een kaart wordt gepakt.
  - Gestolen-kaartmomenten moeten `OK` tonen als de kaart niet naar de speler zelf gaat.

## Fase 3: reacties op aanvallen

- [x] Reactie op aanval herwerken naar een hand-keuze-flow.
  - Bij een aanval van een ander ziet de speler de eigen hand, niet alleen een directe suggestie.
  - Speelbare reacties worden aanklikbaar; niet-speelbare kaarten mogen nog steeds bekeken worden.
  - Speler kan ook kiezen om niets te doen.
- [x] Naast `Brul Terug` ook tegenaanvallen toestaan.
  - `Raptor Aanval` en `Gerichte Raptorjacht` mogen als reactie op een aanval.
  - De aanvalslast stapelt door: als er 2 beurten open stonden en iemand legt daar 2 bovenop, moet het volgende doelwit 4 beurten verwerken.
  - Controleer kaarten met vergelijkbaar beurt-effect, vooral `Dino Sprint`.
- [x] Extra-beurtenmodel expliciet maken.
  - Vastleggen of `pendingTurns` het aantal resterende verplichte trekken/beurten representeert.
  - Aanvallen moeten niet alleen `+1` doen als de tekst zegt dat iemand 2 beurten moet overleven.
  - `Dino Sprint` moet consequent een huidige beurt en eventueel extra raptorstress afhandelen.

## Fase 4: doelwit en kaartkeuze

- [x] Zelf een doelwit kunnen kiezen bij stelen met een paar.
  - Na het spelen van een paar kiest de speler eerst een tegenstander.
  - Daarna kiest de speler een gesloten kaart uit diens hand.
- [x] Pc-paaracties duidelijker maken.
  - Toon welke speler doelwit is.
  - Toon dat de pc een kaart pakt van die speler.
  - De speler bevestigt alleen met `OK`.
- [x] Fossielgraaier en paar-stelen delen waar mogelijk dezelfde target/kaartkeuze-componenten.

## Fase 5: kaart-effecten repareren

- [x] `Triceratops Blik` moet de bovenste 3 kaarten zichtbaar tonen.
  - Niet alleen tekst in de actie-balk.
  - Kaarten in volgorde tonen: bovenop, tweede, derde.
- [x] `Raptor Aanval` van de speler moet zichtbaar effect hebben.
  - Doelwit bepalen of kiezen.
  - Extra beurten correct toepassen.
  - Beurt van de speler correct eindigen.
- [x] `Diep Graven` controleren.
  - Kaarttekst zegt dat de beurt eindigt na het pakken van de onderste kaart.
  - Implementatie moet de beurt ook echt eindigen na de reveal/confirm-flow.
- [x] Alle actiekaarten controleren op `Brul Terug`, doelwit, beurt-einde en pc-gedrag.

## Fase 6: meteoriet en Schuilgrot-flow

- [x] Pc-meteorietmoment pauzeren tot de speler `OK` drukt.
  - Geen automatische timeout voor pc-meteoriet zonder zichtbare bevestiging.
  - Als de pc een `Schuilgrot` heeft, toon meteen dat die wordt gespeeld.
- [x] Uitleg toevoegen bij pc-Schuilgrot.
  - Vertel dat de pc de meteoriet zelf ergens terug in de stapel legt.
  - De speler hoeft alleen te bevestigen.
- [x] Meteoriet terugplaatsen voor de speler preciezer maken.
  - Niet alleen een slider met boven/onder.
  - Kies expliciet `bovenop`, `onderop`, of een positie op basis van het totale aantal kaarten in de trekstapel.
  - Toon posities als nummers zodat duidelijk is waar de kaart terechtkomt.

## Aanpak

1. Eerst de gedeelde UI-state opschonen: kaartdetail, dubbele knoppen en altijd-kaart-bekijken. Dit is de basis voor bijna alle andere verbeteringen.
2. Daarna labels en namen fixen, omdat dat weinig spelrisico heeft en meteen alle flows leesbaarder maakt.
3. Vervolgens de reactie-flow bouwen: hand tonen tijdens aanvallen, `niets doen`, `Brul Terug`, en aanval-op-aanval.
4. Daarna targetselectie en stelen samenbrengen voor paar/Fossielgraaier, inclusief correcte pc-observerteksten.
5. Daarna losse kaartbugs oplossen: `Triceratops Blik`, `Raptor Aanval`, `Diep Graven`, en de extra-beurtenlogica.
6. Als laatste de meteoriet/Schuilgrot-flow verfijnen, omdat die veel modal- en beurtlogica raakt.

## Verificatieplan

- Run altijd `node --check game.js`.
- Speel minimaal deze scenario's handmatig of via een lichte DOM-harness:
  - Niet-speelbare kaart aanklikken, teruggaan, speelknop disabled.
  - Speelbare actiekaart aanklikken en spelen.
  - Pc speelt aanval; speler kiest `niets doen`, `Brul Terug`, en tegenaanval.
  - Speler speelt paar en kiest pc + kaartpositie.
  - Pc speelt paar en steelt van speler of andere pc met alleen `OK` voor de speler.
  - `Triceratops Blik` toont 1-3 kaarten in volgorde.
  - Pc trekt meteoriet met en zonder Schuilgrot en wacht op `OK`.
  - Speler plaatst meteoriet terug op specifieke positie.
