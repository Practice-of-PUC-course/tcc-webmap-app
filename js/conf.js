var conf={
    "shortName":"POC",
    "panelTitle":"Prova de conceito - PUC/2022",
    "osm_url": "https://api.mapbox.com/styles/v1",
    "osm_token": "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    "registry_api":"http://localhost/registry/v1",
    "gs_url":"http://localhost/geoserver",
    "gs_bbox":{
        "northEast":{"lng": -28.64, "lat": 5.47},
        "southWest":{"lng": -74.10, "lat": -33.9}
    },
    "gs_layers": [
        {
            "workspace":"brasil",
            "name":"municipios",
            "label":"Municípios"
        },
        {
            "workspace":"brasil",
            "name":"uf",
            "label":"Estados"
        },
        {
            "workspace":"brasil",
            "name":"allusers",
            "label":"Todos os Usuários"
        }
    ]
};