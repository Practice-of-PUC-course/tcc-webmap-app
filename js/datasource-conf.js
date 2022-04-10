var dataSourceSelector={
    path: "conf/datasource.json",// configuration path
    observer:null,
    ds:null,// the conf file in memory
    selectedId:null, // selected datasource id

    init:()=>{
        return new rxjs.Observable(
            (observer)=>{
                dataSourceSelector.observer=observer;
                dataSourceSelector.fetchConf();
            },
            ()=>{
                // on error, set .... as default
                console.log("Missing error handler");
            }
        );
    },

    fetchConf(){
        fetch(dataSourceSelector.path)
        .then(
            (response)=>{
                // on sucess
                response.json()
                .then(
                    (ds)=>{
                        if(dataSourceSelector.observer){
                            dataSourceSelector.ds=ds;
                            dataSourceSelector.observer.next(ds);
                        }
                    }
                );
            },
            ()=>{
                // on reject
                console.log("Falhou ao ler o arquivo de configuração de fontes de dados.");
                dataSourceSelector.observer.error("Falhou ao ler o arquivo de configuração de fontes de dados.");
            }
        );
    },

    setPanelTitle: (panelTitle)=>{
        $('#main-txt-menu-bar').html(panelTitle);//ds.panelTitle
    },

    getDataSourceById:(id)=>{
        return dataSourceSelector.ds.dataSet.find(
            (d)=>{
                if(d.selectorId==id) return d;
            }
        );
    },

    applyDataSourceChange:(selectedDataSource)=>{
        dataSourceSelector.setPanelTitle(selectedDataSource.panelTitle);
        mainMap.init(selectedDataSource).subscribe(
            ()=>{
                /**
                 * Creating the main layer and the map
                 */ 
                dataLoader.init(selectedDataSource).then(
                    (d)=>{
                        // set the root node as default on start
                        mainMap.updateMainLayer(d[0][0]);
                    }
                );
            },
            (e)=> { console.log('onError: %s', e); },
            ()=> { console.log('onCompleted'); }
        );
    }
};