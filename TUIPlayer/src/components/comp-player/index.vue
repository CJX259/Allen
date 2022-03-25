<!--
 * @Description: PC 端 player 组件
 * @Date: 2021-10-31 16:33:32
 * @LastEditTime: 2022-01-26 15:35:37
-->
<template lang="pug">
div#player-rtc-container.player-rtc-container
  //- 流播放区域
  comp-stream-player.stream-player(ref="streamPlayer")
  //- 操作控制区域
  comp-stream-control.stream-control
</template>

<script>
import compStreamPlayer from './stream-player';
import compStreamControl from './stream-control';
export default {
  name: 'compPlayer',
  components: {
    compStreamPlayer,
    compStreamControl,
  },
  methods: {
    handleExit() {
      this.$refs.streamPlayer.handleExit();
    },
  },
};
</script>

<style lang="stylus" scoped>
.player-rtc-container
  width 100%
  height 100%
  position relative
  overflow hidden
  .stream-player
    width 100%
    height 100%
    overflow hidden
  .stream-control
    width 100%
    height 100%
    position absolute
    top 0
</style>
