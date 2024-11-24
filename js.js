// this code might be change, for change the base form
const DECODE_BASE = 36;

// reusable function to generate compact data in base form
const getCompactData = (dataToCompact, length) =>
  parseInt(dataToCompact)
    .toString(DECODE_BASE)
    .toUpperCase()
    .padStart(length, 0);

// logic to compact the date to julian form
function getCompactDate(dateInPut = new Date()) {
  const date = new Date(dateInPut);

  const startOfYear = new Date(date.getFullYear(), 0, 1);

  //js only use milliseconds for date we change to date mm>sec>min>hours + (1 because in js 1 of jen start at 0)
  const julianDay =
    Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

  // we can change this to get more digits about the year
  const yearSuf = date.getFullYear() % 10;

  // base36 for legibility
  const dateCompacted = getCompactData(parseInt(`${yearSuf}${julianDay}`), 3);
  return dateCompacted;
}

function adler32Checksum(data) {
  // 65521 might be change to other prime number, however if you choose smaller it will be easy to cheaters
  const MOD_ADLER = 65521;
  let a = 1,
    b = 0;
  for (const char of data) {
    a = (a + char.charCodeAt()) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }

  // binary operations, the number 36 is to ensure a number between 0 and 9 or between A-Z for checksum operations
  // in js this operator <<, the excess bits shifted off to the left are discarded, and zero bits are shifted in from the right
  // eg. 0001 << 2 -> 0100
  // in js | (or) combine two or more binary number
  // eg. 0001 | 0010  -> 0011
  return getCompactData(((b << 16) | a) % 36, 1);
}

//decoders

function baseDecode(data) {
  return parseInt(data, DECODE_BASE);
}

function decodeDate(dateInput) {
  //split the code to decode the year example 4365 -> year 4
  const year = dateInput.toString().slice(0, 1);
  //split the code to decode the day  example 4365 -> year 356 and + 1 because in js the first day of year is 0
  const days = parseInt(dateInput.toString().slice(1, dateInput.length)) + 1;

  const startOfYear = new Date(`202${year}`, 0, 0);
  // arithmetic operation to add days
  const date = +startOfYear + 1000 * 60 * 60 * 24 * days;
  // set hours, minutes and seconds to 0 to match with test cases and ensure different validations
  const response = new Date(date).setUTCHours(0, 0, 0, 0);

  return new Date(response);
}

function validateChecksum(data, userInputCode) {
  const computedChecksum = adler32Checksum(data);
  return `${data}${computedChecksum}` === userInputCode;
}

// TODO: Modify this function
function generateShortCode(storeId, transactionId) {
  // Logic goes here

  const store = getCompactData(storeId, 2);
  const date = getCompactDate();
  const transaction = getCompactData(transactionId, 3);

  const result = `${store}${date}${transaction}${adler32Checksum(
    `${store}${date}${transaction}`
  )}`;
  //return result.match(new RegExp(/.{1,3}/, 'g')).join('-');
  return result;
}

// TODO: Modify this function
function decodeShortCode(shortCode) {
  // Logic goes here

  const shortCodeUpperCase = shortCode.toUpperCase().replaceAll('-', '');

  // logic validate length
  if (shortCodeUpperCase.length != 9) console.error('Error invalid code');

  const storeEncoded = shortCodeUpperCase.toString().slice(0, 2);
  const shopDateEncoded = shortCodeUpperCase.toString().slice(2, 5);
  const transactionEncoded = shortCodeUpperCase.toString().slice(5, 8);

  if (
    !validateChecksum(
      `${storeEncoded}${shopDateEncoded}${transactionEncoded}`,
      shortCodeUpperCase
    )
  )
    console.error('Invalid code');

  const storeDecode = baseDecode(storeEncoded);
  const shopDate = decodeDate(baseDecode(shopDateEncoded));
  const transactionDecode = baseDecode(transactionEncoded);

  return {
    storeId: storeDecode, // store id goes here,
    shopDate: shopDate, // the date the customer shopped,
    transactionId: transactionDecode, // transaction id goes here
  };
}

console.log(generateShortCode(431, 999));
console.log(decodeShortCode(generateShortCode(431, 999)));

// ------------------------------------------------------------------------------//
// --------------- Don't touch this area, all tests have to pass --------------- //
// ------------------------------------------------------------------------------//
function RunTests() {
  var storeIds = [175, 42, 0, 9];
  var transactionIds = [9675, 23, 123, 7];

  storeIds.forEach(function (storeId) {
    transactionIds.forEach(function (transactionId) {
      var shortCode = generateShortCode(storeId, transactionId);
      var decodeResult = decodeShortCode(shortCode);
      $('#test-results').append(
        '<div>' + storeId + ' - ' + transactionId + ': ' + shortCode + '</div>'
      );
      AddTestResult('Length <= 9', shortCode.length <= 9);
      AddTestResult('Is String', typeof shortCode === 'string');
      AddTestResult('Is Today', IsToday(decodeResult.shopDate));
      AddTestResult('StoreId', storeId === decodeResult.storeId);
      AddTestResult('TransId', transactionId === decodeResult.transactionId);
    });
  });
}

function IsToday(inputDate) {
  // Get today's date
  var todaysDate = new Date();
  // call setHours to take the time out of the comparison
  return inputDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0);
}

function AddTestResult(testName, testResult) {
  var div = $('#test-results').append(
    "<div class='" +
      (testResult ? 'pass' : 'fail') +
      "'><span class='tname'>- " +
      testName +
      "</span><span class='tresult'>" +
      testResult +
      '</span></div>'
  );
}
