import QRCode from "qrcode";
import { compress, decompress } from "lzma1";
import { schema as faceSchema, type FaceDataStructure } from "./facedata";
import { readQRCode, fetchNarakaData } from "../qr-reader";

const CODE_PREFIX = "NARAKA-FACEHAIR-";

export interface HairData {
  HeroID: number;
  HairID: number;
  Version: number;
  BaseLevelID: number;
  ParamData: {
    [key: string]: {
      [key: string]: number[];
    };
  };
}

export interface RawNarakaData {
  faceData: number[];
  hairData: HairData;
}

export interface ParsedNarakaData {
  faceData: FaceDataStructure;
  hairData: HairData;
}

/**
 * Decode a raw data object (with numeric face data array) into a structured parsed object.
 */
export function decodeRawToParsed(raw: RawNarakaData): ParsedNarakaData {
  const faceData: any = {};

  for (const entry of faceSchema) {
    const parts = entry.path.split("/");
    let current = faceData;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = raw.faceData[entry.index] ?? 0;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }

  return {
    faceData: faceData as FaceDataStructure,
    hairData: raw.hairData,
  };
}

/**
 * Encode a structured parsed object back into a raw data object with numeric face data array.
 */
export function encodeParsedToRaw(parsed: ParsedNarakaData): RawNarakaData {
  const faceDataArray: number[] = new Array(faceSchema.length).fill(0);

  for (const entry of faceSchema) {
    const parts = entry.path.split("/");
    let current: any = parsed.faceData;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (current === undefined || current === null) {
        faceDataArray[entry.index] = 0;
        break;
      }
      if (i === parts.length - 1) {
        faceDataArray[entry.index] = current[part] ?? 0;
      } else {
        current = current[part];
      }
    }
  }

  return {
    faceData: faceDataArray,
    hairData: parsed.hairData,
  };
}

/**
 * Internal helper to encode raw Naraka data into the compressed string representation.
 */
export function encodeRawToCode(raw: RawNarakaData): string {
  const jsonString = JSON.stringify(raw);
  const textEncoder = new TextEncoder();
  const dataBytes = textEncoder.encode(jsonString);

  // Compress using LZMA1
  const compressed = compress(dataBytes, 5);

  // Naraka Header Quirk construction
  const narakaBuffer = new Uint8Array(compressed.length);
  narakaBuffer.set(compressed.subarray(0, 5), 0);
  const sizeLow = compressed.subarray(5, 9);
  narakaBuffer.set(sizeLow, 5);
  narakaBuffer.set(sizeLow, 9);
  narakaBuffer.set(compressed.subarray(13), 13);

  const binaryString = Array.from(narakaBuffer)
    .map((byte) => String.fromCharCode(byte))
    .join("");
  const base64 = btoa(binaryString);

  return CODE_PREFIX + base64;
}

/**
 * Internal helper to decode a compressed string representation into raw Naraka data.
 */
export function decodeCodeToRaw(codeString: string): RawNarakaData {
  if (codeString.startsWith(CODE_PREFIX)) {
    codeString = codeString.replace(CODE_PREFIX, "");
  }

  const binaryString = atob(codeString);
  const rawBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    rawBytes[i] = binaryString.charCodeAt(i);
  }

  // Restore standard LZMA 8-byte size field
  const standardHeaderBuffer = new Uint8Array(rawBytes.length);
  standardHeaderBuffer.set(rawBytes.subarray(0, 9), 0);
  standardHeaderBuffer.set([0, 0, 0, 0], 9);
  standardHeaderBuffer.set(rawBytes.subarray(13), 13);

  const decompressedBytes = decompress(standardHeaderBuffer);
  const textDecoder = new TextDecoder();
  const jsonString = textDecoder.decode(decompressedBytes);

  return JSON.parse(jsonString);
}

export function decodeCodeToParsed(codeString: string): ParsedNarakaData {
  const raw = decodeCodeToRaw(codeString);
  return decodeRawToParsed(raw);
}

export function encodeParsedToCode(parsed: ParsedNarakaData): string {
  const raw = encodeParsedToRaw(parsed);
  return encodeRawToCode(raw);
}

/**
 * Decode a QR code from a File into a raw Naraka data object.
 */
export async function decodeQRCodeToRaw(file: File): Promise<RawNarakaData> {
  const codeToken = await readQRCode(file);
  if (!codeToken) {
    throw new Error("Could not read QR code from file");
  }

  const rawToken = await fetchNarakaData(codeToken);
  return decodeCodeToRaw(rawToken);
}

/**
 * Encode a raw Naraka data object into a QR code (Data URL).
 */
export async function encodeRawToQRCode(raw: RawNarakaData): Promise<string> {
  const codeToken = encodeRawToCode(raw);
  return await QRCode.toDataURL(codeToken);
}
