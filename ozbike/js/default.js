
var requestURL = 'js/places.json';
var request = new XMLHttpRequest();
request.open('GET', requestURL, true);
request.responseType = 'json';
request.send();
//added to check if the data has returned correctly
request.addEventListener("readystatechange", processRequest, false);
var positions, map, directionsDisplay, directionsService, currentMarker;
/*
the cookie works, but still won't allow a user to share a point in the journey with somebody else.
How to allow a user to copy and paste a functioning URL to one point in the journey?*/
//these changes made to allow Google Analytics to exist in the cookie too
var SplitCookie = document.cookie.split(';');
for (i = 0; i < SplitCookie.length; i++) {
    if (SplitCookie[i].indexOf("p=") >= 0) {
        currentMarker = SplitCookie[i].substr(SplitCookie[i].indexOf("p=")+2);
    }
}
if (currentMarker==undefined){
    currentMarker = 0;
}
//guessing the size of the data set since the json hasn't fully loaded yet. This might be moved to avoid guessing
var markerS= new Array(200);
var LatLng;
/* never used; stored here in case I wanted to do a calculator displaying day one, day two, etc.
var baseDate = new Date;
baseDate = '20140903T01:30:00+10:00';*/

function processRequest(e) {
    //if the file is completely loaded, and wasn't an error,
    if (request.readyState == 4  && request.status == 200) {
        //store the json in a jscript array
        positions = request.response;
        initMap();
    }
    else {
        //write an error; the onreadystate handler will be fired again when the state of the request changes
        console.log(Date.now() + ': the application attempted to work with the data before it had fully loaded' )
    }
}
function initMap() {
    //pausecomp(1000);//wait a second for the json to load. There's got to be a better way. This still fails while Chrome's debugging tools are open, because the JSON data is loaded into the cache.
    //set up the route tracing routines
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    //initialize the map, center it on point 0
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(positions[currentMarker].lat, positions[currentMarker].lng),
        zoom: 9,
        mapTypeId: 'terrain',
    });
    //bind the route tracer to the map
    directionsDisplay.setMap(map);
    //trace the route
    /*after a LOT of effort, I got the directions to render on the map, but there's a 
    dealbreaker problem: the route gmaps calculates is not the route we rode. 
    Compound that with a limit on only 23 waypoints, and this service seems irrelevant
    for this application.
    When I want to bring back a route viewer I may need to render the path as polygons
    drawn on the map, which introduces a significant number of technical hurdles 
    (polygons don't even follow the road)!*/
    //calcRoute(); //commented out until the full array of places is added in

    //create a marker on the map for each position in the json file
    for (i = 0; i < positions.length; i++) {
        var marker1, mTitle, mElevation;
        mTitle = positions[i].placeName;
        
        if(positions[i].type=='lodging'){
            var iconCustom = 'images/lodging.png';
        }
        else if (positions[i].type=='camp'){
            var iconCustom = 'images/camping.png';
        }
        else if (positions[i].type == 'route') {
            var iconCustom = 'images/route.png';
        }
        else{iconCustom=null}
        //mElevation=https://maps.googleapis.com/maps/api/elevation/json?locations=positions[i].lat,positions[i].lng&key=AIzaSyCVgy4lisCmEqly-06daUuSlPpGerAFQfo;
        marker1 = new google.maps.Marker({
            position: new google.maps.LatLng(positions[i].lat,positions[i].lng),
            map: map,
            title: mTitle,
            label: i.toString(),
            id: i,
            icon:iconCustom
            //elevation: mElevation.results.elevation
            //https://developers.google.com/maps/documentation/elevation/intro
            //https://developers.google.com/maps/documentation/javascript/reference#ElevationService
            

        })
        markerClickAdd(marker1, positions);
        markerS[i]=marker1;
        //http://econym.org.uk/gmap/example_categories.htm 
    }
    google.maps.event.trigger(markerS[currentMarker], "click");
    document.getElementById('map').style.width = '34vw';
}
function markerClickAdd(m, positions) {
    m.addListener('click', function () {
        var mID = m.id;
        currentMarker = mID;
        //document.cookie = "p=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "p=" + currentMarker + "; expires=Sun, 31 Dec 2017 00:00:00 GMT";
        
        var noteBlob, n, pixBlob, vidBlob;
        noteBlob = "";
        pixBlob = "";
        vidBlob = "";
        for (n in positions[mID].notes) { noteBlob = noteBlob + positions[mID].notes[n].note };
        if (positions[mID].photos[0].url != undefined) {
            for (p in positions[mID].photos) {
                pixBlob = pixBlob + "<img src='" + positions[mID].photos[p].url + "'>"
                if (positions[mID].photos[p].caption.length > 0) {
                    pixBlob = pixBlob + "<span class='caption'>" + positions[mID].photos[p].caption + "</span>";
                };
            }
        }
        if (positions[mID].videos[0].url != undefined) {
            for (v in positions[mID].videos) { vidBlob = vidBlob + "<div class='customVid'><video controls id='video" + v + "' width='100%' title='" + positions[mID].videos[v].caption + "'><source src='" + positions[mID].videos[v].url + "' type='video/MP4'></video><img class='overlayPlay' src='images/play.png' onclick=playVideo(this,video" + v + ")></div>" };
        }
        document.getElementById('info').innerHTML =
            "<div id='placeIDbox' class="+ positions[mID].type + "><span id='placeID'>" + mID + "</span></div><H1>" + positions[mID].placeName + "</H1><span id='date'>" +
            calcDate(positions[mID].date) + "</span><p>" + noteBlob
            + "</p>"
        document.getElementById('pix').innerHTML = pixBlob + vidBlob;
        if (mID < 10) { document.getElementById('placeID').className = 'OneDigitID' }
        else { document.getElementById('placeID').className = '' }
        
        var sv = new google.maps.StreetViewService();
        var pos = new google.maps.LatLng(positions[mID].lat, positions[mID].lng)
        //var pos={lat: 37.869085, lng: -122.254775};
        sv.getPanorama({location:pos, radius:100}, processStreetViewMeta)
    })};
