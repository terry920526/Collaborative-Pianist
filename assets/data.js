/* Accord – constants, Southern California places, and fictional sample accompanists. */
var INSTRUMENTS=["Voice","Violin","Viola","Cello","Double bass","Flute","Oboe","Clarinet","Bassoon","Saxophone","Trumpet","Horn","Trombone","Harp"];
var SPECIALTIES=["Classical","Opera","Musical theater","Contemporary","Jazz"];
var LEVELS=["Student","Emerging professional","Established professional"];
var PURPOSES=["Audition","Competition","Recital","Rehearsal","Recording"];
var SERVICES=["Rehearsal","Audition preparation","Competition preparation","Recital or performance","Recording session"];
var LANGUAGES=["English","Spanish","Mandarin","Cantonese","Korean","Japanese","Vietnamese","Italian","German","French","Russian"];
var DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
var SLOTS=["Morning","Afternoon","Evening"];
var DURATIONS=[[1,"1 hour"],[1.5,"1.5 hours"],[2,"2 hours"],[3,"3 hours"],[4,"4 hours"]];
var RADII=[5,10,25,50,100];
var COMMISSION=0.15;

/* Representative places and ZIP codes. A live site would use a geocoding service. */
var PLACES=[
 {city:"Anaheim",lat:33.8366,lng:-117.9143,zips:["92801","92802","92804","92805","92806","92807","92808"]},
 {city:"Burbank",lat:34.1808,lng:-118.3090,zips:["91501","91502","91504","91505","91506"]},
 {city:"Claremont",lat:34.0967,lng:-117.7198,zips:["91711"]},
 {city:"Costa Mesa",lat:33.6411,lng:-117.9187,zips:["92626","92627"]},
 {city:"Cypress",lat:33.8169,lng:-118.0373,zips:["90630"]},
 {city:"Fullerton",lat:33.8704,lng:-117.9243,zips:["92831","92832","92833","92835"]},
 {city:"Garden Grove",lat:33.7743,lng:-117.9380,zips:["92840","92841","92843","92844","92845"]},
 {city:"Glendale",lat:34.1425,lng:-118.2551,zips:["91201","91202","91203","91204","91205","91206","91207","91208"]},
 {city:"Huntington Beach",lat:33.6603,lng:-117.9992,zips:["92646","92647","92648","92649"]},
 {city:"Irvine",lat:33.6846,lng:-117.8265,zips:["92602","92603","92604","92606","92612","92614","92618","92620","92697"]},
 {city:"La Jolla",lat:32.8328,lng:-117.2713,zips:["92037"]},
 {city:"Laguna Beach",lat:33.5427,lng:-117.7854,zips:["92651"]},
 {city:"Long Beach",lat:33.7701,lng:-118.1937,zips:["90802","90803","90804","90805","90806","90807","90808","90810","90813","90814","90815"]},
 {city:"Los Angeles",lat:34.0522,lng:-118.2437,zips:["90005","90012","90013","90014","90017","90024","90026","90028","90036","90049","90064"]},
 {city:"Mission Viejo",lat:33.6000,lng:-117.6720,zips:["92691","92692"]},
 {city:"Newport Beach",lat:33.6189,lng:-117.9289,zips:["92660","92661","92662","92663"]},
 {city:"Orange",lat:33.7879,lng:-117.8531,zips:["92865","92866","92867","92868","92869"]},
 {city:"Pasadena",lat:34.1478,lng:-118.1445,zips:["91101","91103","91104","91105","91106","91107"]},
 {city:"Pomona",lat:34.0551,lng:-117.7500,zips:["91766","91767","91768"]},
 {city:"Riverside",lat:33.9533,lng:-117.3962,zips:["92501","92503","92504","92505","92506","92507"]},
 {city:"San Diego",lat:32.7157,lng:-117.1611,zips:["92101","92102","92103","92104","92105","92106","92107","92108","92109","92110"]},
 {city:"Santa Ana",lat:33.7455,lng:-117.8677,zips:["92701","92703","92704","92705","92706","92707"]},
 {city:"Santa Barbara",lat:34.4208,lng:-119.6982,zips:["93101","93103","93105","93108","93109","93110"]},
 {city:"Santa Monica",lat:34.0195,lng:-118.4912,zips:["90401","90402","90403","90404","90405"]},
 {city:"Thousand Oaks",lat:34.1706,lng:-118.8376,zips:["91360","91361","91362"]},
 {city:"Torrance",lat:33.8358,lng:-118.3406,zips:["90501","90502","90503","90504","90505"]},
 {city:"Tustin",lat:33.7458,lng:-117.8261,zips:["92780","92782"]},
 {city:"Westminster",lat:33.7514,lng:-118.0065,zips:["92683"]}
];

/* Weekly availability shorthand: "Mon:MA Tue:E" where M=Morning, A=Afternoon, E=Evening */
function parseAvail(str){
  var map={M:"Morning",A:"Afternoon",E:"Evening"},out={};
  str.split(/\s+/).forEach(function(t){var p=t.split(":");if(p.length===2)out[p[0]]=p[1].split("").map(function(c){return map[c]})});
  return out;
}

var SAMPLE = [];

(function(){
  SAMPLE.forEach(function(p){
    p.id = "s" + p.id;
    p.sample = true;
    p.avail = parseAvail(p.avail);
    p.videos = [];

    for (var i = 0; i < PLACES.length; i++) {
      if (PLACES[i].city === p.city) {
        p.lat = PLACES[i].lat;
        p.lng = PLACES[i].lng;
      }
    }

    p.zip = "";
  });
})();
(function(){
  SAMPLE.forEach(function(p){
    p.id="s"+p.id;p.sample=true;p.avail=parseAvail(p.avail);p.videos=[];
    for(var i=0;i<PLACES.length;i++)if(PLACES[i].city===p.city){p.lat=PLACES[i].lat;p.lng=PLACES[i].lng;}
    p.zip="";
  });
})();
