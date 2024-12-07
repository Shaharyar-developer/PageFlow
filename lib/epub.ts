import JSZip from "jszip";
import { atob } from "react-native-quick-base64";
import { readFile } from "react-native-fs";
import { XMLParser } from "fast-xml-parser";
import _ from "lodash";
import { BookInformation } from "./types";

const decodeBase64ToBinary = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  return new Uint8Array(
    binaryString.split("").map((char) => char.charCodeAt(0))
  );
};

const findClosestNestedObject = (obj: any, prop: any): any => {
  if (!_.isObject(obj)) {
    return undefined;
  }

  let result;

  const search = (currentObj: any): boolean => {
    if (!_.isObject(currentObj)) {
      return false;
    }

    let found = false;
    _.forOwn(currentObj, (value, key) => {
      if (key === prop || _.isEqual(value, prop)) {
        result = currentObj;
        found = true;
        return false; // Stop iteration
      }

      if (_.isObject(value) || _.isArray(value)) {
        if (search(value)) {
          found = true;
          return false; // Stop iteration
        }
      }
    });
    return found;
  };

  search(obj);
  return result;
};

const findProperty = (obj: any, prop: any): any => {
  if (!_.isObject(obj)) {
    return undefined;
  }

  let result;

  _.forOwn(obj, (value, key) => {
    if (key === prop || _.isEqual(value, prop)) {
      result = value;
      return false; // Stop iteration
    }

    if (_.isObject(value)) {
      result = findProperty(value, prop);
      if (result !== undefined) {
        return false; // Stop iteration
      }
    }
  });

  return result;
};

const findPartialProperty = (obj: any, props: any): any => {
  if (!_.isObject(obj)) {
    return undefined;
  }

  let result;

  _.forOwn(obj, (value, key) => {
    for (const prop of props) {
      if (
        _.includes(key, prop) ||
        (_.isString(value) && _.includes(value, prop))
      ) {
        result = value;
        return false; // Stop iteration
      }
    }

    if (_.isObject(value)) {
      result = findProperty(value, props);
      if (result !== undefined) {
        return false; // Stop iteration
      }
    }
  });

  return result;
};

const cleanDescription = (description: string): string => {
  if (!description) {
    return "";
  }

  let cleanedDescription = description.replace(/&#10;/g, "").trim();
  const productDetailsIndex = cleanedDescription.indexOf("Product details");
  if (productDetailsIndex !== -1) {
    cleanedDescription = cleanedDescription
      .substring(0, productDetailsIndex)
      .trim();
  }

  return cleanedDescription;
};

const cleanCreators = (creator: unknown): string[] => {
  if (!creator) {
    return [];
  }

  if (Array.isArray(creator)) {
    return creator.map((v) => {
      if (typeof v === "string") {
        return v;
      }
      if (typeof v === "object" && v !== null) {
        const res = findProperty(v, "#text");
        if (typeof res === "string") {
          return res
            .split(" ")
            .map((word) => (word.includes("http") ? "" : word))
            .join(" ")
            .trim();
        }
        return v["#text"];
      }
      return "";
    });
  }

  if (typeof creator === "object" && creator !== null) {
    return Object.values(creator).filter(
      (value): value is string => typeof value === "string"
    );
  }

  return [];
};

const cleanTitle = (title: unknown): string => {
  if (typeof title === "string") {
    return title;
  }

  if (typeof title === "object") {
    return Object.values(title ?? {}).map((value) =>
      typeof value === "string" && value.length > 10 ? value : ""
    )[0];
  }

  return "";
};

/**
 * Unpacks an EPUB file using JSZip and extracts metadata from the OPF file.
 *
 * @param path - The file path to the EPUB file.
 * @returns A promise that resolves to an object containing the title, description, and creators of the EPUB.
 *
 * @throws Will throw an error if the ZIP file cannot be parsed.
 *
 * @example
 * ```typescript
 * const metadata = await unpackEPUBWithJSZip('/path/to/epub/file.epub');
 * console.log(metadata.title); // Outputs the title of the EPUB
 * ```
 */
export const unpackEPUBWithJSZip = async (path: string) => {
  const z = new JSZip();
  const base64Data = await readFile(path, "base64");
  const binaryData = decodeBase64ToBinary(base64Data);

  try {
    const archive = await z.loadAsync(binaryData);

    for (const key of Object.keys(archive.files)) {
      if (key.includes(".opf")) {
        const opfFile = archive.files[key];
        const opfContent = await opfFile.async("string");

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "#_",
        });
        const jsonObj = parser.parse(opfContent);

        const mediaObject = findClosestNestedObject(jsonObj, "#_media-type");
        const image = findPartialProperty(mediaObject, [
          ".jpeg",
          ".jpg",
          ".png",
        ]);
        console.log(image);

        let imageBase64: string | undefined;
        for (const key of Object.keys(archive.files)) {
          if (key.includes(image)) {
            const imageFile = archive.files[key];
            imageBase64 = await imageFile.async("base64");
          }
        }

        const title =
          cleanTitle(findProperty(jsonObj, "dc:title")) || "No title available";
        const description = cleanDescription(
          findProperty(jsonObj, "dc:description") || "No description available"
        );
        const creators = cleanCreators(
          findProperty(jsonObj, "dc:creator") || []
        );

        const meta: BookInformation = {
          title,
          description,
          creators,
          image: imageBase64,
        };
        return meta;
      }
    }
  } catch (error) {
    console.error("Failed to parse ZIP:", error);
  }
};
