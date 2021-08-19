import { fromPath } from "pdf2pic";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import { default as path } from "path";
import { default as fs } from "fs";

const stageLocation =
  "./src/data_management/raw_data/traditional_territory/stage_maps";

const completeLocation = "./src/traditional_territory/images";

const options = {
  density: 100,
  width: 700,
  height: 700,
  savePath: stageLocation,
  format: "png",
};

function deleteDirContents(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(dir, file), (err) => {
        if (err) throw err;
      });
    }
  });
}

async function stageMaps(dir) {
  deleteDirContents(stageLocation);
  const files = fs.readdirSync(dir);
  return files.map((file) => {
    const absolutePath = path.join(dir, file);
    let saveFilename = file.split("/").slice(-1)[0];
    saveFilename = saveFilename.split(".")[0];
    options.saveFilename = saveFilename;
    const storeAsImage = fromPath(absolutePath, options);
    const pageToConvertAsImage = 1;
    return storeAsImage(pageToConvertAsImage).then((resolve) => {
      console.log(`${file} completed staging`);
      return resolve;
    });
  });
}

function simplifyMaps() {
  console.log("running simplify...");
  deleteDirContents(completeLocation);
  return imagemin([`${stageLocation}/*.{jpg,png}`], {
    destination: completeLocation,
    plugins: [
      imageminPngquant({
        quality: [0.4, 0.4],
      }),
    ],
  });
}

async function processMaps() {
  const maps = await stageMaps(
    "./src/data_management/raw_data/traditional_territory/input_maps"
  );

  await Promise.all(maps)
  simplifyMaps();
}

processMaps();

