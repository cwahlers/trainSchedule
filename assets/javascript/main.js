//*****************************************
// Global variables
//*****************************************
var trainName, destination, freq, firstTrain, nextArrival, nextT, minAway;
var counter = 0;


//*****************************************
// Initialize Firebase
//*****************************************
  var config = {
    apiKey: "AIzaSyC4Kl0IOagl4fdr2OIEy8hiFCVC2EdBgvY",
    authDomain: "traintable-b55bd.firebaseapp.com",
    databaseURL: "https://traintable-b55bd.firebaseio.com",
    storageBucket: "traintable-b55bd.appspot.com",
    messagingSenderId: "1016162485080"
  };

  firebase.initializeApp(config);

  var database = firebase.database();


//*****************************************
//  Add Train Button
//*****************************************
$("#addTrain").on("click", function() {
    trainName = $("#train-input").val().trim();
    destination = $("#destination-input").val().trim();
    // firstTrain = moment($("#firstTrain-input").val().trim(), "HH.mm").format("x");
    firstTrain = $("#firstTrain-input").val().trim();
    freq = $("#freq-input").val().trim();
    // console.log("Name: " + trainName);
    // console.log("Dest: " + destination);
    // console.log("First: " + firstTrain);
    // console.log("Freq: " + freq);

  //*****************************************
  //  New Train
  //*****************************************
  var newTrain = {
    train: trainName,
    dest: destination,
    first: firstTrain,
    frequency: freq
  };

  //*****************************************
  //  Upload Train to Database
  //*****************************************
  //database.ref().push(newTrain);
  firebase.database().ref('trains/' + trainName).set({
    dest: destination,
    first: firstTrain,
    frequency: freq
  })
  
  alert("Train added successfully");

  $("#train-input").val("");
  $("#destination-input").val("");
  $("#firstTrain-input").val("");
  $("#freq-input").val("");
  // Prevents moving to new page
  return false;
});

//*****************************************
//  Update train table when new train added
//*****************************************
  database.ref().on("child_changed", function(childSnapshot, prevChildKey) {
    //console.log(childSnapshot.val());
    var trains = childSnapshot.val();
    displayTable(trains);
  });

//********************************************************
//  Display intiital table entries and refresh every minute
//********************************************************
  database.ref().on("child_added", function(childSnapshot, prevChildKey) {
    console.log(childSnapshot.val());
    var trains = childSnapshot.val();
    displayTable(trains);
  });
  // Refreshes table every minute
  counter = setInterval(refreshTable, 60000);

//*****************************************
//  Refresh tain table 
//*****************************************  
function refreshTable(){
  database.ref().on("child_added", function(childSnapshot, prevChildKey) {
    var trains = childSnapshot.val();
    displayTable(trains);
  });
}

//*****************************************
//  Display tain table 
//*****************************************
function displayTable(trains_obj){
      for (var i = 0; i < Object.keys(trains_obj).length; i++) {
      // Output data
      var tName = Object.keys(trains_obj)[i];
      //console.log(tName);
      var tDest = trains_obj[tName].dest;
      //console.log(tDest);
      var tFirst = trains_obj[tName].first;
      //console.log(tFirst);
      var tFreq = trains_obj[tName].frequency;
      //console.log(tFreq);

      var t = moment().format('YYYY MM DD')
      //console.log(t);
      t += " " + tFirst;
      //console.log(t);
      var fullDate = new Date(t);
      //console.log("return: " + fullDate);

      var deltaStart  = moment().diff(t, "minutes", true);
      //console.log(deltaStart);

      if (deltaStart < 0) {
        nextArrival = tFirst;
        nextT = fullDate.setTime(fullDate.getTime())
        //console.log("NextT: " + nextT);
      }else{
        var minT = Math.ceil(deltaStart/tFreq) * tFreq;
        //console.log("delta divided: " + minT);

        nextT = fullDate.setTime(fullDate.getTime() + minT * 60000)
        //console.log("NextT: " + nextT);

        nextArrival = moment(nextT).format("HH:mm");
        //console.log(nextArrival);
      }

      var tAway = Math.ceil(moment().diff(nextT, "minutes", true) * -1 );
      //console.log(tAway);
      if (i == 0) {
        $("#train-table > tbody").html("<tr><td>" + tName + "</td><td>" + tDest + "</td><td>" + 
      tFreq + "</td><td>" + nextArrival + "</td><td>" + tAway + "</td></tr>");
      }else{
        $("#train-table > tbody").append("<tr><td>" + tName + "</td><td>" + tDest + "</td><td>" + 
        tFreq + "</td><td>" + nextArrival + "</td><td>" + tAway + "</td></tr>");
      }
    }  
}