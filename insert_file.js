$("#file").change(run);

function run() {
  return PowerPoint.run(
    function(context) {
      storeFileAsBase64().then(
        insertAllSlides
      );
    return context.sync();
  });
}

let chosenFileBase64;

async function storeFileAsBase64() {
  const reader = new FileReader();

  reader.onload = async (event) => {
    const startIndex = reader.result.toString().indexOf("base64,");
    const copyBase64 = reader.result.toString().substr(startIndex + 7);

    chosenFileBase64 = copyBase64;
  };

  const myFile = document.getElementById("file") as HTMLInputElement;
  reader.readAsDataURL(myFile.files[0]);
}

async function insertAllSlides() {
  await PowerPoint.run(async function (context) {
    context.presentation.insertSlidesFromBase64(chosenFileBase64);
    await context.sync();
  });
}

/** Default helper for invoking an action and handling errors. */
async function tryCatch(callback) {
  try {
    await callback();
  } catch (error) {
    // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
    console.error(error);
  }
}
