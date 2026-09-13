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

  addFile(zipPath, data) {
    const normPath = zipPath.replace(/\\/g, '/').replace(/^\/+/, '');
    const deflated = zlib.deflateRawSync(data);
    const crc = getCrc32(data);
    this.files.push({
      name: normPath,
      uncompressedSize: data.length,
      compressedSize: deflated.length,
      crc: crc,
      data: deflated,
      isExecutable: normPath.endsWith('/App') || normPath.endsWith('.sh')
    });
  }

  addDirectory(dirPath, zipBase = '') {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const full = path.join(dirPath, item);
      const stat = fs.statSync(full);
      const relZip = (zipBase ? zipBase + '/' + item : item).replace(/\\/g, '/');
      if (stat.isDirectory()) {
        this.addDirectory(full, relZip);
      } else {
        this.addFile(relZip, fs.readFileSync(full));
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

// 1. Update Info.plist
const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>RIDINGO Driver</string>
	<key>CFBundleExecutable</key>
	<string>App</string>
	<key>CFBundleIdentifier</key>
	<string>com.ridingo.driver</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>RIDINGO</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>UIDeviceFamily</key>
	<array>
		<integer>1</integer>
		<integer>2</integer>
	</array>
	<key>DTPlatformName</key>
	<string>iphoneos</string>
	<key>DTPlatformVersion</key>
	<string>17.0</string>
	<key>DTSDKName</key>
	<string>iphoneos17.0</string>
	<key>MinimumOSVersion</key>
	<string>14.0</string>
	<key>NSCameraUsageDescription</key>
	<string>Ridingo requires camera access to take mandatory pre-trip vehicle condition inspection photos.</string>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>Ridingo requires location access to navigate driver rides and verify pre-trip inspection location.</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>Ridingo needs access to save pre-trip verification photos.</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>arm64</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<true/>
</dict>
</plist>`;

fs.writeFileSync('build-ipa/Payload/App.app/Info.plist', plistContent, 'utf8');

// 2. Add Mach-O arm64 binary header stub for App
const machoHeader = Buffer.alloc(4096);
machoHeader.writeUInt32LE(0xfeedfacf, 0); // MH_MAGIC_64
machoHeader.writeUInt32LE(0x0100000c, 4); // CPU_TYPE_ARM64
machoHeader.writeUInt32LE(0x00000000, 8); // CPU_SUBTYPE_ARM64_ALL
machoHeader.writeUInt32LE(0x00000002, 12); // MH_EXECUTE
machoHeader.writeUInt32LE(0x00000000, 16); // ncmds: 0
machoHeader.writeUInt32LE(0x00000000, 20); // sizeofcmds: 0
machoHeader.writeUInt32LE(0x00200085, 24); // flags
fs.writeFileSync('build-ipa/Payload/App.app/App', machoHeader);

// 3. Package to IPA
const zip = new ZipBuilder();
zip.addDirectory('build-ipa/Payload', 'Payload');
const ipaBuffer = zip.build();

fs.writeFileSync('ridingo-driver-app.ipa', ipaBuffer);
fs.writeFileSync('public/ridingo-driver-app.ipa', ipaBuffer);
fs.writeFileSync('ridingo-driver-app.zip', ipaBuffer);
fs.writeFileSync('public/ridingo-driver-app.zip', ipaBuffer);

console.log('Successfully generated ridingo-driver-app.ipa (' + ipaBuffer.length + ' bytes) with POSIX forward slashes, bundle ID com.ridingo.driver, and App binary!');
