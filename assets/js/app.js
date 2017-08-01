//app moving pieces: To Update as Needed
//------------------

//lgbasic table in postgres dola.bounds.lgbasic - use script: _connectOracle/lgbasic.php (on lajavaas) to create JSON.  use script: CO_FS_Data_PHP/load_lgbasic.php to load into Postgres
//lg2cnty table in postgres dola.bounds.lg2cnty - use script: _connectOracle/lg2cnty.php (on lajavaas) to create JSON.  use script: CO_FS_Data_PHP/load_lg2cnty.php to load into Postgres

//districts table in dola.bounds - as needed when district boundaries change


/*global $*/


//get limlevy data -- dont do anything else until then

// var limlevy;
// var districtsonly = [];
// var districtsbb = [];

// //geocoder values
// $.getJSON("https://storage.googleapis.com/co-publicdata/geopts.json", function(geopts) {

//     //create data objects for geocoder
//     for (i = 0; i < geopts.length; i++) {
//         districtsonly.push(geopts[i].lgid);
//         districtsonly.push(geopts[i].lgname)
//         districtsbb.push(geopts[i].bbox);
//         districtsbb.push(geopts[i].bbox);
//     }

//     $.getJSON("https://dola.colorado.gov/gis-tmp/limlevy.json", function(json) {
//         limlevy = json;
//         init();

//     });
// });

// $(function() {
//     $("#feature-info.mhi").each(function(index) {
//         var scale = [['bad', 50000], ['neutral', 10000], ['good', 225000]];
//         var score = $(this).text();
//         console.log(score);
//         for (var i = 0; i < scale.length; i++) {
//             if (score <= scale[i][1]) {
//                 $(this).addClass(scale[i][0]);
//             }
//         }
//     });
// });

init();

function init() {


    var map, globalbusy, geojsonLayer, lastzoom, active = '1',
        filter = 'muni',
        titleGeo = 'Muni',
        limit = 1000,
        lgid = "";
    //active = whether to show inactive districts.  Active=0 : show all, including inactive.  Active=1 : show only active
    //filter = comma delimited list of district lgtypes to show  

    //map bounds the last time the data was loaded
    var coord = {};
    coord.nelat = '';
    coord.nelng = '';
    coord.swlat = '';
    coord.swlng = '';

    $(window).resize(function() {
        sizeLayerControl();
    });

    $("#about-btn").click(function() {
        $("#aboutModal").modal("show");
        $(".navbar-collapse.in").collapse("hide");
        return false;
    });

    $("#about-btn").click(function() {
        $("#aboutModal").modal("show");
        $(".navbar-collapse.in").collapse("hide");
        return false;
    });



    function sizeLayerControl() {
        $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
    }


    //calls php file that communicates with the database and retrieves geojson
    function ajaxcall() {

        $("#popup").remove();

        var r, diff1, diff2, newbounds;

        geojsonLayer.clearLayers();

        lastzoom = map.getZoom();
        r = map.getBounds();
        coord.nelat = (r._northEast.lat);
        coord.nelng = (r._northEast.lng);
        coord.swlat = (r._southWest.lat);
        coord.swlng = (r._southWest.lng);

        diff1 = (coord.nelat - coord.swlat) / 2;
        diff2 = (coord.nelng - coord.swlng) / 2;

        //we calculate a bounding box equal much larger than the actual visible map.  This preloades shapes that are off the map.  Combined with the center point query, this will allow us to not have to requery the database on every map movement.
        newbounds = (coord.swlng - diff2) + "," + (coord.swlat - diff1) + "," + (coord.nelng + diff2) + "," + (coord.nelat + diff1);
        
        //geojsonLayer.refresh("https://gis.dola.colorado.gov/capi/geojson?limit=99999&db=acs1115&schema=data&table=b19013&sumlev=" + filter + "&type=json&state=8"); //add a new layer replacing whatever is there
        geojsonLayer.refresh("assets/data/muni.geojson")
        map.addLayer(geojsonLayer);
        
       if (window.searchControl)
           {
             map.removeControl(window.searchControl);
           }
    
       // Add search gadget for this layer      
       window.searchControl= new L.control.search({
         layer: geojsonLayer, 
         propertyName: 'first_city',
         marker: false,
         collapsed: false,
         zoom: 12,
         textPlaceholder: 'Search Municipalities'
       });

       map.addControl(window.searchControl);

    }



    //after successfull ajax call, data is sent here
    function getJson(data) {

        Object.size = function(obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };

        // Get the size of an object
        var size = Object.size(data.features);

        //if hit the max number of results - display popup notice on screen
        if (size === limit) {
            $('#notice').show();
            setTimeout(function() {
                $('#notice').hide();
            }, 2000);
        }

        geojsonLayer.clearLayers(); //(mostly) eliminates double-draw (should be technically unneccessary if you look at the code of leaflet-ajax...but still seems to help)
        
        geojsonLayer.addData(data);

        geojsonLayer.setStyle(stylefunc); //geojsonLayer.setStyle(feat1);   
        map.addLayer(geojsonLayer);


       // Remove old control, if any
    

    }

    function stylefunc(feature) {

        var typical = {
            color: "green",
            weight: 1,
            fill: true,
            opacity: 1,
            fillOpacity: 0.4,
            clickable: true,
            'zIndex': 10
        };


        return typical;

    }


    L.mapbox.accessToken = 'pk.eyJ1Ijoic3RhdGVjb2RlbW9nIiwiYSI6Ikp0Sk1tSmsifQ.hl44-VjKTJNEP5pgDFcFPg';

    /* Basemap Layers */
    var mbstyle = L.mapbox.tileLayer('statecodemog.d47df6dd', {
        'zIndex': 1
    });
    var mbsat = L.mapbox.tileLayer('statecodemog.km7i3g01');


/* Basemap Layers */
var mapquestOSM = L.tileLayer("https://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1-s", "otile2-s", "otile3-s", "otile4-s"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="https://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("https://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["otile1-s", "otile2-s", "otile3-s", "otile4-s"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("https://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["otile1-s", "otile2-s", "otile3-s", "otile4-s"]
}), L.tileLayer("https://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1-s", "otile2-s", "otile3-s", "otile4-s"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="https://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

    var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });

    map = L.map("map", {
        zoom: 7,
        center: [39, -105.5],
        layers: [Esri_WorldStreetMap],
        minZoom: 6,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false
    });

