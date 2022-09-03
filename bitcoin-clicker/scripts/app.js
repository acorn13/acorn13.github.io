var bitcoins = 0
var bitcoinRate = 0
var totalSeconds = 0;

var longestGame = 0;
var highestRate = 0;
var records = {};

var click = 0;
// records.longestGame = 0;
// console.log(records);

// localStorage.setItem("totalSeconds", "0");

// Every item in the game
// TODO: items should be part of the Game variable
var items = [
  {
    "name": "item_oldCalculator",
    "price": "0.0000001"
  },
  {
    "name": "item_oldCpu",
    "price": "0.00000125"
  },
  {
    "name": "item_oldComputerFromGrandpa",
    "price": "0.00003"
  },
  {
    "name": "item_rapsberrypy",
    "price": "0.00005"
  },
  {
    "name": "item_smartphone",
    "price": "0.0005"
  },
  {
    "name": "item_middleClassPC",
    "price": "0.0015"
  },
  {
    "name": "item_cheapServer",
    "price": "0.004"
  },
  {
    "name": "item_gamingPC",
    "price": "0.015"
  },
  {
    "name": "item_cheapMiner",
    "price": "0.05"
  },
  {
    "name": "item_highEndUltraPC",
    "price": "0.15"
  },
  {
    "name": "item_bigMiner",
    "price": "1.5"
  },
  {
    "name": "item_miningFarm",
    "price": "250"
  },
  {
    "name": "item_nasaPC",
    "price": "5000"
  },
  {
    "name": "item_quantumRig",
    "price": "245000"
  },
  {
    "name": "item_miningFarmSpace",
    "price": "2000000"
  },
  {
    "name": "item_miningFarmMoon",
    "price": "75500000"
  },
  {
    "name": "item_bitcoinTimeMachine",
    "price": "975000000"
  },
  {
    "name": "item_blackHolePoweredMiner",
    "price": "750000000000"
  }
]

/**
 *
 *  <-- Setting up the game´s functions -->
 *
 */

var bSecInterval = null

// Game variable which will contain any needed major function or needed variables for the game.
var Game = {}


// Every constant variable is saved here
Game.GameConst = {
  "priceMultiplier": 1.15,
  "VERSION": "2.0.2"
}

Game.units = [
      "Million",
      "Billion",
      "Trillion",
      "Quadrillion",
      "Quintillion",
      "Sextillion",
      "Septillion",
      "Octillion",
      "Nonillion",
      "Decillion",
      "Undecillion",
      "Duodecillion",
      "Tredecillion",
      "Quattuordecillion",
      "Quindecillion",
      "Sexdecillion",
      "Septdecillion",
      "Octodecillion",
      "Novemdecillion",
      "Vigintillion",
      "Unvigintillion",
      "Duovigintillion",
      "Trevigintillion",
      "Quattuorvigintillion",
      "Quinvigintillion",
      "Sexvigintillion",
      "Septvigintillion",
      "Octovigintillion",
      "Novemvigintillion",
      "Trigintillion"
]



/**
 * Calculating every price for the items when the game was started (and if there are any items).
 *
 * @param element {HTMLElement} - The HTML element of the item on the game page
 * @param price {Number} - The price of the item, got from the items Object
 * @param itemAmount {Number} - The current amount of the item, saved in the localStorage
 */

Game.setPriceAtGameBeginning = function (element, price, itemAmount) {

  // Calculation of the price
  var multiplier = Game.GameConst.priceMultiplier

  // Calculate the new price -> price * multiplier^itemAmount
  var calculation = (parseFloat(price) * Math.pow(multiplier, parseInt(itemAmount))).toFixed(8)

  // Showing the actual price
  element.children()[2].textContent = calculation + " Bitcoins"

  // Set the data-price attribute with the new price
  element.attr("data-price", calculation.toString())

}



/**
 * Function to increase the amount of the item (in the localStorage) with the specific identifier.
 *
 * @param id - The identifier of the item (the id from the list element)
 */
