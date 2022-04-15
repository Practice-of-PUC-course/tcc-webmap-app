
/**
 * API Results Handler and UI View
 */
 var controlForm={
    userdata:{
        users:[],//list of users
        user:{},//selected user
        usertypes:[],// list of user types
        usertype:{},//selected type for filter
        address:{}
    },

    init:function(conf){
        controlForm.setPanelTitle(conf.panelTitle);
        controlForm.initDisplays();
    },

    initDisplays:function(){
        // only display users of 'associado' type
        usertype.getTypes((types)=>{
            controlForm.userdata.usertypes=types;
            let typeId=null;
            for(let i in types) {
                if(types[i].name=='associado'){
                    typeId=types[i].id;
                    continue;
                }
            }
            user.getUsersByTypeId(typeId,
                (users)=>{
                    controlForm.userdata.users=users;
                    controlForm.displayUserList(users);
                }
            );
        });
    },

    getUserById:function(id){
        return controlForm.userdata.users.find(
            (u)=>{
                if(u.id==id) return u;
            }
        );
    },

    setUserId:function(ev){
        // enable filters
        $('#btn-filters').attr('style','display:inline;');
        let user={
            id:+ev.currentTarget.id,
            name:ev.currentTarget.text,
            description:ev.currentTarget.title
        };
        controlForm.userdata.user=user;// set selected user
        $('.username').val(user.name);
        address.getAddress(user.id, (res)=>{
            if(res && user.id==res.userId){
                let values={
                    street:res.streetName,
                    housenumber:res.houseNumber,
                    county:res.countyName,
                    state:res.stateName,
                    id: res.id
                };
                controlForm.userdata.address=values;
                let ll={lng:res.location.coordinates[0],lat:res.location.coordinates[1]};
                mainMap.addMarker(ll,values);
            }else{
                mainMap.removeMarker();
                controlForm.displayGeneralMessage(controlForm.userdata.user.name+", cadastre seu endereço.");
            }
        });
    },

    setUserTypeId:function(ev){
        let usertype={
            id:+ev.currentTarget.id,
            name:ev.currentTarget.text,
            description:ev.currentTarget.title
        };
        $('.usertypename').val(usertype.name);
        controlForm.userdata.usertype=usertype;
    },

    displayUserList:function(users){
        let dss=$('#useritens');
        users.forEach(
            u => {
                let a=$("<a></a>").text(u.name);
                a.addClass("dropdown-item");
                a.on("click",controlForm.setUserId);
                a.attr("title",u.description);
                a.attr("id",u.id);
                dss.append(a);
            }
        );
    },

    displayUserTypeList:function(){
        let types=controlForm.userdata.usertypes;
        let dss=$('#usertypeitens');
        dss.empty();
        types.forEach(
            ut => {
                if(ut.name!='associado'){
                    let a=$("<a></a>").text(ut.name);
                    a.addClass("dropdown-item");
                    a.on("click",controlForm.setUserTypeId);
                    a.attr("title",ut.description);
                    a.attr("id",ut.id);
                    dss.append(a);
                }
            }
        );
    },

    registerEvents:function(){
        $('#geocode-btn').on('click', function (ev) {
            controlForm.geoLocation();
        });
    },

    setPanelTitle: (panelTitle)=>{
        $('#main-txt-menu-bar').html(panelTitle);//ds.panelTitle
    },

    displayGeneralMessage:function(msg){
        setTimeout(
            ()=>{
                $('#general-info').attr('style','display:none;');
            },3000
        )
        $('#general-info').attr('style','display:inline-flex;');
        
        $('#general-notes').html(msg);
    },

    applySimple:function(){
        mainMap.applySimpleFilter();
    },

    applyAdvanced:function(){
        let proximity_km=$('#proximity_km').val();
        proximity_km=+proximity_km;
        let usertypename=$('.usertypename').val();
        if(proximity_km>0 && usertypename!=''){
            mainMap.applyAdvancedFilter(proximity_km);
        }else{
            controlForm.displayGeneralMessage("Filtros inválidos.");
        }
    },

    openSimpleFilter:function(){
        $('#simple-filter').modal('show');
        $('#countyname').val(controlForm.userdata.address.county);// set on modal filter
    },

    openAdvancedFilter:function(){
        $('#advanced-filter').modal('show');
        controlForm.displayUserTypeList();
    }
};
