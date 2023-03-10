// All valid credit card numbers
const valid1 = [4, 5, 3, 9, 6, 7, 7, 9, 0, 8, 0, 1, 6, 8, 0, 8];
const valid2 = [5, 5, 3, 5, 7, 6, 6, 7, 6, 8, 7, 5, 1, 4, 3, 9];
const valid3 = [3, 7, 1, 6, 1, 2, 0, 1, 9, 9, 8, 5, 2, 3, 6];
const valid4 = [6, 0, 1, 1, 1, 4, 4, 3, 4, 0, 6, 8, 2, 9, 0, 5];
const valid5 = [4, 5, 3, 9, 4, 0, 4, 9, 6, 7, 8, 6, 9, 6, 6, 6];

// All invalid credit card numbers
const invalid1 = [4, 5, 3, 2, 7, 7, 8, 7, 7, 1, 0, 9, 1, 7, 9, 5];
const invalid2 = [5, 7, 9, 5, 5, 9, 3, 3, 9, 2, 1, 3, 4, 6, 4, 3];
const invalid3 = [3, 7, 5, 7, 9, 6, 0, 8, 4, 4, 5, 9, 9, 1, 4];
const invalid4 = [6, 0, 1, 1, 1, 2, 7, 9, 6, 1, 7, 7, 7, 9, 3, 5];
const invalid5 = [5, 3, 8, 2, 0, 1, 9, 7, 7, 2, 8, 8, 3, 8, 5, 4];

// Can be either valid or invalid
const mystery1 = [3, 4, 4, 8, 0, 1, 9, 6, 8, 3, 0, 5, 4, 1, 4];
const mystery2 = [5, 4, 6, 6, 1, 0, 0, 8, 6, 1, 6, 2, 0, 2, 3, 9];
const mystery3 = [6, 0, 1, 1, 3, 7, 7, 0, 2, 0, 9, 6, 2, 6, 5, 6, 2, 0, 3];
const mystery4 = [4, 9, 2, 9, 8, 7, 7, 1, 6, 9, 2, 1, 7, 0, 9, 3];
const mystery5 = [4, 9, 1, 3, 5, 4, 0, 4, 6, 3, 0, 7, 2, 5, 2, 3];

// An array of all the arrays above
const batch = [valid1, valid2, valid3, valid4, valid5, invalid1, invalid2, invalid3, invalid4, invalid5, mystery1, mystery2, mystery3, mystery4, mystery5];

// Add your functions below:
const luhnCheck = array => {
	const arr = array.map(el => el).reverse();
  const newArr = [];
  
  let cache = 0;
  for( let i = 0; i < arr.length; i++ ) {
  	if( i % 2 === 1 ) { 
    	cache = arr[i] * 2;
      if( cache > 9 ) {
        cache = cache - 9;
      }
    }
    else {
    	cache = arr[i];
    }
    newArr.push(cache);
  }
  
  let sum = newArr.reduce( (prev, curr) => prev + curr );
  return sum % 10;
  
}
const validateCred = (array) => {

  const sum = luhnCheck(array);
  
  if (sum === 0) {
  	 return true;
  }
}
const findInvalidCards = (arrays) => {
  return arrays.filter(arr => !validateCred(arr));
};

const idInvalidCardCompanies = (array) => {
  const invalidCards = findInvalidCards(array);
  let countamex, countvisa, countmaster, countdiscover, countunknown;
  countamex = countvisa = countmaster = countdiscover = countunknown = 0;
  
  invalidCards.forEach(arr => {
    const firstDigit = arr[0];
    switch (firstDigit) {
      case 3:
        countamex++;
        break;
      case 4:
        countvisa++;
        break;
      case 5:
        countmaster++;
        break;
      case 3:
        countdiscover++;
        break;
      default:
        countunknown++;
        break;
    }
  });

  const cards = [['Amex', countamex], ['Visa', countvisa], ['Mastercard', countmaster], ['Discover', countdiscover]];
  cards.forEach((card, index) => {
    if (card[1] > 0) console.log(card[0] + ' delivered ' + card[1] + ' invalid card numbers');
  });
  if (countunknown > 0) console.log(countunknown + 'x Company not found')
}

const validateCards = (arrays) => {
	const invalidCards = arrays.filter(arr => !validateCred(arr));

  const validCards = invalidCards.map(arr => {
    let rest = luhnCheck(arr);
  	let counter = arr.length-2;
    while(rest > 0) {
      if(arr[counter] < 9) {
        arr[counter] = arr[counter] + 1;
      }
      rest = luhnCheck(arr);
      counter -= 2;
      if(counter <= 0) counter = arr.length-2;
    }
    console.log(rest);
    return arr;
  });
  return validCards;
};

const formatCards = arrays => {
	return arrays.map(arr => {
  	return arr.join('');
  });
}

const validatedCards = validateCards([invalid1, invalid2, invalid3, invalid4, invalid5]);
console.log(formatCards(validatedCards));
