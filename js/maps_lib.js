/*!
 * Searchable Map Template with Google Fusion Tables
 * http://derekeder.com/searchable_map_template/
 *
 * Copyright 2012, Derek Eder
 * Licensed under the MIT license.
 * https://github.com/derekeder/FusionTable-Map-Template/wiki/License
 *
 * Date: 12/10/2012
 *
 */

// Enable the visual refresh
google.maps.visualRefresh = true;

var MapsLib = MapsLib || {};
var MapsLib = {

  //Setup section - put your Fusion Table details here
  //Using the v1 Fusion Tables API. See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  //the encrypted Table ID of your Fusion Table (found under File => About)
  //NOTE: numeric IDs will be depricated soon
  fusionTableId:      "15Blyfz9cTEZqXV77azB_gs17GRoO3cOJgWK_2Hw",

  //*New Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyALDxMa8XW12em3WSqfZhpgRpYEdr8lXTs",

  //name of the location column in your Fusion Table.
  //NOTE: if your location column name has spaces in it, surround it with single quotes
  //example: locationColumn:     "'my location'",
  locationColumn:     "Latitude",

  map_centroid:       new google.maps.LatLng(32.708, -97.363029), //center that your map defaults to
  locationScope:      "fort worth",      //geographical area appended to all address searches
  
  searchRadius:       805,            //in meters ~ 1/2 mile
  defaultZoom:        15,             //zoom level when map is loaded (bigger is more zoomed in)
  addrMarkerImage: 'http://derekeder.com/images/icons/blue-pushpin.png',
  currentPinpoint: null,

  // array to hold map markers
  markers: [],

  mappings: {
    latitude: 9,
    longitude: 10,
    crimeType: 0,
    offenseType: 1,
    dateReported: 2
  },

  initialize: function() {
    $( "#result_count" ).html("");

    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: MapsLib.defaultZoom,
      center: MapsLib.map_centroid,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false
    };
    map = new google.maps.Map($("#map_canvas")[0],myOptions);

    // create new spiderfier instance
    var omsOptions = {
      keepSpiderfied: true
    }
    oms = new OverlappingMarkerSpiderfier(map, omsOptions);

    // event listener to generate info window
    var iw = new google.maps.InfoWindow();
    oms.addListener('click', function(marker, event) {
      iw.setContent(marker.desc);
      iw.open(map, marker);
    });

    // listeners to swap icons
    markerIcons = [];
    oms.addListener('spiderfy', function(markers) {
      for(i in markers) {
        markers[i].icon.url = 'img/pin_' + markerIcons[markers[i].__gm_id] + '.png';
      }
    });
    oms.addListener('unspiderfy', function(markers) {
      for(i in markers) {
        markers[i].icon.url = 'img/pin_' + markers.length + '.png';
      }
    });

    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        MapsLib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(MapsLib.map_centroid);
    });

    MapsLib.searchrecords = null;

    // setup the tablesorter plugin ... should probably move this to .initialize()
    $.extend($.tablesorter.themes.bootstrap, {
      table      : 'table',
      icons      : 'glyphicon pull-right',
      sortNone   : 'glyphicon-sort',
      sortAsc    : 'glyphicon-sort-by-attributes',
      sortDesc   : 'glyphicon-sort-by-attributes-alt',
      active     : 'active' // applied when column is sorted
    });

    //reset filters
    $("#search_address").val(MapsLib.convertToPlainString($.address.parameter('address')));
    $(":checkbox").attr("checked", "checked");
    $("#result_count").hide();
    
    //-----custom initializers-------

    //-----date reported slider-------

    //ranges for our slider
    var minDate = moment("Jan 1 2012"); // Jan 1st 2010
    var maxDate = moment(); //now

    //starting values
    var startDate = moment().subtract('months', 1); //past 3 months
    var endDate = moment(); //now

    MapsLib.initializeDateSlider(minDate, maxDate, startDate, endDate, "days", 7);

    //-----end date reported slider-------
    
    //-----end of custom initializers-------

    //run the default search
    MapsLib.doSearch();
  },

  doSearch: function(location, radius) {
    MapsLib.clearSearch();
    var address = $("#search_address").val();

    if(radius) {
      MapsLib.searchRadius = radius;
    }

    var whereClause = MapsLib.locationColumn + " not equal to ''";

    //-----custom filters-------

    //-----date reported slider-----

    whereClause += " AND 'Date Reported' >= '" + $('#startDate').html() + "'";
    whereClause += " AND 'Date Reported' <= '" + $('#endDate').html() + "'";

    //-----end date reported slider-----

    //-----incident type checkboxes-----

    /*

    var type_column = "'type'";
    var tempWhereClause = [];
    if ( $("#cbType1").is(':checked')) tempWhereClause.push("Healthcare");
    if ( $("#cbType2").is(':checked')) tempWhereClause.push("Property");
    if ( $("#cbType3").is(':checked')) tempWhereClause.push("Public");
    if ( $("#cbType4").is(':checked')) tempWhereClause.push("Other");
    whereClause += " AND " + type_column + " IN ('" + tempWhereClause.join("','") + "')";

    */

    //-----end incicident type checkboxes-----

    //-------end of custom filters--------

    if (address != "") {
      if (address.toLowerCase().indexOf(MapsLib.locationScope) == -1)
        address = address + " " + MapsLib.locationScope;

      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          MapsLib.currentPinpoint = results[0].geometry.location;

          $.address.parameter('address', encodeURIComponent(address));
          $.address.parameter('radius', encodeURIComponent(MapsLib.searchRadius));
          map.setCenter(MapsLib.currentPinpoint);
          map.setZoom(14);

          MapsLib.addrMarker = new google.maps.Marker({
            position: MapsLib.currentPinpoint,
            map: map,
            icon: MapsLib.addrMarkerImage,
            animation: google.maps.Animation.DROP,
            title:address
          });

          whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadius + "))";

          MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
          MapsLib.submitSearch(whereClause, map, MapsLib.currentPinpoint);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else { //search without geocoding callback
      MapsLib.submitSearch(whereClause, map);
    }
  },

  clearSearch: function() {
    if (MapsLib.searchrecords != null)
      for (i in MapsLib.markers) {
        MapsLib.markers[i].setMap(null);
      }
      oms.clearMarkers();
    if (MapsLib.addrMarker != null)
      MapsLib.addrMarker.setMap(null);
    if (MapsLib.searchRadiusCircle != null)
      MapsLib.searchRadiusCircle.setMap(null);
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var foundLocation;

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        MapsLib.addrFromLatLng(foundLocation);
      }, null);
    }
    else {
      alert("Sorry, we could not find your location.");
    }
  },

  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search_address').val(results[1].formatted_address);
          $('.hint').focus();
          MapsLib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  drawSearchRadiusCircle: function(point) {
      var circleOptions = {
        strokeColor: "#4b58a6",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: "#4b58a6",
        fillOpacity: 0.05,
        map: map,
        center: point,
        clickable: false,
        zIndex: -1,
        radius: parseInt(MapsLib.searchRadius)
      };
      MapsLib.searchRadiusCircle = new google.maps.Circle(circleOptions);
  },

  submitSearch: function(whereClause, map, location) {
    var query = 'SELECT * FROM ' + MapsLib.fusionTableId + ' WHERE ' + whereClause;

    var url = ['https://www.googleapis.com/fusiontables/v1/query'];
    url.push('?sql=' + encodeURIComponent(query));
    url.push('&key=' + MapsLib.googleApiKey);
    url.push('&callback=?');

    $.ajax({
      url: url.join(''),
      dataType: 'jsonp',
      success: function (data) {
        if(data.rows) {
          MapsLib.handleError(data);
          MapsLib.searchrecords = data.rows;
          MapsLib.drawMarkers(MapsLib.searchrecords);
          MapsLib.displayList(MapsLib.searchrecords);
          MapsLib.displaySearchCount(MapsLib.searchrecords.length);
        } else {
          MapsLib.displaySearchCount(0);
        }
      }
    });
  },

  drawMarkers: function(rows) {
    // count number of incidents per unique location
    locationCount = [];
    for (var i = 0; i < rows.length; i ++) {
      var locationKey = rows[i][9].toString() + rows[i][10].toString();
      if(locationCount[locationKey]) {
        locationCount[locationKey]++;
      }
      else {
        locationCount[locationKey] = 1;
      }
    }
    for (var i = 0; i < rows.length; i ++) {
      var record = rows[i];
      var loc = new google.maps.LatLng(rows[i][9], rows[i][10]);
      // if multiple crimes per location, use a number icon else an icon for the incident type
      var iconName = rows[i][MapsLib.mappings.crimeType].replace(/\s+/g, '').toLowerCase();
      var icon = {
        size: new google.maps.Size(46, 64),
        scaledSize: new google.maps.Size(35,48),
        anchor: new google.maps.Point(17,47)
      };
      var locationKey = rows[i][9].toString() + rows[i][10].toString();
      if(locationCount[locationKey] > 1) {
        icon.url = 'img/pin_' + locationCount[locationKey].toString() + '.png';
      }
      else {
        icon.url = 'img/pin_' + iconName + '.png';
      }
      var marker = new google.maps.Marker({
        position: loc,
        desc: rows[i][MapsLib.mappings.crimeType],
        map: map,
        icon: icon
      });
      markerIcons[marker.__gm_id] = iconName;
      MapsLib.markers.push(marker);
      oms.addMarker(marker);
    }
  },

  displayList: function(rows) {
    var template = "";

    var results = $("#results_list");
    results.hide().empty(); //hide the existing list and empty it out first

    if (rows == null) {
      //clear results list
      results.fadeOut();
    }
    else {
      for (var row in rows) {
        template = "\
          <tr>\
            <td><strong>" + rows[row][0] + "</strong></td>\
            <td>" + rows[row][1] + "</td>\
            <td>" + rows[row][2] + "</td>\
            <td>" + rows[row][3] + "</td>\
          </tr>";
        results.append(template);
      }
    }

    // call the tablesorter plugin and apply the uitheme widget
    $("table").tablesorter({
      theme : "bootstrap",
      widthFixed: true,
      headerTemplate : '{content} {icon}', // new in v2.7. Needed to add the bootstrap icon!
      widgets : [ "uitheme" ],
      sortList: [[2,1]],
      widgetOptions : {
        filter_reset : ".reset"
      }
    });
    $('table').trigger('update');

    results.show();
    $('table').fadeIn();
  },

  handleError: function(json) {
    if (json["error"] != undefined) {
      var error = json["error"]["errors"]
      console.log("Error in Fusion Table call!");
      for (var row in error) {
        console.log(" Domain: " + error[row]["domain"]);
        console.log(" Reason: " + error[row]["reason"]);
        console.log(" Message: " + error[row]["message"]);
      }
    }
  },

  displaySearchCount: function(numRows) {
    var name = MapsLib.recordNamePlural;
    if (numRows == 1)
    name = MapsLib.recordName;
    $( "#result_count" ).fadeOut(function() {
        $( "#result_count" ).text(MapsLib.addCommas(numRows));
      });
    $( "#result_count" ).fadeIn();
  },

  addCommas: function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },

  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
  	return decodeURIComponent(text);
  },
  
  //-----custom functions-------
  // NOTE: if you add custom functions, make sure to append each one with a comma, except for the last one.
  // This also applies to the convertToPlainString function above

  //-----date reported slider-------
  
  initializeDateSlider: function(minDate, maxDate, startDate, endDate, stepType, step) {
    var interval = MapsLib.sliderInterval(stepType);

    $('#minDate').html(minDate.format('MMM YYYY'));
    $('#maxDate').html(maxDate.format('MMM YYYY'));
    
    $('#startDate').html(startDate.format('L'));
    $('#endDate').html(endDate.format('L'));
    
    $('#date-range').slider({
      range: true,
      step: step,
      values: [ Math.floor((startDate.valueOf() - minDate.valueOf()) / interval), Math.floor((maxDate.valueOf() - minDate.valueOf()) / interval) ],
        max: Math.floor((maxDate.valueOf() - minDate.valueOf()) / interval),
        slide: function(event, ui) {
            $('#startDate').html(minDate.clone().add(stepType, ui.values[0]).format('L'));
            $('#endDate').html(minDate.clone().add(stepType, ui.values[1]).format('L'));
        },
        stop: function(event, ui) {
          MapsLib.doSearch();
        }
    });
  },

  sliderInterval: function(interval) {
    if (interval == "years")
      return 365 * 24 * 3600 * 1000;
    if (interval == "quarters")
      return 3 * 30.4 * 24 * 3600 * 1000;
    if (interval == "months") //this is very hacky. months have different day counts, so our point interval is the average - 30.4
      return 30.4 * 24 * 3600 * 1000;
    if (interval == "weeks")
      return 7 * 24 * 3600 * 1000;
    if (interval == "days")
      return 24 * 3600 * 1000;
    if (interval == "hours")
      return 3600 * 1000;
    else
      return 1;
  }

  //-----end date reported slider-------

  //-----end of custom functions-------
}