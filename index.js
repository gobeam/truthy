const getNumberOfDistinctArrayValues = (arr) => {
  if (arr.length < 1) return 0;
  let uniqueArray = [];
  for (const element of arr) {
    if (!uniqueArray.includes(element)) {
      uniqueArray.push(element);
    }
  }
  return uniqueArray.length;
};

console.log(getNumberOfDistinctArrayValues([]));
