var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCotkym59Va0-w0Mt_mGK0Hf3SNyURTKnQ'
});

// Geocode an address.
googleMapsClient.geocode({
    address: '1600 Amphitheatre Parkway, Mountain View, CA'
  }, function(err, response) {
    if (!err) {
      console.log(response.json.results);
    }
  });