Game.itemAction = function (id) {

  var item = id
  var itemAmount = 0;

  if(localStorage.getItem(item) === null){
    localStorage.setItem(item, "1");
  }else{
    itemAmount = parseInt(localStorage.getItem(item))

    localStorage.setItem(item, "" + (itemAmount + 1) + "");

  }

}



/**
 * Calculating the Bitcoins per Second - rate when the page was opened.
 *
 */
Game.setBitcoinPerSecondRateAtBeginning = function () {

  for(var i = 0; i < items.length; i++){
    if(localStorage.getItem(items[i].name) === null){
      localStorage.setItem(items[i].name, "0")
    }else{
      // HTML element on the game page
      var $element = $("#" + items[i].name)

      // Amnount of the item
      var itemAmount = localStorage.getItem(items[i].name)

      // Writing the amount on the page at the item´s element
      $element.children()[0].textContent = itemAmount

      // Only calculate the new price if there is more than 0 items.
      // If there are not enough items, it will just continue, and if there are,
      // it will execute the function and continue after it as well.
      if(itemAmount > 0) {
        Game.setPriceAtGameBeginning($element, parseFloat(items[i].price), parseInt(itemAmount))
      }

      // Getting the data-bits-per-sec attribute, needed for calculating the bitcoin/sec rate
      var bits_per_sec = $element.attr("data-bits-per-sec")
      itemAmount = parseInt(itemAmount)

      // The rate before
      var before = bitcoinRate

      // Calculating the rate
      bitcoinRate = bitcoinRate + (itemAmount * bits_per_sec)

      // Logging the calculation in the console
      // console.log("i = " + i + " | B/sec before: " + before.toFixed(8) +
      //   " - Calculation made: " + before.toFixed(8) + " + (" + itemAmount + " * " + bits_per_sec + ") = " +  bitcoinRate.toFixed(8) +
      //   " | New B/sec at " + bitcoinRate.toFixed(8))
    }
  }

}



/**
 * Function which sets a new "Bitcoin per Second" rate
 *
 * @param rate - The number which must be added to the current Bitcoin per Second - rate
 * @returns {Number} - Returning the new Bitcoin per Second - rate
 */
Game.setNewBitcoinRate = function (rate) {

  // Logging the new Bitcoin per second rate
  // console.log("setNewBitcoinRate -> New rate: " + (bitcoinRate + rate).toFixed(8) )

  // Showing the new rate on the page
  // Rounding at specific values
  if((bitcoinRate + rate) >= 1000000) {
    $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(0).optimizeNumber())
  }else if((bitcoinRate + rate) >= 1000 ){
    $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(0))
  }else if((bitcoinRate + rate) >= 1 ){
    $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(2))
  }else{
    $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(8))
  }

  if( records.highestRate === undefined || records.highestRate === null || records.highestRate <= (bitcoinRate + rate) ){
    records.highestRate = (bitcoinRate + rate);

    localStorage.setItem("records", JSON.stringify(records));

    if((bitcoinRate + rate) >= 1000000) {
      // $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(0).optimizeNumber())
      document.getElementById("highestRate").innerHTML = ( (bitcoinRate + rate).toFixed(0).optimizeNumber() );
    }else if((bitcoinRate + rate) >= 1000 ){
      // $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(0))
      document.getElementById("highestRate").innerHTML = ( (bitcoinRate + rate).toFixed(0) );
    }else if((bitcoinRate + rate) >= 1 ){
      // $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(2))
      document.getElementById("highestRate").innerHTML = ( (bitcoinRate + rate).toFixed(2) );
    }else{
      // $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(8))
      document.getElementById("highestRate").innerHTML = ( (bitcoinRate + rate).toFixed(8) );
    }
  }

  // Returning the new rate
  return bitcoinRate = bitcoinRate + rate;

}



/**
 * This function will check if there is any change in the localStorage,
 * especially looking at the item amount. So it will actually calculate every price again and
 * again. (This function should be recoded)
 *
 * TODO: Find a better way for setting the price after an item was bought.
 */
