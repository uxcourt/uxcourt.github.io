// JavaScript source code
function testStreetViewOld(mID) {
    /*test if the streetview has an image */
    /*can I use google.maps.StreetViewStatus.OK instead?
    this function is also now an orphan*/
    var SVrequestURL = 'https://maps.googleapis.com/maps/api/streetview/metadata?location=' + positions[mID].lat + ',' + positions[mID].lng + '&key=AIzaSyDRe9CxUVjDbiwMYCqZPlVdriZOzrotidQ';
    var SVrequest = new XMLHttpRequest();
    SVrequest.open("GET", SVrequestURL);
    SVrequest.responseType = 'json';
    SVrequest.send();
    var SVresponse = SVrequest.response;
    if (SVresponse.status == 'OK') {
        document.getElementById('street_view').innerHTML = '<input type="button" onclick="createStreetView(LatLng);" value="Create Street View" />';
    }
}
function createStreetViewOld(pos) {
    /*this whole approach was to sidestep WebGL crashes, and it comes with the apparetnly unsolveable dilemna 
    of not being able to remove pegman from the map. setOptions doesn't remove the man from the map. 
    So I found the undocumented "mode" modifier on map creation to use html5 instead of WebGL, so the 
    root cause is fixed. As a result, the test to create a panorama isn't needed, if I just instantiate a panorama
    everywhere, pegman is automatically removed when there's no corresponding streetview image. Saving this function
    only as a model for how to construct a callback function*/
    //I might in a further iteration load this into the testStreetView function above, trimming this function down to the creation of the panorama
    var gstService = new google.maps.StreetViewService();

    gstService.getPanorama(
        { location: pos, source: google.maps.StreetViewSource.DEFAULT },
        function (data, status) {
            var panorama = new google.maps.StreetViewPanorama(document.getElementById('street_view'), { position: pos, mode: 'html5' });
            if (status === google.maps.StreetViewStatus.OK) {
                // OK. 
                //panorama was defined here, but I moved it outside the if in order to use it in the negative case; this move might defeat the purpose of preserving WebGL capacity
                map.setStreetView(panorama);
                //panorama.setVisible(true);
            } else {
                // error or no results
                //alert(status);
                //this destroys the map, and keeps streetview!: map.setStreetView();
                //this hides the panorama, but not pegman: panorama.setVisible(false);
                //this doesn't error, but it also doesn't remove pegman from his place on the map: map.setOptions({streetViewControl:false});
                document.getElementById('street_view').innerHTML = "<p>No street view available here. Try another point in the journey</p>";

            }
        }
    );
}