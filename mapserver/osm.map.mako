## -*- coding: utf-8 -*-

<%!
layers = [{
    'type': 'fluel',
    'name': u'Essence'
}, {
    'type': 'hotel',
    'name': u'Hôtel'
}, {
    'type': 'information',
    'name': u'Information'
}, {
    'type': 'cinema',
    'name': u'Cinema'
}, {
    'type': 'alpin_hut',
    'name': u'Cabane'
}, {
    'type': 'bank',
    'name': u'Banque'
}, {
    'type': 'bus_stop',
    'name': u'Arrêt de bus'
}, {
    'type': 'cafe',
    'name': u'Café'
}, {
    'type': 'parking',
    'name': u'Parking'
}, {
    'type': 'place_of_worship',
    'name': u'Eglise'
}, {
    'type': 'police',
    'name': u'Police'
}, {
    'type': 'post_office',
    'name': u'Poste'
}, {
    'type': 'restaurant',
    'name': u'Restaurent'
}, {
    'type': 'zoo',
    'name': u'Zoo'
}]
%>
% for layer in layers:
LAYER
    NAME "${layer['type']}"
    GROUP "osm"
    TYPE POINT
    STATUS ON
    TEMPLATE fooOnlyForWMSGetFeatureInfo # For GetFeatureInfo
    DATA "osm_switzerland/points"
    FILTER ('[type]' = '${layer['type']}')
    PROJECTION
      "init=epsg:4326"
    END
    CLASS
        NAME "${layer['name']}"
        STYLE
            SYMBOL "circle"
            SIZE 6
            WIDTH 1
            OUTLINECOLOR 30 0 0
            COLOR 230 0 0
        END
    END

    METADATA
        "wms_title" "${layer['name']}"

        "gml_include_items" "all"
        "gml_types" "auto"
        "gml_featureid" "osm_id"
        "gml_THE_GEOM_type" "point"
        "gml_geometries" "THE_GEOM"
    END
END
% endfor

LAYER
    NAME "osm_time"
    TYPE POINT
    STATUS ON
    TEMPLATE fooOnlyForWMSGetFeatureInfo # For GetFeatureInfo
    DATA "osm_switzerland/points"
    PROJECTION
      "init=epsg:4326"
    END
    CLASS
        NAME "osm_time"
        STYLE
            SYMBOL "circle"
            SIZE 6
            WIDTH 1
            OUTLINECOLOR 30 0 0
            COLOR 230 0 0
        END
    END

    METADATA
        "wms_title" "OSM Time"

        "gml_include_items" "all"
        "gml_types" "auto"
        "gml_featureid" "osm_id"
        "gml_POINT_type" "point"
        "gml_geometries" "POINT"
        "wfs_enable_request" "*"

        "wms_timeextent" "2006/2014/P1M"
        "wms_timeitem" "timestamp"
    END
END

LAYER
    NAME "osm_scale"
    TYPE POINT
    STATUS ON
    TEMPLATE fooOnlyForWMSGetFeatureInfo # For GetFeatureInfo
    DATA "osm_switzerland/points"
    PROJECTION
      "init=epsg:4326"
    END

    MINSCALEDENOM 15000
    MAXSCALEDENOM 40000

    CLASS
        NAME "osm_scale"
        STYLE
            SYMBOL "circle"
            SIZE 6
            WIDTH 1
            OUTLINECOLOR 30 0 0
            COLOR 230 0 0
        END
    END

    METADATA
        "wms_title" "OSM Scale"

        "gml_include_items" "all"
        "gml_types" "auto"
        "gml_featureid" "osm_id"
        "gml_POINT_type" "point"
        "gml_geometries" "POINT"
        "wfs_enable_request" "*"
    END
END