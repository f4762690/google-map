/**
 * 自定义地图标注
 */
import Vue from 'vue'

export default function getRoundOverlay(latlng, map, $el){

  function RoundOverlay(latlng,  map, $el) {

    if($el instanceof Vue){
      this.el = $el
      this.div = $el.$mount().$el
    }else{
      this.div = $el
    }
    this.position = latlng
    this.map_ = map
    this.setMap(map)
  }

  RoundOverlay.prototype = Object.create(google.maps.OverlayView.prototype)

  RoundOverlay.prototype.onAdd = function(){
    this.getPanes().floatPane.appendChild(this.div)
  }

  RoundOverlay.prototype.onRemove = function() {
    if (this.div.parentElement) {
      this.div.parentElement.removeChild(this.div)
    }
  }

  RoundOverlay.prototype.setPosition = function(latlng){
    this.position = latlng
    this.draw()
  }

  RoundOverlay.prototype.draw = function() {

    let divPosition = this.getProjection().fromLatLngToDivPixel(this.position)
    // Hide the popup when it is far out of view.
    let display =
      Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000 ?
        'block' :
        'none'
    if (display === 'block') {
      this.div.style.left = divPosition.x - this.div.offsetWidth/2 + 'px'
      this.div.style.top = divPosition.y - this.div.offsetHeight/2 + 'px'
    }
    if (this.div.style.display !== display) {
      this.div.style.display = display
    }
  }

  RoundOverlay.prototype.stopEventPropagation = function() {
    var anchor = this.div
    anchor.style.cursor = 'auto'

      ['click', 'dblclick', 'contextmenu', 'wheel', 'mousedown', 'touchstart','pointerdown'].forEach(function(event) {
      anchor.addEventListener(event, function(e) {
        e.stopPropagation()
      })
    })
  }


  return new RoundOverlay(latlng, map, $el)
}
