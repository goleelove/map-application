(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('leaflet'), require('leaflet-control-geocoder')) :
    typeof define === 'function' && define.amd ? define('map-library', ['exports', '@angular/core', 'leaflet', 'leaflet-control-geocoder'], factory) :
    (global = global || self, factory(global['map-library'] = {}, global.ng.core, global.leaflet));
}(this, (function (exports, core, leaflet) { 'use strict';

    var MapLibraryService = /** @class */ (function () {
        function MapLibraryService() {
        }
        MapLibraryService.ɵfac = function MapLibraryService_Factory(t) { return new (t || MapLibraryService)(); };
        MapLibraryService.ɵprov = core.ɵɵdefineInjectable({ token: MapLibraryService, factory: MapLibraryService.ɵfac, providedIn: 'root' });
        return MapLibraryService;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(MapLibraryService, [{
            type: core.Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], function () { return []; }, null); })();


    (function (CONST) {
        CONST[CONST["ZOOM_MAX"] = 18] = "ZOOM_MAX";
        CONST[CONST["ZOOM_MIN"] = 2] = "ZOOM_MIN";
        CONST[CONST["LAT_MAX"] = 85] = "LAT_MAX";
    })(exports.CONST || (exports.CONST = {}));
    var MapLibraryComponent = /** @class */ (function () {
        function MapLibraryComponent(elem) {
            this.elem = elem;
            // input values
            this.mapLat = 45;
            this.mapLng = 5;
            this.mapZoom = 5;
            this.onchange = new core.EventEmitter();
            this.onselect = new core.EventEmitter();
            this.searchInputFocused = false;
            this.moveMode = true;
            this.handleIcon = "move";
            this.handleMenuIcon = "zoom";
            this.displayMenu = "";
            this.choiseMenu = 1;
            this.navigate = false;
            this.navigateId = 0;
            // display markers
            this.mapMarkers = [];
        }
        MapLibraryComponent.prototype.ngAfterViewInit = function () {
            var _this = this;
            // init map
            this.initMap();
            this.initInput();
            this.setMoveShift();
            // init display input request
            this.setSearch(this.search);
            this.setMarker(this.marker);
            // send init event
            setTimeout(function () {
                _this.sendModifications("");
            }, 2000);
        };
        MapLibraryComponent.prototype.initMap = function () {
            // init map
            this.map = leaflet.map("map", {
                attributionControl: false,
                zoomControl: false,
                center: [this.mapLat, this.mapLng],
                zoom: this.mapZoom,
            });
            // display map
            leaflet.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(this.map);
            // disable keyboard
            this.map.keyboard.disable();
            // add search box
            this.geocoder = leaflet.Control.geocoder({
                position: "topleft",
                collapsed: false,
                placeholder: "Recherche...",
                defaultMarkGeocode: true,
            }).addTo(this.map);
        };
        MapLibraryComponent.prototype.setSearch = function (search) {
            var _this = this;
            if (this.search) {
                // load searching
                this.geocoder.setQuery(search)._geocode();
                // search the first element
                setTimeout(function () {
                    if (_this.geocoder._results && _this.geocoder._results.length) {
                        _this.geocoder._geocodeResultSelected(_this.geocoder._results[0]);
                        _this.geocoder._clearResults();
                    }
                }, 2000);
            }
        };
        MapLibraryComponent.prototype.setMarker = function (marker$1) {
            var _this = this;
            this.cleanMarkers();
            var i = 0;
            marker$1.forEach(function (element) {
                if ("lat" in element && "lng" in element) {
                    element.id = i;
                    if (!element.text) {
                        _this.mapMarkers[i] = leaflet.marker([element.lat, element.lng]);
                    }
                    else {
                        _this.mapMarkers[i] = _this.generateIconMarker(element);
                    }
                    _this.mapMarkers[i].addTo(_this.map);
                    i++;
                }
            });
        };
        // remove all markers to display news
        MapLibraryComponent.prototype.cleanMarkers = function () {
            for (var i = 0; i < this.mapMarkers.length; i++) {
                this.map.removeLayer(this.mapMarkers[i]);
            }
        };
        // generate Marker
        MapLibraryComponent.prototype.generateIconMarker = function (element) {
            // set html form
            var html = "<div id=\"marker_" + element.id + "\" style=\"background: white; border-radius:20px; position:absolute; padding:5px 10px 0 10px; text-align:center;\">\n              <div style=\"text-align:center; font-size:1.2em;\">" + element.text + "</div>\n              " + (element.content ? "<span>" + element.content + "</span>" : "") +
                (element.img ? "<img style=\"width:60px\" src=\"" + element.img + "\"/>" : "") + "\n            </div>";
            // return leaflet marker
            return new leaflet.Marker([element.lat, element.lng], {
                icon: new leaflet.DivIcon({
                    className: '',
                    iconSize: [100, 70],
                    iconAnchor: [45, element.img ? 40 : 10],
                    html: html,
                })
            });
        };
        /*************** components attributes events *************/
        MapLibraryComponent.prototype.ngOnChanges = function (changes) {
            if (this.map) {
                switch (Object.keys(changes)[0]) {
                    case "mapZoom":
                    case "mapLat":
                    case "mapLng":
                        this.map.setView([this.mapLat, this.mapLng], this.mapZoom);
                        this.setMoveShift();
                        break;
                    case "marker":
                        this.setMarker(this.marker);
                        break;
                    case "search":
                        this.setSearch(this.search);
                        break;
                }
            }
        };
        /*************** keyboard event detect and functions *************/
        MapLibraryComponent.prototype.keyEvent = function (event) {
            if (this.displayMenu != "") {
                this.handlingMenu(event.key);
            }
            else if (this.navigate) {
                this.handlingNavigation(event.key);
            }
            else {
                this.handlingMap(event.key);
                // send change to parent application
                this.sendModifications(event.key);
            }
        };
        MapLibraryComponent.prototype.handlingNavigation = function (key) {
            switch (key) {
                case "ArrowUp":
                    this.navigateMarker(1, 0);
                    break;
                case "ArrowDown":
                    this.navigateMarker(-1, 0);
                    break;
                case "ArrowRight":
                    this.navigateMarker(0, 1);
                    break;
                case "ArrowLeft":
                    this.navigateMarker(0, -1);
                    break;
                case "Enter":
                    // send change to parent application
                    if (this.marker[this.navigateId])
                        this.sendSelectEvent(this.marker[this.navigateId]);
                    break;
                case "Escape":
                    this.openMenu();
                    break;
            }
        };
        MapLibraryComponent.prototype.handlingMenu = function (key) {
            switch (key) {
                case "ArrowRight":
                    this.choiseMenu++;
                    if (this.choiseMenu > 3) {
                        this.choiseMenu = 0;
                    }
                    break;
                case "ArrowLeft":
                    this.choiseMenu--;
                    if (this.choiseMenu < 0) {
                        this.choiseMenu = 3;
                    }
                    break;
                case "Enter":
                    // reset navigation mode
                    this.navigate = false;
                    if (this.choiseMenu == 0) {
                        this.setFocus();
                    }
                    else {
                        this.setFocusOut();
                    }
                    if (this.choiseMenu == 1) {
                        this.setMarker(this.marker);
                        this.changeMode();
                    }
                    else if (this.choiseMenu == 2) {
                        this.setNavigationMode();
                    }
                    else if (this.choiseMenu == 3) {
                        alert("exit");
                    }
                    this.closeMenu();
                    break;
                case "Escape":
                    this.closeMenu();
                    break;
            }
        };
        MapLibraryComponent.prototype.handlingMap = function (key) {
            switch (key) {
                case "ArrowUp":
                    if (this.moveMode) {
                        if (this.map.getCenter().lat < exports.CONST.LAT_MAX) {
                            this.moveMap(1, 0);
                        }
                    }
                    else {
                        if (this.mapZoom < exports.CONST.ZOOM_MAX) {
                            this.zoomMap(1);
                            this.moveShift /= 2;
                        }
                    }
                    break;
                case "ArrowDown":
                    if (this.moveMode) {
                        if (this.map.getCenter().lat > -exports.CONST.LAT_MAX) {
                            this.moveMap(-1, 0);
                        }
                    }
                    else {
                        if (this.mapZoom > exports.CONST.ZOOM_MIN) {
                            this.zoomMap(-1);
                            this.moveShift *= 2;
                        }
                    }
                    break;
                case "ArrowRight":
                    if (this.moveMode) {
                        this.moveMap(0, 1);
                    }
                    else {
                    }
                    break;
                case "ArrowLeft":
                    if (this.moveMode) {
                        this.moveMap(0, -1);
                    }
                    else {
                    }
                    break;
                case "Enter":
                    this.changeMode();
                    break;
                case "Escape":
                    this.openMenu();
                    break;
            }
        };
        // display move or zoom icon when press
        MapLibraryComponent.prototype.changeMode = function () {
            this.moveMode = !this.moveMode;
            if (this.moveMode) {
                this.handleIcon = "move";
                this.handleMenuIcon = "zoom";
            }
            else {
                this.handleIcon = "zoom";
                this.handleMenuIcon = "move";
            }
        };
        MapLibraryComponent.prototype.sendModifications = function (key) {
            // calcul map outline by container size and pixel progection
            var mapSize = this.map.getSize();
            var centerPixel = this.map.project([this.mapLat, this.mapLng], this.mapZoom);
            var topLeft = this.map.unproject([centerPixel.x - mapSize.x / 2, centerPixel.y - mapSize.y / 2], this.mapZoom);
            var bottomRight = this.map.unproject([centerPixel.x + mapSize.x / 2, centerPixel.y + mapSize.y / 2], this.mapZoom);
            // send coordinates results
            this.onchange.emit({
                key: key,
                zoom: this.mapZoom,
                lat: this.mapLat,
                lng: this.mapLng,
                view: {
                    top: topLeft.lat,
                    left: topLeft.lng,
                    bottom: bottomRight.lat,
                    right: bottomRight.lng
                }
            });
        };
        MapLibraryComponent.prototype.sendSelectEvent = function (selected) {
            this.onselect.emit(selected);
        };
        /*************** escape app functions *************/
        MapLibraryComponent.prototype.openMenu = function () {
            this.displayMenu = "show-menu";
        };
        MapLibraryComponent.prototype.closeMenu = function () {
            this.displayMenu = "";
            this.choiseMenu = 1;
        };
        // show escape message
        MapLibraryComponent.prototype.selectMenu = function (key) {
            if (key == "Escape") {
                this.closeMenu();
            }
            else {
                //this.validEscape = false;
            }
        };
        /*************** navigate between markers *************/
        MapLibraryComponent.prototype.setNavigationMode = function () {
            this.navigate = true;
            this.handleIcon = "navigation";
            this.navigateMarker(0, 0);
            // define menu to move
            this.moveMode = false;
            this.handleMenuIcon = "move";
        };
        MapLibraryComponent.prototype.navigateMarker = function (lat, lng) {
            if (!this.marker.length) {
                return;
            }
            if (this.marker.length == 1) {
                this.navigateId = 0;
                this.elem.nativeElement.querySelector("#marker_" + this.navigateId).style.background = "orange";
                return;
            }
            if (this.navigateId > this.marker.length) {
                this.navigateId = 0;
            }
            if (lat != 0 || lng != 0) {
                // reset previous
                this.elem.nativeElement.querySelector("#marker_" + this.marker[this.navigateId].id).style.background = "white";
            }
            // display new
            if (lng > 0) {
                this.findFirstRightElement();
            }
            else if (lng < 0) {
                this.findFirstLeftElement();
            }
            else if (lat > 0) {
                this.findFirstTopElement();
            }
            else if (lat < 0) {
                this.findFirstBottomElement();
            }
            else {
                this.navigateId = 0;
            }
            this.elem.nativeElement.querySelector("#marker_" + this.navigateId).style.background = "orange";
        };
        MapLibraryComponent.prototype.findFirstLeftElement = function () {
            var selected = this.marker[this.navigateId];
            var newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
            this.marker.forEach(function (element) {
                if (element != selected && element.lng < selected.lng && (element.lng > newSelect.lng || newSelect.lng > selected.lng)) {
                    newSelect = element;
                }
            });
            if (newSelect.lng >= selected.lng) {
                var min_1 = this.marker[0];
                this.marker.forEach(function (element) {
                    if (element.lng > min_1.lng) {
                        min_1 = element;
                    }
                });
                this.navigateId = min_1.id;
            }
            else {
                this.navigateId = newSelect.id;
            }
        };
        MapLibraryComponent.prototype.findFirstRightElement = function () {
            var selected = this.marker[this.navigateId];
            var newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
            this.marker.forEach(function (element) {
                if (element != selected && element.lng > selected.lng && (element.lng < newSelect.lng || newSelect.lng < selected.lng)) {
                    newSelect = element;
                }
            });
            if (newSelect.lng <= selected.lng) {
                var min_2 = this.marker[0];
                this.marker.forEach(function (element) {
                    if (element.lng < min_2.lng) {
                        min_2 = element;
                    }
                });
                this.navigateId = min_2.id;
            }
            else {
                this.navigateId = newSelect.id;
            }
        };
        MapLibraryComponent.prototype.findFirstBottomElement = function () {
            var selected = this.marker[this.navigateId];
            var newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
            this.marker.forEach(function (element) {
                if (element != selected && element.lat < selected.lat && (element.lat > newSelect.lat || newSelect.lat > selected.lat)) {
                    newSelect = element;
                }
            });
            if (newSelect.lat >= selected.lat) {
                var min_3 = this.marker[0];
                this.marker.forEach(function (element) {
                    if (element.lat > min_3.lat) {
                        min_3 = element;
                    }
                });
                this.navigateId = min_3.id;
            }
            else {
                this.navigateId = newSelect.id;
            }
        };
        MapLibraryComponent.prototype.findFirstTopElement = function () {
            var selected = this.marker[this.navigateId];
            var newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
            this.marker.forEach(function (element) {
                if (element != selected && element.lat > selected.lat && (element.lat < newSelect.lat || newSelect.lat < selected.lat)) {
                    newSelect = element;
                }
            });
            if (newSelect.lat <= selected.lat) {
                var min_4 = this.marker[0];
                this.marker.forEach(function (element) {
                    if (element.lat < min_4.lat) {
                        min_4 = element;
                    }
                });
                this.navigateId = min_4.id;
            }
            else {
                this.navigateId = newSelect.id;
            }
        };
        /*************** set position, move and zoom functions *************/
        // set new coordinates and handle zoom 
        MapLibraryComponent.prototype.setPosition = function () {
            var coord = this.map.getCenter();
            this.mapLat = coord.lat;
            this.mapLng = coord.lng;
            this.mapZoom = this.map.getZoom();
            // calcul new move size
            this.setMoveShift();
        };
        // calcul new coordinates
        MapLibraryComponent.prototype.moveMap = function (lat, lng) {
            this.mapLat += lat * this.moveShift;
            this.mapLng += lng * this.moveShift;
            this.map.setView([this.mapLat, this.mapLng], this.mapZoom);
        };
        // update zoom
        MapLibraryComponent.prototype.zoomMap = function (zoom) {
            this.mapZoom += zoom;
            this.map.setZoom(this.mapZoom);
        };
        // alter move padding
        MapLibraryComponent.prototype.setMoveShift = function () {
            this.moveShift = 80;
            for (var i = 1; i < this.mapZoom; i++) {
                this.moveShift /= 2;
            }
        };
        /*************** search input functions *************/
        // set input focus or blur
        MapLibraryComponent.prototype.initInput = function () {
            // select search input box
            this.searchInput = this.elem.nativeElement.querySelector(".leaflet-control-geocoder-form input");
            this.searchBar = this.elem.nativeElement.querySelector(".leaflet-bar");
            this.setFocusOut();
        };
        MapLibraryComponent.prototype.setFocus = function () {
            this.searchBar.style.display = "block";
            this.searchInput.focus();
            this.searchInputFocused = true;
        };
        MapLibraryComponent.prototype.setFocusOut = function () {
            this.searchInput.blur();
            this.searchBar.style.display = "none";
            this.searchInputFocused = false;
            this.setPosition();
        };
        MapLibraryComponent.ɵfac = function MapLibraryComponent_Factory(t) { return new (t || MapLibraryComponent)(core.ɵɵdirectiveInject(core.ElementRef)); };
        MapLibraryComponent.ɵcmp = core.ɵɵdefineComponent({ type: MapLibraryComponent, selectors: [["map-library"]], hostBindings: function MapLibraryComponent_HostBindings(rf, ctx) { if (rf & 1) {
                core.ɵɵlistener("keyup", function MapLibraryComponent_keyup_HostBindingHandler($event) { return ctx.keyEvent($event); }, false, core.ɵɵresolveWindow);
            } }, inputs: { mapLat: "mapLat", mapLng: "mapLng", mapZoom: "mapZoom", search: "search", marker: "marker" }, outputs: { onchange: "onchange", onselect: "onselect" }, features: [core.ɵɵNgOnChangesFeature], decls: 9, vars: 19, consts: [[1, "map-container"], ["id", "map"], [1, "menu-container"], [1, "menu-box"]], template: function MapLibraryComponent_Template(rf, ctx) { if (rf & 1) {
                core.ɵɵelementStart(0, "div", 0);
                core.ɵɵelement(1, "i");
                core.ɵɵelement(2, "div", 1);
                core.ɵɵelementEnd();
                core.ɵɵelementStart(3, "div", 2);
                core.ɵɵelementStart(4, "div", 3);
                core.ɵɵelement(5, "i");
                core.ɵɵelement(6, "i");
                core.ɵɵelement(7, "i");
                core.ɵɵelement(8, "i");
                core.ɵɵelementEnd();
                core.ɵɵelementEnd();
            } if (rf & 2) {
                core.ɵɵadvance(1);
                core.ɵɵclassMapInterpolate1("icon ", ctx.handleIcon, "");
                core.ɵɵadvance(2);
                core.ɵɵclassMap(ctx.displayMenu);
                core.ɵɵadvance(2);
                core.ɵɵclassMapInterpolate1("icon search ", ctx.choiseMenu == 0 ? "selected" : "", "");
                core.ɵɵadvance(1);
                core.ɵɵclassMapInterpolate2("icon ", ctx.handleMenuIcon, " ", ctx.choiseMenu == 1 ? "selected" : "", "");
                core.ɵɵadvance(1);
                core.ɵɵclassMapInterpolate1("icon navigation ", ctx.choiseMenu == 2 ? "selected" : "", "");
                core.ɵɵadvance(1);
                core.ɵɵclassMapInterpolate1("icon logout ", ctx.choiseMenu == 3 ? "selected" : "", "");
            } }, styles: [".map-container[_ngcontent-%COMP%]{position:absolute;z-index:1;top:0;left:0;right:0;bottom:0}#map[_ngcontent-%COMP%]{width:100%;height:100%}.map-container[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{position:absolute;z-index:1000;top:10px;right:10px;width:50px;height:50px}.menu-container[_ngcontent-%COMP%]{position:absolute;z-index:1001;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.3);display:none}.menu-box[_ngcontent-%COMP%]{position:absolute;top:calc(50% - 100px);left:calc(50% - 300px);width:600px;height:150px;background-color:#fff;border:1px solid orange!important;text-align:center;margin-top:50px}.menu-box[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{display:inline-block;width:150px;height:150px;border:0;border-radius:3px;background-size:100px 100px;background-repeat:no-repeat;background-position:center}.menu-box[_ngcontent-%COMP%]   .selected[_ngcontent-%COMP%]{background-color:orange}.show-menu[_ngcontent-%COMP%]{display:block}"] });
        return MapLibraryComponent;
    }());
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(MapLibraryComponent, [{
            type: core.Component,
            args: [{
                    selector: "map-library",
                    inputs: ['mapLat', 'mapLng', 'mapZoom', 'search', 'marker'],
                    templateUrl: "./map-library.component.html",
                    styleUrls: ["./map-library.component.css",],
                }]
        }], function () { return [{ type: core.ElementRef }]; }, { onchange: [{
                type: core.Output
            }], onselect: [{
                type: core.Output
            }], keyEvent: [{
                type: core.HostListener,
                args: ["window:keyup", ["$event"]]
            }] }); })();

    var MapLibraryModule = /** @class */ (function () {
        function MapLibraryModule() {
        }
        MapLibraryModule.ɵmod = core.ɵɵdefineNgModule({ type: MapLibraryModule });
        MapLibraryModule.ɵinj = core.ɵɵdefineInjector({ factory: function MapLibraryModule_Factory(t) { return new (t || MapLibraryModule)(); }, imports: [[]] });
        return MapLibraryModule;
    }());
    (function () { (typeof ngJitMode === "undefined" || ngJitMode) && core.ɵɵsetNgModuleScope(MapLibraryModule, { declarations: [MapLibraryComponent], exports: [MapLibraryComponent] }); })();
    /*@__PURE__*/ (function () { core.ɵsetClassMetadata(MapLibraryModule, [{
            type: core.NgModule,
            args: [{
                    declarations: [MapLibraryComponent],
                    imports: [],
                    exports: [MapLibraryComponent]
                }]
        }], null, null); })();

    exports.MapLibraryComponent = MapLibraryComponent;
    exports.MapLibraryModule = MapLibraryModule;
    exports.MapLibraryService = MapLibraryService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=map-library.umd.js.map
