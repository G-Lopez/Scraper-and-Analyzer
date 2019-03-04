//  :: gets "123 Nassau St, New York City, NY 10038-2415123 Nassau St, New York City, NY 10038-2415\n<!--\nfunction escramble_379(){\nvar a,b,c\na='00 1'\nb='233-'\na+=' 212'\nb+='2300'\nc='-'\ndocument.write(a+c+b)\n}\nescramble_379()\n//-->\nHotel website"
module.exports = (text) => {
  // :: clean and cut off everything after the address
  text = text.trim().split('\n')[0]
  // :: address comes in a duo, slice in half
  text = text.slice(text.length/2)

  return text
}
