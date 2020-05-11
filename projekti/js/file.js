document.getElementById("uploadInput").addEventListener("change", fileEvent, false);
map = new OpenLayers.Map("pictureMap");
map.addLayer(new OpenLayers.Layer.OSM());
map.zoomToMaxExtent();
markers = new OpenLayers.Layer.Markers ("Markers");
map.addLayer(markers);
//fetch data from the image and show it
function fileEvent(event) {

    let lat;
    let lon;
    let date;
    const file = this.files[0];
    console.log(file);

    let reader = new FileReader()
    reader.onload = () =>{
        var output = document.getElementById('imageOutput')
        output.src = reader.result
    }
    reader.readAsDataURL(event.target.files[0])


    EXIF.getData(file,  ()=> {
        if(EXIF.getTag(file, "ImageWidth")!= undefined){
        date = EXIF.getTag(file, "DateTime")
            .slice(0, 10)
            .split(":", 3)
        console.log(date)
        //find and set size and resolution
        let resolution = [EXIF.getTag(file, "ImageWidth"), EXIF.getTag(file, "ImageHeight")]
        document.getElementById("resolution").innerHTML = resolution[0] +"x"+ resolution[1]
        document.getElementById("size").innerHTML= (file.size /1000000) + "MB"
        //gps coordinates to open layer format
        lat = EXIF.getTag(file, "GPSLatitude");
        lon = EXIF.getTag(file, "GPSLongitude");
        document.getElementById("latitude").innerHTML = lat[0] +"° "+lat[1]+"\' "+lat[2]+"\'\'"
        document.getElementById("longitude").innerHTML = + lon[0] +"° "+lon[1]+"\' "+lon[2]+"\'\'"
        let lonnum = lon[0] + lon[1] / 60 + lon[2] / 3600;
        let latnum = lat[0] + lat[1] / 60 + lat[2] / 3600;
        let lonLat = new OpenLayers.LonLat(lonnum, latnum)
            .transform(
                new OpenLayers.Projection("EPSG:4326"),
                map.getProjectionObject()
            );
        console.log("Lonlat: ", lonLat);
        //clear old markers, set a new one and set map center on it
        markers.clearMarkers();
        markers.addMarker(new OpenLayers.Marker(lonLat));
        map.setCenter(lonLat, 16);
        weatherEvent(latnum,lonnum, date);
        }
        else {
            window.alert("could not find exif data from your image :(")
        }
    });
}
async function weatherEvent(latnum, lonnum, date){
console.log("starting weatherEvent");
    let woeid;
    try{
        const response = await fetch("https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/search/?lattlong=" + latnum + "," + lonnum);
        if (!response.ok) throw new Error("something went wrong");
        const data = await response.json();
        console.log(data);
        woeid =  data[0].woeid;

    }catch (error) {
        console.log(error)
    }
    try{
        const response = await fetch("https://cors-anywhere.herokuapp.com/https://www.metaweather.com/api/location/" + woeid +"/"+ date[0] +"/" + date[1] +"/"+ date[2]);
        if (!response.ok) throw new Error("something went wrong");
        const data = await response.json();
        console.log(data[0]);
        let windSpeedMeters = data[0].wind_speed * 0.44704;
        //document.getElementById("date").innerHTML = "Date: " + date[2] + "." + date[1] + "." + date[0]
        document.getElementById("weatherState").innerHTML = data[0].weather_state_name
        document.getElementById("weatherTemperature").innerHTML = Math.floor(data[0].the_temp) +" °C"
        document.getElementById("weatherWindDirectionCompass").innerHTML =  data[0].wind_direction_compass
        document.getElementById("weatherWindSpeed").innerHTML = Math.floor(windSpeedMeters) +" m/s"

    }catch (error) {
        console.log(error)
    }
}
function startScroll(){
    document.body.style.overflow = "visible"
    console.log("started scrolling");
}
function stopScroll(){
    document.body.style.overflow = "hidden"
}
