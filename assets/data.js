/* Accord – nationwide location constants and fictional sample accompanists. */
var INSTRUMENTS=["Voice","Violin","Viola","Cello","Double bass","Flute","Oboe","Clarinet","Bassoon","Saxophone","Trumpet","Horn","Trombone","Harp"];
var SPECIALTIES=["Classical","Opera","Musical theater","Contemporary","Jazz"];
var LEVELS=["Student","Emerging professional","Established professional"];
var PURPOSES=["Audition","Competition","Recital","Rehearsal","Recording"];
var SERVICES=["Rehearsal","Audition preparation","Competition preparation","Recital or performance","Recording session"];
var LANGUAGES=["English","Spanish","Mandarin","Cantonese","Korean","Japanese","Vietnamese","Italian","German","French","Russian"];
var DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
var SLOTS=["Morning","Afternoon","Evening"];
var DURATIONS=[[1,"1 hour"],[1.5,"1.5 hours"],[2,"2 hours"],[3,"3 hours"],[4,"4 hours"]];
var RADII=[5,10,25,50,100,250,500];
var STATES=["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
var COMMISSION=0.15;

/* Supported U.S. city coordinates for distance search. City/state text search works nationwide. */
var PLACES=[
 {city:"Anaheim",state:"California",lat:33.8366,lng:-117.9143,zips:["92801","92802","92804","92805","92806","92807","92808"]},
 {city:"Burbank",state:"California",lat:34.1808,lng:-118.3090,zips:["91501","91502","91504","91505","91506"]},
 {city:"Claremont",state:"California",lat:34.0967,lng:-117.7198,zips:["91711"]},
 {city:"Costa Mesa",state:"California",lat:33.6411,lng:-117.9187,zips:["92626","92627"]},
 {city:"Cypress",state:"California",lat:33.8169,lng:-118.0373,zips:["90630"]},
 {city:"Fullerton",state:"California",lat:33.8704,lng:-117.9243,zips:["92831","92832","92833","92835"]},
 {city:"Garden Grove",state:"California",lat:33.7743,lng:-117.9380,zips:["92840","92841","92843","92844","92845"]},
 {city:"Glendale",state:"California",lat:34.1425,lng:-118.2551,zips:["91201","91202","91203","91204","91205","91206","91207","91208"]},
 {city:"Huntington Beach",state:"California",lat:33.6603,lng:-117.9992,zips:["92646","92647","92648","92649"]},
 {city:"Irvine",state:"California",lat:33.6846,lng:-117.8265,zips:["92602","92603","92604","92606","92612","92614","92618","92620","92697"]},
 {city:"La Jolla",state:"California",lat:32.8328,lng:-117.2713,zips:["92037"]},
 {city:"Laguna Beach",state:"California",lat:33.5427,lng:-117.7854,zips:["92651"]},
 {city:"Long Beach",state:"California",lat:33.7701,lng:-118.1937,zips:["90802","90803","90804","90805","90806","90807","90808","90810","90813","90814","90815"]},
 {city:"Los Angeles",state:"California",lat:34.0522,lng:-118.2437,zips:["90005","90012","90013","90014","90017","90024","90026","90028","90036","90049","90064"]},
 {city:"Mission Viejo",state:"California",lat:33.6000,lng:-117.6720,zips:["92691","92692"]},
 {city:"Newport Beach",state:"California",lat:33.6189,lng:-117.9289,zips:["92660","92661","92662","92663"]},
 {city:"Orange",state:"California",lat:33.7879,lng:-117.8531,zips:["92865","92866","92867","92868","92869"]},
 {city:"Pasadena",state:"California",lat:34.1478,lng:-118.1445,zips:["91101","91103","91104","91105","91106","91107"]},
 {city:"Pomona",state:"California",lat:34.0551,lng:-117.7500,zips:["91766","91767","91768"]},
 {city:"Riverside",state:"California",lat:33.9533,lng:-117.3962,zips:["92501","92503","92504","92505","92506","92507"]},
 {city:"San Diego",state:"California",lat:32.7157,lng:-117.1611,zips:["92101","92102","92103","92104","92105","92106","92107","92108","92109","92110"]},
 {city:"Santa Ana",state:"California",lat:33.7455,lng:-117.8677,zips:["92701","92703","92704","92705","92706","92707"]},
 {city:"Santa Barbara",state:"California",lat:34.4208,lng:-119.6982,zips:["93101","93103","93105","93108","93109","93110"]},
 {city:"Santa Monica",state:"California",lat:34.0195,lng:-118.4912,zips:["90401","90402","90403","90404","90405"]},
 {city:"Thousand Oaks",state:"California",lat:34.1706,lng:-118.8376,zips:["91360","91361","91362"]},
 {city:"Torrance",state:"California",lat:33.8358,lng:-118.3406,zips:["90501","90502","90503","90504","90505"]},
 {city:"Tustin",state:"California",lat:33.7458,lng:-117.8261,zips:["92780","92782"]},
 {city:"Westminster",state:"California",lat:33.7514,lng:-118.0065,state:"California",zips:["92683"]},
 {city:"Atlanta",lat:33.749,lng:-84.388,state:"Georgia",zips:[]},
 {city:"Austin",lat:30.2672,lng:-97.7431,state:"Texas",zips:[]},
 {city:"Baltimore",lat:39.2904,lng:-76.6122,state:"Maryland",zips:[]},
 {city:"Boston",lat:42.3601,lng:-71.0589,state:"Massachusetts",zips:[]},
 {city:"Charlotte",lat:35.2271,lng:-80.8431,state:"North Carolina",zips:[]},
 {city:"Chicago",lat:41.8781,lng:-87.6298,state:"Illinois",zips:[]},
 {city:"Cincinnati",lat:39.1031,lng:-84.512,state:"Ohio",zips:[]},
 {city:"Cleveland",lat:41.4993,lng:-81.6944,state:"Ohio",zips:[]},
 {city:"Columbus",lat:39.9612,lng:-82.9988,state:"Ohio",zips:[]},
 {city:"Dallas",lat:32.7767,lng:-96.797,state:"Texas",zips:[]},
 {city:"Denver",lat:39.7392,lng:-104.9903,state:"Colorado",zips:[]},
 {city:"Detroit",lat:42.3314,lng:-83.0458,state:"Michigan",zips:[]},
 {city:"Honolulu",lat:21.3099,lng:-157.8581,state:"Hawaii",zips:[]},
 {city:"Houston",lat:29.7604,lng:-95.3698,state:"Texas",zips:[]},
 {city:"Indianapolis",lat:39.7684,lng:-86.1581,state:"Indiana",zips:[]},
 {city:"Jacksonville",lat:30.3322,lng:-81.6557,state:"Florida",zips:[]},
 {city:"Kansas City",lat:39.0997,lng:-94.5786,state:"Missouri",zips:[]},
 {city:"Las Vegas",lat:36.1699,lng:-115.1398,state:"Nevada",zips:[]},
 {city:"Louisville",lat:38.2527,lng:-85.7585,state:"Kentucky",zips:[]},
 {city:"Madison",lat:43.0731,lng:-89.4012,state:"Wisconsin",zips:[]},
 {city:"Memphis",lat:35.1495,lng:-90.049,state:"Tennessee",zips:[]},
 {city:"Miami",lat:25.7617,lng:-80.1918,state:"Florida",zips:[]},
 {city:"Milwaukee",lat:43.0389,lng:-87.9065,state:"Wisconsin",zips:[]},
 {city:"Minneapolis",lat:44.9778,lng:-93.265,state:"Minnesota",zips:[]},
 {city:"Nashville",lat:36.1627,lng:-86.7816,state:"Tennessee",zips:[]},
 {city:"New Orleans",lat:29.9511,lng:-90.0715,state:"Louisiana",zips:[]},
 {city:"New York City",lat:40.7128,lng:-74.006,state:"New York",zips:[]},
 {city:"Oklahoma City",lat:35.4676,lng:-97.5164,state:"Oklahoma",zips:[]},
 {city:"Omaha",lat:41.2565,lng:-95.9345,state:"Nebraska",zips:[]},
 {city:"Orlando",lat:28.5383,lng:-81.3792,state:"Florida",zips:[]},
 {city:"Philadelphia",lat:39.9526,lng:-75.1652,state:"Pennsylvania",zips:[]},
 {city:"Phoenix",lat:33.4484,lng:-112.074,state:"Arizona",zips:[]},
 {city:"Pittsburgh",lat:40.4406,lng:-79.9959,state:"Pennsylvania",zips:[]},
 {city:"Portland",lat:45.5152,lng:-122.6784,state:"Oregon",zips:[]},
 {city:"Raleigh",lat:35.7796,lng:-78.6382,state:"North Carolina",zips:[]},
 {city:"Sacramento",lat:38.5816,lng:-121.4944,state:"California",zips:[]},
 {city:"Salt Lake City",lat:40.7608,lng:-111.891,state:"Utah",zips:[]},
 {city:"San Antonio",lat:29.4241,lng:-98.4936,state:"Texas",zips:[]},
 {city:"San Francisco",lat:37.7749,lng:-122.4194,state:"California",zips:[]},
 {city:"San Jose",lat:37.3382,lng:-121.8863,state:"California",zips:[]},
 {city:"Seattle",lat:47.6062,lng:-122.3321,state:"Washington",zips:[]},
 {city:"St. Louis",lat:38.627,lng:-90.1994,state:"Missouri",zips:[]},
 {city:"Tampa",lat:27.9506,lng:-82.4572,state:"Florida",zips:[]},
 {city:"Washington",lat:38.9072,lng:-77.0369,state:"District of Columbia",zips:[]}
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
