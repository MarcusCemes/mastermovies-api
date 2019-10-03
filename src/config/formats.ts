import { Format } from "convict";

function bufferValidator(buffer: any, length: number): buffer is Buffer {
  return Buffer.isBuffer(buffer) && buffer.length === length;
}

function bufferDecoder(value: string) {
  if (/^[0-9a-fA-F]+$/.test(value)) {
    return Buffer.from(value, "hex");
  } else if (/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) {
    return Buffer.from(value, "base64");
  } else {
    throw new Error("Unknown binary encoding");
  }
}

export const ConfigFormats: { [index: string]: Format } = {
  buffer32: {
    coerce: bufferDecoder,
    validate: buffer => bufferValidator(buffer, 32)
  },
  buffer64: {
    coerce: bufferDecoder,
    validate: buffer => bufferValidator(buffer, 64)
  },
  positiveInt: {
    coerce: number => parseInt(number, 10),
    validate: x => !isNaN(Number(x)) && x > 0 && x === Math.round(x)
  }
};
