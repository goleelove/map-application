import { ɵɵdefineInjectable, ɵsetClassMetadata, Injectable, EventEmitter, ɵɵdirectiveInject, ElementRef, ɵɵdefineComponent, ɵɵlistener, ɵɵresolveWindow, ɵɵNgOnChangesFeature, ɵɵelementStart, ɵɵelement, ɵɵelementEnd, ɵɵadvance, ɵɵclassMapInterpolate1, ɵɵclassMap, ɵɵclassMapInterpolate2, Component, Output, HostListener, ɵɵdefineNgModule, ɵɵdefineInjector, ɵɵsetNgModuleScope, NgModule } from '@angular/core';
import { map, tileLayer, Control, marker, Marker, DivIcon } from 'leaflet';
import 'leaflet-control-geocoder';

class MapLibraryService {
    constructor() {
    }
}
MapLibraryService.ɵfac = function MapLibraryService_Factory(t) { return new (t || MapLibraryService)(); };
MapLibraryService.ɵprov = ɵɵdefineInjectable({ token: MapLibraryService, factory: MapLibraryService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(MapLibraryService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], function () { return []; }, null); })();

var CONST;
(function (CONST) {
    CONST[CONST["ZOOM_MAX"] = 18] = "ZOOM_MAX";
    CONST[CONST["ZOOM_MIN"] = 2] = "ZOOM_MIN";
    CONST[CONST["LAT_MAX"] = 85] = "LAT_MAX";
})(CONST || (CONST = {}));
class MapLibraryComponent {
    constructor(elem) {
        this.elem = elem;
        // input values
        this.mapLat = 45;
        this.mapLng = 5;
        this.mapZoom = 5;
        this.onchange = new EventEmitter();
        this.onselect = new EventEmitter();
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
    ngAfterViewInit() {
        // init map
        this.initMap();
        this.initInput();
        this.setMoveShift();
        // init display input request
        this.setSearch(this.search);
        this.setMarker(this.marker);
        // send init event
        setTimeout(() => {
            this.sendModifications("");
        }, 2000);
    }
    initMap() {
        // init map
        this.map = map("map", {
            attributionControl: false,
            zoomControl: false,
            center: [this.mapLat, this.mapLng],
            zoom: this.mapZoom,
        });
        // display map
        tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(this.map);
        // disable keyboard
        this.map.keyboard.disable();
        // add search box
        this.geocoder = Control.geocoder({
            position: "topleft",
            collapsed: false,
            placeholder: "Recherche...",
            defaultMarkGeocode: true,
        }).addTo(this.map);
    }
    setSearch(search) {
        if (this.search) {
            // load searching
            this.geocoder.setQuery(search)._geocode();
            // search the first element
            setTimeout(() => {
                if (this.geocoder._results && this.geocoder._results.length) {
                    this.geocoder._geocodeResultSelected(this.geocoder._results[0]);
                    this.geocoder._clearResults();
                }
            }, 2000);
        }
    }
    setMarker(marker$1) {
        this.cleanMarkers();
        let i = 0;
        marker$1.forEach(element => {
            if ("lat" in element && "lng" in element) {
                element.id = i;
                if (!element.text) {
                    this.mapMarkers[i] = marker([element.lat, element.lng]);
                }
                else {
                    this.mapMarkers[i] = this.generateIconMarker(element);
                }
                this.mapMarkers[i].addTo(this.map);
                i++;
            }
        });
    }
    // remove all markers to display news
    cleanMarkers() {
        for (let i = 0; i < this.mapMarkers.length; i++) {
            this.map.removeLayer(this.mapMarkers[i]);
        }
    }
    // generate Marker
    generateIconMarker(element) {
        // set html form
        let html = `<div id="marker_${element.id}" style="background: white; border-radius:20px; position:absolute; padding:5px 10px 0 10px; text-align:center;">
              <div style="text-align:center; font-size:1.2em;">${element.text}</div>
              ` + (element.content ? `<span>${element.content}</span>` : ``) +
            (element.img ? `<img style="width:60px" src="${element.img}"/>` : ``) + `
            </div>`;
        // return leaflet marker
        return new Marker([element.lat, element.lng], {
            icon: new DivIcon({
                className: '',
                iconSize: [100, 70],
                iconAnchor: [45, element.img ? 40 : 10],
                html,
            })
        });
    }
    /*************** components attributes events *************/
    ngOnChanges(changes) {
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
    }
    /*************** keyboard event detect and functions *************/
    keyEvent(event) {
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
    }
    handlingNavigation(key) {
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
    }
    handlingMenu(key) {
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
    }
    handlingMap(key) {
        switch (key) {
            case "ArrowUp":
                if (this.moveMode) {
                    if (this.map.getCenter().lat < CONST.LAT_MAX) {
                        this.moveMap(1, 0);
                    }
                }
                else {
                    if (this.mapZoom < CONST.ZOOM_MAX) {
                        this.zoomMap(1);
                        this.moveShift /= 2;
                    }
                }
                break;
            case "ArrowDown":
                if (this.moveMode) {
                    if (this.map.getCenter().lat > -CONST.LAT_MAX) {
                        this.moveMap(-1, 0);
                    }
                }
                else {
                    if (this.mapZoom > CONST.ZOOM_MIN) {
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
    }
    // display move or zoom icon when press
    changeMode() {
        this.moveMode = !this.moveMode;
        if (this.moveMode) {
            this.handleIcon = "move";
            this.handleMenuIcon = "zoom";
        }
        else {
            this.handleIcon = "zoom";
            this.handleMenuIcon = "move";
        }
    }
    sendModifications(key) {
        // calcul map outline by container size and pixel progection
        let mapSize = this.map.getSize();
        let centerPixel = this.map.project([this.mapLat, this.mapLng], this.mapZoom);
        let topLeft = this.map.unproject([centerPixel.x - mapSize.x / 2, centerPixel.y - mapSize.y / 2], this.mapZoom);
        let bottomRight = this.map.unproject([centerPixel.x + mapSize.x / 2, centerPixel.y + mapSize.y / 2], this.mapZoom);
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
    }
    sendSelectEvent(selected) {
        this.onselect.emit(selected);
    }
    /*************** escape app functions *************/
    openMenu() {
        this.displayMenu = "show-menu";
    }
    closeMenu() {
        this.displayMenu = "";
        this.choiseMenu = 1;
    }
    // show escape message
    selectMenu(key) {
        if (key == "Escape") {
            this.closeMenu();
        }
        else {
            //this.validEscape = false;
        }
    }
    /*************** navigate between markers *************/
    setNavigationMode() {
        this.navigate = true;
        this.handleIcon = "navigation";
        this.navigateMarker(0, 0);
        // define menu to move
        this.moveMode = false;
        this.handleMenuIcon = "move";
    }
    navigateMarker(lat, lng) {
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
    }
    findFirstLeftElement() {
        let selected = this.marker[this.navigateId];
        let newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
        this.marker.forEach(element => {
            if (element != selected && element.lng < selected.lng && (element.lng > newSelect.lng || newSelect.lng > selected.lng)) {
                newSelect = element;
            }
        });
        if (newSelect.lng >= selected.lng) {
            let min = this.marker[0];
            this.marker.forEach(element => {
                if (element.lng > min.lng) {
                    min = element;
                }
            });
            this.navigateId = min.id;
        }
        else {
            this.navigateId = newSelect.id;
        }
    }
    findFirstRightElement() {
        let selected = this.marker[this.navigateId];
        let newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
        this.marker.forEach(element => {
            if (element != selected && element.lng > selected.lng && (element.lng < newSelect.lng || newSelect.lng < selected.lng)) {
                newSelect = element;
            }
        });
        if (newSelect.lng <= selected.lng) {
            let min = this.marker[0];
            this.marker.forEach(element => {
                if (element.lng < min.lng) {
                    min = element;
                }
            });
            this.navigateId = min.id;
        }
        else {
            this.navigateId = newSelect.id;
        }
    }
    findFirstBottomElement() {
        let selected = this.marker[this.navigateId];
        let newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
        this.marker.forEach(element => {
            if (element != selected && element.lat < selected.lat && (element.lat > newSelect.lat || newSelect.lat > selected.lat)) {
                newSelect = element;
            }
        });
        if (newSelect.lat >= selected.lat) {
            let min = this.marker[0];
            this.marker.forEach(element => {
                if (element.lat > min.lat) {
                    min = element;
                }
            });
            this.navigateId = min.id;
        }
        else {
            this.navigateId = newSelect.id;
        }
    }
    findFirstTopElement() {
        let selected = this.marker[this.navigateId];
        let newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
        this.marker.forEach(element => {
            if (element != selected && element.lat > selected.lat && (element.lat < newSelect.lat || newSelect.lat < selected.lat)) {
                newSelect = element;
            }
        });
        if (newSelect.lat <= selected.lat) {
            let min = this.marker[0];
            this.marker.forEach(element => {
                if (element.lat < min.lat) {
                    min = element;
                }
            });
            this.navigateId = min.id;
        }
        else {
            this.navigateId = newSelect.id;
        }
    }
    /*************** set position, move and zoom functions *************/
    // set new coordinates and handle zoom 
    setPosition() {
        let coord = this.map.getCenter();
        this.mapLat = coord.lat;
        this.mapLng = coord.lng;
        this.mapZoom = this.map.getZoom();
        // calcul new move size
        this.setMoveShift();
    }
    // calcul new coordinates
    moveMap(lat, lng) {
        this.mapLat += lat * this.moveShift;
        this.mapLng += lng * this.moveShift;
        this.map.setView([this.mapLat, this.mapLng], this.mapZoom);
    }
    // update zoom
    zoomMap(zoom) {
        this.mapZoom += zoom;
        this.map.setZoom(this.mapZoom);
    }
    // alter move padding
    setMoveShift() {
        this.moveShift = 80;
        for (let i = 1; i < this.mapZoom; i++) {
            this.moveShift /= 2;
        }
    }
    /*************** search input functions *************/
    // set input focus or blur
    initInput() {
        // select search input box
        this.searchInput = this.elem.nativeElement.querySelector(".leaflet-control-geocoder-form input");
        this.searchBar = this.elem.nativeElement.querySelector(".leaflet-bar");
        this.setFocusOut();
    }
    setFocus() {
        this.searchBar.style.display = "block";
        this.searchInput.focus();
        this.searchInputFocused = true;
    }
    setFocusOut() {
        this.searchInput.blur();
        this.searchBar.style.display = "none";
        this.searchInputFocused = false;
        this.setPosition();
    }
}
MapLibraryComponent.ɵfac = function MapLibraryComponent_Factory(t) { return new (t || MapLibraryComponent)(ɵɵdirectiveInject(ElementRef)); };
MapLibraryComponent.ɵcmp = ɵɵdefineComponent({ type: MapLibraryComponent, selectors: [["map-library"]], hostBindings: function MapLibraryComponent_HostBindings(rf, ctx) { if (rf & 1) {
        ɵɵlistener("keyup", function MapLibraryComponent_keyup_HostBindingHandler($event) { return ctx.keyEvent($event); }, false, ɵɵresolveWindow);
    } }, inputs: { mapLat: "mapLat", mapLng: "mapLng", mapZoom: "mapZoom", search: "search", marker: "marker" }, outputs: { onchange: "onchange", onselect: "onselect" }, features: [ɵɵNgOnChangesFeature], decls: 9, vars: 19, consts: [[1, "map-container"], ["id", "map"], [1, "menu-container"], [1, "menu-box"]], template: function MapLibraryComponent_Template(rf, ctx) { if (rf & 1) {
        ɵɵelementStart(0, "div", 0);
        ɵɵelement(1, "i");
        ɵɵelement(2, "div", 1);
        ɵɵelementEnd();
        ɵɵelementStart(3, "div", 2);
        ɵɵelementStart(4, "div", 3);
        ɵɵelement(5, "i");
        ɵɵelement(6, "i");
        ɵɵelement(7, "i");
        ɵɵelement(8, "i");
        ɵɵelementEnd();
        ɵɵelementEnd();
    } if (rf & 2) {
        ɵɵadvance(1);
        ɵɵclassMapInterpolate1("icon ", ctx.handleIcon, "");
        ɵɵadvance(2);
        ɵɵclassMap(ctx.displayMenu);
        ɵɵadvance(2);
        ɵɵclassMapInterpolate1("icon search ", ctx.choiseMenu == 0 ? "selected" : "", "");
        ɵɵadvance(1);
        ɵɵclassMapInterpolate2("icon ", ctx.handleMenuIcon, " ", ctx.choiseMenu == 1 ? "selected" : "", "");
        ɵɵadvance(1);
        ɵɵclassMapInterpolate1("icon navigation ", ctx.choiseMenu == 2 ? "selected" : "", "");
        ɵɵadvance(1);
        ɵɵclassMapInterpolate1("icon logout ", ctx.choiseMenu == 3 ? "selected" : "", "");
    } }, styles: [".map-container[_ngcontent-%COMP%]{position:absolute;z-index:1;top:0;left:0;right:0;bottom:0}#map[_ngcontent-%COMP%]{width:100%;height:100%}.map-container[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{position:absolute;z-index:1000;top:10px;right:10px;width:50px;height:50px}.menu-container[_ngcontent-%COMP%]{position:absolute;z-index:1001;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.3);display:none}.menu-box[_ngcontent-%COMP%]{position:absolute;top:calc(50% - 100px);left:calc(50% - 300px);width:600px;height:150px;background-color:#fff;border:1px solid orange!important;text-align:center;margin-top:50px}.menu-box[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{display:inline-block;width:150px;height:150px;border:0;border-radius:3px;background-size:100px 100px;background-repeat:no-repeat;background-position:center}.menu-box[_ngcontent-%COMP%]   .selected[_ngcontent-%COMP%]{background-color:orange}.show-menu[_ngcontent-%COMP%]{display:block}"] });
/*@__PURE__*/ (function () { ɵsetClassMetadata(MapLibraryComponent, [{
        type: Component,
        args: [{
                selector: "map-library",
                inputs: ['mapLat', 'mapLng', 'mapZoom', 'search', 'marker'],
                templateUrl: "./map-library.component.html",
                styleUrls: ["./map-library.component.css",],
            }]
    }], function () { return [{ type: ElementRef }]; }, { onchange: [{
            type: Output
        }], onselect: [{
            type: Output
        }], keyEvent: [{
            type: HostListener,
            args: ["window:keyup", ["$event"]]
        }] }); })();

class MapLibraryModule {
}
MapLibraryModule.ɵmod = ɵɵdefineNgModule({ type: MapLibraryModule });
MapLibraryModule.ɵinj = ɵɵdefineInjector({ factory: function MapLibraryModule_Factory(t) { return new (t || MapLibraryModule)(); }, imports: [[]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(MapLibraryModule, { declarations: [MapLibraryComponent], exports: [MapLibraryComponent] }); })();
/*@__PURE__*/ (function () { ɵsetClassMetadata(MapLibraryModule, [{
        type: NgModule,
        args: [{
                declarations: [MapLibraryComponent],
                imports: [],
                exports: [MapLibraryComponent]
            }]
    }], null, null); })();

/*
 * Public API Surface of map-library
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CONST, MapLibraryComponent, MapLibraryModule, MapLibraryService };
//# sourceMappingURL=map-library.js.map
