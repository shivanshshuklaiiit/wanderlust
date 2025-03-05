document.addEventListener("DOMContentLoaded", function () {
          mapboxgl.accessToken = mapToken;
          
          const map = new mapboxgl.Map({
              container: 'map', // Ensure 'map' div exists
              center: coordinates, // Longitude, Latitude
              zoom: 9
          });
      });
      const marker = new mapboxgl.Marker({color: "red"})
        .setLngLat(coordinates)  // Listing.geometry.coordinates
        .addTo(map);