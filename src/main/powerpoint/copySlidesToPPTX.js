import path from 'path';

import Automizer, {
  CmToDxa,
  ModifyShapeHelper,
  ModifyImageHelper,
} from 'pptx-automizer/dist';

import { XmlRelationshipHelper } from 'pptx-automizer/dist/helper/xml-relationship-helper';
import { XmlHelper } from 'pptx-automizer/dist/helper/xml-helper';
import { XmlSlideHelper } from 'pptx-automizer/dist/helper/xml-slide-helper';

import { load } from '../../renderer/utilities/yamlFunctions';

const MasterLayoutMapping = {
  SideBar: {
    'Title Only': 11,
    'Title and Content': 12,
    'Section Header': 13,
    Blank: 14,
    'Content Only': 15,
  },
  NoSideBar: {
    'Title Only': 8,
    'Title and Content': 7,
    'Section Header': 6,
    Blank: 10,
    'Content Only': 9,
  },
};

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
  // // All shapes should be vertically centered to these dimensions:
  // const targetDimensions = {
  //   // imagine a virtual rectangle with a width of 23cm
  //   w: CmToDxa(9.57 * 2.54),
  //   // and a position of 3.56 in from the left.
  //   x: CmToDxa(3.66 * 2.54),
  // };

  // // We enlarge all shapes by 122.5%
  // const scale = 1.2225;

  // elements.forEach((element) => {
  //   slide.modifyElement(element.name, (xml) => {
  //     // This will update shape position from the left,
  //     // centered and according to the target vertical coordinates:
  //     const targetOffset = (targetDimensions.w - element.position.cx) / 2;
  //     const targetPos = {
  //       x: targetDimensions.x + targetOffset,
  //     };
  //     ModifyShapeHelper.setPosition(targetPos)(xml);

  //     // This will 'zoom' into the shape respecting its updated position:
  //     const addWidth = element.position.cx * scale - element.position.cx;
  //     const addHeight = element.position.cy * scale - element.position.cy;
  //     const targetSize = {
  //       w: element.position.cx + addWidth,
  //       h: element.position.cy + addHeight,
  //       x: targetPos.x - addWidth / 2,
  //       y: element.position.y - addHeight / 2,
  //     };
  //     ModifyShapeHelper.setPosition(targetSize)(xml);
  //   });
  // });

  slide.useSlideLayout(slideLayout);
}

async function processFile(card, pres, templateDimensions) {
  console.log(card);
  const inputFile = card.file;

  try {
    await pres.load(inputFile);
    const slideNumbers = await getSlideNumbers(pres, inputFile);

    for (const slideNumber of slideNumbers) {
      pres.addSlide(inputFile, slideNumber, (slide) => {
        adjustSlideElements(card, slide, templateDimensions);
      });
    }

    if (card.blankSlide) {
      // the template has a black slide with a blank background
      pres.addSlide('base', 1, (slide) => {
        slide.useSlideLayout(MasterLayoutMapping.NoSideBar.Blank);
      });
    }
  } catch (error) {
    console.error(`Error processing ${inputFile}:`, error);
  }
}

async function addSlidesToPresentation(yamlState) {
  const stateObj = load(yamlState);
  const { templateFile, sidebarFile, outputFile, cards } = stateObj;

  // const templateSize = await getTemplateSize(templateFile);

  const imageDir = path.dirname(sidebarFile);
  const imageFile = path.basename(sidebarFile);

  const automizer = new Automizer({
    removeExistingSlides: true,
    cleanup: true,
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
