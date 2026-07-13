# Exploding Dinos todo's

Doel: alleen open werk bijhouden. Afgeronde kaart-, artwork- en persona-taken staan niet meer in deze lijst; de huidige kaartregels staan in `README.md` en `src/cards.js`.

## Volgende prioriteit

- [ ] Breid de geautomatiseerde tests uit voordat de game online gaat.
  - Kritieke flows: nieuw spel, kaart trekken, kaartdetail openen/sluiten, catalogus openen, eindscherm tonen.
  - Kritieke regels: `Meteorietinslag` met/zonder `Schuilgrot`, `Raptor Aanval`, `Gerichte Raptorjacht`, `Brul Terug`, paarbeloningen en beurtstapeling.
- [ ] Maak de spelregels beter testbaar door pure logica uit `game.js` te halen.
  - Begin met deck/setup, beurtwissel, meteoriet-afhandeling en aanval-afhandeling.
  - Maak randomness injecteerbaar, zodat pc-keuzes en deckvolgorde deterministisch getest kunnen worden.
- [ ] Voeg een kleine echte-browser testlaag toe voor mobiel en desktop.
  - Minimaal: startscherm, handkaarten, reveal-overlay, catalogus, eindscherm.
  - Gebruik bij voorkeur Playwright zodra de basisregels met unit tests stabiel zijn.
- [ ] Publiceer pas daarna via GitHub Pages.
  - Repo moet publiek zijn voor gratis GitHub Pages met GitHub Free.
  - Controleer voor publicatie dat alle assets via relatieve paden laden.
  - Test de gepubliceerde URL op telefoonformaat.

## Gameplay en balans

- [ ] Speel meerdere potjes met 2, 3, 4 en 5 spelers en noteer waar potjes te kort, te lang of te willekeurig voelen.
- [ ] Doe een balansronde op aantallen voor `Meteorietinslag`, `Schuilgrot`, aanvallen, `Brul Terug` en soortkaarten.
- [ ] Check of pc-spelers niet te vaak nutteloze acties spelen vlak voor een ongevaarlijke trek.
- [ ] Overweeg moeilijkheidsgraden voor pc-spelers nadat de basisbalans goed voelt.

## Kaarten en presentatie

- [ ] Bereid later extra illustratievarianten voor veelvoorkomende soortkaarten voor.
- [ ] Check kaartleesbaarheid op telefoon: handkaarten, reveal-kaarten, catalogus en doelwitkeuzes.
- [ ] Voeg kleine animatie-polish toe waar het spelverloop er duidelijker van wordt, bijvoorbeeld trekken, afleggen en meteorietmomenten.
- [ ] Overweeg later extra kaarttypes of set-combo's, pas na balans en testdekking.

## Release-checklist

- [ ] `npm test` draait groen.
- [ ] Browser-smoke-test zonder console errors op de lokale `index.html`.
- [ ] Mobiele handtest op telefoonformaat.
- [ ] README bevat actuele start-, test- en publicatie-instructies.
- [ ] GitHub Pages staat pas aan wanneer bovenstaande checks klaar zijn.
