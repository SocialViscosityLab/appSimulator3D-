class Layers {

    static init() {
        /**
         * CartoDB basemap. https://carto.com/help/building-maps/basemap-list/
         * styles: http://bl.ocks.org/Xatpy/raw/854297419bd7eb3421d0/
         */
        VIZI.imageTileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL'
        }).addTo(world);


        /**
         * City billdings retrieved here. Se notes in intro
         */
        VIZI.topoJSONTileLayer('https://tile.nextzen.org/tilezen/vector/v1/all/{z}/{x}/{y}.topojson?api_key=1owVePe8Tg-s69xWGlLzCA', {
            interactive: false,
            style: function(feature) {
                let height;

                if (feature.properties.height) {
                    height = feature.properties.height;
                } else {
                    // This assigns height to geometries with unknown height
                    height = 10;
                }

                return {
                    height: height,
                    transparent: true,
                    opacity: 0.7,
                };
            },
            filter: function(feature) {
                /**
                 * Each vector layer is retrieved with a list of features. This filter selects the elements to be displayed by feature.
                 * For instance, here all but buldings are displayed. Uncomment console.log(feature.properties.kind) to see all the avilable options
                 */
                // console.log(feature.properties.kind)
                return (feature.properties.kind === 'building');
            },
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
        }).addTo(world);

    }

    static initRoute(route) {

        let routeData;
        // Verify the geoJSON format compliance. Wether the file contains features.
        if (route.features) {
            routeData = route.features[0];
        } else {
            routeData = { properties: route.properties, geometry: route.geometry };
        }

        VIZI.geoJSONLayer(routeData, {
            output: true,
            interactive: false,
            style: function(feature) {
                var colour = (feature.properties.color) ? '#' + feature.properties.color : '#800080';
                return {
                    lineColor: colour,
                    lineWidth: 4,
                    lineRenderOrder: 2
                };
            },
            attribution: '&copy; Social Viscosity Lab'
        }).addTo(world);
    }
}