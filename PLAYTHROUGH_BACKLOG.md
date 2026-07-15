# Playthrough-backlog

Deze backlog bundelt de bevindingen uit de multiplayer-playthrough. De nummers blijven stabiel, zodat ieder onderwerp afzonderlijk kan worden opgepakt en gecommit. Dezelfde checklist staat in de pull request.

Status: `[ ]` open, `[-]` bezig, `[x]` klaar.

## Spelregels en balans

- [x] **1. Tekst van Triceratops Blik corrigeren**
  Verwijder de onjuiste claim dat Meteorietinslag en Schuilgrot apart worden gemeld. De kaart laat de bovenste drie kaarten zien.
- [x] **2. Party Pack uitbreiden naar 11 Meteorietinslagen**
  Maak het totale deck 11 meteorieten groot. Gebruik per potje `aantal spelers + 1` meteorieten en houd catalogus, README, singleplayer, multiplayer en tests gelijk.
- [ ] **3. Alle kaartregels vergelijken en aanscherpen**  
  Vergelijk kaarttekst, README, singleplayer, multiplayer en tests. Verduidelijk vooral Brul Terug, beide Raptoraanvallen, Dino Sprint, Fossielgraaier, Stego Snack en Tricera-Tuk en doe voorstellen voor uitbreidingen.

## Multiplayer-lobby en opstartflow

- [ ] **4. Wachtstatus voor de eerste serveropstart toevoegen**  
  Toon een spinner, uitleg over de cold start en duidelijke fout- en timeoutstatussen tijdens maken en deelnemen.
- [ ] **5. Naam vergrendelen zodra de speler in een room zit**  
  Blokkeer het naamveld en de dobbelknop na maken of deelnemen en ontgrendel ze na het verlaten van de room.
- [ ] **6. Multiplayerknoppen visueel gelijktrekken**  
  Maak Start multiplayer en Deelnemen consistent met de primaire in-game actieknoppen.
- [ ] **7. Verouderde multiplayerdisclaimer verwijderen**  
  Verwijder de melding dat de online modus nog in ontwikkeling is uit UI en documentatie.
- [ ] **8. Willekeurige naamgenerator beoordelen en uitbreiden**  
  Documenteer de twee huidige lijsten van twaalf naamdelen en beoordeel uitbreiding en het voorkomen van dubbele roomnamen.

## Speeltafel en informatie

- [ ] **9. Logboek standaard verbergen en beperken**  
  Plaats het logboek achter het menu en toon standaard alleen de laatste vijf acties, met toegang tot het volledige logboek.
- [ ] **10. Handen van tegenstanders compact weergeven**  
  Toon een vast maximum aan overlappende kaartruggen plus een badge met het totale aantal kaarten. Toon naam en kaartenaantal consistent op desktop en mobiel.

## Visuele afwerking

- [ ] **11. Kaartillustraties meer ruimte geven**  
  Vergelijk beeldgerichte kaartlayouts, ondersteun gerichte uitsneden per illustratie en test hand-, reveal-, afleg- en catalogusformaten.
- [ ] **12. Sluitkruis in gamestijl ontwerpen en implementeren**  
  Maak een herbruikbaar sluiticoon in de stijl van de game en vervang de losse tekstkruisjes in alle dialogen.

## Werkwijze

- Ieder genummerd onderwerp krijgt een eigen commit.
- De pull-requestbeschrijving gebruikt deze nummers en wordt na ieder onderwerp bijgewerkt.
- Een onderwerp wordt pas afgevinkt nadat relevante tests zijn geslaagd.
- De pull request wordt alleen door de repository-eigenaar naar `main` gemerged.
