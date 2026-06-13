(function () {
  "use strict";

  function makeGrid(width, height) {
    return Array.from({ length: height }, () => Array.from({ length: width }, () => "."));
  }

  function setCell(grid, x, y, mark) {
    if (!grid[y] || x < 0 || x >= grid[y].length) return;
    grid[y][x] = mark;
  }

  function rect(grid, x, y, w, h, mark) {
    for (let yy = y; yy < y + h; yy += 1) {
      for (let xx = x; xx < x + w; xx += 1) setCell(grid, xx, yy, mark);
    }
  }

  function ellipse(grid, cx, cy, rx, ry, mark) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        if (nx * nx + ny * ny <= 1) setCell(grid, x, y, mark);
      }
    }
  }

  function ring(grid, cx, cy, rx, ry, thickness, mark) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
        const outer = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        const inner = ((x - cx) / Math.max(1, rx - thickness)) ** 2 + ((y - cy) / Math.max(1, ry - thickness)) ** 2;
        if (outer <= 1 && inner >= 1) setCell(grid, x, y, mark);
      }
    }
  }

  function line(grid, x1, y1, x2, y2, mark, width = 1) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = Math.round(x1 + (x2 - x1) * t);
      const y = Math.round(y1 + (y2 - y1) * t);
      rect(grid, x - Math.floor(width / 2), y - Math.floor(width / 2), width, width, mark);
    }
  }

  function polyline(grid, points, mark, width = 1) {
    for (let i = 1; i < points.length; i += 1) {
      line(grid, points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], mark, width);
    }
  }

  function mirror(grid) {
    const width = grid[0].length;
    for (let y = 0; y < grid.length; y += 1) {
      for (let x = 0; x < Math.floor(width / 2); x += 1) {
        const v = grid[y][x];
        if (v !== ".") grid[y][width - 1 - x] = v;
      }
    }
  }

  function toPattern(grid) {
    return grid.map((row) => row.join(""));
  }

  function artPreset({ id, nameJa, category, completionEffect, grid }) {
    return {
      id,
      nameJa,
      name: nameJa,
      width: grid[0].length,
      height: grid.length,
      category,
      completionEffect,
      pattern: toPattern(grid)
    };
  }

  function oniMask() {
    const g = makeGrid(31, 31);
    ellipse(g, 15, 16, 11, 12, "S");
    ring(g, 15, 16, 12, 13, 2, "O");
    line(g, 6, 3, 12, 9, "O", 3);
    line(g, 24, 3, 18, 9, "O", 3);
    rect(g, 8, 13, 6, 3, "H");
    rect(g, 17, 13, 6, 3, "H");
    line(g, 7, 11, 13, 10, "M", 2);
    line(g, 23, 11, 17, 10, "M", 2);
    rect(g, 12, 18, 7, 3, "M");
    rect(g, 10, 22, 11, 3, "M");
    rect(g, 11, 25, 2, 3, "H");
    rect(g, 18, 25, 2, 3, "H");
    line(g, 15, 6, 15, 11, "A", 2);
    setCell(g, 14, 5, "A");
    setCell(g, 16, 5, "A");
    return artPreset({ id: "oni-seal", nameJa: "鬼面血紋", category: "mask", completionEffect: "openEyes", grid: g });
  }

  function foxMask() {
    const g = makeGrid(31, 31);
    ellipse(g, 15, 17, 10, 11, "S");
    ring(g, 15, 17, 11, 12, 2, "O");
    line(g, 6, 4, 10, 12, "O", 3);
    line(g, 24, 4, 20, 12, "O", 3);
    line(g, 8, 15, 13, 13, "H", 2);
    line(g, 22, 15, 17, 13, "H", 2);
    line(g, 15, 13, 12, 22, "M", 2);
    line(g, 15, 13, 18, 22, "M", 2);
    rect(g, 13, 23, 5, 2, "A");
    line(g, 9, 19, 5, 22, "M", 2);
    line(g, 21, 19, 25, 22, "M", 2);
    return artPreset({ id: "fox-seal", nameJa: "狐面血紋", category: "mask", completionEffect: "openEyes", grid: g });
  }

  function bloodMoon() {
    const g = makeGrid(31, 31);
    ellipse(g, 15, 15, 11, 11, "S");
    ring(g, 15, 15, 12, 12, 2, "O");
    ellipse(g, 19, 12, 8, 9, ".");
    ring(g, 15, 15, 9, 9, 1, "M");
    line(g, 6, 23, 25, 7, "A", 2);
    line(g, 9, 23, 24, 23, "H", 2);
    rect(g, 13, 4, 4, 3, "H");
    return artPreset({ id: "blood-moon", nameJa: "血月血紋", category: "moon", completionEffect: "bloodMoon", grid: g });
  }

  function brokenBlade() {
    const g = makeGrid(31, 31);
    line(g, 7, 25, 24, 8, "S", 5);
    line(g, 10, 25, 25, 10, "O", 2);
    line(g, 5, 26, 11, 20, "M", 4);
    rect(g, 4, 25, 9, 3, "M");
    line(g, 19, 12, 25, 7, "A", 2);
    line(g, 22, 8, 26, 13, "H", 2);
    line(g, 9, 10, 21, 22, "H", 1);
    return artPreset({ id: "broken-blade", nameJa: "折刀血紋", category: "blade", completionEffect: "slashSeal", grid: g });
  }

  function dragonEye() {
    const g = makeGrid(31, 31);
    ellipse(g, 15, 15, 13, 7, "S");
    ring(g, 15, 15, 14, 8, 2, "O");
    ellipse(g, 15, 15, 5, 5, "M");
    rect(g, 14, 10, 3, 11, "H");
    ring(g, 15, 15, 6, 6, 1, "A");
    line(g, 4, 8, 10, 3, "M", 2);
    line(g, 21, 3, 27, 8, "M", 2);
    line(g, 5, 23, 12, 27, "M", 2);
    line(g, 19, 27, 26, 23, "M", 2);
    return artPreset({ id: "dragon-eye", nameJa: "龍眼血紋", category: "eye", completionEffect: "openEyes", grid: g });
  }

  function marbleEyeRelief() {
    const g = makeGrid(48, 28);
    ellipse(g, 24, 14, 21, 8, "S");
    ring(g, 24, 14, 22, 9, 2, "O");
    ellipse(g, 24, 14, 16, 5, "M");
    line(g, 4, 13, 16, 8, "O", 2);
    line(g, 32, 8, 44, 13, "O", 2);
    line(g, 6, 20, 18, 24, "M", 2);
    line(g, 30, 24, 42, 20, "M", 2);
    ellipse(g, 24, 14, 7, 6, "M");
    ring(g, 24, 14, 8, 7, 1, "A");
    rect(g, 23, 9, 3, 11, "H");
    ellipse(g, 21, 11, 2, 2, "A");
    setCell(g, 27, 17, "A");
    line(g, 10, 7, 20, 5, "S", 2);
    line(g, 28, 5, 38, 7, "S", 2);
    return artPreset({ id: "marble-eye-relief", nameJa: "石膏の片目", category: "sculpture", completionEffect: "openEyes", grid: g });
  }

  function prayerStoneHand() {
    const g = makeGrid(32, 48);
    rect(g, 11, 34, 10, 10, "O");
    rect(g, 13, 34, 7, 9, "M");
    ellipse(g, 16, 28, 10, 9, "S");
    ring(g, 16, 28, 11, 10, 2, "O");
    line(g, 9, 28, 5, 21, "O", 5);
    line(g, 9, 28, 6, 22, "M", 3);
    line(g, 11, 25, 8, 8, "O", 5);
    line(g, 11, 25, 9, 8, "M", 3);
    line(g, 15, 24, 15, 4, "O", 5);
    line(g, 15, 24, 16, 5, "M", 3);
    line(g, 19, 24, 21, 7, "O", 5);
    line(g, 19, 24, 20, 8, "M", 3);
    line(g, 22, 26, 26, 12, "O", 5);
    line(g, 22, 26, 25, 13, "M", 3);
    line(g, 12, 29, 19, 31, "A", 1);
    line(g, 15, 9, 16, 21, "A", 1);
    setCell(g, 8, 8, "H");
    setCell(g, 15, 4, "H");
    setCell(g, 21, 7, "H");
    setCell(g, 26, 12, "H");
    return artPreset({ id: "prayer-stone-hand", nameJa: "祈りの石手", category: "sculpture", completionEffect: "slashSeal", grid: g });
  }

  function silentMouthRelief() {
    const g = makeGrid(48, 28);
    ellipse(g, 24, 14, 19, 7, "S");
    ellipse(g, 24, 12, 17, 4, "M");
    ellipse(g, 24, 18, 15, 4, "M");
    polyline(g, [[6, 14], [14, 10], [21, 12], [24, 10], [27, 12], [34, 10], [42, 14]], "O", 2);
    polyline(g, [[8, 15], [18, 19], [24, 20], [30, 19], [40, 15]], "O", 2);
    line(g, 9, 15, 39, 15, "S", 2);
    line(g, 16, 10, 23, 12, "A", 1);
    line(g, 25, 12, 33, 10, "A", 1);
    rect(g, 21, 15, 6, 2, "H");
    setCell(g, 7, 14, "H");
    setCell(g, 41, 14, "H");
    return artPreset({ id: "silent-mouth-relief", nameJa: "沈黙の口元", category: "sculpture", completionEffect: "openEyes", grid: g });
  }

  function sideProfileRelief() {
    const g = makeGrid(40, 40);
    ellipse(g, 19, 17, 10, 13, "S");
    ring(g, 19, 17, 11, 14, 2, "O");
    ellipse(g, 18, 17, 7, 10, "M");
    polyline(g, [[21, 5], [27, 11], [31, 15], [25, 18], [30, 21], [23, 25], [21, 29]], "O", 3);
    line(g, 18, 29, 15, 38, "O", 4);
    line(g, 22, 29, 28, 38, "M", 3);
    line(g, 11, 10, 10, 25, "S", 4);
    line(g, 14, 8, 21, 4, "S", 3);
    line(g, 24, 11, 28, 14, "A", 1);
    setCell(g, 23, 15, "H");
    line(g, 25, 20, 29, 20, "H", 1);
    return artPreset({ id: "side-profile-relief", nameJa: "横顔の浮彫", category: "sculpture", completionEffect: "openEyes", grid: g });
  }

  function crackedPorcelainMask() {
    const g = makeGrid(32, 48);
    ellipse(g, 15, 24, 11, 18, "S");
    ring(g, 15, 24, 12, 19, 2, "O");
    ellipse(g, 11, 20, 4, 3, "H");
    line(g, 9, 18, 13, 19, "M", 2);
    line(g, 10, 30, 14, 29, "M", 2);
    line(g, 12, 36, 15, 38, "A", 1);
    mirror(g);
    rect(g, 14, 24, 4, 4, "M");
    line(g, 16, 7, 14, 17, "A", 1);
    polyline(g, [[14, 17], [18, 22], [15, 27], [19, 35], [17, 42]], "S", 1);
    setCell(g, 18, 22, "H");
    return artPreset({ id: "cracked-porcelain-mask", nameJa: "亀裂の仮面", category: "mask", completionEffect: "openEyes", grid: g });
  }

  function ancientKeyStillLife() {
    const g = makeGrid(56, 28);
    ring(g, 12, 14, 9, 9, 3, "O");
    ring(g, 12, 14, 5, 5, 1, "A");
    line(g, 20, 14, 43, 14, "O", 5);
    line(g, 20, 14, 43, 14, "M", 3);
    line(g, 21, 12, 39, 12, "A", 1);
    rect(g, 43, 12, 4, 8, "O");
    rect(g, 47, 16, 6, 4, "O");
    rect(g, 44, 14, 3, 4, "M");
    rect(g, 49, 17, 3, 2, "M");
    line(g, 5, 21, 50, 23, "S", 1);
    setCell(g, 12, 6, "H");
    return artPreset({ id: "ancient-key-still-life", nameJa: "古鍵の静物", category: "still-life", completionEffect: "slashSeal", grid: g });
  }

  function pocketWatchStillLife() {
    const g = makeGrid(40, 40);
    ring(g, 20, 22, 14, 14, 3, "O");
    ellipse(g, 20, 22, 11, 11, "S");
    ring(g, 20, 22, 10, 10, 1, "M");
    ring(g, 20, 22, 7, 7, 1, "A");
    rect(g, 17, 4, 6, 5, "O");
    ring(g, 20, 6, 5, 4, 1, "O");
    line(g, 15, 3, 5, 9, "M", 2);
    line(g, 25, 3, 35, 9, "M", 2);
    line(g, 20, 22, 20, 13, "H", 1);
    line(g, 20, 22, 27, 25, "H", 1);
    setCell(g, 20, 11, "A");
    setCell(g, 31, 22, "A");
    setCell(g, 20, 33, "A");
    setCell(g, 9, 22, "A");
    line(g, 11, 13, 17, 10, "A", 1);
    return artPreset({ id: "pocket-watch-still-life", nameJa: "懐中時計", category: "still-life", completionEffect: "bloodMoon", grid: g });
  }

  function squareLantern() {
    const g = makeGrid(32, 48);
    ring(g, 16, 8, 8, 5, 1, "O");
    rect(g, 9, 12, 14, 4, "O");
    rect(g, 7, 16, 18, 24, "O");
    rect(g, 10, 18, 12, 19, "S");
    rect(g, 13, 20, 6, 14, "H");
    ellipse(g, 16, 27, 7, 10, "A");
    rect(g, 8, 38, 16, 4, "O");
    line(g, 8, 16, 24, 40, "M", 1);
    line(g, 24, 16, 8, 40, "M", 1);
    line(g, 5, 44, 27, 44, "S", 2);
    return artPreset({ id: "square-lantern", nameJa: "角灯", category: "still-life", completionEffect: "bloodMoon", grid: g });
  }

  function threeFlameCandelabrum() {
    const g = makeGrid(40, 56);
    rect(g, 18, 20, 4, 24, "O");
    rect(g, 19, 20, 2, 24, "M");
    line(g, 20, 30, 9, 23, "O", 3);
    line(g, 20, 30, 31, 23, "O", 3);
    rect(g, 7, 18, 5, 14, "O");
    rect(g, 18, 12, 4, 18, "O");
    rect(g, 28, 18, 5, 14, "O");
    rect(g, 8, 19, 3, 12, "M");
    rect(g, 19, 13, 2, 16, "M");
    rect(g, 29, 19, 3, 12, "M");
    ellipse(g, 9, 14, 3, 5, "H");
    ellipse(g, 20, 8, 3, 5, "H");
    ellipse(g, 30, 14, 3, 5, "H");
    ellipse(g, 9, 15, 2, 3, "A");
    ellipse(g, 20, 9, 2, 3, "A");
    ellipse(g, 30, 15, 2, 3, "A");
    ring(g, 20, 45, 10, 5, 2, "O");
    rect(g, 10, 48, 20, 4, "M");
    line(g, 6, 53, 34, 53, "S", 2);
    return artPreset({ id: "three-flame-candelabrum", nameJa: "三灯燭台", category: "still-life", completionEffect: "bloodMoon", grid: g });
  }

  function ritualDagger() {
    const g = makeGrid(28, 64);
    line(g, 14, 3, 7, 36, "O", 2);
    line(g, 14, 3, 21, 36, "O", 2);
    line(g, 14, 5, 14, 38, "M", 5);
    line(g, 10, 10, 11, 35, "S", 2);
    line(g, 18, 9, 17, 34, "A", 1);
    line(g, 14, 8, 14, 34, "H", 1);
    rect(g, 5, 39, 18, 4, "O");
    rect(g, 8, 40, 12, 2, "M");
    rect(g, 11, 43, 6, 15, "O");
    rect(g, 12, 44, 4, 13, "M");
    ring(g, 14, 58, 6, 4, 2, "O");
    setCell(g, 14, 3, "H");
    line(g, 7, 61, 21, 61, "S", 1);
    return artPreset({ id: "ritual-dagger", nameJa: "儀式短刀", category: "blade", completionEffect: "slashSeal", grid: g });
  }

  function moonlitTown() {
    const g = makeGrid(64, 36);
    ellipse(g, 50, 8, 6, 6, "A");
    ellipse(g, 53, 7, 5, 6, ".");
    ring(g, 50, 8, 6, 6, 1, "H");
    line(g, 0, 28, 63, 28, "O", 2);
    rect(g, 5, 19, 8, 10, "S");
    rect(g, 15, 15, 7, 14, "S");
    rect(g, 25, 22, 10, 7, "S");
    rect(g, 38, 17, 8, 12, "S");
    rect(g, 50, 20, 9, 9, "S");
    line(g, 5, 19, 9, 15, "O", 2);
    line(g, 9, 15, 13, 19, "O", 2);
    line(g, 15, 15, 21, 11, "O", 2);
    line(g, 21, 11, 22, 15, "O", 2);
    line(g, 38, 17, 46, 13, "O", 2);
    line(g, 50, 20, 58, 16, "O", 2);
    for (let x = 7; x <= 56; x += 6) {
      setCell(g, x, 23, "H");
      setCell(g, x + 1, 26, "A");
    }
    line(g, 25, 35, 35, 29, "M", 1);
    line(g, 39, 35, 35, 29, "M", 1);
    line(g, 0, 34, 63, 34, "S", 2);
    return artPreset({ id: "moonlit-town", nameJa: "月夜の街", category: "landscape", completionEffect: "bloodMoon", grid: g });
  }

  function mountainCloudSea() {
    const g = makeGrid(64, 36);
    line(g, 1, 30, 18, 10, "O", 2);
    line(g, 18, 10, 35, 30, "O", 2);
    line(g, 23, 30, 38, 7, "O", 2);
    line(g, 38, 7, 62, 30, "O", 2);
    line(g, 18, 12, 13, 23, "S", 3);
    line(g, 38, 9, 32, 25, "S", 3);
    line(g, 18, 10, 22, 17, "A", 1);
    line(g, 38, 7, 44, 17, "A", 1);
    line(g, 0, 30, 63, 30, "M", 2);
    ellipse(g, 11, 26, 10, 3, "A");
    ellipse(g, 27, 27, 13, 4, "A");
    ellipse(g, 46, 26, 15, 4, "A");
    ellipse(g, 56, 29, 8, 3, "H");
    line(g, 6, 34, 58, 34, "S", 2);
    return artPreset({ id: "mountain-cloud-sea", nameJa: "山と雲海", category: "landscape", completionEffect: "bloodMoon", grid: g });
  }

  function deepForestPath() {
    const g = makeGrid(64, 36);
    for (let x = 4; x <= 58; x += 9) {
      rect(g, x, 8 + (x % 3), 3, 22, "O");
      rect(g, x + 1, 10 + (x % 3), 1, 20, "S");
      ellipse(g, x + 1, 8 + (x % 3), 8, 5, "M");
    }
    for (let x = 10; x <= 54; x += 11) {
      rect(g, x, 14, 2, 16, "S");
      ellipse(g, x + 1, 12, 6, 4, "O");
    }
    line(g, 28, 35, 31, 22, "M", 2);
    line(g, 36, 35, 33, 22, "M", 2);
    line(g, 31, 22, 33, 22, "H", 1);
    setCell(g, 21, 18, "H");
    setCell(g, 42, 16, "H");
    setCell(g, 50, 23, "A");
    line(g, 0, 32, 63, 32, "S", 2);
    return artPreset({ id: "deep-forest-path", nameJa: "深森の道", category: "landscape", completionEffect: "bloodMoon", grid: g });
  }

  function toriiCrescentMoon() {
    const g = makeGrid(48, 40);
    ellipse(g, 35, 9, 7, 7, "A");
    ellipse(g, 38, 8, 5, 7, ".");
    rect(g, 10, 16, 28, 4, "O");
    rect(g, 7, 20, 34, 3, "M");
    rect(g, 14, 22, 5, 14, "O");
    rect(g, 29, 22, 5, 14, "O");
    rect(g, 16, 23, 2, 13, "S");
    rect(g, 30, 23, 2, 13, "S");
    rect(g, 19, 24, 10, 3, "O");
    line(g, 8, 36, 40, 36, "S", 2);
    line(g, 18, 39, 22, 31, "M", 1);
    line(g, 30, 39, 26, 31, "M", 1);
    setCell(g, 35, 4, "H");
    return artPreset({ id: "torii-crescent-moon", nameJa: "鳥居と欠月", category: "landscape", completionEffect: "bloodMoon", grid: g });
  }

  function ruinedCastleVista() {
    const g = makeGrid(64, 36);
    ellipse(g, 53, 7, 5, 5, "A");
    rect(g, 6, 22, 52, 8, "S");
    rect(g, 11, 15, 9, 15, "S");
    rect(g, 40, 13, 10, 17, "S");
    rect(g, 13, 13, 5, 3, "O");
    rect(g, 42, 11, 6, 3, "O");
    line(g, 5, 22, 15, 17, "O", 2);
    line(g, 26, 22, 35, 18, "O", 2);
    line(g, 49, 22, 58, 18, "O", 2);
    rect(g, 16, 24, 5, 6, ".");
    ring(g, 18, 28, 3, 5, 1, "O");
    rect(g, 43, 18, 4, 5, "H");
    setCell(g, 13, 20, "H");
    setCell(g, 47, 25, "A");
    line(g, 0, 31, 63, 31, "M", 2);
    line(g, 0, 35, 63, 35, "S", 2);
    return artPreset({ id: "ruined-castle-vista", nameJa: "城跡の遠景", category: "landscape", completionEffect: "bloodMoon", grid: g });
  }

  function skullRelief() {
    const g = makeGrid(40, 40);
    ellipse(g, 19, 17, 13, 14, "S");
    ring(g, 19, 17, 14, 15, 2, "O");
    rect(g, 12, 28, 15, 7, "O");
    rect(g, 14, 29, 11, 5, "M");
    ellipse(g, 14, 17, 5, 5, "S");
    ring(g, 14, 17, 5, 5, 1, "O");
    line(g, 12, 25, 16, 23, "M", 2);
    mirror(g);
    polyline(g, [[19, 19], [16, 25], [22, 25], [19, 19]], "S", 2);
    for (let x = 14; x <= 24; x += 3) rect(g, x, 31, 1, 5, "H");
    rect(g, 18, 27, 3, 2, "A");
    return artPreset({ id: "skull-relief", nameJa: "髑髏浮彫", category: "occult", completionEffect: "openEyes", grid: g });
  }

  function boneHand() {
    const g = makeGrid(32, 48);
    ellipse(g, 16, 31, 7, 6, "S");
    ring(g, 16, 31, 8, 7, 1, "O");
    line(g, 11, 28, 8, 8, "O", 2);
    line(g, 15, 27, 15, 5, "O", 2);
    line(g, 19, 27, 22, 7, "O", 2);
    line(g, 22, 29, 28, 13, "O", 2);
    line(g, 9, 30, 4, 21, "O", 2);
    for (const p of [[8, 14], [15, 12], [21, 14], [25, 20], [6, 24], [12, 25], [19, 24], [22, 28]]) {
      ellipse(g, p[0], p[1], 2, 2, "M");
      setCell(g, p[0], p[1], "H");
    }
    line(g, 12, 37, 20, 45, "O", 3);
    line(g, 20, 37, 12, 45, "O", 3);
    line(g, 3, 46, 29, 46, "S", 1);
    return artPreset({ id: "bone-hand", nameJa: "骨の手", category: "occult", completionEffect: "slashSeal", grid: g });
  }

  function magicCircleSeal() {
    const g = makeGrid(40, 40);
    ring(g, 20, 20, 18, 18, 2, "O");
    ring(g, 20, 20, 13, 13, 1, "M");
    ring(g, 20, 20, 6, 6, 1, "A");
    polyline(g, [[20, 3], [30, 32], [5, 14], [35, 14], [10, 32], [20, 3]], "H", 1);
    polyline(g, [[20, 7], [32, 27], [8, 27], [20, 7]], "A", 1);
    for (const p of [[20, 2], [32, 8], [38, 20], [32, 32], [20, 38], [8, 32], [2, 20], [8, 8]]) {
      ellipse(g, p[0], p[1], 1, 1, "H");
    }
    setCell(g, 20, 20, "H");
    return artPreset({ id: "magic-circle-seal", nameJa: "魔法陣", category: "occult", completionEffect: "bloodMoon", grid: g });
  }

  function samuraiKabuto() {
    const g = makeGrid(40, 40);
    ellipse(g, 20, 18, 13, 9, "S");
    ring(g, 20, 18, 14, 10, 2, "O");
    rect(g, 9, 22, 22, 5, "O");
    line(g, 20, 8, 14, 2, "O", 3);
    line(g, 20, 8, 26, 2, "O", 3);
    line(g, 12, 12, 4, 7, "A", 2);
    line(g, 28, 12, 36, 7, "A", 2);
    rect(g, 18, 8, 4, 8, "H");
    line(g, 10, 25, 5, 36, "M", 3);
    line(g, 30, 25, 35, 36, "M", 3);
    rect(g, 13, 28, 14, 7, "S");
    rect(g, 14, 29, 12, 2, "H");
    line(g, 8, 38, 32, 38, "S", 2);
    return artPreset({ id: "samurai-kabuto", nameJa: "武者兜", category: "samurai", completionEffect: "openEyes", grid: g });
  }

  function bladeGuardCrest() {
    const g = makeGrid(40, 40);
    ring(g, 20, 20, 16, 16, 4, "O");
    ring(g, 20, 20, 8, 8, 2, "M");
    rect(g, 18, 4, 4, 32, "S");
    rect(g, 4, 18, 32, 4, "S");
    ellipse(g, 20, 20, 4, 4, ".");
    ring(g, 20, 20, 5, 5, 1, "A");
    line(g, 9, 9, 31, 31, "H", 1);
    line(g, 31, 9, 9, 31, "H", 1);
    setCell(g, 20, 4, "A");
    setCell(g, 20, 35, "A");
    setCell(g, 4, 20, "A");
    setCell(g, 35, 20, "A");
    return artPreset({ id: "blade-guard-crest", nameJa: "刀鍔の紋", category: "samurai", completionEffect: "slashSeal", grid: g });
  }

  function glassSwirlOrb() {
    const g = makeGrid(40, 40);
    ellipse(g, 20, 20, 15, 15, "S");
    ring(g, 20, 20, 16, 16, 2, "O");
    ring(g, 20, 20, 12, 12, 1, "A");
    polyline(g, [[11, 21], [15, 14], [24, 13], [29, 19], [25, 26], [17, 25], [16, 20], [22, 18], [24, 21]], "H", 2);
    ellipse(g, 15, 13, 3, 2, "A");
    ellipse(g, 25, 29, 4, 2, "M");
    line(g, 9, 34, 31, 34, "S", 2);
    setCell(g, 13, 12, "H");
    return artPreset({ id: "glass-swirl-orb", nameJa: "玻璃の渦玉", category: "abstract", completionEffect: "bloodMoon", grid: g });
  }

  function tripleDropCrest() {
    const g = makeGrid(40, 40);
    ring(g, 20, 20, 18, 18, 2, "O");
    ellipse(g, 20, 10, 5, 8, "S");
    ellipse(g, 12, 25, 5, 8, "S");
    ellipse(g, 28, 25, 5, 8, "S");
    ring(g, 20, 10, 6, 9, 1, "M");
    ring(g, 12, 25, 6, 9, 1, "M");
    ring(g, 28, 25, 6, 9, 1, "M");
    line(g, 20, 6, 20, 14, "A", 1);
    line(g, 10, 21, 14, 29, "A", 1);
    line(g, 30, 21, 26, 29, "A", 1);
    ring(g, 20, 20, 5, 5, 1, "H");
    return artPreset({ id: "triple-drop-crest", nameJa: "三つ雫紋", category: "samurai", completionEffect: "bloodMoon", grid: g });
  }

  function thunderCrackPattern() {
    const g = makeGrid(48, 28);
    polyline(g, [[5, 4], [18, 10], [13, 14], [30, 18], [24, 24], [43, 26]], "O", 3);
    polyline(g, [[5, 4], [18, 10], [13, 14], [30, 18], [24, 24], [43, 26]], "H", 1);
    polyline(g, [[18, 10], [25, 6], [29, 2]], "A", 1);
    polyline(g, [[13, 14], [7, 18], [3, 24]], "M", 1);
    polyline(g, [[30, 18], [40, 15], [45, 12]], "A", 1);
    line(g, 3, 26, 45, 26, "S", 1);
    setCell(g, 30, 18, "H");
    return artPreset({ id: "thunder-crack-pattern", nameJa: "雷裂紋", category: "abstract", completionEffect: "slashSeal", grid: g });
  }

  window.BLOOD_GOAL_PRESETS = [
    oniMask(),
    foxMask(),
    bloodMoon(),
    brokenBlade(),
    dragonEye(),
    marbleEyeRelief(),
    prayerStoneHand(),
    silentMouthRelief(),
    sideProfileRelief(),
    crackedPorcelainMask(),
    ancientKeyStillLife(),
    pocketWatchStillLife(),
    squareLantern(),
    threeFlameCandelabrum(),
    ritualDagger(),
    moonlitTown(),
    mountainCloudSea(),
    deepForestPath(),
    toriiCrescentMoon(),
    ruinedCastleVista(),
    skullRelief(),
    boneHand(),
    magicCircleSeal(),
    samuraiKabuto(),
    bladeGuardCrest(),
    glassSwirlOrb(),
    tripleDropCrest(),
    thunderCrackPattern()
  ];
}());
