function parseKml(text) {
  var parser = new DOMParser();
  var kml = parser.parseFromString(text,"text/xml");
  var output = Array();

  console.log(kml);
  var placemarks = kml.getElementsByTagName("Placemark");
  console.log(placemarks);
  for(var i = 0; i < placemarks.length; i++) {
    var placemark = placemarks[i];
    var latlng = "";
    var time_begin = "";
    var time_end = "";
    var name = "";

    var point = placemark.getElementsByTagName("Point");
    if (point.length == 0) {
      // Not point data. Maybe LineString data. Discard.
      continue;
    } else if (point.length == 1) {
      latlng = point[0].children[0].innerHTML;
    } else {
      console.error("Invalid point data: ", placemark);
      continue;
    }

    var name_elem = placemark.getElementsByTagName("name");
    if (name_elem.length == 1) {
      name = name_elem[0].innerHTML;
    }

    var timespan = placemark.getElementsByTagName("TimeSpan");
    if (timespan.length == 1) {
      time_begin = timespan[0].children[0].innerHTML;
      time_end = timespan[0].children[1].innerHTML;
    } else {
      console.error("Invalid timespane data: ", placemark);
      continue;
    }

    // Point data: (-122.02223289999999,37.338164,0) 2020-02-07T16:14:56.673Z~2020-02-07T16:20:34.000Z
    output.push({
      'lat': latlng.split(",")[0],
      'lng': latlng.split(",")[1],
      'begin': time_begin,
      'end': time_end,
      'name': name,
    });
  }

  return output;
}
