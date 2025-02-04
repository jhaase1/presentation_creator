import { app } from 'electron';
import path from 'path';

import sizeOf from 'image-size';

import Automizer, {
  CmToDxa,
  ModifyShapeHelper,
  ModifyImageHelper,
  ModifyBackgroundHelper,
} from 'pptx-automizer/dist';

import { XmlRelationshipHelper } from 'pptx-automizer/dist/helper/xml-relationship-helper';
import { XmlHelper } from 'pptx-automizer/dist/helper/xml-helper';
import { XmlSlideHelper } from 'pptx-automizer/dist/helper/xml-slide-helper';

import { load } from '../renderer/utilities/yamlFunctions';
import { pptx } from '../renderer/types/FileTypes';

const MasterLayoutMapping = {
  SideBar: {
    Blank: 17,
    'Content Only': 18,
    'Title Only': 19,
    'Title and Content': 20,
    'Title Slide': 21,
    Comparison: 22,
    'Two Content': 23,
    'Section Header': 24,
  },
  NoSideBar: {
    'Title Slide': 9,
    'Title and Content': 10,
    'Content Only': 11,
    'Section Header': 12,
    'Two Content': 13,
    Comparison: 14,
    'Title Only': 15,
    Blank: 16,
  },
};

function getImagePathDetails(imagePath) {
  const imageDir = path.dirname(imagePath);
  const imageFile = path.basename(imagePath);
  return { imageDir, imageFile };
}

async function getSlideNumbers(pres, source) {
  const slideNumbers = await pres.getTemplate(source).getAllSlideNumbers();
  return slideNumbers;
}

async function getTemplateSize(pres) {
  try {
    const xml = await XmlHelper.getXmlFromArchive(
      pres.rootTemplate.archive,
      'ppt/presentation.xml',
    );

    if (!xml) return null;

    const sldSz = xml.getElementsByTagName('p:sldSz')[0];
    if (sldSz) {
      const width = XmlSlideHelper.parseCoordinate(sldSz, 'cx');
      const height = XmlSlideHelper.parseCoordinate(sldSz, 'cy');
      return { width, height };
    }
    return null;
  } catch (error) {
    console.warn(`Error while fetching XML from path ${path}: ${error}`);
    return null;
  }
}

async function getSlideSize(slide) {
  const dimensionsPromise = new Promise((resolve, reject) => {
    try {
      const dimensions = slide.getDimensions();
      resolve(dimensions);
    } catch (error) {
      reject(error);
    }
  });

  const dimensions = await dimensionsPromise;

  return dimensions;
}

async function getMasterName(archive, number) {
  const XML = await XmlHelper.getXmlFromArchive(
    archive,
    `ppt/theme/theme${number}.xml`,
  );

  const layout = XML.getElementsByTagName('a:theme')?.item(0);
  if (layout) {
    const name = layout.getAttribute('name');
    return name;
  }
}

async function getLayoutName(archive, number) {
  const XML = await XmlHelper.getXmlFromArchive(
    archive,
    `ppt/slideLayouts/slideLayout${number}.xml`,
  );

  const layout = XML.getElementsByTagName('p:cSld')?.item(0);
  if (layout) {
    const name = layout.getAttribute('name');
    return name;
  }
}

async function adjustSlideElements(card, slide, templateDimensions) {
  // Get all elements in the slide
  // Don't forget to use 'await'
  const elements = await slide.getAllElements();

  // Get source slide layout id
  const sourceLayoutId = await XmlRelationshipHelper.getSlideLayoutNumber(
    slide.sourceTemplate.archive,
    slide.sourceNumber,
  );

  // Get source master id
  const sourceMasterId = await XmlRelationshipHelper.getSlideMasterNumber(
    slide.sourceTemplate.archive,
    sourceLayoutId,
  );

  const slideMasterName = await getMasterName(
    slide.sourceTemplate.archive,
    sourceMasterId,
  );

  const slideLayoutName = await getLayoutName(
    slide.sourceTemplate.archive,
    sourceLayoutId,
  );

  let layoutMapping;

  if (card.useSidebar) {
    layoutMapping = MasterLayoutMapping.SideBar;
  } else {
    layoutMapping = MasterLayoutMapping.NoSideBar;
  }

  const slideLayout = layoutMapping[slideLayoutName] || layoutMapping.Blank;

  const newDimensions = await getSlideSize(slide);

  if (newDimensions.width > templateDimensions.width) {
    // shrink the slide to fit the template
    const scale = templateDimensions.width / newDimensions.width;

    elements.forEach((element) => {
      slide.modifyElement(element.name, (xml) => {
        // This will 'zoom' into the shape respecting its updated position:
        const targetSize = {
          w: element.position.cx * scale,
          h: element.position.cy * scale,
          x: element.position.x * scale,
          y: element.position.y * scale,
        };
        ModifyShapeHelper.setPosition(targetSize)(xml);
      });
    });
  } else if (newDimensions.width < templateDimensions.width) {
    const shiftX = templateDimensions.width - newDimensions.width;

    elements.forEach((element) => {
      slide.modifyElement(element.name, (xml) => {
        // This will 'zoom' into the shape respecting its updated position:
        const targetSize = {
          w: element.position.cx,
          h: element.position.cy,
          x: element.position.x + shiftX,
          y: element.position.y,
        };
        ModifyShapeHelper.setPosition(targetSize)(xml);
      });
    });
  }

  slide.useSlideLayout(slideLayout);
}

