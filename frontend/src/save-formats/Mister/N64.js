/*
N64 saves on MiSTer can either include cart data, or controller pak data, or both.

The optional cart save portion comes first in the file, and it is the same endianness as PC emulators.

After that, there is an optional section where there are 4 mempack blocks appended to the file

If there is no cart save, then the file is just the 4 mempack blocks.

In most cases we can tell what the file contains by checking its size: 0x20000 bytes total for the optional 4 mempack saves, plus whatever the cart size is.

However the file size of a Flash RAM save is the same as a save that's just the 4 mempacks. We can attempt to disambiguate by trying to parse the mempack blocks.
A file that is all empty (e.g. all 0x00s) is impossible to disambiguate. Bad luck may also result in a Flash RAM file that accidentally parses as mempack blocks
*/

import N64Util from '../../util/N64';
import SaveFilesUtil from '../../util/SaveFiles';

export default class MisterN64SaveData {
  static getMisterFileExtension() {
    return 'sav';
  }

  static getRawFileExtension(rawArrayBuffer) {
    return N64Util.getFileExtension(rawArrayBuffer);
  }

  static adjustOutputSizesPlatform() {
    return 'n64';
  }

  static createWithNewSize(misterSaveData, newSize) {
    const newRawSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(), newSize);

    return MisterN64SaveData.createFromRawData(newRawSaveData);
  }

  static createFromMisterData(misterArrayBuffer) {
    return new MisterN64SaveData(misterArrayBuffer, misterArrayBuffer);
  }

  static createFromRawData(rawArrayBuffer) {
    return new MisterN64SaveData(rawArrayBuffer, rawArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawArrayBuffer, misterArrayBuffer) {
    this.rawArrayBuffer = rawArrayBuffer;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawArrayBuffer() {
    return this.rawArrayBuffer;
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
