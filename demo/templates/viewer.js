<%
from json import dumps
%>
Ext.onReady(function() {
    /*
     * Initialize the application.
     */
    // OpenLayers
    OpenLayers.Number.thousandsSeparator = ' ';
    OpenLayers.DOTS_PER_INCH = 72;
    OpenLayers.ProxyHost = "${request.route_url('ogcproxy')}?url=";

    // Ext
    Ext.QuickTips.init();

    OpenLayers.ImgPath = "${request.static_url('demo:static/lib/cgxp/core/src/theme/img/ol/')}";
    Ext.BLANK_IMAGE_URL = "${request.static_url('demo:static/lib/cgxp/ext/Ext/resources/images/default/s.gif')}";

    // Apply same language than on the server side
    OpenLayers.Lang.setCode("${lang}");
    GeoExt.Lang.set("${lang}");

    // Server errors (if any)
    var serverError = ${serverError | n};

    // Themes definitions
    var THEMES = {
        "local": ${themes | n}
% if external_themes:
        , "external": ${external_themes | n}
% endif
    };

    <% bounds = user.role.bounds if user else None %>
% if bounds:
    var INITIAL_EXTENT = ${dumps(bounds)};
% else:
    var INITIAL_EXTENT = [529000, 147000, 555000, 161000];
% endif
    var MAX_EXTENT = [420000, 30000, 900000, 350000];
    var RESTRICTED_EXTENT = [420000, 40500, 839000, 306400];

    // Used to transmit event throw the application
    var EVENTS = new Ext.util.Observable();

    var WMTSASITVD_OPTIONS2 = {
        url: "http://ows.asitvd.ch/wmts/",
        attribution: "© <a href='http://asitvd.ch'>ASIT VD</a>, Contributeurs d’<a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
        displayInLayerSwitcher: false,
        requestEncoding: 'REST',
        buffer: 0,
        style: 'default',
        dimensions: ['DIM1','ELEVATION'],
        params: {
            'dim1': 'default',
            'elevation': '0'
        },
        matrixSet: "21781",
        maxExtent: MAX_EXTENT,
        projection: new OpenLayers.Projection("EPSG:21781"),
        units: "m",
        format: "image/png",
        formatSuffix: 'png',
        opacity: 1,
        visibility: true,
        serverResolutions: [4000.0,3750.0,3500.0,3250.0,3000.0,2750.0,2500.0,2250.0,2000.0,1750.0,1500.0,1250.0,1000.0,750.0,650.0,500.0,250.0,100.0,50.0,20.0,10.0,5.0,2.5,2.0,1.5,1.0,0.5,0.25,0.1,0.05]
    };

    app = new gxp.Viewer({
        portalConfig: {
            ctCls: 'x-map',
            layout: "border",
            // by configuring items here, we don't need to configure portalItems
            // and save a wrapping container
            items: [{
                region: "north",
                contentEl: 'header-out'
            },
            {
                region: 'center',
                layout: 'border',
                id: 'center',
                tbar: [],
                bbar: [],
                items: [
                    "app-map"
                ]
            },
            {
                id: "featuregrid-container",
                xtype: "panel",
                layout: "fit",
                region: "south",
                height: 160,
                split: true,
                collapseMode: "mini",
                stateful: false,
                hidden: true,
                bodyStyle: 'background-color: transparent;'
            },
            {
                layout: "accordion",
                id: "left-panel",
                region: "west",
                width: 300,
                minWidth: 300,
                split: true,
                collapseMode: "mini",
                stateful: false,
                border: false,
                defaults: {width: 300},
                items: [{
                    xtype: "panel",
                    title: OpenLayers.i18n("layertree"),
                    id: 'layerpanel',
                    layout: "vbox",
                    bbar: [],
                    layoutConfig: {
                        align: "stretch"
                    }
                }]
            }]
        },

        // configuration of all tool plugins for this application
        tools: [
        {
            ptype: "cgxp_disclaimer",
            outputTarget: "map"
        },
        {
            ptype: "cgxp_themeselector",
            outputTarget: "layerpanel",
            layerTreeId: "layertree",
            themes: THEMES,
            outputConfig: {
                layout: "fit",
                style: "padding: 3px 0 3px 3px;"
            }
        },
        {
            ptype: "cgxp_themefinder",
            outputTarget: "layerpanel",
            layerTreeId: "layertree",
            themes: THEMES,
            outputConfig: {
                layout: "fit",
                style: "padding: 3px;"
            }
        },
        {
            ptype: "cgxp_layertree",
            id: "layertree",
            events: EVENTS,
            showRestrictedContentWarning: true,
            outputConfig: {
                header: false,
                flex: 1,
                layout: "fit",
                autoScroll: true,
                themes: THEMES,
% if permalink_themes:
                permalinkThemes: ${permalink_themes | n},
% endif
                defaultThemes: ["Transport"],
                uniqueTheme: true,
                wmsURL: "${request.route_url('mapserverproxy')}"
            },
            outputTarget: "layerpanel"
        },
% if user:
        {
            ptype: "cgxp_querier",
            outputTarget: "left-panel",
            events: EVENTS,
            mapserverproxyURL: "${request.route_url('mapserverproxy')}",
            // don't work with actual version of mapserver, the proxy will limit to 200
            // it is intended to be reactivated this once mapserver is fixed
            //maxFeatures: 200,
            srsName: 'EPSG:21781',
            featureTypes: ["hospitals", "firestations"],
            attributeURLs: ${queryer_attribute_urls | n}
        },
% endif
% if 'grid' in request.params:
        {
            ptype: "cgxp_featuresgrid",
            id: "featuresGrid",
            csvURL: "${request.route_url('csvecho')}",
            maxFeatures: 200,
            outputTarget: "featuregrid-container",
            events: EVENTS,
            csvIncludeHeader: true,
            globalSelection: true
        },
% else:
        {
            ptype: "cgxp_featureswindow",
            themes: THEMES,
            events: EVENTS,
            id: "featuresWindow"
        },
% endif
        {
            ptype: "cgxp_mapopacityslider",
            layerTreeId: "layertree",
            defaultBaseLayerRef: "${functionality['default_basemap'][0] | n}",
            orthoRef: undefined
        },
        {
            ptype: "gxp_zoomtoextent",
            actionTarget: "center.tbar",
            closest: true,
            extent: INITIAL_EXTENT
        },
        {
            ptype: "cgxp_getfeature",
            mapserverURL: "${request.route_url('mapserverproxy')}",
            actionTarget: null, //"center.tbar",
            events: EVENTS,
            themes: THEMES,
            actionTooltip: OpenLayers.i18n('Query the map'),
            WFSTypes: ${WFSTypes | n},
            externalWFSTypes: ${externalWFSTypes | n},
            enableWMTSLayers: true,
            toggleGroup: "maptools"
        },
        {
            ptype: "cgxp_contextualdata",
            url: "${request.route_url('raster', path='')}",
            actionTarget: "center.tbar",
            toggleGroup: "maptools",
            streetViewLink: true,
            mouseoverWindowConfig: {
                width: 270
            },
            rightclickWindowConfig: {
                width: 270
            },
            tpls: {
                allTpl:
                    "Swiss grid (LV03): {coord_x} {coord_y}<br />" +
                    OpenLayers.i18n("Wgs Coord. Label") + ": {wgs_x} {wgs_y}<br />" +
                    "Elevation (SRTM): {srtm_value} [m]<br />" +
                    "Elevation (Aster): {aster_value} [m]<br />" +
                    "<a href='http://maps.google.ch/?ie=UTF8&ll={streetviewlat},{streetviewlon}&layer=c" +
                    "&cbll={streetviewlat},{streetviewlon}&cbp=12,57.78,,0,8.1' " +
                    "target='_blank'>{streetviewlabel}</a>"
            }
        },
        {
            ptype: "cgxp_fulltextsearch",
            url: "${request.route_url('fulltextsearch')}",
            layerTreeId: "layertree",
            pointRecenterZoom: 20,
            actionTarget: "center.tbar",
            grouping: true,
            useColorPicker: true,
        },
        {
            ptype: "cgxp_locationchooser",
            toggleGroup: "maptools",
            actionTarget: "center.tbar",
            locations: {
                'User initial': INITIAL_EXTENT,
                'Lausanne': [535436, 155243, 539476, 150443],
                'Pully': [539606, 152493, 541106, 150443],
                'Vevey': [551755, 149340, 555995, 145060]
            }
        },
        {
            ptype: "cgxp_myposition",
            actionTarget: "center.tbar",
            recenteringZoom: 16,
            drawAccuracy: true,
        },
        {
            ptype: "cgxp_menushortcut",
            actionTarget: "center.tbar",
            type: '->'
        },
        {
            ptype: "cgxp_print",
            toggleGroup: "maptools",
            legendPanelId: "legendPanel",
% if 'grid' in request.params:
            featureProvider: "featuresGrid",
% else:
            featureProvider: "featuresWindow",
% endif
            actionTarget: "center.tbar",
            printURL: "${request.route_url('printproxy')}",
            mapserverURL: "${request.route_url('mapserverproxy')}",
            printProviderConfig: ${dumps(url_role_params) | n},
            options: {
                labelAlign: 'top',
                defaults: {
                    anchor:'100%'
                },
                autoFit: true,
                fieldsExtraClientConfiguration: {
                    "A4 portrait": {
                        "title": {
                            fieldAttributes: {
                                fieldLabel: OpenLayers.i18n("Title"),
                                emptyText: OpenLayers.i18n("Title")
                            }
                        },
                        "comments": {
                            useTextArea: true,
                            fieldAttributes: {
                                fieldLabel: OpenLayers.i18n("Description"),
                                emptyText: OpenLayers.i18n("Description")
                            }
                        },
                        "debug": {
                            fieldAttributes: {
                                fieldLabel: OpenLayers.i18n("Add debug header"),
                                value: 0
                            }
                        }
                    }
                }
            },
            version: 3,
            encodeLayer: {},
            encodeExternalLayer: {},
            additionalAttributes: []
        },
        {
            ptype: "cgxp_permalink",
            id: "permalink",
            actionTarget: "center.tbar",
            shortenerCreateURL: "${request.route_url('shortener_create')}",
            actionConfig: {
                text: OpenLayers.i18n("Link")
            }
        },
        {
            ptype: "cgxp_menushortcut",
            actionTarget: "center.tbar",
            type: '-'
        },
        {
            ptype: "cgxp_measure",
            actionTarget: "center.tbar",
            toggleGroup: "maptools",
            actionConfig: {
                text: OpenLayers.i18n("Measure")
            },
            minAzimuth: 0
        },
        {
            ptype: 'cgxp_profile',
            actionTarget: 'center.tbar',
            toggleGroup: 'maptools',
            serviceUrl: "${request.route_url('profile.json')}",
            csvServiceUrl: "${request.route_url('profile.csv')}",
            rasterLayers: ['srtm', 'aster'],
            actionConfig: {
                text: OpenLayers.i18n("Profile")
            }
        },
        {
            ptype: "cgxp_menushortcut",
            actionTarget: "center.tbar",
            type: '-'
        },
        {
            ptype: "cgxp_redlining",
            toggleGroup: "maptools",
            actionTarget: "center.tbar",
            redliningText: OpenLayers.i18n('Dessin'),
            layerManagerUrl: "${request.static_url('demo:static/lib/cgxp/sandbox/LayerManager/ux/')}",
            actionConfig: {
                iconCls: 'cgxp-icon-redline',
                tooltip: OpenLayers.i18n("Draw geometries on the map")
            }
        },
        {
            ptype: "cgxp_legend",
            id: "legendPanel",
            toggleGroup: "maptools",
            actionTarget: "center.tbar",
            actionConfig: {
                iconCls: 'cgxp-icon-legend'
            }
        },
        {
            ptype: "cgxp_menushortcut",
            actionTarget: "center.tbar",
            type: '-'
        },
        {
            ptype: "cgxp_login",
            actionTarget: "center.tbar",
            toggleGroup: "maptools",
            events: EVENTS,
% if user:
            username: "${user.username}",
            isPasswordChanged: ${"true" if user.is_password_changed else "false"},
% endif
            events: EVENTS,
            loginURL: "${request.route_url('login')}",
            loginChangeURL: "${request.route_url('loginchange')}",
            logoutURL: "${request.route_url('logout')}",
            enablePasswordChange: true,
            forcePasswordChange: true,
            permalinkId: "permalink"
        },


        {
             ptype: 'cgxp_wmsbrowser',
             actionTarget: "layerpanel.bbar",
             layerTreeId: "layertree",
             actionConfig: {
                tooltip: OpenLayers.i18n('Add a WMS layer on the map')
             },
             defaultUrls: [
                'http://wms.geo.admin.ch',
                'http://ids.pigma.org/geoserver/wms',
                'http://geobretagne.fr/geoserver/wms'
             ]
        },
        {
            ptype: "cgxp_addkmlfile",
            echoUrl: "${request.route_url('echo')}",
            actionTarget: "layerpanel.bbar"
        },

        {
            ptype: "cgxp_scalechooser",
            actionTarget: "center.bbar",
            roundValues: [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10],
            power10: true
        },
        {
            ptype: "cgxp_menushortcut",
            actionTarget: "center.bbar",
            type: '->'
        },
        {
            ptype: "gxp_tool",
            actionTarget: "center.bbar",
            actions: '<a href="mailto:info+demo@camptocamp.com">Contact</a> - Développé par <a href="http://www.camptocamp.com" target="_blank" title="Camptocamp: inovative solutions by open source expert!">Camptocamp</a> - <a target="_blank" href="http://geomapfish.org/">GeoMapFish</a>.'
        }
        ],

        // layer sources
        sources: {
            "olsource": {
                ptype: "gxp_olsource"
            }
        },

        // map and layers
        map: {
            id: "app-map", // id needed to reference map in portalConfig above
            xtype: 'cgxp_mappanel',
            projectionCodes: [21781, 2056, 4326],
            extent: INITIAL_EXTENT,
            maxExtent: MAX_EXTENT,
            restrictedExtent: RESTRICTED_EXTENT,
            stateId: "map",
            projection: new OpenLayers.Projection("EPSG:21781"),
            units: "m",
            resolutions: [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25, 0.1, 0.05],
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.KeyboardDefaults(),
                new OpenLayers.Control.PanZoomBar({
                    panIcons: false,
                    zoomWorldIcon: true
                }),
                new OpenLayers.Control.ArgParser(),
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.ScaleLine({
                    geodesic: true,
                    bottomInUnits: false,
                    bottomOutUnits: false
                }),
                new OpenLayers.Control.MousePosition({numDigits: 0}),
                // OSM version
                new OpenLayers.Control.OverviewMap({
                    size: new OpenLayers.Size(200, 100),
                    mapOptions: {
                        theme: null
                    },
                    minRatio: 64,
                    maxRatio: 64,
                    layers: [new OpenLayers.Layer.OSM("OSM", [
                           'http://otile1.mqcdn.com/tiles/1.0.0/osm/${"${z}/${x}/${y}"}.png',
                           'http://otile2.mqcdn.com/tiles/1.0.0/osm/${"${z}/${x}/${y}"}.png',
                           'http://otile3.mqcdn.com/tiles/1.0.0/osm/${"${z}/${x}/${y}"}.png'
                        ], {
                            transitionEffect: 'resize',
                            attribution: [
                                'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>',
                                ' <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
                            ].join(' ')
                        }
                    )]
                })
            ],
            layers: [{
                source: "olsource",
                type: "OpenLayers.Layer.WMTS",
                group: 'background',
                args: [Ext.applyIf({
                    name: OpenLayers.i18n('asitvd.fond_couleur'),
                    ref: 'asitvd.fond_couleur',
                    layer: 'asitvd.fond_couleur',
                    queryLayers: [],
                    transitionEffect: "resize",
                    group: 'background',
                    visibility: false
                }, WMTSASITVD_OPTIONS2)]
            },
            {
                source: "olsource",
                type: "OpenLayers.Layer.WMTS",
                group: 'background',
                args: [Ext.applyIf({
                    name: OpenLayers.i18n('asitvd.fond_gris'),
                    ref: 'asitvd.fond_gris',
                    layer: 'asitvd.fond_gris',
                    queryLayers: [],
                    transitionEffect: "resize",
                    group: 'background',
                    visibility: false
                }, WMTSASITVD_OPTIONS2)]
            },
            {
                source: "olsource",
                type: "OpenLayers.Layer",
                group: 'background',
                args: [OpenLayers.i18n('blank'), {
                    displayInLayerSwitcher: false,
                    ref: 'blank',
                    group: 'background',
                    opacity: 0
                }]
            }],
            items: []
        }
    });

    app.on('ready', function() {
        // remove loading message
        Ext.get('loading').remove();
        Ext.fly('loading-mask').fadeOut({
            remove: true
        });

        if (serverError.length > 0) {
            cgxp.tools.openWindow({
                html: serverError.join('<br />')
            }, OpenLayers.i18n("Error notice"), 600, 500);
        }
    }, app);
});
