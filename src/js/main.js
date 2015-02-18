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
