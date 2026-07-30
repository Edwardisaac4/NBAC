import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '..', 'public', 'images');

async function optimizeImages() {
  const files = fs.readdirSync(imagesDir);
  console.log(`Found ${files.length} files in ${imagesDir}`);

  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const originalSize = stat.size;
    totalOriginal += originalSize;

    try {
      const fileBuffer = fs.readFileSync(filePath);
      let pipeline = sharp(fileBuffer);
      const metadata = await pipeline.metadata();

      // Resize excessively large dimensions if greater than 1920px width
      if (metadata.width && metadata.width > 1920) {
        pipeline = pipeline.resize({ width: 1920, withoutEnlargement: true });
      }

      let buffer;
      if (ext === '.png') {
        buffer = await pipeline
          .png({ quality: 85, compressionLevel: 9, palette: metadata.hasAlpha })
          .toBuffer();
      } else {
        buffer = await pipeline
          .jpeg({ quality: 82, mozjpeg: true, progressive: true })
          .toBuffer();
      }

      if (buffer.length < originalSize) {
        fs.writeFileSync(filePath, buffer);
        const saved = ((originalSize - buffer.length) / 1024).toFixed(1);
        const percent = (((originalSize - buffer.length) / originalSize) * 100).toFixed(1);
        console.log(`✓ ${file}: ${(originalSize / 1024).toFixed(1)} KB -> ${(buffer.length / 1024).toFixed(1)} KB (-${percent}%, saved ${saved} KB)`);
        totalOptimized += buffer.length;
      } else {
        console.log(`= ${file}: Already optimal (${(originalSize / 1024).toFixed(1)} KB)`);
        totalOptimized += originalSize;
      }
    } catch (err) {
      console.error(`✗ Error processing ${file}:`, err.message);
      totalOptimized += originalSize;
    }
  }

  const savedTotal = ((totalOriginal - totalOptimized) / 1024 / 1024).toFixed(2);
  const totalPercent = (((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1);
  console.log(`\n🎉 Done! Total size reduced from ${(totalOriginal / 1024 / 1024).toFixed(2)} MB to ${(totalOptimized / 1024 / 1024).toFixed(2)} MB (-${totalPercent}%, saved ${savedTotal} MB)`);
}

optimizeImages();
