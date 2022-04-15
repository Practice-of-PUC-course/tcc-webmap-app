/**
 * Build the map componente based on Leaflet.
 */
var mainMap={
    map:null,// reference to leaflet map component
    geojsonLayer: null,// reference to leaflet layer based on geojson raw data.
    defaultZoomLevel:5,// the zoom level used to reset view map
    info:L.control(),
    legend: null,
    ctrlLayer:null,
    baseLayers:{},
    overLayers:{},
    layerFilter:null,

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
        mainMap.addAttribution();
        mainMap.addCtrlLegend();
    },

    // create and add the OSM layer as base layer (background)
    addBaseLayer:(conf)=>{

        mainMap.baseLayers["OpenStreetMap"]=L.tileLayer( conf.osm_url, {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: ['a','b','c']
        }).addTo( mainMap.map );
        mainMap.baseLayers["OpenStreetMap"].on('add', (ll)=>{
            ll.target.bringToBack();
        });

        mainMap.baseLayers["Mapbox"]=L.tileLayer(conf.mbox_url+'/{id}/tiles/{z}/{x}/{y}?access_token='+conf.mbox_token, {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox/light-v9',
            tileSize: 512,
            zoomOffset: -1
        });

        mainMap.baseLayers["Mapbox"].on('add', (ll)=>{
            ll.target.bringToBack();
        });
    },

    getWMSLegend:(layer)=>{
        if(!layer) layer="brasil:bufferkm";
        let lurl=conf.gs_url+"/wms?REQUEST=GetLegendGraphic&FORMAT=image/png&WIDTH=30&HEIGHT=30&LAYER=";
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

    applySimpleFilter:()=>{
        let userId=controlForm.userdata.user.id;
        let qs="?service=WFS&version=1.0.0&request=GetFeature&typeName=brasil:getmunbyuserid"+
        "&maxFeatures=1&viewparams=userId:"+userId+"&outputFormat=application%2Fjson";

        geo.getGeoJson(qs,
            (geojson)=>{
                mainMap.addGeojsonLayer(geojson);
                mainMap.addLayerByMun();
            }
        );
    },

    applyAdvancedFilter:(proximity_km)=>{
        let userId=controlForm.userdata.user.id;
        let meters=proximity_km*1000;
        let qs="?service=WFS&version=1.0.0&request=GetFeature&typeName=brasil:getcircbyuserid"+
        "&maxFeatures=1&viewparams=userId:"+userId+";meters:"+meters+"&outputFormat=application%2Fjson";

        geo.getGeoJson(qs,
            (geojson)=>{
                mainMap.addGeojsonLayer(geojson);
                mainMap.addLayerByProximity(meters);
            }
        );
    },

    /**
     * // https://geojson.org/
     * @param {*} geojson 
     */
    addGeojsonLayer:(geojson)=>{
        let style={
            fillColor: '#ffffff',
            fillOpacity: 0,
            weight: 2,
            opacity: 0,
            color: '#0000ff'
        };
        if(mainMap.geojsonLayer) mainMap.geojsonLayer.removeFrom(mainMap.map);
        mainMap.geojsonLayer = L.geoJson(geojson, {
            style: style
        }).addTo(mainMap.map);

        var bbox = mainMap.geojsonLayer.getBounds();
        mainMap.map.fitBounds(bbox);
    },

    addLayerByMun:()=>{
        let userId=controlForm.userdata.user.id;
        let vp='userId:'+userId+';typeId1:2;typeId2:3';
        mainMap.addWMSFilteredLayer('brasil:bymun',vp);
    },

    addLayerByProximity:(meters)=>{
        let typeId=controlForm.userdata.usertype.id;
        let userId=controlForm.userdata.user.id;
        let vp='userId:'+userId+';typeId:'+typeId+';meters:'+meters;
        mainMap.addWMSFilteredLayer('brasil:bufferkm',vp);
    },

    addWMSFilteredLayer:(layerName, viewparams)=>{
        // remove previous
        if(mainMap.layerFilter) mainMap.layerFilter.removeFrom(mainMap.map);

        let ly=L.tileLayer.wms(conf.gs_url+"/wms", {
            layers: layerName,
            viewparams: viewparams,
            format: 'image/png',
            transparent: true,
            tiled: true,
            zIndex: 200,
            attribution: 'POC/TCC'
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
        ly.addTo(mainMap.map);
        ly.bringToFront();
        mainMap.layerFilter=ly;
    },

    // create the overlay layers as WMS layer
    addWMSLayers:(conf)=>{
        let ZIndex=100,
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