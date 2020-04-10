class Layers {

    static init() {
        /**
         * CartoDB basemap. https://carto.com/help/building-maps/basemap-list/
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
                    height = 0;
                }

                return {
                    height: height,
                    transparent: true,
                    opacity: 0.4,
                };
            },
            filter: function(feature) {
                // Don't show points
                return feature.geometry.type !== 'Point';
            },
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
        }).addTo(world);

    }

    static initRoute(route) {
        VIZI.geoJSONLayer(route, {
            output: true,
            interactive: false,
            style: function(feature) {
                var colour = (feature.properties.color) ? '#' + feature.properties.color : '#ff0000';
                return {
                    lineColor: colour,
                    lineWidth: 5,
                    lineRenderOrder: 2
                };
            },
            attribution: '&copy; Social Viscosity Lab'
        }).addTo(world);
    }
}