const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function getCrc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
    }
  }
  return (~crc) >>> 0;
}

class ZipBuilder {
  constructor() {
    this.files = [];
  }

  addFile(zipPath, data, isExecutable = false) {
    const normPath = zipPath.replace(/\\/g, '/').replace(/^\/+/, '');
    const deflated = zlib.deflateRawSync(data);
    this.files.push({
      name: normPath,
      uncompressedSize: data.length,
      compressedSize: deflated.length,
      crc: getCrc32(data),
      data: deflated,
      isExecutable: isExecutable || normPath.endsWith('.sh') || normPath.endsWith('gradlew')
    });
  }

  addDirectory(dirPath, zipBase = '') {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (item === 'build' || item === '.gradle' || item === 'DerivedData') continue;
      const full = path.join(dirPath, item);
      const stat = fs.statSync(full);
      const relZip = (zipBase ? zipBase + '/' + item : item).replace(/\\/g, '/');
      if (stat.isDirectory()) {
        this.addDirectory(full, relZip);
      } else {
        const isExec = item === 'gradlew' || item.endsWith('.sh');
        this.addFile(relZip, fs.readFileSync(full), isExec);
      }
    }
  }

  build() {
    const localChunks = [];
    const centralChunks = [];
    let offset = 0;

    for (const file of this.files) {
      const nameBuf = Buffer.from(file.name, 'utf8');

      // Local header
      const lh = Buffer.alloc(30);
      lh.writeUInt32LE(0x04034b50, 0);
      lh.writeUInt16LE(20, 4);
      lh.writeUInt16LE(0, 6);
      lh.writeUInt16LE(8, 8);
      lh.writeUInt16LE(0, 10);
      lh.writeUInt16LE(0, 12);
      lh.writeUInt32LE(file.crc, 14);
      lh.writeUInt32LE(file.compressedSize, 18);
      lh.writeUInt32LE(file.uncompressedSize, 22);
      lh.writeUInt16LE(nameBuf.length, 26);
      lh.writeUInt16LE(0, 28);

      localChunks.push(lh, nameBuf, file.data);

      // Central directory header
      const cdh = Buffer.alloc(46);
      cdh.writeUInt32LE(0x02014b50, 0);
      cdh.writeUInt16LE(0x031e, 4); // UNIX 3.0
      cdh.writeUInt16LE(20, 6);
      cdh.writeUInt16LE(0, 8);
      cdh.writeUInt16LE(8, 10);
      cdh.writeUInt16LE(0, 12);
      cdh.writeUInt16LE(0, 14);
      cdh.writeUInt32LE(file.crc, 16);
      cdh.writeUInt32LE(file.compressedSize, 20);
      cdh.writeUInt32LE(file.uncompressedSize, 24);
      cdh.writeUInt16LE(nameBuf.length, 28);
      cdh.writeUInt16LE(0, 30);
      cdh.writeUInt16LE(0, 32);
      cdh.writeUInt16LE(0, 34);
      cdh.writeUInt16LE(0, 36);

      const mode = file.isExecutable ? 0o100755 : 0o100644;
      cdh.writeUInt32LE((mode << 16) >>> 0, 38);
      cdh.writeUInt32LE(offset, 42);

      centralChunks.push(cdh, nameBuf);

      offset += lh.length + nameBuf.length + file.data.length;
    }

    const centralStart = offset;
    let centralSize = 0;
    for (const c of centralChunks) centralSize += c.length;

    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0);
    eocd.writeUInt16LE(0, 4);
    eocd.writeUInt16LE(0, 6);
    eocd.writeUInt16LE(this.files.length, 8);
    eocd.writeUInt16LE(this.files.length, 10);
    eocd.writeUInt32LE(centralSize, 12);
    eocd.writeUInt32LE(centralStart, 16);
    eocd.writeUInt16LE(0, 20);

    return Buffer.concat([...localChunks, ...centralChunks, eocd]);
  }
}

// 1. Package Xcode iOS Project
console.log('Packaging iOS Xcode project...');
const iosZip = new ZipBuilder();
iosZip.addDirectory('ios', 'ios');
const iosBuf = iosZip.build();
fs.writeFileSync('ridingo-driver-app-ios.zip', iosBuf);
fs.writeFileSync('public/ridingo-driver-app-ios.zip', iosBuf);
console.log('Saved ridingo-driver-app-ios.zip (' + (iosBuf.length / 1024).toFixed(1) + ' KB)');

// 2. Package Android Studio Project
console.log('Packaging Android Studio project...');
const androidZip = new ZipBuilder();
androidZip.addDirectory('android', 'android');
const androidBuf = androidZip.build();
fs.writeFileSync('ridingo-driver-app-android.zip', androidBuf);
fs.writeFileSync('public/ridingo-driver-app-android.zip', androidBuf);
console.log('Saved ridingo-driver-app-android.zip (' + (androidBuf.length / 1024).toFixed(1) + ' KB)');
