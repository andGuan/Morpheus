import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.join(process.cwd(), "tableware");
const outputDirectory = path.join(process.cwd(), "public", "tableware", "cutout");
const files = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith(".png"))
  .map((file) => ({ sourcePath: path.join(sourceDirectory, file), outputName: path.parse(file).name }));
const platePhotos = [
  { sourcePath: path.join(process.cwd(), "public", "盘子.png"), outputName: "dish_002_new" },
];
const cutleryPhotos = [
  { file: "Pasted 2026-09-29 at 12.01.24.png", outputName: "cutlery_classic" },
  { file: "Pasted 2026-09-29 at 12.01.37.png", outputName: "cutlery_modern" },
  { file: "Pasted 2026-09-29 at 12.08.58.png", outputName: "cutlery_heirloom" },
  { file: "Pasted 2026-09-29 at 12.09.40.png", outputName: "cutlery_louche" },
].map(({ file, outputName }) => ({ sourcePath: path.join(process.cwd(), "public", file), outputName }));
const requestedOutputName = process.argv[2];
const outputAssets = [...files, ...platePhotos, ...cutleryPhotos].filter(({ outputName }) => !requestedOutputName || outputName === requestedOutputName);

await mkdir(outputDirectory, { recursive: true });

for (const { sourcePath, outputName } of outputAssets) {
  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const pixelCount = width * height;
  const background = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let tail = 0;

  const isNearWhite = (index) => {
    const offset = index * 4;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    return red >= 222 && green >= 222 && blue >= 222 && Math.max(red, green, blue) - Math.min(red, green, blue) <= 34;
  };

  const addBackgroundPixel = (index) => {
    if (background[index] || !isNearWhite(index)) return;
    background[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    addBackgroundPixel(x);
    addBackgroundPixel((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    addBackgroundPixel(y * width);
    addBackgroundPixel(y * width + width - 1);
  }

  for (let head = 0; head < tail; head += 1) {
    const index = queue[head];
    const x = index % width;
    const y = Math.floor(index / width);
    if (x > 0) addBackgroundPixel(index - 1);
    if (x + 1 < width) addBackgroundPixel(index + 1);
    if (y > 0) addBackgroundPixel(index - width);
    if (y + 1 < height) addBackgroundPixel(index + width);
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let index = 0; index < pixelCount; index += 1) {
    if (!background[index]) continue;
    const offset = index * 4;
    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 0;
  }

  if (outputName.startsWith("cutlery_")) {
    const labels = new Uint32Array(pixelCount);
    const components = [];
    let componentId = 0;

    for (let index = 0; index < pixelCount; index += 1) {
      if (data[index * 4 + 3] <= 24 || labels[index]) continue;

      componentId += 1;
      let head = 0;
      let componentTail = 0;
      let partMinX = width;
      let partMinY = height;
      let partMaxX = -1;
      let partMaxY = -1;
      let area = 0;
      queue[componentTail++] = index;
      labels[index] = componentId;

      for (; head < componentTail; head += 1) {
        const pixel = queue[head];
        const x = pixel % width;
        const y = Math.floor(pixel / width);
        area += 1;
        partMinX = Math.min(partMinX, x);
        partMinY = Math.min(partMinY, y);
        partMaxX = Math.max(partMaxX, x);
        partMaxY = Math.max(partMaxY, y);

        for (const neighbor of [x > 0 ? pixel - 1 : -1, x + 1 < width ? pixel + 1 : -1, y > 0 ? pixel - width : -1, y + 1 < height ? pixel + width : -1]) {
          if (neighbor < 0 || labels[neighbor] || data[neighbor * 4 + 3] <= 24) continue;
          labels[neighbor] = componentId;
          queue[componentTail++] = neighbor;
        }
      }

      if (area > 10000) components.push({ id: componentId, area, minX: partMinX, minY: partMinY, maxX: partMaxX, maxY: partMaxY });
    }

    components.sort((a, b) => a.minX + a.maxX - b.minX - b.maxX);
    if (components.length !== 4) throw new Error(`Expected four utensil components in ${path.basename(sourcePath)}, found ${components.length}`);

    const parts = { fork: [components[0]], knife: [components[1]], spoon: components.slice(2) };

    for (const [part, partComponents] of Object.entries(parts)) {
      const selectedIds = new Set(partComponents.map((component) => component.id));
      const partMinX = Math.min(...partComponents.map((component) => component.minX));
      const partMinY = Math.min(...partComponents.map((component) => component.minY));
      const partMaxX = Math.max(...partComponents.map((component) => component.maxX));
      const partMaxY = Math.max(...partComponents.map((component) => component.maxY));
      const partPadding = Math.round(Math.max(partMaxX - partMinX, partMaxY - partMinY) * 0.06);
      const partLeft = Math.max(0, partMinX - partPadding);
      const partTop = Math.max(0, partMinY - partPadding);
      const partWidth = Math.min(width - partLeft, partMaxX - partMinX + 1 + partPadding * 2);
      const partHeight = Math.min(height - partTop, partMaxY - partMinY + 1 + partPadding * 2);
      const partPath = path.join(outputDirectory, `${outputName}_${part}.webp`);
      const partImage = await sharp(data, { raw: { width, height, channels: 4 } })
        .extract({ left: partLeft, top: partTop, width: partWidth, height: partHeight })
        .raw()
        .toBuffer({ resolveWithObject: true });

      for (let y = 0; y < partHeight; y += 1) {
        for (let x = 0; x < partWidth; x += 1) {
          const sourceIndex = (partTop + y) * width + partLeft + x;
          if (selectedIds.has(labels[sourceIndex])) continue;
          const offset = (y * partWidth + x) * 4;
          partImage.data[offset] = 0;
          partImage.data[offset + 1] = 0;
          partImage.data[offset + 2] = 0;
          partImage.data[offset + 3] = 0;
        }
      }

      await sharp(partImage.data, { raw: partImage.info })
        .webp({ quality: 92, alphaQuality: 100 })
        .toFile(partPath);
      console.log(`${path.basename(sourcePath)}: ${part} ${partWidth}x${partHeight} -> ${path.relative(process.cwd(), partPath)}`);
    }
  }

  for (let index = 0; index < pixelCount; index += 1) {
    if (data[index * 4 + 3] <= 24) continue;
    const x = index % width;
    const y = Math.floor(index / width);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  const padding = Math.round(Math.max(maxX - minX, maxY - minY) * 0.06);
  const left = Math.max(0, minX - padding);
  const top = Math.max(0, minY - padding);
  const cropWidth = Math.min(width - left, maxX - minX + 1 + padding * 2);
  const cropHeight = Math.min(height - top, maxY - minY + 1 + padding * 2);
  const outputPath = path.join(outputDirectory, `${outputName}.webp`);
  await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(outputPath);
  console.log(`${path.basename(sourcePath)}: cleared ${Math.round((tail / pixelCount) * 100)}% background, cropped to ${cropWidth}x${cropHeight} -> ${path.relative(process.cwd(), outputPath)}`);
}