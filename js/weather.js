(function(scope){

	var version = "Weather plugin version 3";
	var openWeatherAPIKey = "4512ed7970224d30805e826affe9ef11";
	var doc = scope.document;
	var jData = {}
	
	var wQ = function (){
		//wQ.wind(jData);
	};

	//Return the version of the library
	wQ.version = function () {
		return version;
	};

	//Load javascript scripts
	wQ.loadJS = function(path) {
		return new Promise( function (resolve, reject) {
        	var js = doc.createElement('script');
			js.src = path;
			js.type = 'text/javasctipt';
			head = doc.getElementsByTagName('head')[0];

    		js.onload = () => resolve( this.onload() );
    		js.onerror = () => reject('Error loading file');
    		head.appendChild(js);
    	});
	};

	//Load JSON files with promises.
	wQ.loadJSON = function (path) {
		return new Promise( function (resolve, reject) {
        	var xhr = new XMLHttpRequest();
    		xhr.open("GET", path);
    		xhr.onload = () => resolve(xhr.responseText);
    		xhr.onerror = () => reject(xhr.statusText);
    		xhr.send();
    	});
	};

	wQ.funcDeffered = function (ms) {
      var deferred = $.Deferred();
      setTimeout(deferred.resolve, ms);
     // We just need to return the promise not the whole deferred.
     return deferred.promise();
  	}

	wQ.weather = function(city,mode){
		//http://api.openweathermap.org/data/2.5/weather?q=Montreal&mode=html&appid=4512ed7970224d30805e826affe9ef11
		var path = 'http://api.openweathermap.org/data/2.5/weather?q='+city+"&mode="+mode+"&appid="+ openWeatherAPIKey;
		//Get the data form openweather.org
		var objData = wQ.loadJSON(path)
        .then(function (wdata) {
		    return JSON.parse(wdata);
        })
        .catch(function (error) {
            console.log("Oopssii! Connection error.");
        });

        wQ.funcDeffered(1000)
        .then(function () {
        	objData.then(function(data) {
        	 	wQ.createWidget(data, wQ.wind(data.wind));
        	})
  		});
	};

	//Manipulate the wind data, and calculate the cardinal point
	wQ.wind = function(windData) {
		//Could change with work with a another idiom.
		var degDictionary = {
			0 : {
				degree: 348.75,
				direction: "Norte"
			},
			1: {
				degree:  11.25,
				direction: "Nornoreste"	
			},
			2:{
				degree:  33.75,
				direction: "Noreste"	
			},
			3:{
				degree:  56.25,
				direction: "Estenoreste"	
			},
			4:{
				degree:  78.75,
				direction: "Este"	
			},
			5:{
				degree:  101.25,
				direction: "Estesudeste"	
			},
			6:{
				degree:  123.75,
				direction: "Sudeste"	
			},
			7:{
				degree:  146.25,
				direction: "Sursudeste"	
			},
			8:{
				degree:  168.75,
				direction: "Sur"	
			},
			9:{
				degree:  191.25,
				direction: "Sursudoeste"	
			},
			10:{
				degree:  213.75,
				direction: "Sudoeste"	
			},
			11:{
				degree:  236.25,
				direction: "Oesudoeste"	
			},
			12:{
				degree:  258.75,
				direction: "Oeste"	
			},
			13:{
				degree:  281.25,
				direction: "Oesnoroeste"	
			},
			14:{
				degree:  303.75,
				direction: "Noroeste"	
			},
			15:{
				degree:  326.25,
				direction: "Nornoroeste"	
			},
		}

		var keys = Object.keys(degDictionary);
		var fElem = {};
		var nProximity = 0;
		var dif = 0;
		var i = 0;

		for (i= 0; i < keys.length; i++) {
			if (dif == 0) dif = degDictionary[keys[i]].degree;
			nProximity = windData.deg - (degDictionary[keys[i]].degree+22.5);
			if(nProximity < 0) {
				if( Math.abs(nProximity) < Math.abs(dif) ) {
					dif = nProximity;
					fElem = {data:{ degree: degDictionary[keys[i]].degree,
							  		direction: degDictionary[keys[i]].direction
							}}
				}
			}
		}	
		return fElem;
	};

	//Format date to be displayed
	wQ.formatDate = function(date) {
		var day = date.getDate(),
  			monthIndex = date.getMonth(),
  			year = date.getFullYear(),
			months = [	"Enero",
  						"Febrero",
  						"Marzo",
  						"Abril",
  						"Mayo",
  						"Junio",
  						"Julio",
  						"Agosto",
  						"Septiembre",
  						"Octubre",
  						"Noviembre",
  						"Diciembre"];
  		return day + ' ' + months[monthIndex] + ' ' + year;
	}

	//Create weather widget
	wQ.createWidget = function(objData, objWind) {

		var frag = doc.createDocumentFragment(),
  	  		divtitle = doc.createElement("div"),
  	  		divimag = doc.createElement("div"),
			img = doc.createElement("img"),
			divdate = doc.createElement("div"),
			divloc = doc.createElement("div"),
			divwind = doc.createElement("div"),
			wElem = doc.getElementById('weather'),
			dateElem = wQ.formatDate(new Date()),
			ktocTem = objData.main.temp - 273.15;

		divtitle.appendChild(doc.createTextNode("Weather widget"));
		img.src = 'http://openweathermap.org/img/w/'+objData.weather[0].icon+'.png';
		divimag.appendChild(img);
		divdate.appendChild(doc.createTextNode(dateElem));
		divloc.appendChild(doc.createTextNode(objData.name + ' ' + ktocTem +'°C'));
		divwind.appendChild(doc.createTextNode(objData.wind.speed + 'm/s ' + objWind.data.direction));
		
		frag.appendChild(divtitle);
		frag.appendChild(divimag);
		frag.appendChild(divdate);
		frag.appendChild(divloc);
		frag.appendChild(divwind);
		wElem.appendChild(frag);
	}

	//Control versions
	if(!scope.wQ) {
		scope.wQ = wQ;
	}else {
		if(scope.wQ.version) {
			scope.wQ = scope.wQ.version() > version ? scope.wQ : wQ;
		}else {
			throw new Error("weather.js already exists");
		}
	}
}(window));


