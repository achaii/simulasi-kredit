const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const fileUcar = path.resolve('excel/02. MRP UCAR REGIONAL JABAR PERIODE JULI-SEPTEMBER 2026_SHARE.xlsx');
const fileUmcy = path.resolve('excel/02. MRP UMCY JABAR 1 PERIODE SEPTEMBER-DESEMBER 2026_SHARE.xlsx');

console.log('Loading Excel files...');
const wbUcar = xlsx.readFile(fileUcar);
const wbUmcy = xlsx.readFile(fileUmcy);

function cleanStr(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Parse UCAR Passenger
const passRows = xlsx.utils.sheet_to_json(wbUcar.Sheets['PASSENGER'], { header: 1 });
const ucarPassenger = [];
for (let i = 11; i < passRows.length; i++) {
  const r = passRows[i];
  if (r && r[0] && r[1]) {
    ucarPassenger.push({
      brand: cleanStr(r[0]),
      model: cleanStr(r[1]),
      type: cleanStr(r[2]),
      code: cleanStr(r[3]),
      category: 'PASSENGER'
    });
  }
}

// 2. Parse UCAR Commercial
const commRows = xlsx.utils.sheet_to_json(wbUcar.Sheets['COMMERCIAL'], { header: 1 });
const ucarCommercial = [];
for (let i = 11; i < commRows.length; i++) {
  const r = commRows[i];
  if (r && r[0] && r[1]) {
    ucarCommercial.push({
      brand: cleanStr(r[0]),
      model: cleanStr(r[1]),
      type: cleanStr(r[2]),
      code: cleanStr(r[3]),
      spec: cleanStr(r[4]),
      category: 'COMMERCIAL'
    });
  }
}

const allUcar = [...ucarPassenger, ...ucarCommercial];
console.log(`Parsed UCAR: ${ucarPassenger.length} passenger, ${ucarCommercial.length} commercial = ${allUcar.length} total rows.`);

// 3. Parse UMCY
const umcyRows = xlsx.utils.sheet_to_json(wbUmcy.Sheets['02. JAWA BARAT 1'], { header: 1 });
const allUmcy = [];
for (let i = 10; i < umcyRows.length; i++) {
  const r = umcyRows[i];
  if (r && r[0] && r[1]) {
    allUmcy.push({
      brand: cleanStr(r[0]),
      model: cleanStr(r[1]),
      code: cleanStr(r[2]),
      type: cleanStr(r[3])
    });
  }
}
console.log(`Parsed UMCY: ${allUmcy.length} total motor rows.`);

// 4. Generate unique cars list for vehicleData.json
const uniqueCars = [];
const seenCarModels = new Set();
for (const item of allUcar) {
  if (!seenCarModels.has(item.model)) {
    seenCarModels.add(item.model);
    uniqueCars.push(item.model);
  }
}

// 5. Generate unique motors list for vehicleData.json
const uniqueMotors = [];
const seenMotorModels = new Set();
for (const item of allUmcy) {
  if (!seenMotorModels.has(item.model)) {
    seenMotorModels.add(item.model);
    uniqueMotors.push(item.model);
  }
}

console.log(`Total unique cars: ${uniqueCars.length}`);
console.log(`Total unique motors: ${uniqueMotors.length}`);

// Write updated vehicleData.json
const newVehicleData = {
  cars: uniqueCars,
  motors: uniqueMotors,
  glossary: []
};
fs.writeFileSync('app/data/vehicleData.json', JSON.stringify(newVehicleData));
console.log('Successfully written app/data/vehicleData.json');

// 6. Build lookup maps from Excel
const ucarModelToItem = new Map();
const ucarCodeToItem = new Map();
for (const item of allUcar) {
  ucarModelToItem.set(item.model.toUpperCase(), item);
  if (item.code) ucarCodeToItem.set(item.code.toUpperCase(), item);
}

const umcyModelToItem = new Map();
const umcyCodeToItem = new Map();
for (const item of allUmcy) {
  umcyModelToItem.set(item.model.toUpperCase(), item);
  if (item.code) umcyCodeToItem.set(item.code.toUpperCase(), item);
}

// Known motorcycle brands/keywords for classifying remaining glossary items
const MOTOR_BRANDS = [
  'ALVA', 'APRILIA', 'BENELLI', 'BRP', 'CAN-AM', 'CAN AM', 'CF MOTO', 'CFMOTO', 'CHARGED',
  'DUCATI', 'ELECTRUM', 'GAS GAS', 'GASGAS', 'GESITS', 'HARLEY', 'HUSQVARNA',
  'INDIAN', 'ITALJET', 'KEEWAY', 'KAWASAKI', 'KTM', 'KYMCO', 'MOTO GUZZI',
  'MV AGUSTA', 'PIAGGIO', 'POLYTRON', 'ROYAL ALLOY', 'ROYAL ENFIELD', 'SEGWAY', 'SM SPORT',
  'SYM', 'TRIUMPH', 'TVS', 'U-WINFLY', 'UWINFLY', 'VESPA', 'VIAR', 'VOLTA', 'YADEA'
];

function isMotorEntry(model, code, namaPasar) {
  const m = model.toUpperCase();
  const c = code.toUpperCase();
  const n = namaPasar.toUpperCase();

  // If in UMCY
  if (umcyModelToItem.has(m) || umcyCodeToItem.has(c)) {
    return true;
  }
  // If in UCAR
  if (ucarModelToItem.has(m) || ucarCodeToItem.has(c)) {
    return false;
  }
  // Check known motorcycle brands
  for (const b of MOTOR_BRANDS) {
    if (m.startsWith(b) || n.includes(b) || m.includes(b)) {
      return true;
    }
  }
  // Special motor models
  if (/^(TUONO|RSV4|SR GT|RS 660|TUAREG|BEAT|VARIO|SCOOPY|PCX|ADV|NMAX|AEROX|MIO|LEXI|FAZZIO|FILANO|VIXION|R15|R25|KLX|D-TRACKER|NINJA|SATRIA|GSX|NEX)/i.test(m)) {
    return true;
  }
  return false;
}

// 7. Load and update existing glossaryData.json
const rawExistingGlossary = JSON.parse(fs.readFileSync('app/data/glossaryData.json', 'utf8'));
console.log(`Existing glossary items count: ${rawExistingGlossary.length}`);

const mergedGlossary = [];
const seenGlossaryKeys = new Set();

// Clean and normalize existing items
for (const g of rawExistingGlossary) {
  let model = cleanStr(g.model);
  let kodeStnk = cleanStr(g.kode_stnk);
  let namaPasar = cleanStr(g.nama_pasar);
  let kode = cleanStr(g.kode);

  // Sync kode with official Excel code if model matches
  const mUpper = model.toUpperCase();
  if (ucarModelToItem.has(mUpper)) {
    const excelItem = ucarModelToItem.get(mUpper);
    if (excelItem.code) kode = excelItem.code;
  } else if (umcyModelToItem.has(mUpper)) {
    const excelItem = umcyModelToItem.get(mUpper);
    if (excelItem.code) kode = excelItem.code;
  }

  const isMotor = isMotorEntry(model, kode, namaPasar);
  const key = `${model.toUpperCase()}||${kodeStnk.toUpperCase()}||${kode.toUpperCase()}`;

  if (!seenGlossaryKeys.has(key)) {
    seenGlossaryKeys.add(key);
    mergedGlossary.push({
      model,
      kode_stnk: kodeStnk,
      nama_pasar: namaPasar,
      kode,
      isMotor
    });
  }
}

// 8. Add all missing UCAR items
let addedUcar = 0;
const existingModelsUpper = new Set(mergedGlossary.map(g => g.model.toUpperCase()));

for (const item of allUcar) {
  const mUpper = item.model.toUpperCase();
  if (!existingModelsUpper.has(mUpper)) {
    const key = `${mUpper}||||${item.code.toUpperCase()}`;
    if (!seenGlossaryKeys.has(key)) {
      seenGlossaryKeys.add(key);
      existingModelsUpper.add(mUpper);
      mergedGlossary.push({
        model: item.model,
        kode_stnk: '',
        nama_pasar: item.model,
        kode: item.code,
        isMotor: false
      });
      addedUcar++;
    }
  }
}

// 9. Add all missing UMCY items
let addedUmcy = 0;
for (const item of allUmcy) {
  const mUpper = item.model.toUpperCase();
  if (!existingModelsUpper.has(mUpper)) {
    const key = `${mUpper}||||${item.code.toUpperCase()}`;
    if (!seenGlossaryKeys.has(key)) {
      seenGlossaryKeys.add(key);
      existingModelsUpper.add(mUpper);
      mergedGlossary.push({
        model: item.model,
        kode_stnk: '',
        nama_pasar: item.model,
        kode: item.code,
        isMotor: true
      });
      addedUmcy++;
    }
  }
}

console.log(`Added missing from UCAR: ${addedUcar}`);
console.log(`Added missing from UMCY: ${addedUmcy}`);
console.log(`Total final glossary items: ${mergedGlossary.length}`);

// Write updated glossaryData.json
fs.writeFileSync('app/data/glossaryData.json', JSON.stringify(mergedGlossary));
console.log('Successfully written app/data/glossaryData.json');

// Final check
const finalModelSet = new Set(mergedGlossary.map(g => g.model.toUpperCase()));
const finalCarsMissing = uniqueCars.filter(c => !finalModelSet.has(c.toUpperCase()));
const finalMotorsMissing = uniqueMotors.filter(m => !finalModelSet.has(m.toUpperCase()));

console.log(`Final check - Missing cars: ${finalCarsMissing.length}`);
console.log(`Final check - Missing motors: ${finalMotorsMissing.length}`);
console.log('ALL EXCEL VEHICLES SUCCESSFULLY INTEGRATED 100%!');
