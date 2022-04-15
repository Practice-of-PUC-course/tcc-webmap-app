var api={
    call:function(baseUrl,fn,method,data,cache){
        if(!method) method='GET';
        if(!data) data={};
        if(!cache) cache={cache: true};
        $.ajax( {url: baseUrl,type: method, data} )
            .done(function(response) {
                fn(response);
            })
            .fail(function(reason) {
                fn(false);
                console.error(JSON.stringify(reason));
            })
            .always(function() {
                console.log( "complete" );
            });
    }
};

var address={
    path: conf.registry_api+"/address",

    getAddress:function(userid,fn){
        api.call(this.path+"/"+userid,fn);
    },

    saveAddress:function(qs,isAdd,fn){
        if(isAdd)
            api.call(this.path+"/"+qs,fn,'POST');
        else
            api.call(this.path+"/"+qs,fn,'PUT');// addressid is needed!
    }

};

var user={
    path: conf.registry_api+"/user",

    getUsers:function(fn){
        api.call(this.path,fn);
    },

    getUsersByTypeId:function(id,fn){
        api.call(this.path+"/type/"+id,fn);
    },

    getUserById:function(id,fn){
        api.call(this.path+"/"+id,fn);
    }
};

var usertype={
    path: conf.registry_api+"/usertype",

    getTypes:function(fn){
        api.call(this.path,fn);
    },

    getTypeById:function(id,fn){
        api.call(this.path+"/"+id,fn);
    }
};

var geo={
    path: conf.gs_url+"/wms",

    getGeoJson:function(params,fn){
        api.call(this.path+params,fn);
    }
};