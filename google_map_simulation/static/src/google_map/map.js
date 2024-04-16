/** @odoo-module **/

import {registry} from "@web/core/registry";
import {Component, onWillStart, onMounted} from "@odoo/owl";
import {loadJS} from "@web/core/assets";
import {useEffect, useService} from "@web/core/utils/hooks";

class GoogleMapComponent extends Component {
    setup() {
        onWillStart(async () => {
            // con
            //     console.log(MapApiKey);
            const apiKey = "replace your google map key";
            await loadJS(`https://maps.googleapis.com/maps/api/js?key=${apiKey}`);
            const {Map} = await google.maps.importLibrary("maps");
            // const MapApiKey = await this.rpc({
            //     route: '/google_map_simulation/get-google-map-api-key',
            //     params: {},
            // });

        })
        onMounted(async () => {
            await this.showMap();
        })
    }

    async showMap() {
        var self = this;
        let map = new google.maps.Map(document.getElementById('google-map'), {
            center: {lat: 21.9162, lng: 95.9560}, // Set the center of the map to a location in Myanmar
            zoom: 10 // Adjust the zoom level as needed
        });

        // Define an array of customer locations (latitude and longitude)
        let customerLocations = [
            {lat: 16.8661, lng: 96.1951, name: 'User 000001'},
            // {lat: 16.8058, lng: 96.1521, name: 'User 000002'},
            // {lat: 16.8058, lng: 96.1521, name: 'User 000003'},
            // Add more customer locations as needed
        ];

        // // Add markers for each customer location
        customerLocations.forEach(function (location) {
            var marker = new google.maps.Marker({
                position: {lat: location.lat, lng: location.lng},
                map: map,
                title: location.name
            });
            var infowindow = new google.maps.InfoWindow({
                content: location.name // Display the customer name as the label
            });
            infowindow.open(map, marker);
            self.simulateMovement(marker);
        });

    }

    simulateMovement(marker) {
        // Define a set of coordinates for movement
        const movementCoordinates = [
            {lat: 16.8661, lng: 96.1951},
            {lat: 16.8058, lng: 96.1521},
            {lat: 16.9123, lng: 96.1875},
            // Add more coordinates as needed
        ];
        //
        let index = 0;
        //
        // Update marker position at regular intervals to simulate movement
        setInterval(() => {
            marker.setPosition(movementCoordinates[index]);
            index = (index + 1) % movementCoordinates.length;
        }, 1000); // Change the time interval (in milliseconds) for smoother/faster movement
    }
}

GoogleMapComponent.components = {};
GoogleMapComponent.template = "google_map_simulation.GoogleMapSimulation";

registry.category("actions").add("google_map_simulation.action_google_map_simulation", GoogleMapComponent);