Game.setNewPrice = function()
{
  // for-loop for getting the price multiplier and to calculate the new price
  for(var i = 0; i < items.length; i++){
    if(localStorage.getItem(items[i].name) === null){
      localStorage.setItem(items[i].name, "0")
    }else{
      var $element = $("#" + items[i].name)
      var itemAmount = localStorage.getItem(items[i].name)

      $element.children()[0].textContent = itemAmount

      // Only calculate if there is more than 0 items
      if(itemAmount > 0) {

        // Calculation of the price
        var multiplier = Game.GameConst.priceMultiplier
        var calculation = (parseFloat(items[i].price) * Math.pow(multiplier, parseInt(itemAmount))).toFixed(8)

        // Showing the actual price
        $element.children()[2].textContent = calculation + " Bitcoins"

        // Set the data-price attribute with the new price
        $element.attr("data-price", calculation.toString())

      }
    }
  }
  // End of the for-loop
}

/**
 * The function which adds new generated Bitcoins to the current Bitcoin amount.
 *
 * @param rate - The Bitcoin per second rate; Needed for adding the generated Bitcoins every second
 */
Game.bSecFunction = function (rate) {

  setActive();

  // Pause when mouse outside window
  if (cursorInPage !== true) {
      // console.log('Game Paused');
      return;
  }

  countTimer();

  bitcoins = bitcoins + rate

  // Show both values on the page
  // Rounding the bitcoin number at specific set values
  if(bitcoins > 1000000){

    let bitcoinUnitNumber = bitcoins.optimizeNumber()

    $(".bitcoinAmount").text(bitcoinUnitNumber)
  }else if(bitcoins >= 1000){
    $(".bitcoinAmount").text(bitcoins.toFixed(0))
  }else if(bitcoins >= 1){
    $(".bitcoinAmount").text(bitcoins.toFixed(2))
  }else{
    $(".bitcoinAmount").text(bitcoins.toFixed(8))
  }


  // Rounding the satoshis amount at a specific value and optimize it for displaying on the screen.
  var satoshis = bitcoins * 100000000;

  if(satoshis < 1000000) {
    $(".satoshiAmount").text(Math.round(satoshis))
  }else{

    let satoshiUnitNumber = satoshis.optimizeNumber()
    $(".satoshiAmount").text(satoshiUnitNumber)
  }

  // Save bitcoin amount in the storage
  localStorage.setItem("bitcoins", "" + bitcoins + "")

  // console.log("bSec -> B/sec at " + rate.toFixed(8))
  setActive();

  if( records.highestGame === undefined || records.highestGame === null || parseFloat(bitcoins.toFixed(8)) >= parseFloat(records.highestGame.toFixed(8)) ){
    records.highestGame = bitcoins;

    localStorage.setItem("records", JSON.stringify(records));

    if( bitcoins >= 1000000 ) {
      document.getElementById("highestGame").innerHTML = ( (bitcoins).toFixed(0).optimizeNumber() );
    }else if( bitcoins >= 1000 ){
      document.getElementById("highestGame").innerHTML = ( (bitcoins).toFixed(0) );
    }else if( bitcoins >= 1 ){
      document.getElementById("highestGame").innerHTML = ( (bitcoins).toFixed(2) );
    }else{
      document.getElementById("highestGame").innerHTML = ( (bitcoins).toFixed(8) );
    }
  }
}

/**
 * Stops the B/sec interval.
 */
Game.stopBsec = function () {
  clearInterval(bSecInterval);
  setActive();
}

/**
 * Function for optimizing the number with an unit for displaying it on the screen.
 *
 * @returns {string} An optimized number as a string with its unit
 */
Game.optimizeNumber = function () {
  if(this >= 1e6){
    let number = parseFloat(this)
    let unit = Math.floor(parseFloat(number.toExponential(0).toString().replace("+", "").slice(2)) / 3) * 3

    // let test = this.toExponential(0).toString().replace("+", "").slice(2)
    // console.log(test)

    var num = (this / ('1e'+(unit))).toFixed(2)

    var unitname = Game.units[Math.floor(unit / 3) - 1]

    return num + " " + unitname
  }

  return this.toLocaleString()
}

