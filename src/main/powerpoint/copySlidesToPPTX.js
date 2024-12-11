import { CmToDxa, ModifyShapeHelper } from 'pptx-automizer/dist';
import Automizer from 'pptx-automizer';

const fs = require('fs');
const path = require('path');

async function getSlideNumbers(pres, source) {
  const slideNumbers = await pres
      .getTemplate(source)
      .getAllSlideNumbers();
  return slideNumbers;
}

async function adjustSlideElements(slide) {
  // Get all elements in the slide
  // Don't forget to use 'await'
  const elements = await slide.getAllElements();

  // All shapes should be vertically centered to these dimensions:
  const targetDimensions = {
    // imagine a virtual rectangle with a width of 23cm
    w: CmToDxa(9.57 * 2.54),
    // and a position of 3.56 in from the left.
    x: CmToDxa(3.66 * 2.54),
  };

  // We enlarge all shapes by 122.5%
  const scale = 1.2225;

  elements.forEach((element) => {
    slide.modifyElement(element.name, (xml) => {
      // This will update shape position from the left,
      // centered and according to the target vertical coordinates:
      const targetOffset = (targetDimensions.w - element.position.cx) / 2;
      const targetPos = {
        x: targetDimensions.x + targetOffset,
      };
      ModifyShapeHelper.setPosition(targetPos)(xml);

      // This will 'zoom' into the shape respecting its updated position:
      const addWidth = element.position.cx * scale - element.position.cx;
      const addHeight = element.position.cy * scale - element.position.cy;
      const targetSize = {
        w: element.position.cx + addWidth,
        h: element.position.cy + addHeight,
        x: targetPos.x - addWidth / 2,
        y: element.position.y - addHeight / 2,
      };
      ModifyShapeHelper.setPosition(targetSize)(xml);
    });
  });
}

async function processFile(input_file, pres) {
  try {
      console.log("I think I'm loading:", input_file);
      await pres.load(input_file);

      const slideNumbers = await getSlideNumbers(pres, input_file);

      console.log("I think it had slides:", slideNumbers);

      for (const slideNumber of slideNumbers) {
          console.log("Adding slide:", slideNumber);
          pres.addSlide(
            input_file,
            slideNumber,
            (slide) => {
              adjustSlideElements(slide);
              console.log("I think I'm changing slide layout");
              // slide.useSlideLayout("Blank");
            }
          );
      }
  } catch (error) {
      console.error(`Error processing ${input_file}:`, error);
  }
}

export async function addSlidesToPresentation(
  file_name_list,
  templatePath = "C:/Users/haas1/programming/presentation_creator/template.pptx",
  outputPath = "C:/Users/haas1/programming/presentation_creator/output.pptx"
) {
  // First, let's set some preferences!
  const automizer = new Automizer({
    // turn this to true if you want to generally use
    // Powerpoint's creationIds instead of slide numbers
    // or shape names:
    useCreationIds: false,

    // Always use the original slideMaster and slideLayout of any
    // imported slide:
    autoImportSlideMasters: false,

    // truncate root presentation and start with zero slides
    removeExistingSlides: true,

    // activate `cleanup` to eventually remove unused files:
    cleanup: false,

    // Set a value from 0-9 to specify the zip-compression level.
    // The lower the number, the faster your output file will be ready.
    // Higher compression levels produce smaller files.
    compression: 0,

    // You can enable 'archiveType' and set mode: 'fs'.
    // This will extract all templates and output to disk.
    // It will not improve performance, but it can help debugging:
    // You don't have to manually extract pptx contents, which can
    // be annoying if you need to look inside your files.
    // archiveType: {
    //   mode: 'fs',
    //   baseDir: `${__dirname}/../__tests__/pptx-cache`,
    //   workDir: 'tmpWorkDir',
    //   cleanupWorkDir: true,
    // },

    // use a callback function to track pptx generation process.
    // statusTracker: myStatusTracker,
  });

  // Now we can start and load a pptx template.
  // With removeExistingSlides set to 'false', each addSlide will append to
  // any existing slide in RootTemplate.pptx. Otherwise, we are going to start
  // with a truncated root template.
  let pres = automizer.loadRoot(templatePath)

  for (const input_file of file_name_list) {
    await processFile(input_file, pres);
  };

  // addSlide takes two arguments: The first will specify the source
  // presentation's label to get the template from, the second will set the
  // slide number to require.

  // Finally, we want to write the output file.
  pres.write(outputPath).then((summary) => {
    console.log(summary);
  });

  // It is also possible to get a ReadableStream.
  // stream() accepts JSZip.JSZipGeneratorOptions for 'nodebuffer' type.
  // const stream = await pres.stream({
  //   compressionOptions: {
  //     level: 9,
  //   },
  // });
  // You can e.g. output the pptx archive to stdout instead of writing a file:
  // stream.pipe(process.stdout);

  // If you need any other output format, you can eventually access
  // the underlying JSZip instance:
  // const finalJSZip = await pres.getJSZip();
  // Convert the output to whatever needed:
  // const base64 = await finalJSZip.generateAsync({ type: 'base64' });

}
