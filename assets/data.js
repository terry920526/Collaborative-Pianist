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
 {city:"Westminster",state:"California",lat:33.7514,lng:-118.0065,zips:["92683"]},
 {city:'Albuquerque',state:'New Mexico',lat:35.0844,lng:-106.6504,zips:[]},
 {city:'Atlanta',state:'Georgia',lat:33.749,lng:-84.388,zips:[]},
 {city:'Austin',state:'Texas',lat:30.2672,lng:-97.7431,zips:[]},
 {city:'Baltimore',state:'Maryland',lat:39.2904,lng:-76.6122,zips:[]},
 {city:'Boston',state:'Massachusetts',lat:42.3601,lng:-71.0589,zips:[]},
 {city:'Charlotte',state:'North Carolina',lat:35.2271,lng:-80.8431,zips:[]},
 {city:'Chicago',state:'Illinois',lat:41.8781,lng:-87.6298,zips:[]},
 {city:'Cincinnati',state:'Ohio',lat:39.1031,lng:-84.512,zips:[]},
 {city:'Cleveland',state:'Ohio',lat:41.4993,lng:-81.6944,zips:[]},
 {city:'Columbus',state:'Ohio',lat:39.9612,lng:-82.9988,zips:[]},
 {city:'Dallas',state:'Texas',lat:32.7767,lng:-96.797,zips:[]},
 {city:'Denver',state:'Colorado',lat:39.7392,lng:-104.9903,zips:[]},
 {city:'Detroit',state:'Michigan',lat:42.3314,lng:-83.0458,zips:[]},
 {city:'Honolulu',state:'Hawaii',lat:21.3099,lng:-157.8581,zips:[]},
 {city:'Houston',state:'Texas',lat:29.7604,lng:-95.3698,zips:[]},
 {city:'Indianapolis',state:'Indiana',lat:39.7684,lng:-86.1581,zips:[]},
 {city:'Jacksonville',state:'Florida',lat:30.3322,lng:-81.6557,zips:[]},
 {city:'Kansas City',state:'Missouri',lat:39.0997,lng:-94.5786,zips:[]},
 {city:'Las Vegas',state:'Nevada',lat:36.1699,lng:-115.1398,zips:[]},
 {city:'Louisville',state:'Kentucky',lat:38.2527,lng:-85.7585,zips:[]},
 {city:'Madison',state:'Wisconsin',lat:43.0731,lng:-89.4012,zips:[]},
 {city:'Memphis',state:'Tennessee',lat:35.1495,lng:-90.049,zips:[]},
 {city:'Miami',state:'Florida',lat:25.7617,lng:-80.1918,zips:[]},
 {city:'Milwaukee',state:'Wisconsin',lat:43.0389,lng:-87.9065,zips:[]},
 {city:'Minneapolis',state:'Minnesota',lat:44.9778,lng:-93.265,zips:[]},
 {city:'Nashville',state:'Tennessee',lat:36.1627,lng:-86.7816,zips:[]},
 {city:'New Orleans',state:'Louisiana',lat:29.9511,lng:-90.0715,zips:[]},
 {city:'New York City',state:'New York',lat:40.7128,lng:-74.006,zips:[]},
 {city:'Oklahoma City',state:'Oklahoma',lat:35.4676,lng:-97.5164,zips:[]},
 {city:'Omaha',state:'Nebraska',lat:41.2565,lng:-95.9345,zips:[]},
 {city:'Orlando',state:'Florida',lat:28.5383,lng:-81.3792,zips:[]},
 {city:'Philadelphia',state:'Pennsylvania',lat:39.9526,lng:-75.1652,zips:[]},
 {city:'Phoenix',state:'Arizona',lat:33.4484,lng:-112.074,zips:[]},
 {city:'Pittsburgh',state:'Pennsylvania',lat:40.4406,lng:-79.9959,zips:[]},
 {city:'Portland',state:'Oregon',lat:45.5152,lng:-122.6784,zips:[]},
 {city:'Raleigh',state:'North Carolina',lat:35.7796,lng:-78.6382,zips:[]},
 {city:'Sacramento',state:'California',lat:38.5816,lng:-121.4944,zips:[]},
 {city:'Salt Lake City',state:'Utah',lat:40.7608,lng:-111.891,zips:[]},
 {city:'San Antonio',state:'Texas',lat:29.4241,lng:-98.4936,zips:[]},
 {city:'San Francisco',state:'California',lat:37.7749,lng:-122.4194,zips:[]},
 {city:'San Jose',state:'California',lat:37.3382,lng:-121.8863,zips:[]},
 {city:'Seattle',state:'Washington',lat:47.6062,lng:-122.3321,zips:[]},
 {city:'St. Louis',state:'Missouri',lat:38.627,lng:-90.1994,zips:[]},
 {city:'Tampa',state:'Florida',lat:27.9506,lng:-82.4572,zips:[]},
 {city:'Washington',state:'District of Columbia',lat:38.9072,lng:-77.0369,zips:[]},
 {city:'Fort Worth',state:'Texas',lat:32.7555,lng:-97.3308,zips:[]},
 {city:'El Paso',state:'Texas',lat:31.7619,lng:-106.485,zips:[]},
 {city:'Tucson',state:'Arizona',lat:32.2226,lng:-110.9747,zips:[]},
 {city:'Fresno',state:'California',lat:36.7378,lng:-119.7871,zips:[]},
 {city:'Oakland',state:'California',lat:37.8044,lng:-122.2712,zips:[]},
 {city:'Bakersfield',state:'California',lat:35.3733,lng:-119.0187,zips:[]},
 {city:'Colorado Springs',state:'Colorado',lat:38.8339,lng:-104.8214,zips:[]},
 {city:'Arlington',state:'Texas',lat:32.7357,lng:-97.1081,zips:[]},
 {city:'Newark',state:'New Jersey',lat:40.7357,lng:-74.1724,zips:[]},
 {city:'Jersey City',state:'New Jersey',lat:40.7178,lng:-74.0431,zips:[]},
 {city:'Buffalo',state:'New York',lat:42.8864,lng:-78.8784,zips:[]},
 {city:'Richmond',state:'Virginia',lat:37.5407,lng:-77.436,zips:[]},
 {city:'Virginia Beach',state:'Virginia',lat:36.8529,lng:-75.978,zips:[]},
 {city:'Providence',state:'Rhode Island',lat:41.824,lng:-71.4128,zips:[]},
 {city:'Hartford',state:'Connecticut',lat:41.7658,lng:-72.6734,zips:[]},
 {city:'Boise',state:'Idaho',lat:43.615,lng:-116.2023,zips:[]},
 {city:'Spokane',state:'Washington',lat:47.6588,lng:-117.426,zips:[]},
 {city:'Des Moines',state:'Iowa',lat:41.5868,lng:-93.625,zips:[]},
 {city:'Little Rock',state:'Arkansas',lat:34.7465,lng:-92.2896,zips:[]},
 {city:'Birmingham',state:'Alabama',lat:33.5186,lng:-86.8104,zips:[]},
 {city:'Charleston',state:'South Carolina',lat:32.7765,lng:-79.9311,zips:[]},
 {city:'Savannah',state:'Georgia',lat:32.0809,lng:-81.0912,zips:[]},
 {city:'Baton Rouge',state:'Louisiana',lat:30.4515,lng:-91.1871,zips:[]},
 {city:'Anchorage',state:'Alaska',lat:61.2181,lng:-149.9003,zips:[]},
 {city:'Manchester',state:'New Hampshire',lat:42.9956,lng:-71.4548,zips:[]},
 {city:'Burlington',state:'Vermont',lat:44.4759,lng:-73.2121,zips:[]},
 {city:'Cheyenne',state:'Wyoming',lat:41.14,lng:-104.8202,zips:[]},
 {city:'Billings',state:'Montana',lat:45.7833,lng:-108.5007,zips:[]},
 {city:'Fargo',state:'North Dakota',lat:46.8772,lng:-96.7898,zips:[]},
 {city:'Sioux Falls',state:'South Dakota',lat:43.5446,lng:-96.7311,zips:[]},
 {city:'Lubbock',state:'Texas',lat:33.5779,lng:-101.8552,zips:[]},
 {city:'Corpus Christi',state:'Texas',lat:27.8006,lng:-97.3964,zips:[]},
 {city:'Wichita',state:'Kansas',lat:37.6872,lng:-97.3301,zips:[]},
 {city:'Topeka',state:'Kansas',lat:39.0473,lng:-95.6752,zips:[]},
 {city:'Lincoln',state:'Nebraska',lat:40.8136,lng:-96.7026,zips:[]},
 {city:'Reno',state:'Nevada',lat:39.5296,lng:-119.8138,zips:[]},
 {city:'Eugene',state:'Oregon',lat:44.0521,lng:-123.0868,zips:[]},
 {city:'Tacoma',state:'Washington',lat:47.2529,lng:-122.4443,zips:[]},
 {city:'Santa Fe',state:'New Mexico',lat:35.687,lng:-105.9378,zips:[]},
 {city:'Durham',state:'North Carolina',lat:35.994,lng:-78.8986,zips:[]},
 {city:'Greensboro',state:'North Carolina',lat:36.0726,lng:-79.792,zips:[]},
 {city:'Knoxville',state:'Tennessee',lat:35.9606,lng:-83.9207,zips:[]},
 {city:'Chattanooga',state:'Tennessee',lat:35.0456,lng:-85.3097,zips:[]},
 {city:'Lexington',state:'Kentucky',lat:38.0406,lng:-84.5037,zips:[]},
 {city:'Ann Arbor',state:'Michigan',lat:42.2808,lng:-83.743,zips:[]},
 {city:'Grand Rapids',state:'Michigan',lat:42.9634,lng:-85.6681,zips:[]},
 {city:'Syracuse',state:'New York',lat:43.0481,lng:-76.1474,zips:[]},
 {city:'Rochester',state:'New York',lat:43.1566,lng:-77.6088,zips:[]},
 {city:'Albany',state:'New York',lat:42.6526,lng:-73.7562,zips:[]},
 {city:'Ithaca',state:'New York',lat:42.443,lng:-76.5019,zips:[]}
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
