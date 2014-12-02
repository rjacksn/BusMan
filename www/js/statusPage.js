var statusPage = {
    status_page: null,
    status_list: null,
    _url: null,
    errMsg: null,
    init: function (status_page_id, status_list_id, refresh_btn_id, map_btn_id)
    {
        this.status_page = document.getElementById(status_page_id);
        this.status_list = document.getElementById(status_list_id);
        document.getElementById(refresh_btn_id).addEventListener('click', this.onRefresh.bind(this), false);
        document.getElementById(map_btn_id).addEventListener('click', this.onShowMap.bind(this), false);
    },
    //Button clicks
    onRefresh: function()
    {
        this.updateList();
    },
    onShowMap: function()
    {
        controller.showMap();
        this.hidePage();
    },
    updateList: function()
    {
        var count = 0;
        console.log("url:" + this._url);
        $.get(this._url, {}, function (json)
        {
            statusPage.status_list.innerHTML = "";
            var html = '<ul id="bus_info_list">';
            console.log(JSON.stringify(json));
            //statusPage.status_list.innerHTML = json;
            var stops = json.stops;
            for (var i = 0; i < stops.length; i++) {
                var stop = stops[i];
                html += "<li>stop_no:" + stop.stop_no + "</li>";
                html += "<li>stop_name:" + stop.stop_name + "</li>";
                var routes = stop.routes;
                for (var j = 0; j < routes.length; j++) {
                    var route = routes[j];
                    html += "<li>route_no:" + route.route_no + "</li>";
                    var trips = route.trips;
                    if (trips.length == 0) {
                        html += "<li>This route is not running at this time.</li>";
                        count++;
                    }
                    else {
                        for (var k = 0; k < trips.length; k++) {
                            count++;
                            var trip = trips[k];
                            html += "<li>Direction:" + trip.Direction + "</li>";
                            html += "<li>RouteLabel:" + trip.RouteLabel + "</li>";
                            var tripsForStop = trip.tripsForStop;
                            if (tripsForStop.length == 0) {
                                html += "<li>There are no scheduled buses at this time.</li>";
                            }
                            else {
                                for (var l = 0; l < tripsForStop.length; l++) {
                                    var tripForStop = tripsForStop[l];
                                    var now = new Date();
                                    var arrivalTime;
                                    if (tripForStop.AdjustmentAge > 0) {
                                        var eta = tripForStop.AdjustedScheduleTime - tripForStop.AdjustmentAge;
                                        var arrival = new Date(now.getTime() + eta * 60000);
                                        arrivalTime = arrival.toLocaleTimeString();
                                    }
                                    else {
                                        var arrival = new Date(now.getTime() + tripForStop.AdjustedScheduleTime * 60000);
                                        arrivalTime = arrival.toLocaleTimeString();
                                    }
                                    html += "<li>Arriving at: " + arrivalTime + "</li>";
                                }
                            }
                        }
                    }

                }
            }
            html += "</ul>";
            statusPage.status_list.innerHTML = html;
            google.maps.event.trigger(statusPage, "make_status_done", "SUCCESS");

        }).error(function (e) {
            this.errMsg = "Ajax Error: " + e.statusText;
            google.maps.event.trigger(statusPage, "make_status_done", this.errMsg);
        });
    },
    makeList: function (url)
    {
        this._url = url;
        this.updateList();
    },
    showPage: function()
    {
        this.status_page.className = "show";
    },
    hidePage: function()
    {
        this.status_page.className = "hide";
    }
};

