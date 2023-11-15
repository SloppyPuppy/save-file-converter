import { expect } from 'chai';
import MisterN64SaveData from '@/save-formats/Mister/N64';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/data/save-formats/mister/n64';

const RAW_4_KBIT_EEPROM_FILENAME = `${DIR}/Super_Mario_64_USA.eep`;
const MISTER_4_KBIT_EEPROM_FILENAME = `${DIR}/Super_Mario_64_USA.sav`;

const RAW_16_KBIT_EEPROM_FILENAME = `${DIR}/Yoshis_Story_USA_EnJa.eep`;
const MISTER_16_KBIT_EEPROM_FILENAME = `${DIR}/Yoshis_Story_USA_EnJa.sav`;

const RAW_SRAM_FILENAME = `${DIR}/Harvest_Moon_64_USA.srm`;
const MISTER_SRAM_FILENAME = `${DIR}/Harvest_Moon_64_USA.sav`;

const RAW_FLASH_RAM_FILENAME = `${DIR}/Legend_of_Zelda_The_-_Majoras_Mask_USA.fla`;
const MISTER_FLASH_RAM_FILENAME = `${DIR}/Legend_of_Zelda_The_-_Majoras_Mask_USA.sav`;

const MISTER_AMBIGUOUS_EMPTY_SAVE_FILENAME = `${DIR}/Ambiguous_empty_save.sav`;
const RAW_EMPTY_FLASH_RAM_FILENAME = `${DIR}/Empty_save.fla`;

describe('MiSTer - N64 save format', () => {
  it('should convert a raw 4kb EEPROM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_4_KBIT_EEPROM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_4_KBIT_EEPROM_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer 4kb EEPROM save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_4_KBIT_EEPROM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_4_KBIT_EEPROM_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.CART_DATA), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw 16kb EEPROM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_16_KBIT_EEPROM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_16_KBIT_EEPROM_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer 16kb EEPROM save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_16_KBIT_EEPROM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_16_KBIT_EEPROM_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.CART_DATA), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw SRAM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_SRAM_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer SRAM save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_SRAM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_SRAM_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.CART_DATA), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw Flash RAM save to the MiSTer format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_FLASH_RAM_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromRawData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getMisterArrayBuffer(), misterArrayBuffer)).to.equal(true);
  });

  it('should convert a MiSTer Flash RAM save to raw format', async () => {
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FLASH_RAM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_FLASH_RAM_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.CART_DATA), rawArrayBuffer)).to.equal(true);
  });

  it('should convert an ambiguous MiSTer Flash RAM / controller pak save to both formats', async () => {
    const rawCartArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_EMPTY_FLASH_RAM_FILENAME);
    const misterArrayBuffer = await ArrayBufferUtil.readArrayBuffer(MISTER_AMBIGUOUS_EMPTY_SAVE_FILENAME);

    const misterN64SaveData = MisterN64SaveData.createFromMisterData(misterArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.CART_DATA), rawCartArrayBuffer)).to.equal(true);
    expect(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.MEMPACK_DATA[0])).to.equal(null);
    expect(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.MEMPACK_DATA[1])).to.equal(null);
    expect(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.MEMPACK_DATA[2])).to.equal(null);
    expect(misterN64SaveData.getRawArrayBuffer(MisterN64SaveData.MEMPACK_DATA[3])).to.equal(null);
  });
});
