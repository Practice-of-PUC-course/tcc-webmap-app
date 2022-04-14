$(document).ready(()=>{
    // set map height.
    configUI.setMainRowHeight();
    controlForm.init(conf);
    mainMap.init(conf);
});// window ready end

$(window).on('resize', ()=>{
    // set map height
    configUI.setMainRowHeight();
});