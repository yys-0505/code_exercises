<template>
  <div class="app">
    <div>header</div>
    <div class="content">
      <div class="list">
        <div>button</div>
      </div>
      <div class="content-show">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .app {
    .content {
      display: flex;
      .list {
        width: 20%;
        margin-right: 20px;
      }
      .content-show {
        flex: 1;
      }
    }
  }
</style>