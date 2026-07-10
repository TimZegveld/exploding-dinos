---
name: exploding-dinos-card-designer
description: Use when working on the Exploding Dinos browser card game to design or implement one card from the project checklist, including choosing the next card, defining its gameplay function, updating game code/UI/PC behavior, writing a visual design prompt, and applying a user-provided card illustration image as a project asset.
---

# Exploding Dinos Card Designer

Use this skill to move one Exploding Dinos card forward end to end: gameplay first, visual direction second, user-provided artwork third.

## Workflow

1. Read the local project context before deciding:
   - `CARD_PLAYSTYLE_CHECKLIST.md`
   - `CARD_DESIGN_TODO.md`
   - `CARD_DESIGN_PLAN.md`
   - `README.md`
   - relevant code in `game.js`, `styles.css`, and `index.html`

2. Pick one card when the user asks to continue card work.
   - Prefer unchecked items in `CARD_PLAYSTYLE_CHECKLIST.md`.
   - Choose the smallest card that creates meaningful play difference.
   - Default order: unfinished species pair rewards, missing artwork from the 5-card proof set, missing base illustrations, variants/balance.
   - Explain why that card is next before editing.

3. Define the card rule.
   - Specify when it can be played, whether it targets a player/card/deck position, whether it ends the turn, whether `Brul Terug` can block it, and what the PC should do.
   - Keep card text short enough for the in-game card face.
   - Use this compact effect matrix before editing:
     `timing`, `target`, `player choice`, `effect`, `ends turn`, `blocked by Brul Terug`, `PC rule`, `README text`, `card text`.

4. Implement the function in the game.
   - Follow existing state and modal patterns in `game.js`.
   - Add only the UI controls needed for the chosen card.
   - Keep unrelated card behavior unchanged.
   - Update simple PC behavior when the card needs it.
   - Update checklist/README text when rules change.

5. Verify.
   - Prefer the bundled Node executable:
     `C:\Users\Tim\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`
   - Always run:
     `& 'C:\Users\Tim\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --check 'game.js'`
   - Then run the bundled smoke harness when present:
     `& 'C:\Users\Tim\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.codex/skills/exploding-dinos-card-designer/scripts/smoke_dom.js'`
   - Use a browser smoke test only when Playwright is already available in the active tool/runtime. Do not spend time installing dependencies just for this static HTML app unless the user asks.
   - If a browser test is blocked by sandbox/profile/module-path issues, use the bundled smoke harness instead. It loads `game.js` and verifies startup, event binding, and modal references.
   - Report any test that could not be completed.

6. Create the visual prompt.
   - Use `references/card-art-prompts.md` for prompt structure.
   - Prompt for illustration only: no card title, no effect text, no logo, no watermark.
   - Reserve title/effect/icon rendering for game HTML/CSS.

7. Apply user-provided artwork.
   - Use only a newly uploaded/attached image that is intended for the selected card; never reuse an image that already exists in the repo as a shortcut.
   - Before copying, compare filename, byte size, and SHA-256 hash against existing `assets/cards/illustrations/` images when practical; if it matches an existing card, stop and ask for the correct image.
   - Copy only the selected image into `assets/cards/illustrations/`; do not commit `.codex-remote-attachments/`.
   - Use descriptive filenames such as `oracle-timeline.jpg`.
   - Update `cardCatalog[type].design.image`.
   - Add or update `cardCatalog[type].design.tone` and a CSS tone block when the card needs its own color/crop.
   - Tune CSS `object-position` for hand card, reveal card, and mini-card states.
   - After the design process, remove uploaded attachment files from `.codex-remote-attachments/` so they cannot be accidentally reused later.
   - Keep previous generated/source assets unless the user explicitly asks to remove them.

8. Update project documentation before calling the card finished.
   - Update `README.md` whenever a card's gameplay, design, or visual tweak status changes.
   - Keep the card table status aligned with `CARD_PLAYSTYLE_CHECKLIST.md`, `CARD_DESIGN_TODO.md`, current `cardCatalog` design metadata, and available assets.
   - Mark `Gameplay` as `klaar` only when the rule, UI flow, and PC behavior are implemented or consciously unchanged.
   - Mark `Design` as `klaar` only when `cardCatalog[type].design.image` points to an existing asset.
   - Mark `Tweak` as `klaar` only when CSS/readability has been checked for hand, reveal, and mini-card contexts.
   - Update checklist files when their task status changed during the work.

9. Commit and push only when the user asks.
   - Stage only relevant files.
   - Mention if the user is not fully satisfied with visuals so future iterations are expected.

## Design Defaults

- Art direction: playful prehistoric cartoon, chunky shapes, bold outlines, warm colors, expressive dinosaur character, board-game readability.
- Card UI stays code-rendered: title, icon, effect text, paw marker, borders, and controls.
- Art should be readable at hand-card size, not only in large reveal.
- Prefer one strong representative design per card type before creating variants.

## Useful Output Shape

When presenting a card plan, include:

- Card chosen and reason.
- Rule/effect.
- UI flow.
- PC behavior.
- Files likely to change.
- Art prompt.
- Verification plan.