function processStreetViewMeta(data, status) {
    if (status != 'OK') {
        document.getElementById('appNav').className = "nostreet";
    }
    else { document.getElementById('appNav').className = "yesstreet" };
}
function calcDate(d) {
    //http://stackoverflow.com/questions/15141762/how-to-initialize-javascript-date-to-a-particular-timezone
    dNew = new Date(d);
    options = {
        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZone:'Australia/Sydney'/*makes firefox  barf*/
    };
    return (dNew.toLocaleString('en-au', options));
}
function createStreetView(pos) {
    var panorama = new google.maps.StreetViewPanorama(document.getElementById('street_view'), { position: pos, mode: 'html5', visible: true });
    map.setStreetView(panorama);
}
function destroyStreetView() {
    /*the setOptions command works only if pegman has not been dropped on the map.
    streetViewControl:false only removes pegman if he's been already placed in the session
    streetView: false throws an error in setOptions
    map.setStreetView throws an error with anything other than a panorama object*/
    map.setOptions({ streetViewControl: false});
    //map.streetView = false;
    document.getElementById('street_view').innerHTML = '';
    document.getElementById('notStreet').style.top = '-50vh';
    document.getElementById('strToggler').value = "Open Street";
}
function calcRoute() {
    var start = positions[0].lat+","+positions[0].lng;
    var end = positions[positions.length-1].lat+","+positions[positions.length-1].lng;
    var routeList = []
    for (i = 1; i < positions.length; i++){
        var pos = new google.maps.LatLng(positions[i].lat,positions[i].lng);      
        if (positions[i].type == "lodging" || positions[i].type == "camping") {
            routeList.push({location: pos, stopover: true})
            }
        else {
            routeList.push({location: pos, stopover: false});
            }
        }
    var request = {
        origin: start,
        destination: end,
        waypoints: routeList,
        provideRouteAlternatives: false,
        travelMode: 'DRIVING',
        avoidTolls: false,
        avoidHighways:true
    };
    directionsService.route(request, function (result, status) {
        //if (status == 'OK') {
        directionsDisplay.setDirections(result);
        //}
    })
}
function routeNext(nD) {
    //seed the next pointer as one more than currentMarker
    var nextDisplay = nD + 1;
    //test if the next position is NOT a route
    if (positions[nextDisplay].type !== "route") {
        //trigger the click event of the next position
        google.maps.event.trigger(markerS[nextDisplay], "click");
        map.setCenter(markerS[nextDisplay].position);
    }
    else {
        //call this function again to increment by one
        routeNext(nextDisplay);
    }
    destroyStreetView()
    
}
function routePvs(pD) {
    var pvsDisplay = pD - 1;
    //test if the previous position is NOT a route
    if (positions[pvsDisplay].type !== "route") {
        //trigger the click event of the previous position
        google.maps.event.trigger(markerS[pvsDisplay], "click");
        map.setCenter(markerS[pvsDisplay].position);
    }
    else {
        //call this function again to decrement by one
        routePvs(pvsDisplay);
        //whatabout if this is called from the 0 point?
    }
    destroyStreetView()
}
function ToggleMap() {
    if (document.getElementById('map').style.width == '34vw') {
        document.getElementById('map').style.width = '0px';
        document.getElementById('mapToggler').title = "Show map";
        document.getElementById('pix').style.width = '100vw';
        document.getElementById('info').style.width = '60vw';
        //document.getElementById('street_view').style.position='relative';
    }
    else {
        document.getElementById('map').style.width = '34vw';
        document.getElementById('mapToggler').title = "Hide map";
        document.getElementById('pix').style.width = '66vw';
        document.getElementById('info').style.width = '44vw';
    }
}
function ToggleText() {
    if (document.getElementById('info').style.display=='none') {
        document.getElementById('info').style.display='block';
        document.getElementById('txtToggler').title = "Hide Text";
        var s = document.getElementsByClassName('ncaption')
        for (i =s.length-1; i >=0 ;i--){
            s[i].className = "caption";
        };
        //document.getElementById('street_view').style.position='relative';
    }
    else {
        document.getElementById('info').style.display='none';
        document.getElementById('txtToggler').title = "Show Text";
        var s = document.getElementsByClassName('caption')
        for (i=s.length-1;i>=0;i--){
            s[i].className = "ncaption";
        }
    }
}
function ToggleStreet(){
    if (document.getElementById('street_view').innerHTML == '') {
        document.getElementById('notStreet').style.top = '0';
        LatLng = { lat: positions[currentMarker].lat, lng: positions[currentMarker].lng };
        createStreetView(LatLng);
        document.getElementById('strToggler').title = "Close Street";
        document.getElementById('appNav').style.top="50vh";
    }
    else {
        destroyStreetView();
        document.getElementById('strToggler').title = "Show Street";
        document.getElementById('appNav').style.top="0";
    }
}
function pausecomp(ms) {
     ms += new Date().getTime();
     while (new Date() < ms) { };
    //http://www.sean.co.uk/a/webdesign/javascriptdelay.shtm
}
function playVideo(btn, vid) {
    vid.play();
    btn.style.display="none";
}