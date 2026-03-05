import fs from "fs";
import path from "path";
import sharp from "sharp";

async function cropIcon() {
  const inputPath = new URL("../public/icon.png", import.meta.url).pathname;
  const dir = path.dirname(inputPath);
  const tempPath = path.join(dir, "icon.cropped.png");

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read icon dimensions.");
  }

  const { width, height } = metadata;
  const insetX = Math.round(width * 0.15);
  const insetY = Math.round(height * 0.15);

  const cropWidth = width - insetX * 2;
  const cropHeight = height - insetY * 2;

  await image
    .extract({ left: insetX, top: insetY, width: cropWidth, height: cropHeight })
    .toFile(tempPath);

  // Replace original icon.png with cropped version
  fs.renameSync(tempPath, inputPath);

  console.log(
    `Cropped icon.png to ${cropWidth}x${cropHeight} (removed ~15% padding on each side).`
  );
}

cropIcon().catch((err) => {
  console.error(err);
  process.exit(1);
});


