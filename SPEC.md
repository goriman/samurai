## Goal
Build a playable retro 2D action-survivor prototype with a black background and orange-only pixel/line rendering. The core loop is movement, enemy spawning, automatic katana attacks, enemy defeat, experience collection, level up, and katana growth that changes both visuals and hit detection.

## Non-goals
- Polished art, animation, full music production, menus, save data, or balancing.
- Polished elemental balancing or multi-color elemental art.

## Scope / Impacted Areas
- New browser-based single-screen prototype.
- Canvas rendering, input, game loop, player, katana, enemies, spawner, XP orbs, items, HUD, and lightweight generated SE.

## Design / Architecture
- `GameState` owns entities, timing, collision, level progression, elemental hit resolution, tornado updates, and reset.
- `Player` owns movement, HP, fixed katana damage, knockback power, attack interval, direction, healing, movement speed, and collected elemental levels.
- `Katana` owns automatic swing timing, nearest-enemy opening angle, visible blade dimensions, katana-shaped blade drawing, full 360-degree spin animation, and blade-position hitbox checks.
- `AttackArea` is the shared katana swing hitbox data used by enemy damage, absorb pickup checks, hit effects, elemental effects, and optional debug visualization.
- `Enemy` uses type definitions so new enemies can be added by extending data.
- Non-boss enemies receive a lightweight `enemyLevel` and `tier` profile from player level. Tiers alter visuals, movement, attack cadence, rewards, and weakness interactions without making enemies simply hard.
- `EnemySpawner` chooses enemy types and spawn positions.
- `ExperienceOrb` and `Item` are separate collectable entities.
- `UI` draws only player HP and elemental attribute state in a fixed top status area using graphic bars/icons rather than debug-like stat text.
- `GameState.playArea` defines the gameplay rectangle below the top UI area and is shared by player bounds, enemy spawns, boss spawns, wall collision, background grid drawing, and gameplay clipping.
- `COLORS` and `ATTRIBUTE_COLORS` centralize the base black/orange/dim-orange palette plus effect-only elemental colors.
- `SfxManager` owns Web Audio setup, generated chiptune-style SE playback, volume balance, pitch variation, short cooldowns, same-frame event aggregation, simultaneous voice limits, hit/kill/attribute/dismember/wall/absorb cues, mute foundation, and future BGM extension points.
- `EffectManager` owns pooled particles and burst effects for hits, defeat splashes, XP pickup, level-up rings, and combo feedback with quality constants and hard caps for performance.
- `ScreenShake` owns short, decaying camera shake for kills, combo kills, boss kills, and level ups.
- `ComboManager` tracks short-window kill chains and exposes combo strength for SE pitch, particles, screen shake, and temporary combo text.
- `AttributeManager` owns Fire, Ice, Thunder, Wind, and Absorb levels, Lv5 milestone names, absorb scaling, and milestone checks used by combat effects.
- `DropManager` owns enemy loot resolution, keeping XP orb drops separate from attribute and consumable bonus rewards.
- `BloodCanvasGoal` owns the background-cell clear objective: it picks one high-resolution pixel-art preset at run start, maps the preset to small subcells inside the play area grid, tracks monster-blood fill progress per target subcell, and reports completion.
- Blood-shape presets are split into safe built-in placeholders and an empty licensed-preset extension point so confirmed character art can be added later without changing the goal system.
- `BloodManager` owns short-lived kill blood trails and stray splats, capped separately from permanent cell fill state.
- `runStats` on `GameState` tracks elapsed time, kills, total damage, criticals, pickups, boss kills, and clear results for the Japanese result screen.
- `CriticalSystem` rolls katana critical hits and produces critical damage, knockback, and dismemberment bonuses.
- `DamageResult` carries amount, critical state, killing blow state, dismemberment state, hit position/direction, source type, and attribute type to downstream effects.
- Boss line attacks use a lightweight warning queue so the preview line and the later damage line share the same start, direction, length, and width.

