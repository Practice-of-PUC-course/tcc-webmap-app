$(document).ready(()=>{
    // set map height.
    configUI.setMainRowHeight();

    dataSourceSelector.init().subscribe(
        (ds)=>{
            let d=dataSourceSelector.getDataSourceById(ds.defaultSelectorId);
            dataSourceSelector.applyDataSourceChange(d);
        },
        (e)=> { console.log('onError: %s', e); },
        ()=> { console.log('onCompleted'); }
    );// datasource loader end
});// window ready end

$(window).on('resize', ()=>{
    // set map height
    configUI.setMainRowHeight();
});