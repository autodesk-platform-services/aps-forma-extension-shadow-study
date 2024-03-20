import { Forma } from "forma-embedded-view-sdk/auto";
import { useEffect, useState } from "preact/hooks";
import { FormaElement, Urn } from "forma-embedded-view-sdk/elements/types";

/**
 *
 * @param urn The root urn of the element hierarchy to search
 * @param elements Record that must contain all elements part of the hierarchy
 * @param filterPredicate Predicate to filter the elements you want to get the paths for
 * @param path Pased recursively to build the path of the elements. Should be "root" when calling the function on a proposal URN.
 * @returns a list of paths to the elements that match the filterPredicate
 */
function getPathOfElements(
  urn: Urn,
  elements: Record<Urn, FormaElement>,
  filterPredicate: (element: FormaElement) => boolean,
  path: string = "root",
): string[] {
  const element = elements[urn];
  const paths = [];
  if (filterPredicate(element)) {
    paths.push(path);
  }

  if (element.children) {
    for (const child of element?.children) {
      paths.push(
        ...getPathOfElements(child.urn, elements, filterPredicate, `${path}/${child.key}`),
      );
    }
  }

  return paths;
}

/**
 * Color the ground texture with a given color
 */
async function colorGround(color: string) {
  const bbox = await Forma.terrain.getBbox();
  const canvas = document.createElement("canvas");
  const width = bbox.max.x - bbox.min.x;
  const height = bbox.max.y - bbox.min.y;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  context.fillStyle = color;
  context.fillRect(0, 0, width, height);
  return await Forma.terrain.groundTexture.add({
    name: "shadow-study",
    canvas: canvas,
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1 },
  });
}

/**
 * Color elements with a given color
 */
function colorPaths(elementPaths: string[], color: string) {
  const pathsToColor = new Map<string, string>();
  for (const path of elementPaths) {
    pathsToColor.set(path, color);
  }

  Forma.render.elementColors.set({ pathsToColor });
}

/**
 * Will debounce the function call to avoid calling it too often.
 * Useful for avoiding color input events to be called too often.
 */
export const debounce = <F extends (...args: any[]) => ReturnType<F>>(func: F, waitFor: number) => {
  let timeout: number | undefined;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export default function GeometryColorSelector() {
  const [shouldPaintGeometry, setShouldPaintGeometry] = useState(false);
  const [shouldPaintTerrain, setShouldPaintTerrain] = useState(false);

  const [elementPaths, setElementPaths] = useState<string[]>([]);
  const [rootUrn, setRootUrn] = useState<Urn | undefined>();
  const [geometryColor, setGeometryColor] = useState("#ffffff");
  const [terrainColor, setTerrainColor] = useState("#ffffff");

  useEffect(() => {
    Forma.proposal.getRootUrn().then((rootUrn) => {
      setRootUrn(rootUrn as Urn);
    });
    Forma.proposal.subscribe(async ({ rootUrn }) => {
      await Forma.proposal.awaitProposalPersisted();
      setRootUrn(rootUrn as Urn);
    });
  }, []);

  useEffect(() => {
    if (rootUrn != null) {
      Forma.elements.get({ urn: rootUrn as Urn, recursive: true }).then(({ elements }) => {
        const paths = getPathOfElements(rootUrn as Urn, elements, () => true);
        setElementPaths(paths);
      });
    }
  }, [rootUrn]);

  useEffect(() => {
    if (shouldPaintTerrain && shouldPaintGeometry) {
      colorGround(terrainColor).then(() => {
        colorPaths(elementPaths, geometryColor);
      });
    } else if (shouldPaintTerrain) {
      colorGround(terrainColor);
      Forma.render.elementColors.clearAll();
    } else if (shouldPaintGeometry) {
      colorPaths(elementPaths, geometryColor);
      Forma.terrain.groundTexture.remove({ name: "shadow-study" });
    } else {
      Forma.render.elementColors.clearAll();
      Forma.terrain.groundTexture.remove({ name: "shadow-study" });
    }
  }, [shouldPaintTerrain, shouldPaintGeometry, geometryColor, elementPaths, terrainColor]);

  return (
    <>
      <div class="row">
        <div class="row-title" style={{ width: "50%" }}>
          Color geometry:
        </div>
        <div class="row-item">
          <weave-checkbox
            checked={shouldPaintGeometry}
            onChange={(e) => setShouldPaintGeometry(e.detail.checked)}
          ></weave-checkbox>
          <input
            type="color"
            class={"color-picker"}
            value={geometryColor}
            onInput={debounce((e: Event) => {
              if (e.target instanceof HTMLInputElement) setGeometryColor(e.target?.value);
            }, 50)}
          />
        </div>
      </div>
      <div class="row">
        <div class="row-title" style={{ width: "50%" }}>
          Color terrain:
        </div>
        <div class="row-item">
          <weave-checkbox
            checked={shouldPaintTerrain}
            onChange={(e) => setShouldPaintTerrain(e.detail.checked)}
          ></weave-checkbox>
          <input
            type="color"
            class={"color-picker"}
            value={geometryColor}
            onInput={debounce((e: Event) => {
              if (e.target instanceof HTMLInputElement) setTerrainColor(e.target?.value);
            }, 50)}
          />
        </div>
      </div>
    </>
  );
}
