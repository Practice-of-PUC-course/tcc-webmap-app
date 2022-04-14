var configUI={
    mainRowOffset:1,// default offset to define height for main row

    /**
     * Apply a percentage of the total height to components in main row where is the map component.
     * @param {double} offset, a percentage value between 0 and 1, default 0.6(60%)
     */
    setMainRowHeight:(offset)=>{
        if(!offset) offset=configUI.mainRowOffset;
        let mainRowHeight=window.innerHeight*offset;
        
        let df=$('.footer').outerHeight();
        let mb=$('.menu-bar').outerHeight();
        let remainHeight=mainRowHeight-mb-df;
        $('#mainmap').height(remainHeight);
    },

    /**
     * 
     * @param {*} msg The string message
     * @param {*} aggregate if message should be aggregate with inner content of alert element
     */
    displayError:(msg, aggregate)=>{
        let text="";
        $('#errors').attr('style','display:'+(msg?'block':'none')+';');
        if(aggregate) {
            let t=(($('#msg-errors').html().trim()!="")?("<br/>"):(""));
            text=$('#msg-errors').html().trim()+t;
        }
        $('#msg-errors').html(text + (msg?msg:'&nbsp;'));
    }
};