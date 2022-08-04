/**
* A unit of spatial location. It is by default geodesic but it is coverted to radians if the convertRadToCoords is invoked.
* @param {number} lat The latitude
* @param {number} lon The longitude
*/
class Position{
  constructor(lat, lon){
    this.lat = Number.parseFloat(lat);
    this.lon = Number.parseFloat(lon);
    /* The coordiantes are geodesic is they are expressed in latitute and longitude.
    Else are polar if they are expressed in radians */
    //this.positionFormat = "geodesic";
  }

  /**
  * Returns the current latitude in radians
  */
  getLatRad(){
    return (this.lat * Math.PI) / 180;
  }

  /**
  * Returns the current longitude in radians
  */
  getLonRad(){
    return (this.lon * Math.PI) / 180;
  }

  /**
  * Returns an object with the current latlon in radians
  */
  getLatLonRad(){
    return {"lat":this.getLatRad(), "lon":this.getLonRad()}
  }

  /**
  * Converts the current position from radians to cartesian lat lng
  */
  convertRadToCoords(){
    this.lat = (this.lat * 180)/Math.PI;
    this.lon = (this.lon * 180)/Math.PI;
    //this.positionFormat = "radians";
  }
  /**
  * Return an array with the two components of the position
  * to have the format to push in the database
  */
  getPositionDoc(){
    let positionDoc = {
      latitude: this.lat,
      longitude:this.lon
    }
    return positionDoc;
  }
}
