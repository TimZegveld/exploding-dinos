# Exploding Dinos

Een eerste speelbare browser-MVP voor een Nederlandse dino-kaartgame geinspireerd door snelle push-your-luck kaartspellen. De kaartbasis volgt nu de Party Pack-structuur: 120 kaarten totaal, met een compacte dino-pootafdruk set voor 2-3 spelers.

## Starten

Open `index.html` in je browser. Er is geen build-step nodig.

## Regels in deze iteratie

- Jij speelt tegen de pc.
- Trek je een `Meteorietinslag` zonder `Schuilgrot`, dan verlies je.
- Een `Schuilgrot` wordt automatisch gebruikt en stopt de meteoriet terug in de trekstapel.
- Actiekaarten kun je voor het trekken spelen.
- Bij 2 spelers gebruikt de game alleen de dino-pootafdruk kaarten en 1 `Meteorietinslag`.
- Trek een kaart om je beurt te eindigen. De kaart verschijnt eerst groot in beeld; klik daarna nog een keer om hem aan je hand toe te voegen.
- Gespeelde kaarten verschijnen eerst groot in beeld. Het effect gaat pas door nadat je klikt.
- Gestolen kaarten verschijnen ook groot in beeld voordat ze in de nieuwe hand verdwijnen.
- Trekt iemand een `Meteorietinslag`, dan schudt de kaart zichtbaar. Met `Schuilgrot` kiest de speler geheim waar de meteoriet teruggaat in de stapel.

## Kaarten

- `Meteorietinslag` x9 totaal: gevaarlijke kaart.
- `Schuilgrot` x10 totaal: verdediging tegen de meteoriet.
- `Raptor Aanval` x5 totaal: volgende speler neemt 2 beurten.
- `Gerichte Raptorjacht` x5 totaal: kies wie 2 beurten krijgt.
- `Dino Sprint` x10 totaal: sla je beurt over.
- `Triceratops Blik` x6 totaal: bekijk de bovenste drie kaarten.
- `Tijdlijn Kneden` x6 totaal: bekijk en herschik de bovenste drie kaarten.
- `Vulkaan Shuffle` x6 totaal: schud de trekstapel.
- `Diep Graven` x7 totaal: trek de onderste kaart.
- `Fossielgraaier` x6 totaal: steel een willekeurige kaart.
- `Brul Terug` x9 totaal: blokkeer een actie.
- `Wilde Dino` x6 totaal: joker voor soortkaarten.
- Dino-soortkaarten x35 totaal: speel paren om te stelen.

## Mogelijke volgende iteraties

- Betere kaartbalans en meer kaarttypes.
- Local co-op tegen een rampage-deck.
- Animaties en eigen kaartillustraties.
- Moeilijkheidsgraden voor de pc.
- Set-combo's voor `Dino Snack`.