Number.prototype.optimizeNumber = Game.optimizeNumber
String.prototype.optimizeNumber = Game.optimizeNumber

/**
 * Resets the game
 */
Game.resetGame = function () {
  Game.stopBsec()
  localStorage.setItem("bitcoins", "0");
  localStorage.setItem("totalSeconds", "0");
  // items
  items.forEach(function(element) {
    // console.log(element.name);
    localStorage.setItem(element.name, "0");
  });

  // localStorage.clear();
  // localStorage.setItem("records", JSON.stringify(records));
  location.reload();
  setActive();
}

// --------------------------------------------------- //

/**
 * <-- Now doing everything -->
 */


// Calculates the Bitcoin/sec rate with the amount of every item multiplied with their given Bitcoins/second rate.
Game.setBitcoinPerSecondRateAtBeginning()

// Stating the interval with the calculated Bitcoin/second rate.
clearInterval(bSecInterval);
bSecInterval = setInterval(function () {
  Game.bSecFunction(bitcoinRate);
}, 1000)

// Rate is null (at the beginning)
var bSec = null;

// If there is no bitcoins Item in the localStorage, create one.
// If there is one, do the other thing.
if(localStorage.getItem("bitcoins") === null){
  // Bitcoins are 0
  bitcoins = 0

  // Set the localStorage Item for the first time
  localStorage.setItem("bitcoins", "0");

  if(localStorage.getItem("totalSeconds") === null){
    localStorage.setItem("totalSeconds", "0");
    totalSeconds = 0;
  }

  // Write the current amount of Bitcoins on the page
  $(".bitcoinAmount").text(bitcoins.toFixed(8));

  // totalSeconds = 0;

  countTimer();

}else{
  // Get the amount of Bitcoins and parse them to a float number
  bitcoins = parseFloat(localStorage.getItem("bitcoins"));
  // totalSeconds = localStorage.getItem("totalSeconds");

  if(localStorage.getItem("totalSeconds") === null || isNaN(localStorage.getItem("totalSeconds")) ){
    localStorage.setItem("totalSeconds", "0");
    totalSeconds = 0;
  }else{
    totalSeconds = parseInt(localStorage.getItem("totalSeconds"));
  }

  var hour = Math.floor(totalSeconds /3600).toString().padStart(2, '0');
  var minute = Math.floor((totalSeconds - hour*3600)/60).toString().padStart(2, '0');
  var seconds = (totalSeconds - (hour*3600 + minute*60)).toString().padStart(2, '0');

  document.getElementById("timer").innerHTML = hour + ":" + minute + ":" + seconds;

  if(localStorage.getItem("records") !== null){
    records = JSON.parse(localStorage.getItem("records"));
  }

  if(records.longestGame === null || isNaN(records.longestGame) ){
    records.longestGame = 0;
    longestGame = 0;
  }else{
    longestGame = records.longestGame;
  }

  var hour = Math.floor(longestGame /3600).toString().padStart(2, '0');
  var minute = Math.floor((longestGame - hour*3600)/60).toString().padStart(2, '0');
  var seconds = (longestGame - (hour*3600 + minute*60)).toString().padStart(2, '0');

  document.getElementById("longestGame").innerHTML = hour + ":" + minute + ":" + seconds;

  if(records.highestGame === null || isNaN(records.highestGame) ){
    records.highestGame = 0;
    highestGame = 0;
  }else{
    highestGame = records.highestGame;
  }

  document.getElementById("highestGame").innerHTML = displayBitcoins(highestGame);

  if(records.mostClicks === null || isNaN(records.mostClicks) ){
    records.mostClicks = 0;
    mostClicks = 0;
  }else{
    mostClicks = records.mostClicks;
  }

  document.getElementById("mostClicks").innerHTML = mostClicks;

  if(records.highestRate === null || isNaN(records.highestRate) ){
    records.highestRate = 0;
    highestRate = 0;
  }else{
    highestRate = records.highestRate;
  }

  document.getElementById("highestRate").innerHTML = displayBitcoins( highestRate );

  $(".bitcoinAmount").text("loading...")
  $(".satoshiAmount").text("loading...")

  let satoshis = bitcoins * 100000000;

  setActive();

  // console.log(localStorage);

}