/*Parameters:

coord
coord.lon City geo location, longitude
coord.lat City geo location, latitude
weather (more info Weather condition codes)
weather.id Weather condition id
weather.main Group of weather parameters (Rain, Snow, Extreme etc.)
weather.description Weather condition within the group
weather.icon Weather icon id
base Internal parameter
main
main.temp Temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
main.pressure Atmospheric pressure (on the sea level, if there is no sea_level or grnd_level data), hPa
main.humidity Humidity, %
main.temp_min Minimum temperature at the moment. This is deviation from current temp that is possible for large cities and megalopolises geographically expanded (use these parameter optionally). Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
main.temp_max Maximum temperature at the moment. This is deviation from current temp that is possible for large cities and megalopolises geographically expanded (use these parameter optionally). Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
main.sea_level Atmospheric pressure on the sea level, hPa
main.grnd_level Atmospheric pressure on the ground level, hPa
wind
wind.speed Wind speed. Unit Default: meter/sec, Metric: meter/sec, Imperial: miles/hour.
wind.deg Wind direction, degrees (meteorological)
clouds
clouds.all Cloudiness, %
rain
rain.3h Rain volume for the last 3 hours
snow
snow.3h Snow volume for the last 3 hours
dt Time of data calculation, unix, UTC
sys
sys.type Internal parameter
sys.id Internal parameter
sys.message Internal parameter
sys.country Country code (GB, JP etc.)
sys.sunrise Sunrise time, unix, UTC
sys.sunset Sunset time, unix, UTC
id City ID
name City name
cod Internal parameter*/