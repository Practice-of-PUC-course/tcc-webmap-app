/**
 * Build the map componente based on Leaflet.
 */
var mainMap={
    map:null,// reference to leaflet map component
    mainLayer: null,// reference to main leaflet layer based on geojson raw data.
    defaultZoomLevel:5,// the zoom level used to reset view map
    info:L.control(),
    ctrlLayer:null,
    baseLayers:{},
    overLayers:{},
    selectedFeature:null,

    init:(dataSource)=>{
        mainMap.createMap(dataSource);
    },

    createMap:(dataSource)=>{
        if (mainMap.map) {
            mainMap.map.off();
            mainMap.map.remove();
        }
        let bbox=conf.gs_bbox;
        bbox=L.latLngBounds(bbox.northEast,bbox.southWest);
        mainMap.map = L.map('mainmap').setView(bbox.getCenter(), mainMap.defaultZoomLevel);
        mainMap.map.fitBounds(bbox);

        mainMap.addBaseLayer(dataSource);
        mainMap.addWMSLayers(dataSource);
        mainMap.addControlLayers();
        //mainMap.addInfoControl();
        mainMap.addAttribution();
    },

    // create and add the OSM layer as base layer (background)
    addBaseLayer:(conf)=>{
        mainMap.baseLayers["OpenStreetMap"]=L.tileLayer(conf.osm_url+'/{id}/tiles/{z}/{x}/{y}?access_token='+conf.osm_token, {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/light-v9',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(mainMap.map);
    },

    addControlLayers:()=>{
        let baseLayers=mainMap.baseLayers;
        let overlays=mainMap.overLayers;
        mainMap.ctrlLayer=L.control.layers(baseLayers, overlays).addTo(mainMap.map);
    },

    // create the overlay layers as WMS layer
    addWMSLayers:(conf)=>{
        let ZIndex=1,
        layers=conf.gs_layers;
        for(let i in layers) {
            
            let l=L.tileLayer.wms(conf.gs_url+"/wms", {
                layers: layers[i].workspace + ':' + layers[i].name,
                format: 'image/png',
                transparent: true,
                tiled: true,
                zIndex: ZIndex,
                attribution: 'IBGE'
            });
            mainMap.overLayers[layers[i].label]=l;
            ZIndex++;
        }
    },

    removeMarker: ()=>{
        if(mainMap.marker){
            mainMap.map.removeLayer(mainMap.marker);
        }
    },

    addMarker: (location, values)=>{
        if(mainMap.marker){
            mainMap.map.removeLayer(mainMap.marker);
        }
        const markerIcon = L.icon({
            iconSize: [25, 41],
            iconAnchor: [10, 41],
            popupAnchor: [2, -40],
            // specify the path here
            iconUrl: "imgs/marker-icon.png",
            shadowUrl: "imgs/marker-shadow.png"
        });

        let popupInfo="<b>Seu endereço cadastrado em nossa base da dados.</b><br>"
        +values.street+", "+values.housenumber+"<br>"+values.county+" - "+values.state;

        mainMap.marker=L.marker(
            [location.lat,location.lng],
            {
                draggable: false,
                title: "Seu endereço cadastrado em nossa base da dados.",
                opacity: 1,
                icon: markerIcon
            }
        )
        .addTo(mainMap.map)
        .bindPopup(popupInfo)
        .openPopup();
        mainMap.marker.on('dragend', (ev)=>{
            controlForm.enableSaveBtn();
        });
        var ll = [ mainMap.marker.getLatLng() ];
        var bbox = L.latLngBounds(ll);
        mainMap.map.fitBounds(bbox);
    },

    /** TODO: i need the methods below? */

    // control that shows state info on hover
    addInfoControl:()=>{
        mainMap.info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        mainMap.info.update = function (props) {
            this._div.innerHTML = (props ?
                '<b>' + props + '</b>'
                : 'Selecione um usuário');
            //if(props) detail.setSelectedGeom(props).updatePanel();
        };

        mainMap.info.addTo(mainMap.map);
    },

    getLegendColor:(value)=>{
        /** 
         * Using the length of the color list from the conf file
         * as the number of classes in the legend
         */
        let len = mainMap.legend.colors.length,
        index = parseInt(value*len);
        index = index>=len ? len-1 : index;
        return mainMap.legend.colors[index];
    },

    style:(feature)=>{
        return {
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 1,
            fillColor: mainMap.getLegendColor(feature.properties.indicator)
        };
    },

    highlightFeature:()=>{
        let layer = mainMap.selectedFeature;

        layer.setStyle({
            weight: 3,
            color: '#555',
            dashArray: '',
            fillOpacity: 1
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        mainMap.info.update(layer.feature.properties);
    },

    resetHighlight:(e)=>{
        mainMap.mainLayer.resetStyle(e.target);
        mainMap.info.update();
    },

    resetHighlightAll:()=>{
        mainMap.mainLayer.eachLayer(
            (layer)=>{
                if(layer!=mainMap.selectedFeature) {
                    mainMap.mainLayer.resetStyle(layer);
                }
            }
        );
    },

    zoomToFeature:(e)=>{
        mainMap.map.fitBounds(e.target.getBounds());
    },

    onClick:(e)=>{
        mainMap.selectedFeature=e.target;
        mainMap.highlightFeature();
        mainMap.resetHighlightAll();
    },

    onEachFeature:(feature, layer)=>{
        if(mainMap.selectedFeature && feature.properties.gc==mainMap.selectedFeature.feature.properties.gc){
            setTimeout(()=>{
                mainMap.onClick({target:layer});
            },190);
        }
        layer.on({
            click: mainMap.onClick
        });
    },

    createGeoJson(){
        // https://geojson.org/
        // let geojson={
        //     'type': 'FeatureCollection',
        //     'crs': {
        //       'type': 'name',
        //       'properties': {
        //         'name': 'EPSG:4326',
        //       },
        //     },
        //     'features': [
        //         {
        //             "type": "Feature",
        //             "geometry": {
        //                 "type": "Point",
        //                 "coordinates": [location.lng, location.lat]
        //             },
        //             "properties": values
        //         }
        //     ]
        // };
        //mainMap.createMainLayer(geojson);
    },

    createMainLayer: (data)=>{
        if(mainMap.mainLayer) mainMap.mainLayer.removeFrom(mainMap.map);
        mainMap.mainLayer = L.geoJson(data, {
            style: mainMap.style,
            onEachFeature: mainMap.onEachFeature
        }).addTo(mainMap.map);

        mainMap.map.setView(mainMap.mainLayer.getBounds().getCenter(),mainMap.defaultZoomLevel);
    },

    addAttribution:()=>{
        mainMap.map.attributionControl.addAttribution('POC of TCC &copy; <a href="https://github.com/Practice-of-PUC-course/">PUC</a>');
    },

    addLegend:()=>{
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
                labels = [],
                from, to;

            for (var i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + mainMap.getLegendColor(from + 0.01) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(mainMap.map);
    }
};