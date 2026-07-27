import { createApp } from 'vue'
import App from './App.vue'
import ComparisonBlockHeader from './components/ComparisonBlockHeader.vue'
import { sortableHeader } from './directives/sortableHeader.js'

createApp(App)
  .component('ComparisonBlockHeader', ComparisonBlockHeader)
  .directive('sortable-header', sortableHeader)
  .mount('#app')
