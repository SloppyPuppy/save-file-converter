/*
SNES9x save states appear to store the game's SRAM data after the magic "SRA:<size>:"
*/

import SaveFilesUtil from '../../../util/SaveFiles';
import Util from '../../../util/util';

const MAGIC = 'SRA:'; // Magic begins with this string
const SIZE_END_MAGIC = ':'; // Then we have the size of the SRAM data in bytes, which is terminated with this string
const MAGIC_ENCODING = 'US-ASCII';

function getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer) {
  try {
    const magicOffset = Util.findMagic(emulatorSaveStateArrayBuffer, MAGIC, MAGIC_ENCODING);
    const sizeBeginOffset = magicOffset + MAGIC.length;
    const sizeEndOffset = Util.findMagic(emulatorSaveStateArrayBuffer, SIZE_END_MAGIC, MAGIC_ENCODING, sizeBeginOffset);

    const magicSizeDecoder = new TextDecoder(MAGIC_ENCODING);
    const saveSizeString = magicSizeDecoder.decode(emulatorSaveStateArrayBuffer.slice(sizeBeginOffset, sizeEndOffset));
    const saveSize = parseInt(saveSizeString, 10);

    const rawSaveBeginOffset = sizeEndOffset + SIZE_END_MAGIC.length;
    const rawSaveEndOffset = rawSaveBeginOffset + saveSize;

    return emulatorSaveStateArrayBuffer.slice(rawSaveBeginOffset, rawSaveEndOffset);
  } catch (e) {
    throw new Error('This does not appear to be a SNES9x save state file', e);
  }
}

export default class Snes9xSaveStateData {
  static createFromSaveStateData(emulatorSaveStateArrayBuffer) {
    const rawArrayBuffer = getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateArrayBuffer);

    return new Snes9xSaveStateData(emulatorSaveStateArrayBuffer, rawArrayBuffer);
  }

  static createWithNewSize(emulatorSaveStateData, newSize) {
    // The user's emulator etc may require a different file size than the "true" size.
    // We need to make sure that if the user resizes multiple times they don't lose data.
    const originalRawArrayBuffer = getRawArrayBufferFromSaveStateArrayBuffer(emulatorSaveStateData.getEmulatorSaveStateArrayBuffer());
    const newRawSaveData = SaveFilesUtil.resizeRawSave(originalRawArrayBuffer, newSize);

    return new Snes9xSaveStateData(emulatorSaveStateData.getEmulatorSaveStateArrayBuffer(), newRawSaveData);
  }

  static getRawFileExtension() {
    return 'sav';
  }

  static adjustOutputSizesPlatform() {
    return 'snes';
  }

  static fileSizeIsRequiredToConvert() {
    return false;
  }

  constructor(emulatorSaveStateArrayBuffer, rawArrayBuffer) {
    this.emulatorSaveStateArrayBuffer = emulatorSaveStateArrayBuffer;
    this.rawArrayBuffer = rawArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getEmulatorSaveStateArrayBuffer() {
    return this.emulatorSaveStateArrayBuffer;
  }
}
