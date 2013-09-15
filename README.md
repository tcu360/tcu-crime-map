# TCU 360 crime map
This is the repo for the TCU 360 crime map. It's based heavily on [derekeder/FusionTable-Map-Template](https://github.com/derekeder/FusionTable-Map-Template).

Roadmap
---------------------------
* Add filters
* Add Facebook, Twitter sharing capabilities
* Integrate Google Analytics, Chartbeat

Major change log
---------------------------
__9/15/13__
* [Applied 360 styles](https://github.com/tcu360/tcu-crime-map/commit/289c05db457d3d62facbd63a19a13a31ecaae9db)

__9/14/13__
* New map markers, [map marker behavior](https://github.com/tcu360/tcu-crime-map/commit/fa725a633d3327d67b82a886352b431d015928e4)

__9/13/13__
* Upgraded to Bootstrap 3.
* Added sortable table view below map using [`tablesorter`](http://tablesorter.com/docs/).

__9/12/13__
* Modified to use [`OverlappingMarkerSpiderfier`](https://github.com/jawj/OverlappingMarkerSpiderfier) to handle location redundancy and the Fusion tables API to load markers instead of the Google Maps API Fusion Table layer functionality.

Libraries
---------------------------
<table>
	<thead>
		<tr>
			<th>Item</th>
			<th>Version</th>
		</tr>
	</thead>
	<tbody>
	    <tr>
	        <td>[Bootstrap](https://github.com/twbs/bootstrap)</td>
	        <td>3.0.0</td>
	    </tr>
	    <tr>
	    	<td>[jQuery Address](https://github.com/asual/jquery-address)</td>
	    	<td>1.6</td>
	    </tr>
	    <tr>
	    	<td>[jQuery Geocoding and Places Autocomplete Plugin](https://github.com/ubilabs/geocomplete/)</td>
	    	<td>1.4</td>
	    </tr>
	    <tr>
	    	<td>[Moment.js](https://github.com/moment/moment)</td>
	    	<td>2.10</td>
	    </tr>
	    <tr>
	    	<td>[OverlappingMarkerSpiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier)</td>
	    	<td>0.3</td>
		</tr>
		<tr>
			<td>[TableSorter](https://github.com/Mottie/tablesorter)</td>
			<td>2.10.8</td>
		</tr>
	</tbody>
</table>