<template>
  <div>
    <x-button type="primary">primary</x-button>
    <x-button type="success">success</x-button>
    <x-button type="danger">danger</x-button>
    <x-button type="primary" disabled>disabled</x-button>
    <x-button type="primary" round>round</x-button>
    <x-button type="primary" icon="x-icon-ico_med_service">icon</x-button>
    <br />
    <x-button-group>
      <x-button type="primary" icon="x-icon-ico_med_service">icon</x-button>
      <x-button type="primary">
        icon
        <i class="x-icon-ico_med_service"></i>
      </x-button>
    </x-button-group>

    <x-icon name="ico_opt_circle_add"></x-icon>
  </div>
</template>