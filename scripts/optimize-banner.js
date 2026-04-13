const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/banner.png');
const outputWebP = path.join(__dirname, '../public/banner.webp');
const outputPng = path.join(__dirname, '../public/banner-optimized.png');

async function optimizeBanner() {
  try {
    // Get original dimensions
    const metadata = await sharp(inputPath).metadata();
    console.log(`Original: ${metadata.width}x${metadata.height}px, ${(fs.statSync(inputPath).size / 1024).toFixed(2)} KB`);

    // Resize to 1920x400 (standard hero banner) and convert to WebP
    await sharp(inputPath)
      .resize(1920, 400, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(outputWebP);

    const webpSize = fs.statSync(outputWebP).size;
    console.log(`WebP created: 1920x400px, ${(webpSize / 1024).toFixed(2)} KB`);

    // Also create optimized PNG fallback
    await sharp(inputPath)
      .resize(1920, 400, { fit: 'cover', position: 'center' })
      .png({ quality: 80, compressionLevel: 9 })
      .toFile(outputPng);

    const pngSize = fs.statSync(outputPng).size;
    console.log(`PNG fallback: 1920x400px, ${(pngSize / 1024).toFixed(2)} KB`);

    console.log('\n✅ Banner optimized successfully!');
  } catch (error) {
    console.error('Error optimizing banner:', error);
  }
}

optimizeBanner();
