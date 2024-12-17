// require modules
const fs = require('fs');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const path = require('path');
const os = require('os');

export function unzipFolder(inputFilePath, outputFilePath) {
  // Create output folder if it doesn't exist
  if (!fs.existsSync(outputFilePath)) {
    fs.mkdirSync(outputFilePath, { recursive: true });
  }

  // Load the ZIP file
  const zip = new AdmZip(inputFilePath);

  // Extract all entries from the ZIP file
  zip.getEntries().forEach((entry) => {
    // Extract each entry to the output folder
    if (!entry.isDirectory) {
      const { entryName } = entry;
      const entryOutputPath = path.join(outputFilePath, entryName);
      zip.extractEntryTo(entryName, outputFilePath, true, true);
    }
  });

  console.log('Folder unzipped successfully.');
}

export function replace_file(current_file, new_file) {
  // Read binary content from new_file
  fs.readFile(new_file, (err, data) => {
    if (err) {
      console.error('Error reading new_file:', err);
      return;
    }

    // Write binary content to current_file, overwriting its content
    fs.writeFile(current_file, data, (err) => {
      if (err) {
        console.error('Error writing to current_file:', err);
        return;
      }
      console.log('File replaced successfully.');
    });
  });
}

export function rezip_pptx(inputDir, outputFile) {
  // create a file to stream archive data to.
  const output = fs.createWriteStream(outputFile);

  const archive = archiver('zip', {
    zlib: { level: 5 }, // Sets the compression level.
  });

  // listen for all archive data to be written
  // 'close' event is fired only when a file descriptor is involved
  output.on('close', function () {
    console.log(`${archive.pointer()} total bytes`);
    console.log(
      'archiver has been finalized and the output file descriptor has closed.',
    );
  });

  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on('end', function () {
    console.log('Data has been drained');
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
      console.warn(err);
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);

  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory(inputDir, '');

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
  archive.finalize();
}

export function createTemporaryFolder() {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(os.tmpdir(), `temp_folder_${Date.now()}`);

    fs.mkdir(tempDir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating temporary folder:', err);
        reject(err);
      } else {
        console.log('Temporary folder created:', tempDir);
        resolve(tempDir);
      }
    });
  });
}

export function replace_powerpoint_side_banner(
  original_pptx,
  originalImage,
  newImage,
  rezipped_pptx,
) {
  createTemporaryFolder()
    .then((tempDir) => {
      // Unzip original_pptx to tempDir
      unzipFolder(original_pptx, tempDir);

      // Replace originalImage with newImage in tempDir
      replace_file(path.join(tempDir, originalImage), newImage);

      // Re-zip tempDir to create rezipped_pptx
      rezip_pptx(tempDir, rezipped_pptx);
    })
    .catch((err) => {
      console.error('Error processing files:', err);
    });
}

// Usage
const original_pptx = `C:/Users/haas1/Downloads/TESTFILE.pptx`;
const rezipped_pptx = `C:/Users/haas1/Downloads/REZIPPED.pptx`;

// Example usage:
const originalImage = 'ppt/media/image1.png';
const newImage = 'C:/Users/haas1/programming/presentation_creator/red.png';

processFiles(original_pptx, originalImage, newImage, rezipped_pptx);