function setActive(){
  // $(".purchaseItem").removeClass('inactive');

  $(".purchaseItem").each(function(){

    // id of the item
    var id = $(this).attr("id");

    // The price attribute as a float number
    var price = parseFloat($(this).attr("data-price"));

    // If you have enough Bitcoins, it´ll buy one item
    if(parseFloat(bitcoins.toFixed(8)) >= price){
      $(this).removeClass('inactive');
    }else{
      $(this).addClass('inactive');
    }

  });


}



// Pause on mouse exit
var cursorInPage = true;

// Doing everything here when the game is ready to be used.
$(document).ready(function () {

   $(document).foundation();

  $(window).on('mouseout', function() {
      cursorInPage = false;
      $("body").removeClass("active");
  });
  $(window).on('mouseover', function() {
      cursorInPage = true;
      $("body").addClass("active");
  });

  // Write the version into the .version span element
  $(".version").text("Version " + Game.GameConst.VERSION)

  // Write the bitcoin per second rate into the .bSecRateNumber span element
  if(bitcoinRate >= 1000){
    $(".bSecRateNumber").text(bitcoinRate.toFixed(0))
  }else if(bitcoinRate >= 1 ){
    $(".bSecRateNumber").text(bitcoinRate.toFixed(2))
  }else{
    $(".bSecRateNumber").text(bitcoinRate.toFixed(8))
  }

  // If clicked on the big Bitcoin
  $(".bitcoin").click(function () {

    ++click;

    if( records.mostClicks === undefined || records.mostClicks === null || records.mostClicks <= click ){
      records.mostClicks = click;

      localStorage.setItem("records", JSON.stringify(records));
      localStorage.setItem("click", click);

      document.getElementById("mostClicks").innerHTML = click;
    }

    // Add 1^-8 Bitcoins (equal to 1 satoshi)
    bitcoins = bitcoins + 0.00000001

    // Show the new number on the page
    if(bitcoins > 1000000){

      let bitcoinUnitNumber = bitcoins.optimizeNumber()
      $(".bitcoinAmount").text(bitcoinUnitNumber)

    }else if(bitcoins >= 1000){
      $(".bitcoinAmount").text(bitcoins.toFixed(0))
    }else if(bitcoins >= 1){
      $(".bitcoinAmount").text(bitcoins.toFixed(2))
    }else{
      $(".bitcoinAmount").text(bitcoins.toFixed(8))
    }

    if((bitcoins * 100000000) < 1000000) {
      $(".satoshiAmount").text(Math.round((bitcoins * 100000000)))
    }else{

      let satoshiUnitNumber = (bitcoins * 100000000).optimizeNumber()
      $(".satoshiAmount").text(satoshiUnitNumber)
    }

    // Save the new amount of Bitcoins in the localStorage storage
    localStorage.setItem("bitcoins", "" + bitcoins + "")

    setActive();

  });


  // If any item from the list was clicked...
  $(".purchaseItem").click(function () {

    // Get following attributes and children elements

    // id of the item
    var id = $(this).attr("id")

    // The price attribute as a float number
    var price = parseFloat($(this).attr("data-price"))

    // The b/sec attribute from the item as a float number
    var bitcoinsPerSecond = parseFloat($(this).attr("data-bits-per-sec"))

    // The element which shows how many of the item is existing
    var amountDisplay = $(this).children()[0]
    var amountDisplayAmount = parseInt(localStorage.getItem(id))

    var priceDisplay = $(this).children()[2]

    // If you have enough Bitcoins, it´ll buy one item
    if(parseFloat(bitcoins.toFixed(8)) >= price){

      // Substract the price from the current Bitcoin number and set it to the bitcoins variable.
      bitcoins = parseFloat(bitcoins.toFixed(8)) - price

      // Save the new amount of Bitcoins in the localStorage storage
      localStorage.setItem("bitcoins", "" + bitcoins + "")

      // Changing amount number on the right of the item
      amountDisplayAmount = amountDisplayAmount + 1
      amountDisplay.textContent = amountDisplayAmount.toString()

      // Changing the Bitcoins amount
      // Rounding the Bitcoin number at specific values
      if(bitcoins > 1e6){

        let bitcoinUnitNumber = bitcoins.optimizeNumber()
        $(".bitcoinAmount").text(bitcoinUnitNumber)

      }else if(bitcoins >= 1000){
        $(".bitcoinAmount").text(bitcoins.toFixed(0))
      }else if(bitcoins >= 1){
        $(".bitcoinAmount").text(bitcoins.toFixed(2))
      }else{
        $(".bitcoinAmount").text(bitcoins.toFixed(8))
      }

      // Calculation the Satoshi amount
      if((bitcoins * 100000000) < 1e6) {
        $(".satoshiAmount").text(Math.round((bitcoins * 100000000)))
      }else{

        let satoshiUnitNumber = (bitcoins * 100000000).optimizeNumber()
        $(".satoshiAmount").text(satoshiUnitNumber)

      }

      // Increasing the amount of the specific item
      Game.itemAction(id)

      // Stops the interval
      Game.stopBsec()

      // Setting a new price and show it
      Game.setNewPrice()

      // Saving the new calculated Bitcoin/second rate in a variable
      var newRate = Game.setNewBitcoinRate(bitcoinsPerSecond)

      // Restarting the interval with the new rate
      clearInterval(bSecInterval);
      bSecInterval = setInterval(function () {
        Game.bSecFunction(newRate);
      }, 1000)

    }

  })

  //
  // If the reset button was pressed, do following thing
  $(".resetButton").click(function () {
    Game.resetGame();
  })

});


