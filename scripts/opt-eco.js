const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, '../_assets/ecossistema');
const outputDir = path.join(__dirname, '../public/images/ecossistema');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function convert(input, output) {
  try {
    // If the image is already PNG and we just want to ensure it fits and maybe compress
    await sharp(input)
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(output);
    console.log('Saved ' + output);
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  await convert(path.join(inputDir, 'advisor/logo_fb.png'), path.join(outputDir, 'advisor_fb.webp'));
  await convert(path.join(inputDir, 'advisor/logo_fp.png'), path.join(outputDir, 'advisor_fp.webp'));
  
  await convert(path.join(inputDir, 'enm/Arcaffo ENM_Logo_w.b.w_h_p_v.1.1.png'), path.join(outputDir, 'enm_w.webp'));
  await convert(path.join(inputDir, 'enm/Arcaffo ENM_Logo_b.r_h_b_v.3.1.png'), path.join(outputDir, 'enm_b.webp'));
  
  await convert(path.join(inputDir, 'ordo/Arcaffo FFOL_Logos__Vertical_B_V1.png'), path.join(outputDir, 'ordo_b.webp'));
  await convert(path.join(inputDir, 'ordo/Arcaffo FFOL_Logos__Vertical_P_V1.png'), path.join(outputDir, 'ordo_p.webp'));
}

run();
