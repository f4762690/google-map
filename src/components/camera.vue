<template>
    <div class="camera">
        <svg v-if="!$parent.moveing"
         xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         width="65px" height="65px">
        <path fill-rule="evenodd"  opacity="0.502" fill="rgb(67, 133, 245)"
         d="M48.000,48.000 L-0.000,48.000 C-0.000,21.490 21.490,-0.000 48.000,-0.000 L48.000,48.000 Z"/>
        <path fill-rule="evenodd"  stroke="rgb(111, 136, 182)" stroke-width="1px" stroke-linecap="butt" stroke-linejoin="miter" fill="rgb(239, 239, 239)"
         d="M51.500,39.000 C58.404,39.000 64.000,44.596 64.000,51.500 C64.000,58.404 58.404,64.000 51.500,64.000 C44.596,64.000 39.000,58.404 39.000,51.500 C39.000,44.596 44.596,39.000 51.500,39.000 Z"/>
        <path fill-rule="evenodd"  fill="rgb(31, 110, 255)"
         d="M44.230,44.158 C47.459,41.309 51.317,40.406 52.847,42.140 C54.377,43.874 52.999,47.590 49.770,50.438 C46.541,53.287 42.683,54.191 41.153,52.457 C39.623,50.722 41.001,47.007 44.230,44.158 Z"/>
        <path fill-rule="evenodd"  opacity="0.702" fill="rgb(255, 255, 255)"
         d="M48.858,44.721 C49.606,44.015 50.501,43.791 50.856,44.221 C51.211,44.651 50.891,45.573 50.142,46.279 C49.394,46.986 48.499,47.210 48.144,46.780 C47.789,46.350 48.109,45.428 48.858,44.721 Z"/>
        </svg>

        <svg v-if="$parent.moveing"
         xmlns="http://www.w3.org/2000/svg"
         xmlns:xlink="http://www.w3.org/1999/xlink"
         width="65px" height="65px">
        <path fill-rule="evenodd"  opacity="0.502" fill="rgb(255, 0, 0)"
         d="M48.000,48.000 L-0.000,48.000 C-0.000,21.490 21.490,-0.000 48.000,-0.000 L48.000,48.000 Z"/>
        <path fill-rule="evenodd"  stroke="rgb(111, 136, 182)" stroke-width="1px" stroke-linecap="butt" stroke-linejoin="miter" fill="rgb(239, 239, 239)"
         d="M51.500,39.000 C58.404,39.000 64.000,44.596 64.000,51.500 C64.000,58.404 58.404,64.000 51.500,64.000 C44.596,64.000 39.000,58.404 39.000,51.500 C39.000,44.596 44.596,39.000 51.500,39.000 Z"/>
        <path fill-rule="evenodd"  fill="rgb(31, 110, 255)"
         d="M44.230,44.158 C47.459,41.309 51.317,40.406 52.847,42.140 C54.377,43.874 52.999,47.590 49.770,50.438 C46.541,53.287 42.683,54.191 41.153,52.457 C39.623,50.722 41.001,47.007 44.230,44.158 Z"/>
        <path fill-rule="evenodd"  opacity="0.702" fill="rgb(255, 255, 255)"
         d="M48.858,44.721 C49.606,44.015 50.501,43.791 50.856,44.221 C51.211,44.651 50.891,45.573 50.142,46.279 C49.394,46.986 48.499,47.210 48.144,46.780 C47.789,46.350 48.109,45.428 48.858,44.721 Z"/>
        </svg>
    </div>
</template>

<script>
export default {
    name:'camera'
}
</script>

<style scoped>
.camera { width:120px; height:120px; cursor: move; overflow:hidden; background:rgba(255,255,255,0.8); border:1px solid rgba(31,110,255,0.5); border-radius: 50%; padding:8px; box-sizing: border-box;}
</style>