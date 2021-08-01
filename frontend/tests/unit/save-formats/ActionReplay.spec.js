import { expect } from 'chai';
import ActionReplaySaveData from '@/save-formats/ActionReplay';
import ArrayBufferUtil from '#/util/ArrayBuffer';

const DIR = './tests/unit/save-formats/data/action-replay';

const ACTIONREPLAY_FILENAME = `${DIR}/final-fantasy-tactics-advance.10238.xps`;
const RAW_FILENAME = `${DIR}/final-fantasy-tactics-advance.10238.srm`;

describe('Action Replay save format', () => {
  it('should convert an Action Replay file to a raw file', async () => {
    const actionReplayArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ACTIONREPLAY_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const actionReplaySaveData = ActionReplaySaveData.createFromActionReplayData(actionReplayArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(actionReplaySaveData.getRawSaveData(), rawArrayBuffer)).to.equal(true);
  });

  it('should convert a raw file to an Action Replay file', async () => {
    const actionReplayArrayBuffer = await ArrayBufferUtil.readArrayBuffer(ACTIONREPLAY_FILENAME);
    const rawArrayBuffer = await ArrayBufferUtil.readArrayBuffer(RAW_FILENAME);

    const actionReplaySaveData = ActionReplaySaveData.createFromEmulatorData(rawArrayBuffer);

    expect(ArrayBufferUtil.arrayBuffersEqual(actionReplaySaveData.getArrayBuffer(), actionReplayArrayBuffer)).to.equal(true);
  });
});
