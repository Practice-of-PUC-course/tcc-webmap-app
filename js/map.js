/**
 * Build the map componente based on Leaflet.
 */
var mainMap={
    map:null,// reference to leaflet map component
    mainLayer: null,// reference to main leaflet layer based on geojson raw data.
    defaultZoomLevel:5,// the zoom level used to reset view map
    info:L.control(),
    legend: null,
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
        mainMap.addCtrlLegend();
    },

    // create and add the OSM layer as base layer (background)
    addBaseLayer:(conf)=>{

        mainMap.baseLayers["OpenStreetMap"]=L.tileLayer( conf.osm_url, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: ['a','b','c']
        }).addTo( mainMap.map );

        mainMap.baseLayers["Mapbox"]=L.tileLayer(conf.mbox_url+'/{id}/tiles/{z}/{x}/{y}?access_token='+conf.mbox_token, {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/light-v9',
            tileSize: 512,
            zoomOffset: -1
        });
    },

    getWMSLegend:(layer)=>{
        if(!layer) layer="brasil:bufferkm";
        let lurl=conf.gs_url+"/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=";
        lurl=lurl+layer;
        return lurl;
    },

    addCtrlLegend:()=>{
        if(mainMap.legend){
            mainMap.map.remove(mainMap.legend);
        }
        let legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', '');
            return div;
        };

        legend.update = function(layer){
            if(!layer) this._container.innerHTML = '';
            else{
                let img = '<img src="'+mainMap.getWMSLegend(layer)+'">';
                this._container.innerHTML = img;
            }
        };

        legend.addTo(mainMap.map);
        mainMap.legend=legend;
    },

    addControlLayers:()=>{
        let baseLayers=mainMap.baseLayers;
        let overlays=mainMap.overLayers;
        mainMap.ctrlLayer=L.control.layers(baseLayers, overlays).addTo(mainMap.map);
    },

    // create the overlay layers as WMS layer
    addWMSLayers:(conf)=>{
        let ZIndex=1,
        gs_layers=conf.gs_layers;
        for(let i in gs_layers) {
            
            let ly=L.tileLayer.wms(conf.gs_url+"/wms", {
                layers: gs_layers[i].workspace + ':' + gs_layers[i].name,
                format: 'image/png',
                transparent: true,
                tiled: true,
                zIndex: ZIndex,
                attribution: 'IBGE'
            });
            ly.on('add',
                (l)=>{
                    mainMap.legend.update(l.target.wmsParams.layers);
                }
            );
            ly.on('remove',
                (l)=>{
                    mainMap.legend.update();
                }
            );
            mainMap.overLayers[gs_layers[i].label]=ly;
            
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

    addAttribution:()=>{
        mainMap.map.attributionControl.addAttribution('POC of TCC &copy; <a href="https://github.com/Practice-of-PUC-course/">PUC</a>');
    }
};