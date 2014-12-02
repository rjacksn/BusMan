/// <reference path="statusPage.js" />

/**
 * IM RJ TW
 */
//Test object
//document.getElementById('1')

var google_map; //google.maps.Map

var lat_in = 45.40852242;
var lng_in = -75.64267118;
var city_code = "oc";
var mode = "dynamic";
var zoom_level = 17;
var wait_widow = "wait_window"

//Algonquin
//45.3488346
//-75.7556763

////////////////////////////////////// Button Handler //////////////////////////////////////
//
//		Called when a button on the info window is pushed
//
////////////////////////////////////////////////////////////////////////////////////////////
function buttonHandler(id) {
    switch (id) {
        case 1: //Compiles all selected routes into a query string param opens test page 
            var trips = controller.bus_list.makeTripString();

            //var trips_x = controller.bus_list.makeGenericTripString();
            //?trips_for_stop=7145b86_494";
            var url = "http://geopad.ca/js/get_json_for.php?trips=" + trips;
            statusPage.makeList(url);
            break;
        case 2: //Compiles all selected routes into a query string param opens Legacy Bus Mapper
            var str = controller.bus_list.makeTripString();
            var url = 'http://geopad.ca/js/bus_maper.php?trips=' + str + '&lat=' + controller.peg_marker.Lat() + '&lng=' + controller.peg_marker.Lng();
            document.location = url;
            break;
        case 3: //Draws Routes and Shows incoming Buses for current selection
            controller.showWaitWindow();
            controller.drawBusRoutes();

            document.getElementById("bus_list").className = "hide";
            document.getElementById("map_canvas").className = "show";

            //TODO fix wait_window
            //document.getElementById("wait_window").className = "hide";

            break;
        case 4: //Draws Routes ONLY for current selection

            break;
        default:
            var url = "#";
            break;
    }
}

/////////////////////////////////////////// Click Route ////////////////////////////////////////////
//
//		Called when a Bus Route Selection is made from the Status
//		Gets GPS traking information for selected bus
//
////////////////////////////////////////////////////////////////////////////////////////////////////
function clickBus(stop_code, route_number, headsign_id, index) {
    alert("Get GPS info for stop:" + stop_code + " bus: " + route_number + "-" + headsign_id + " [" + index + "]");
}

/////////////////////////////////////////// Click Route ////////////////////////////////////////////
//
//		Called when a Bus Route Selection is made from the info window
//		Adds and Removes bus route selections from the SurrealRanch_Collections.BusList object
//
////////////////////////////////////////////////////////////////////////////////////////////////////
function clickRoute(route_number, stop_id, stop_code, headsign_id) {
    if (controller.bus_list.Add(route_number, stop_id, stop_code, headsign_id)) {
        document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FF9933';
    }
    else {
        document.getElementById(route_number + '_' + stop_id + '_' + headsign_id).style.backgroundColor = '#FFFFFF';
    }
    if (controller.bus_list.buses.length) {
        var btn1 = document.getElementById('ok1')
        btn1.style.color = 'black';
        btn1.disabled = false;
        if (city_code == 'oc') {
            var btn2 = document.getElementById('ok2')
            btn2.style.color = 'black';
            btn2.disabled = false;
        }
        var btn3 = document.getElementById('ok3')
        btn3.style.color = 'black';
        btn3.disabled = false;
    }
    else {
        var btn1 = document.getElementById('ok1')
        btn1.style.color = 'white';
        btn1.disabled = true;
        if (city_code == 'oc') {
            var btn2 = document.getElementById('ok2')
            btn2.style.color = 'white';
            btn2.disabled = true;
        }
        var btn3 = document.getElementById('ok3')
        btn3.style.color = 'white';
        btn3.disabled = true;
    }
}