var startTime = new Date();

function countTimer() {

  endTime = new Date();

  var timeDiff = endTime - startTime; //in ms
  // timeDiff /= 1000;

  startTime = new Date();

  if(timeDiff <= 990){
     return;
  }

   ++totalSeconds;
   var hour = Math.floor(totalSeconds /3600).toString().padStart(2, '0');
   var minute = Math.floor((totalSeconds - hour*3600)/60).toString().padStart(2, '0');
   var seconds = (totalSeconds - (hour*3600 + minute*60)).toString().padStart(2, '0');

   document.getElementById("timer").innerHTML = hour + ":" + minute + ":" + seconds;

   // localStorage.setItem("totalSeconds", "" + totalSeconds + "");

   // console.log(records);

   if( records.longestGame === undefined || records.longestGame === null || records.longestGame <= totalSeconds ){
      records.longestGame = totalSeconds;

      localStorage.setItem("records", JSON.stringify(records));
      localStorage.setItem("totalSeconds", totalSeconds);

      var hour = Math.floor(totalSeconds /3600).toString().padStart(2, '0');
      var minute = Math.floor((totalSeconds - hour*3600)/60).toString().padStart(2, '0');
      var seconds = (totalSeconds - (hour*3600 + minute*60)).toString().padStart(2, '0');

      document.getElementById("longestGame").innerHTML = hour + ":" + minute + ":" + seconds;

   }
}


function displayBitcoins(amount){
  if(amount >= 1e6){
    let number = parseFloat(amount)
    let unit = Math.floor(parseFloat(number.toExponential(0).toString().replace("+", "").slice(2)) / 3) * 3
    // let test = this.toExponential(0).toString().replace("+", "").slice(2)

    var num = (amount / ('1e'+(unit))).toFixed(2)
    var unitname = Game.units[Math.floor(unit / 3) - 1]

    return num + " " + unitname
  }

  return amount.toLocaleString()
}