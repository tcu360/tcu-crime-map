/*
 * Concatenate and minify files using CodeKit
 */

//@codekit-prepend 'jquery.js';
//@codekit-prepend 'moment.js';
//@codekit-prepend '../bootstrap/js/bootstrap.js';
//@codekit-prepend 'jquery.tablesorter.js';
//@codekit-prepend 'jquery.tablesorter.widgets.js';
//@codekit-prepend 'daterangepicker.js';
//@codekit-prepend 'jquery.address.js';
//@codekit-prepend 'oms.min.js';
//@codekit-prepend 'jquery.geocomplete.js';
//@codekit-prepend 'maps_lib.js';

/*
 * Initialize app
 */
$(window).resize(function () {
	var width = $('#map_canvas').width();
	$('#map_canvas').height(width / 1.875);
}).resize();
        
$(function() {
  MapsLib.initialize();

  $(':checkbox').click(function(){
    MapsLib.doSearch();
  });

  $(':radio').click(function(){
    MapsLib.doSearch();
  });
  
  $('#search a.radius').click(function(){
    MapsLib.doSearch(null, $(this).data('distance'));
  });
  
  $('#find_me').click(function(){
    MapsLib.findMe(); 
    return false;
  });
  
  $('#search a.reset').click(function(){
    $.address.parameter('address','');
    MapsLib.initialize(); 
    return false;
  });
  
  $(":text").keydown(function(e){
      var key =  e.keyCode ? e.keyCode : e.which;
      if(key == 13) {
          $('#search').click();
          return false;
      }
  });
});