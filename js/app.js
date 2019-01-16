var locations = [
	{
		coords:{lat: -22.5112, lng: -43.1779 },
		name: "Petrópolis"
	},
	{
		coords:{lat: -22.7561, lng: -43.4607 },
		name: "Nova Iguaçu"
	},
	{
		coords:{lat: -22.9843, lng: -43.2231 },
		name: "Leblon"
	},
	{
		coords: {lat: -22.7564, lng: -41.8890 },
		name: "Búzios"
	},
	{
		coords: {lat: -22.8867, lng: -42.0262 },
		name: "Cabo Frio"
	}

];



var ViewModel= function(){
	
	var self = this;

	self.filterLocation = ko.observable("");

	self.location = ko.observable();
	
	self.locationsList = ko.observableArray([]);
	
	ko.utils.arrayForEach(locations,function(locationItem){
		
			self.locationsList.push(locationItem);
		
	});



	this.newArray = ko.computed(function(){
	
			return ko.utils.arrayFilter(self.locationsList(), function(s){
				return s.name.toLowerCase().indexOf(self.filterLocation().toLowerCase()) > -1  ;
			});

	
		
	})


	this.setLocation = function(obj) {

		ko.utils.arrayFilter(markers, function(marker){
			if (marker.title == obj.name) {
                google.maps.event.trigger(marker, 'click');
            }

		})
	
	
	}
	
	
	this.message = ko.observable();

	this.clearMessage = function(){
		this.message(0);
	}

	
}

//global var
var map;


function  initMap(){
	var options= {
		zoom: 8,
		center: {lat: -22.9068, lng: -43.1729 }
	}

	map = new google.maps.Map(document.getElementById('map'), options);


	//add a marker
	addMarkers(appView.newArray())	

	appView.newArray.subscribe(function(array){
		checkMarkers(array);
		
	})

	
}


var markers = [];
//adding markers in the marker in the based in the array of locations
function addMarkers(locations){

	ko.utils.arrayForEach(locations,function(location){
	
		var marker = new google .maps.Marker ({
			position: location.coords,
			map:map,
			animation: google.maps.Animation.DROP,
			title: location.name
		}); 

		markers.push(marker);
		var infoWindow = new google.maps.InfoWindow();
	

		marker.addListener('click', function(){
			getFourSquareInfo( marker);
		 });

		
	});


}



function isThereAMarkerInTheArray(locations, marker){
	return  ko.utils.arrayFirst(locations, function(location){
		return marker.title==location.name;
	})
}

function checkMarkers(locations){
	
	ko.utils.arrayForEach(markers,function(marker){
	
		if(isThereAMarkerInTheArray(locations, marker)){
			marker.setVisible(true)
		}else{
			marker.setVisible(false)
		}
	}) 
	
		
	   

}

function  getFourSquareInfo(marker){
            
	 var url = "https://api.foursquare..com/v2/venues/explore?client_id=NU50RLOUCLB0EL0WYS3IWHWDYVBKZ4NB13DOGINFOVGVPZYP&client_secret=4TNFZKQI2SJ1JB0DJPGDFX52FWTJJDABHU4OXFT3YYBGDI3F&v=20170101&v=20180323&limit=1&ll="+marker.position.lat()+"," + marker.position.lng();


	 $.ajax({
		 url:url,
		 contentType: "application/json; charset=utf-8",
		 dataType: "jsonp",
		 async: false,
	 })
		 .done( function (data) {

			title = data.response.headerLocation;
			name= data.response.groups[0].items[0].venue.name;
			type =  data.response.groups[0].items[0].venue.categories[0].name
			name = name + " - " + type;
			loc = data.response.groups[0].items[0].venue.location.formattedAddress;
		   
		   var infoWindow = new google.maps.InfoWindow();
		 
			 infoWindow.setContent("<h3>"+ title +"</h3><p   >Recommended Place</p>"+ "<p class='font-weight-bold'>"+name+"</p>" + loc);
			 infoWindow.open(marker.getMap(),marker);

			 marker.setAnimation(google.maps.Animation.BOUNCE);
			 setTimeout(function () {
				 marker.setAnimation(null);
			 }, 3*600); 
		})
		.fail( function (jqXHR, textStatus, errorThrown){
			//A function to be called if the request fails.
			appView.message('Error calling the Foursquare API.')
        });

	 
	
	
 }

$(document).ready(function () {
    
                $('#sidebarCollapse').on('click', function () {

                    $('#sidebar').toggleClass('active');
                });
    
            });   

appView = new ViewModel();
ko.applyBindings(appView);


function mapError(messageOrEvent, source, lineno, colno, error) {
   
		appView.message("Oops! Something went wrong. This page didn’t load Google Maps correctly.");
}