var graphicScale = L.control.graphicScale().addTo(map);

    //define labels layer
    var mblabels = L.mapbox.tileLayer('statecodemog.798453f5', {
        'clickable': false,
        'zIndex': 100
    });

    // var LeafletFilterControl = L.control.command({
    //     postion: 'topleft'
    // });
    // map.addControl(LeafletFilterControl);


    /* Attribution control */ //bootleaf
    {
        //MapBox and OpenStreet Map Required Attribution
        var attributionControl2 = L.control({
            position: "bottomright"
        });
        attributionControl2.onAdd = function() {
            var div = L.DomUtil.create("div", "leaflet-control-attribution");
            div.innerHTML = "<a href='https://www.mapbox.com/about/maps/' target='_blank'>Maps &copy; Mapbox &copy; OpenStreetMap</a><span class='spanhide'>&nbsp;&nbsp;&nbsp;<a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve This Map</a></span>";
            return div;
        };
        map.addControl(attributionControl2);


        var attributionControl = L.control({
            position: "bottomright"
        });
        attributionControl.onAdd = function() {
            var div = L.DomUtil.create("div", "leaflet-control-attribution");
            div.innerHTML = "<span class='hidden-xs'>Developed by: <a href='https://demography.dola.colorado.gov'>Colorado State Demography Office</a></span><span class='spanhide'> | <a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Sources</a></span>";
            return div;
        };
        map.addControl(attributionControl);
    }


    var zoomControl = L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    /* GPS enabled geolocation control set to follow the user's location */
    var locateControl = L.control.locate({
        position: "bottomright",
        drawCircle: true,
        follow: true,
        setView: true,
        keepCurrentZoomLevel: true,
        markerStyle: {
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.8
        },
        circleStyle: {
            weight: 1,
            clickable: false
        },
        icon: "icon-direction",
        metric: false,
        strings: {
            title: "My location",
            popup: "You are within {distance} {unit} from this point",
            outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
        },
        locateOptions: {
            maxZoom: 18,
            watch: true,
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 10000
        }
    }).addTo(map);

    /* Larger screens get expanded layer control and visible sidebar */
    if (document.body.clientWidth <= 767) {
        var isCollapsed = true;
    } else {
        var isCollapsed = false;
    }



    var baseLayers = {
        "Mapbox: Satellite": mbsat,
        "Mapbox: Contrast Base": mbstyle,
        //"Mapquest: Streets": mapquestOSM,
        //"Mapquest: Imagery": mapquestOAM,
        //"Mapquest: Hybrid": mapquestHYB,
        "ESRI: Streets": Esri_WorldStreetMap
    };


    var layerControl = L.control.groupedLayers(baseLayers, {}, {
        collapsed: isCollapsed
    }).addTo(map);





    // control.addTo(map);

    /* Prevent clicking from influencing map */
    $(".leaflet-control-command").dblclick(function(e) {
        e.stopPropagation();
    });
    /* Prevent clicking from influencing map */
    $(".leaflet-control-command").click(function(e) {
        e.stopPropagation();
    });

    /* Prevent clicking from influencing map */
    $(".leaflet-control-command").mousemove(function(e) {
        e.stopPropagation();
    });


    // Leaflet patch to make layer control scrollable on touch browsers
    var container = $(".leaflet-control-layers")[0];
    if (!L.Browser.touch) {
        L.DomEvent.disableClickPropagation(container).disableScrollPropagation(container);
    } else {
        L.DomEvent.disableClickPropagation(container);
    }
    $("#loading").hide();

    var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    matches.push({
                        value: str
                    });
                }
            });

            cb(matches);
        };
    };





    // Create a mouseout event that undoes the mouseover changes
    function mouseout(e) {

        var layer = e.target;

        geojsonLayer.setStyle(stylefunc);

        $("#popup").remove();
    }

    //mouseover highlight
    function highlightFeature(e) {

        var layer = e.target;

        var fp = e.target.feature.properties,
            popup, hed;


        layer.setStyle({
            opacity: 1,
            weight: 2,
            color: 'yellow'
        });


        //no formatting for type=regular - think: median year housing unit built (only one)

        // Create a popup
        popup = $("<div></div>", {
            id: "popup",
            css: {
                position: "absolute",
                bottom: "50px",
                left: "10px",
                zIndex: 1002,
                backgroundColor: "white",
                padding: "8px",
                border: "1px solid #ccc"
            }
        });

        // Insert a headline into that popup
        if (titleGeo != "BG") {
            hed = $("<div></div>", {
                text: fp.first_city,
                css: {
                    fontSize: "16px",
                    marginBottom: "3px"
                }
            }).appendTo(popup);
        } else {
            hed = $("<div></div>", {
                text: titleGeo + " " + fp.geonum.toString().substr(12,1) + ", Tract: " + fp.geonum.toString().substr(6,6),
                css: {
                    fontSize: "16px",
                    marginBottom: "3px"
                }
            }).appendTo(popup);
        }
        // Add the popup to the map
        popup.appendTo("#map");


    }

    
    
    function onEachFeature(feature, layer) {
        
        
        
        if (feature.properties){
            
            //layer.bindLabel(feature.properties.first_city).addTo(map).showLabel();
            
            var tableColumns = "<tr><th>Field</th><th>Value</th></tr>";
            var bgname = "";
            var mhi_cv = feature.properties.b19013_moe001/1.645/feature.properties.b19013001*100;
            var mhv_cv = feature.properties.b25077_moe001/1.645/feature.properties.b25077001*100;

            // if (feature.properties.sdo_jobs_2006 > 0) {
                var content = "<br /><table class='table table-striped table-bordered table-condensed'>" + tableColumns
                        + "<tr><th>Municipality</th><td>" + feature.properties.first_city + "</td></tr>"
                        + "<tr><th>Population</th><td>" + commafy(feature.properties.Population) + "</td></tr>"
                        + "<tr><th>Sales Tax</th><td>" + feature.properties.SalesTax + "</td></tr>"
                        + "<tr><th>Use Tax</th><td>" + feature.properties.UseTax + "</td></tr>"
                        + "<tr><th>Mill Levy</th><td>" + feature.properties.MillLevy + "</td></tr>"
                        + "<tr><th>County(s)</th><td>" + feature.properties.County + "</td></tr>"
                        + "<tr><th>Charter Type</th><td>" + feature.properties.Charter + "</td></tr>"
                        + "<tr><th>Website</th><td>" + feature.properties.Website + "</td></tr>"
                        + "</table><br />";

            var title = feature.properties.first_city;

            layer.on({
                click: function(e) {
                    $("#feature-title").html(title);
                    $("#feature-info").html(content);
                    //$("#contact").html(contact);
                    //$('#dolalink').attr('href', newlink);
                    
                    $("#featureModal").modal("show");
                    this.bringToBack(); //to deal with overlapping features.  click again and obscured feature is now on top
                    
                    console.log(title);
                    $("#export").click(function(){
                        $("#feature-info").tableToCSV(title);
                    })
                },
                mouseover: highlightFeature,
                mouseout: mouseout
            });
        };

    };

    function commafy(nStr) {
        var x, x1, x2, rgx;
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    
    //Searchbox functionality
    $("#searchdiv").click(function () {console.log("Clicked");
            $(this).select();
    });
    
    $('#searchdiv .typeahead').typeahead({
        hint: true,
        highlight: true
    },
    {
        name: 'feature.properties.first_city',
        displayKey: 'value',
        source: geojsonLayer
    }
    );
    
    $('#searchdiv .typeahead').on('typeahead:selected', function (e, datum) {
    	searchresult(datum);
    }).on('typeahead:autocompleted', function (e, datum) {
    	searchresult(datum);	
    });
    
    function searchresult(result){
        for(i=1;i<523;i++){
        	if(lv[i].n==result.value){
        		map.panTo(new L.LatLng(lv[i].lat,lv[i].lng));
        	}
        }
    }

    //on dom loaded
    $(document).ready(function() {


        //dropdown suggestions default to hidden.  
        $('.tt-menu').css("visibility", "hidden");

        //if textbox is cleared, dropdown suggestions become hidden again
        $('#slgid').on('input', function() {
            if ($('#slgid').val() == "") {
                $('.tt-menu').css("visibility", "hidden");
            } else {
                $('.tt-menu').css("visibility", "visible");
            }

        });

        //initialize geojsonLayer
        geojsonLayer = L.geoJson.ajax("", {
            middleware: function(data) {
                getJson(data);
            },
            onEachFeature: onEachFeature
        });


        //keep track of time.  when stopped moving for two seconds, redraw
        map.on('movestart', function() {
            var d = new Date();
            globalbusy = d.getTime();
        });

        map.on('moveend', function() {
            var d = new Date();
            globalbusy = d.getTime();


            setTimeout(function() {
                var e, curtime, c, clat, clng;

                e = new Date();
                curtime = e.getTime();
                if (curtime >= (globalbusy + 1000)) {

                    //get center of map point
                    c = map.getCenter();
                    clat = c.lat;
                    clng = c.lng;

                    //if center point is still within the current map bounds, then dont do anything.  otherwise, run query again
                    if (clat < coord.nelat && clat > coord.swlat && clng < coord.nelng && clng > coord.swlng) {

                        if (map.getZoom() !== lastzoom) {
                            ajaxcall();
                        }

                    } else {
                        ajaxcall();
                    }



                }
            }, 1000);


        }); // end 'on moveend'

        map.on('zoomstart', function() {
            var d = new Date();
            globalbusy = d.getTime();
        });

        //when map is zoomed in or out
        map.on('zoomend', function() {
            var d, e, curtime, curzoom;

            d = new Date();
            globalbusy = d.getTime();

            setTimeout(function() {
                e = new Date();
                curtime = e.getTime();

                if (curtime >= (globalbusy + 1000)) {

                    if (map.getZoom() !== lastzoom) {
                        ajaxcall();
                    }

                }
            }, 1000);


        });

        //kick it!
        ajaxcall();

    });

}
