import AssetManager from "../assetManager";
import { hud } from "../hud";
import ParserUtils from "./parserUtils";
import SBBFileParser from "./sbbFileParser";
import SBLFileParser from "./sblFileParser";
import CSXParserWorker from "../workers/csxParser.worker?worker";


export default class CSXFileParser {
  public static async load(buffer: ArrayBuffer, fileName: string) {
    // help from noche and checkraisefold with this

    /*
        4 bytes - Magic, value 0x017EF1C5
        4 bytes - Offset from beginning of file where lookup table starts
        4 bytes - Amount of 0x40 byte segments in lookup table/assets stored by CSX file
        
        Rest of file until offset - Data.
        Rest of file at/after offset - 0x40 byte segments for lookup table

        Lookup table segments:
        each starting with 0x02005A58 magic (02 can be 01 or 04 instead, file type?)
        4 bytes - Offset from start of file where beginning of 0x4C file header starts. This file header seems to be mostly useless information?
        4 bytes - File size. This ends at the actual last byte from the file if you offset from the start of the file header.
        52 bytes - File name. This is padded with 0x00 bytes at the end.
      */

    return new Promise<void>((resolve, reject) => {

      const threads = 8;

      const fileNameQueue: Set<string> = new Set();

      const ctxThreadStatus = new Array(threads).fill(0).map(() => {
        return {
          id: hud.getWorkerId(),
          busy: false,
          status: "",
          fileName: "",
        }
      });

      const ctxThreads = new Array(threads).fill(0).map((_, index) => {
        const csxParserWorker = new CSXParserWorker();
        const workerStatusId = ctxThreadStatus[index].id;

        console.log(`[thread ${index}] created (workerStatusId: ${workerStatusId})`);

        csxParserWorker.onmessage = (e) => {
          const type = e.data.type;
          const fileName = e.data.fileName;

          if (fileName) {
            fileNameQueue.delete(fileName);
            if (fileNameQueue.size === 0) {
              csxParserWorker.postMessage({ type: 0x00 });

              ctxThreadStatus.forEach((thread, index) => {
                hud.deleteWorker(thread.id);
              })

              resolve();
              console.log("done");
            }
          }

          switch (type) {
            case 0x00: {
              // log
              hud.updateWorkerStatus(workerStatusId, e.data.status);
              hud.status = e.data.status;
            }
            case 0x01: {
              const block = e.data.block;
              AssetManager.blocks.set(fileName, block);

              ctxThreadStatus[index].busy = false;
              hud.clearWorkerStatus(workerStatusId);
              break;
            }
            case 0x02: {
              const building = e.data.building;
              AssetManager.buildings.set(fileName, building);

              ctxThreadStatus[index].busy = false;
              hud.clearWorkerStatus(workerStatusId);
              break;
            }
          }
        }

        return csxParserWorker;
      });

      function getWorker(): {
        worker: Worker,
        id: string
      } {
        for (let i = 0; i < ctxThreads.length; i++) {
          if (!ctxThreadStatus[i].busy) {
            ctxThreadStatus[i].busy = true;
            return {
              worker: ctxThreads[i],
              id: ctxThreadStatus[i].id,
            }
          }
        }

        const randomIndex = Math.floor(Math.random() * ctxThreads.length);

        return {
          worker: ctxThreads[randomIndex],
          id: ctxThreadStatus[randomIndex].id,
        }
      }

      function workerPostMessage(type: number, fileData: ArrayBuffer, fileName: string) {
        const workerInfo = getWorker();
        workerInfo.worker.postMessage({ type, fileData, fileName });
        hud.updateWorkerStatus(workerInfo.id, `Loading ${fileName}`);
      }

      const dataView = new DataView(buffer);

      const magic = dataView.getUint32(0, true);
      const tableOffset = dataView.getUint32(4, true);
      const tableSize = dataView.getUint32(8, true);

      let offset = tableOffset;

      let fileTable: {
        name: string;
        offset: number;
        size: number;
        magic: number;
      }[] = [];

      for (let i = 0; i < tableSize; i++) {
        const magic = dataView.getUint8(offset);
        const fileOffset = dataView.getUint32(offset + 4, true);
        const fileSize = dataView.getUint32(offset + 8, true);
        const fileName = ParserUtils.getString(dataView, offset + 12, 52);

        fileTable.push({
          name: fileName,
          offset: fileOffset,
          size: fileSize,
          magic: magic,
        });

        // console.log(`${i}/${tableSize}`, fileName, magic.toString(16));
        offset += 0x40;
      }

      // load files

      for (let i = 0; i < fileTable.length; i++) {
        const file = fileTable[i];
        switch (file.magic) {
          case 0x01: {
            const fileData = buffer.slice(file.offset, file.offset + file.size);

            fileNameQueue.add(file.name);
            workerPostMessage(0x01, fileData, file.name)
            break;
          }
          case 0x02: {
            const fileData = buffer.slice(file.offset, file.offset + file.size);
            try {

              fileNameQueue.add(file.name);
              workerPostMessage(0x02, fileData, file.name)
            }
            catch {
              console.log("go to hell moron");
            }
            break;
          }
          case 0x04: {
            const fileData = buffer.slice(file.offset + 0x4c, file.offset + file.size);
            AssetManager.loadTextureFromBuffer(fileData, file.name);
            break;
          }
        }
      }

    })
  }
}
