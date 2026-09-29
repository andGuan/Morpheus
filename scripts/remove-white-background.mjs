import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = path.join(process.cwd(), "tableware");
const outputDirectory = path.join(process.cwd(), "public", "tableware", "cutout");
const files = (await readdir(sourceDirectory))
  .filter((file) => file.endsWith(".png"))
  .map((file) => ({ sourcePath: path.join(sourceDirectory, file), outputName: path.parse(file).name }));
const cutleryPhotos = [
  { file: "Pasted 2026-09-29 at 12.01.24.png", outputName: "cutlery_classic" },
  { file: "Pasted 2026-09-29 at 12.01.37.png", outputName: "cutlery_modern" },
  { file: "Pasted 2026-09-29 at 12.01.49.png", outputName: "cutlery_ornate" },
  { file: "Pasted 2026-09-29 at 12.08.58.png", outputName: "cutlery_heirloom" },
  { file: "Pasted 2026-09-29 at 12.09.40.png", outputName: "cutlery_louche" },
].map(({ file, outputName }) => ({ sourcePath: path.join(process.cwd(), "public", file), outputName }));

await mkdir(outputDirectory, { recursive: true });

for (const { sourcePath, outputName } of [...files, ...cutleryPhotos]) {
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