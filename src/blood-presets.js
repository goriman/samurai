(function () {
  "use strict";

  function makeGrid(width, height) {
    return Array.from({ length: height }, () => Array.from({ length: width }, () => "."));
  }

  function setCell(grid, x, y, mark) {
    if (!grid[y] || x < 0 || x >= grid[y].length || mark === ".") return;
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

  window.BLOOD_GOAL_PRESETS = [
    oniMask(),
    foxMask(),
    bloodMoon(),
    brokenBlade(),
    dragonEye()
  ];
}());
