
/**
 * API Results Handler and UI View
 */
 var controlForm={
    userdata:{
        users:[],
        user:{},
        address:{}
    },

    init:function(conf){
        controlForm.setPanelTitle(conf.panelTitle);
        controlForm.initDisplays();
    },

    initDisplays:function(){
        // only display users of 'associado' type
        usertype.getTypes((types)=>{
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
        let user={
            id:+ev.currentTarget.id,
            name:ev.currentTarget.text,
            description:ev.currentTarget.title
        };
        $('.username').val(user.name);
        controlForm.userdata.user=user;
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

    displayUserList:function(users){
        let dss= $('#useritens');
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
    }
};

