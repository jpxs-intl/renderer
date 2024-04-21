import SBBFileParser from "../parsers/sbbFileParser";
import SBLFileParser from "../parsers/sblFileParser";

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

let totalSize = 0;

onmessage = function (e) {

    const type: number = e.data.type;
    const buffer: ArrayBuffer = e.data.fileData;
    const fileName: string = e.data.fileName;
    totalSize += buffer?.byteLength || 0;

    switch (type) {
        case 0x00: {
            // done
            postMessage({ type: 0x00, status: `CSX Loaded! ${formatBytes(totalSize)}` });
        }
        case 0x01: {
            const block = SBLFileParser.loadBlock(buffer, fileName);
            postMessage({ type: 0x01, block, fileName });
            postMessage({ type: 0x00, status: `Loaded block ${fileName} (${formatBytes(buffer.byteLength)})` });
            break;
        }
        case 0x02: {
            const building = SBBFileParser.load(buffer, fileName);
            postMessage({ type: 0x02, building, fileName });
            postMessage({ type: 0x00, status: `Loaded building ${fileName} (${formatBytes(buffer.byteLength)})` });
            break;
        }
    }
}