async function addSlideFromImage(pres, card) {
  const { file, useSidebar } = card;
  const dimensions = await sizeOf(file);

  const { imageDir, imageFile } = getImagePathDetails(file);
  let layoutMapping;

  if (useSidebar) {
    layoutMapping = MasterLayoutMapping.SideBar;
  } else {
    layoutMapping = MasterLayoutMapping.NoSideBar;
  }

  const slideLayout = layoutMapping[`Content Only`];

  pres.loadMedia([imageFile], imageDir).addSlide(`base`, 2, async (slide) => {
    slide.useSlideLayout(slideLayout);

    const elements = await slide.getAllElements();
    const element = elements[0];

    const scale = Math.min(
      element.position.cx / dimensions.width,
      element.position.cy / dimensions.height,
    );

    // slide.modifyElement(element.name, [

    // ]);

    slide.modifyElement(element.name, [
      (xml) => {
        const targetSize = {
          w: Math.round(dimensions.width * scale),
          h: Math.round(dimensions.height * scale),
          x: Math.round(
            element.position.x +
              (element.position.cx - dimensions.width * scale) / 2,
          ),
          y: Math.round(
            element.position.y +
              (element.position.cy - dimensions.height * scale) / 2,
          ),
        };

        ModifyShapeHelper.setPosition(targetSize)(xml);
        // ModifyImageHelper.setRelationTarget(imageFile);
      },
      ModifyImageHelper.setRelationTarget(imageFile),
    ]);

    // elements.forEach((element) => {
    //   slide.modifyElement(element.name, (xml) => {
    //     // This will 'zoom' into the shape respecting its updated position:
    //     const targetSize = {
    //       w: element.position.cx * scale,
    //       h: element.position.cy * scale,
    //       x: element.position.x * scale,
    //       y: element.position.y * scale,
    //     };
    //     ModifyShapeHelper.setPosition(targetSize)(xml);
    //   });
    // });

    // Use pptxgenjs to add image from file:
    // slide.generate((pptxGenJSSlide, objectName) => {
    //   pptxGenJSSlide.addImage({
    //     path: file,
    //     objectName,
    //   });
    // });
  });

  // pres.loadMedia([imageFile], imageDir).addSlide(`base`, 2, (slide) => {
  //   slide.useSlideLayout(slideLayout);
  //   slide.modifyElement(`Content Placeholder 3`, [
  //     ModifyImageHelper.setRelationTarget(imageFile),
  //   ]);
  // });
}

async function processFile(card, pres, templateDimensions) {
  const { file, fileType } = card;

  try {
    if (fileType.startsWith('image/')) {
      console.log('Image file:', file);
      await addSlideFromImage(pres, card);
    } else if (fileType === pptx) {
      await pres.load(file);
      const slideNumbers = await getSlideNumbers(pres, file);

      for (const slideNumber of slideNumbers) {
        pres.addSlide(file, slideNumber, (slide) => {
          adjustSlideElements(card, slide, templateDimensions);
        });
      }
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (card.blankSlide) {
      // the template has a black slide with a blank background
      pres.addSlide('base', 1, (slide) => {
        slide.useSlideLayout(MasterLayoutMapping.NoSideBar.Blank);
      });
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
}

async function addSlidesToPresentation(yamlState) {
  const stateObj = load(yamlState);
  const { templateFile, sidebarFile, outputFile, cards } = stateObj;

  const { imageDir, imageFile } = getImagePathDetails(sidebarFile);
  const tempDir = app.getPath('temp');

  const automizer = new Automizer({
    removeExistingSlides: true,
    cleanup: true,
    templateDir: tempDir,
  });

  const pres = automizer
    .loadRoot(templateFile)
    .loadMedia([imageFile], imageDir)
    .load(templateFile, 'base');

  const templateDimensions = await getTemplateSize(pres);

  pres.addMaster('base', 1, (master) => {
    master.modifyElement('SideBarImage', [
      ModifyImageHelper.setRelationTarget(imageFile),
    ]);
  });

  // pres.addMaster('base', 2, (master) => {});
  // removeMasters(pres, 2, 0);

  for (const card of cards) {
    await processFile(card, pres, templateDimensions);
  }

  const result = await pres.write(outputFile);
  console.log(result);
}

export default addSlidesToPresentation;