/////////////////////////////////// Make Route Table(list) ////////////////////////////////////
//
//		Called when a Stop Marker is clicked
//		Draws the list of Bus Routes for the selected Bus Stop
//
////////////////////////////////////////////////////////////////////////////////////////////////
function makeRouteTable(marker_index) {
    //Clear any previous selection (only allow monitoring from one stop for now)
    controller.bus_list.buses = [];
    controller.stop_list.CloseCurrentInfoWindow();
    var marker = controller.stop_list.getAt(marker_index);
    marker.setInfoWindowContent("");
    //var url = "get_json_bus_list.php?mode=routes&stop_id=" + marker.stop_id + "&city_code=" + city_code;
    var url = "http://geopad.ca/js/get_json_bus_list.php?stop_id=" + marker.stop_id + "&city_code=" + city_code;
    $.get(url, {}, function (obj)//json)
    {
        //$("#json_text").val(json);
        var my_marker = controller.stop_list.getAtCurrent();
        var str = '<div class="header"><input style="color:white" id="ok1" disabled="disabled" type="button" value="Arrivals" onclick="buttonHandler(1)"/>&nbsp;&nbsp;&nbsp;';
        if (city_code == 'oc') {
            str += '<input style="color:white" id="ok2" disabled="disabled" type="button" value="Monitor Selected Buses" onclick="buttonHandler(2)"/><br/>';
        }
        str += '<input style="color:white" id="ok3" disabled="disabled" type="button" value="Draw Selected Bus Routes" onclick="buttonHandler(3)"/><br/>';

        str += '<small><i>Click on the Routes you wish to Monitor</i></small><br/></div>';

        str += '<div class="stop">';
        //var obj = eval('(' + json + ')');
        var routes = obj.routes;
        var button = 'img/stop_button.png';
        for (var i = 0; i < routes.length; i++) {
            var num = routes[i].route_number;
            var trip_headsign = routes[i].trip_headsign;
            var headsign_id = routes[i].headsign_id;
            //TODO Split the number off headsign
            var id = num + '_' + my_marker.stop_id + '_' + headsign_id;
            var click = "javascript:clickRoute('" + num + "','" + my_marker.stop_id + "','" + my_marker.stop_code + "','" + headsign_id + "')";
            str += '<div id="' + id + '" class="button_bar" onclick="' + click + '"><span class="pic_button" ></span><span class="text_button" ><b>' + num + '</b><br/>' + trip_headsign + '</span></div>'
        }
        str += '</div>';

        document.getElementById("status_page").className = "hide";
        document.getElementById("map_canvas").className = "hide";

        //TODO fix wait_window
        document.getElementById("wait_window").className = "hide";

        document.getElementById("bus_list").className = "show";
        document.getElementById("bus_list").innerHTML = str;

       // marker.setInfoWindowContent(str);
        //Minimize the Status Form befor opening InfoWindow
        //if (status_form && status_form.expanded) {
        //    status_form.toggleContent();
        //}
        //marker.OpenInfoWindow();

    }).error(function (e) {
        alert("Ajax Error: " + e.responseText);
    });
}

var IS_QUIK = false;

$(document).ready(function ()
{
    $.support.cors = true;

    alert("Set Breakpoints Now");

    $(document).bind('deviceready', function ()
    {

        //Status page initialization
        statusPage.init("status_page", "status_list", "refresh_btn", "map_btn");
        
        if (IS_QUIK)
        {
            controller = new SurrealRanch_Controller.Controller(lat_in, lng_in, city_code, mode, zoom_level, wait_widow);
            controller.document_width = $(document).width();
            controller.document_height = $(document).height();
            controller.quickInit('map_canvas', 'wait_window');

            var url = "http://geopad.ca/js/get_json_for.php?trips=3017b77_560b94_468b95_112";
            statusPage.makeList(url);
            google.maps.event.addListener(statusPage, 'make_status_done', function (status) {
                controller.hideWaitWindow();
                if (status == "SUCCESS") {
                    //alert(status);
                    controller.hideMap();
                    statusPage.showPage();
                }
                else {
                    alert(status);
                }
            });
        }
        else
        {
            controller = new SurrealRanch_Controller.Controller(lat_in, lng_in, city_code, mode, zoom_level, wait_widow);
            controller.document_width = $(document).width();
            controller.document_height = $(document).height();

            google.maps.event.addListener(controller.peg_marker, 'geolocation_done', function(result)
            {
                google_map = controller.initialize(result, 'map_canvas', 'wait_window');

                status_form = new SurealRanch_Controls.Form(google_map,"shadow", google.maps.ControlPosition.TOP_CENTER, controller.document_height, controller.document_width);

                var status = '<span class="status">Lat: ' + this.lat + ' Long: ' + this.lng + '</span>'
                status_form.setStatus(status);

                google.maps.event.addListener(controller, 'draw_routes_done', function(obj)
                {
                    this.stop_list.CloseCurrentInfoWindow();
                    controller.hideWaitWindow();
                    if(controller.text_mode)
                    {
                        var str = '<textarea style="height:600px; width:200px" >' + obj + '</textarea>';
                        status_form.setContent(str);
                    }
                    else
                    {
                        var str = "";
                        for(var i = 0; i < controller.bus_list.buses.length; i++)
                        {
                            str += controller.bus_list.buses[i].Status();
                        }
                        status_form.setContent(str);
                    }
                });
		
                google.maps.event.addListener(controller, 'draw_routes_error', function(errMsg)
                {
                    controller.hideWaitWindow();
                    alert(errMsg);
                });
		
                google.maps.event.addListener(status_form, 'TabOne_clicked', function(obj)
                {
                    switch(obj.id)
                    {
                        case 'TabOne':
                            controller.text_mode = !controller.text_mode;
                            if(controller.text_mode)
                            {
                                status_form.tab1.innerHTML = "<b>Text Mode</b>";
                            }
                            else
                            {
                                status_form.tab1.innerHTML = "<b>Object Mode</b>";
                            }
                            break;
                        default:
                            alert("The button: " + obj.id + " was clicked");
                            break;
                    }
                });
                google.maps.event.addListener(statusPage, 'make_status_done', function (status) {
                    controller.hideWaitWindow();
                    if (status == "SUCCESS") {
                        //alert(status);
                        controller.hideMap();
                        statusPage.showPage();
                        document.getElementById("bus_list").className = "hide";
                    }
                    else {
                        alert(status);
                    }
                });
            });
        }
    });
});

