# Exploding Dinos

Een eerste speelbare browser-MVP voor een Nederlandse dino-kaartgame geinspireerd door snelle push-your-luck kaartspellen. De kaartbasis volgt nu de Party Pack-structuur: 120 kaarten totaal, met een compacte dino-pootafdruk set voor 2-3 spelers.

## Starten

Open `index.html` in je browser. Er is geen build-step nodig.

## Project-skill

Deze repo bevat een projectlokale Codex-skill onder `.codex/skills/exploding-dinos-card-designer/` voor het uitwerken van nieuwe kaartfuncties en kaartdesigns.

## Regels in deze iteratie

- Jij speelt tegen 1 tot 4 pc-tegenspelers; kies het aantal voor je een nieuw spel start.
- Trek je een `Meteorietinslag` zonder `Schuilgrot`, dan verlies je.
- Een `Schuilgrot` wordt automatisch gebruikt en stopt de meteoriet terug in de trekstapel.
- Actiekaarten kun je voor het trekken spelen.
- Bij 2-3 spelers gebruikt de game alleen de dino-pootafdruk kaarten. Vanaf 4 spelers gebruikt de game de standaard Party Pack-selectie.
- Iedere speler heeft een eigen kleuraccent. De gloeiende rand laat zien wie aan de beurt is, een kaart trekt of een kaart speelt.
- Trek een kaart om je beurt te eindigen. De kaart verschijnt eerst groot in beeld; klik daarna nog een keer om hem aan je hand toe te voegen.
- Gespeelde kaarten verschijnen eerst groot in beeld. Het effect gaat pas door nadat je klikt.
- Gestolen kaarten verschijnen ook groot in beeld voordat ze in de nieuwe hand verdwijnen.
- Trekt iemand een `Meteorietinslag`, dan schudt de kaart zichtbaar. Met `Schuilgrot` kiest de speler geheim waar de meteoriet teruggaat in de stapel.

## Kaarten

- `Meteorietinslag` x9 totaal: gevaarlijke kaart.
- `Schuilgrot` x10 totaal: verdediging tegen de meteoriet.
- `Raptor Aanval` x5 totaal: eindig je beurt; de ander neemt straks 2 beurten.
- `Gerichte Raptorjacht` x5 totaal: kies bewust een doelwit voor 2 beurten. In 2 spelers is dat de ander.
- `Dino Sprint` x10 totaal: sla je beurt over.
- `Triceratops Blik` x6 totaal: bekijk de bovenste drie kaarten.
- `Tijdlijn Kneden` x6 totaal: bekijk en herschik de bovenste drie kaarten.
- `Vulkaan Shuffle` x6 totaal: schud de trekstapel.
- `Diep Graven` x7 totaal: trek de onderste kaart.
- `Fossielgraaier` x6 totaal: kies een gesloten kaart van de ander en steel die.
- `Brul Terug` x9 totaal: reageer op een actiekaart van de ander en blokkeer die.
- `Wilde Dino` x6 totaal: joker voor soortkaarten.
- Dino-soortkaarten x35 totaal: speel paren om te stelen.

## Mogelijke volgende iteraties

- Betere kaartbalans en meer kaarttypes.
- Local co-op tegen een rampage-deck.
- Animaties en eigen kaartillustraties.
- Moeilijkheidsgraden voor de pc.
- Set-combo's voor `Dino Snack`.
