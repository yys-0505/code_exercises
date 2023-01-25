<template>
  <div class="layout">
    <h2>布局</h2>
    <x-row tag='div' :gutter="20" justify="end">
      <x-col tag='span' :span="6">
        <div style="background: red;">1</div>
      </x-col>
      <x-col tag='span' :span="6">
        <div style="background: blue;">2</div>
      </x-col>
      <x-col tag='span' :span="6">
        <div style="background: pink;">3</div>
      </x-col>
    </x-row>
  </div>
</template>
