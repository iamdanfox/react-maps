"use strict";

var __in_node = (typeof exports !== 'undefined' && this.exports !== exports);

if( __in_node ) {
  var React = require('react');
}

var Map = React.createClass({

  // initialize local variables
  getInitialState: function() {
    return {
      map : null,
      lines: {},
      markers : []
    };
  },

  // set some default values
  getDefaultProps: function() {
    return {
      latitude: 0,
      longitude: 0,
      zoom: 4,
      width: 500,
      height: 500,
      points: [],
      lines:{},
      gmaps_api_key: '',
      gmaps_sensor: false
    }
  },

  // `lines` :: lineName -> {points,strokeColor, strokeWeight ...}
  updatePolylines : function(newLines) {
    for (var name in newLines){ // iterate through keys

      // update existing, or add new
      if (! this.state.lines[name] ) {
        this.state.lines[name] = new google.maps.Polyline(newLines[name])
      }
      this.state.lines[name].setMap(this.state.map)
      this.state.lines[name].setOptions(newLines[name])

      // compute `path` field
      var path = newLines[name].points.map(function(p){
        return new google.maps.LatLng(p.latitude, p.longitude);
      })
      this.state.lines[name].setPath(path)
    }
    // TODO: can this remove paths??
  },

  // update geo-encoded markers
  updateMarkers : function(points) {

    var markers = this.state.markers;
    var map = this.state.map;

    // remove everything
    markers.forEach( function(marker) {
      marker.setMap(null);
    } );

    this.state.markers = [];

    // add new markers
    points.forEach( (function( point ) {

      var location = new google.maps.LatLng( point.latitude , point.longitude );

      var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: point.label
      });

      markers.push( marker );

    }) );

    this.setState( { markers : markers });
  },

  updateZoom: function (newZoom) {
    this.state.map.setZoom(newZoom)
  },

  updateCenter: function(newLat, newLon){
    var newCenter = new google.maps.LatLng(newLat, newLon)
    this.state.map.setCenter(newCenter)
  },

  render : function() {

    var style = {
      width: this.props.width,
      height: this.props.height
    }

    return (
      React.DOM.div({style:style})
    );
  },

  componentDidMount : function() {

    window.mapLoaded = (function() {

      var mapOptions = {
        zoom: this.props.zoom,
        center: new google.maps.LatLng( this.props.latitude , this.props.longitude ),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      var map = new google.maps.Map( this.getDOMNode(), mapOptions);

      this.setState( { map : map } );
      if( this.props.points ) this.updateMarkers(this.props.points);
      if( this.props.lines ) this.updatePolylines(this.props.lines);

    }).bind(this);

    var s =document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + this.props.gmaps_api_key + '&sensor=' + this.props.gmaps_sensor + '&callback=mapLoaded';
    document.head.appendChild( s );

  },

  // update markers if needed
  componentWillReceiveProps : function(props) {
    if( props.zoom ) this.updateZoom(props.zoom)
    if( props.points ) this.updateMarkers(props.points);
    if( props.lines ) this.updatePolylines(props.lines);
    if( props.latitude || props.longitude) this.updateCenter(props.latitude, props.longitude)
  }

});

if( __in_node ) {
  module.exports = Map;
}
