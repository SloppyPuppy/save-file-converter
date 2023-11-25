/*
N64 saves on MiSTer can either include cart data, or controller pak data, or both.

The optional cart save portion comes first in the file, and it is the same endianness as PC emulators.

After that, there is an optional section where there are 4 mempack blocks appended to the file

If there is no cart save, then the file is just the 4 mempack blocks.

In most cases we can tell what the file contains by checking its size: 0x20000 bytes total for the optional 4 mempack saves, plus whatever the cart size is.

However the file size of a Flash RAM save is the same as a save that's just the 4 mempacks. We can attempt to disambiguate by trying to parse the mempack blocks.
Bad luck may result in a Flash RAM file that accidentally parses as mempack blocks.

The cart save (if any) is always in emulator endian, and the mempack data (if any) needs to be endian swapped to work on an emulator.x

There's a bit of discussion about the format here: https://github.com/RobertPeip/Mister64/issues/12
*/

import N64Util from '../../util/N64';
import N64MempackSaveData from '../N64/Mempack';
import SaveFilesUtil from '../../util/SaveFiles';

const NUM_MEMPACKS = 4; // All 4 potential controller paks can be stored in a MiSTer save file
const ALL_MEMPACK_SIZE = N64MempackSaveData.TOTAL_SIZE * NUM_MEMPACKS;
const MEMPACK_DATA_INDEX_PREFIX = 'mempack-data';
const MEMPACK_DATA_INDEXES = [...Array(NUM_MEMPACKS).keys()];

function splitAllMisterMempackData(arrayBuffer) {
  const arrayBufferEndianSwapped = N64Util.endianSwap(arrayBuffer, 'littleToBigEndian');

  return MEMPACK_DATA_INDEXES.map((i) => arrayBufferEndianSwapped.slice(i * N64MempackSaveData.TOTAL_SIZE, (i + 1) * N64MempackSaveData.TOTAL_SIZE));
}

function allMisterMempackDataIsValid(arrayBuffer) {
  const mempackData = splitAllMisterMempackData(arrayBuffer);
  let valid = true;

  try {
    mempackData.forEach((mempackArrayBuffer) => N64MempackSaveData.createFromN64MempackData(mempackArrayBuffer));
  } catch (e) {
    valid = false;
  }

  return valid;
}

export default class MisterN64SaveData {
  static CART_DATA = 'cart-data';

  static MEMPACK_DATA = MEMPACK_DATA_INDEXES.map((i) => `${MEMPACK_DATA_INDEX_PREFIX}-${i}`);

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
    const newRawCartSaveData = SaveFilesUtil.resizeRawSave(misterSaveData.getRawArrayBuffer(MisterN64SaveData.CART_DATA), newSize);

    let rawMempackSaveDatas = null;

    if (misterSaveData.rawMempackArrayBuffers !== null) {
      rawMempackSaveDatas = MEMPACK_DATA_INDEXES.map((i) => misterSaveData.getRawArrayBuffer(MisterN64SaveData.MEMPACK_DATA[i]));
    }

    return MisterN64SaveData.createFromRawData(newRawCartSaveData, rawMempackSaveDatas);
  }

  static createFromMisterData(misterArrayBuffer) {
    let cartData = null;
    let allMempackData = null;

    // We're going to use the file size to determine what data is stored in the file. It could be cart data only, controller pak
    // data only, or both

    // The wrinkle is that a Flash RAM cart save, and controller pak data, are exactly the same size. So we need to disambiguate
    // between them. To do that, we'll try parsing the data as controller pak data. There's various checks in that parsing that will
    // likely fail for the random data that we would encounter if it was a Flash RAM save instead. There's always a chance of bad
    // luck here -- a Flash RAM save that happens to parse as controller pak data -- but this is very unlikely and there's a limited
    // number of Flash RAM games, which makes this even more unlikely

    if (misterArrayBuffer.byteLength < ALL_MEMPACK_SIZE) {
      // Here we just have cart data only
      cartData = misterArrayBuffer;
    } else if (misterArrayBuffer.byteLength > ALL_MEMPACK_SIZE) {
      // Here we have both cart data and controller pak data
      cartData = misterArrayBuffer.slice(0, misterArrayBuffer.byteLength - ALL_MEMPACK_SIZE);
      allMempackData = misterArrayBuffer.slice(misterArrayBuffer.byteLength - ALL_MEMPACK_SIZE);
    } else if (allMisterMempackDataIsValid(misterArrayBuffer)) {
      // Here we have either a Flash RAM or mempack-only file, but it parses as mempacks we we'll assume it's them
      allMempackData = misterArrayBuffer;
    } else {
      // Here we have a Flash RAM cart file
      cartData = misterArrayBuffer;
    }

    if ((cartData !== null) && !N64Util.isValidSize(cartData)) {
      throw new Error('This MiSTer N64 file does not appear to contain valid cart data');
    }

    if ((allMempackData !== null) && !allMisterMempackDataIsValid(allMempackData)) {
      throw new Error('This MiSTer N64 file does not appear to contain valid mempack data');
    }

    const allMempackArrayBuffers = (allMempackData !== null) ? splitAllMisterMempackData(allMempackData) : null;

    return new MisterN64SaveData(cartData, allMempackArrayBuffers, misterArrayBuffer);
  }

  static createFromRawData(rawCartArrayBuffer, rawMempackArrayBuffers = null) {
    // FIXME: Gotta concatenate everything together
    return new MisterN64SaveData(rawCartArrayBuffer, rawMempackArrayBuffers, rawCartArrayBuffer);
  }

  // This constructor creates a new object from a binary representation of a MiSTer save data file
  constructor(rawCartArrayBuffer, rawMempackArrayBuffers, misterArrayBuffer) {
    this.rawCartArrayBuffer = rawCartArrayBuffer;
    this.rawMempackArrayBuffers = rawMempackArrayBuffers;
    this.misterArrayBuffer = misterArrayBuffer;
  }

  getRawArrayBuffer(index = MisterN64SaveData.CART_DATA) {
    if (index === MisterN64SaveData.CART_DATA) {
      return this.rawCartArrayBuffer;
    }

    if (index.startsWith(MEMPACK_DATA_INDEX_PREFIX)) {
      if (this.rawMempackArrayBuffers === null) {
        return null;
      }

      const mempackIndex = parseInt(index.charAt(index.length - 1), 10);
      return this.rawMempackArrayBuffers[mempackIndex];
    }

    throw new Error(`Unknown index: ${index}`);
  }

  getMisterArrayBuffer() {
    return this.misterArrayBuffer;
  }
}
