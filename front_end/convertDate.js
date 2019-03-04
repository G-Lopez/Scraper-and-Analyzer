var convertDate = function(date) {
   var monthArray = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
   var dateArray = date.split('-');
   var fdate = '' + monthArray[Number(dateArray[0]) - 1] + ' ' + Number(dateArray[1]) + ', ' + dateArray[2];

   return fdate;
}

console.log(convertDate("07-12-2014"));
