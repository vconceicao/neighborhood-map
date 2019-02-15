//Pre-loaded locations  with its coordenates
const locations = [{
	coords: {
		lat: -22.5112,
		lng: -43.1779
	},
	name: "Petrópolis"
},
{
	coords: {
		lat: -22.7561,
		lng: -43.4607
	},
	name: "Nova Iguaçu"
},
{
	coords: {
		lat: -22.9843,
		lng: -43.2231
	},
	name: "Leblon"
},
{
	coords: {
		lat: -22.7564,
		lng: -41.8890
	},
	name: "Búzios"
},
{
	coords: {
		lat: -22.8867,
		lng: -42.0262
	},
	name: "Cabo Frio"
}

];


let ViewModel = function () {

const self = this;

self.filterLocation = ko.observable("");

self.location = ko.observable();

self.locationsList = ko.observableArray([]);

self.message = ko.observable();

//iterates the locations array and put it in the obserble array
ko.utils.arrayForEach(locations, function (locationItem) {

	self.locationsList.push(locationItem);

});


//search the locations list based in the filter input
self.filteredLocations = ko.computed(function () {

	//return an array of elements that contains the chars the of the search input
	return ko.utils.arrayFilter(self.locationsList(), function (
		s) {
		return s.name.toLowerCase().indexOf(self
			.filterLocation().toLowerCase()) > -1;
	});



})

//the selected location
self.setLocation = function (obj) {

	ko.utils.arrayFilter(markers, function (marker) {
		//trigger the event if the list view object have the same name of the marker
		if (marker.title === obj.name) {
			google.maps.event.trigger(marker, 'click');
		}

	});


};



//clears the error message
self.clearMessage = function () {
	self.message(0);
}


//Notify if there any changes in the locations array
self.filteredLocations.subscribe(function (array) {
	changeMarkersVisibility(array);
});


};

//global vars
let map;
let markers = [];


//function that is called when the scripts is loaded
function initMap() {
const options = {
	zoom: 8,
	center: {
		lat: -22.9068,
		lng: -43.1729
	}
};

//creates a new map based in the options
map = new google.maps.Map(document.getElementById('map'), options);

var infoWindow = new google.maps.InfoWindow();

//add markers
addMarkers(appView.filteredLocations(), infoWindow);

}


//adding markers in the marker in the based in the array of locations
function addMarkers(locations, infoWindow) {

ko.utils.arrayForEach(locations, function (location) {

	//create a new marker
	var marker = new google.maps.Marker({
		position: location.coords,
		map: map,
		animation: google.maps.Animation.DROP,
		title: location.name
	});

	markers.push(marker);

	//creates an info window showing the info of the location	
	marker.addListener('click', function () {
		var self = this;
		getFourSquareInfo(this, infoWindow);

	});



});


}


//Search the array for a given marker
function isThereAnyMarkerInTheArray(locations, marker) {
	return ko.utils.arrayFirst(locations, function (location) {
		return marker.title === location.name;
	});
}

//Sets the visibility of the marker depending on the filtered array
function changeMarkersVisibility(locations) {
//iterate the markers array to search for any marker that is equal to the filteredLocation
ko.utils.arrayForEach(markers, function (marker) {

	if (isThereAnyMarkerInTheArray(locations, marker)) {
		marker.setVisible(true);
	} else {
		marker.setVisible(false);
	}
});

}

//Get info about the place in foursquare api
function getFourSquareInfo(marker, infoWindow) {

const url =	"https://api.foursquare.com/v2/venues/explore?client_id=NU50RLOUCLB0EL0WYS3IWHWDYVBKZ4NB13DOGINFOVGVPZYP&client_secret=4TNFZKQI2SJ1JB0DJPGDFX52FWTJJDABHU4OXFT3YYBGDI3F&v=20170101&v=20180323&limit=1&ll=" +
	marker.position.lat() + "," + marker.position.lng();


$.ajax({
		url: url,
		contentType: "application/json; charset=utf-8",
		dataType: "jsonp",
		async: false,
	})
	.done(function (data) {

		title = data.response.headerLocation;
		name = data.response.groups[0].items[0].venue.name;
		type = data.response.groups[0].items[0].venue.categories[0].name
		name = name + " - " + type;
		loc = data.response.groups[0].items[0].venue.location
			.formattedAddress;

	
		infoWindow.setContent('<h3>' + title +
			'</h3><p  class="font-weight-normal" >Recommended Place</p>' +
			'<p class="font-weight-bold">' + name + '</p>' +
			'<span class="font-weight-bold">' + loc +'</span>'+
			'<p class="text-right bg-dark text-warning font-weight-normal">'+
			'Information by <a href="https://pt.foursquare.com/">FourSquare</a>');
		infoWindow.open(marker.getMap(), marker);

		//creates an animation when the marker is clicked 
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function () {
			marker.setAnimation(null);
		}, 3 * 600);
	})
	.fail(function (jqXHR, textStatus, errorThrown) {
		//A function called when request fails.
		appView.message('Error calling the Foursquare API.')
	});

}

//move the sidebar to the left when the user clicks the butten
$(document).ready(function () {

$('#sidebarCollapse').on('click', function () {
	$('#filter-sidebar').toggleClass('active');
});

});

//creates the ViewModel
appView = new ViewModel();
ko.applyBindings(appView);

//Shows a message to the user about map error.
function handleMapError(messageOrEvent, source, lineno, colno, error) {

	appView.message("Oops! Something went wrong. This page didn’t load Google Maps correctly.");
}