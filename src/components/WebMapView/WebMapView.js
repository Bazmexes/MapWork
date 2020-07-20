import React from 'react';
import { loadModules } from 'esri-loader';
import './webmapview.css'

export class WebMapView extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(['esri/Map', 'esri/views/MapView', "esri/widgets/Search"], { css: true })
    .then(([ArcGISMap, MapView, Search]) => {
      const map = new ArcGISMap({
        basemap: 'topo-vector'
      });

      this.view = new MapView({
        container: this.mapRef.current,
        map: map,
        center: [-118, 34],
        zoom: 8
      });
      var search = new Search({view: this.view})
      this.view.ui.add(search, 'top-right')

      const showPopup = (address, pt)=>{
        this.view.popup.open({
          title: +Math.round(pt.longitude * 100000) / 100000 +
          "," +
          Math.round(pt.latitude * 100000) / 100000,
          content: address,
          location: pt
        })
      }

      this.view.on("click", function (evt) {
        search.clear();
        if (search.activeSource) {
          var geocoder = search.activeSource.locator; // World geocode service
          var params = {
            location: evt.mapPoint
          };
          geocoder.locationToAddress(params).then(
            function (response) {
              // Show the address found
              var address = response.address;
              showPopup(address, evt.mapPoint);
            },
            function (err) {
              // Show no address found
              showPopup("No address found.", evt.mapPoint);
            }
          );
        }
      })

      
    });
  }

  componentWillUnmount() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
  }


  render() {

    return (
      <div className="webmap" ref={this.mapRef} />
    );
  }
}