## UI/UX
- WASD and arrow keys move the player.
- HUD shows only HP and elemental state during normal play.
- Game over message appears when HP reaches zero, with `R` to restart.
- Clearing the selected background-cell blood artwork shows a result screen with Japanese play results and `R` to restart.
- Clearing the selected background-cell blood artwork first enters a short appreciation state so the completed motif remains visible before the result screen is shown.

## Acceptance Criteria
- Black background with orange-only retro rendering and a dim orange grid/UI support color.
- Player can move.
- Enemies continuously spawn.
- Around 10 regular enemy types appear, plus escalating level bosses.
- Non-boss enemies use level bands: Lv1-4 basic, Lv5-9 reinforced, Lv10-14 mutated, Lv15-19 elite, and Lv20+ dangerous.
- Non-boss level bands change visible parts, movement, attack behavior, reward value, and break/attribute counterplay while keeping HP scaling modest.
- Farmers stay easy to clear but gain group spread, short charges, and better XP at higher tiers.
- Spear enemies gain warning thrusts, spacing behavior, longer reach, and strong weapon-break counterplay.
- Sword enemies gain wind-up slashes, side steps, and occasional double cuts at higher tiers, while weapon/head breaks heavily weaken them.
- Archer enemies apply ranged pressure, keep distance, strafe, and gain warning shots and limited double shots at higher tiers.
- Rare shuriken/ninja enemies remain high-value targets, gain escape/throw behavior at higher tiers, and improve bonus drop expectations.
- Rare blinking ninja enemies appear and drop a random elemental item when defeated.
- Enemies have type-specific knockback resistance: farmers and scouts launch easily, spear/sword/monk enemies resist slightly, shield/armored/brute enemies resist heavily, and mid-bosses resist the most.
- Enemies have type-specific movement speed: scouts and blinking ninjas are very fast, farmers and sword enemies are quick, spear/shield/monk enemies are medium speed, and armored/brute/mid-boss enemies are slower but still press forward.
- Armored enemies have high HP, slow movement, and heavy knockback resistance.
- Mid-bosses periodically spawn as either spear-and-sword rush bosses or twin-bow ranged bosses with high HP and high XP value.
- A vicious level boss spawns at every level multiple of 10.
- Level bosses step up by rank at LV10, LV20, LV30, and so on, gaining more HP, damage, speed, size, attack range, XP value, and knockback resistance.
- Player auto-starts a full 360-degree spinning katana attack, always opening from the right side.
- When not attacking, the full katana remains visible on the player's right side.
- A new katana attack cannot begin until the current full rotation is complete.
- Katana hits damage only enemies touched by the currently rotating blade position.
- Katana swing checks use a shared swept AttackArea so visible slash coverage, damage checks, and absorb checks stay aligned.
- Katana trail, impact slash, blade tip ornament, absorb checks, and debug rendering must not extend beyond the shared AttackArea.
- Katana rendering reads as a sword rather than a blunt block, with wrapped grip, guard, curved blade body, spine, cutting edge, tip, and sweeping afterimage.
- Katana hits produce a visible slash impact effect.
- Player and enemies have readable retro animations: idle bobbing, walking legs, arm motion, weapon motion, heavy armored steps, boss weapon sway, and blinking ninja afterimages.
- Defeated enemies drop XP orbs.
- If an enemy touches an XP orb before the player collects it, the enemy consumes it and powers up.
- Powered-up enemies gain HP, damage, speed, slight size, and a visible orange power frame.
- Rare speed items can drop and increase player movement speed.
- Fire elemental items add damage-over-time on katana hit.
- Ice elemental items slow enemies on katana hit.
- Lightning elemental items chain damage to nearby enemies on katana hit.
- Wind elemental items spawn tornadoes that pull enemies in and fling them away.
- Absorb elemental items let katana swings mark a limited number of XP orbs and items inside the blade path for fast pull-in collection.
- Absorb uses the same AttackArea as enemy damage and respects the per-swing absorb limit.
- Consumable items are immediate-use pickups separate from healing and attribute items.
- `collectAllExp` marks all active XP orbs as absorbed so they stream into the player and use the normal XP/level-up path.
- `damageAllEnemies` applies capped screen-wide damage through normal enemy damage/death/drop handling.
- Elemental effects are represented with orange-only retro effects.
- XP orbs are collected automatically when nearby.
- XP threshold triggers level up.
- XP requirements are tuned for fast prototype growth, especially in the early game.
- Healing and movement-speed items are rare normal drops.
- Level up usually increases katana power; attack speed upgrades are rare.
- Attack speed upgrades shorten the attack interval and add visible blade-height growth so the faster attack also feels visually stronger.
- Attack power upgrades do not increase damage; they randomly choose either long-blade growth or thick-blade growth.
- Long-blade growth increases katana length, hitbox reach, and pierce limit.
- Thick-blade growth increases visible blade thickness, hitbox width, and enemy knockback.
- Katana growth is visually exaggerated by larger overall blade length and width, while the line weight stays thin.
- Normal HUD shows only a segmented graphical health bar, graphical elemental icons for Fire, Ice, Thunder, Wind, and Absorb, and a graphical enemy-threat mark.
- HP is shown without persistent `HP`, `LIFE`, or Japanese health text labels.
- Health uses only a simple segmented horizontal bar: filled segments are orange, empty segments are black inside dim-orange separators and border.
- The current non-boss enemy tier is shown as a staged threat mark that changes shape from basic to dangerous tiers without numeric `Lv` or `Tier` text.
- Fire, Wind, and Absorb icons must be clearly distinguishable: fire reads as a flame, wind as a stacked tornado, and absorb as abstract tentacle arms around a core.
- Additional colors are allowed only for attribute effects, attribute item pickup accents, and small acquired-attribute UI icon accents.
- Fire effects use muted red-orange/yellow-orange sparks, Ice uses short cyan crystal lines, Thunder uses short yellow zigzags, Wind uses green flowing lines, and Absorb uses purple inward pull lines.
- Elemental color effects must remain short-lived, small-area, and capped by existing particle/burst limits so the orange retro look remains dominant.
- Attribute status glyphs and attribute drop items use a single attribute color for the glyph/body, sharing the same glyph drawing helper so UI and drops remain visually aligned.
- Wind glyphs use a stacked tornado silhouette, while Absorb glyphs use abstract tentacle arms extending from a core.
- Attack power, attack speed, XP, level, critical rate, absorb debug counts, and other internal stats are not shown in normal HUD.
- The top status area is separated from gameplay. Player movement, enemy/boss spawning, wall collision, grid drawing, and gameplay rendering use the lower play area and do not overlap the UI area.
- The background grid uses the dim orange support color so it reads behind characters, items, and attack effects.
- At run start, one of at least eight faint high-resolution background-cell artwork presets is selected and centered in the grid. Enemy kills add blood progress to nearby target cells, and all target cells filled triggers game clear.
- Built-in blood motifs use safe original retro silhouettes rather than exact unlicensed existing-IP character copies.
- Blood motif presets live in `src/blood-presets.js` and are exposed as `window.BLOOD_GOAL_PRESETS`, so artwork can be swapped without editing the game loop. The active built-in set is twelve non-character 3-tone art presets (`M` main, `S` shadow, `A/H` accent, `O` outline) with per-preset dimensions instead of fixed 24x24 character sprites.
- Clear-target cells are cell-based, unfinished cells are faint, completed cells are orange/dim-orange filled, and kill splatter never blocks gameplay logic.
- Blood rendering uses restrained dark monster-green colors that stay distinct from the bright wind attribute green; unrelated blood splats are short-lived and never permanently stain non-target cells.
- Goal subcells require multiple blood units to finish, use dark green staged fill with no orange during partial/completed states, and preserve the large dim-orange background grid behind them.
- Built-in safe presets use at least 24-row high-resolution string patterns and 8px goal subcells, giving a 4x finer goal grid than the previous 32px subcell implementation.
- Blood motifs separate logical preset resolution from render scale. The render cell size is recalculated on resize against the play area, targeting about 78% width, 86% height, and a large background-art footprint while staying inside padding. Stained cells use three monster-blood intensity levels so finished motifs read as dimensional 8-bit art instead of a flat single-color fill.
- Runtime UI keeps HP as a segmented unlabeled bar with exact segment boundaries, shows enemy force as monster-face stamps where one small face represents 10 levels and one brutal face represents 50 levels, and uses a non-shaking game-over/result overlay.
- After a motif is completed, the game enters an appreciation and choice flow. The player can either end the run and view results or inherit the current build into a new random motif while resetting only motif/blood/transient battlefield state.
- Performance Phase 1 keeps behavior unchanged while reducing Canvas work: DPR is capped to a pixel-art render scale, the static background grid is cached, and the blood artwork layer redraws only when motif cells change. Broad spatial partitioning and module splitting are deferred.
- Performance Phase 1 follow-up reduces low-risk runtime overhead without changing game rules: hot range checks use squared distance where no normalized direction is needed, per-frame removal loops compact arrays in place instead of repeated `splice`/`filter`, offscreen gameplay objects skip draw work, active katana attack area is cached per frame, and blood-art warning/pulse redraws are throttled rather than redrawn every frame.
- Performance Phase 2-1 introduces an enemy-only spatial grid with conservative query radii. Katana hits, tornado pushes, and lightning chain target search use nearby enemy candidates while preserving the existing final hit/range checks. XP-orb absorption, item search, enemy AI cadence, and sprite caching remain deferred.
- Performance Phase 2-2 reuses the enemy spatial grid for enemy XP-orb absorption, replacing the orb-by-all-enemies scan with nearby enemy candidates while preserving the same final overlap condition and XP power-up behavior.
- Performance Phase 2-3 applies the enemy spatial grid to short-range elemental area effects such as fire splash and wind slash. The grid only narrows candidates; final distance or segment checks remain unchanged.
- Performance Phase 2-4 adds a lightweight collectible spatial grid for katana absorb candidate lookup. It registers current orbs and items before player attack logic and preserves existing absorb priorities, final attack-area overlap checks, and pickup behavior.
- Performance Phase 2-5 reduces remaining logic churn by adding allocation-free spatial-grid iteration, using bounded top-candidate retention for absorb selection instead of full sort/slice, applying the enemy grid to critical-kill explosion splash, and consolidating enemy player-distance/direction calculation to one square root per enemy update.
- Mobile input uses Pointer Events on the canvas. Keyboard WASD remains primary on desktop, while touch/pointer taps set a world-space move target that persists until reached. Clear-choice UI hit rectangles are tappable through the same pointer path.
- Combo chains grant a capped blood bonus when they naturally time out. The bonus starts at 5 hits, is calculated by a shared pure function, and feeds the same blood-goal splatter path without affecting kill counts.
- The clear appreciation state shows `血紋完成`, the completed motif, and a short delay before the result prompt. The result screen shows the completed motif name, elapsed time, defeated enemy count, reached level, and restart prompt in Japanese.
- Normal player-facing text is Japanese; English is allowed only for internal keys or debug-only overlays.
- Code is separated enough to add enemies, items, and bosses later.
- Katana swing, katana hit, enemy defeat, XP pickup, level up, player damage, and item pickup play short generated SE.
- Hit and defeat SE use short cooldowns so multi-hit and mass-kill situations do not stack every sound.
- XP pickup SE supports rapid collection with a rising pitch combo while staying voice-limited.
- Overall SE volume is balanced so level-up and damage are clearest, defeat/hit are moderate, and swing/XP remain quieter.
- Enemy hits produce stronger sparks, short slash lines, hit particles, brief hitstop, and visible knockback feedback.
- Enemy deaths produce orange-only splash particles, directional spray, fragments, a brief explosion burst, a lingering slash afterimage, and stronger kill SE.
- Katana hits can critically strike. Critical hits deal more damage, knock back harder, increase dismemberment chance, play a distinct SE, and use a larger hit spark.
- Kill explosions occur only when the killing blow was critical; normal kills use smaller collapse particles and normal kill SE.
- Critical kill explosions also apply capped, small-area splash damage and knockback to nearby enemies without causing chain explosions.
- Dismemberment emits a short-lived orange part chunk, splash line, particles, body flash, and dismember SE while preserving movement/attack weakening.
- Enemies and bosses can break head, body, arm, leg, and available weapon parts. Head breaks reduce tracking/attack reliability, body breaks increase incoming damage, and weapon breaks reduce attack range, frequency, or damage.
- Dismemberment and breakage use part-specific effects: upward head fragments, central body cracks, limb chunks, and metallic weapon fragments.
- Boss attacks show a short orange-only warning before damage, and the warning range must match the later damage range.
- Spear-and-sword mid-bosses pressure at close/mid range with charge thrusts and follow-up slashes, while twin-bow mid-bosses keep distance, strafe, retreat, and fire double/fan line shots.
- Level bosses have active attacks beyond contact damage. Higher ranks gain stronger warning line attacks, dash behavior, strafe movement, multi-direction attacks, phase-shortened cooldowns, and more distinct silhouettes.
- Boss HP phases alter behavior: lower HP shortens attack cooldowns, adds follow-up attacks, increases shot count, and adds more intense visual states within effect caps.
- Short-window multi-kills increase combo count, pitch up the defeat SE, add particles, strengthen screen shake, and show temporary combo text.
- Level up plays a stronger fanfare, shows a central growth notice, creates expanding rings around the player, and shakes the screen briefly.
- XP collection creates small pickup particles and retains a rising pickup tone for rapid collection.
- Hit, kill, and XP sounds aggregate same-frame events into stronger single cues instead of playing one sound for every event.
- Effect particles are pooled, have an upper bound, expire reliably, and avoid per-kill array shifting or large object churn.
- Burst effects are pooled with a fixed cap, and legacy effect arrays are trimmed to avoid long-lived buildup.
- `DEBUG_ATTACK_AREA` can be enabled in code to visualize katana hit segments, enemy/item bounds, hit count, absorb candidates, absorbed count, and absorb level.
- `EFFECT_QUALITY` exposes particle and shake tuning for lower-spec environments.
- Farmer, spear, and sword enemies can lose left/right arms and legs on damage, wall impact, or shatter-like elemental hits.
- Missing legs reduce enemy movement; missing arms reduce enemy attack output, with weapon-side arm loss weakening spear and sword enemies further.
- Strong knockback can slam enemies into screen edges, dealing impact damage, playing wall SE, spawning impact effects, causing high-chance dismemberment, and bouncing survivors back.
- Fire Lv5/Lv10/Lv15/Lv20 milestones add spark splash, stronger burn, kill burst support, and fire-pillar-style hit effects.
- Ice Lv5/Lv10/Lv15/Lv20 milestones add stronger slow, freeze, shatter damage/dismember chance, and ice-blade-style hit feedback.
- Thunder Lv5/Lv10/Lv15/Lv20 milestones add stun, extra chain capacity, thunderclap feedback, and bolt-style extra hits.
- Wind Lv5/Lv10/Lv15/Lv20 milestones add stronger knockback, tornado/whirl support, stronger wall impact synergy, and tornado-slash push effects.
- Absorb Lv5/Lv10/Lv15/Lv20 milestones add better item priority, chain absorb, hit-triggered collect, and occasional wider vortex-style absorption.
- Mid-bosses always drop XP and have a rare separate bonus roll for one attribute or consumable item.
- Level bosses always drop XP and two separate bonus rewards, each randomly chosen from attribute or consumable items and offset so they do not overlap.

## Validation Plan
- Run JavaScript syntax check.
- Open the page in a browser or headless browser and confirm the canvas renders.
- Use short manual play verification for movement, spawning, attacks, XP, and HUD.

## Open Questions
- Exact balancing values are not specified; use prototype defaults.

## Risks / Rollout
- Browser-only prototype; no package manager or build step.
- Balancing is intentionally rough and should be tuned after playtesting.
