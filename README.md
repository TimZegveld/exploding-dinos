# Exploding Dinos

Een eerste speelbare browser-MVP voor een Nederlandse dino-kaartgame geinspireerd door snelle push-your-luck kaartspellen. De kaartbasis volgt nu de Party Pack-structuur: 120 kaarten totaal, met een compacte dino-pootafdruk set voor 2-3 spelers.

## Starten

Open `index.html` in je browser. Er is geen build-step nodig.

## Project-skill

Deze repo bevat een projectlokale Codex-skill onder `.codex/skills/exploding-dinos-card-designer/` voor het uitwerken van nieuwe kaartfuncties en kaartdesigns.

## Regels in deze iteratie

- Jij speelt tegen 1 tot 4 benoemde pc-tegenspelers; kies het aantal voor je een nieuw spel start.
- Trek je een `Meteorietinslag` zonder `Schuilgrot`, dan verlies je.
- Een `Schuilgrot` wordt automatisch gebruikt en stopt de meteoriet terug in de trekstapel.
- Je kunt je handkaarten altijd aanklikken om ze te bekijken. In het kaartdetail kun je terug, of spelen als de kaart op dat moment speelbaar is.
- Actiekaarten kun je voor het trekken spelen.
- Bij 2-3 spelers gebruikt de game alleen de dino-pootafdruk kaarten. Vanaf 4 spelers gebruikt de game de standaard Party Pack-selectie.
- Iedere speler heeft een eigen kleuraccent. De gloeiende rand laat zien wie aan de beurt is, een kaart trekt of een kaart speelt.
- Trek een kaart om je beurt te eindigen. De kaart verschijnt eerst groot in beeld; klik daarna nog een keer om hem aan je hand toe te voegen.
- Gespeelde kaarten verschijnen eerst groot in beeld. Het effect gaat pas door nadat je klikt.
- Gestolen kaarten verschijnen ook groot in beeld voordat ze in de nieuwe hand verdwijnen.
- Als iemand jou aanvalt, zie je je hand als reactie-keuze. `Brul Terug` blokkeert de aanval; een eigen raptoraanval schuift de aanval door en stapelt de beurten.
- Trekt iemand een `Meteorietinslag`, dan schudt de kaart zichtbaar. Met `Schuilgrot` kiest de speler geheim waar de meteoriet teruggaat in de stapel; jij kiest daarbij een genummerde positie.

## Kaarten

Statuslegenda:

- Gameplay: `klaar` betekent dat de kaart een eigen flow of bewust vastgelegde basisflow heeft. `basis` betekent speelbaar, maar nog niet uniek genoeg uitgewerkt.
- Design: `klaar` betekent dat de kaart een eigen frontdesign met illustratie in de game heeft.
- Tweak: `klaar` betekent dat het kaartfront ook specifiek is bijgesteld voor hand-, reveal- en miniweergave.

| Type | Kaart | Aantal | Regel in deze iteratie | Gameplay | Design | Tweak |
|---|---:|---:|---|---|---|---|
| `meteor` | Meteorietinslag | 9 | Trek je deze zonder `Schuilgrot`, dan ben je uitgeschakeld. | klaar | te doen | te doen |
| `shelter` | Schuilgrot | 10 | Wordt automatisch gebruikt tegen `Meteorietinslag`; daarna gaat de meteoriet geheim terug in de stapel. | klaar | te doen | te doen |
| `raptor` | Raptor Aanval | 5 | Eindig je beurt; de volgende speler neemt straks 2 beurten. Als reactie op een aanval schuift hij de aanval door. | klaar | te doen | te doen |
| `targetedRaptor` | Gerichte Raptorjacht | 5 | Kies bewust een doelwit voor 2 beurten. In 2 spelers is dat de ander. | klaar | klaar | klaar |
| `sprint` | Dino Sprint | 10 | Sla je beurt over; bij extra beurten raak je 1 extra pending beurt kwijt. | klaar | klaar | klaar |
| `trike` | Triceratops Blik | 6 | Bekijk de bovenste 3 kaarten van de trekstapel. | basis | te doen | te doen |
| `oracle` | Tijdlijn Kneden | 6 | Bekijk de bovenste 3 kaarten en leg ze terug in jouw volgorde. | klaar | klaar | klaar |
| `volcano` | Vulkaan Shuffle | 6 | Schud de trekstapel zichtbaar en bekijk daarna de nieuwe bovenste kaart. | klaar | klaar | klaar |
| `dig` | Diep Graven | 7 | Bekijk de onderste kaart; neem hem, of laat hem liggen en trek blind van boven. | klaar | klaar | klaar |
| `fossil` | Fossielgraaier | 6 | Kies een gesloten kaart van een tegenstander en steel die. | klaar | klaar | klaar |
| `nope` | Brul Terug | 9 | Reageer op een actiekaart van de ander en blokkeer die. | klaar | klaar | klaar |
| `feral` | Wilde Dino | 6 | Joker voor dino-soortkaarten; activeert de beloning van de andere soortkaart in het paar. | basis | te doen | te doen |
| `miniRaptor` | Mini-Raptor | 7 | Soortkaart; speel een paar om een doelwit te kiezen en snel 1 willekeurige kaart te stelen. | klaar | klaar | klaar |
| `stegoSnack` | Stego Snack | 7 | Soortkaart; speel een paar om een kaart te stelen. Unieke paarbeloning staat nog open. | basis | te doen | te doen |
| `brontoBuik` | Bronto Buik | 7 | Soortkaart; speel een paar om een kaart te stelen. Unieke paarbeloning staat nog open. | basis | te doen | te doen |
| `triceraTuk` | Tricera-Tuk | 7 | Soortkaart; speel een paar om een kaart te stelen. Unieke paarbeloning staat nog open. | basis | te doen | te doen |
| `pteroPret` | Ptero Pret | 7 | Soortkaart; speel een paar om een kaart te stelen. Unieke paarbeloning staat nog open. | basis | te doen | te doen |

## Mogelijke volgende iteraties

- Betere kaartbalans en meer kaarttypes.
- Local co-op tegen een rampage-deck.
- Animaties en eigen kaartillustraties.
- Moeilijkheidsgraden voor de pc.
- Set-combo's voor `Dino Snack`.
